console.log("APP.JS WIRD AUSGEFÜHRT");
//Configuration for MSAL.js
const msalConfig = {
    auth: {
        clientId: "4fa3c2d0-7cfc-44f8-b3ef-98e62b50a762", //Entra Application (Client) ID
        authority: "https://login.microsoftonline.com/a5c0f00c-1e40-41ef-ab28-b6412a667908", //Entra Tenant-ID
        redirectUri: "http://localhost:3001", // Redirect adress for the frontend application after successful login. This must match the redirect URI configured in the Entra application.


    }
};
//initialize MSAL.js instance
const msalInstance = new msal.PublicClientApplication(msalConfig);

//Definition of the API scope and URL
//->  relevant for Oauth. Only the scopes defined in the Entra application can be used. The scope must match the one that is checked in the FastAPI application.
const apiScope =
    "api://4fa3c2d0-7cfc-44f8-b3ef-98e62b50a762/access_as_user"; //access_as_user ist die Berechtigung, die in der Entra-Anwendung definiert wurde. Sie muss mit der Berechtigung übereinstimmen, die in der FastAPI-Anwendung überprüft wird.  
const apiUrl = "http://localhost:8000/api/profile"; //FastAPI-Endpoint for native resource server access. This endpoint is protected by the Entra application and by the FastAPI application and requires a valid access token to access user data.

const loginButton = document.getElementById("login");
const statusElement = document.getElementById("status");
let experimentEnabled = false;
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//Authentication - Login with Microsoft
loginButton.addEventListener("click", async () => {
    try {
        loginButton.disabled = true;
        //- - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // 1. Sign in User with Microsoft ->OIDC-Flow and authorize to read user data from Microsoft Graph
        //- - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        const response = await msalInstance.loginPopup({
            scopes: ["User.Read"],  // User.Read is a Microsoft Graph delegated permission.
            // It allows the SPA to request an access token for Microsoft Graph
            // and access the signed-in user's profile via the /me endpoint.
            // The scope must match the one that is checked in the FastAPI application.
        });

        console.log("Login erfolgreich:", response);
        markSuccess("authCard");

        //Display user Information
        statusElement.textContent =
            "Angemeldet als: " + response.account.username;

        await delay(1000);

        // 2. Request an Microsoft Graph
        const graphTokenResponse = await msalInstance.acquireTokenSilent({
            scopes: ["User.Read"],
            account: response.account
        });

        const graphResponse = await fetch(
            "https://graph.microsoft.com/v1.0/me",
            {
                headers: {
                    Authorization: `Bearer ${graphTokenResponse.accessToken}`
                }
            }
        );

        const graphData = await graphResponse.json();

        console.log("Microsoft Graph:", graphData);

        document.getElementById("graphName").textContent =
            "Name: " + graphData.displayName;

        document.getElementById("graphUsername").textContent =
            "Benutzername: " + graphData.userPrincipalName;

        document.getElementById("graphEmail").textContent =
            "E-Mail: " +
            (graphData.mail || "Keine E-Mail-Adresse vorhanden");

        if (graphResponse.ok && graphData) {
            markSuccess("graphCard");
        }



        await delay(1000);



        //- - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // 3. Get Access Token for FastAPI API
        //- - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        const tokenResponse = await msalInstance.acquireTokenSilent({
            scopes: [apiScope],
            account: response.account
        });
        //- - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // Display Access Token Claims and Access Token for FastAPI
        // tokenResponse.accessToken contains the JWT token that can be used to access the FastAPI API.
        //  The token is a JSON Web Token (JWT) that contains claims about the user and the application. 
        // The claims can be decoded to get information about the user and the application.
        //- - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        const token = tokenResponse.accessToken;
        // Decode the JWT token to get the claims
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log("Access Token Claims:", payload);
        console.log("Access Token für FastAPI:", tokenResponse.accessToken);

        //
        console.log("Sende Token an FastAPI");
        console.log("Token vorhanden:", !!tokenResponse.accessToken);
        const apiResponse = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${tokenResponse.accessToken}`
            }
        });

        if (apiResponse.status === 200) {

            // FastAPI hat den Access Token akzeptiert.
            // Damit war die serverseitige Tokenprüfung erfolgreich.
            markSuccess("securityCard");

            await delay(1000);
            if (!experimentEnabled) {
                experimentEnabled = true;
                console.log("Experiment gestartet");
                // Resource is now availible: the user test lab
                window.open(
                    "experiment.html",
                    "SecurityExperiment",
                    "width=1200,height=800"
                );
            }


            const data = await apiResponse.json();

            console.log("Antwort von FastAPI:", data);

            // Profilinformationen anzeigen
            document.getElementById("result").textContent =
                JSON.stringify(data, null, 2);

            // FastAPI-Card erfolgreich
            markSuccess("fastAPICard");




        } else {

            console.log(
                "FastAPI hat den Access Token abgelehnt:",
                apiResponse.status
            );
        }
    }
    catch (error) {
        console.error("Fehler:", error);
        statusElement.textContent = "Fehler: " + error.message;
    }
    finally { loginButton.disabled = false; }
});

// Function to flash the success card
function markSuccess(cardId) {
    const card = document.getElementById(cardId);
    card.classList.remove("success");

    void card.offsetWidth;

    card.classList.add("success");
}