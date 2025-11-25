// ----------------------
// 1) Harita Kurulumu (NYC Odaklı)
// ----------------------
// Harita altlığını 'CartoDB Dark Matter' yaparak o havalı siyah temayı sağlıyoruz.
let map = L.map('map').setView([40.730610, -73.935242], 12); // New York Merkezi

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// ----------------------
// 2) Özelleştirilmiş İkonlar (Renkli Markerlar)
// ----------------------
const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// ----------------------
// 3) Oyun Verisi (NYC Taksi Senaryoları)
// ----------------------
const missions = [
    { id: 1, pickup: [40.7580, -73.9855], dropoff: [40.7829, -73.9654], hint: "Times Square -> Central Park" },
    { id: 2, pickup: [40.7061, -74.0092], dropoff: [40.7484, -73.9857], hint: "Wall St -> Empire State" },
    { id: 3, pickup: [40.7127, -74.0134], dropoff: [40.7118, -74.0131], hint: "WTC -> Memorial" },
    { id: 4, pickup: [40.7295, -73.9965], dropoff: [40.7505, -73.9934], hint: "NYU -> Penn Station" }
];

// ----------------------
// 4) Oyun Değişkenleri
// ----------------------
let timer = 60;
let score = 0;
let lives = 3;
let selectedPickup = null;
let gameStarted = false;
let timerInterval = null;
let markersLayer = L.layerGroup().addTo(map); // Markerları temizlemek kolay olsun diye grup yaptık

// ----------------------
// 5) Markerları Yükle
// ----------------------
function loadGame() {
    markersLayer.clearLayers(); // Eski markerları temizle
    
    missions.forEach(mission => {
        // --- Pickup Marker (Yeşil) ---
        let pMarker = L.marker(mission.pickup, { icon: pickupIcon, opacity: 0 }).addTo(markersLayer);
        pMarker.gameId = mission.id;
        pMarker.type = "pickup";
        pMarker.bindPopup(`<b>🚖 Müşteri Bekliyor!</b><br>Hedef: ${mission.hint}`);
        
        pMarker.on('click', () => {
            if(!gameStarted) return;
            selectedPickup = pMarker;
            pMarker.openPopup();
            // Görsel seçim efekti (Opaklık değişimi)
            markersLayer.eachLayer(layer => layer.setOpacity(0.4)); 
            pMarker.setOpacity(1);
        });

        // --- Dropoff Marker (Kırmızı) ---
        let dMarker = L.marker(mission.dropoff, { icon: dropoffIcon, opacity: 0 }).addTo(markersLayer);
        dMarker.gameId = mission.id;
        dMarker.type = "dropoff";
        dMarker.bindPopup(`<b>🏁 Hedef Nokta</b><br>${mission.hint}`);

        dMarker.on('click', () => {
            if(!gameStarted || !selectedPickup) return;
            checkMatch(selectedPickup, dMarker);
        });
    });
}

// ----------------------
// 6) Eşleşme Kontrolü (Oyun Mantığı)
// ----------------------
function checkMatch(pickup, dropoff) {
    if (pickup.gameId === dropoff.gameId) {
        // --- DOĞRU ---
        score += 100;
        document.getElementById('score').textContent = `SCORE: ${score}`;
        
        // Başarılı Rotayı Çiz (Sarı Çizgi)
        L.polyline([pickup.getLatLng(), dropoff.getLatLng()], {
            color: '#f7b500', // Taksi Sarısı
            weight: 5,
            dashArray: '10, 10'
        }).addTo(map);

        // Markerları kaldır
        markersLayer.removeLayer(pickup);
        markersLayer.removeLayer(dropoff);
        selectedPickup = null;

        // Reset Opacity
        markersLayer.eachLayer(layer => layer.setOpacity(1));

        // Kazanma Kontrolü
        if (score === missions.length * 100) endGame(true);

    } else {
        // --- YANLIŞ ---
        lives--;
        updateLives();
        dropoff.bindPopup("❌ Yanlış Hedef!").openPopup();
        if (lives <= 0) endGame(false);
    }
}

function updateLives() {
    let hearts = "🚕 ".repeat(lives);
    document.getElementById('lives').textContent = `LIVES: ${hearts}`;
}

// ----------------------
// 7) Başlat / Bitir / Zamanlayıcı
// ----------------------
document.getElementById('startBtn').addEventListener('click', () => {
    if(gameStarted) return;
    gameStarted = true;
    timer = 60;
    score = 0;
    lives = 3;
    selectedPickup = null;
    
    // UI Güncelle
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('score').textContent = `SCORE: 0`;
    document.getElementById('timer').textContent = `TIMER: 60s`;
    updateLives();

    // Haritayı Temizle ve Markerları Göster
    map.eachLayer(layer => { if(layer instanceof L.Polyline) map.removeLayer(layer); }); // Çizgileri sil
    loadGame();
    markersLayer.eachLayer(layer => layer.setOpacity(1)); // Görünür yap

    // Zamanlayıcıyı Başlat
    timerInterval = setInterval(() => {
        timer--;
        document.getElementById('timer').textContent = `TIMER: ${timer}s`;
        if (timer <= 0) endGame(false);
    }, 1000);
});

function endGame(won) {
    gameStarted = false;
    clearInterval(timerInterval);
    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('startBtn').textContent = won ? "YOU WON! Play Again" : "GAME OVER - Try Again";
    alert(won ? `🎉 Tebrikler! Puanın: ${score}` : "❌ Süre bitti veya kaza yaptın!");
}

// Sayfa yüklenince markerları gizli şekilde hazırla
loadGame();
