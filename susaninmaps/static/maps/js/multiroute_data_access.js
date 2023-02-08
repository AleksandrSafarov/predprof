function init() {
    var points = [
            "55.826591, 37.638033",
            "55.828598, 37.633872",
            "55.828660, 37.631427",
            "55.828794, 37.629733",
            "55.829620, 37.629884",
            "55.830239, 37.629268",
            "55.829970, 37.633791",
            "55.830684, 37.633393",
            "55.830932, 37.632602",
            "55.832645, 37.627215",
            "55.830853, 37.638237",
            "55.833371, 37.634525",
            "55.833840, 37.626198",
            "55.834870, 37.622146",
            "55.834312, 37.621751",
            "55.834919, 37.619728",
            "55.834872, 37.618655",
            "55.835751, 37.618203",
            "55.833743, 37.619619",
            "55.832246, 37.616529",
            "55.831419, 37.623967",
            "55.832016, 37.623054",
            "55.835031, 37.623354",
            "55.834418, 37.630189",
            "55.837183, 37.621347",
            "55.837271, 37.624137",
            "55.837340, 37.622524",
            "55.838276, 37.623398",
            "55.838423, 37.614388",
            "55.839378, 37.616988",
            "55.839842, 37.619280",
            "55.839657, 37.621512",
            "55.838345, 37.628216",
            "55.832802, 37.629093",
            "55.835137, 37.627619",
            "55.826249, 37.637578",
            "55.833797, 37.623099",
            "55.834308, 37.623085"
        ];

    var myMap = new ymaps.Map('map', {
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
        var submenuItem = $('<li><a href="#">' + item.name + '</a></li>'),
            placemark = new ymaps.Placemark(item.center, { balloonContent: item.name });

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

    menu.appendTo($('body'));
    for (let k = 36, t = 38; k < t; k++) {
        for (let j = 0, m = 40; j < m; j++) {
                multiRoute = new ymaps.multiRouter.MultiRoute({
                        referencePoints: [
                            points[k],
                            points[j],
                        ],
                        params: {
                            routingMode: 'pedestrian'
                        }
                    }, {
                        boundsAutoApply: true
                })        // Подписка на событие обновления данных маршрута.
                myMap.geoObjects.add(multiRoute);
                multiRoute.model.events.add("requestsuccess", function (event) {
                        var routes = event.get("target").getRoutes();
                        console.log("Found routes: " + routes.length);
                        for (let i = 0, l = routes.length; i < l; i++) {
                            console.log("Route length " + (i + 1) + ": " + routes[i].properties.get("duration").text);
                            console.log(points[k], points[j])
                        }
                    }).add("requestfail", function (event) {
                        console.log("Error: " + event.get("error").message);
                });
            };
        };
}

ymaps.ready(init)