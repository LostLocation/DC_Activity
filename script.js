// ===== OKEY OYUNU SINIFI =====
class OkeyGame {
    constructor() {
        this.tiles = [];
        this.hand = [];
        this.pile = [];
        this.discarded = [];
        this.turn = 0;
        this.selectedTileIndex = -1;
        this.gameActive = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.addMessage('🎮 Okey oyununa hoş geldiniz! Yeni oyun başlatın.', 'info');
    }

    // ===== ELEMENT İNİSYALİZASYONU =====
    initializeElements() {
        this.elements = {
            startGame: document.getElementById('start-game'),
            drawTile: document.getElementById('draw-tile'),
            discardTile: document.getElementById('discard-tile'),
            winGame: document.getElementById('win-game'),
            endGame: document.getElementById('end-game'),
            playerHand: document.getElementById('player-hand'),
            messages: document.getElementById('messages'),
            turnCount: document.getElementById('turn-count'),
            handCount: document.getElementById('hand-count'),
            pileCount: document.getElementById('pile-count'),
            gameStatus: document.getElementById('game-status'),
            lastDiscarded: document.getElementById('last-discarded'),
            noDiscarded: document.getElementById('no-discarded')
        };
    }

    // ===== EVENT LİSTENERLARI =====
    attachEventListeners() {
        this.elements.startGame.addEventListener('click', () => this.startNewGame());
        this.elements.drawTile.addEventListener('click', () => this.drawTile());
        this.elements.discardTile.addEventListener('click', () => this.discardSelectedTile());
        this.elements.winGame.addEventListener('click', () => this.attemptWin());
        this.elements.endGame.addEventListener('click', () => this.endGame());
    }

    // ===== OKEY SETİ OLUŞTURMA =====
    createOkeySet() {
        const colors = ['red', 'blue', 'yellow', 'black'];
        const colorEmojis = ['🔴', '🔵', '🟡', '⚫'];
        const tiles = [];

        // Normal taşlar (1-13 arası, her sayıdan 2 adet, 4 renkte)
        for (let num = 1; num <= 13; num++) {
            for (let color = 0; color < 4; color++) {
                for (let copy = 0; copy < 2; copy++) {
                    tiles.push({
                        number: num,
                        color: colors[color],
                        emoji: colorEmojis[color],
                        isJoker: false,
                        display: `${colorEmojis[color]}${num}`
                    });
                }
            }
        }

        // Joker taşları
        tiles.push({ 
            number: 0, 
            color: 'joker', 
            emoji: '🃏', 
            isJoker: true, 
            display: '🃏' 
        });
        tiles.push({ 
            number: 0, 
            color: 'joker', 
            emoji: '🃏', 
            isJoker: true, 
            display: '🃏' 
        });

        return tiles;
    }

