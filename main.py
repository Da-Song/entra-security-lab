from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
import jwt
import requests # for requesting public keys from entra

app = FastAPI() 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"], #Kritik?
    allow_headers=["*"], #Kritik?
)
@app.get("/")

def home():
    return {"message": "Willkommen zur Fast.API-App!"}

@app.get("/api/profile")
def profile(authorization:str | None = Header(default=None)):
    print("Authorization:", authorization)
    return {
        "message": "FastAPI hat den Authorization-Header erhalten"
    }