function confirmBlock(id) {
    Swal.fire({
        title: "Are you sure?",
        text: "User will be blocked!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes"
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "/admin/block/" + id;
        }
    });
}

function confirmUnblock(id) {
    Swal.fire({
        title: "Are you sure?",
        text: "User will be unblocked!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes"
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "/admin/unblock/" + id;
        }
    });
}
