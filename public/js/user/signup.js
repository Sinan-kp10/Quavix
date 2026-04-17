document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("signupForm");

    const fullName = document.getElementById("fullName");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const toggles = document.querySelectorAll(".password-toggle");

    // Toggle Eye
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

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        clearErrors();
        let isValid = true;

        if (fullName.value.trim() === "") {
            showError(fullName, "Full name is required");
            isValid = false;
        }

        if(email.value.trim()==="") {
            showError(email, "Email is required");
            isValid = false;
        }

        const value = password.value;

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;

        if (!value) {
            showError(password, "Password required");
            isValid = false;

        } else if (value !== value.trim()) {

            showError(password, "No spaces allowed at start or end");
            isValid = false;

        } else if (!passwordRegex.test(value)) {
            showError(password, "Password must be 6+ chars, include uppercase, lowercase, and special character");
            isValid = false;
        }

        if (confirmPassword.value !== password.value) {
            showError(confirmPassword, "Passwords do not match");
            isValid = false;
        }

        if (isValid) {
            const spinner = document.getElementById("admin-spinner");
            if (spinner) spinner.style.display = "flex";
            form.submit();
        }
    });

    function showError(input, message) {
        input.classList.add("input-error");
        const errorText = input.closest(".form-group").querySelector(".error-message");
        errorText.innerText = message;
    }

    function clearErrors() {
        document.querySelectorAll(".form-input")
            .forEach(input => input.classList.remove("input-error"));

        document.querySelectorAll(".error-message")
            .forEach(msg => msg.innerText = "");
    }

    const toast = document.getElementById("toast");

    if (toast) {
        setTimeout(() => {
            toast.classList.add("show");
        }, 100);

        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

});


