document.addEventListener("click", function (e) {

    const btn = e.target.closest(".remove-cart-item");
    if (!btn) return;

    const productId = btn.dataset.product;
    const variantId = btn.dataset.variant;

    Swal.fire({
        title: "Are you sure?",
        text: "This product will be removed from cart!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#6366f1",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, remove it"
    }).then(async (result) => {

        if (!result.isConfirmed) return;

        try {

            const response = await fetch("/cart/remove", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ productId, variantId })
            });

            const data = await response.json();

            if (data.success) {

                Swal.fire({
                    icon: "success",
                    title: "Removed!",
                    text: data.message,
                    timer: 1500,
                    showConfirmButton: false
                });

                setTimeout(() => {
                    location.reload();
                }, 1200);

            } else {
                Swal.fire("Error", data.message, "error");
            }

        } catch (err) {
            Swal.fire("Error", "Something went wrong", "error");
        }

    });
});

document.addEventListener("click", async function (e) {

    const plusBtn = e.target.closest(".qty-plus");
    const minusBtn = e.target.closest(".qty-minus");

    if (!plusBtn && !minusBtn) return;

    const button = plusBtn || minusBtn;
    const cartItem = button.closest(".cart-item");

    const productId = cartItem.querySelector(".remove-cart-item").dataset.product;
    const variantId = cartItem.querySelector(".remove-cart-item").dataset.variant;

    const type = plusBtn ? "inc" : "dec";

    try {

        const response = await fetch("/cart/update-quantity", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, variantId, type })
        });

        const data = await response.json();

        if (!data.success) {
            return triggerToast(data.message, "error");
        }
        updateCartUI(cartItem, data.quantity, type);

    } catch (err) {
        triggerToast("Something went wrong", "error");
    }
})

async function goToCheckout(){

    const response = await fetch("/checkout-from-cart",{
        method:"POST",
        
    });

    if (response.status === 401) {
        return window.location.href="/login";
    }

    const data = await response.json();

    if(data.success){
        window.location.href="/checkout";
    }else{
        triggerToast(data.message || "Something went wrong","error");
    }
}

function updateCartUI(cartItem, newQty) {

    const qtyInput = cartItem.querySelector(".qty-input");
    const itemTotalEl = cartItem.querySelector(".item-total");
    const wrapper = cartItem.querySelector(".quantity-wrapper");

    const minusBtn = cartItem.querySelector(".qty-minus");
    const plusBtn = cartItem.querySelector(".qty-plus");

    qtyInput.value = newQty;

    const final = Number(wrapper.dataset.final);

    const newTotal = final * newQty;
    itemTotalEl.innerText = "₹" + newTotal.toLocaleString();

    minusBtn.disabled = newQty <= 1;
    plusBtn.disabled = newQty >= 10;


    updateSummary();
}

function updateSummary() {

    const cartItems = document.querySelectorAll(".cart-item");

    let totalItems = 0;
    let totalMRP = 0;
    let totalDiscount = 0;
    let grandTotal = 0;

    cartItems.forEach(item => {

        const qty = Number(item.querySelector(".qty-input").value);

        const wrapper = item.querySelector(".quantity-wrapper");

        const original = Number(wrapper.dataset.original);
        const final = Number(wrapper.dataset.final);
        const discount = Number(wrapper.dataset.discount);

        totalItems += qty;
        totalMRP += original * qty;
        totalDiscount += discount * qty;
        grandTotal += final * qty;
    });

    document.getElementById("summary-items").innerText = totalItems;
    document.getElementById("summary-mrp").innerText = totalMRP.toLocaleString();
    document.getElementById("summary-discount").innerText = totalDiscount.toLocaleString();
    document.getElementById("summary-total").innerText = grandTotal.toLocaleString();
    document.getElementById("summary-save").innerText = totalDiscount.toLocaleString();


    const cartBadge = document.querySelector(".cart-badge");
    const cartSidebarBadge = document.querySelector(".cart-sidebar-badge");

    if (cartBadge) cartBadge.innerText = totalItems;
    if (cartSidebarBadge) cartSidebarBadge.innerText = totalItems;
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