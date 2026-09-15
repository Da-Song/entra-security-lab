
const tokenCards = document.querySelectorAll(".token-card");
const testResult = document.getElementById("testResult");

const testTokens = {

    token1: {
        issuer: "https://sts.windows.net/a5c0f00c-1e40-41ef-ab28-b6412a667908/",
        audience: "https://api.open-meteo.com",
        scope: "access_as_user"
    },

    token2: {
        issuer: "https://sts.windows.net/a5c0f00c-1e40-41ef-ab28-b6412a667908/",
        audience: "api://4fa3c2d0-7cfc-44f8-b3ef-98e62b50a762",
        scope: "user.read"
    },

    token3: {
        issuer: "https://sts.applple.net/a5c0f00c-1e40-41ef-ab28-b6412a667908/",
        audience: "api://4fa3c2d0-7cfc-44f8-b3ef-98e62b50a762",
        scope: "access_as_user"
    },

    token4: {
        issuer: "https://sts.windows.net/a5c0f00c-1e40-41ef-ab28-b6412a667908/",
        audience: "api://4fa3c2d0-7cfc-44f8-b3ef-98e62b50a762",
        scope: "access_as_user"
    }

};

tokenCards.forEach(card => {

    card.addEventListener("click", async () => {

        // ausgewählte Karte markieren
        tokenCards.forEach(c => {
            c.classList.remove("selected");
        });

        card.classList.add("selected");

        // Testfall anhand der ID bestimmen
        const tokenData = testTokens[card.id];

        console.log("Ausgewähltes Token:", card.id);
        console.log("Claims:", tokenData);

        testResult.textContent = "Security Check läuft ...";

        try {

            const response = await fetch(
                "http://localhost:8000/api/security-test",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(tokenData)
                }
            );

            const result = await response.json();

            console.log("Security Check Ergebnis:", result);

            testResult.textContent =
                JSON.stringify(result, null, 2);

        } catch (error) {

            console.error("Security Check Fehler:", error);

            testResult.textContent =
                "Fehler beim Security Check: " + error.message;
        }

    });

});