var myMap;
var routes;
function init(route) {
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const csrftoken = getCookie('csrftoken');

    const postData = async (url = '', data = {}) => {
  // Формируем запрос

        const response = await fetch(url, {
        // Метод, если не указывать, будет использоваться GET
        method: 'POST',
       // Заголовок запроса
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        // Данные
        body: JSON.stringify(data)
      });
      return response.json();
    }

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

    for (var i = 0, l = groups.length; i < l; i++) {
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
        // делаю строку (ссылка, чекбокс) его имя - координаты точки
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

//    multiRoute = new ymaps.multiRouter.MultiRoute({
//                        referencePoints: ['55.826591, 37.638033', '55.828794, 37.629733'],
//                        params: {
//                            routingMode: 'pedestrian'
//                        }
//                    }, {
//                        boundsAutoApply: true
//                })
//    myMap.geoObjects.add(multiRoute);

    var slider = document.getElementById("myRange");
    var output = document.getElementById("time");
    output.innerHTML = slider.value;
    slider.oninput = function() {
        output.innerHTML = this.value;
    }

    document.getElementById('desel').onclick = function () {
        var inputElements = document.getElementsByClassName('messageCheckbox')//все чекбоксы
        for(var i = 0, l = inputElements.length; i < l; i++){//рохожусь по чекбоксам
            if(inputElements[i].checked){//есть галочка то ее не будет
                inputElements[i].checked = false
            }
        }
    }
    var new_routes = []
    var rez = {}
    var last_route = []
    let fillroute = [["#000088", "#E63E92"], ["#ff9baa", "#E63E92"],["#6a38ff", "#E63E92"],["#0f93ff", "#E63E92"],["#00856f", "#E63E92"]]
    let k = 0


    document.getElementById("next").onclick = function () {
        if (new_routes.length != 0){
        console.log(new_routes[k].length)
        myMap.geoObjects.remove(last_route)
        document.getElementById(String(k)).remove()
        k = k+1
        if (k == new_routes.length){
            k = 0
        }
        multiRoute = new ymaps.multiRouter.MultiRoute({
                            referencePoints: new_routes[k],
                            params: {
                                routingMode: 'pedestrian'
                            }
                        }, {
                            // Внешний вид путевых точек.
                            wayPointStartIconColor: "#333",
                            wayPointStartIconFillColor: "#B3B3B3",
                            // Позволяет скрыть иконки путевых точек маршрута.

                            // Внешний вид транзитных точек.
                            viaPointIconRadius: 7,
                            viaPointIconFillColor: "#000088",
                            viaPointActiveIconFillColor: "#E63E92",
                            // Внешний вид линии маршрута.
                            routeStrokeWidth: 2,
                            routeStrokeColor: fillroute[k],
                            routeActiveStrokeWidth: 6,
                            routeActiveStrokeColor: fillroute[k],

                            // Внешний вид линии пешеходного маршрута.
                            routeActivePedestrianSegmentStrokeStyle: fillroute[k],
                            routeActivePedestrianSegmentStrokeColor: fillroute[k],
                            boundsAutoApply: true
                        })
          myMap.geoObjects.add(multiRoute)
          last_route = multiRoute
          multiRoute.model.events.add("requestsuccess", function (event) {
                        var routes = event.get("target").getRoutes();
                        var razn = $("<li "+" id = "+k+"><a>количество точек : "+new_routes[k].length+" время : "+routes[0].properties.get("duration").text+" длина : "+routes[0].properties.get("distance").text+"</a>"+ "<input type='button' id="+k + "s"+" value='save'/></li>")
                        razn.appendTo($("body"))
                        var kn1 = document.getElementById(k+"s")
                        //console.log(kn1)
                        if (kn1 != null){
                            kn1.onclick = function () {
                                postData("save/", {"rez":new_routes[k],   // < here
                                    state:"inactive" })
                            }
                        }
                    }).add("requestfail", function (event) {
                        console.log("Error: " + event.get("error").message);
                });
    }
    }


    document.getElementById('gobtn').onclick = function () {
        //console.log(new_routes)//ранее добавленные маршруты
        myMap.geoObjects.remove(last_route)


        var el = document.getElementById(String(k))
        if (el != null){
                el.remove()
            }


        async function f(){
        var timeee = document.getElementById("time").innerHTML//лимит по времени
        var inputElements = document.getElementsByClassName('messageCheckbox');//получаю все чекбоксы
        var ob_poi = []//обязательные точки
        for(var i = 0, l = inputElements.length; i < l; i++){//рохожусь по чекбоксам
            if(inputElements[i].checked){//есть галочка - добавляю имя(координаты)
                ob_poi.push(inputElements[i].name)
            }
        }
        //console.log(ob_poi)//точки
        //console.log(timeee)//лимит
        // в итоге в ob_poi хранятся обязательные точки. может быть пустым

        rez = await postData("def/", {"point" : ob_poi,"time": timeee,   // < here
            state:"inactive" })
        //console.log(rez)//результат запроса
        if(Object.keys(rez).length === 0){
             var popup = document.getElementById('popup')
             popup.classList.toggle('active')
             window.onclick = function(event) {
                popup.className = ""
             }
        }
        new_routes = []
        for (let i in rez) {
            new_routes.push(rez[i])
        }
        k = 0
        if (new_routes.length != 0){
        multiRoute = new ymaps.multiRouter.MultiRoute({
                            referencePoints: new_routes[k],
                            params: {
                                routingMode: 'pedestrian'
                            }
                        }, {
                            // Внешний вид путевых точек.
                            wayPointStartIconColor: "#333",
                            wayPointStartIconFillColor: "#B3B3B3",
                            // Позволяет скрыть иконки путевых точек маршрута.

                            // Внешний вид транзитных точек.
                            viaPointIconRadius: 7,
                            viaPointIconFillColor: "#000088",
                            viaPointActiveIconFillColor: "#E63E92",
                            // Внешний вид линии маршрута.
                            routeStrokeWidth: 2,
                            routeStrokeColor: fillroute[k],
                            routeActiveStrokeWidth: 6,
                            routeActiveStrokeColor: fillroute[k],

                            // Внешний вид линии пешеходного маршрута.
                            routeActivePedestrianSegmentStrokeStyle: fillroute[k],
                            routeActivePedestrianSegmentStrokeColor: fillroute[k],
                            boundsAutoApply: true
                        })
          myMap.geoObjects.add(multiRoute)
          last_route = multiRoute
          multiRoute.model.events.add("requestsuccess", function (event) {
                        var routes = event.get("target").getRoutes();
                        var razn = $("<li "+" id = "+k+"><a>количество точек : "+new_routes[0].length+" время : "+routes[0].properties.get("duration").text+" длина : "+routes[0].properties.get("distance").text+"</a>"+ "<input type='button' id="+k + "s"+" value='save'/></li>")
                        razn.appendTo($("body"))
                        var kn1 = document.getElementById(k+"s")
                        //console.log(kn1)
                        if (kn1 != null){
                            kn1.onclick = function () {
                                postData("save/", {"rez":new_routes[k],   // < here
                                    state:"inactive" })
                            }
                        }
                    }).add("requestfail", function (event) {
                        console.log("Error: " + event.get("error").message);
                });

        }
        }
        f()
    };
}


ymaps.ready(init)