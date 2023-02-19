var placesLocation = new Set();

$(document).ready(init);

function init() {
    addPointMenu();
    buildRouteButton.onclick = buildRoute;
    nextRouteButton.onclick = function () { imap.nextRoute(); }
    tableImage.onclick = MapTableSwitch;
    clearList.onclick = function () {
        const checkboxes = document.querySelectorAll('#isVisit');

        checkboxes.forEach(function callback(checkbox, index, array) {
            checkbox.checked = false;
        });
        placesLocation.clear();
    };

    clearMap.onclick = function () { imap.clearLastRoute(); }
}

// Передает данные с html страницы в функцию построения маршрута.
function buildRoute() {
    timeLimit = document.getElementById('timeLimit').value;

    var canBuild = generateRoute(timeLimit, Array.from(placesLocation));

    // TODO: Не работает пока не исправлена асинхронка.
    if (canBuild === false) {
        alert('Не удалось построить маршрут.');
    }
}

// Сохранение маршрута.
function saveRoute() {
    if (imap.currentRout.exists() === false) {
        return;
    }

    const date = new Date();
    const dateFormat = `${date.toLocaleString()}`.slice(0, -3);

    addRouteInTable(dateFormat, imap.currentRout.pointsCount,
        imap.currentRout.timeLenght, imap.currentRout.length, imap.currentRout.get());

    imap.saveRoute();
}

// Удаление маршрута.
function removeRoute(element) {
    element.closest('#route').remove();
}

// Занесение маршрута в таблицу(до обновления страницы).
function addRouteInTable(date, count, time, length, pointsLocation) {
    const placeHolder = document.querySelector('#table');
    const template = document.querySelector('#routeTemplate');

    const routeDiv = template.content.querySelector('#route');
    const dateRoute = template.content.querySelector('#dateRouteData');
    const pointsCount = template.content.querySelector('#pointsCountData');
    const routeTime = template.content.querySelector('#routeTimeData');
    const routeLenght = template.content.querySelector('#routeLenghtData');

    routeDiv.dataset.pointsLocation = JSON.stringify(pointsLocation);
    dateRoute.textContent = `${date}`;
    pointsCount.textContent = `Кол-во точек: ${count} шт`;
    routeTime.textContent = `${time}`;
    routeLenght.textContent = `${length} км`;

    const route = template.content.cloneNode(true);
    placeHolder.appendChild(route);
}

// Отрисовка маршруты из таблицы.
function showRoute(element) {
    var pointsLocation = JSON.parse(element.closest('#route').dataset.pointsLocation);

    imap.currentRout.routeList = [pointsLocation];
    imap.displayRoute();
    MapTableSwitch();
}

// Заполнение меню выбора обязательных посещений.
function addPointMenu() {
    const placeHolder = document.querySelector('#points');
    const template = document.querySelector('#pointTemplate');

    const div = template.content.querySelector('div');
    const text = div.querySelector('a');

    let point = template.content.cloneNode(true);

    for (var i = 0; i < groups.length; i++) {
        for (var k = 0; k < groups[i].items.length; k++) {
            var item = groups[i].items[k];

            text.textContent = item.name;
            div.dataset.location = item.center;
            div.id = 'point';

            point = template.content.cloneNode(true);
            placeHolder.appendChild(point);
        }
    }


    const checkboxes = document.querySelectorAll('#isVisit');
    checkboxes.forEach(function callback(checkbox, index, array) {
        checkbox.onclick = function () {
            const location = this.parentElement.dataset.location;
            if (this.checked) {
                placesLocation.add(location);
            }
            else {
                placesLocation.delete(location);
            }
        };
    });
}

// Переключение между картой и таблицей.
function MapTableSwitch() {
    if (map.style.display != 'none') {
        map.style.display = 'none';
        table.style.display = 'revert';
    }
    else {
        map.style.display = 'revert';
        table.style.display = 'none';
    }
}

function redirectCheck() {
    var data = localStorage.getItem('route');
    if (data !== null) {
        imap.currentRout.routeList = [JSON.parse(data)];
        imap.displayRoute();
        localStorage.removeItem('route');
    }
}