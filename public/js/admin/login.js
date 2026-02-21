document.addEventListener("DOMContentLoaded",function (){

  const form = document.getElementById("adminLoginForm");
  const email = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const toggleBtn = document.getElementById("togglePassword");
  const eyeIcon = document.getElementById("eyeIcon");

  function clearErrors() {
    document.querySelectorAll(".error-message").forEach(el =>el.textContent ="");
    email.classList.remove("input-error");
    passwordInput.classList.remove("input-error");
  }

  function showError(input, message) {
    const errorElement = input.parentElement.querySelector(".error-message");
    errorElement.textContent = message;
    input.classList.add("input-error");
  }

  form.addEventListener("submit",function(e){
    e.preventDefault();
    clearErrors();
    let isValid = true;

    if(email.value.trim() === "") {
        showError(email, "Email is required")
        isValid = false;
    }
    const passwordValue = passwordInput.value;

    if (passwordValue.trim() === "") {
        showError(passwordInput, "Password is required");
        isValid = false;
    }
    else if (passwordValue.length < 6) {
        showError(passwordInput, "Password must be at least 6 characters");
        isValid = false;
    }
    else if (passwordValue.includes(" ")) {
        showError(passwordInput, "Password cannot contain spaces");
        isValid = false;
    }

    if (isValid) {
      form.submit()
    }
  });

  toggleBtn.addEventListener("click",function(){

    if(passwordInput.type === "password"){
        passwordInput.type = "text";
        eyeIcon.classList.remove("fa-eye-slash")
        eyeIcon.classList.add("fa-eye");
    }else{
        passwordInput.type = "password"
        eyeIcon.classList.remove("fa-eye")
        eyeIcon.classList.add("fa-eye-slash")
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
