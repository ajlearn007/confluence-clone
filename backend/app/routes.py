from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import SessionLocal
from app import models, schemas, auth
from jose import JWTError, jwt
from app.auth import SECRET_KEY, ALGORITHM
from typing import List
import re  # for @mention parsing

router = APIRouter()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Register
@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = auth.hash_password(user.password)
    new_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = auth.create_access_token({"sub": new_user.email})
    return {"access_token": token, "token_type": "bearer"}

# Login
@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = auth.create_access_token({"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}

# Get current user from token
def get_current_user(request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Create Document + Auto-share if @mentions
@router.post("/documents", response_model=schemas.DocumentOut)
def create_doc(
    doc: schemas.DocumentCreate, 
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user)
):
    new_doc = models.Document(
        title=doc.title,
        content=doc.content,
        author_id=current_user.id,
        visibility=doc.visibility
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # Auto-share with @mentioned users
    mentioned_usernames = set(re.findall(r"@(\w+)", doc.content))
    for username in mentioned_usernames:
        mentioned_user = db.query(models.User).filter(models.User.username == username).first()
        if mentioned_user and mentioned_user.id != current_user.id:
            already_shared = db.query(models.DocumentShare).filter_by(
                document_id=new_doc.id,
                user_id=mentioned_user.id
            ).first()
            if not already_shared:
                db.add(models.DocumentShare(
                    document_id=new_doc.id,
                    user_id=mentioned_user.id,
                    can_edit=False
                ))

    db.commit()
    return new_doc

# Get all accessible documents (own + shared + public)
@router.get("/documents", response_model=List[schemas.DocumentOut])
def get_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    owned = db.query(models.Document).filter(models.Document.author_id == current_user.id)
    shared = db.query(models.Document).join(models.DocumentShare).filter(
        models.DocumentShare.user_id == current_user.id
    )
    public = db.query(models.Document).filter(models.Document.visibility == "public")

    return owned.union_all(shared).union_all(public).order_by(models.Document.created_at.desc()).distinct().all()

# View a public document without auth
@router.get("/documents/public/{doc_id}", response_model=schemas.DocumentOut)
def view_public_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.Document).filter(
        models.Document.id == doc_id,
        models.Document.visibility == "public"
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Public document not found")
    return doc

# Search own + shared + public docs (partial, case-insensitive)
@router.get("/documents/search", response_model=List[schemas.DocumentOut])
def search_documents(
    q: str = "",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query_string = f"%{q}%"

    owned = db.query(models.Document).filter(
        models.Document.author_id == current_user.id,
        or_(
            models.Document.title.ilike(query_string),
            models.Document.content.ilike(query_string)
        )
    )

    shared = db.query(models.Document).join(models.DocumentShare).filter(
        models.DocumentShare.user_id == current_user.id,
        or_(
            models.Document.title.ilike(query_string),
            models.Document.content.ilike(query_string)
        )
    )

    public = db.query(models.Document).filter(
        models.Document.visibility == "public",
        or_(
            models.Document.title.ilike(query_string),
            models.Document.content.ilike(query_string)
        )
    )

    return owned.union_all(shared).union_all(public).order_by(models.Document.created_at.desc()).distinct().all()

# Update document (only author can)
@router.put("/documents/{doc_id}", response_model=schemas.DocumentOut)
def update_doc(
    doc_id: int,
    doc: schemas.DocumentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if db_doc.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this document")

    db_doc.title = doc.title
    db_doc.content = doc.content
    db_doc.visibility = doc.visibility
    db.commit()
    db.refresh(db_doc)
    return db_doc

# Delete document (only author can)
@router.delete("/documents/{doc_id}")
def delete_doc(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if db_doc.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this document")

    db.delete(db_doc)
    db.commit()
    return {"detail": "Document deleted"}
