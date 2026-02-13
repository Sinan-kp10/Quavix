document.addEventListener("DOMContentLoaded", function () {

   const email = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const toggleBtn = document.getElementById("togglePassword");
  const eyeIcon = document.getElementById("eyeIcon");
  const form = document.getElementById("loginForm");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");

    // Clear errors
  function clearErrors() {
    emailError.textContent = "";
    passwordError.textContent = "";
    email.classList.remove("input-error");
    password.classList.remove("input-error");
  }

  form.addEventListener("submit", function (e) {

    clearErrors();

    let isValid = true;

    if (email.value.trim() === "") {
      emailError.textContent = "Email is required";
      email.classList.add("input-error");
      isValid = false;
    }

    if (password.value.trim() === "") {
      passwordError.textContent = "Password is required";
      password.classList.add("input-error");
      isValid = false;
    }
    // Password length check
    else if (password.value.trim().length < 6) {
      passwordError.textContent = "Password must be at least 6 characters";
      password.classList.add("input-error");
      isValid = false;
    }

    if (!isValid) {
      e.preventDefault();
    }

  });


   const toast = document.getElementById("toast");

  if (toast) {
    setTimeout(() => {
      toast.classList.add("show");
    }, 100);

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
  

  //Toggle password visibility
  toggleBtn.addEventListener("click", function () {

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      eyeIcon.classList.remove("fa-eye-slash");
      eyeIcon.classList.add("fa-eye");
    } else {
      passwordInput.type = "password";
      eyeIcon.classList.remove("fa-eye");
      eyeIcon.classList.add("fa-eye-slash");
    }

  });

  

});
