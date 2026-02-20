document.addEventListener("DOMContentLoaded", function(){

    const form = document.getElementById("addressForm")

    const name = document.getElementById("name")
    const phone = document.getElementById("phone")
    const pincode = document.getElementById("pincode")
    const street = document.getElementById("street")
    const state = document.getElementById("state")
    const city = document.getElementById("city")
    const addressType = document.getElementById("addressType")

    form.addEventListener("submit", async function(e){

        e.preventDefault();
        clearErrors();

        let isValid = true;

        if (name.value.trim().length< 3) {
            showError(name, "Full name is required")
            isValid = false;
        }

        if (!/^[0-9]{10}$/.test(phone.value.trim())) {
            showError(phone, "Enter valid 10 digit phone number")
            isValid = false;
        }

        if (!/^[0-9]{6}$/.test(pincode.value.trim())) {
            showError(pincode, "Enter valid 6 digit pincode")
            isValid = false;
        }

        if (street.value.trim() === "") {
            showError(street, "Street address is required")
            isValid = false;
        }
        if (state.value.trim() === "") {
            showError(state, "State is required")
            isValid = false;
        }

        if (city.value.trim() === "") {
            showError(city, "City is required");
            isValid = false;
        }

        if(!isValid) return

       try {

        const response = await fetch(
            `https://api.postalpincode.in/pincode/${pincode.value.trim()}`
        );

        const data = await response.json();

        if (data[0].Status==="Error"){
            showError(pincode,"Pincode does not exist");
            return;
        }

        const postOffice=data[0].PostOffice[0];

        const apiState=postOffice.State.toLowerCase();
        const apiCity=postOffice.District.toLowerCase();

        if(state.value.trim().toLowerCase() !== apiState){
            showError(state, "State does not match pincode");
            return;
        }

        if(city.value.trim().toLowerCase()!==apiCity){
            showError(city, "District does not match pincode");
            return;
        }
        form.submit();

        } catch (err){
            console.log(err);
            showError(pincode, "Unable to verify pincode");
        }
    })

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

        document.querySelectorAll(".form-input").forEach(e => {
            e.classList.remove("input-error");
        });
    }


});
