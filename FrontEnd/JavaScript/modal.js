// Etape 6 : Ajoutez la modale (la structure)

// Fonction qui crée la modale
function createModal() {

    // Vérifier si la modale existe déjà
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) return; // On ne recrée pas une deuxième modale

    // 1. Créer l'overlay (fond sombre)
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    // 2. Créer le conteneur de la modale (la boîte blanche)
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal-container');

    // 3. Ajout du contenu HTML
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

                <button type="submit" class="validate-btn" disabled>Valider</button>

            </form>
        </div>

        <div class="modal-footer">
            <button class="add-photo-btn">Ajouter une photo</button>
        </div>
    `;

    // 4. Ajouter le conteneur dans l'overlay
    overlay.appendChild(modalContainer);

    // 5. Ajouter l'overlay au body
    document.body.appendChild(overlay);

    loadModalGallery(modalContainer);

    /// LISTENERS POUR FERMER ///

    // 6. Fermer en cliquant sur la croix
    const closeBtn = modalContainer.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        overlay.remove();
    });

    // 7. Fermer en cliquant en dehors de la modale
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });

    // 8. Ajout photo

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
    });

    // 9. Flèche retour

    btnBack.addEventListener('click', () => {
        formZone.classList.add('hidden');
        galleryZone.classList.remove('hidden');
        footer.classList.remove('hidden'); // réaffiche le bouton "Ajouter une photo"
        modalTitle.textContent = "Galerie photo"; // Retour au titre original
        btnBack.classList.add('hidden'); // cacher la flèche retour
    });

    // 10. --- ACCESSIBILITÉ : Tab + Entrée pour naviguer --- //
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
}

// Fonction pour charger les travaux

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

// Etape 7 : Supprimez des travaux existants

async function deleteWork(id, figure) {

    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (response.ok) {
        console.log("Suppression réussie !");

        // Supprimer dans la modale
        figure.remove();

        // Supprimer dans la galerie principale
        const mainFigure = document.querySelector(`figure[data-id="${id}"]`);
        if (mainFigure) {
            mainFigure.remove();
        }
    } else {
        console.error("Échec de la suppresssion :", response.status);
    }
}