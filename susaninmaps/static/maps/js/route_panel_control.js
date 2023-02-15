const csrftoken = getCookie('csrftoken');
var imap;
ymaps.ready(init);

let new_routes = []
let fillroute = [['#000088', '#E63E92'], ['#ff9baa', '#E63E92'], ['#6a38ff', '#E63E92'], ['#0f93ff', '#E63E92'], ['#00856f', '#E63E92']]//цвета маршрутов
let k = 0

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
}

async function generateRoute(time, points) {
    // TODO: исправить асинхронку и переместить alert в sript.js.
    var rez = {}
    rez = await postData('def/', { 'point': points, 'time': time, state: 'inactive' });

    var canBuild = (Object.keys(rez).length != 0);

    if (canBuild === false) {
        alert('Не удалось построить маршрут.');
    }
    new_routes = []
    for (let i in rez) {
        new_routes.push(rez[i])
    }
    k = 0;
    imap.displayRoute();

    return true;
}

// Вывод информации на html страницу.
function displayInformation(pointsCount, timeroute, lenroute) {
    document.querySelector('#pointsCount').textContent = `Кол-во точек: ${pointsCount} шт`;
    document.querySelector('#time').textContent = `Время: ${timeroute}`;
    document.querySelector('#lenght').innerText = `Длина: ${lenroute}`;
}


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

    constructor(map) {
        this.map = map;

        this.#syncLiksWithPoints();
    }

    /* Отрисовка маршрута на карте. */
    displayRoute() {
        this.#clearLastRoute();

        this.#multiRoute = new ymaps.multiRouter.MultiRoute(
            {
                referencePoints: new_routes[k],
                params: {
                    routingMode: 'pedestrian'
                }
            },
            {
                wayPointStartIconColor: '#333',
                wayPointStartIconFillColor: '#B3B3B3',

                routeStrokeWidth: 2,
                routeStrokeColor: fillroute[k],
                routeActiveStrokeWidth: 6,
                routeActiveStrokeColor: fillroute[k],

                routeActivePedestrianSegmentStrokeStyle: fillroute[k],
                routeActivePedestrianSegmentStrokeColor: fillroute[k],
                boundsAutoApply: true
            });

        this.map.geoObjects.add(this.#multiRoute);

        this.#multiRoute.model.events.add(
            'requestsuccess',
            function (event) {
                const routeProperties = event.get('target').getRoutes()[0].properties;
                displayInformation(
                    new_routes[k].length,
                    routeProperties.get('duration').text.slice(0, -1),
                    routeProperties.get('distance').text
                );
            }
        ).add('requestfail', function (event) {
            console.log('Error: ' + event.get('error').message);
        });
    }

    /* Синхронизация ссылок меню с точками на карте. */
    #syncLiksWithPoints() {
        const pointTextLinks = document.querySelector('#points').querySelectorAll('a');
        const collection = new ymaps.GeoObjectCollection(null, { preset: ' ' });
        this.map.geoObjects.add(collection);

        pointTextLinks.forEach(function callback(pointTextLink, index, array) {
            const location = pointTextLink.parentElement.dataset.location.split(',');
            const name = pointTextLink.textContent;

            const placemark = new ymaps.Placemark(location, { balloonContent: name });

            placemark.options.set('visible', false);
            collection.add(placemark);

            pointTextLink.onclick = function () {
                if (placemark.balloon.isOpen()) {
                    placemark.balloon.close();
                } else {
                    placemark.balloon.open();
                }
            };
        });
    }

    #clearLastRoute() { this.map.geoObjects.remove(this.#multiRoute); }
}

/*

window.onload = function() {
document.getElementById('gobtn').onclick = function () {
    var el = document.getElementById('inforoute')
        if (el != null){
                el.remove()
    }
    var timeee = document.getElementById('time').innerHTML
    var inputElements = document.getElementsByClassName('messageCheckbox');
    var ob_poi = []
    for(var i = 0, l = inputElements.length; i < l; i++){
            if(inputElements[i].checked){
                ob_poi.push(inputElements[i].name)
            }
        }
    myMap.geoObjects.remove(last_route)
    createroute(timeee, ob_poi)

    console.log(timeee);
    console.log(ob_poi);
}

document.getElementById('desel').onclick = function () {
        var inputElements = document.getElementsByClassName('messageCheckbox')
        for(var i = 0, l = inputElements.length; i < l; i++){
            if(inputElements[i].checked){
                inputElements[i].checked = false
            }
        }
}

document.getElementById('next').onclick = function () {
        if (new_routes.length != 0){
        myMap.geoObjects.remove(last_route)
        k = k+1
        if (k == new_routes.length){
            k = 0
        }
        addroute()
    }
    }

    var slider = document.getElementById('myRange');
    var output = document.getElementById('time');
    output.innerHTML = slider.value;
    slider.oninput = function() {
        output.innerHTML = this.value;
    }
};



 def createinf!!!
    if (document.getElementById('info') == null){
    var razn = $('<li id = inforoute><a id = info>количество точек : '+sumpoints+' время : '+timeroute+' длина : '+lenroute+'</a>'+ '<input type='button' id=inforoutebtn value='save'/></li>')
    razn.appendTo($('body'))
    var kn1 = document.getElementById('inforoutebtn')
    kn1.onclick = function () {
          postData('save/', {'rez':new_routes[k],state:'inactive' })
    }
    }
    if (document.getElementById('info') != null){
        document.getElementById('info').innerHTML = 'количество точек : '+sumpoints+' время : '+timeroute+' длина : '+lenroute
    }

function show_popup(){
    var popup = document.getElementById('popup')
             popup.classList.toggle('active')
             window.onclick = function(event) {
                popup.className = ''
             }
}
*/