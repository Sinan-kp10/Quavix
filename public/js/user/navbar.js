document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.mobile-sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    const closeBtn = document.querySelector('.close-btn');

    if (hamburger && sidebar && overlay && closeBtn) {

        // Open Sidebar
        hamburger.addEventListener('click', () => {
            console.log('Opening Sidebar');
            sidebar.classList.add('active');
            overlay.classList.add('active'); // Fade in overlay
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });

        // Close functions
        const closeSidebar = () => {
            console.log('Closing Sidebar');
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        };

        // Close on Button Click
        closeBtn.addEventListener('click', closeSidebar);

        // Close on Overlay Click
        overlay.addEventListener('click', closeSidebar);

        // Close when clicking a link
        document.querySelectorAll('.sidebar-content a').forEach(link => {
            link.addEventListener('click', closeSidebar);
        });
    }

});
