from django.http import HttpResponse
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import json
import sqlite3 as sql

def index(request):
    return render(request, 'maps/index.html')

def save(request):
    routes = json.loads(request.body.decode('utf-8'))["rez"]

    print(routes)#тут json такого вида {'1': ['55.826591, 37.638033', '55.826249, 37.637578'], '2': ['55.826591, 37.638033', '55.828598, 37.633872']}
    #номер маршрута от 1 до 5 строкой и далее сам маршрут - список поинтов
    return HttpResponse(request)

def route(request):
    def op_m(a, b):
        if sorted(a[0]) == sorted(b[0]):
            if a[1] < b[1]:
                return [a, []]
            else:
                return [b, []]
        return [a, b]

    def o_gr(graf, max_t, x, t_n=0, past=[], ob_p=[]):  # сам граф - graf\ лимит по времени - max_t\ начало графа - x
        # время на путь - t_n \пройденый путь на данный момент - past\ обязательные точки - ob_p
        if t_n > max_t or len(
                past) == 26:  # если привышен лимит времени и есть 26 точек маршрута (25 - максимальное кол- во точек, которое можно добавить в яндексе)
            b = graf[past[-2]]  # значит заканчиваем
            for i in range(len(b)):
                if b[i][0] == past[
                    -1]:  # этот цикл для коректировки времени маршрута. последняя точка не должна учитоваться
                    return [[past[:-1], t_n - b[i][1]]]
        if past == [] and ob_p == []:  # нет обязательных точек и начала маршрута
            roud = []
            v = graf[x]  # точки куда могу пойти
            past.append(x)  # начальная точка
            for i in range(len(v)):
                if t_n + v[i][1] <= max_t:  # перебираю точки в которые могу пойти
                    a = o_gr(graf, max_t, x, t_n + v[i][1], past + [v[i][0]], ob_p)  # поучаю маршрут
                    roud += [*a]
            ma_l = max(list(map(lambda x: len(x[0]), roud)))
            rez = {}
            k = 1
            while ma_l > 0:
                a = list(filter(lambda x: len(x[0]) == ma_l, roud))
                ma_l -= 1
                for i in range(len(a)):
                    rez[str(k)] = a[i][0]
                    k += 1
                    if k == 6: return rez
            return rez

        elif past == [] and ob_p != []:  # есть обязательные точки, но нет начала
            past.append(x)  # начало маршрута
            t_p = 0  # предпологаемое время маршрута через обязательные точки
            while len(ob_p) + 1 != len(
                    past):  # тут типо делаю маршрут из обязательных точек,  но самый короткий по времени
                v = graf[past[-1]]  # предыдущая точка
                mi = ["", 1000]  # ближайшая следующая
                for i in range(len(v)):  # ищу ближайшую обязательную  точку
                    if mi[1] > v[i][1] and v[i][0] not in past and v[i][0] in ob_p:
                        mi[1] = v[i][1]
                        mi[0] = v[i][0]
                t_p += mi[1]  # добавляю время до ближайщей точки
                past.append(mi[0])  # добавляю ближайшуюточку
            if t_p > max_t:
                return {}
            pu = []
            pu.append([past, t_p])  # путь только через обязательные точки
            pu += o_gr(graf, max_t, x, t_p, past, ob_p)  # остальные маршруты
            for i in range(len(pu)):  # убираю повторы
                for y in range(i + 1, len(pu)):  # и если у 2х маршрутов одинаковые точки
                    if pu[i] != [] and pu[y] != []:  # то оставляю тот, который меньше по времени
                        if len(pu[i][0]) == len(pu[y][0]):
                            c = op_m(pu[i], pu[y])
                            pu[i] = c[0]
                            pu[y] = c[1]
            pu = list(filter(lambda x: x != [], pu))  # удаляю пустые списки
            rez = {}
            ma_l = max(list(map(lambda x: len(x[0]), pu)))  # максимальная длина
            k = 1
            while ma_l > 0 and len(rez) < 5: # ищу маршруты
                a = sorted(filter(lambda x: len(x[0]) == ma_l, pu), key=lambda x: x[1])  # самые длинные
                ma_l -= 1
                for i in range(len(a)):
                    rez[str(k)] = a[i][0]
                    k += 1
                    if k == 6: return rez
            return rez

        else:
            if ob_p == []:  # не обязательных точек
                mi = ["", 1000]  # ближайшая точ
                b = graf[past[-1]]  # куда могу пойти
                for i in range(len(b)):  # ищу ближайшую точку
                    if mi[1] > b[i][1] and b[i][0] not in past:
                        mi[1] = b[i][1]
                        mi[0] = b[i][0]
                if mi[1] == 1000:  # на всякий
                    return [[past, t_n]]
                return o_gr(graf, max_t, x, t_n + mi[1], past + [mi[0]], ob_p)  # добавляю бижайшую точку и иду дальше
            else:  # есть обязательные точки
                pu = []
                if len(past) == 25:
                    return [[past, t_n]]
                mi = ["", 10000, 0]  # ищу точку кторая увеличит время меньше всего
                for i in range(1, len(past)):  # рассматриваю разные звенья пути(А, Б)
                    g = graf[past[i - 1]]
                    t = 0
                    for y in range(len(g)):  # нахожу время до следующей точки
                        if g[y][0] == past[i]:
                            t = g[y][1]
                    for y in range(len(g)):  # смотрю куда можно пойти
                        if g[y][0] not in past:  # новая точка(точка В)(предпологаемый маршрут АВБ)
                            d_t = g[y][1]
                            pr = graf[g[y][0]]
                            for j in pr:  # следующая точка в звене (из А в В и из В в Б)
                                if j[0] == past[i]:
                                    d_t += j[1]
                                    break
                            if mi[1] > d_t - t:  # сохраняю точку, которая изменяет время меньше всего
                                mi[0] = g[y][0]
                                mi[1] = d_t - t
                                mi[2] = i
                if max_t >= t_n + mi[1] and mi[1] != 10000:  # не превзашол лимит по времени
                    pu.append([past[:mi[2]] + [mi[0]] + past[mi[2]:], t_n + mi[1]])  # сохраняю маршрут
                    pu += o_gr(graf, max_t, x, t_n + mi[1], past[:mi[2]] + [mi[0]] + past[mi[2]:],
                               ob_p)  # проверяю могу ли добавить еще точки
                    pu += o_gr(graf, max_t, x, t_n + mi[1],
                               past[:mi[2]] + [mi[0]] + past[mi[2]:])  # маршрут за самую крайнюю обязательную точку
                return pu  # вывод

    s = {}
    con = sql.connect("C:/Users/Aleksey/django/predprof/susaninmaps/db.sqlite3")  # подключаюсь к базе данных
    cur = con.cursor()  # ну это наверное нужно
    cur.execute(
        'SELECT point1, point2 FROM route')  # таблица routeолучаю из нее значения точки(point1) и куда можно пойти(point2)
    for i in cur:  # проход по данным
        po = i[0]  # точка
        zn = i[1].split(";")  # пути хранятся как строка 1 значение - точка 2- время ;- разделитель
        mas = []
        for i in range(len(zn)):
            if ',' in zn[i]:
                mas.append([zn[i], int(zn[i + 1])])  # добавляю точку и время
        s[po] = mas  # сохраняю куда можно пойти из точки
    cur.close()
    con.close()  # отключаю подключение
    ti = json.loads(request.body.decode('utf-8'))
    poi = list(map(lambda x: x.split(",")[0] +", "+ x.split(",")[1],ti['point']))
    points = [
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
    ]
    for i in range(len(poi)):
        a = poi[i].split(",")
        for y in range(len(points)):
            if a[0] in points[y] and a[1] in points[y]:
                poi[i] = points[y]

    ti = int(ti['time'])
    a = o_gr(s, ti, "55.826591, 37.638033", ob_p=poi)
    if request.method == "GET":
        return JsonResponse(a)
    if request.method == "POST":
        return JsonResponse(a)