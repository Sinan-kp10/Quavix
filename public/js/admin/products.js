function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.getElementById('sidebarOverlay').classList.toggle('active');
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

document.querySelectorAll(".delete-btn").forEach(button => {

button.addEventListener("click", function () {

    const productId = this.dataset.id;
    const isDeleted = this.dataset.status=="false";


    Swal.fire({
        title: "Are you sure?",
        text: isDeleted 
            ? "This Product will be set to Inactive!"
            : "This Product will be restored!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: isDeleted ? "#d33" : "#28a745",
        cancelButtonColor: "#3085d6",
        confirmButtonText: isDeleted
            ? "Yes, deactivate!"
            : "Yes, restore!",
        reverseButtons: true
    }).then((result) => {

        if (result.isConfirmed) {

            const form = document.createElement("form");
            form.method = "POST";
            form.action = `/admin/products/delete/${productId}`;

            document.body.appendChild(form);
            form.submit();
        }

    });

});

});