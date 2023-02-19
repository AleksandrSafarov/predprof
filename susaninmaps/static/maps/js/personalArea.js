function showRouteFromHistory(element){
    localStorage.setItem('route', element.closest('#route').dataset.pointsLocation);
    window.location.href = '\\';
}