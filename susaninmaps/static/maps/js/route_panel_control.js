var myMap;
var routes;
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
const csrftoken = getCookie('csrftoken');

let new_routes = []
let last_route = []
let fillroute = [["#000088", "#E63E92"], ["#ff9baa", "#E63E92"],["#6a38ff", "#E63E92"],["#0f93ff", "#E63E92"],["#00856f", "#E63E92"]]//цвета маршрутов
let k = 0

function init(route) {
  myMap = new ymaps.Map('map', {
        center: [55.831, 37.629],
        zoom: 15,
        controls: ['smallMapDefaultSet']
    }, {
        searchControlProvider: 'yandex#search',
        restrictMapArea: [
            [55.842, 37.604],
            [55.821, 37.651]
        ]
    }),
    menu = $('<ul class="menu"/>');

    for (var i = 0, l = groups.length; i < l; i++) {//формирую меню
        createMenuGroup(groups[i]);
    }

    function createMenuGroup (group) {
        var menuItem = $('<li><a href="#">' + group.name + '</a></li>'),
            collection = new ymaps.GeoObjectCollection(null, { preset: group.style }),
            submenu = $('<ul class="submenu"/>');

        myMap.geoObjects.add(collection);
        menuItem
            .append(submenu)
            .appendTo(menu)
            .find('a')
            .bind('click', function () {
                if (collection.getParent()) {
                    myMap.geoObjects.remove(collection);
                    submenu.hide();
                } else {
                    myMap.geoObjects.add(collection);
                    submenu.show();
                }
            });
        for (var j = 0, m = group.items.length; j < m; j++) {
            createSubMenu(group.items[j], collection, submenu);
        }
    }
    function createSubMenu (item, collection, submenu) {
        if (item.center == '55.826591,37.638033'){
        var submenuItem = $('<li><a href="#">' + item.name +'</a>' + "</li>")
        }
        if (item.center != '55.826591,37.638033'){
        var submenuItem = $('<li><a href="#">' + item.name +'</a>' + '<input class="messageCheckbox" type="checkbox" name=' + item.center+'><span class="checkmark" ></span>' + "</li>")
        }
        var placemark = new ymaps.Placemark(item.center, { balloonContent: item.name });

        collection.add(placemark);
        submenuItem
            .appendTo(submenu)
            .find('a')
            .bind('click', function () {
                if (!placemark.balloon.isOpen()) {
                    placemark.balloon.open();
                } else {
                    placemark.balloon.close();
                }
                return false;
            });
    }

    menu.appendTo($(document.getElementById("conteyner")));
}
ymaps.ready(init)

function show_popup(){
    var popup = document.getElementById('popup')
             popup.classList.toggle('active')
             window.onclick = function(event) {
                popup.className = ""
             }
}
function createinf(sumpoints ,timeroute, lenroute){
    if (document.getElementById("info") == null){
    var razn = $("<li id = inforoute><a id = info>количество точек : "+sumpoints+" время : "+timeroute+" длина : "+lenroute+"</a>"+ "<input type='button' id=inforoutebtn value='save'/></li>")
    razn.appendTo($("body"))
    var kn1 = document.getElementById("inforoutebtn")
    kn1.onclick = function () {
          postData("save/", {"rez":new_routes[k],state:"inactive" })
    }
    }
    if (document.getElementById("info") != null){
        document.getElementById("info").innerHTML = "количество точек : "+sumpoints+" время : "+timeroute+" длина : "+lenroute
    }
}

function addroute(){
    multiRoute = new ymaps.multiRouter.MultiRoute({
                            referencePoints: new_routes[k],
                            params: {
                                routingMode: 'pedestrian'
                            }
                        }, {
                            wayPointStartIconColor: "#333",
                            wayPointStartIconFillColor: "#B3B3B3",

                            routeStrokeWidth: 2,
                            routeStrokeColor: fillroute[k],
                            routeActiveStrokeWidth: 6,
                            routeActiveStrokeColor: fillroute[k],

                            routeActivePedestrianSegmentStrokeStyle: fillroute[k],
                            routeActivePedestrianSegmentStrokeColor: fillroute[k],
                            boundsAutoApply: true
                        })
    myMap.geoObjects.add(multiRoute)
    last_route = multiRoute
    multiRoute.model.events.add("requestsuccess", function (event) {
                        var routes = event.get("target").getRoutes();
                        createinf(new_routes[k].length, routes[0].properties.get("duration").text, routes[0].properties.get("distance").text)
                    }).add("requestfail", function (event) {
                        console.log("Error: " + event.get("error").message);
                });
}

async function createroute(time, points){
        var rez = {}
        rez = await postData("def/", {"point" : points,"time": time,state:"inactive" })
        new_routes = []
        k = 0
        for (let i in rez) {
            new_routes.push(rez[i])
        }
        if (new_routes.length != 0){
            addroute()
        }
        if(Object.keys(rez).length === 0){
            return [[-1, -1]]
        }
}

window.onload = function() {

document.getElementById('gobtn').onclick = function () {
    var el = document.getElementById("inforoute")
        if (el != null){
                el.remove()
    }
    var timeee = document.getElementById("time").innerHTML
    var inputElements = document.getElementsByClassName('messageCheckbox');
    var ob_poi = []
    for(var i = 0, l = inputElements.length; i < l; i++){
            if(inputElements[i].checked){
                ob_poi.push(inputElements[i].name)
            }
        }
    myMap.geoObjects.remove(last_route)
    createroute(timeee, ob_poi).then((result) => {
      console.log(result)
    })
}

document.getElementById('desel').onclick = function () {
        var inputElements = document.getElementsByClassName('messageCheckbox')
        for(var i = 0, l = inputElements.length; i < l; i++){
            if(inputElements[i].checked){
                inputElements[i].checked = false
            }
        }
}

document.getElementById("next").onclick = function () {
        if (new_routes.length != 0){
        myMap.geoObjects.remove(last_route)
        k = k+1
        if (k == new_routes.length){
            k = 0
        }
        addroute()
    }
    }

    var slider = document.getElementById("myRange");
    var output = document.getElementById("time");
    output.innerHTML = slider.value;
    slider.oninput = function() {
        output.innerHTML = this.value;
    }
};