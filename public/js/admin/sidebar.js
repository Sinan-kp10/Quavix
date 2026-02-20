
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.getElementById('sidebarOverlay').classList.toggle('active');
    }

function toggleClearButton(input) {
    const clearBtn = input.nextElementSibling;
    if (input.value.length > 0) {
         clearBtn.classList.add('active');
    } else {
        clearBtn.classList.remove('active');
    }
}

function clearSearch(){
    const input = document.getElementById('searchInput');
    input.value = '';
     document.getElementById('searchClear').classList.remove('active');
    input.focus();
}
