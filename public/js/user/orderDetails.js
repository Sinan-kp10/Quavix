
const form = document.getElementById("form")
const reason = document.getElementById("reason")
const description = document.getElementById("description")

form.addEventListener("submit", function (e) {

    e.preventDefault()
    clearErrors()

    let isValid = true

    if (!reason.value) {
        showError(reason, "Reason is required");
        isValid = false;
    }

    if (description.value.trim().length < 6) {
        showError(description, "Description must be at least 6 characters")
        isValid = false
    }

    if (isValid) {
        form.submit()
    }

})

function showError(input, message) {

    input.classList.add("input-error")

    const errorText = input.parentElement.querySelector(".error-message")

    if (errorText) {
        errorText.innerText = message
    }

}

function clearErrors() {

    document.querySelectorAll(".error-message").forEach(e => {
        e.innerText = ""
    })

    document.querySelectorAll(".form-input-refined").forEach(e => {
        e.classList.remove("input-error")
    })

}

// Modal
function toggleModal(show) {

    const overlay = document.getElementById("helpModalOverlay");

    if (show) {

        overlay.classList.add("active");
        document.body.style.overflow = "hidden";

    } else {

        overlay.classList.remove("active");
        document.body.style.overflow = "";

        form.reset();

        clearErrors();
    }
}
function clearErrors() {

    document.querySelectorAll(".error-message").forEach(e => {
        e.innerText = ""
    })

    document.querySelectorAll(".form-input-refined").forEach(e => {
        e.classList.remove("input-error")
    })
}
document.getElementById("helpModalOverlay").addEventListener("click", function (e) {

    if (e.target === this) {
        toggleModal(false)
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

async function downloadInvoice(orderId, variantId) {
    const spinner = document.getElementById("admin-spinner");
    if (spinner) spinner.style.display = "flex";

    try {
        const response = await fetch(`/invoice/${orderId}?itemId=${variantId}`);
        if (!response.ok) {
            throw new Error("Failed to download invoice");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        console.error("Error downloading invoice:", error);
        alert("Failed to download invoice. Please try again.");
    } finally {
        if (spinner) spinner.style.display = "none";
    }
}