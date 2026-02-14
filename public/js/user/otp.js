document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("otpForm");
    const inputs = document.querySelectorAll(".otp-digit");

    
    inputs.forEach((input, index) => {
        input.addEventListener("input", function () {
            if (this.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
    });


    form.addEventListener("submit", function () {

        let otp = "";

        inputs.forEach(input => {
            otp += input.value;
        });

        document.getElementById("finalOtp").value = otp;
    });

    const timer = document.getElementById("otpTimer");
    const timerWrapper = document.querySelector(".otp-timer");
    const expiryTime = Number(timerWrapper.dataset.expiry);
    

    const interval=setInterval(()=>{
        
        const remaining = Math.floor((expiryTime - Date.now()) / 1000);
        if (remaining <= 0) {
            clearInterval(interval);
            timer.textContent = "Expired";
            return;
        }

        let minute=Math.floor(remaining/60)
        let second=remaining % 60

        timer.textContent= minute+":"+(second<10?"0"+second:second)


    },1000)

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

});
