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

    const csrftoken = getCookie('csrftoken');// получаю csrf токен

    const postData = async (url = '', data = {}) => {//функция для запросов
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

  myMap = new ymaps.Map('map', {//контейнер для карты
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

    menu.appendTo($(document.getElementById("conteyner")));//добавляю меню в элемент conteyner

    var slider = document.getElementById("myRange");
    var output = document.getElementById("time");
    output.innerHTML = slider.value;
    slider.oninput = function() {
        output.innerHTML = this.value;
    }//регулировка времени

    document.getElementById('desel').onclick = function () {
        var inputElements = document.getElementsByClassName('messageCheckbox')//все чекбоксы
        for(var i = 0, l = inputElements.length; i < l; i++){//рохожусь по чекбоксам
            if(inputElements[i].checked){//есть галочка то ее не будет
                inputElements[i].checked = false
            }
        }
    }//просто убираю галочки
    var new_routes = []//для добаленных маршрутов
    var rez = {}//запрос
    var last_route = []//маршрут на данный момент
    let fillroute = [["#000088", "#E63E92"], ["#ff9baa", "#E63E92"],["#6a38ff", "#E63E92"],["#0f93ff", "#E63E92"],["#00856f", "#E63E92"]]//цвета маршрутов
    let k = 0 // номер маршрута на данный момент


    document.getElementById("next").onclick = function () {//следующий маршрут
        if (new_routes.length != 0){//есть маршруты
        myMap.geoObjects.remove(last_route)//удаляю маршрут
        //document.getElementById("inforoute").remove()//удаляю строку с информацией маршрута
        k = k+1//следующий маршрут
        if (k == new_routes.length){//если выполняется значит предыдущий маршрут был полседним в списке
            k = 0
        }
        multiRoute = new ymaps.multiRouter.MultiRoute({//создаю новый маршрут
                            referencePoints: new_routes[k],//выбираю k-ый маршрут
                            params: {
                                routingMode: 'pedestrian'
                            }
                        }, {
                            // Внешний вид путевых точек.
                            wayPointStartIconColor: "#333",
                            wayPointStartIconFillColor: "#B3B3B3",

                            // Внешний вид линии маршрута.
                            routeStrokeWidth: 2,
                            routeStrokeColor: fillroute[k],//настройка цветов
                            routeActiveStrokeWidth: 6,
                            routeActiveStrokeColor: fillroute[k],//настройка цветов

                            // Внешний вид линии пешеходного маршрута.
                            routeActivePedestrianSegmentStrokeStyle: fillroute[k],//настройка цветов
                            routeActivePedestrianSegmentStrokeColor: fillroute[k],//настройка цветов
                            boundsAutoApply: true
                        })
          myMap.geoObjects.add(multiRoute)//добаляю новыймаршрйт на карту
          last_route = multiRoute//ссылка на новый маршрут
          multiRoute.model.events.add("requestsuccess", function (event) {//получаю информацию о маршруте
                        var routes = event.get("target").getRoutes();//получаю информацию об активном маршруте
                          document.getElementById("info").innerHTML = "количество точек : "+new_routes[0].length+" время : "+routes[0].properties.get("duration").text+" длина : "+routes[0].properties.get("distance").text
                    }).add("requestfail", function (event) {
                        console.log("Error: " + event.get("error").message);
                });
    }
    }


    document.getElementById('gobtn').onclick = function () {//кнопка создания маршрутов
        myMap.geoObjects.remove(last_route)//удаляю последний маршрут


        var el = document.getElementById("inforoute")//удаляю информацию о маршруте если она есть
        if (el != null){
                el.remove()
            }

        async function f(){
        var timeee = document.getElementById("time").innerHTML//получаю лимит по времени
        var inputElements = document.getElementsByClassName('messageCheckbox');//получаю все чекбоксы
        var ob_poi = []//обязательные точки
        for(var i = 0, l = inputElements.length; i < l; i++){//рохожусь по чекбоксам
            if(inputElements[i].checked){//есть галочка - координаты в ob_poi
                ob_poi.push(inputElements[i].name)
            }
        }
        // в итоге в ob_poi хранятся обязательные точки. может быть пустым, если ничего не выбрано( нигде нет галочки)

        rez = await postData("def/", {"point" : ob_poi,"time": timeee,   // < here
            state:"inactive" })// делаю запрос и получаю маршрут
        if(Object.keys(rez).length === 0){//всплывающее окно
             var popup = document.getElementById('popup')//если не юыло найдено маршрутов то лимит времени слишком маленький
             //програма не может построить маршрут
             popup.classList.toggle('active')//окно отображается
             window.onclick = function(event) {//при клике куда-либо
                popup.className = ""//убираю окно
                //я делаю это при помощи стилей прописаных в html
             }
        }
        new_routes = []//обновляю список маршрутов
        for (let i in rez) {
            new_routes.push(rez[i])//добаляю новые маршруты
        }
        k = 0//начальный маршрут
        if (new_routes.length != 0){//есть маршруты
        multiRoute = new ymaps.multiRouter.MultiRoute({//создаю самый 1 маршрут
                            referencePoints: new_routes[k],
                            params: {
                                routingMode: 'pedestrian'
                            }
                        }, {
                            // Внешний вид путевых точек.
                            wayPointStartIconColor: "#333",
                            wayPointStartIconFillColor: "#B3B3B3",

                            // Внешний вид линии маршрута.
                            routeStrokeWidth: 2,
                            routeStrokeColor: fillroute[k],//цвета
                            routeActiveStrokeWidth: 6,
                            routeActiveStrokeColor: fillroute[k],

                            // Внешний вид линии пешеходного маршрута.
                            routeActivePedestrianSegmentStrokeStyle: fillroute[k],
                            routeActivePedestrianSegmentStrokeColor: fillroute[k],
                            boundsAutoApply: true
                        })
          myMap.geoObjects.add(multiRoute)//добаляю его на карту
          last_route = multiRoute//ссылка на маршрут
          multiRoute.model.events.add("requestsuccess", function (event) {//информация о маршруте
                        var routes = event.get("target").getRoutes();
                        var razn = $("<li "+" id = inforoute><a id = info>количество точек : "+new_routes[k].length+" время : "+routes[0].properties.get("duration").text+" длина : "+routes[0].properties.get("distance").text+"</a>"+ "<input type='button' id=inforoutebtn value='save'/></li>")
                        //вывожу информацию в html
                        //количество точек - new_routes[k].length, время - routes[0].properties.get("duration").text, длина маршрута - routes[0].properties.get("distance").text
                        //также добавляю кнопку сохранения маршрута с id inforoutebtn
                        razn.appendTo($("body"))//добаляю в html
                        var kn1 = document.getElementById("inforoutebtn") //получаю кнопку
                        kn1.onclick = function () {//при клике на нее отправляю данные на сервер
                                postData("save/", {"rez":new_routes[k],
                                    state:"inactive" })
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