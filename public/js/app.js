const sidebar = document.getElementById('sidebar');
const collapseBtn = document.getElementById('collapseBtn');
const darkToggle = document.getElementById('darkModeToggle');

collapseBtn.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-collapsed');
    if (sidebar.classList.contains('sidebar-collapsed')) {
        sidebar.style.width = '4rem'; 
    } else {
        sidebar.style.width = '16rem'; 
    }
});

if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
}

darkToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    if (document.documentElement.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});
