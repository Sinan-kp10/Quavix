function initializeImageUpload(scope = document) {

    scope.querySelectorAll(".image-item").forEach(item => {

        const fileInput = item.querySelector(".image-input");
        const uploadArea = item.querySelector(".upload-area");
        const previewImage = item.querySelector(".preview-img");
        const changeBtn = item.querySelector(".change-image-btn");
        const errorElement = item.querySelector(".error-message");

        if (!fileInput || !previewImage) return;

        item.cropperInstance = null;

        if (previewImage.src && !previewImage.classList.contains("hidden")) {

            item.cropperInstance = new Cropper(previewImage, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 1,
                zoomable: true,
                scalable: true,
                movable: true
            });

            if (uploadArea) uploadArea.classList.add("hidden");
            if (changeBtn) changeBtn.classList.remove("hidden");
        }

        if (uploadArea) {
            uploadArea.addEventListener("click", () => {
                fileInput.click();
            });
        }

        if (changeBtn) {
            changeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                fileInput.click();
            });
        }

        previewImage.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        fileInput.addEventListener("change", function (e) {

            const file = e.target.files[0];
            if (!file) return;

            if (errorElement) errorElement.textContent = "";

            const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

            if (!allowedTypes.includes(file.type)) {
                if (errorElement)
                    errorElement.textContent = "Only JPG, PNG, WEBP allowed";
                fileInput.value = "";
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                if (errorElement)
                    errorElement.textContent = "Image must be below 5MB";
                fileInput.value = "";
                return;
            }

            const reader = new FileReader();

            reader.onload = function () {

                previewImage.src = reader.result;
                previewImage.classList.remove("hidden");

                if (uploadArea) uploadArea.classList.add("hidden");
                if (changeBtn) changeBtn.classList.remove("hidden");

                if (item.cropperInstance && fileInput.files.length > 0) {
                    item.cropperInstance.destroy();
                }

                item.cropperInstance = new Cropper(previewImage, {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 1
                });
            };

            reader.readAsDataURL(file);
        });

    });
}

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("addProductForm")
    const name = document.getElementById("name")
    const categories = document.getElementById("categories")
    const highlights = document.getElementById("highlights")
    const services = document.getElementById("services")
    const description = document.getElementById("description")

    function showError(input, message) {
        input.classList.add("input-error");
        const errorText = input.closest(".form-group").querySelector(".error-message");
        if (errorText) {
            errorText.innerText = message;
        }
    }

    function clearErrors() {
        document.querySelectorAll(".error-message").forEach(e => {
            e.innerText = "";
        });

        document.querySelectorAll(".form-input, .form-select, .form-textarea")
            .forEach(e => {
                e.classList.remove("input-error");
            });
    }

    form.addEventListener("submit", function (e) {

        clearErrors();

        let isValid = true;

        if (name.value.trim().length < 3) {
            showError(name, "Name must contain at least 3 characters.");
            isValid = false;
        }

        if (categories.value.trim() === "") {
            showError(categories, "Category is required");
            isValid = false;
        }

        if (highlights.value.trim().length < 5) {
            showError(highlights, "Highlights must contain at least 5 characters");
            isValid = false;
        }

        if (services.value.trim().length < 5) {
            showError(services, "Services must contain at least 5 characters.");
            isValid = false;
        }

        if (description.value.trim().length < 5) {
            showError(description, "Description must contain at least 5 characters.");
            isValid = false;
        }

        document.querySelectorAll(".variant-row").forEach(row => {

            const priceInput = row.querySelector('input[name*="[price]"]');
            const stockInput = row.querySelector('input[name*="[stock]"]');

            if (priceInput && !priceInput.value.trim()) {
                showError(priceInput, "Price is required");
                isValid = false;
            }

            if (stockInput && !stockInput.value.trim()) {
                showError(stockInput, "Stock is required");
                isValid = false;
            }
        });

        document.querySelectorAll(".variant-row").forEach(row => {

            row.querySelectorAll(".image-item").forEach(item => {

                const fileInput = item.querySelector(".image-input");
                const previewImage = item.querySelector(".preview-img");
                const errorElement = item.querySelector(".error-message");

                const hasExistingImage =
                    previewImage &&
                    !previewImage.classList.contains("hidden") &&
                    previewImage.src !== "";

                const hasNewFile = fileInput.files.length > 0;

                if (!hasExistingImage && !hasNewFile) {
                    if (errorElement) {
                        errorElement.textContent = "Please select an image";
                    }
                    isValid = false;
                }
            });
        });

        if (!isValid) {
            e.preventDefault();
            return;
        }

        e.preventDefault(); 

        const cropPromises = [];

        document.querySelectorAll(".image-item").forEach(item => {

            const fileInput = item.querySelector(".image-input");

            if (item.cropperInstance && fileInput.files.length > 0) {

                const promise = new Promise(resolve => {

                    const canvas = item.cropperInstance.getCroppedCanvas({
                        width: 800,
                        height: 800
                    });

                    canvas.toBlob((blob) => {

                        const newFile = new File([blob], "cropped.jpg", {
                            type: "image/jpeg"
                        });

                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(newFile);

                        fileInput.files = dataTransfer.files;

                        resolve();

                    }, "image/jpeg");
                });

                cropPromises.push(promise);
            }
        });

        Promise.all(cropPromises).then(() => {
            form.submit(); 
        });

    })

    const toast = document.getElementById("toast");

    if (toast) {
        setTimeout(() => {
            toast.classList.add("show");
        }, 100);

        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }


    initializeImageUpload();

})