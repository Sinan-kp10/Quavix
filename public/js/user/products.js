
const filterToggleBtn = document.getElementById('filterToggle');
const filterSidebar = document.getElementById('filterSidebar');
const filterCloseBtn = document.getElementById('filterClose');
const filterOverlay = document.querySelector('.filter-overlay');

if (filterToggleBtn && filterSidebar && filterOverlay && filterCloseBtn) {

    const openFilters = () => {
        filterSidebar.classList.add('active');
        filterOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeFilters = () => {
        filterSidebar.classList.remove('active');
        filterOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    filterToggleBtn.addEventListener('click', openFilters);
    filterCloseBtn.addEventListener('click', closeFilters);
    filterOverlay.addEventListener('click', closeFilters);
}


let currentPage = 1;

document.querySelector(".btn-filter-apply").addEventListener("click", () => {
        currentPage = 1;
        applyFilters();
});

function applyFilters(page = 1) {

    currentPage = page;

    const categories = [...document.querySelectorAll(".category-filter:checked")]
        .map(cb => cb.value);

    const sort = document.querySelector("input[name='sort']:checked")?.value;
    const minPrice = document.getElementById("rangeMin").value;
    const maxPrice = document.getElementById("rangeMax").value;

    const params = new URLSearchParams();

    if (categories.length > 0)
        params.append("categories", categories.join(","));

    if (sort)
        params.append("sort", sort);

    if (minPrice)
        params.append("minPrice", minPrice);

    if (maxPrice)
        params.append("maxPrice", maxPrice);

    params.append("page", currentPage);

    fetch("/products/filter?" + params.toString())
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                renderProducts(data.products);
                renderPagination(data.totalPages, data.currentPage);
            }
        });
}
const rangeMin = document.getElementById("rangeMin");
const rangeMax = document.getElementById("rangeMax");

const minValue = document.getElementById("minValue");
const maxValue = document.getElementById("maxValue");

if (rangeMin && rangeMax) {

    rangeMin.addEventListener("input", () => {

        if (+rangeMin.value >= +rangeMax.value) {
            rangeMin.value = rangeMax.value - 1;
        }

        minValue.textContent = rangeMin.value;
    });

    rangeMax.addEventListener("input", () => {

        if (+rangeMax.value <= +rangeMin.value) {
            rangeMax.value = +rangeMin.value + 1;
        }

        maxValue.textContent = Number(rangeMax.value).toLocaleString();
    });

}
const track = document.querySelector(".slider-track");
const min = parseInt(rangeMin.min);
const max = parseInt(rangeMax.max);

function updateSliderTrack() {

    const percentMin = ((rangeMin.value - min) / (max - min)) * 100;
    const percentMax = ((rangeMax.value - min) / (max - min)) * 100;

    track.style.background = `linear-gradient(
        to right,
        #e2e8f0 ${percentMin}%,
        #6366f1 ${percentMin}%,
        #6366f1 ${percentMax}%,
        #e2e8f0 ${percentMax}%
    )`;
}

rangeMin.addEventListener("input", updateSliderTrack);
rangeMax.addEventListener("input", updateSliderTrack);

updateSliderTrack();

