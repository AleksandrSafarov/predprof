import json

from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse_lazy
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import *

from maps.models import Route

from .models import *

from .forms import *


class Index(TemplateView):
    form_class = IndexForm
    template_name = 'maps/index.html'
    success_url = reverse_lazy('index')

    def get_queryset(self):
        return Route.objects.all()

    def get_context_data(self, **kwargs):
        self.extra_context = {
            'static_routes': Route.objects.filter(isStatic=True),
            'user_routes': Route.objects.filter(isStatic=False),
            'button_text': "Сохранить"
        }
        return super().get_context_data(**kwargs)
        
    def get_success_url(self):
        return reverse_lazy('index')

def save(request):
    routes = json.loads(request.body.decode('utf-8'))["rez"]

    print(routes)#тут json такого вида {'1': ['55.826591, 37.638033', '55.826249, 37.637578'], '2': ['55.826591, 37.638033', '55.828598, 37.633872']}
    #номер маршрута от 1 до 5 строкой и далее сам маршрут - список поинтов
    return HttpResponse(request)

@csrf_exempt
def route(request):
    def op_m(a, b):
        if sorted(a[0]) == sorted(b[0]):
            if a[1] < b[1]:
                return [a, []]
            else:
                return [b, []]
        return [a, b]

    def o_gr(graf, max_time, x, lenroute=0, past=[], points=[]):
        if round(lenroute/83) > max_time or len(
                past) == 26:
            b = graf[past[-2]]
            for i in range(len(b)):
                if b[i][0] == past[-1]:
                    return [[past[:-1], round((lenroute - b[i][1])/83)]]
        if past == [] and points == []:
            pu = []
            v = graf[x]
            past.append(x)
            for i in range(len(v)):
                if round((lenroute + v[i][1])/83) <= max_time:
                    a = o_gr(graf, max_time, x, lenroute + v[i][1], past + [v[i][0]], points)
                    pu += [*a]
            for i in range(len(pu)):
                for y in range(i + 1, len(pu)):
                    if pu[i] != [] and pu[y] != []:
                        if len(pu[i][0]) == len(pu[y][0]):
                            c = op_m(pu[i], pu[y])
                            pu[i] = c[0]
                            pu[y] = c[1]
            pu = list(filter(lambda x: x != [], pu))
            ma_l = max(list(map(lambda x: len(x[0]), pu)))
            rez = {}
            k = 1
            while ma_l > 0:
                a = list(filter(lambda x: len(x[0]) == ma_l, pu))
                ma_l -= 1
                for i in range(len(a)):
                    rez[str(k)] = a[i][0]
                    k += 1
                    if k == 6: return rez
            return rez

        elif past == [] and points != []:
            past.append(x)
            estimated_length = 0
            while len(points) + 1 != len(past):
                v = graf[past[-1]]
                mi = ["", 10000]
                for i in range(len(v)):  #
                    if mi[1] > v[i][1] and v[i][0] not in past and v[i][0] in points:
                        mi[1] = v[i][1]
                        mi[0] = v[i][0]
                estimated_length += mi[1]
                past.append(mi[0])
            if round(estimated_length/83) > max_time:
                return {}
            pu = []
            pu.append([past, round(estimated_length/83)])
            pu += o_gr(graf, max_time, x, estimated_length, past, points)
            for i in range(len(pu)):
                for y in range(i + 1, len(pu)):
                    if pu[i] != [] and pu[y] != []:
                        if len(pu[i][0]) == len(pu[y][0]):
                            c = op_m(pu[i], pu[y])
                            pu[i] = c[0]
                            pu[y] = c[1]
            pu = list(filter(lambda x: x != [], pu))
            rez = {}
            ma_l = max(list(map(lambda x: len(x[0]), pu)))
            k = 1
            while ma_l > 0:
                a = sorted(filter(lambda x: len(x[0]) == ma_l, pu), key=lambda x: x[1])
                ma_l -= 1
                for i in range(len(a)):
                    rez[str(k)] = a[i][0]
                    k += 1
                    if k == 11: return rez
            return rez
        else:
            if points == []:
                mi = ["", 10000]
                b = graf[past[-1]]
                for i in range(len(b)):
                    if mi[1] > b[i][1] and b[i][0] not in past:
                        mi[1] = b[i][1]
                        mi[0] = b[i][0]
                if mi[1] == 10000:
                    return [[past, lenroute/83]]
                return o_gr(graf, max_time, x, lenroute + mi[1], past + [mi[0]], points)
            else:
                pu = []
                if len(past) == 25:
                    return [[past, lenroute]]
                point1, point2 = "", ""
                mi = ["", 10000, 0]
                for i in range(1, len(past)):
                    g = graf[past[i - 1]]
                    lenpoint = 0
                    for y in range(len(g)):
                        if g[y][0] == past[i]:
                            lenpoint = g[y][1]
                    for y in range(len(g)):
                        if g[y][0] not in past:
                            delta_lenpoint = g[y][1]
                            pr = graf[g[y][0]]
                            for j in pr:
                                if j[0] == past[i]:
                                    if g[y][0] == "55.833743, 37.631765":
                                        print([past[i-1], "55.833743, 37.631765", past[i]], delta_lenpoint, j[1])
                                    delta_lenpoint += j[1]
                                    break
                            if mi[1] > delta_lenpoint - lenpoint:
                                mi[0] = g[y][0]
                                mi[1] = delta_lenpoint - lenpoint
                                mi[2] = i
                if max_time >= round((lenroute + mi[1])/83) and mi[1] != 10000:
                    pu.append([past[:mi[2]] + [mi[0]] + past[mi[2]:], round((lenroute + mi[1])/83)])
                    pu += o_gr(graf, max_time, x, lenroute + mi[1], past[:mi[2]] + [mi[0]] + past[mi[2]:],
                               points)
                    pu += o_gr(graf, max_time, x, lenroute + mi[1],
                               past[:mi[2]] + [mi[0]] + past[mi[2]:])
                return pu
    s = {}
    cur = Place.objects.values_list('point1', 'point2')  # таблица routeолучаю из нее значения точки(pointsnt1) и куда можно пойти(pointsnt2)
    for i in cur:  # проход по данным
        po = i[0]  # точка
        zn = i[1].split(";")  # пути хранятся как строка 1 значение - точка 2- время ;- разделитель
        mas = []
        for i in range(len(zn)):
            if ',' in zn[i]:
                mas.append([zn[i], int(zn[i + 1])])  # добавляю точку и время
        s[po] = mas  # сохраняю куда можно пойти из точки
    ti = json.loads(request.body.decode('utf-8'))
    points = list(map(lambda x: x.split(",")[0] + ", " + x.split(",")[1], ti['point']))
    coordinates = ['55.828598, 37.633872', '55.826591, 37.638033', '55.828660, 37.631427', '55.828794, 37.629733', '55.829620, 37.629884', '55.830684, 37.633393', '55.829970, 37.633791', '55.830239, 37.629268', '55.830932, 37.632602', '55.832645, 37.627215', '55.830853, 37.638237', '55.833840, 37.626198', '55.833371, 37.634525', '55.834870, 37.622146', '55.834312, 37.621751', '55.834872, 37.618655', '55.834919, 37.619728', '55.835751, 37.618203', '55.832246, 37.616529', '55.833743, 37.619619', '55.832016, 37.623054', '55.835031, 37.623354', '55.831419, 37.623967', '55.834418, 37.630189', '55.837183, 37.621347', '55.837340, 37.622524', '55.837271, 37.624137', '55.838276, 37.623398', '55.838423, 37.614388', '55.839378, 37.616988', '55.838345, 37.628216', '55.839657, 37.621512', '55.839842, 37.619280', '55.832802, 37.629093', '55.835137, 37.627619', '55.832879, 37.631125', '55.828071, 37.647093', '55.827657, 37.626905', '55.828991, 37.642187', '55.828891, 37.627317', '55.828567, 37.630269', '55.829244, 37.629485', '55.829057, 37.628350', '55.830965, 37.628065', '55.831259, 37.627590', '55.832086, 37.625830', '55.831620, 37.626761', '55.830584, 37.622835', '55.832932, 37.621971', '55.832293, 37.620564', '55.829880, 37.635126', '55.832096, 37.617334', '55.831620, 37.631933', '55.833999, 37.630874', '55.833743, 37.631765', '55.836250, 37.627064', '55.834623, 37.628492', '55.836447, 37.622284', '55.838056, 37.624042', '55.838080, 37.622197', '55.837745, 37.619406', '55.838117, 37.620536', '55.837736, 37.620801', '55.840597, 37.625439', '55.836729, 37.628041', '55.836290, 37.616420', '55.834544, 37.612828', '55.837202, 37.619229', '55.830596, 37.628529', '55.823294, 37.639853', '55.823307, 37.631855', '55.833269, 37.628130', '55.835356, 37.622432', '55.833865, 37.628170', '55.824657, 37.614676', '55.831551, 37.617536', '55.826249, 37.637578', '55.834308, 37.623085', '55.833797, 37.623099', '55.834795, 37.623318', '55.838737, 37.625993', '55.834053, 37.622287', '55.838709, 37.626129', '55.839471, 37.620766', '55.839383, 37.620423', '55.831634, 37.624829', '55.832679, 37.619946', '55.828572, 37.628616', '55.828042, 37.634724', '55.835889, 37.636454', '55.839444, 37.618289', '55.834460, 37.616695', '55.834677, 37.624594', '55.836379, 37.636386']
    for i in range(len(points)):
        a = points[i].split(",")
        for y in range(len(coordinates)):
            if a[0] in coordinates[y] and a[1] in coordinates[y]:
                points[i] = coordinates[y]

    ti = int(ti['time'])
    for i in s:
        print(len(s[i]), i)
    a = o_gr(s, ti, "55.826249, 37.637578", points=points)
    if request.method == "GET":
        return JsonResponse(a)
    if request.method == "POST":
        return JsonResponse(a)