    // ===== TAŞLARI KARIŞTIRMA =====
    shuffleTiles(tiles) {
        const shuffled = [...tiles];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // ===== YENİ OYUN BAŞLATMA =====
    startNewGame() {
        this.tiles = this.createOkeySet();
        this.tiles = this.shuffleTiles(this.tiles);
        this.hand = this.tiles.slice(0, 14);
        this.pile = this.tiles.slice(14);
        this.discarded = [];
        this.turn = 1;
        this.selectedTileIndex = -1;
        this.gameActive = true;

        this.updateUI();
        this.renderHand();
        this.updateDiscardedPile();
        this.addMessage('🎮 Yeni oyun başladı! İlk olarak bir taş çekin.', 'success');
        
        // Buton durumları
        this.elements.startGame.disabled = true;
        this.elements.drawTile.disabled = false;
        this.elements.endGame.disabled = false;
        this.elements.discardTile.disabled = true;
        this.elements.winGame.disabled = true;
        this.elements.gameStatus.textContent = 'Taş Çek';
    }

    // ===== TAŞ ÇEKME =====
    drawTile() {
        if (!this.gameActive) {
            this.addMessage('❌ Oyun aktif değil!', 'error');
            return;
        }

        if (this.hand.length >= 15) {
            this.addMessage('❌ Elinizde zaten 15 taş var! Önce bir taş atın.', 'error');
            return;
        }

        if (this.pile.length === 0) {
            this.addMessage('❌ Yığında taş kalmadı! Oyun berabere bitti.', 'error');
            this.endGame();
            return;
        }

        const drawnTile = this.pile.pop();
        this.hand.push(drawnTile);

        this.updateUI();
        this.renderHand();
        this.addMessage(`🃏 Taş çekildi: ${drawnTile.display}`, 'info');

        // Buton durumları güncelle
        this.elements.drawTile.disabled = true;
        this.elements.discardTile.disabled = false;
        this.elements.winGame.disabled = false;
        this.elements.gameStatus.textContent = 'Taş At';
    }

    // ===== SEÇİLİ TAŞI ATMA =====
    discardSelectedTile() {
        if (!this.gameActive) {
            this.addMessage('❌ Oyun aktif değil!', 'error');
            return;
        }

        if (this.selectedTileIndex === -1) {
            this.addMessage('❌ Atacak taş seçin!', 'error');
            return;
        }

        const discardedTile = this.hand.splice(this.selectedTileIndex, 1)[0];
        this.discarded.push(discardedTile);
        this.selectedTileIndex = -1;
        this.turn++;

        this.updateUI();
        this.renderHand();
        this.updateDiscardedPile();
        this.addMessage(`🗑️ Taş atıldı: ${discardedTile.display}`, 'info');

        // Buton durumları güncelle
        this.elements.drawTile.disabled = false;
        this.elements.discardTile.disabled = true;
        this.elements.winGame.disabled = true;
        this.elements.gameStatus.textContent = 'Taş Çek';
    }

    // ===== BİTİ YAPMA DENEMESİ =====
    attemptWin() {
        if (!this.gameActive) {
            this.addMessage('❌ Oyun aktif değil!', 'error');
            return;
        }

        if (this.hand.length !== 14) {
            this.addMessage('❌ Biti yapmak için elinizde tam 14 taş olmalı!', 'error');
            return;
        }

        const isValidWin = this.checkWin();
        
        if (isValidWin) {
            this.showWinAnimation();
            this.addMessage(`🏆 TEBRİKLER! ${this.turn} turda biti yaptınız!`, 'success');
            setTimeout(() => this.endGame(), 3000);
        } else {
            this.addMessage('❌ Eliniz biti için uygun değil. Dörtlü ve sıralı gruplar oluşturun!', 'error');
        }
    }

    // ===== BİTİ KONTROLÜ =====
    checkWin() {
        // Basitleştirilmiş biti kontrolü
        // Gerçek oyunda daha karmaşık algoritma gerekir
        
        const numberCounts = {};
        let jokerCount = 0;
        
        // Taşları sayma
        this.hand.forEach(tile => {
            if (tile.isJoker) {
                jokerCount++;
                return;
            }
            
            if (!numberCounts[tile.number]) {
                numberCounts[tile.number] = new Set();
            }
            numberCounts[tile.number].add(tile.color);
        });

        // En az bir dörtlü var mı kontrol et
        for (let number in numberCounts) {
            const uniqueColors = numberCounts[number].size;
            // Jokerlar ile beraber 4 farklı renk olabilir mi?
            if (uniqueColors + jokerCount >= 4) {
                return true; // Dörtlü yapılabilir
            }
            // Tam 4 farklı renk var mı?
            if (uniqueColors === 4) {
                return true; // Dörtlü var
            }
        }

        // Bu basit kontrol, gerçek oyunda daha gelişmiş olmalı
        return false;
    }

    // ===== KAZANMA ANİMASYONU =====
    showWinAnimation() {
        const winDiv = document.createElement('div');
        winDiv.className = 'win-animation';
        winDiv.innerHTML = `
            <div class="win-content">
                <h2>🏆 TEBRİKLER! 🏆</h2>
                <p>Biti yaptınız!</p>
                <p>Tur: ${this.turn}</p>
            </div>
        `;
        document.body.appendChild(winDiv);

        // Animasyonu 3 saniye sonra kaldır
        setTimeout(() => {
            if (document.body.contains(winDiv)) {
                document.body.removeChild(winDiv);
            }
        }, 3000);
    }

    // ===== OYUNU SONLANDIRMA =====
    endGame() {
        this.gameActive = false;
        this.selectedTileIndex = -1;

        // Buton durumlarını sıfırla
        this.elements.startGame.disabled = false;
        this.elements.drawTile.disabled = true;
        this.elements.discardTile.disabled = true;
        this.elements.winGame.disabled = true;
        this.elements.endGame.disabled = true;
        this.elements.gameStatus.textContent = 'Oyun Bitti';

        this.addMessage('🛑 Oyun sonlandı. Yeni oyun başlatabilirsiniz.', 'info');
    }

    // ===== TAŞ SEÇİMİ =====
    selectTile(index) {
        if (!this.gameActive) return;

        // Aynı taşa tıklanırsa seçimi kaldır
        this.selectedTileIndex = this.selectedTileIndex === index ? -1 : index;
        this.renderHand();

        // Seçim durumunu güncelle
        if (this.selectedTileIndex !== -1) {
            this.addMessage(`✅ Taş seçildi: ${this.hand[this.selectedTileIndex].display}`, 'info');
        }
    }

    // ===== ELİ RENDER ETME =====
    renderHand() {
        this.elements.playerHand.innerHTML = '';

        if (this.hand.length === 0) {
            this.elements.playerHand.innerHTML = `
                <div style="color: rgba(255,255,255,0.5); text-align: center; width: 100%;">
                    El boş
                </div>
            `;
            return;
        }

        // Taşları sırala (renk ve sayıya göre)
        const sortedIndices = this.hand.map((tile, index) => ({ tile, index }))
            .sort((a, b) => {
                // Jokerlar sona
                if (a.tile.isJoker && b.tile.isJoker) return 0;
                if (a.tile.isJoker) return 1;
                if (b.tile.isJoker) return -1;
                
                // Renk sıralaması
                const colorOrder = { red: 0, blue: 1, yellow: 2, black: 3 };
                if (a.tile.color !== b.tile.color) {
                    return colorOrder[a.tile.color] - colorOrder[b.tile.color];
                }
                
                // Sayı sıralaması
                return a.tile.number - b.tile.number;
            });

        // Sıralı taşları render et
        sortedIndices.forEach(({ tile, index }) => {
            const tileDiv = document.createElement('div');
            tileDiv.className = `tile ${tile.color}`;
            
            if (tile.isJoker) {
                tileDiv.classList.add('joker');
                tileDiv.textContent = '🃏';
            } else {
                tileDiv.innerHTML = `<div>${tile.emoji}</div><div>${tile.number}</div>`;
            }

            // Seçili taş vurgusu
            if (index === this.selectedTileIndex) {
                tileDiv.classList.add('selected');
            }

            // Tıklama olayı
            tileDiv.addEventListener('click', () => this.selectTile(index));
            this.elements.playerHand.appendChild(tileDiv);
        });
    }

    // ===== ATILAN TAŞLARI GÜNCELLEME =====
    updateDiscardedPile() {
        if (this.discarded.length > 0) {
            const lastTile = this.discarded[this.discarded.length - 1];
            this.elements.lastDiscarded.style.display = 'flex';
            this.elements.lastDiscarded.className = `discarded-tile ${lastTile.color}`;
            
            if (lastTile.isJoker) {
                this.elements.lastDiscarded.textContent = '🃏';
            } else {
                this.elements.lastDiscarded.innerHTML = `${lastTile.emoji}<br>${lastTile.number}`;
            }
            
            this.elements.noDiscarded.style.display = 'none';
        } else {
            this.elements.lastDiscarded.style.display = 'none';
            this.elements.noDiscarded.style.display = 'block';
        }
    }

    // ===== UI GÜNCELLEME =====
    updateUI() {
        this.elements.turnCount.textContent = this.turn;
        this.elements.handCount.textContent = this.hand.length;
        this.elements.pileCount.textContent = this.pile.length;
    }

    // ===== MESAJ EKLEME =====
    addMessage(text, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        
        this.elements.messages.appendChild(messageDiv);
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;

        // Mesaj sayısını sınırla (performans için)
        const messages = this.elements.messages.querySelectorAll('.message');
        if (messages.length > 15) {
            messages[0].remove();
        }
    }

    // ===== OYUN İSTATİSTİKLERİ =====
    getGameStats() {
        return {
            turn: this.turn,
            handSize: this.hand.length,
            pileSize: this.pile.length,
            discardedSize: this.discarded.length,
            gameActive: this.gameActive
        };
    }

    // ===== DEBUG BİLGİLERİ =====
    debugHand() {
        console.log('=== EL BİLGİLERİ ===');
        console.log('Taş sayısı:', this.hand.length);
        console.log('Seçili taş:', this.selectedTileIndex);
        console.log('Taşlar:', this.hand.map(t => t.display));
        
        // Renk dağılımı
        const colorCount = {};
        this.hand.forEach(tile => {
            if (!tile.isJoker) {
                colorCount[tile.color] = (colorCount[tile.color] || 0) + 1;
            }
        });
        console.log('Renk dağılımı:', colorCount);
        
        // Sayı dağılımı
        const numberCount = {};
        this.hand.forEach(tile => {
            if (!tile.isJoker) {
                numberCount[tile.number] = (numberCount[tile.number] || 0) + 1;
            }
        });
        console.log('Sayı dağılımı:', numberCount);
    }
}

// ===== YARDIMCI FONKSİYONLAR =====

// Klavye kısayolları
function setupKeyboardShortcuts(game) {
    document.addEventListener('keydown', (event) => {
        if (!game.gameActive) return;

        switch(event.key) {
            case 'd':
            case 'D':
                if (!game.elements.drawTile.disabled) {
                    game.drawTile();
                }
                break;
            case 'a':
            case 'A':
                if (!game.elements.discardTile.disabled) {
                    game.discardSelectedTile();
                }
                break;
            case 'w':
            case 'W':
                if (!game.elements.winGame.disabled) {
                    game.attemptWin();
                }
                break;
            case 'Escape':
                game.selectedTileIndex = -1;
                game.renderHand();
                break;
        }
    });
}

// Ses efektleri (opsiyonel)
function playSound(soundType) {
    // Web Audio API ile basit sesler oluşturulabilir
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Farklı ses türleri
        switch(soundType) {
            case 'draw':
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'discard':
                oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'win':
                // Kazanma melodisi
                const frequencies = [523, 659, 784, 1047];
                frequencies.forEach((freq, index) => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.2);
                    gain.gain.setValueAtTime(0.1, audioContext.currentTime + index * 0.2);
                    osc.start(audioContext.currentTime + index * 0.2);
                    osc.stop(audioContext.currentTime + index * 0.2 + 0.2);
                });
                break;
        }
    }
}

