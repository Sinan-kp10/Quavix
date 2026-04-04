document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.mobile-sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    const closeBtn = document.querySelector('.close-btn');

    if (hamburger && sidebar && overlay && closeBtn) {


        hamburger.addEventListener('click', () => {
            console.log('Opening Sidebar');
            sidebar.classList.add('active');
            overlay.classList.add('active'); 
            document.body.style.overflow = 'hidden'; 
        });


        const closeSidebar = () => {
            console.log('Closing Sidebar');
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = ''; 
        };


        closeBtn.addEventListener('click', closeSidebar);


        overlay.addEventListener('click', closeSidebar);


        document.querySelectorAll('.sidebar-content a').forEach(link => {
            link.addEventListener('click', closeSidebar);
        });
    }



})

function increaseCartBadge(qty = 1) {

    const desktopBadge = document.getElementById("cartBadge");
    const mobileBadge = document.getElementById("cartSidebarBadge");

    if (desktopBadge) {
        let count = parseInt(desktopBadge.innerText || 0);
        desktopBadge.innerText = count + qty;
        desktopBadge.style.display = "inline-block";
    }

    if (mobileBadge) {
        let count = parseInt(mobileBadge.innerText || 0);
        mobileBadge.innerText = count + qty;
        mobileBadge.style.display = "inline-block";
    }
}
