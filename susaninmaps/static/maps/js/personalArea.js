function showRouteFromHistory(element){
    localStorage.setItem('route', element.closest('#route').dataset.pointsLocation);
    window.location.href = '\\';
}

const csrftoken = getCookie('csrftoken');

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

// Удаление маршрута.
function removeRoute(element, fromHistory=false) {
    parent = element.closest('#route');
    
    var path = 'remove/';
    if (fromHistory) { path = '../removeFromHistory/'; }

    postData(path, {
        'id': parent.dataset.id,
        state: 'inactive'
    });

    parent.remove();
}
