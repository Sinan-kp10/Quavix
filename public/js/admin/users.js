
function showToast(message, type = "success") {
    let toast = document.getElementById("toast");


    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }

    toast.innerHTML = message;
    toast.className = `toast ${type}`;


    setTimeout(() => {
        toast.classList.add("show");
    }, 100);

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


async function confirmBlock(userId) {
    const result = await Swal.fire({
        title: "Are you sure?",
        text: "User will be blocked!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes"
    });

    if (!result.isConfirmed) return;

    try {
        const res = await fetch(`/admin/users/block/${userId}`, {
            method: "PATCH"
        });

        const data = await res.json();

        if (data.success) {
            updateUserRow(userId, "blocked");
            showToast("User blocked successfully", "success");
        } else {
            showToast("Failed to block user", "error");
        }

    } catch (err) {
        console.log(err);
        showToast("Something went wrong", "error");
    }
}

async function confirmUnblock(userId) {
    const result = await Swal.fire({
        title: "Are you sure?",
        text: "User will be unblocked!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes"
    });

    if (!result.isConfirmed) return;

    try {
        const res = await fetch(`/admin/users/unblock/${userId}`, {
            method: "PATCH"
        });

        const data = await res.json();

        if (data.success) {
            updateUserRow(userId, "active");
            showToast("User unblocked successfully", "success");
        } else {
            showToast("Failed to unblock user", "error");
        }

    } catch (err) {
        console.log(err);
        showToast("Something went wrong", "error");
    }
}

function updateUserRow(userId, status) {
    const rows = document.querySelectorAll("tbody tr");

    rows.forEach(row => {
        const button = row.querySelector("button");

        if (button && button.getAttribute("onclick")?.includes(userId)) {

            const statusCell = row.children[3];

            if (status === "blocked") {
                statusCell.innerHTML = `<span class="status-badge status-danger">Blocked</span>`;
                button.className = "btn btn-success btn-sm";
                button.innerText = "Unblock";
                button.setAttribute("onclick", `confirmUnblock('${userId}')`);
            } else {
                statusCell.innerHTML = `<span class="status-badge status-success">Active</span>`;
                button.className = "btn btn-danger btn-sm";
                button.innerText = "Block";
                button.setAttribute("onclick", `confirmBlock('${userId}')`);
            }
        }
    });
}