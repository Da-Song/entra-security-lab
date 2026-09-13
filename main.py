from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import jwt
import requests # for requesting public keys from entra
from jwt import PyJWKClient
from pydantic import BaseModel


TENANT_ID = "a5c0f00c-1e40-41ef-ab28-b6412a667908"

ISSUER = "https://sts.windows.net/a5c0f00c-1e40-41ef-ab28-b6412a667908/"

JWKS_URL = "https://login.microsoftonline.com/a5c0f00c-1e40-41ef-ab28-b6412a667908/discovery/v2.0/keys"

API_AUDIENCE = "api://4fa3c2d0-7cfc-44f8-b3ef-98e62b50a762"

jwks_client = PyJWKClient(JWKS_URL)

app = FastAPI() 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"], #Risk?
    allow_headers=["*"], #Risk ?
)


def validate_access_token(token: str):

    signing_key = jwks_client.get_signing_key_from_jwt(token)

    claims = jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        audience=API_AUDIENCE,
        issuer=ISSUER,
    )

    return claims


class SecurityTestRequest(BaseModel):
    issuer: str
    audience: str
    scope: str


@app.post("/api/security-test")
def security_test(test: SecurityTestRequest):

    return {
        "received": True,
        "issuer": test.issuer,
        "audience": test.audience,
        "scope": test.scope
    }


@app.get("/")

def home():
    return {"message": "Willkommen zur Fast.API-App!"}

@app.get("/api/profile")
def profile(authorization: str | None = Header(default=None)):

    # 1. Check if the Authorization header is present
    if authorization is None:
        raise HTTPException(
            status_code=401,
            detail="Authorization Header fehlt"
        )

    # 2. Check if the Authorization header starts with "Bearer "
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Ungültiges Authorization-Format"
        )

    # 3. Take the token from the Authorization header
    token = authorization.split(" ", 1)[1]

    # 4. Validate the token and extract claims
    try:
        claims = validate_access_token(token)

    except Exception as e:
        print("TOKEN VALIDIERUNG FEHLER:", repr(e))

        raise HTTPException(
            status_code=401,
            detail="Ungültiges Access Token"
        )

    # 5. Prüfen, ob der erforderliche Scope vorhanden ist
    scopes = claims.get("scp", "").split()

    if "access_as_user" not in scopes:
        raise HTTPException(
            status_code=403,
            detail="Erforderlicher Scope fehlt"
        )

    # 6. Nur wenn alle Prüfungen erfolgreich waren:
    return {
        "message": "Access Token ist gültig",
        "user": claims.get("name"),
        "scope": claims.get("scp")
    }
    
    
#@app.post("/api/security-test")

 