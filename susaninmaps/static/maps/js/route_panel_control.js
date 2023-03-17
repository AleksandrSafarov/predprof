const csrftoken = getCookie('csrftoken');
var imap;
ymaps.ready(init);

function init() {
    var map = new ymaps.Map('map',
        {
            center: [55.831, 37.629],
            zoom: 15,
            controls: ['smallMapDefaultSet']
        },
        {
            searchControlProvider: 'yandex#search',
            restrictMapArea: [
                [55.842, 37.604],
                [55.821, 37.651]
            ]
        });

    imap = new IMap(map);
    redirectCheck();
}

async function generateRoute(time, points) {
    // TODO: исправить асинхронку и переместить alert в sript.js.
    var rez = {}
    rez = await postData('def/', { 'point': points, 'time': time, state: 'inactive' });

    clearInformation();
    imap.clearLastRoute();

    var canBuild = (Object.keys(rez).length != 0);
    if (canBuild === false) {
        alert('Не удалось построить маршрут. Увеличьте время.');
        return false;
    }

    new_routes = []
    for (let i in rez) {
        new_routes.push(rez[i])
    }

    imap.currentRout.updateRouteList(new_routes);

    imap.displayRoute();

    return true;
}

// Вывод информации на html страницу.
function displayInformation(pointsCount, timeroute, lenroute) {
    document.querySelector('#pointsCount').textContent = `Кол-во точек: ${pointsCount} шт`;
    document.querySelector('#time').textContent = `Время: ${timeroute}`;
    document.querySelector('#lenght').innerText = `Длина: ${lenroute}`;
}

// Очищаем информацию на html странице.
var clearInformation = function () {
    displayInformation('0', '0 мин', '0 км');
};


// Работа с сервером.
const postData = async (url = '', data = {}) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


class IMap {
    #multiRoute;

    currentRout = {
        indexCurrentRoute: 0,
        routeList: [],
        routeColors: [
            ['#BD0202', '#E63E92'],
            ['', '']
        ],

        length: 0,
        timeLenght: 0,

        next() {
            if (this.indexCurrentRoute < this.routeList.length - 1) { this.indexCurrentRoute += 1; }
            else { this.indexCurrentRoute = 0; }
        },

        updateRouteList(routeList) {
            this.routeList = routeList;
            this.indexCurrentRoute = 0;
        },

        getColor() {
            const i = this.indexCurrentRoute % this.routeColors.length;
            return this.routeColors[i];
        },

        getPointsCount() { return this.routeList[this.indexCurrentRoute].length; },

        get() { return this.routeList[this.indexCurrentRoute]; },

        exists() {
            if (this.get() === undefined) {
                alert('Не выбран маршрут!');
                return false;
            }
            return true;
        }
    };

    constructor(map) {
        this.map = map;

        this.#syncLiksWithPoints();
    }

    nextRoute() {
        this.currentRout.next();
        this.displayRoute();
    }

    /* Отрисовка маршрута на карте. */
    displayRoute() {
        if (this.currentRout.exists() === false) {
            return;
        }

        this.clearLastRoute();

        this.#multiRoute = new ymaps.multiRouter.MultiRoute(
            {
                referencePoints: this.currentRout.get(),
                params: {
                    routingMode: 'pedestrian'
                }
            },
            {
                wayPointStartIconColor: '#333',
                wayPointStartIconFillColor: '#B3B3B3',

                routeStrokeWidth: 2,
                routeStrokeColor: this.currentRout.getColor(),
                routeActiveStrokeWidth: 6,
                routeActiveStrokeColor: this.currentRout.getColor(),

                routeActivePedestrianSegmentStrokeStyle: this.currentRout.getColor(),
                routeActivePedestrianSegmentStrokeColor: this.currentRout.getColor(),
                boundsAutoApply: true
            });

        this.map.geoObjects.add(this.#multiRoute);

        this.#multiRoute.model.events.add(
            'requestsuccess',
            function (event) {
                const routeProperties = event.get('target').getRoutes()[0].properties;
                imap.currentRout.length = routeProperties.get('distance').text;
                imap.currentRout.timeLenght = routeProperties.get('duration').text.slice(0, -1);
                imap.saveRoute(true);
                displayInformation(
                    imap.currentRout.getPointsCount(),
                    imap.currentRout.timeLenght,
                    imap.currentRout.length
                );
            }
        ).add('requestfail', function (event) {
            console.log('Error: ' + event.get('error').message);
        });
    }

    /* Сохранение маршрута в базе данных. */
    saveRoute(toHistory = false) {
        if (this.currentRout.exists() === false) {
            return;
        }
        const date = new Date();
        const dateFormat = `${date.toLocaleString()}`.slice(0, -3);

        var path = 'save/';
        if (toHistory) { path = 'saveToHistory/'; }

        var userInfo =  document.getElementById("userInfo").innerText
        
        return postData(path, {
            "route": JSON.stringify(this.currentRout),
            "date": dateFormat,
            "pointsCount": this.currentRout.getPointsCount(),
            "userInfo": userInfo,
            state: 'inactive'
        });
    }

    /* Синхронизация ссылок меню с точками на карте. */
    #syncLiksWithPoints() {
        const pointText = document.querySelectorAll('#point');
        const collection = new ymaps.GeoObjectCollection(null, { preset: ' ' });
        this.map.geoObjects.add(collection);

        pointText.forEach(function callback(pointText, index, array) {
            const pointTextLink = pointText.querySelector('a');
            const location = pointTextLink.parentElement.dataset.location.split(',');
            const name = pointTextLink.textContent;

            const placemark = new ymaps.Placemark(location, { balloonContent: name });

            placemark.options.set('visible', false);
            collection.add(placemark);

            pointTextLink.onclick = function () {
                if (placemark.balloon.isOpen()) { placemark.balloon.close(); }
                else { placemark.balloon.open(); }
            };
        });
    }

    clearLastRoute = function () { this.map.geoObjects.remove(this.#multiRoute); };
}