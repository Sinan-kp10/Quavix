
//wishlist


document.addEventListener("click", async function (e) {

    const btn = e.target.closest(".wishlist-toggle");
    if (!btn) return;

    e.preventDefault();

    const productId = btn.dataset.product;
    const variantId = btn.dataset.variant;

    try {

        const response = await fetch("/wishlist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ productId, variantId })
        });

        const data = await response.json();

        if (response.status === 401) {
            triggerToast(data.message || "Login required", "error");
            return;
        }

        if (!data.success) {
            triggerToast(data.message || "Something went wrong", "error");
            return;
        }

        const icon = btn.querySelector("i");

        if (data.added) {
            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");
            icon.style.color = "red";

            triggerToast(data.message, "success");
        } else {
            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");
            icon.style.color = "#cbd5e1";

            triggerToast(data.message, "error");
        }

    } catch (err) {
        triggerToast("Server error", "error");
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

function triggerToast(message, type = "error") {

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