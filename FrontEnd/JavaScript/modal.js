//** ETAPE 6 : AJOUTEZ LA MODALE (LA STRUCTURE) **//

function createModal() {

    // Empêcher la création d'une deuxième modale
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) return;

    // Créer l'overlay (fond sombre)
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    // Créer le conteneur de la modale (la boîte blanche)
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal-container');

    // Ajout du contenu HTML
    modalContainer.innerHTML = `
        <div class ="modal-header">
            <span class="btn-back hidden"><i class="fa-solid fa-arrow-left"></i></span>
            <h3>Galerie photo</h3>
            <span class="modal-close">&times;</span>
        </div>

        <div class="modal-gallery">
            <!-- Les travaux seront injectés ici -->
        </div>

        <div class ="modal-form hidden">
            <form id="add-photo-form">

                <div class="upload-zone">
                    <i class="fa-regular fa-image"></i>
                    <label for="photo-input" class="upload-btn">+ Ajouter photo</label>
                    <input type="file" id="photo-input" accept="image/png, image/jpeg">
                    <p class="upload-info">jpg, png : 4mo max</p>
                    <img id="preview-image" class="hidden" />
                </div>

                <label for="title-input">Titre</label>
                <input type="text" id="title-input">

                <label for="category-select">Catégorie</label>
                <select id="category-select"></select>

                <div class="form-separator"></div>

                <p id="form-error" class="error-message hidden">Veuillez remplir tous les champs et ajouter une image valide.</p>
                
                <button type="submit" class="validate-btn" disabled>Valider</button>
            </form>
        </div>

        <div class="modal-footer">
            <button class="add-photo-btn">Ajouter une photo</button>
        </div>
    `;

    // Ajouter le conteneur dans l'overlay
    overlay.appendChild(modalContainer);

    // Ajouter l'overlay au body
    document.body.appendChild(overlay);

    loadModalGallery(modalContainer);

    // ETAPE 6 : FERMETURE DE LA MODALE

    // Fermer en cliquant sur la croix
    const closeBtn = modalContainer.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        overlay.remove();
    });

    // Fermer en cliquant en dehors de la modale
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });

    // ETAPE 6 : NAVIGATION GALERIE - FORMULAIRE

    // Ajout photo
    const btnAddPhoto = modalContainer.querySelector('.add-photo-btn');
    const galleryZone = modalContainer.querySelector('.modal-gallery');
    const formZone = modalContainer.querySelector('.modal-form');
    const modalTitle = modalContainer.querySelector('.modal-header h3');
    const footer = modalContainer.querySelector('.modal-footer');
    const btnBack = modalContainer.querySelector('.btn-back');

    btnAddPhoto.addEventListener('click', () => {
        galleryZone.classList.add('hidden');
        formZone.classList.remove('hidden');
        footer.classList.add('hidden'); // cacher le bouton "Ajouter une photo"
        modalTitle.textContent = "Ajout photo"; // Changement du titre
        btnBack.classList.remove('hidden'); // affiche la flèche retour
        // ETAPE 8.1 : CHARGER LES CATEGORIES DANS LE SELECT
        loadCategories();
        checkFormValidity();
    });

    // Flèche retour
    btnBack.addEventListener('click', () => {
        formZone.classList.add('hidden');
        galleryZone.classList.remove('hidden');
        footer.classList.remove('hidden'); // réaffiche le bouton "Ajouter une photo"
        modalTitle.textContent = "Galerie photo"; // Retour au titre original
        btnBack.classList.add('hidden'); // cacher la flèche retour
    });

    // ETAPE 6 : ACCESSIBILITE CLAVIER

    document.addEventListener("keydown", (e) => {

        // Si la modale n'est pas ouverte, on ne fait rien
        if (!document.body.contains(overlay)) return;

        // 1. Échap → fermer la modale
        if (e.key === "Escape") {
            overlay.remove();
        }

        // 2. Flèche gauche → retour galerie
        if (e.key === "ArrowLeft") {
            if (!formZone.classList.contains("hidden")) {
                formZone.classList.add("hidden");
                galleryZone.classList.remove("hidden");
                footer.classList.remove("hidden");
                modalTitle.textContent = "Galerie photo";
                btnBack.classList.add("hidden");
            }
        }

        // 3. Entrée → activer le bouton focusé
        if (e.key === "Enter") {

            // Si on est sur "Ajouter une photo"
            if (document.activeElement === btnAddPhoto) {
                galleryZone.classList.add('hidden');
                formZone.classList.remove('hidden');
                footer.classList.add('hidden');
                modalTitle.textContent = "Ajout photo";
                btnBack.classList.remove('hidden');
            }
        }
    });

    //** ETAPE 8.1 : ENVOI D'UN NOUVEAU PROJET A L'API VIA LE FORMULAIRE D'AJOUT **//

    // ETAPE 8.1 : PREVIEW IMAGE

    const photoInput = modalContainer.querySelector('#photo-input');
    const previewImage = modalContainer.querySelector('#preview-image');
    const uploadIcon = modalContainer.querySelector('.fa-image');
    const uploadLabel = modalContainer.querySelector('.upload-btn');
    const uploadInfo = modalContainer.querySelector('.upload-info');

    photoInput.addEventListener('change', () => {
        const file = photoInput.files[0];

        if (!file) {
            // Si l'utilisateur enlève l'image, on remet tout à zéro
            previewImage.classList.add('hidden');
            uploadIcon.classList.remove('hidden');
            uploadLabel.classList.remove('hidden');
            uploadInfo.classList.remove('hidden');
            return;
        }

        // Afficher la preview
        previewImage.src = URL.createObjectURL(file);
        previewImage.classList.remove('hidden');

        // Cacher les éléments d'upload
        uploadIcon.classList.add('hidden');
        uploadLabel.classList.add('hidden');
        uploadInfo.classList.add('hidden');
    });

    previewImage.addEventListener('click', () => {
        photoInput.click();
    });

    // ETAPE 8.1 - CHARGER LES CATEGORIES DANS LE SELECT

    const categorySelect = modalContainer.querySelector('#category-select');

    async function loadCategories() {
        try {
            const response = await fetch("http://localhost:5678/api/categories");

            if (!response.ok) {
                throw new Error(`Erreur lors du chargement des catégories`);
            }

            const categories = await response.json();

            // On vide le select
            categorySelect.innerHTML = "";

            // Option par défaut
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "Sélectionner une catégorie";
            categorySelect.appendChild(defaultOption);

            // On ajoute les catégories
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });

        } catch (error) {
            console.error("Erreur lors du chargement des catégories :", error);
        }
    }

    // ETAPE 8.1 - VERIFICATION DU FORMULAIRE

    const addPhotoForm = modalContainer.querySelector('#add-photo-form');
    const titleInput = modalContainer.querySelector('#title-input');
    const validateBtn = modalContainer.querySelector('.validate-btn');
    const formError = modalContainer.querySelector('#form-error');

    function checkFormValidity() {
        const file = photoInput.files[0];
        const title = titleInput.value.trim();
        const category = categorySelect.value;

        if (file && title !== "" && category !== "") {
            validateBtn.disabled = false;
            formError.classList.add('hidden');
            return true;
        } else {
            validateBtn.disabled = true;
            return false;
        }
    }

    photoInput.addEventListener('change', checkFormValidity);
    titleInput.addEventListener('input', checkFormValidity);
    categorySelect.addEventListener('change', checkFormValidity);

    addPhotoForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!checkFormValidity()) {
            formError.textContent = "Veuillez remplir tous les champs.";
            formError.classList.remove('hidden');
            return;
        }

        const file = photoInput.files[0];
        const title = titleInput.value.trim();
        const category = categorySelect.value;

        // ETAPE 8.1 - FORMDATA
        const formData = new FormData();
        formData.append("image", file);
        formData.append("title", title);
        formData.append("category", category);

        // Envoi API
        sendNewWork(formData);
    });

    // ETAPE 8.1 - FAIRE UN POST/works

    function sendNewWork(formData) {
        const token = localStorage.getItem("token");

        fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
                // fetch le gère automatiquement le Content-Type pour FormData
            },
            body: formData
        })

        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur lors de l'envoi du projet");
            }
            return response.json();
        })
        //** ETAPE 8.2 : AFFICHER DYNAMIQUEMENT LA NOUVELLE IMAGE DE LA MODALE **//
            .then(newWork => {
        // console.log("Projet ajouté :", newWork);
        alert ("Nouveau projet envoyé avec succès !")

        // Ajout dynamique dans la galerie principale
        addWorkToGallery(newWork);

        // Ajout dynamique dans la modale
        addWorkToModal(newWork);

        // Reset du formulaire
        addPhotoForm.reset();
        previewImage.classList.add("hidden");

        // Retour à la galerie de la modale
        const galleryZone = modalContainer.querySelector('.modal-gallery');
        const formZone = modalContainer.querySelector('.modal-form');
        const footer = modalContainer.querySelector('.modal-footer');
        const modalTitle = modalContainer.querySelector('.modal-header h3');
        const btnBack = modalContainer.querySelector('.btn-back');

        formZone.classList.add('hidden');
        galleryZone.classList.remove('hidden');
        footer.classList.remove('hidden');
        modalTitle.textContent = "Galerie photo";
        btnBack.classList.add('hidden');
    })

        .catch(error => {
            console.error("Erreur envoi projet :", error);
            formError.textContent = "Impossible d'envoyer le projet.";
            formError.classList.remove("hidden");
        });
    }
}

