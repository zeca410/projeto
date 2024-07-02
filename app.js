document.addEventListener('DOMContentLoaded', () => {
    var amaranteCoordinates = [41.2721, -8.0826];

    var map = L.map('map', {
        center: amaranteCoordinates,
        zoom: 15,
        minZoom: 14,
        maxZoom: 18
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

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
                show:false,
                createMarker: function (i, waypoint, n) {
                    return L.marker(waypoint.latLng, { draggable: true })
                    show:false
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

    map.on('click', function (e) {
        if (waypoints.length < 2) {
            waypoints.push(e.latlng);
            updateRoute();
        }
    });

    document.getElementById('update-button').addEventListener('click', function () {
        updateRemainingDistance();
    });

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

    document.getElementById('load-data').addEventListener('click', function () {
        document.getElementById('file-input').click();
    });

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

    function updateRemainingDistance() {
        var totalDistance = parseInt(document.getElementById('total-distance').innerText);
        var cleanedDistance = parseInt(document.getElementById('cleaned-distance').value);
        var remainingDistance = totalDistance - cleanedDistance;
        document.getElementById('remaining-distance').innerText = remainingDistance;
    }
});
