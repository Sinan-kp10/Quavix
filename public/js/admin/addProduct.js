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

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

function addVariant() {
    const container = document.getElementById('variantsContainer');
    const index = container.querySelectorAll('.variant-row').length;

    const newRow = document.createElement('div');
    newRow.className = 'form-grid grid-cols-1 md:grid-cols-3 mb-4 variant-row relative border p-6 rounded bg-gray-50';

    newRow.innerHTML = `
        <h4 class="variant-title">Variant ${index + 1}</h4>

        <!-- Attributes -->
        <div class="form-group">
            <label>Color</label>
            <input type="hidden" 
                name="variants[${index}][attributes][0][name]" 
                value="Color">
            <input type="text" 
                name="variants[${index}][attributes][0][value]" 
                class="form-input"
                placeholder="e.g. Red">
            <small class="error-message"></small>
        </div>

        <div class="form-group">
            <label>RAM</label>
            <input type="hidden" 
                name="variants[${index}][attributes][1][name]" 
                value="RAM">
            <input type="text" 
                name="variants[${index}][attributes][1][value]" 
                class="form-input"
                placeholder="e.g. 8GB">
        </div>

        <div class="form-group">
            <label>ROM</label>
            <input type="hidden" 
                name="variants[${index}][attributes][2][name]" 
                value="ROM">
            <input type="text" 
                name="variants[${index}][attributes][2][value]" 
                class="form-input"
                placeholder="e.g. 128GB">
        </div>

        <!-- Price -->
        <div class="form-group">
            <label>Price</label>
            <input type="number"
                name="variants[${index}][price]"
                class="form-input"
                placeholder="0.00"
                min="1">
            <small class="error-message"></small>
        </div>

        <!-- Stock -->
        <div class="form-group">
            <label>Stock</label>
            <input type="number"
                name="variants[${index}][stock]"
                class="form-input"
                placeholder="0"
                min="0">
            <small class="error-message"></small>
        </div>

        <!-- Status -->
        <div class="form-group">
            <label>Status</label>

            <div class="flex items-center gap-2">
                <select name="variants[${index}][status]" class="form-select flex-1">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>

                <button type="button"
                    class="btn btn-danger btn-icon"
                    onclick="removeVariant(this)">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>

        <!-- Images -->
        <div class="variant-images">

            <!-- Primary -->
            <div class="image-item">
                <div class="image-upload">
                    <input type="file"
                        name="variants[${index}][images][primary]"
                        class="image-input hidden"
                        accept="image/*">

                    <div class="upload-area">
                        <span>Primary Photo</span>
                    </div>

                    <img class="preview-img hidden">
                </div>

                <button type="button" class="change-image-btn hidden">
                    Change
                </button>

                <small class="error-message text-danger"></small>
            </div>

            <!-- Gallery 1 -->
            <div class="image-item">
                <div class="image-upload">
                    <input type="file"
                        name="variants[${index}][images][gallery][]"
                        class="image-input hidden"
                        accept="image/*">

                    <div class="upload-area">
                        <span>Gallery Photo</span>
                    </div>

                    <img class="preview-img hidden">
                </div>

                <button type="button" class="change-image-btn hidden">
                    Change
                </button>

                <small class="error-message text-danger"></small>
            </div>

            <!-- Gallery 2 -->
            <div class="image-item">
                <div class="image-upload">
                    <input type="file"
                        name="variants[${index}][images][gallery][]"
                        class="image-input hidden"
                        accept="image/*">

                    <div class="upload-area">
                        <span>Gallery Photo</span>
                    </div>

                    <img class="preview-img hidden">
                </div>

                <button type="button" class="change-image-btn hidden">
                    Change
                </button>

                <small class="error-message text-danger"></small>
            </div>

        </div>
    `;

    container.appendChild(newRow);

    initializeImageUpload(newRow);
}

function removeVariant(button) {

    Swal.fire({
        title: "Are you sure?",
        text: "This variant will be removed!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#6366f1",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it"
    }).then((result) => {

        if (!result.isConfirmed) return;

        const row = button.closest('.variant-row');
        row.remove();

        const rows = document.querySelectorAll('.variant-row');

        rows.forEach((row, newIndex) => {


            row.querySelector('.variant-title').textContent =
                `Variant ${newIndex + 1}`;


            const inputs = row.querySelectorAll("input, select, textarea");

            inputs.forEach(input => {
                if (input.name) {
                    input.name = input.name.replace(/variants\[\d+\]/, `variants[${newIndex}]`);
                }
            });

        });

        Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Variant removed successfully",
            timer: 1200,
            showConfirmButton: false
        });

    });
}