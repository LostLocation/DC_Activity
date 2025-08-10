// Game variables
let players = [
  { id: 1, name: "Oyuncu 1", hand: [], isHuman: true },
  { id: 2, name: "Oyuncu 2", hand: [], isHuman: false },
  { id: 3, name: "Oyuncu 3", hand: [], isHuman: false },
  { id: 4, name: "Oyuncu 4", hand: [], isHuman: false }
];
let tileDeck = [];
let discardPile = [];
let currentPlayerIndex = 0;
let selectedTile = null;
let gameState = "playing"; // playing, won, draw
let indicatorTile = null;
let jokerValue = null;

// Initialize the game
function initializeGame() {
  tileDeck = createTiles();
  shuffle(tileDeck);
  
  // Set indicator tile
  indicatorTile = tileDeck.pop();
  jokerValue = getNextNumber(indicatorTile.number);
  document.getElementById('indicatorTile').textContent = `${indicatorTile.color.charAt(0).toUpperCase()}${indicatorTile.number}`;
  
  dealTiles();
  renderBoard();
  addMessage("🎮 Oyun başladı! Gösterge taşı: " + indicatorTile.color + " " + indicatorTile.number);
  addMessage(`🃏 Okey değeri: ${jokerValue}`);
}

// Create all tiles
function createTiles() {
  const tiles = [];
  const colors = ['black', 'yellow', 'red', 'green'];
  
  // Normal tiles (2 sets)
  for (let set = 0; set < 2; set++) {
    for (const color of colors) {
      for (let number = 1; number <= 13; number++) {
        tiles.push({ 
          color: color, 
          number: number, 
          id: `${color}-${number}-${set}`,
          isJoker: false 
        });
      }
    }
  }
  
  // Add 2 joker tiles
  tiles.push({ color: 'joker', number: 0, id: 'joker-1', isJoker: true });
  tiles.push({ color: 'joker', number: 0, id: 'joker-2', isJoker: true });
  
  return tiles;
}

// Get next number for okey calculation
function getNextNumber(num) {
  return num === 13 ? 1 : num + 1;
}

// Shuffle array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Deal tiles to players
function dealTiles() {
  // Deal 14 tiles to each player
  for (let i = 0; i < 14; i++) {
    for (let player of players) {
      if (tileDeck.length > 0) {
        player.hand.push(tileDeck.pop());
      }
    }
  }
  
  // Player 1 gets one extra tile (15 total)
  if (tileDeck.length > 0) {
    players[0].hand.push(tileDeck.pop());
  }
}

// Create tile element
function createTileElement(tile, container = 'hand') {
  const tileDiv = document.createElement('div');
  tileDiv.className = `tile in-${container}`;
  
  // Her taş için özel görsel dosyası kullan
  if (tile.isJoker) {
    tileDiv.style.backgroundImage = "url('images/okey.png')";
    tileDiv.classList.add('joker-tile');
  } else {
    // Dosya adı formatı: red7.png, yellow5.png, black13.png
    const imageFile = `${tile.color}${tile.number}.png`;
    tileDiv.style.backgroundImage = `url('images/${imageFile}')`;
    console.log(`Görsel yüklendi: images/${imageFile}`); // Debug için
  }
  
  tileDiv.style.backgroundSize = 'cover';
  tileDiv.style.backgroundPosition = 'center';
  
  tileDiv.dataset.tileId = tile.id;
  tileDiv.dataset.color = tile.color;
  tileDiv.dataset.number = tile.number;
  
  if (container === 'hand') {
    tileDiv.addEventListener('click', function() {
      console.log('Taş tıklandı:', tile, 'Görsel:', `images/${tile.color}${tile.number}.png`);
      selectTile(tile, tileDiv);
    });
    
    tileDiv.addEventListener('mouseenter', function() {
      console.log('Mouse üzerinde:', tile);
    });
  }
  
  return tileDiv;
}

// Discord uyumlu basit taş seçimi
function selectTileSimple(tile, element) {
  console.log('selectTileSimple çağrıldı:', tile);
  
  // Önceki seçimi temizle
  const allTiles = document.querySelectorAll('.tile.in-hand');
  allTiles.forEach(t => {
    t.classList.remove('selected');
    t.style.borderColor = '#333';
    t.style.transform = 'translateY(0px)';
  });
  
  // Yeni seçimi işaretle
  element.classList.add('selected');
  element.style.borderColor = '#FF6B6B';
  element.style.transform = 'translateY(-8px)';
  element.style.boxShadow = '2px 8px 16px rgba(255, 107, 107, 0.4)';
  
  selectedTile = tile;
  addMessage(`🎯 ${tile.color} ${tile.number} taşını seçtin. Enter/Space ile at!`);
  
  // Atma butonunu göster
  showDiscardButton();
}

