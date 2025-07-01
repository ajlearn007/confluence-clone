from fastapi import FastAPI
from app import models
from app.database import engine
from app.routes import router as auth_routes
from fastapi.middleware.cors import CORSMiddleware


models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(auth_routes)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React's dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
