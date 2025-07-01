from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models, schemas, auth
from jose import JWTError, jwt
from app.auth import SECRET_KEY, ALGORITHM
from typing import List

router = APIRouter()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Create Document
@router.post("/documents", response_model=schemas.DocumentOut)
def create_doc(
    doc: schemas.DocumentCreate, 
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user)
):
    new_doc = models.Document(
        title=doc.title,
        content=doc.content,
        author_id=current_user.id
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc

# Get current user's documents
@router.get("/documents", response_model=List[schemas.DocumentOut])
def get_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(models.Document)\
        .filter(models.Document.author_id == current_user.id)\
        .order_by(models.Document.created_at.desc())\
        .all()

# Update Document
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
    db.commit()
    db.refresh(db_doc)
    return db_doc

# Delete Document
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

@router.put("/documents/{doc_id}", response_model=schemas.DocumentOut)
def update_doc(
    doc_id: int,
    doc: schemas.DocumentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not db_doc or db_doc.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this document")

    db_doc.title = doc.title
    db_doc.content = doc.content
    db.commit()
    db.refresh(db_doc)
    return db_doc
