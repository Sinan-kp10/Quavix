document.addEventListener("DOMContentLoaded", function(){

  const form = document.getElementById("newPasswordForm");
  const passwordInput = document.getElementById("password");
  const passwordError = document.getElementById("passwordError");
  const toggleBtn = document.getElementById("togglePassword");
  const eyeIcon = document.getElementById("eyeIcon");

  function clearErrors() {
    passwordError.textContent = "";
    passwordInput.classList.remove("input-error");
  }

  form.addEventListener("submit", function(e){

    clearErrors();
    let isValid = true;


    if (passwordInput.value.trim() === ""){
      passwordError.textContent = "Password is required";
      passwordInput.classList.add("input-error");
      isValid = false;
    }

    else if (passwordInput.value.trim().length < 6){
      passwordError.textContent = "Password must be at least 6 characters";
      passwordInput.classList.add("input-error");
      isValid = false;
    }

    if (!isValid) {
      e.preventDefault();
    }
  });

    toggleBtn.addEventListener("click", function(){

    if (passwordInput.type === "password"){
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
