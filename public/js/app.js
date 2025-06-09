const sidebar = document.getElementById('sidebar');
const collapseBtn = document.getElementById('collapseBtn');

const toggle = document.getElementById('darkModeToggle');
const thumb = document.getElementById('toggleThumb');
const html = document.documentElement;

collapseBtn.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-collapsed');
    if (sidebar.classList.contains('sidebar-collapsed')) {
        sidebar.style.width = '4rem';
    } else {
        sidebar.style.width = '16rem';
    }
});

if (localStorage.getItem('theme') === 'dark') {
    html.classList.add('dark');
    thumb.classList.add('translate-x-6');
    thumb.textContent = '🌙';
}

toggle.addEventListener('click', () => {
    const isDark = html.classList.toggle('dark');
    thumb.classList.toggle('translate-x-6', isDark);
    thumb.textContent = isDark ? '🌙' : '🌞';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
