function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

function handleFilter(value) {

    if (value === "custom") {

        const customRange = document.getElementById("customDateRange");

        customRange.style.display = "flex";

        document.querySelector('input[name="startDate"]').value = "";
        document.querySelector('input[name="endDate"]').value = "";

        return;
    }

    document.querySelector("form").submit();
}

function toggleCustomDateRange() {
    const select = document.getElementById('dateRangeSelect');
    const customRange = document.getElementById('customDateRange');

    if (!select) return;

    if (select.value === 'custom') {
        customRange.style.display = 'flex';
    } else {
        customRange.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('dateRangeSelect');
    const customRange = document.getElementById('customDateRange');

    if (select && select.value === 'custom') {
        customRange.style.display = 'flex';
    }
});