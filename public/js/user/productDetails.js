document.addEventListener("DOMContentLoaded", () => {
    const badge = document.getElementById("cartBadge");
    const sidebarBadge = document.getElementById("cartSidebarBadge");

    if (badge && Number(badge.innerText) === 0) {
        badge.style.display = "none";
    }

    if (sidebarBadge && Number(sidebarBadge.innerText) === 0) {
        sidebarBadge.style.display = "none";
    }
});
const mainImageContainer = document.querySelector('.main-image-container');

if (mainImageContainer) {
    const mainImage = mainImageContainer.querySelector('img');

    if (mainImage) {
        mainImageContainer.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = mainImageContainer.getBoundingClientRect();
            const x = e.clientX - left;
            const y = e.clientY - top;

            const xPercent = (x / width) * 100;
            const yPercent = (y / height) * 100;

            mainImage.style.transformOrigin = `${xPercent}% ${yPercent}%`;
            mainImage.style.transform = 'scale(2.5)'; 
        });

        mainImageContainer.addEventListener('mouseleave', () => {

            mainImage.style.transformOrigin = 'center center';
            mainImage.style.transform = 'scale(1)';
        });
    }
}


document.querySelectorAll(".color-swatch").forEach(btn => {
    const color = btn.getAttribute("data-color");
    if (color) {
        btn.style.backgroundColor = color;
    }
});

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
            triggerToast(data.message || "Please login to use wishlist", "error");
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
            updateWishlistBadge(data.wishlistCount);

            triggerToast(data.message, "success");

        } else {
            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");
            icon.style.color = "#cbd5e1";
            updateWishlistBadge(data.wishlistCount);

            triggerToast(data.message, "error");
        }

    } catch (err) {
        triggerToast("Server error", "error");
    }
});


//cart
document.addEventListener("click", async function (e) {

    const button = e.target.closest(".add-to-cart-btn");
    if (!button) return;

    const productId = button.dataset.product;
    const variantId = button.dataset.variant;

    try {

        const response = await fetch("/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ productId, variantId })
        });

        const data = await response.json();


        if (response.status === 401) {
            
            return window.location.href="/login"
        }
        if (response.status === 400) {
            const msg = data.message ? data.message.toLowerCase() : "";
            if (msg.includes("out of stock") || msg.includes("available in stock")) {
                triggerToast(data.message, "error");
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
            return;
        }

        if (!data.success) {
            triggerToast(data.message || "Fialed to add to cart", "error");
            return;
        }

        triggerToast(data.message, "success");
        updateCartBadge(data.cartCount);

    } catch (error) {
        triggerToast("Something went wrong", "error");
    }

});
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


function changeImage(element) {

    const mainImage = document.getElementById("mainProductImage");
    const newSrc = element.querySelector("img").src;

    mainImage.style.opacity = 0;

    setTimeout(() => {
        mainImage.src = newSrc;
        mainImage.style.opacity = 1;
    }, 150);

    document.querySelectorAll(".thumbnail-item").forEach(item => {
        item.classList.remove("active");
    });


    element.classList.add("active");
}

async function buyNow(variantId){

    const response = await fetch("/buy-now",{
        method:"POST",
        headers: { "Content-Type": "application/json" },
        body:JSON.stringify({variantId})
    });

    if (response.status === 401) {
        return window.location.href="/login";
    }

    const data = await response.json();

    if(data.success){
        window.location.href="/checkout";
    }else{
        if (data.message && data.message.toLowerCase().includes("out of stock")) {
            triggerToast(data.message, "error");
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
    }
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