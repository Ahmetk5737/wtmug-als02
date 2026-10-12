// --- 1. Ekran Renk Testi ---
const overlay = document.getElementById('color-overlay');

function openColorTest(color) {
    overlay.style.display = 'flex';
    const colors = { red: '#ff0000', green: '#00ff00', blue: '#0000ff', white: '#ffffff', black: '#000000' };
    overlay.style.backgroundColor = colors[color] || '#000';
}

function closeColorTest() {
    overlay.style.display = 'none';
}

// --- 2. Dokunmatik Testi ---
const touchPad = document.getElementById('touch-pad');

function handleTouch(e) {
    e.preventDefault();
    touchPad.querySelectorAll('.touch-point').forEach(p => p.remove());
    const rect = touchPad.getBoundingClientRect();

    for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            const point = document.createElement('div');
            point.className = 'touch-point';
            point.style.left = `${x}px`;
            point.style.top = `${y}px`;
            touchPad.appendChild(point);
        }
    }
}

touchPad.addEventListener('touchstart', handleTouch, { passive: false });
touchPad.addEventListener('touchmove', handleTouch, { passive: false });
touchPad.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (e.touches.length === 0) {
        touchPad.querySelectorAll('.touch-point').forEach(p => p.remove());
    } else {
        handleTouch(e);
    }
}, { passive: false });

function resetTouchPad() {
    touchPad.querySelectorAll('.touch-point').forEach(p => p.remove());
}

// --- 3. Hoparlör Testi ---
function playAudioTone() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.0);
    } catch (e) {
        alert('Ses çalınamadı: ' + e.message);
    }
}

// --- 4. Mikrofon Testi ---
async function startMicTest() {
    const statusEl = document.getElementById('mic-status');
    const levelEl = document.getElementById('mic-level');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        statusEl.textContent = 'Durum: Mikrofon aktif, konuşun...';

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        audioCtx.createMediaStreamSource(stream).connect(analyser);
        analyser.fftSize = 256;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        function checkLevel() {
            analyser.getByteFrequencyData(dataArray);
            let sum = dataArray.reduce((acc, val) => acc + val, 0);
            let percentage = Math.min(100, (sum / dataArray.length / 50) * 100);
            levelEl.style.width = percentage + '%';
            requestAnimationFrame(checkLevel);
        }
        checkLevel();
    } catch (err) {
        statusEl.textContent = 'Durum: Mikrofon izni reddedildi.';
    }
}

// --- 5. Titreşim Testi ---
function vibrateDevice(duration) {
    if ("vibrate" in navigator) {
        navigator.vibrate(duration);
    } else {
        alert("Bu cihaz titreşim desteklemiyor.");
    }
}

function vibratePattern() {
    if ("vibrate" in navigator) {
        navigator.vibrate([100, 50, 100, 50, 200]);
    } else {
        alert("Bu cihaz titreşim desteklemiyor.");
    }
}

// --- 6. İnternet Bağlantısı Testi ---
const networkStatusEl = document.getElementById('network-status');

function updateNetworkStatus() {
    const online = navigator.onLine;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    let info = `Durum: ${online ? '🟢 Çevrimiçi' : '🔴 Çevrimdışı'}<br>`;
    if (connection) {
        info += `Bağlantı Türü: ${connection.effectiveType || 'Bilinmiyor'}<br>`;
        info += `Gecikme (RTT): ${connection.rtt ? connection.rtt + ' ms' : 'Bilinmiyor'}`;
    }
    networkStatusEl.innerHTML = info;
}

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);
updateNetworkStatus();

// --- 7. Cihaz & Pil Bilgisi ---
async function loadDeviceInfo() {
    const infoEl = document.getElementById('device-info');
    let info = `User Agent: ${navigator.userAgent.substring(0, 55)}...<br>`;
    info += `Dil: ${navigator.language}<br>`;

    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            info += `Pil Seviyesi: %${Math.round(battery.level * 100)} (${battery.charging ? 'Şarjda' : 'Şarjda Değil'})`;
        } catch (e) {
            info += `Pil Bilgisi: Alınamadı`;
        }
    } else {
        info += `Pil API: Desteklenmiyor`;
    }
    infoEl.innerHTML = info;
}

loadDeviceInfo();