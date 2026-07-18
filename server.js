const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Web sayfasının görüntülenebilmesi için index.html dosyasını sunucuya tanıtıyoruz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public.html'));
    

// Oyuncuların aktif durumlarını tutacak liste
let oyuncular = {};

// Bir oyuncu oyuna (web sitesine) bağlandığında çalışacak alan
io.on('connection', (socket) => {
    console.log('Yeni bir oyuncu bağlandı! ID: ' + socket.id);

    // Oyuncu bir ülke seçtiğinde
    socket.on('ulkeSec', (secilenUlke) => {
        oyuncular[socket.id] = secilenUlke;
        // Tüm oyunculara kimin hangi ülkeyi aldığını duyur
        io.emit('sistemMesaji', `🌍 Bir oyuncu <b>${secilenUlke}</b> ülkesinin yönetimini devraldı!`);
    });

    // Bir oyuncu hamle yapıp "Turu İlerlet" butonuna bastığında
    socket.on('hamleYap', (data) => {
        // Yapılan hamleyi ve yazılan özel emri odadaki diğer 2 arkadaşına da anlık gönder
        io.emit('yeniOlay', {
            yapan: oyuncular[socket.id] || "Bilinmeyen Ülke",
            hedef: data.hedef,
            eylem: data.eylem,
            emir: data.emir
        });
    });

    // Oyuncu sekmesini kapattığında
    socket.on('disconnect', () => {
        if (oyuncular[socket.id]) {
            io.emit('sistemMesaji', `❌ <b>${oyuncular[socket.id]}</b> lideri masadan kalktı.`);
            delete oyuncular[socket.id];
        }
    });
});

// Sunucuyu 3000 portunda başlatıyoruz
const PORT = 3000;
http.listen(PORT, () => {
    console.log(`Oyun sunucusu hazır! Arkadaşlarınla oynamak için tarayıcıdan http://localhost:${PORT} adresine git.`);
});