//** ETAPE 7 - SUPPRIMEZ DES TRAVAUX EXISTANTS **//

// Charger la galerie dans la modale
async function loadModalGallery(modalContainer) {
    const gallery = modalContainer.querySelector('.modal-gallery');
    gallery.innerHTML = ""; // On vide avant de remplir

    try {
        const response = await fetch("http://localhost:5678/api/works");
        const works = await response.json();

        works.forEach(work => {

            const figure = document.createElement('figure');
            figure.classList.add('modal-figure');

            const img = document.createElement('img');
            img.src = work.imageUrl;
            img.alt = work.title;

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-work-btn');
            deleteBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
            deleteBtn.dataset.id = work.id;

            deleteBtn.addEventListener("click", () => {
                deleteWork(work.id, figure);
            })

            figure.appendChild(img);
            figure.appendChild(deleteBtn);
            gallery.appendChild(figure);
        });

    }   catch (error) {
        console.error("Erreur lors du chargement des travaux :", error);
    }
}

// Suppression d'un travail
async function deleteWork(id, figure) {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (response.ok) {
        // console.log("Suppression réussie !");
        alert ("Suppression du projet réussie !");

        // Supprimer dans la modale
        figure.remove();

        // Supprimer dans la galerie principale
        const mainFigure = document.querySelector(`figure[data-id="${id}"]`);
        if (mainFigure) {
            mainFigure.remove();
        }
    } else {
        console.error("Échec de la suppression :", response.status);
    }
}

//** ETAPE 8.2 : AFFICHER DYNAMIQUEMENT LA NOUVELLE IMAGE DE LA MODALE **//

// 1. Créer un élément dans la galerie principale
function createWorkElement(work) {
    const figure = document.createElement("figure");
    figure.dataset.id = work.id;

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);

    return figure;
}

// Ajouter dans la galerie principale
function addWorkToGallery(work) {
    const gallery = document.querySelector(".gallery");
    const element = createWorkElement(work);
    gallery.appendChild(element);
}

// 2. Créer un élément dans la modale
function createModalWorkElement(work) {
    const figure = document.createElement("figure");
    figure.classList.add("modal-figure");
    figure.dataset.id = work.id;

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-work-btn");
    deleteBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;

    deleteBtn.addEventListener("click", () => {
        deleteWork(work.id, figure);
    });

    figure.appendChild(img);
    figure.appendChild(deleteBtn);

    return figure;
}

// Ajouter dans la galerie de la modale
function addWorkToModal(work) {
    const modalGallery = document.querySelector(".modal-gallery");
    const element = createModalWorkElement(work);
    modalGallery.appendChild(element);
}