document.addEventListener('DOMContentLoaded',()=>{

    const form=document.getElementById("profileUpdateForm")
    const formEmail=document.getElementById("emailForm")
    const newEmail=document.getElementById("newEmail")

    const currentPassword=document.getElementById("currentPassword")
    const newPassword=document.getElementById("newPassword")
    const name=document.getElementById("name")
    const toggleButtons = document.querySelectorAll(".password-toggle");
    const saveProfileBtn = document.getElementById("saveProfileBtn");

    const initialName = name.value.trim();

    function checkChanges() {
        const currentName = name.value.trim();
        const currentPass = currentPassword.value.trim();
        const newPass = newPassword.value.trim();

        const isNameChanged = currentName !== initialName;
        const isPasswordTyped = currentPass !== "" || newPass !== "";

        saveProfileBtn.disabled = !(isNameChanged || isPasswordTyped);
    }

    name.addEventListener("input", checkChanges);
    currentPassword.addEventListener("input", checkChanges);
    newPassword.addEventListener("input", checkChanges);


    form.addEventListener('submit',function(e){
        e.preventDefault();

        clearErrors()

        let isValid=true

        if(name.value.trim().length === 0 ){
            showError(name,"Name is required")
            isValid=false
        }
        else if(name.value.trim().length < 3){
            showError(name,"Name must be at least 3 characters")
            isValid=false
        }

        const currentPassVal = currentPassword.value.trim();
        const newPassVal = newPassword.value.trim();

        if (currentPassVal || newPassVal) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;


            if (!currentPassVal) {
                showError(currentPassword, "Current password is required");
                isValid = false;
            } else if (currentPassVal.length < 6 || !passwordRegex.test(currentPassVal)) {
                showError(currentPassword, "Incorrect password");
                isValid = false;
            }

            if (!newPassVal) {
                showError(newPassword, "New password is required");
                isValid = false;
            } else if (newPassVal.length < 6) {
                showError(newPassword, "Password must be at least 6 characters");
                isValid = false;
            } else if (!passwordRegex.test(newPassVal)) {
                showError(newPassword, "Must include uppercase, lowercase, and special character");
                isValid = false;
            }
        }

        if(isValid){
            const spinner = document.getElementById("admin-spinner");
            if (spinner) spinner.style.display = "flex";
            form.submit();
        }
    })

    formEmail.addEventListener('submit',function(e){
        e.preventDefault();
        
        clearErrors()

        let isValid=true

        if (newEmail.value.trim()==="") {
            showError(newEmail, "Email is required");
            isValid = false;
        }

        if(isValid){
            const spinner = document.getElementById("admin-spinner");
            if (spinner) spinner.style.display = "flex";
            formEmail.submit();
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

    })

})

let cropper;
let selectedFile = null;

const input = document.getElementById("profileInput");
const image = document.getElementById("cropImage");
const modal = document.getElementById("cropModal");
const cropConfirm = document.getElementById("cropConfirm");
const cropCancel = document.getElementById("cropCancel");

function showToast(message, type = "error") {

    let toast = document.getElementById("toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        document.body.appendChild(toast);
    }

    toast.className = `toast ${type}`;
    toast.innerText = message;

    setTimeout(() => {
        toast.classList.add("show");
    }, 100);

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

input.addEventListener("change", function (e) {

    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024; 


    if (!allowedTypes.includes(file.type)) {
        showToast("Only JPG, PNG, WEBP images are allowed", "error");
        input.value = "";
        return;
    }

    if (file.size > maxSize) {
        showToast("File too large. Max size is 2MB.", "error");
        input.value = "";
        return;
    }

    selectedFile = file;

    const reader = new FileReader();

    reader.onload = function () {

        image.src = reader.result;
        modal.style.display = "flex";

        if (cropper) {
            cropper.destroy();
        }

        cropper = new Cropper(image, {
            aspectRatio: 1,
            viewMode: 1,
            dragMode: "move",
            cropBoxResizable: false,
            cropBoxMovable: false,
            zoomable: true,
            scalable: false,
            responsive: true
        });
    };

    reader.readAsDataURL(file);
});

cropConfirm.addEventListener("click", function () {

    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
        width: 300,
        height: 300
    });

    const spinner = document.getElementById("admin-spinner");
    spinner.style.display = "flex"

    canvas.toBlob(function (blob) {

        const formData = new FormData();
        formData.append("profileImage", blob, "profile.jpg");

        fetch("/upload-profile", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {

            spinner.style.display = "none"

            if (!data.success) {
                showToast(data.message || "Upload failed", "error");
                return;
            }

            
            window.location.reload();

        })
        .catch(() => {
            spinner.style.display = "none"
            showToast("Something went wrong. Please try again.", "error");
        });

    }, "image/jpeg");

    modal.style.display = "none";
});


cropCancel.addEventListener("click", function () {

    modal.style.display = "none";

    if (cropper) {
        cropper.destroy();
        cropper = null;
    }

    input.value = "";
})

const removeProfileForm = document.getElementById("removeProfileForm");
if (removeProfileForm) {
    removeProfileForm.addEventListener("submit", function () {
        const spinner = document.getElementById("admin-spinner");
        if (spinner) spinner.style.display = "flex";
    });
}