function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

function toggleNotifications() {
    document.getElementById('notificationDropdown').classList.toggle('active');
}

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

window.onclick = function (e) {
    if (e.target.classList.contains('modal-orders')) {
        e.target.classList.remove('active');
    }

    if (!e.target.closest('.notification-wrapper')) {
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown && dropdown.classList.contains('active')) {
            dropdown.classList.remove('active');
        }
    }
}