// Atma butonunu göster/gizle
function showDiscardButton() {
  let discardBtn = document.getElementById('discardBtn');
  if (!discardBtn) {
    discardBtn = document.createElement('button');
    discardBtn.id = 'discardBtn';
    discardBtn.className = 'btn btn-danger';
    discardBtn.innerHTML = '🗑️ Seçili Taşı At';
    discardBtn.onclick = discardTile;
    
    const controls = document.querySelector('.controls');
    controls.insertBefore(discardBtn, controls.firstChild);
  }
  discardBtn.style.display = selectedTile ? 'inline-block' : 'none';
}

// Render the game board
function renderBoard() {
  renderPlayerHand();
  renderOpponents();
  updateGameInfo();
}

// Render player's hand - Discord uyumlu versiyon
function renderPlayerHand() {
  const handElement = document.getElementById('playerHand');
  
  // innerHTML yerine tek tek element oluştur
  while (handElement.firstChild) {
    handElement.removeChild(handElement.firstChild);
  }
  
  console.log('Oyuncu elindeki taş sayısı:', players[0].hand.length); // Debug
  
  players[0].hand.forEach((tile, index) => {
    console.log(`Taş ${index + 1}:`, tile); // Debug
    
    // Basit div oluştur
    const tileDiv = document.createElement('div');
    tileDiv.className = 'tile in-hand';
    
    // Discord için daha güvenli stil atama
    if (tile.isJoker) {
      tileDiv.style.cssText = `
        background-image: url('images/okey.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      `;
    } else {
      const imageFile = `${tile.color}${tile.number}.png`;
      tileDiv.style.cssText = `
        background-image: url('images/${imageFile}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      `;
      console.log(`Taş görseli: images/${imageFile}`); // Debug
    }
    
    // Data attributeleri
    tileDiv.setAttribute('data-tile-id', tile.id);
    tileDiv.setAttribute('data-color', tile.color);
    tileDiv.setAttribute('data-number', tile.number.toString());
    
    // Event listener - Discord için daha basit
    tileDiv.onclick = function() {
      console.log('Taş tıklandı (onclick):', tile);
      selectTileSimple(tile, tileDiv);
    };
    
    // Hover efekti için
    tileDiv.onmouseenter = function() {
      this.style.transform = 'translateY(-5px)';
      this.style.borderColor = '#FFD700';
    };
    
    tileDiv.onmouseleave = function() {
      if (!this.classList.contains('selected')) {
        this.style.transform = 'translateY(0px)';
        this.style.borderColor = '#333';
      }
    };
    
    handElement.appendChild(tileDiv);
  });
  
  console.log('Render tamamlandı, DOM elementleri:', handElement.children.length);
}

// Render opponents
function renderOpponents() {
  for (let i = 1; i < players.length; i++) {
    const opponentElement = document.getElementById(`opponent${i}Tiles`);
    const countElement = document.querySelector(`#opponent${i} .opponent-count`);
    
    opponentElement.innerHTML = '';
    
    // Show opponent tiles as face down
    for (let j = 0; j < players[i].hand.length; j++) {
      const tileDiv = document.createElement('div');
      tileDiv.className = 'opponent-tile';
      opponentElement.appendChild(tileDiv);
    }
    
    countElement.textContent = players[i].hand.length;
    
    // Highlight current player
    const opponent = document.getElementById(`opponent${i}`);
    if (i === currentPlayerIndex) {
      opponent.classList.add('current-turn');
    } else {
      opponent.classList.remove('current-turn');
    }
  }
}

// Update game info
function updateGameInfo() {
  document.getElementById('playerTileCount').textContent = players[0].hand.length;
  document.getElementById('remainingTiles').textContent = tileDeck.length;
  document.getElementById('currentTurn').textContent = currentPlayerIndex + 1;
  document.getElementById('deckCount').textContent = tileDeck.length;
  document.getElementById('discardCount').textContent = discardPile.length;
  
  // Update discard pile display
  const discardTileElement = document.getElementById('discardTile');
  if (discardPile.length > 0) {
    const topTile = discardPile[discardPile.length - 1];
    if (topTile.isJoker) {
      discardTileElement.style.backgroundImage = "url('images/okey.png')";
    } else {
      const imageFile = `${topTile.color}${topTile.number}.png`;
      discardTileElement.style.backgroundImage = `url('images/${imageFile}')`;
    }
    discardTileElement.style.backgroundSize = 'cover';
    discardTileElement.style.backgroundPosition = 'center';
  } else {
    discardTileElement.style.backgroundImage = 'none';
  }
}

