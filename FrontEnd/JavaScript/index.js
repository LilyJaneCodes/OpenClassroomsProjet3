// Etape 2 : Créez la page de présentation des travaux à partir du HTML existant

async function getWorks() {
    const response = await fetch("http://localhost:5678/api/works");
    return await response.json();
}

function displayWorks(works) {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = ""; // On vide la gallerie avant d'ajouter les élements

    works.forEach(work => {
        const figure = document.createElement("figure");

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        const figcaption = document.createElement("figcaption");
        figcaption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
    });
}

let works = [];

getWorks().then(data => {
    works = data;
    displayWorks(works);
});

// Etape 3 : Ajoutez dynamiquement les filtres des travaux

async function getCategories() {
    const response = await fetch("http://localhost:5678/api/categories");
    return await response.json();
}

getCategories().then(categories => {

    const filtresContainer = document.querySelector(".filtres-container"); // Sélection du conteneur

    // Fonction pour gérer l'état actif
    function setActiveButton(button) {
        const allButtons = document.querySelectorAll(".filtre");
        allButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
    }

    // Bouton Tous
    const btnAll = document.createElement("button");
    btnAll.textContent = "Tous";
    btnAll.classList.add("filtre");

// Etape 4 : Rendez les filtres fonctionnels

    btnAll.addEventListener("click", () => {
        displayWorks(works);
        setActiveButton(btnAll);
    });

    filtresContainer.appendChild(btnAll);

    // Active par défaut
    setActiveButton(btnAll);

    // Boutons Catégories
    categories.forEach(category => {
        const btn = document.createElement("button");
        btn.textContent = category.name;
        btn.classList.add("filtre");

        btn.addEventListener("click", () => {
            const filtered = works.filter(work => work.categoryId === category.id);
            displayWorks(filtered);
            setActiveButton(btn);
        });

        filtresContainer.appendChild(btn);

    }); // <-- fin du forEach

}); // <-- fin du getCategories().then()

// Etape 5.3 : Page de connexion : Affichez la page d'accueil lors d'une connexion

const token = localStorage.getItem("token");

if (token) {
    // Mode admin activé
    document.body.classList.add("admin-mode");
    document.querySelector(".filtres-container").style.display = "none";

    // Remplacer "login" par "logout"
    const loginLink = document.querySelector("nav ul li:nth-child(3)");
    loginLink.textContent = "logout";
    loginLink.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.reload();
    });

    // Afficher le bandeau noir
    const adminBanner = document.createElement("div");
    adminBanner.classList.add("admin-banner");
    adminBanner.innerHTML = `
        <i class="fa-regular fa-pen-to-square"></i>
        <p>Mode édition</p>
    `;
    document.body.prepend(adminBanner);

    // Afficher le bouton "modifier"
    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");
    editButton.innerHTML = `
        <i class="fa-regular fa-pen-to-square"></i>
        <span>modifier</span>
    `;
    document.querySelector(".portfolio-title").appendChild(editButton);

    // Etape 6 : Ajoutez la modale (la structure)
    editButton.addEventListener("click", () => {
        createModal();
    });
}