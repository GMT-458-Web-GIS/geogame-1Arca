// ----------------------
// 1) Leaflet Map Setup
// ----------------------
// Haritayı biraz daha karanlık moda (CartoDB DarkMatter) çekebiliriz ama şimdilik OSM kalsın.
let map = L.map('map').setView([40.725, -74.000], 13);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// ----------------------
// 2) Custom Icons (Renkli Markerlar)
// ----------------------
const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// ----------------------
// 3) Game Data & Variables
// ----------------------
let timer = 60;
let score = 0;
let lives = 3;
let selectedPickup = null;
let gameStarted = false;
let timerInterval = null;

let pickupMarkers = [];
let dropoffMarkers = [];
let routeLines = []; // Çizilen rotaları tutmak için

// Veriyi zenginleştirdik: İpucu (hint) ekledik.
const gameData = [
    {
        id: 0,
        pickup: [40.730, -73.995],
        dropoff: [40.715, -74.015],
        hint: "Target: Financial District"
    },
    {
        id: 1,
        pickup: [40.741, -74.003],
        dropoff: [40.722, -73.987],
        hint: "Target: East Village"
    },
    {
        id: 2,
        pickup: [40.749, -73.984],
        dropoff: [40.732, -73.999],
        hint: "Target: Washington Square"
    },
    {
        id: 3, 
        pickup: [40.758, -73.985], // Times Square civarı
        dropoff: [40.782, -73.965], // Central Park
        hint: "Target: Central Park"
    }
];

// ----------------------
// 4) Load Markers
// ----------------------
function loadMarkers() {
    // Öncekileri temizle
    pickupMarkers.forEach(m => map.removeLayer(m));
    dropoffMarkers.forEach(m => map.removeLayer(m));
    routeLines.forEach(l => map.removeLayer(l));
    
    pickupMarkers = [];
    dropoffMarkers = [];
    routeLines = [];

    gameData.forEach((data) => {
        // Pickup Marker (Yeşil)
        let pMarker = L.marker(data.pickup, { icon: greenIcon, opacity: 0 }).addTo(map);
        pMarker.gameId = data.id;
        pMarker.type = "pickup";
        pMarker.bindPopup(`<b>Müşteri Bekliyor!</b><br>Hedef: ${data.hint}`);
        
        pMarker.on("click", () => handlePickupClick(pMarker));
        pickupMarkers.push(pMarker);

        // Dropoff Marker (Kırmızı)
        let dMarker = L.marker(data.dropoff, { icon: redIcon, opacity: 0 }).addTo(map);
        dMarker.gameId = data.id;
        dMarker.type = "dropoff";
        dMarker.bindPopup(`<b>İniş Noktası</b><br>${data.hint}`);
        
        dMarker.on("click", () => handleDropoffClick(dMarker));
        dropoffMarkers.push(dMarker);
    });
}

// ----------------------
// 5) Interactions
// ----------------------
function handlePickupClick(marker) {
    if (!gameStarted) return;

    selectedPickup = marker;
    marker.openPopup(); // İpucunu göster

    // Seçim efekti: Diğerlerini soluklaştır
    pickupMarkers.forEach(m => m.setOpacity(0.4));
    marker.setOpacity(1);
}

function handleDropoffClick(marker) {
    if (!gameStarted || !selectedPickup) {
        marker.bindPopup("Önce bir yolcu (Yeşil) seçmelisin!").openPopup();
        return;
    }

    // MATCHING LOGIC
    if (marker.gameId === selectedPickup.gameId) {
        // --- DOĞRU EŞLEŞME ---
        score += 100;
        document.getElementById("score").textContent = `SCORE: ${score}`;

        // Görsel Efekt: Çizgi Çiz (Polyline)
        let route = L.polyline([selectedPickup.getLatLng(), marker.getLatLng()], {
            color: '#f7b500', // Taksi Sarısı
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 10' // Kesikli çizgi
        }).addTo(map);
        
        routeLines.push(route);
        
        // Markerları kaldır (veya kalıcı hale getirip etkileşimi kapatabiliriz)
        map.removeLayer(selectedPickup);
        map.removeLayer(marker);
        
        // Diziden çıkar ki tekrar tıklanmasın (basit yöntem)
        // (Daha kompleks bir state yönetimi yapılabilir ama bu yeterli)

        checkWin();
    } else {
        // --- YANLIŞ EŞLEŞME ---
        lives--;
        updateLives();
        marker.bindPopup("❌ Yanlış Hedef!").openPopup();

        if (lives <= 0) {
            endGame(false);
        }
    }

    // Reset selection
    selectedPickup = null;
    pickupMarkers.forEach(m => {
        if(map.hasLayer(m)) m.setOpacity(1); // Sadece haritada kalanları düzelt
    });
}

function checkWin() {
    // Tüm pickup markerları haritadan silindiyse kazanmıştır
    // (Not: map.hasLayer kontrolü daha sağlıklı olur)
    let remaining = pickupMarkers.filter(m => map.hasLayer(m)).length;
    if (remaining === 0) {
        endGame(true);
    }
}

// ----------------------
// 6) UI Updates
// ----------------------
function updateLives() {
    let heartStr = "";
    for (let i = 0; i < lives; i++) heartStr += "🚕 "; // Kalp yerine Taksi ikonu
    document.getElementById("lives").textContent = `LIVES: ${heartStr}`;
}

// ----------------------
// 7) Game Loop
// ----------------------
document.getElementById("startBtn").addEventListener("click", () => {
    if (gameStarted) return; // Zaten başladıysa engelle

    gameStarted = true;
    timer = 60;
    score = 0;
    lives = 3;
    selectedPickup = null;

    // UI Reset
    document.getElementById("timer").textContent = `TIMER: ${timer}s`;
    document.getElementById("score").textContent = `SCORE: ${score}`;
    updateLives();
    document.getElementById("startBtn").style.display = "none"; // Butonu gizle

    // Markerları Görünür Yap
    loadMarkers(); // Yeniden yükle
    pickupMarkers.forEach(m => m.setOpacity(1));
    dropoffMarkers.forEach(m => m.setOpacity(1));

    startTimer();
});

function startTimer() {
    if (timerInterval) clearInterval(timerInterval); // Öncekini temizle
    
    timerInterval = setInterval(() => {
        timer--;
        document.getElementById("timer").textContent = `TIMER: ${timer}s`;

        if (timer <= 0) {
            clearInterval(timerInterval);
            endGame(false);
        }
    }, 1000);
}

function endGame(won) {
    gameStarted = false;
    clearInterval(timerInterval);
    document.getElementById("startBtn").style.display = "inline-block"; // Butonu geri getir
    document.getElementById("startBtn").textContent = "Restart Game";

    if (won) {
        alert(`🎉 HARİKA! Puanın: ${score}\nTüm yolcuları zamanında yetiştirdin.`);
    } else {
        alert("❌ OYUN BİTTİ! Süre doldu veya kaza yaptın.");
    }
}

// Başlangıçta yükle ama gizli kalsınlar
loadMarkers();