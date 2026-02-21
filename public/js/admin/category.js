document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("form");
    const name = document.getElementById("name");

    const fileInput = document.getElementById("catImage");
    const uploadArea = document.getElementById("uploadArea");
    const previewImage = document.getElementById("previewImage");
    const changeImageBtn = document.getElementById("changeImageBtn");
    const errorElement = uploadArea.parentElement.querySelector(".error-message");

    let cropper;

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

        // Name validation
        if (name.value.trim().length < 3) {
            showError(name, "Category name must be at least 3 characters");
            isValid = false;
        }

        // Image required validation
        if (!fileInput.files.length) {
            errorElement.textContent = "Please select an image";
            isValid = false;
        }

        if (!isValid) return;

        // If cropper exists → crop image first
        if (cropper) {

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
        document.querySelectorAll(".error-message")
            .forEach(el => el.textContent = "");

        document.querySelectorAll(".input-error")
            .forEach(el => el.classList.remove("input-error"));
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

        Swal.fire({
            title: "Are you sure?",
            text: "This category will be deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
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

});