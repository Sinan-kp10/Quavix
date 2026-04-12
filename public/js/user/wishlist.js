document.addEventListener("click", async function (e) {

    const button = e.target.closest(".btn-remove");
    if (!button) return;

    const productId = button.dataset.product;
    const variantId = button.dataset.variant;

    const result = await Swal.fire({
        title: "Remove from Wishlist?",
        text: "This product will be removed from your wishlist.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#6C5CE7",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, remove it!",
        cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    try {

        const response = await fetch("/wishlist/remove", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                productId,
                variantId
            })
        });

        const data = await response.json();

        if (data.success) {

            const item = button.closest(".wishlist-item");


            item.style.transition = "0.3s";
            item.style.opacity = "0";
            item.style.transform = "scale(0.95)";
            setTimeout(() => {
                const count = getWishlistCount() - 1;
                updateWishlistBadge(count);
            }, 0);

            setTimeout(() => {
                item.remove();
            }, 300);

            Swal.fire({
                icon: "success",
                title: "Removed!",
                text: "Product removed from wishlist.",
                timer: 1500,
                showConfirmButton: false
            });

        } else {
            Swal.fire("Error", "Failed to remove item", "error");
        }

    } catch (error) {
        console.error(error);
        Swal.fire("Error", "Something went wrong!", "error");
    }

})

//cart and wishlist

document.addEventListener("click", async function (e) {

    const cartBtn = e.target.closest(".move-to-cart");
    if (!cartBtn) return;

    const productId = cartBtn.dataset.product;
    const variantId = cartBtn.dataset.variant;

    try {

        cartBtn.disabled = true;

        const response = await fetch("/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ productId, variantId })
        });

        const data = await response.json();

        if (response.status === 401) {
            triggerToast("Login required", "error");
            cartBtn.disabled = false;
            return;
        }

        if (response.status === 400) {
            const msg = data.message ? data.message.toLowerCase() : "";
            if (msg.includes("out of stock") || msg.includes("available in stock")) {
                triggerToast(data.message, "error");
                cartBtn.disabled = false;
                return;
            }

            Swal.fire({
                icon: "error",
                title: "Unavailable",
                text: data.message || "This product is currently not available.",
                confirmButtonColor: "#6C5CE7",
                confirmButtonText: "Go to Shop"
            }).then(() => {
                window.location.href = "/products";
            });
            cartBtn.disabled = false;
            return;
        }


        if (!data.success) {
            triggerToast(data.message || "Failed to add to cart", "error");
            cartBtn.disabled = false;
            return;
        }

        triggerToast("Product moved to cart!", "success");
        updateCartBadge(data.cartCount);

        function updateCartBadge(count) {

            const badge = document.getElementById("cartBadge");
            const sidebarBadge = document.getElementById("cartSidebarBadge");

            if (badge){
                badge.innerText = count;
                badge.style.display = count > 0 ? "inline-block" : "none";
            }

            if (sidebarBadge){
                sidebarBadge.innerText = count;
                sidebarBadge.style.display = count > 0 ? "inline-block" : "none";
            } 
        }

        const removeRes = await fetch("/wishlist/remove", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ productId, variantId })
        });

        const removeData = await removeRes.json();

        const itemCard = cartBtn.closest(".wishlist-item");

        if (itemCard) {
            itemCard.remove(); 

            const count = getWishlistCount(); 
            updateWishlistBadge(count);       
        }

    } catch (err) {
        triggerToast("Something went wrong", "error");
        cartBtn.disabled = false;
    }

})
function updateWishlistBadge(count) {

    const badges = document.querySelectorAll(".wishlist-nav");

    badges.forEach(container => {

        let badge = container.querySelector(".wishlist-badge, .wishlist-sidebar-badge");

        if (count > 0) {
            if (badge) {
                badge.innerText = count;
                badge.style.display = "inline-block";
            } else {
                const span = document.createElement("span");
                span.className = "badge wishlist-badge";
                span.innerText = count;
                container.appendChild(span);
            }
        } else {
            if (badge) badge.style.display = "none";
        }

    });
}
function getWishlistCount() {
    return document.querySelectorAll(".wishlist-item").length;
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
document.addEventListener("DOMContentLoaded", () => {
    const badge = document.getElementById("cartBadge");

    if (badge && Number(badge.innerText) === 0) {
        badge.style.display = "none";
    }
});