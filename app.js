document.addEventListener('DOMContentLoaded', () => {

    var amaranteCoordinates = [41.2721, -8.0826];
// Config do mapa
    var map = L.map('map', {
        center: amaranteCoordinates,
        zoom: 14,
        minZoom: 12,
        maxZoom: 20
    });
// Tilelayer pra colocar o mapa na tela
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Projeto Limpezas - Amarante <a href="https://github.com/zeca410/projeto1">Código Fonte</a>'
    }).addTo(map);
// Limites Latlng do mapa
    var southWest = L.latLng(41.2611, -8.1016),
        northEast = L.latLng(41.2831, -8.0636);
    var bounds = L.latLngBounds(southWest, northEast);

    map.setMaxBounds(bounds);

    var waypoints = [];
    var routeControl = null;

    function updateRoute() {
        if (routeControl) {
            map.removeControl(routeControl);
        }
        if (waypoints.length == 2) {
            routeControl = L.Routing.control({
                waypoints: waypoints,
                show: false,
                createMarker: function (i, waypoint, n) {
                    return L.marker(waypoint.latLng, { draggable: true })
                        .on('dragend', function (e) {
                            waypoints[i] = e.target.getLatLng();
                            updateRoute();
                        });
                },
                routeWhileDragging: true
            }).addTo(map);

            routeControl.on('routesfound', function (e) {
                var routes = e.routes;
                var summary = routes[0].summary;
                document.getElementById('total-distance').innerText = Math.round(summary.totalDistance);
                updateRemainingDistance();
            });
        }
    }
// funcao de clique do mapa
    map.on('click', function (e) {
        if (waypoints.length < 2) {
            waypoints.push(e.latlng);
            updateRoute();
        }
    });
// Funcoes dos botoes da interface^
// Atualizar Progresso
    document.getElementById('update-button').addEventListener('click', function () {
        // implementar if depois
        updateRemainingDistance();
    });
// Salvar dados e funcao
    document.getElementById('save-data').addEventListener('click', function () {
        var data = {
            waypoints: waypoints.map(latlng => [latlng.lat, latlng.lng]),
            totalDistance: document.getElementById('total-distance').innerText,
            cleanedDistance: document.getElementById('cleaned-distance').value,
            remainingDistance: document.getElementById('remaining-distance').innerText
        };
        var blob = new Blob([JSON.stringify(data)], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "dados_limpeza.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
// Carregar Dados
    document.getElementById('load-data').addEventListener('click', function () {
        document.getElementById('file-input').click();
    });
// Funcao de ler os dados carregados
    document.getElementById('file-input').addEventListener('change', function (e) {
        var file = e.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var data = JSON.parse(e.target.result);
                waypoints = data.waypoints.map(coords => L.latLng(coords[0], coords[1]));
                document.getElementById('total-distance').innerText = data.totalDistance;
                document.getElementById('cleaned-distance').value = data.cleanedDistance;
                document.getElementById('remaining-distance').innerText = data.remainingDistance;
                updateRoute();
            };
            reader.readAsText(file);
        }
    });
// funcao da distancia restante
    function updateRemainingDistance() {
        var totalDistance = parseInt(document.getElementById('total-distance').innerText);
        var cleanedDistance = parseInt(document.getElementById('cleaned-distance').value);
        var remainingDistance = totalDistance - cleanedDistance;
        document.getElementById('remaining-distance').innerText = remainingDistance;
    }
});
