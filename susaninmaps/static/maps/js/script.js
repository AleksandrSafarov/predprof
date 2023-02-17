var placesLocation = new Set();

$(document).ready(init);

function init() {
    addPointMenu();
    buildRouteButton.onclick = buildRoute;
    nextRouteButton.onclick = function() { imap.nextRoute(); };
    saveRouteButton.onclick = function() { imap.saveRoute(); };
    tableImage.onclick = function()
    {
        if(map.style.display != "none"){
            map.style.display = "none";
            table.style.display = "revert";
        }
        else{
            map.style.display = "revert";
            table.style.display = "none";
        }
    };
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

// Заполнение меню выбора обязательных посещений.
function addPointMenu() {
    const placeHolder = document.querySelector('#points');
    const template = document.querySelector('#point');

    const div = template.content.querySelector('div');
    const text = div.querySelector('a');

    let point = template.content.cloneNode(true);

    var idIndex = 0;
    for (var i = 0; i < groups.length; i++) {
        for (var k = 0; k < groups[i].items.length; k++) {
            var item = groups[i].items[k];

            text.textContent = item.name;
            div.dataset.location = item.center;
            div.id = `point${idIndex}`

            point = template.content.cloneNode(true);
            placeHolder.appendChild(point);
            
            document.querySelector(`#point${idIndex}`).querySelector(`input`).onclick = function () {
                const location = this.parentElement.dataset.location;
                if (this.checked) {
                    placesLocation.add(location);
                }
                else {
                    placesLocation.delete(location);
                }
            };

            idIndex += 1;
        }
    }
}