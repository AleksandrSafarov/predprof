document.addEventListener('DOMContentLoaded', function () {
    menu.onclick = displayMobileNavMenu;
});

/* Отображение или скрытие адаптивного меню навигации. */
function displayMobileNavMenu() {
    var x = document.getElementById('navMobileMenu')
    if (x.className === 'nav-mobile-menu') {
        x.className += ' on';
    } else {
        x.className = 'nav-mobile-menu';
    }
}