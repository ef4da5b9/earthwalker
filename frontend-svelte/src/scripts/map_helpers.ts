import * as L from 'leaflet';

// 0 <= hue int < 360
function showGuessOnMap(map, guess, actual, roundNum, nickname, hue, focus=false) {
    let polyline = L.polyline([[guess.Location.Lat, guess.Location.Lng], [actual.Location.Lat, actual.Location.Lng]], {color: '#007bff'}).addTo(map);
    L.marker([guess.Location.Lat, guess.Location.Lng], {
        title: nickname,
        icon: makeIcon(roundNum + 1, hue),
    }).addTo(map).openPopup();
    L.marker([actual.Location.Lat, actual.Location.Lng], {
        title: "Actual Position",
        icon: makeIcon("!", hue),
    }).addTo(map).openPopup();
    if (focus) {
        map.fitBounds(polyline.getBounds(), {padding: [20, 20]});
    }
}

let makeIcon = function(text, hue) {
    return L.icon({
    iconUrl: svgIcon(text, hue),
    iconSize: [48, 48],
    iconAnchor: [24, 44],
    shadowUrl: "public/leaflet/images/marker-shadow.png",
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
    });
};

function svgIcon(text, hue) {
    return `data:image/svg+xml,
    <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 0 24 24" width="48px">
        <path fill="hsl(${hue}, 90%, 40%)" stroke="black" stroke-width="0.5px" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="'sans-serif'" fill="white" font-size="0.8em">
            ${text}
        </text>
    </svg>`
}

function showPolygonOnMap(layer, polygon) {
    layer.clearLayers();
    return L.geoJSON(polygon).addTo(layer);
}

export { showGuessOnMap, makeIcon, showPolygonOnMap };