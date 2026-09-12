//Entra-Anwendung Konfigurieren
const msalConfig = {
    auth: {
        clientId: "4fa3c2d0-7cfc-44f8-b3ef-98e62b50a762", //Entra-Anwendungs-ID
        authority: "https://login.microsoftonline.com/a5c0f00c-1e40-41ef-ab28-b6412a667908", //Entra-Tenant, bei dem AUthentifizierung stattfindet
        redirectUri: "http://localhost:3001", //Rückkehradresse nach Authentifizierung bei ENtra


    }
};
//MSAL initialisieren -> Browser ist public Client
const msalInstance = new msal.PublicClientApplication(msalConfig);

//Definition eigener API
//-> für OAuth relevant. Nur angemeldete Benutzer mit gültigem Access Token können auf die API zugreifen 
const apiScope =
    "api://4fa3c2d0-7cfc-44f8-b3ef-98e62b50a762/access_as_user"; //access_as_user ist die Berechtigung, die in der Entra-Anwendung definiert wurde. Sie muss mit der Berechtigung übereinstimmen, die in der FastAPI-Anwendung überprüft wird.  
const apiUrl = "http://localhost:8000/api/profile"; //FastAPI-Endpunkt, der aufgerufen werden soll


const loginButton = document.getElementById("login");
const statusElement = document.getElementById("status");

loginButton.addEventListener("click", async () => {
    try {
        loginButton.disabled = true;

        // 1. Benutzer bei Microsoft anmelden ->OIDC-Flow
        const response = await msalInstance.loginPopup({
            scopes: ["User.Read"], //Microsoft Graph-Berechtigung, um Benutzerinformationen abzurufen
        });

        console.log("Login erfolgreich:", response);

        statusElement.textContent =
            "Angemeldet als: " + response.account.username;

        // 2. Einholen des Access Token für eigene API
        const tokenResponse = await msalInstance.acquireTokenSilent({
            scopes: [apiScope],
            account: response.account
        });

        const token = tokenResponse.accessToken;
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log("Access Token Claims:", payload);
        console.log("Access Token für FastAPI:", tokenResponse.accessToken);


        const apiResponse = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${tokenResponse.accessToken}`
            }
        });

        const data = await apiResponse.json();

        console.log("Antwort von FastAPI:", data);

    } catch (error) {
        console.error("Fehler:", error);

        statusElement.textContent =
            "Fehler: " + error.message;

    } finally {
        loginButton.disabled = false;
    }
});