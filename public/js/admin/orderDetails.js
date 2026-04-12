function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}
function handleReturn(action) {
        if (action === 'reject') {
        openRejectModal();

    }
}
function openRejectModal() {
    document.getElementById('rejectModal').classList.add('active');
    document.getElementById('rejectReason').focus();
}
let currentRejectForm = null;


document.addEventListener("click", function(e){

    const rejectBtn = e.target.closest(".reject-btn");

    if(rejectBtn){
        currentRejectForm = rejectBtn.closest("form"); 
        openRejectModal();
    }

});
function closeRejectModal() {
    document.getElementById('rejectModal').classList.remove('active');
    document.getElementById('rejectReason').value = '';
}
function submitRejection() {

    const reasonInput = document.getElementById('rejectReason');
    const reason = reasonInput.value.trim();

    if (!reason || reason.length < 3) {
        showError(reasonInput, 'Please provide a reason for rejection');
        return;
    }

    currentRejectForm.querySelector("input[name='rejectReason']").value = reason;
    currentRejectForm.submit();
}

    
function showError(input, message) {
    input.classList.add("input-error");
    const errorText = input.closest(".form-group").querySelector(".error-message");
    if (errorText) {
        errorText.innerText = message;
    }
}

function clearErrors() {
    document.querySelectorAll(".error-message").forEach(e => {
        e.innerText = "";
    });

    document.querySelectorAll(".form-input").forEach(e => {
        e.classList.remove("input-error");
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

document.addEventListener("click", function(e){

    const approveBtn = e.target.closest(".approve-btn");
    const rejectBtn = e.target.closest(".reject-btn");

    if(approveBtn){

        const form = approveBtn.closest("form");

        Swal.fire({
            title: "Approve Return?",
            text: "Are you sure you want to approve this return request?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, approve it"
        }).then((result)=>{
            if(result.isConfirmed){
                form.submit();
            }
        });

    }

});