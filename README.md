---
page_type: sample

languages:
- python
- javascript
- html
- css

products:
- microsoft-graph
- microsoft-entra-id
- microsoft-identity-platform

description: "A Single-Page Application demonstrating authentication with Microsoft Entra ID, the use of ID and access tokens with OAuth 2.0 and OpenID Connect, and access token validation in a Python FastAPI backend"

urlFragment: "entra-security-lab"
---

# Entra Security Lab

A small Single-Page Application demonstrating authentication and token-based authorization using Microsoft Entra ID. The project consists of a JavaScript frontend and a Python FastAPI backend and focuses on understanding the use and validation of ID and access tokens.

## Note
This project is still in progress

## Contents

| File/folder | Description |
|---|---|
| `frontend/` | Contains the frontend source files |
| `frontend/index.html` | User interface of the application |
| `frontend/app.js` | Frontend logic, including authentication and token handling |
| `main.py` | Python FastAPI backend and API endpoints |
| `requirements.txt` | Python dependencies required by the backend |
| `.gitignore` | Files and folders excluded from version control |
| `README.md` | Project documentation |

## Prerequisites

Before running the application, make sure the following are installed:

1. Python 3.12
2. Google Chrome Web Browser

The frontend uses Python's built-in `http.server`, so no separate frontend web server needs to be installed.

## Microsoft Entra ID Configuration

The application uses a Microsoft Entra ID app registration configured as a Single-Page Application (SPA).

To run the application with your own Microsoft Entra ID account:

1. Create an App Registration in Microsoft Entra ID.
2. Configure the application as a **Single-Page Application (SPA)**.
3. Add the redirect URI:

   `http://localhost:3001/`

4. Copy the generated **Application (client) ID** and **Tenant ID**.
5. Open `frontend/app.js` and replace the corresponding configuration values with your own values.

No client secret is required because the SPA is a public client.

## Setup

Clone the repository and navigate to the project directory:

```bash
git clone <repository-url>
cd entra-security-lab
```

Create and activate Python virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the required Python Packages
```bash
pip install - requirements.txt
```

From the project root:
```bash
python3 -m http.server 3001
```

Running the application start the frontend. The frontend is then availible at:

```bash
http://localhost:3001/
```

Next start the FastAPI backend


```bash
source .venv/bin/activate
```

Then start the backend
```bash
uvicorn main:app --reload --port 8000
```

The API is then availible at:

```bash
http://localhost:8000/
```

## Key Concepts

* This project demonstrates the following concepts:
* Authentication with Microsoft Entra ID
* OAuth 2.0 and OpenID Connect
* ID tokens and access tokens
* Using MSAL.js for authentication and token acquisition
* Calling the Microsoft Graph API with an access token
* Sending an access token from the SPA to a backend
* Access token validation in a Python FastAPI backend
* Protecting API endpoints using token-based authentication

The SPA uses MSAL.js, which handles the Authorization Code Flow with PKCE.