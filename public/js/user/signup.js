
const form = document.getElementById("signupForm");

const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const toggles = document.querySelectorAll(".password-toggle");

//Toggle Eye
toggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {

        const input = this.parentElement.querySelector("input");
        const icon = this.querySelector("i");

        if (input.type === "password") {
            input.type = "text";
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        } else {
            input.type = "password";
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        }
    });
});


//Form Validation
form.addEventListener("submit", function (e) {

    e.preventDefault();

    clearErrors();

    let isValid = true;

    // Full Name
    if (fullName.value.trim() === "") {
        showError(fullName, "Full name is required");
        isValid = false;
    }

    // Email
    if (email.value.trim() === "") {
        showError(email, "Email is required");
        isValid = false;
    }

    // Password length check (<6 not allowed)
    if (password.value.length < 6) {
        showError(password, "Password must be at least 6 characters");
        isValid = false;
    }

    // Confirm password match
    if (confirmPassword.value !== password.value) {
        showError(confirmPassword, "Passwords do not match");
        isValid = false;
    }

    if (isValid) {
        showToast("Account created successfully!", "success");
        setTimeout(() => {
            form.submit();
        }, 1000);
    }
});


//Show Error
function showError(input, message) {

    input.classList.add("input-error");

    const errorText = input.closest(".form-group").querySelector(".error-message");

    errorText.innerText = message;
}


//Clear Errors
function clearErrors() {

    document.querySelectorAll(".form-input")
        .forEach(input => input.classList.remove("input-error"));

    document.querySelectorAll(".error-message")
        .forEach(msg => msg.innerText = "");
}


//Toast Function
function showToast(message, type) {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.innerHTML = message;
    toast.className = `toast ${type}`;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

