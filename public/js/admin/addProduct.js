document.addEventListener("DOMContentLoaded", function () {

    const form=document.getElementById("addProductForm")
    const name=document.getElementById("name")
    const categories=document.getElementById("categories")
    const offer=document.getElementById("offer")
    const price=document.getElementById("price")
    const stock=document.getElementById("stock")
    const primaryImage=document.getElementById("primary-image")
    const secondaryImage=document.getElementById("secondary-image")
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

        if (price.value.trim() === "") {
            showError(price, "Price is required");
            isValid = false;
        }

        if (stock.value.trim() === "") {
            showError(stock, "Stock is required");
            isValid = false;
        }

        if (primaryImage.files.length === 0) {
            showError(primaryImage, "Image is required");
            isValid = false;
        }

        if (secondaryImage.files.length === 0) {
            showError(secondaryImage, "Image is required");
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


})