function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}
function openAddModal() {

    const form = document.getElementById("form");

    form.action = "/admin/coupons";

    form.reset();

    document.getElementById("code").value = "";
    document.getElementById("discountAmount").value = "";
    document.getElementById("minPurchaseAmount").value = "";
    document.getElementById("date").value = "";

    document.getElementById("couponModal").classList.add("active");
}
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function toggleCouponType() {
    const type = document.getElementById("couponType").value;
    const label = document.getElementById("discountLabel");
    const input = document.getElementById("discountAmount");
    const maxGroup = document.getElementById("maxDiscountGroup");

    if (type === "percentage") {
        label.innerText = "Discount Percentage (%)";
        input.placeholder = "e.g. 10";
        maxGroup.style.display = "block";
    } else {
        label.innerText = "Discount Amount (₹)";
        input.placeholder = "e.g. 500";
        maxGroup.style.display = "none";
    }
}


const form = document.getElementById("form");
const code = document.getElementById("code");
const discountAmount = document.getElementById("discountAmount");
const minPurchaseAmount = document.getElementById("minPurchaseAmount");
const date = document.getElementById("date")

code.addEventListener("input", () => {
    code.value = code.value.toUpperCase();
})

form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();
    let isValid = true;

    const type = document.getElementById("couponType").value;
    const codeValue = code.value.trim();
    const regex = /^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9]{6,12}$/

    if (!regex.test(codeValue)) {
        showError(code, "Code must be at least 6 characters and contain both letters and numbers (A-Z, 0-9)");
        isValid = false;
    }
    if (discountAmount.value.trim() === "" || discountAmount.value <= 0) {
        showError(discountAmount, "Value is required");
        isValid = false;
    }

    const discountValue = Number(discountAmount.value);
    const minPurchaseValue = Number(minPurchaseAmount.value)

    if (type === "percentage" && discountValue > 100) {
        showError(discountAmount, "Percentage cannot exceed 100");
        isValid = false;
    }

    if (minPurchaseAmount.value.trim() === "" || minPurchaseAmount.value <= 0) {
        showError(minPurchaseAmount, "Min Purchase Amount is required");
        isValid = false;
    }
    else if (type === "fixed" && minPurchaseValue <= discountValue) {
        showError(discountAmount, "Discount amount should be lower than min purchase amount");
        isValid = false;
    }

    if (date.value.trim() === "") {
        showError(date, "Expiry Date is required");
        isValid = false;
    }


    if (isValid) {
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
document.querySelectorAll(".delete-btn").forEach(btn => {

    btn.addEventListener("click", function () {

        const form = this.closest("form");
        const status = this.dataset.status;

        const actionText = status === "Active" ? "deactivate" : "restore";

        Swal.fire({
            title: "Are you sure?",
            text: `You want to ${actionText} this coupon`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, continue"
        }).then((result) => {

            if (result.isConfirmed) {
                form.submit();
            }

        });

    });

});