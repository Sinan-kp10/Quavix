function initializeImageUpload(scope = document) {

    scope.querySelectorAll(".image-item").forEach(item => {

        const fileInput = item.querySelector(".image-input");
        const uploadArea = item.querySelector(".upload-area");
        const previewImage = item.querySelector(".preview-img");
        const changeBtn = item.querySelector(".change-image-btn");
        const errorElement = item.querySelector(".error-message");

        let cropper = null;

    
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

            errorElement.textContent = "";

            const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

            if (!allowedTypes.includes(file.type)) {
                errorElement.textContent = "Only JPG, PNG, WEBP allowed";
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

                if (uploadArea) {
                    uploadArea.classList.add("hidden");
                }

                changeBtn.classList.remove("hidden");
                if (cropper) {
                    cropper.destroy();
                }

                cropper = new Cropper(previewImage, {
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

    const form=document.getElementById("addProductForm")
    const name=document.getElementById("name")
    const categories=document.getElementById("categories")
    const offer=document.getElementById("offer")
    const highlights=document.getElementById("highlights")
    const services=document.getElementById("services")
    const description=document.getElementById("description")

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

    form.addEventListener("submit",function(e){

        clearErrors();

        let isValid = true;

        if (name.value.trim().length< 3) {
            showError(name, "Name is required")
            isValid = false;
        }

        if (categories.value.trim() === "") {
            showError(categories, "Category is required")
            isValid = false;
        }
        if (offer.value === "" || offer.value < 0) {
            showError(offer, "Offer is required")
            isValid = false;
        }

        if (highlights.value.trim().length< 5) {
            showError(highlights, "Highlights is required");
            isValid = false;
        }

        if (services.value.trim().length< 5) {
            showError(services, "Services is required");
            isValid = false;
        }
        if (description.value.trim().length< 5) {
            showError(description, "Description is required");
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
                const errorElement = item.querySelector(".error-message");

                if (!fileInput.files.length) {
                    errorElement.textContent = "Please select an image";
                    isValid = false;
                }

            });

        });


        if(!isValid){
            e.preventDefault();

        }
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