let cropper;
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("form");
    const name = document.getElementById("name");

    const fileInput = document.getElementById("catImage");
    const uploadArea = document.getElementById("uploadArea");
    const previewImage = document.getElementById("previewImage");
    const changeImageBtn = document.getElementById("changeImageBtn");
    const errorElement = uploadArea.parentElement.querySelector(".error-message");


    uploadArea.addEventListener("click", () => fileInput.click());
    changeImageBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", function (e) {

        const file = e.target.files[0];
        if (!file) return;

        errorElement.textContent = "";

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            errorElement.textContent = "Only JPG, PNG, WEBP images are allowed";
            fileInput.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            errorElement.textContent = "Image must be below 2MB";
            fileInput.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = function () {

            previewImage.src = reader.result;
            previewImage.classList.remove("hidden");
            uploadArea.classList.add("hidden");
            changeImageBtn.classList.remove("hidden");

            if (cropper) {
                cropper.destroy();
            }

            cropper = new Cropper(previewImage, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 1,
            });
        };

        reader.readAsDataURL(file);
    });

    form.addEventListener("submit", function (e) {

        e.preventDefault();
        clearErrors();

        let isValid = true;


        if (name.value.trim().length < 3) {
            showError(name, "Category name must be at least 3 characters");
            isValid = false;
        }


        if (
            form.action.includes("/admin/category") &&
            !form.action.includes("/edit") &&
            !fileInput.files.length
        ) {
            errorElement.textContent = "Please select an image";
            isValid = false;
        }

        if (!isValid) return;

        if (cropper && fileInput.files.length > 0) {

            cropper.getCroppedCanvas().toBlob((blob) => {

                const newFile = new File([blob], "cropped.jpg", {
                    type: "image/jpeg",
                });

                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(newFile);
                fileInput.files = dataTransfer.files;

                form.submit();

            }, "image/jpeg");

        } else {
            form.submit();
        }

    });
    function clearErrors() {
        document.querySelectorAll(".error-message").forEach(el => el.textContent = "");

        document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
    }

    function showError(input, message) {
        const errorElement = input.parentElement.querySelector(".error-message");
        errorElement.textContent = message;
        input.classList.add("input-error");
    }

    const toast = document.getElementById("toast");

    if (toast) {
        setTimeout(() => toast.classList.add("show"), 100);
        setTimeout(() => toast.classList.remove("show"), 3000);
    }

    document.querySelectorAll(".delete-btn").forEach(button => {

        button.addEventListener("click", function () {

            const categoryId = this.dataset.id;
            const currentStatus = this.dataset.status;

            const isActive = currentStatus === "Active";

            Swal.fire({
                title: "Are you sure?",
                text: isActive 
                    ? "This category will be set to Inactive!"
                    : "This category will be restored!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: isActive ? "#d33" : "#28a745",
                cancelButtonColor: "#3085d6",
                confirmButtonText: isActive 
                    ? "Yes, deactivate!"
                    : "Yes, restore!",
                reverseButtons: true
            }).then((result) => {

                if (result.isConfirmed) {

                    const form = document.createElement("form");
                    form.method = "POST";
                    form.action = `/admin/category/delete/${categoryId}`;

                    document.body.appendChild(form);
                    form.submit();
                }

            });

        });

    });

    const editButtons = document.querySelectorAll(".edit-btn");
    const statusSelect = document.querySelector("select[name='status']");


    editButtons.forEach(button => {

        button.addEventListener("click", function () {

            const id = this.dataset.id;
            const nameValue = this.dataset.name;
            const statusValue = this.dataset.status;
            const imageUrl = this.dataset.image;

            const offerInput = document.getElementById("offer")
            offerInput.value = this.dataset.offer || 0;  

            form.action = `/admin/category/edit/${id}`;
            name.value = nameValue;
            statusSelect.value = statusValue;

            previewImage.src = imageUrl;
            previewImage.classList.remove("hidden");
            uploadArea.classList.add("hidden");
            changeImageBtn.classList.remove("hidden");

            if (cropper) {
                cropper.destroy();
            }

            cropper = new Cropper(previewImage, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 1,
            });

            modalTitle.innerText = "Edit Category";

            openModal("categoryModal");
        });

    });

    

});

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}
function closeModal(modalId) {
document.getElementById(modalId).classList.remove('active');
}

function resetCategoryModal() {

    const form = document.getElementById("form");
    const previewImage = document.getElementById("previewImage");
    const uploadArea = document.getElementById("uploadArea");
    const changeImageBtn = document.getElementById("changeImageBtn");
    const fileInput = document.getElementById("catImage");

    form.action = "/admin/category";
    form.reset();

    if (cropper) {
        cropper.destroy();
        cropper = null;
    }

    previewImage.src = "";
    previewImage.classList.add("hidden");

    uploadArea.classList.remove("hidden");
    changeImageBtn.classList.add("hidden");

    fileInput.value = "";

    document.getElementById("modalTitle").innerText = "Add Category";

    openModal("categoryModal");
}