// Discord SDK entegrasyonu
function initDiscordSDK() {
    // Discord SDK mevcut ise entegre et
    if (typeof DiscordSDK !== 'undefined') {
        console.log('Discord SDK bulundu');
        
        // Activity güncelleme
        DiscordSDK.activity.setActivity({
            details: "Okey oyunu oynuyor",
            state: "Oyun içinde",
            assets: {
                large_image: "okey_icon",
                large_text: "Okey Oyunu"
            }
        }).catch(console.error);
        
        return true;
    } else {
        console.log('Discord SDK bulunamadı - normal web modunda çalışıyor');
        return false;
    }
}

// Local Storage için oyun kaydetme
function saveGame(game) {
    try {
        const gameData = {
            hand: game.hand,
            pile: game.pile,
            discarded: game.discarded,
            turn: game.turn,
            gameActive: game.gameActive,
            timestamp: Date.now()
        };
        localStorage.setItem('okeyGame', JSON.stringify(gameData));
        console.log('Oyun kaydedildi');
    } catch (error) {
        console.error('Oyun kaydedilemedi:', error);
    }
}

function loadGame(game) {
    try {
        const savedData = localStorage.getItem('okeyGame');
        if (savedData) {
            const gameData = JSON.parse(savedData);
            
            // Kayıt 24 saatten eskiyse yükleme
            const hoursPassed = (Date.now() - gameData.timestamp) / (1000 * 60 * 60);
            if (hoursPassed > 24) {
                localStorage.removeItem('okeyGame');
                return false;
            }
            
            // Oyun durumunu yükle
            game.hand = gameData.hand;
            game.pile = gameData.pile;
            game.discarded = gameData.discarded;
            game.turn = gameData.turn;
            game.gameActive = gameData.gameActive;
            
            if (game.gameActive) {
                game.updateUI();
                game.renderHand();
                game.updateDiscardedPile();
                game.addMessage('💾 Kaydedilen oyun yüklendi', 'success');
                
                // Buton durumlarını ayarla
                game.elements.startGame.disabled = true;
                game.elements.endGame.disabled = false;
                
                if (game.hand.length === 15) {
                    game.elements.drawTile.disabled = true;
                    game.elements.discardTile.disabled = false;
                    game.elements.winGame.disabled = false;
                    game.elements.gameStatus.textContent = 'Taş At';
                } else {
                    game.elements.drawTile.disabled = false;
                    game.elements.discardTile.disabled = true;
                    game.elements.winGame.disabled = true;
                    game.elements.gameStatus.textContent = 'Taş Çek';
                }
            }
            
            console.log('Oyun yüklendi');
            return true;
        }
    } catch (error) {
        console.error('Oyun yüklenemedi:', error);
        localStorage.removeItem('okeyGame');
    }
    return false;
}

// ===== OYUNU BAŞLATMA =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Okey oyunu başlatılıyor...');
    
    // Ana oyun nesnesini oluştur
    const game = new OkeyGame();
    
    // Discord SDK'yı başlat
    initDiscordSDK();
    
    // Klavye kısayollarını etkinleştir
    setupKeyboardShortcuts(game);
    
    // Kaydedilen oyunu yüklemeye çalış
    loadGame(game);
    
    // Oyunu otomatik kaydetme (her 30 saniyede bir)
    setInterval(() => {
        if (game.gameActive) {
            saveGame(game);
        }
    }, 30000);
    
    // Sayfa kapatılırken oyunu kaydet
    window.addEventListener('beforeunload', () => {
        if (game.gameActive) {
            saveGame(game);
        }
    });
    
    // Debug modu (geliştirici konsolu için)
    window.okeyGame = game;
    window.debugHand = () => game.debugHand();
    
    console.log('✅ Okey oyunu hazır!');
    console.log('💡 Klavye kısayolları: D=Çek, A=At, W=Biti, ESC=Seçimi Kaldır');
    console.log('🔧 Debug için: window.debugHand() kullanın');
});