// Draw from deck
function drawFromDeck() {
  if (currentPlayerIndex !== 0) {
    addMessage("❌ Sıra sende değil!");
    return;
  }
  
  if (tileDeck.length === 0) {
    addMessage("❌ Deste boş!");
    return;
  }
  
  const drawnTile = tileDeck.pop();
  players[0].hand.push(drawnTile);
  
  addMessage(`📥 Desteden ${drawnTile.color} ${drawnTile.number} çektin.`);
  renderBoard();
}

// Draw from discard pile
function drawFromDiscard() {
  if (currentPlayerIndex !== 0) {
    addMessage("❌ Sıra sende değil!");
    return;
  }
  
  if (discardPile.length === 0) {
    addMessage("❌ Atık yığını boş!");
    return;
  }
  
  const drawnTile = discardPile.pop();
  players[0].hand.push(drawnTile);
  
  addMessage(`📥 Atık yığınından ${drawnTile.color} ${drawnTile.number} çektin.`);
  renderBoard();
}

// Discard selected tile - güncellenmiş versiyon
function discardTile() {
  console.log('discardTile çağrıldı, selectedTile:', selectedTile);
  
  if (!selectedTile) {
    addMessage("❌ Önce bir taş seç!");
    return;
  }
  
  if (currentPlayerIndex !== 0) {
    addMessage("❌ Sıra sende değil!");
    return;
  }
  
  const tileIndex = players[0].hand.findIndex(t => t.id === selectedTile.id);
  if (tileIndex === -1) {
    addMessage("❌ Taş bulunamadı!");
    return;
  }
  
  players[0].hand.splice(tileIndex, 1);
  discardPile.push(selectedTile);
  
  addMessage(`📤 ${selectedTile.color} ${selectedTile.number} taşını attın.`);
  
  selectedTile = null;
  
  // Atma butonunu gizle
  const discardBtn = document.getElementById('discardBtn');
  if (discardBtn) {
    discardBtn.style.display = 'none';
  }
  
  nextTurn();
  renderBoard();
}

// Next turn
function nextTurn() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  
  if (currentPlayerIndex !== 0) {
    setTimeout(aiTurn, 1000);
  }
  
  renderBoard();
}

// AI turn
function aiTurn() {
  const player = players[currentPlayerIndex];
  
  // AI draws from deck
  if (tileDeck.length > 0) {
    player.hand.push(tileDeck.pop());
  }
  
  // AI discards a random tile
  if (player.hand.length > 0) {
    const randomIndex = Math.floor(Math.random() * player.hand.length);
    const discardedTile = player.hand.splice(randomIndex, 1)[0];
    discardPile.push(discardedTile);
    
    addMessage(`🤖 ${player.name} bir taş çekti ve ${discardedTile.color} ${discardedTile.number} attı.`);
  }
  
  nextTurn();
}

// Sort hand
function sortHand() {
  players[0].hand.sort((a, b) => {
    if (a.color !== b.color) {
      const colorOrder = { black: 0, yellow: 1, red: 2, green: 3, joker: 4 };
      return colorOrder[a.color] - colorOrder[b.color];
    }
    return a.number - b.number;
  });
  
  renderBoard();
  addMessage("🔄 Elindeki taşlar sıralandı.");
}

// Check win
function checkWin() {
  if (players[0].hand.length === 0) {
    gameState = "won";
    addMessage("🏆 Tebrikler! Oyunu kazandın!");
    return;
  }
  
  addMessage("🎯 Henüz kazanmadın. Devam et!");
}

// Show hint
function showHint() {
  const hints = [
    "💡 Aynı sayıdan 3 veya 4 tane topla",
    "💡 Ardışık sayıları aynı renkte topla", 
    "💡 Okey taşlarını akıllıca kullan",
    "💡 Rakiplerin attığı taşlara dikkat et",
    "💡 İhtiyacın olmayan taşları erken at"
  ];
  
  const randomHint = hints[Math.floor(Math.random() * hints.length)];
  addMessage(randomHint);
}

// Reset game
function resetGame() {
  players.forEach(player => player.hand = []);
  tileDeck = [];
  discardPile = [];
  currentPlayerIndex = 0;
  selectedTile = null;
  gameState = "playing";
  
  document.getElementById('messages').innerHTML = '';
  
  initializeGame();
  addMessage("🔄 Yeni oyun başladı!");
}

// Add message
function addMessage(text) {
  const messagesDiv = document.getElementById('messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  messageDiv.textContent = text;
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  
  // Keep only last 10 messages
  while (messagesDiv.children.length > 10) {
    messagesDiv.removeChild(messagesDiv.firstChild);
  }
}

// Event listener for discarding tiles
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    if (selectedTile && currentPlayerIndex === 0) {
      discardTile();
    }
  }
});

// Start the game when the page loads
initializeGame();
