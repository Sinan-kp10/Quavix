document.addEventListener('DOMContentLoaded',()=>{

    const form=document.getElementById("profileUpdateForm")
    const formEmail=document.getElementById("emailForm")
    const newEmail=document.getElementById("newEmail")

    const currentPassword=document.getElementById("currentPassword")
    const newPassword=document.getElementById("newPassword")
    const name=document.getElementById("name")
    const toggleButtons = document.querySelectorAll(".password-toggle");


    form.addEventListener('submit',function(e){
        

        clearErrors()

        let isValid=true

        if(name.value.trim().length== 0){
            showError(name,"Enter your name")
            isValid=false
        }

    if (currentPassword.value || newPassword.value) {

        if(currentPassword.value.length < 6) {
            showError(currentPassword, "Password must be at least 6 characters");
            isValid = false;
        }

        if (newPassword.value.length < 6) {
            showError(newPassword, "Password must be at least 6 characters");
            isValid = false;
        }
        else if (newPassword.value.includes(" ")) {
            showError(newPassword, "Password cannot contain spaces");
            isValid = false;
        }
    }
        if(!isValid){
            e.preventDefault();
        }
    })

    formEmail.addEventListener('submit',function(e){
        
        clearErrors()

        let isValid=true

        if (newEmail.value.trim()==="") {
            showError(newEmail, "Email is required");
            isValid = false;
        }

        if(!isValid){
            e.preventDefault();
        }
    })

    function showError(input,message){
        input.classList.add("input-error")
        const errorText = input.closest(".form-group").querySelector(".error-message");

        errorText.innerText = message;
    }
    function clearErrors() {
        document.querySelectorAll(".error-message").forEach(e => {
            e.innerText = "";
        });

        document.querySelectorAll(".form-input").forEach(e => {
            e.classList.remove("input-error");
        });
    }



    toggleButtons.forEach(button=>{
        button.addEventListener("click",function(){

            const targetId = this.getAttribute("data-target");
            const passwordInput = document.getElementById(targetId);
            const eyeIcon = this.querySelector("i");

            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                eyeIcon.classList.remove("fa-eye-slash");
                eyeIcon.classList.add("fa-eye");
            } else {
                passwordInput.type = "password";
                eyeIcon.classList.remove("fa-eye");
                eyeIcon.classList.add("fa-eye-slash");
            }

        })
    })

    //toast
    const toast = document.getElementById("toast");

    if (toast) {
        setTimeout(() => {
        toast.classList.add("show");
        }, 100);

        setTimeout(() => {
        toast.classList.remove("show");
        }, 3000);
    }

     //delete

    document.querySelectorAll(".delete-btn").forEach(button => {

        button.addEventListener("click", function () {

            const addressId = this.dataset.id

            Swal.fire({
                title: "Are you sure?",
                text: "This address will be permanently deleted!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
            }).then((result) => {

                if(result.isConfirmed){

                    const formDelete = document.createElement("form");
                    formDelete.method = "POST";
                    formDelete.action = "/deleteAddress/" + addressId;

                    document.body.appendChild(formDelete);
                    formDelete.submit();
                }
            });
        });

    });

});
