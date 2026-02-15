document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("forgotPasswordForm");
  const emailInput = document.getElementById("email");
  const emailError = document.getElementById("emailError");

  function clearErrors() {
    emailError.textContent = "";
    emailInput.classList.remove("input-error");
  }

  form.addEventListener("submit", function (e) {

    clearErrors();
    let isValid = true;

 
    if (emailInput.value.trim() === "") {
      emailError.textContent = "Email is required";
      emailInput.classList.add("input-error");
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

});


    