function renderProducts(products) {

    const grid = document.querySelector(".product-grid");
    grid.innerHTML = "";

    if (!products || products.length === 0) {
        grid.innerHTML = `
            <div class="no-products">
                <h3>No products found</h3>
            </div>
        `;
        return;
    }

    products.forEach(product => {

        const variant = product.variants?.[0];
        if (!variant) return;

        const offer = Math.max(product.offerPercentage || 0, product.category?.categoryOffer || 0);

        const finalPrice = product.finalPrice
            ? product.finalPrice
            : Math.round(variant.price - (variant.price * offer / 100));



        const attributes = variant.attributes || [];

        const colorAttr = attributes.find(a => a.name?.toLowerCase() === "color");
        const ramAttr   = attributes.find(a => a.name?.toLowerCase() === "ram");
        const romAttr   = attributes.find(a => a.name?.toLowerCase() === "rom");

        const color = colorAttr?.value || "";
        const ram   = ramAttr?.value || "";
        const rom   = romAttr?.value || "";

        const titleExtra = [color, rom].filter(Boolean).join(", ");

        let memoryHTML = "";
        let highlightLimit = 4;

        if (ram || rom) {
            memoryHTML = `<li>${[ram, rom].filter(Boolean).join(" | ")}</li>`;
            highlightLimit = 3;
        }

        const highlightsHTML = `
            ${memoryHTML}
            ${
                product.highlights?.slice(0, highlightLimit)
                    .map(h => `<li>${h}</li>`)
                    .join("") || ""
            }
        `;

        const oldPriceHTML = offer > 0
            ? `
                <div class="product-price-discount-row">
                    <span class="price-old">
                        ₹${variant.price.toLocaleString()}
                    </span>
                    <span class="discount-text">
                        ${offer}% OFF
                    </span>
                </div>
            `
            : "";

        const stock = variant.stock || 0;

        const stockHTML = stock === 0
            ? `<span class="stock-status text-red font-bold text-sm">
                    Out of Stock
            </span>`
            : "";

        grid.innerHTML += `
        <div class="product-card-horizontal">

            <div class="product-card-img-container">
                <a href="/product/${product.slug}?variant=${variant._id}">
                    <img src="${variant.images?.primary?.url || '/images/default.png'}" 
                        alt="${product.name}" 
                        class="product-card-img">
                </a>

                <button 
                    class="wishlist-btn-abs wishlist-toggle"
                    data-product="${product._id}"
                    data-variant="${variant._id}">
                    <i class="fa-regular fa-heart"></i>
                </button>
            </div>

            <div class="product-card-content">

                <div class="product-info-main">

                    <h3 class="product-title-card">
                        ${product.name}
                        ${titleExtra ? `(${titleExtra})` : ""}
                    </h3>



                    <ul class="product-highlights">
                        ${highlightsHTML}
                    </ul>

                </div>

                <div class="product-info-price">

                    <div class="product-price-row">
                        <span class="price-lg">
                            ₹${finalPrice.toLocaleString()}
                        </span>

                    </div>

                    ${oldPriceHTML}

                    ${stockHTML}

                </div>

            </div>

        </div>
        `;
    });
}


//pagination
function renderPagination(totalPages, currentPage) {

    const container = document.querySelector(".pagination");
    container.innerHTML = "";

    if (totalPages <= 1) return;

    if (currentPage > 1) {
        container.innerHTML += `
            <a href="#" class="page-link" data-page="${currentPage - 1}">
                <i class="fa-solid fa-chevron-left"></i>
            </a>
        `;
    }

    for (let i = 1; i <= totalPages; i++) {
        container.innerHTML += `
            <a href="#" 
            class="page-link ${i === currentPage ? 'active' : ''}"
            data-page="${i}">
                ${i}
            </a>
        `;
    }

    if (currentPage < totalPages) {
        container.innerHTML += `
            <a href="#" class="page-link" data-page="${currentPage + 1}">
                <i class="fa-solid fa-chevron-right"></i>
            </a>
        `;
    }
}

document.addEventListener("click", function (e) {

    const link = e.target.closest(".page-link");
    if (!link) return;

    e.preventDefault();

    const page = link.dataset.page;
    applyFilters(page);
});


document.getElementById("clearFilters").addEventListener("click", () => {

    document.querySelectorAll(".category-filter")
        .forEach(cb => cb.checked = false);

    document.querySelectorAll("input[name='sort']")
        .forEach(rb => rb.checked = false);

    document.getElementById("rangeMin").value = "<%= minPrice %>";
    document.getElementById("rangeMax").value = "<%= maxPrice %>";

    window.location.href = "/products";

});

const navbarSearch = document.getElementById("navbarSearch");

if (navbarSearch) {
    navbarSearch.addEventListener("keypress", async function (e) {
        if (e.key === "Enter") {
            const query = this.value.trim();
            const response = await fetch("/products/search?q=" + query);
            const data = await response.json();

            if (data.success) {
                renderProducts(data.products);
            }
        }
    });
}

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
})

function updateWishlistBadge(count) {

    const containers = document.querySelectorAll(".wishlist-nav");

    containers.forEach(container => {

        let badge = container.querySelector(".wishlist-badge");

        if (count > 0) {
            if (badge) {
                badge.innerText = count;
            } else {
                badge = document.createElement("span");
                badge.className = "badge wishlist-badge";
                badge.innerText = count;
                container.appendChild(badge);
            }
        } else {
            if (badge) badge.remove();
        }

    });
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
