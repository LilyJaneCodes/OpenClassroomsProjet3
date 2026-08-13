// Etape 5.2 : Page de connexion : Elaborez l'authentification de l'utilisateur

// Ecouter le submit du formulaire
const form = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", function(event) {
    event.preventDefault(); // Empêche le rechargement de la page

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Envoyer la requête POST/login
    fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            email: email,
            password: password
        })
    })

    // Récupérer la réponse
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            window.location.href = "index.html";
        } else {
            errorMessage.textContent = "Erreur : email ou mot de passe incorrect.";
        }
    })
    .catch(error => {
        console.error("Erreur :", error);
        errorMessage.textContent = "Une erreur est survenue.";
    });
});