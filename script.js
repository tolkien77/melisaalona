let activeGameName = null; // Aktif oyunun adını tutar


// --- Oyun Geçişleri ---
function showHome() {
  document.querySelectorAll('.game-section').forEach(el => el.classList.remove('active'));
  document.getElementById('section-home').classList.add('active');
  // Tüm nav butonlarından ve dropdown içindeki butonlardan 'active' sınıfını kaldır
  document.querySelectorAll('#main-nav button').forEach(el => el.classList.remove('active'));
  document.getElementById('btn-home').classList.add('active'); // Ana Sayfa butonuna active ekle
}

function selectGame(game) {
    // Önceki aktif oyun Hedef Vurma Oyunu ise, zamanlayıcılarını durdur
    if (activeGameName === 'target-click') {
        if (targetClickAnimationFrameId) {
            cancelAnimationFrame(targetClickAnimationFrameId);
            targetClickAnimationFrameId = null;
        }
        if (targetGenerationInterval) {
            clearInterval(targetGenerationInterval);
            targetGenerationInterval = null;
        }
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        targetClickActive = false; // Oyunun artık aktif olmadığını işaretle
        // Oyun alanını temizle (eğer canvas ve context mevcutsa)
        if (targetClickCtx && targetClickCanvas) {
            targetClickCtx.clearRect(0, 0, targetClickCanvas.width, targetClickCanvas.height);
        }
    }
    // Diğer oyunlar için de benzer temizlikler buraya eklenebilir (gerekiyorsa)
    // Örneğin, memory oyununda showOverlay'den sonra initMemory çağrılıyor, burada özel bir temizliğe gerek yok.
    // Ancak, sürekli çalışan bir animasyonu veya interval'i olan başka bir oyun eklerseniz,
    // onun için de burada durdurma mantığı eklemeniz gerekir.

    // Tüm oyun bölümlerini gizle
    document.querySelectorAll('.game-section').forEach(el => el.classList.remove('active'));
    document.getElementById('section-' + game).classList.add('active');
    // Tüm nav butonlarından ve dropdown içindeki butonlardan 'active' sınıfını kaldır
    document.querySelectorAll('#main-nav button').forEach(el => el.classList.remove('active'));
    document.getElementById('btn-' + game).classList.add('active'); // Tıklanan butona 'active' sınıfını ekle

    // Dropdown menüsünü kapat (oyun seçildikten sonra)
    const dropdownContainer = document.querySelector('.dropdown-container');
    if (dropdownContainer) {
        dropdownContainer.classList.remove('show');
    }

    activeGameName = game; // Yeni aktif oyunu ayarla

    // Oyun başlangıç fonksiyonları... (mevcut kodun devamı)
    if (game === "color-match") initColorMatch();
    if (game === "balloon") initBalloon();
    if (game === "animal") initAnimal();
    if (game === "memory") initMemory();
    if (game === "xox") setXoxMode(true); // XOX'a geçildiğinde varsayılan olarak bilgisayara karşı modu başlar
    if (game === "target-click") initTargetClick();
    if (game === "maze") initMaze();
    if (game === "flood") initFlood();
    if (game === "number-guessing") initGuessGame();
    if (game === "whos-missing") initWhosMissingGame();
    if (game === "liquid-sort") initLiquidSortGame();
    if (game === "catch") initCatchGame();
}
// --- Gece/Gündüz Modu ---
function toggleMode() {
  const body = document.body;
  const btn = document.getElementById('mode-btn');
  const isNight = body.classList.toggle('night');
  if(isNight) {
    btn.textContent = "☀️";
    btn.title = "Gündüz Modu";
  } else {
    btn.textContent = "🌙";
    btn.title = "Gece Modu";
  }
  try {
    localStorage.setItem('melisaNightMode', isNight ? '1' : '0');
  } catch(e){}
}
function restoreMode() {
  try {
    const mode = localStorage.getItem('melisaNightMode');
    if(mode === "1") {
      document.body.classList.add("night");
      document.getElementById('mode-btn').textContent = "☀️";
      document.getElementById('mode-btn').title = "Gündüz Modu";
    } else {
      document.body.classList.remove("night");
      document.getElementById('mode-btn').textContent = "🌙";
      document.getElementById('mode-btn').title = "Gece Modu";
    }
  } catch(e){}
}

function toggleFenerbahceTheme() {
  const body = document.body;
  const fenerbahceOn = body.classList.toggle('fenerbahce');

  // Fenerbahçe teması açılırsa diğer temaları kapat
  if (fenerbahceOn) {
    body.classList.remove('rainbow');
    body.classList.remove('night');
    document.getElementById('rainbow-btn').classList.remove('active');
    document.getElementById('mode-btn').textContent = "🌙";
    document.getElementById('mode-btn').title = "Gece Modu";
  }
  updateThemeButtons(); // Butonların aktif durumunu güncelle
  saveMode(); // Temayı kaydet
}

// --- Renk Eşleştirme ---
const colorList = [
  "#ff7272", "#7fff8f", "#7fcaff", "#ffe066",
  "#b967ff", "#ffb86f", "#fcb69f", "#8cfffb"
];


function initColorMatch() {
    let pairs = colorList.concat(colorList);
    pairs = pairs.sort(() => Math.random() - 0.5);
    const board = document.getElementById('color-match-board');
    board.innerHTML = '';
    let open = [],
        matched = 0;

    // BURADAKİ ESKİ currentLang ve t TANIMLARINI SİLİN VEYA YORUM SATIRI YAPIN:
    // const currentLang = localStorage.getItem("melisaLang") || "tr";
    // const t = diller[currentLang];

    for (let i = 0; i < 16; i++) {
        const div = document.createElement('div');
        div.className = 'color-card';
        div.style.setProperty('--card-color', pairs[i]);
        div.dataset.color = pairs[i];
        div.onclick = function() {
            if (div.classList.contains("matched") || div.classList.contains("open") || open.length === 2) return;
            div.classList.add("open");
            open.push(div);
            if (open.length === 2) {
                setTimeout(() => {
                    if (open[0].dataset.color === open[1].dataset.color) {
                        open[0].classList.add("matched");
                        open[1].classList.add("matched");
                        matched += 2;
                        open[0].onclick = null;
                        open[1].onclick = null;
                        if (matched === 16) {
                            // BURADA GÜNCEL DİLİ ALIYORUZ
                            const currentLang = localStorage.getItem("melisaLang") || "tr";
                            const t = diller[currentLang];
                            showOverlay("win", t.colorMatchWin, "🎉", initColorMatch);
                        }
                    } else {
                        open[0].classList.remove("open");
                        open[1].classList.remove("open");
                    }
                    open = [];
                }, 450);
            }
        };
        board.appendChild(div);
    }
}

// --- Hedef Vurma Oyunu ---
let targetClickCanvas;
let targetClickCtx;
let targetClickScore = 0;
let targetClickTime = 30; // Oyun süresi saniye cinsinden
let targetClickActive = false;
let targetClickAnimationFrameId;
let targetGenerationInterval;
let countdownInterval;

const TARGET_SIZE = 60; // Hedefin boyutu
const TARGET_EMOJI = '🎯'; // Hedef emojisi

function initTargetClick() {
    // Önceki oyunun animasyonlarını ve zamanlayıcılarını temizle
    if (targetClickAnimationFrameId) {
        cancelAnimationFrame(targetClickAnimationFrameId);
    }
    if (targetGenerationInterval) {
        clearInterval(targetGenerationInterval);
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    clearOverlay(); // Eğer varsa üst katmanı temizle

    targetClickCanvas = document.getElementById('target-click-game-area');
    if (!targetClickCanvas) {
        console.error("Hedef Vurma Oyunu alanı bulunamadı!");
        return;
    }

    // Canvas boyutlarını dinamik olarak ayarla
    targetClickCanvas.width = targetClickCanvas.offsetWidth;
    targetClickCanvas.height = targetClickCanvas.offsetHeight;

    targetClickCtx = targetClickCanvas.getContext('2d');

    targetClickScore = 0;
    targetClickTime = 33; // Her başlatıldığında süreyi sıfırla
    targetClickActive = true;
    
    // Skor ve süre göstergelerini güncelle
    const currentLang = localStorage.getItem("melisaLang") || "tr";
    const t = diller[currentLang];
    document.getElementById('target-click-score-display').textContent = `${t.targetClickScore} ${targetClickScore}`;
    document.getElementById('target-click-time-display').textContent = `${t.targetClickTime} ${targetClickTime}`;
    document.getElementById('target-click-result').textContent = ''; // Sonuç mesajını temizle

    // Oyun alanını temizle
    targetClickCtx.clearRect(0, 0, targetClickCanvas.width, targetClickCanvas.height);
    
    // Hedef oluşturma ve geri sayım başlat
    targetGenerationInterval = setInterval(generateTarget, 3000); // Her 3 saniyede bir hedef oluştur
    countdownInterval = setInterval(updateCountdown, 1000); // Her 1 saniyede bir geri sayım yap

    // Canvas'a tıklama olay dinleyicisi ekle (sadece bir kez)
    if (!targetClickCanvas.dataset.listenerAdded) {
        // Masaüstü için tıklama olayı
        targetClickCanvas.addEventListener('click', handleTargetClick);
        // Mobil cihazlar için dokunmatik olay
        targetClickCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Varsayılan kaydırma/yakınlaştırma davranışını engelle
            // Dokunma olayını tıklama olayına dönüştürerek handleTargetClick'i çağır
            // Dokunma koordinatlarını event objesine ekleyerek handleTargetClick'in doğru çalışmasını sağla
            const touch = e.touches[0];
            handleTargetClick({
                clientX: touch.clientX,
                clientY: touch.clientY,
                target: targetClickCanvas, // Event objesine canvas'ı ekle
                // Diğer gerekli özellikleri ekleyebilirsiniz, örneğin offsetX/Y
                // Ancak getBoundingClientRect ile hesaplandığı için clientX/Y yeterli olacaktır.
            });
        });
        targetClickCanvas.dataset.listenerAdded = 'true';
    }

    // Oyun döngüsünü başlat
    gameLoopTargetClick();
}

// Hedef oluşturma fonksiyonu
function generateTarget() {
    if (!targetClickActive) return;

    // Önceki hedefleri temizle (tek bir hedef olmasını istiyorsak)
    targetClickCtx.clearRect(0, 0, targetClickCanvas.width, targetClickCanvas.height);

    // Rastgele konumda yeni hedef çiz
    const x = Math.random() * (targetClickCanvas.width - TARGET_SIZE);
    const y = Math.random() * (targetClickCanvas.height - TARGET_SIZE);

    targetClickCtx.font = `${TARGET_SIZE}px Arial`;
    targetClickCtx.textAlign = 'center';
    targetClickCtx.textBaseline = 'middle';
    targetClickCtx.fillText(TARGET_EMOJI, x + TARGET_SIZE / 2, y + TARGET_SIZE / 2);

    // Hedefin konumunu kaydet (tıklama kontrolü için)
    targetClickCanvas.dataset.targetX = x;
    targetClickCanvas.dataset.targetY = y;
    targetClickCanvas.dataset.targetSize = TARGET_SIZE;
}

// Geri sayımı güncelleme fonksiyonu
function updateCountdown() {
    if (!targetClickActive) return;

    targetClickTime--;
    const currentLang = localStorage.getItem("melisaLang") || "tr";
    const t = diller[currentLang];
    document.getElementById('target-click-time-display').textContent = `${t.targetClickTime} ${targetClickTime}`;

    if (targetClickTime <= 0) {
        endTargetClickGame();
    }
}

// Hedefe tıklama olayını yönetme
function handleTargetClick(event) {
    if (!targetClickActive) return;

    const rect = targetClickCanvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const targetX = parseFloat(targetClickCanvas.dataset.targetX);
    const targetY = parseFloat(targetClickCanvas.dataset.targetY);
    const targetSize = parseFloat(targetClickCanvas.dataset.targetSize);

    // Tıklamanın hedefin içinde olup olmadığını kontrol et
    if (clickX >= targetX && clickX <= targetX + targetSize &&
        clickY >= targetY && clickY <= targetY + targetSize) {
        
        targetClickScore += 10; // Doğru tıklama, puan ekle
        const currentLang = localStorage.getItem("melisaLang") || "tr";
        const t = diller[currentLang];
        document.getElementById('target-click-score-display').textContent = `${t.targetClickScore} ${targetClickScore}`;
        
        // Yeni bir hedef hemen oluştur
        generateTarget();
    } else {
        // Yanlış tıklama, puan düşebilir veya bir ceza olabilir
        targetClickScore -= 5; // Yanlış tıklama, puan düşür
        if (targetClickScore < 0) targetClickScore = 0; // Puanın sıfırın altına düşmesini engelle
        const currentLang = localStorage.getItem("melisaLang") || "tr";
        const t = diller[currentLang];
        document.getElementById('target-click-score-display').textContent = `${t.targetClickScore} ${targetClickScore}`;
    }
}

// Oyun döngüsü (gerekmeyebilir, çünkü hedefler tıklamayla yeniden çiziliyor)
function gameLoopTargetClick() {
    // Bu oyunda sürekli bir animasyon yerine, tıklama olayına bağlı olarak çizim yapıyoruz.
    // Bu fonksiyon sadece oyunun aktif olup olmadığını kontrol edebilir.
    if (targetClickActive) {
        targetClickAnimationFrameId = requestAnimationFrame(gameLoopTargetClick);
    }
}

// Oyunu bitirme fonksiyonu
function endTargetClickGame() {
    targetClickActive = false;
    clearInterval(targetGenerationInterval);
    clearInterval(countdownInterval);
    cancelAnimationFrame(targetClickAnimationFrameId);

    const currentLang = localStorage.getItem("melisaLang") || "tr";
    const t = diller[currentLang];

    const finalMessage = t.targetClickGameOver + " " + t.targetClickYourScore.replace("%d", targetClickScore);
    showOverlay("win", finalMessage, "🏆", initTargetClick); // Oyunu bitir ve sonucu göster
}

// --- Balon Patlatma ---
function initBalloon() {
    const balloonColors = ["#ffb6d5", "#ff8fcf", "#ffe066", "#b967ff", "#7fcaff"];
    let numbers = Array.from({
        length: 20
    }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    let next = 1;
    const board = document.getElementById('balloon-board');
    board.innerHTML = '';
    document.getElementById('balloon-result').textContent = '';

    numbers.forEach(num => {
        const div = document.createElement('div');
        div.className = 'balloon';
        div.style.background = balloonColors[num % balloonColors.length];
        div.textContent = num;
        div.onclick = function() {
            // Her tıklamada güncel dili alıyoruz
            const currentLang = localStorage.getItem("melisaLang") || "tr";
            const t = diller[currentLang];

            if (num === next) {
                div.classList.add("pop");
                div.style.pointerEvents = "none";
                next++;
                if (next === 21) {
                    showOverlay("win", t.balloonWin, "🎈", initBalloon);
                }
            } else {
                showOverlay("fail", t.balloonWrong, "😢", initBalloon);
            }
        }
        board.appendChild(div);
    });
}


// --- Hayvan Bulma ---
const animalList = [
  {name:"Kedi",img:"https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&w=120&h=120&fit=crop"},
  {name:"Köpek",img:"https://images.pexels.com/photos/4587994/pexels-photo-4587994.jpeg?auto=compress&w=120&h=120&fit=crop"},
  {name:"Kuş",img:"https://images.pexels.com/photos/45911/peacock-plumage-bird-peafowl-45911.jpeg?auto=compress&w=120&h=120&fit=crop"},
  {name:"Tavşan",img:"https://images.pexels.com/photos/326012/pexels-photo-326012.jpeg?auto=compress&w=120&h=120&fit=crop"},
  {name:"Balık",img:"https://images.pexels.com/photos/128756/pexels-photo-128756.jpeg?auto=compress&w=120&h=120&fit=crop"},
  {name:"At",img:"https://images.pexels.com/photos/52500/horse-herd-fog-nature-52500.jpeg?auto=compress&w=120&h=120&fit=crop"},
  {name:"İnek",img:"https://images.pexels.com/photos/162240/cow-cattle-animal-horn-162240.jpeg?auto=compress&w=120&h=120&fit=crop"},
  {name:"Fil",img:"https://images.pexels.com/photos/667205/pexels-photo-667205.jpeg?auto=compress&w=120&h=120&fit=crop"},
];

function initAnimal() {
  document.getElementById('animal-result').textContent = '';
  const board = document.getElementById('animal-board');
  board.innerHTML = '';

  // Seçenekleri al ve karıştır, sonra ilk 4'ünü seç
  const options = animalList.sort(()=>Math.random()-0.5).slice(0,4);
  // Doğru cevabı seç
  const answer = options[Math.floor(Math.random()*options.length)];

  // Resim elementini oluştur
  const img = document.createElement('img');
  img.className = "animal-img";
  img.src = answer.img; // Resim URL'si zaten answer objesinde var

  // O anki güncel dili alıyoruz, böylece resim alt yazısı da doğru dilde olur
  const currentLang = localStorage.getItem("melisaLang") || "tr";
  const t = diller[currentLang];
  img.alt = t[answer.name]; // answer.name Türkçe olduğu için diller objesinden karşılığını çekiyoruz

  img.onerror = function(){this.style.display="none";} // Resim yüklenmezse gizle
  board.appendChild(img); // Resmi panoya ekle

  // Seçenek butonları için div oluştur
  const optDiv = document.createElement('div');
  optDiv.id = "animal-options";

  // Seçenekleri karıştır ve butonları oluştur
  options.sort(()=>Math.random()-0.5).forEach(opt=>{
    const btn = document.createElement('button');
    btn.className = 'animal-btn';
    // Buton metnini çeviri objesinden alıyoruz (opt.name Türkçe olduğu için)
    btn.textContent = t[opt.name];
    
    btn.onclick = function(){
      // BUTON TIKLANDIĞINDA (MESAJ GÖSTERİLECEĞİ ZAMAN) GÜNCEL DİLİ TEKRAR ALIYORUZ
      // Böylece dil değiştirilmişse, mesaj doğru dilde görünür.
      const currentLangForMessage = localStorage.getItem("melisaLang") || "tr";
      const tForMessage = diller[currentLangForMessage];

      if(opt.name===answer.name){ // objenin 'name' özelliğini karşılaştırıyoruz
        showOverlay("win", tForMessage.animalWin, "🐾", initAnimal);
      }else{
        showOverlay("fail", tForMessage.animalWrong, "😢", initAnimal);
      }
    };
    optDiv.appendChild(btn); // Butonu seçenekler div'ine ekle
  });
  board.appendChild(optDiv); // Seçenekler div'ini panoya ekle
}
// --- Hafıza Oyunu ---
const memoryEmojis = ["🍎","🍌","🍇","🍉","🍒","🍓","🥕","🍋"];
function initMemory() {
  let pairs = memoryEmojis.concat(memoryEmojis);
  pairs = pairs.sort(() => Math.random() - 0.5);
  const board = document.getElementById('memory-board');
  board.innerHTML = '';
  let open = [], matched = 0;
  for(let i=0;i<16;i++) {
    const div = document.createElement('div');
    div.className = 'memory-card';
    div.dataset.emoji = pairs[i];
    div.textContent = '';
    div.onclick = function(){
      if (div.classList.contains("matched") || div.classList.contains("open") || open.length===2) return;
      div.classList.add("open");
      div.textContent = pairs[i];
      open.push(div);
      if(open.length===2){
        setTimeout(()=>{
          if(open[0].dataset.emoji === open[1].dataset.emoji){
            open[0].classList.add("matched"); open[1].classList.add("matched");
            matched += 2;
            open[0].onclick = null; open[1].onclick = null;
            if(matched===16){
              // BURADA GÜNCEL DİLİ ALIYORUZ
              const currentLang = localStorage.getItem("melisaLang") || "tr";
              const t = diller[currentLang];
              showOverlay("win", t.memoryWin, "🎊", initMemory);
            }
          }else{
            open[0].classList.remove("open"); open[0].textContent='';
            open[1].classList.remove("open"); open[1].textContent='';
          }
          open = [];
        },500);
      }
    };
    board.appendChild(div);
  }
  document.getElementById('memory-result').textContent = '';
}

// --- XOX ---
let xoxModeComputer = false;

function setXoxMode(compMode) {
  xoxModeComputer = compMode;
  const humanBtn = document.getElementById('xox-human-btn');
  const computerBtn = document.getElementById('xox-computer-btn');

  if (humanBtn) { // Düğme mevcutsa sınıfı değiştir
    humanBtn.classList.toggle('active', !compMode);
  }
  if (computerBtn) { // Düğme mevcutsa sınıfı değiştir
    computerBtn.classList.toggle('active', compMode);
  }
  initXox();
}

function xoxComputerBestMove(cells) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let l of lines) {
    let [a,b,c] = l;
    let vals = [cells[a], cells[b], cells[c]];
    if(vals.filter(v=>v==="O").length===2 && vals.includes("")){
      let idx = l[vals.indexOf("")];
      return idx;
    }
  }
  for (let l of lines) {
    let [a,b,c] = l;
    let vals = [cells[a], cells[b], cells[c]];
    if(vals.filter(v=>v==="X").length===2 && vals.includes("")){
      let idx = l[vals.indexOf("")];
      return idx;
    }
  }
  if(cells[4] === "") return 4;
  let corners = [0,2,6,8].filter(i=>cells[i]==="");
  if(corners.length) return corners[Math.floor(Math.random()*corners.length)];
  let empty = [];
  for(let i=0;i<9;i++) if(!cells[i]) empty.push(i);
  if(empty.length) return empty[Math.floor(Math.random()*empty.length)];
  return -1;
}

function initXox() {
  const humanBtn = document.getElementById('xox-human-btn');
  const computerBtn = document.getElementById('xox-computer-btn');

  if (humanBtn) { // Düğme mevcutsa sınıfı değiştir
    humanBtn.classList.toggle('active', !xoxModeComputer);
  }
  if (computerBtn) { // Düğme mevcutsa sınıfı değiştir
    computerBtn.classList.toggle('active', xoxModeComputer);
  }

  let turn = "X";
  let cells = Array(9).fill("");
  const board = document.getElementById('xox-board');
  board.innerHTML = '';
  let gameOver = false;

  for(let i=0;i<9;i++){
    const div = document.createElement('div');
    div.className = 'xox-cell';
    div.addEventListener('click', function() {
      if(cells[i] || gameOver) return;
      if(xoxModeComputer && turn==="O") return;
      cells[i] = turn;
      div.textContent = turn;
      div.classList.toggle('o', turn==="O");
      const result = checkWin();
      if(result){
        gameOver = true;
        // Tıklama olayında güncel dili alıyoruz
        const currentLang = localStorage.getItem("melisaLang") || "tr";
        const t = diller[currentLang];

        setTimeout(()=>{
          // HATA AYIKLAMA İÇİN EKLENEN SATIRLAR BAŞLANGICI (İnsan oyuncu için)
          console.log("XOX (İnsan) - currentLang:", currentLang);
          if (result === "Berabere") {
              console.log("XOX (İnsan) - t.xoxDraw:", t.xoxDraw);
          } else {
              console.log("XOX (İnsan) - t.xoxWin:", t.xoxWin);
          }
          // HATA AYIKLAMA İÇİN EKLENEN SATIRLAR BİTİŞİ

          if(result==="Berabere"){
            showOverlay("fail", t.xoxDraw, "😶", initXox);
          } else {
            const winMessage = t.xoxWin.replace("%s", result);
            showOverlay("win", winMessage, result==="X"?"❌":"⭕", initXox);
          }
        }, 300);
      } else {
        if(xoxModeComputer) {
          turn = turn==="X" ? "O" : "X";
          setTimeout(computerMove, 600);
        } else {
          turn = turn==="X" ? "O" : "X";
        }
      }
    });
    board.appendChild(div);
  }
  function checkWin() {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for(let l of lines){
      if(cells[l[0]] && cells[l[0]]===cells[l[1]] && cells[l[0]]===cells[l[2]])
        return cells[l[0]];
    }
    if(cells.every(c=>c)) return "Berabere";
    return null;
  }
  function computerMove() {
    if(gameOver) return;
    let idx = xoxComputerBestMove(cells);
    if(idx === -1) return;
    cells[idx] = "O";
    let cellDiv = board.children[idx];
    cellDiv.textContent = "O";
    cellDiv.classList.add("o");
    const result = checkWin();
    if(result){
      gameOver = true;
      // Bilgisayar hamlesinde de güncel dili alıyoruz
      const currentLang = localStorage.getItem("melisaLang") || "tr";
      const t = diller[currentLang];

      setTimeout(()=>{
        // HATA AYIKLAMA İÇİN EKLENEN SATIRLAR BAŞLANGICI (Bilgisayar için)
        console.log("XOX (Bilgisayar) - currentLang:", currentLang);
        if (result === "Berabere") {
            console.log("XOX (Bilgisayar) - t.xoxDraw:", t.xoxDraw);
        } else {
            console.log("XOX (Bilgisayar) - t.xoxWin:", t.xoxWin);
        }
        // HATA AYIKLAMA İÇİN EKLENEN SATIRLAR BİTİŞİ

        if(result==="Berabere"){
          showOverlay("fail", t.xoxDraw, "😶", initXox);
        } else {
          const winMessage = t.xoxWin.replace("%s", result);
          showOverlay("win", winMessage, result==="X"?"❌":"⭕", initXox);
        }
      }, 300);
    } else {
      turn = "X";
    }
  }
}

// --- Labirent Oyunu (Maze) ---
const MAZE_SIZE = 9; // Boyut orijinal değeri olan 9'a geri döndürüldü
let maze = [], mazePlayer = {x:0, y:0}, mazeExit = {x:0, y:0}, mazeActive = false;
function initMaze() {
  maze = generateMaze(MAZE_SIZE, MAZE_SIZE);
  mazePlayer = {x:0, y:0};
  mazeExit = {x:MAZE_SIZE-1, y:MAZE_SIZE-1};
  mazeActive = true;
  renderMaze();
}
function renderMaze() {
  const board = document.getElementById('maze-board');
  board.innerHTML = '';
  for(let y=0;y<MAZE_SIZE;y++) {
    for(let x=0;x<MAZE_SIZE;x++) {
      const div = document.createElement('div');
      div.className = 'maze-cell';
      if (maze[y][x] === 1) div.classList.add('maze-wall');
      if (x === mazeExit.x && y === mazeExit.y) div.classList.add('maze-exit');
      if (x === mazePlayer.x && y === mazePlayer.y) div.classList.add('maze-player');
      board.appendChild(div);
    }
  }
}
function moveMazePlayer(dx, dy) {
    if (!mazeActive) return;
    const nx = mazePlayer.x + dx, ny = mazePlayer.y + dy;
    if (nx < 0 || ny < 0 || nx >= MAZE_SIZE || ny >= MAZE_SIZE) return;

    // Mevcut dili al
    const currentLang = localStorage.getItem("melisaLang") || "tr";
    const t = diller[currentLang]; // Çeviri objesini al

    if (maze[ny][nx] === 1) {
        mazeActive = false;
        // Güncellenmiş çeviri anahtarını kullan
        setTimeout(() => showOverlay("fail", t.mazeHitWall, "😢", initMaze), 80);
        return;
    }
    mazePlayer.x = nx;
    mazePlayer.y = ny;
    renderMaze();
    if (mazePlayer.x === mazeExit.x && mazePlayer.y === mazeExit.y) {
        mazeActive = false;
        // Güncellenmiş çeviri anahtarını kullan
        setTimeout(() => showOverlay("win", t.mazeFoundExit, "🚩", initMaze), 50);
    }
}

document.addEventListener('keydown', (e)=>{
  if (!document.getElementById('section-maze').classList.contains('active')) return;
  if (!mazeActive) return;
  if (["ArrowRight","d"].includes(e.key)) { moveMazePlayer(1,0); e.preventDefault();}
  if (["ArrowLeft","a"].includes(e.key))  { moveMazePlayer(-1,0); e.preventDefault();}
  if (["ArrowUp","w"].includes(e.key))    { moveMazePlayer(0,-1); e.preventDefault();}
  if (["ArrowDown","s"].includes(e.key))  { moveMazePlayer(0,1); e.preventDefault();}
});
function generateMaze(w, h) {
  let grid = Array.from({length:h},()=>Array(w).fill(1));
  function carve(x,y) {
    grid[y][x]=0;
    let dirs = [[1,0],[-1,0],[0,1],[0,-1]].sort(()=>Math.random()-0.5);
    for(let [dx,dy] of dirs) {
      let nx = x+dx*2, ny = y+dy*2;
      if (nx>=0 && ny>=0 && nx<w && ny<h && grid[ny][nx]===1) {
        grid[y+dy][x+dx]=0;
        carve(nx,ny);
      }
    }
  }
  // Başlangıç noktası tekrar orijinal haline getirildi (0,0)
  carve(0,0);
  grid[0][0]=0;
  grid[h-1][w-1]=0;
  return grid;
}

// --- Renk Doldurma (Flood Fill) ---
const FLOOD_SIZE = 12, FLOOD_COLORS = ["#ff7272", "#7fcaff", "#ffe066", "#7fff8f", "#b967ff"];
let floodGrid = [], floodMoves = 0, floodActive = false;
function initFlood() {
  floodGrid = [];
  for(let y=0;y<FLOOD_SIZE;y++) {
    let row=[];
    for(let x=0;x<FLOOD_SIZE;x++) {
      let neighbors=[];
      if(x>0) neighbors.push(row[x-1]);
      if(y>0) neighbors.push(floodGrid[y-1][x]);
      let color;
      do { color = FLOOD_COLORS[Math.floor(Math.random()*FLOOD_COLORS.length)]; }
      while(neighbors.includes(color) && Math.random()<0.7);
      row.push(color);
    }
    floodGrid.push(row);
  }
  floodMoves = 0;
  floodActive = true;
  renderFlood();
  document.getElementById('flood-result').textContent = '';
}
function renderFlood() {
  const board = document.getElementById('flood-board');
  board.innerHTML = '';
  for(let y=0;y<FLOOD_SIZE;y++)
    for(let x=0;x<FLOOD_SIZE;x++) {
      const div = document.createElement('div');
      div.className = 'flood-cell';
      div.style.background = floodGrid[y][x];
      if(x===0&&y===0) div.classList.add('selected');
      board.appendChild(div);
    }
  let colorBtns = document.getElementById('flood-color-btns');
  colorBtns.innerHTML = '';
  FLOOD_COLORS.forEach(c=>{
    const btn = document.createElement('button');
    btn.className = 'flood-color-btn';
    btn.style.background = c;
    btn.onclick = ()=>floodFill(c);
    colorBtns.appendChild(btn);
  });
}

function floodFill(newColor) {
    if (!floodActive) return;
    let oldColor = floodGrid[0][0];
    if (oldColor === newColor) return;
    floodMoves++;
    let queue = [[0, 0]],
        visited = {};
    while (queue.length) {
        let [x, y] = queue.shift();
        let key = x + "-" + y;
        if (visited[key]) continue;
        visited[key] = 1;
        if (floodGrid[y][x] !== oldColor) continue;
        floodGrid[y][x] = newColor;
        [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
        ].forEach(([dx, dy]) => {
            let nx = x + dx,
                ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < FLOOD_SIZE && ny < FLOOD_SIZE)
                queue.push([nx, ny]);
        });
    }
    renderFlood();
    if (isFloodCompleted()) {
        floodActive = false;
        const currentLang = localStorage.getItem("melisaLang") || "tr";
        const t = diller[currentLang];

        const winMessage = t.floodWin.replace("%d", floodMoves);
        setTimeout(() => showOverlay("win", winMessage, "🌈", initFlood), 50);
    } else {
        // Mevcut dili al
        const currentLang = localStorage.getItem("melisaLang") || "tr";
        const t = diller[currentLang]; // Çeviri objesini al

        // Yeni çeviri anahtarını kullan
        document.getElementById('flood-result').textContent = `${t.movesLabel}${floodMoves}`;
    }
}
function isFloodCompleted() {
  let c=floodGrid[0][0];
  for(let y=0;y<FLOOD_SIZE;y++)
    for(let x=0;x<FLOOD_SIZE;x++)
      if(floodGrid[y][x]!==c) return false;
  return true;
}

// Sayı Tahmini Oyunu değişkenleri
let randomNumber;
let guessCount;
let previousGuesses;


// Buradan sonra diğer tüm fonksiyonlarınız ve kodlarınız gelebilir.

// --- Sayı Tahmini Oyunu Fonksiyonları ---
function initGuessGame() {
    // HTML elemanlarını fonksiyon her çağrıldığında tekrar seçiyoruz
    const guessInput = document.getElementById('guessInput');
    const checkGuessBtn = document.getElementById('checkGuessBtn');
    const guessMessage = document.getElementById('guessMessage');
    const guessCountDisplay = document.getElementById('guessCount');
    const previousGuessesList = document.getElementById('previousGuessesList');

    randomNumber = Math.floor(Math.random() * 100) + 1;
    guessCount = 0;
    previousGuesses = []; // Oyun durumu sıfırlandı

    const currentLang = localStorage.getItem("melisaLang") || "tr";
    const t = diller[currentLang];

    // Mesajları ve listeyi çeviri ile sıfırla
    if (guessMessage) guessMessage.textContent = t.rules_numberGuessing;
    if (guessCountDisplay) guessCountDisplay.textContent = `${t.guessCount} 0`;
    if (previousGuessesList) previousGuessesList.innerHTML = '';

    // Giriş alanını ve butonu etkinleştir
    if (guessInput) guessInput.value = '';
    if (guessInput) guessInput.disabled = false;
    if (checkGuessBtn) checkGuessBtn.disabled = false;

    // Odağı inputa ver
    if (guessInput) guessInput.focus();

    // *** ÖNEMLİ: Olay dinleyicisini burada ekliyoruz ***
    // checkGuessBtn.removeEventListener('click', checkGuess); // Birden fazla eklenmesini engellemek için mevcut dinleyiciyi kaldır
    // checkGuessBtn.addEventListener('click', checkGuess);

    // Daha iyi bir yaklaşım: Yalnızca bir kez eklendiğinden emin olmak için bir işaretleyici kullanın.
    if (checkGuessBtn && !checkGuessBtn.dataset.listenerAttached) {
        checkGuessBtn.addEventListener('click', checkGuess);
        checkGuessBtn.dataset.listenerAttached = 'true'; // İşaretleyici koy

// randomNumber ataması
    randomNumber = Math.floor(Math.random() * 100) + 1;

    console.log("Yeni rastgele sayı:", randomNumber); // Bu satırı ekleyin
    }
}

function checkGuess() {
    console.log("checkGuess fonksiyonu çağrıldı!");

    // HTML elemanlarını bu fonksiyon içinde tekrar seçmek iyi bir pratik
    const guessInput = document.getElementById('guessInput');
    const guessMessage = document.getElementById('guessMessage');
    const guessCountDisplay = document.getElementById('guessCount');
    const previousGuessesList = document.getElementById('previousGuessesList');
    const checkGuessBtn = document.getElementById('checkGuessBtn');

    // Elemanların HTML'de mevcut olduğundan emin olun
    if (!guessInput || !guessMessage || !guessCountDisplay || !previousGuessesList || !checkGuessBtn) {
        console.error("Sayı Tahmini Oyunu için gerekli HTML elemanları bulunamadı. Lütfen ID'leri kontrol edin.");
        return; // Elemanlar yoksa fonksiyonu durdur
    }

    const userGuess = Number(guessInput.value); // userGuess'ı burada SADECE BİR KEZ tanımlayın. Daha önce burada bir tekrar vardı.

    const currentLang = localStorage.getItem("melisaLang") || "tr";
    const t = diller[currentLang]; // Dil çevirileri objesini al

    // Geçersiz tahmin kontrolü
    if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
        guessMessage.textContent = t.invalidGuessMessage; // Hata mesajını göster
        guessInput.value = ''; // Giriş alanını temizle
        guessInput.focus(); // Odak inputta kalsın
        return; // Geçersiz tahminde buradan çıkılır. BU IF BLOĞUNUN KAPANAN PARANTEZİ ŞİMDİ DOĞRU YERDE.
    }

    // Tahmin ile ilgili konsol logları (bu kısım artık geçersiz tahmin if bloğunun dışında)
    console.log("Kullanıcı tahmini:", userGuess);
    console.log("Hedef sayı (randomNumber):", randomNumber);
    console.log("Eşleşme kontrolü (userGuess === randomNumber):", userGuess === randomNumber);

    guessCount++; // Tahmin sayısını artır
    guessCountDisplay.textContent = `${t.guessCount} ${guessCount}`; // Tahmin sayısını güncelle

    previousGuesses.push(userGuess); // Tahmini önceki tahminler listesine ekle

    const listItem = document.createElement('li'); // Yeni liste öğesi oluştur
    listItem.textContent = userGuess; // Tahmini liste öğesine yaz
    previousGuessesList.appendChild(listItem); // Liste öğesini ekle

    let message = ""; // Mesaj değişkeni
    if (userGuess === randomNumber) {
        // Doğru tahmin durumu - buradaki replace hatasını Adım 1'de çözdük
        message = t.guessResultCorrectDetailed.replace('%s', randomNumber).replace('%d', guessCount);
        guessInput.disabled = true; // Girişi devre dışı bırak
        checkGuessBtn.disabled = true; // Butonu devre dışı bırak
       showOverlay("win", message, "🎉", initGuessGame); // Kazanma ekranını göster
    } else if (userGuess < randomNumber) {
        // Çok düşük tahmin
        message = t.guessTooLow;
    } else { // userGuess > randomNumber
        // Çok yüksek tahmin
        message = t.guessTooHigh;
    }

    guessMessage.textContent = message; // Sonucu göster
    guessInput.value = ''; // Giriş alanını temizle
    guessInput.focus(); // Odak inputta kalsın
}

// --- Kutlama & Üzgün Yağmuru ---
function showOverlay(type, msg, emoji, restartFn) {
  clearOverlay();
  const overlay = document.getElementById('overlay-message');
  const title = document.getElementById('overlay-title');
  const emo = document.getElementById('overlay-emoji');
  title.textContent = msg;
  emo.textContent = emoji;
  overlay.style.display = "flex";
  document.getElementById("confetti-canvas").style.display = "none";
  document.getElementById("sad-emoji-rain").innerHTML = "";
  if(type==="win") {
    document.getElementById("confetti-canvas").style.display = "block";
    startConfetti();
  }
  if(type==="fail") {
    startSadRain();
  }
  overlay.onclick = function() {
    clearOverlay();
    if(typeof restartFn==="function") setTimeout(restartFn, 50);
  };
}
function clearOverlay() {
  const overlay = document.getElementById('overlay-message');
  overlay.style.display = "none";
  overlay.onclick = null;
  stopConfetti();
  document.getElementById("sad-emoji-rain").innerHTML = "";
}
// --- Konfeti Yağmuru ---
let confettiAnimId = null;
function startConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  let W = window.innerWidth, H = window.innerHeight;
  canvas.width = W; canvas.height = H;
  let confs = [];
  for(let i=0;i<120;i++) confs.push({
    x: Math.random()*W,
    y: Math.random()*-H,
    r: 8+Math.random()*12,
    d: Math.random()*150,
    color: randomConfColor(),
    tilt: Math.random()*10 - 10,
    tiltAngle: 0
  });
  function draw() {
    ctx.clearRect(0,0,W,H);
    for(let i=0;i<confs.length;i++){
      let c = confs[i];
      ctx.beginPath();
      ctx.lineWidth = c.r;
      ctx.strokeStyle = c.color;
      ctx.moveTo(c.x + c.tilt + c.r/3, c.y);
      ctx.lineTo(c.x + c.tilt, c.y + c.r*2);
      ctx.stroke();
    }
    update();
    confettiAnimId = requestAnimationFrame(draw);
  }
  function update() {
    for(let i=0;i<confs.length;i++){
      let c = confs[i];
      c.y += (Math.cos(c.d) + 3 + c.r/3)/2;
      c.x += Math.sin(0.01 * c.d);
      c.tilt = Math.sin(c.d) * 15;
      c.d += 0.02;
      if(c.y>H){
        c.x = Math.random()*W;
        c.y = -10;
        c.d = Math.random()*150;
      }
    }
  }
  draw();
}
function stopConfetti() {
  cancelAnimationFrame(confettiAnimId);
  const canvas = document.getElementById("confetti-canvas");
  if(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }
}
function randomConfColor() {
  const colors = ["#ff69b4","#ffb6d5","#ffe066","#7fcaff","#7fff8f","#ffd2fc","#b967ff","#fcb69f"];
  return colors[Math.floor(Math.random()*colors.length)];
}
// --- Üzgün Emoji Yağmuru ---
function startSadRain() {
  const sadDiv = document.getElementById("sad-emoji-rain");
  sadDiv.innerHTML = "";
  const emojis = ["😢","🥺","😭"];
  let w = window.innerWidth;
  let n = Math.floor(w/36);
  for(let i=0;i<n;i++){
    let span = document.createElement("span");
    span.className = "sad-emoji";
    span.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    span.style.left = (i*100/n + Math.random()*2) + "vw";
    span.style.fontSize = (1.6 + Math.random()*1.7) + "em";
    span.style.animationDelay = (Math.random()*0.7) + "s";
    sadDiv.appendChild(span);
  }
}
// --- Sayfa Açılışı ---
document.addEventListener("DOMContentLoaded", () => {
  restoreMode();
  showHome();
  initColorMatch();
  initBalloon();
  initAnimal();
  initMemory();
  setXoxMode(false);
  initMaze();
  initFlood();
  initGuessGame();
// BURAYA AŞAĞIDAKİ KODLARI YAPIŞTIRIN:
  // Sayı Tahmini Oyunu buton ve input event listener'ları:
  if (checkGuessBtn) { // checkGuessBtn'in varlığını kontrol et
      checkGuessBtn.addEventListener("click", checkGuess);
  }
  if (guessInput) { // guessInput'un varlığını kontrol et
      guessInput.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
              checkGuess();
          }
      });
  }
  // YAPIŞTIRMA İŞLEMİ BURADA BİTİYOR

}); // DOMContentLoaded bloğunun kapanış parantezi

function toggleRainbowTheme() {
  const body = document.body;
  const rainbowOn = body.classList.toggle('rainbow');
  // Gökkuşağı açılırsa gece modunu kapat
  if (rainbowOn) {
    body.classList.remove('night');
    document.getElementById('mode-btn').textContent = "🌙";
    document.getElementById('mode-btn').title = "Gece Modu";
  }
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowUp') {
    // yukarı git
  }
});

function hareketEt(yon) {
  switch (yon) {
    case 'up':
      // Yukarı git
      hareketYap('ArrowUp');
      break;
    case 'down':
      hareketYap('ArrowDown');
      break;
    case 'left':
      hareketYap('ArrowLeft');
      break;
    case 'right':
      hareketYap('ArrowRight');
      break;
  }
}

function hareketYap(tus) {
  // Eğer oyunun mevcut keydown olayına gönderim yapmak istersen:
  const olay = new KeyboardEvent('keydown', { key: tus });
  document.dispatchEvent(olay);
}
// --- Kim Kayboldu? Oyunu ---
const characters = [
    { name: 'Elma', emoji: '🍎' },
    { name: 'Muz', emoji: '🍌' },
    { name: 'Çilek', emoji: '🍓' },
    { name: 'Üzüm', emoji: '🍇' },
    { name: 'Portakal', emoji: '🍊' },
    { name: 'Kivi', emoji: '🥝' },
    { name: 'Kiraz', emoji: '🍒' },
    { name: 'Limon', emoji: '🍋' },
    { name: 'Köpek', emoji: '🐶' },
    { name: 'Kedi', emoji: '🐱' },
    { name: 'Tavşan', emoji: '🐰' },
    { name: 'Panda', emoji: '🐼' },
    { name: 'Ayı', emoji: '🐻' },
    { name: 'Aslan', emoji: '🦁' },
    { name: 'Fil', emoji: '🐘' },
    { name: 'Maymun', emoji: '🐒' },
    { name: 'Araba', emoji: '🚗' },
    { name: 'Uçak', emoji: '✈️' },
    { name: 'Tren', emoji: '🚂' },
    { name: 'Gemi', emoji: '⛵' },
    { name: 'Top', emoji: '⚽' },
    { name: 'Balon', emoji: '🎈' },
    { name: 'Çiçek', emoji: '🌸' },
    { name: 'Güneş', emoji: '☀️' }
];

let currentRoundCharacters = [];
let missingCharacter = null;
let displayTimeout;

function initWhosMissingGame() {
    clearTimeout(displayTimeout); // Önceki turun zamanlayıcısını temizle
    clearOverlay(); // Eğer varsa üst katmanı temizle (konfeti/sadrain gibi)
    document.getElementById('whos-missing-message').textContent = '';
    document.getElementById('whos-missing-next-btn').style.display = 'none';
    // BURADAKİ SATIRI SİLİN:
    // document.getElementById('whos-missing-restart-btn').style.display = 'none';
    generateWhosMissingRound();
}

function generateWhosMissingRound() {
    // Önceki turdan kalanları temizle
    document.getElementById('whos-missing-display').innerHTML = '';
    document.getElementById('whos-missing-options').innerHTML = '';
    document.getElementById('whos-missing-message').textContent = '';
    document.getElementById('whos-missing-next-btn').style.display = 'none';
    // BURADAKİ SATIRI SİLİN:
    // document.getElementById('whos-missing-restart-btn').style.display = 'none';

    // Rastgele karakter seçimi (örn: 5 karakter)
    const numCharacters = 6; // Ekranda görünecek emoji sayısı
    let shuffledCharacters = [...characters].sort(() => 0.5 - Math.random());
    currentRoundCharacters = shuffledCharacters.slice(0, numCharacters);

    // Kaybolacak karakteri seç
    const missingIndex = Math.floor(Math.random() * currentRoundCharacters.length);
    missingCharacter = currentRoundCharacters[missingIndex];

    // Karakterleri 5 saniye boyunca göster
    const displayGrid = document.getElementById('whos-missing-display');
    currentRoundCharacters.forEach(char => {
        const item = document.createElement('div');
        item.classList.add('whos-missing-item');
        item.textContent = char.emoji; // Emojiyi göster
        displayGrid.appendChild(item);
    });

    // 5 saniye sonra birini gizle ve seçenekleri göster
    displayTimeout = setTimeout(() => {
        displayGrid.innerHTML = ''; // Ekranı temizle
        
        let displayOrder = [...currentRoundCharacters];
        
        // Kaybolan karakterin yerine soru işareti emojisi koy
        displayOrder[missingIndex] = { name: 'Boşluk', emoji: '❓' }; 

        displayOrder.forEach(char => {
            const item = document.createElement('div');
            item.classList.add('whos-missing-item');
            if (char.emoji === '❓') {
                item.classList.add('hidden'); // Gizleme stili (opacity 0)
                item.style.fontSize = '1.5em'; // Soru işareti daha küçük görünebilir
            }
            item.textContent = char.emoji; // Emojiyi veya soru işaretini göster
            displayGrid.appendChild(item);
        });

        // Seçenekleri oluştur
        const optionsDiv = document.getElementById('whos-missing-options');
        let options = [];
        options.push(missingCharacter); // Doğru cevabı seçeneklere ekle
        
        // Diğer 4 yanlış seçeneği ekle
        let otherOptionsCount = numCharacters - 1; 
        let availableForOptions = shuffledCharacters.filter(c => 
            c.emoji !== missingCharacter.emoji && // Kaybolan karakter olmasın
            !currentRoundCharacters.some(crc => crc.emoji === c.emoji) // Halihazırda gösterilenlerden olmasın (❓ hariç)
        );
        availableForOptions = availableForOptions.slice(0, otherOptionsCount); // Yeterli seçenek bul
        options = [...options, ...availableForOptions]; // Doğru ve yanlış seçenekleri birleştir
        
        options.sort(() => 0.5 - Math.random()); // Seçenekleri karıştır

        options.forEach(charOption => {
            const button = document.createElement('button');
            button.classList.add('whos-missing-option-button');
            button.textContent = charOption.emoji; // Seçenek emojisini göster
            button.onclick = () => checkMissingAnswer(charOption); // Cevap kontrolü için event listener
            optionsDiv.appendChild(button);
        });

    }, 5000); // 5 saniye sonra gizle ve seçenekleri göster
}

// checkMissingAnswer fonksiyonunuzu aşağıdaki gibi güncelleyin:
function checkMissingAnswer(selectedCharacter) {
    const optionsButtons = document.querySelectorAll('.whos-missing-option-button');

    optionsButtons.forEach(btn => btn.disabled = true);

    // Mesajları göstermeden hemen önce güncel dili alıyoruz
    const currentLang = localStorage.getItem("melisaLang") || "tr";
    const t = diller[currentLang];

    if (selectedCharacter.emoji === missingCharacter.emoji) {
        // Doğru tahmin: showOverlay'i kullanarak kutlama ekranını ve konfetiyi göster
        showOverlay('win', t.whosMissingWin, '🎉', initWhosMissingGame); // initWhosMissingGame'i overlay kapanınca başlat
        
        // Sonraki tur butonu showOverlay'in işi değildir, burada kalsın
        document.getElementById('whos-missing-next-btn').style.display = 'inline-block';
        document.getElementById('whos-missing-next-btn').onclick = initWhosMissingGame;

    } else {
        // Yanlış tahmin: showOverlay'i kullanarak hata ekranını ve üzgün emojiyi göster
        showOverlay('fail', t.whosMissingWrong, '😢', null); // restartFn null, çünkü tekrar deneme istenecek

        // Seçenekleri tekrar aktif etme ve yanlış cevabı vurgulama mantığı
        optionsButtons.forEach(btn => btn.disabled = false); 
        optionsButtons.forEach(btn => {
            if (btn.textContent === selectedCharacter.emoji) {
                btn.style.backgroundColor = '#ffbb00'; // Yanlış cevabı vurgula
                setTimeout(() => btn.style.backgroundColor = 'var(--accent1)', 500); // Vurguyu kaldır
            }
        });
    }
    // BURADAKİ SATIRI SİLİN:
    // document.getElementById('whos-missing-restart-btn').style.display = 'inline-block';
}


// showOverlay ve clearOverlay fonksiyonlarınızın script.js dosyasında olduğundan emin olun.
// startConfetti, stopConfetti, randomConfColor, startSadRain fonksiyonlarınızın da script.js dosyasında olduğundan emin olun.


// --- Sıvı Ayırma Oyunu ---
const LIQUID_COLORS = ["#FF6347", "#ff2eff", "#32CD32", "#FFD700", "#9370DB", "#00CED1"]; // Kullanılacak sıvı renkleri
const TUBE_CAPACITY = 4; // Her tüpün alabileceği sıvı miktarı
const NUM_TUBES = 6; // Toplam tüp sayısı (oyun seviyesine göre ayarlanabilir)
const EMPTY_TUBES = 2; // Başlangıçta boş olacak tüp sayısı

let tubes = []; // Oyunun mevcut durumunu tutacak dizi
let selectedTube = null; // Seçilen tüpün indeksi
let liquidSortGameArea; // Oyun alanının DOM elementi

function initLiquidSortGame() {
    liquidSortGameArea = document.getElementById('liquid-sort-game-area');
    liquidSortGameArea.innerHTML = ''; // Önceki oyunu temizle
    tubes = [];
    selectedTube = null;

    // Renkleri karıştır ve tüplere dağıt
    let allLiquids = [];
    for (let i = 0; i < (NUM_TUBES - EMPTY_TUBES); i++) {
        for (let j = 0; j < TUBE_CAPACITY; j++) {
            allLiquids.push(LIQUID_COLORS[i % LIQUID_COLORS.length]);
        }
    }
    shuffleArray(allLiquids);

    // Tüpleri oluştur
    for (let i = 0; i < NUM_TUBES; i++) {
        tubes.push([]);
    }

    // Sıvıları tüplere doldur
    let currentLiquidIndex = 0;
    for (let i = 0; i < (NUM_TUBES - EMPTY_TUBES); i++) { // Sadece dolu tüplere doldur
        for (let j = 0; j < TUBE_CAPACITY; j++) {
            tubes[i].push(allLiquids[currentLiquidIndex++]);
        }
    }

    renderLiquidSortGame();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Elemanları yer değiştir
    }
}

function renderLiquidSortGame() {
    liquidSortGameArea.innerHTML = '';
    tubes.forEach((tube, index) => {
        const tubeElement = document.createElement('div');
        tubeElement.classList.add('liquid-sort-tube');
        if (index === selectedTube) {
            tubeElement.classList.add('selected');
        }
        tubeElement.dataset.index = index;
        tubeElement.onclick = () => handleTubeClick(index);

        // Sıvıları tüpün içine yerleştir
        tube.forEach(color => {
            const liquidLayer = document.createElement('div');
            liquidLayer.classList.add('liquid-layer');
            liquidLayer.style.backgroundColor = color;
            tubeElement.appendChild(liquidLayer);
        });

        // Tüpün boş kısımlarını doldur (görsel için)
        for (let i = tube.length; i < TUBE_CAPACITY; i++) {
            const emptyLayer = document.createElement('div');
            emptyLayer.classList.add('liquid-layer', 'empty');
            tubeElement.appendChild(emptyLayer);
        }
        liquidSortGameArea.appendChild(tubeElement);
    });
}

function handleTubeClick(index) {
    if (selectedTube === null) {
        // İlk tüp seçimi
        if (tubes[index].length > 0) {
            selectedTube = index;
            renderLiquidSortGame();
        }
    } else if (selectedTube === index) {
        // Aynı tüp tekrar seçilirse seçimi kaldır
        selectedTube = null;
        renderLiquidSortGame();
    } else {
        // İkinci tüp seçimi, sıvıyı aktarmaya çalış
        pourLiquid(selectedTube, index);
    }
}

function pourLiquid(fromIndex, toIndex) {
    const fromTube = tubes[fromIndex];
    const toTube = tubes[toIndex];

    if (fromTube.length === 0) {
        selectedTube = null;
        renderLiquidSortGame();
        return; // Kaynak tüp boşsa hiçbir şey yapma
    }

    const liquidToMove = fromTube[fromTube.length - 1]; // En üstteki sıvı

    // Hedef tüp doluysa veya renk uyuşmuyorsa ve hedef tüp boş değilse
    if (toTube.length === TUBE_CAPACITY ||
        (toTube.length > 0 && toTube[toTube.length - 1] !== liquidToMove)) {
        selectedTube = null;
        renderLiquidSortGame();
        return; // Geçersiz hareket
    }

    // Sıvıyı aktar
    let movedCount = 0; // Bu değişken oyunun toplam hamle sayacı değil, sadece bu aktarımın sayacıdır.
    for (let i = fromTube.length - 1; i >= 0; i--) {
        if (fromTube[i] === liquidToMove && toTube.length < TUBE_CAPACITY) {
            toTube.push(fromTube.pop());
            movedCount++;
        } else {
            break; // Farklı renk veya hedef dolu
        }
    }
    
    selectedTube = null;
    renderLiquidSortGame();

    if (checkLiquidSortWin()) {
        // Mesajı göstermeden hemen önce güncel dili alıyoruz
        const currentLang = localStorage.getItem("melisaLang") || "tr";
        const t = diller[currentLang];
        showOverlay("win", t.liquidSortWin, "🎉", initLiquidSortGame);
    }
}

function checkLiquidSortWin() {
    return tubes.every(tube => {
        if (tube.length === 0) {
            return true; // Boş tüpler de tamamlanmış sayılır
        }
        // Tüp doluysa ve tüm renkler aynıysa
        return tube.length === TUBE_CAPACITY && tube.every(color => color === tube[0]);
    });
}


// --- Düşenleri Yakala Oyunu ---
let catchGameCanvas;
let catchGameCtx;
let player;
let fallingObjects = [];
let catchScore = 0;
let catchGameActive = false;
let catchAnimationFrameId;
let objectGenerationInterval; // Nesne oluşturma interval'ı için
let objectSpeed = 1.5; // Nesnelerin düşme hızı (ayarladığınız güncel değer)
let playerSpeed = 20; // Oyuncunun hareket hızı (ayarladığınız güncel değer)

const PLAYER_WIDTH = 60;
const PLAYER_HEIGHT = 20;

// Mobil kontrol butonları değişkenleri
let catchLeftBtn;
let catchRightBtn;

function initCatchGame() {
    // Önceki oyunun animasyonunu durdur (varsa)
    if (catchAnimationFrameId) {
        cancelAnimationFrame(catchAnimationFrameId);
    }
    if (objectGenerationInterval) {
        clearInterval(objectGenerationInterval);
    }
    clearOverlay(); // Eğer varsa üst katmanı temizle

    catchGameCanvas = document.getElementById('catch-game-canvas');
    if (!catchGameCanvas) {
        console.error("Catch game canvas bulunamadı!");
        return;
    }
    catchGameCtx = catchGameCanvas.getContext('2d');

    player = {
        x: catchGameCanvas.width / 2 - PLAYER_WIDTH / 2,
        y: catchGameCanvas.height - PLAYER_HEIGHT - 10,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT
    };

    fallingObjects = [];
    catchScore = 0;
    objectSpeed = 1.5; // Hızı başlangıç değerine sıfırla
    catchGameActive = true;
    document.getElementById('catch-score').textContent = catchScore;

    // Nesne oluşturma interval'ını başlat (güncel değer)
    objectGenerationInterval = setInterval(generateFallingObject, 2000); // Örneğin 2 saniyede bir

    // Oyun döngüsünü başlat
    gameLoopCatch();

    // Klavye dinleyicilerini ekle (sadece bir kez ekle)
    if (!document.body.dataset.catchKeyListenerAdded) {
        document.addEventListener('keydown', handleCatchGameKeydown);
        document.body.dataset.catchKeyListenerAdded = true;
    }

    // Mobil kontrol butonlarını al ve olay dinleyicilerini ekle
    catchLeftBtn = document.getElementById('catch-left-btn');
    catchRightBtn = document.getElementById('catch-right-btn');

    if (catchLeftBtn && !catchLeftBtn.dataset.listenerAdded) {
        catchLeftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            player.x -= playerSpeed;
            if (player.x < 0) player.x = 0;
        });
        catchLeftBtn.addEventListener('mousedown', () => {
            player.x -= playerSpeed;
            if (player.x < 0) player.x = 0;
        });
        catchLeftBtn.dataset.listenerAdded = true;
    }

    if (catchRightBtn && !catchRightBtn.dataset.listenerAdded) {
        catchRightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            player.x += playerSpeed;
            if (player.x + player.width > catchGameCanvas.width) player.x = catchGameCanvas.width - player.width;
        });
        catchRightBtn.addEventListener('mousedown', () => {
            player.x += playerSpeed;
            if (player.x + player.width > catchGameCanvas.width) player.x = catchGameCanvas.width - player.width;
        });
        catchRightBtn.dataset.listenerAdded = true;
    }
}

function generateFallingObject() {
    const isStar = Math.random() > 0.3;
    fallingObjects.push({
        x: Math.random() * (catchGameCanvas.width - 20),
        y: 0,
        type: isStar ? 'star' : 'bomb',
        emoji: isStar ? '🌟' : '💣',
        size: 25,
        speed: objectSpeed + Math.random() * 1.5
    });
}

function drawPlayer() {
    catchGameCtx.fillStyle = 'var(--accent1)'; // Sarı oyuncu
    catchGameCtx.fillRect(player.x, player.y, player.width, player.height);
    
    catchGameCtx.font = '20px Arial';
    catchGameCtx.textAlign = 'center';
    catchGameCtx.fillText('🧺', player.x + player.width / 2, player.y + player.height - 2); // Sepet emojisi
}

function drawObject(obj) {
    catchGameCtx.font = `${obj.size}px Arial`;
    catchGameCtx.textAlign = 'center';

    // Temanın aktif olup olmadığını kontrol ederek renk belirliyoruz
    if (document.body.classList.contains('fenerbahce')) {
        // Fenerbahçe teması aktifse sarı ve koyu lacivert arasındaki renkleri kullan
        catchGameCtx.fillStyle = (obj.type === 'star') ? '#008000' : '#FFFF00'; // Yıldız sarı, bomba koyu lacivert
    } else {
        // Diğer temalarda (varsayılan, gece vb.) yıldız için siyah, bomba için koyu kırmızı
        catchGameCtx.fillStyle = (obj.type === 'star') ? '#FF69B4' : '#FF69B4'; // YILDIZ İÇİN SİYAH, bomba için koyu kırmızı
    }

    catchGameCtx.fillText(obj.emoji, obj.x + obj.size / 2, obj.y + obj.size);
}

function updateGame() {
    if (!catchGameActive) return;

    for (let i = 0; i < fallingObjects.length; i++) {
        let obj = fallingObjects[i];
        obj.y += obj.speed;

        // Çarpışma kontrolü
        if (obj.y + obj.size > player.y &&
            obj.x < player.x + player.width &&
            obj.x + obj.size > player.x &&
            obj.y < player.y + player.height) {

            // Çarpıştı!
            if (obj.type === 'star') {
                catchScore += 10;
                document.getElementById('catch-score').textContent = catchScore;
            } else if (obj.type === 'bomb') {
                catchScore -= 15;
                if (catchScore < 0) catchScore = 0;
                document.getElementById('catch-score').textContent = catchScore;
            }
            fallingObjects.splice(i, 1);
            i--;
        } else if (obj.y > catchGameCanvas.height) {
            // Ekranın dışına çıktı
            if (obj.type === 'star') {
                catchScore -= 5;
                if (catchScore < 0) catchScore = 0;
                document.getElementById('catch-score').textContent = catchScore;
            }
            fallingObjects.splice(i, 1);
            i--;
        }
    }

    // Oyun Bitiş Koşulu
    if (catchScore < -50) {
        catchGameActive = false;
        clearInterval(objectGenerationInterval);
        showOverlay("fail", "Oyun Bitti! Skorunuz çok düştü.", "💥", initCatchGame);
    }
    
    // Oyunun hızını skora göre artır (isteğe bağlı)
    objectSpeed = 1.5 + Math.floor(catchScore / 100) * 0.5;
}

function gameLoopCatch() {
    catchGameCtx.clearRect(0, 0, catchGameCanvas.width, catchGameCanvas.height); // Ekranı temizle

    drawPlayer();
    fallingObjects.forEach(drawObject); // Düşen objeleri çiz

    updateGame(); // Oyunu güncelle

    if (catchGameActive) {
        catchAnimationFrameId = requestAnimationFrame(gameLoopCatch); // Sonraki kareyi iste
    }
}

// Klavye olay dinleyicisi
function handleCatchGameKeydown(e) {
    if (!document.getElementById('section-catch').classList.contains('active') || !catchGameActive) return;

    if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.x -= playerSpeed;
        if (player.x < 0) player.x = 0;
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
        player.x += playerSpeed;
        if (player.x + player.width > catchGameCanvas.width) player.x = catchGameCanvas.width - player.width;
    }
}
// --- Yeni: Dropdown Menü Fonksiyonelliği ---
document.addEventListener('DOMContentLoaded', () => {
  const dropdownToggleBtn = document.querySelector('.dropdown-toggle-btn');
  const dropdownContainer = document.querySelector('.dropdown-container');

  if (dropdownToggleBtn && dropdownContainer) {
    // Dropdown butonuna tıklayınca menüyü aç/kapa
    dropdownToggleBtn.addEventListener('click', (event) => {
      dropdownContainer.classList.toggle('show');
      event.stopPropagation(); // Buton tıklaması sayfanın başka yerine yayılmasın
    });

    // Menünün dışına tıklayınca menüyü kapat
    document.addEventListener('click', (event) => {
      if (!dropdownContainer.contains(event.target)) {
        dropdownContainer.classList.remove('show');
      }
    });
  }

  // selectGame fonksiyonundaki buton "active" sınıfı güncellemesini düzeltme
  // Bu kısım, mevcut selectGame fonksiyonunun içinde değil, genel bir değişiklik olarak düşünülmelidir.
  // selectGame fonksiyonu içindeki 'nav button' seçicisini güncellemeye gerek kalmadı
  // çünkü artık 'nav button' yerine 'dropdown-content .nav-game-btn' ve 'btn-home' var.

  // selectGame fonksiyonunu biraz düzenleyelim, mevcut 'active' sınıfını temizlemesi için
  // showHome ve selectGame fonksiyonlarının başındaki 'document.querySelectorAll('nav button').forEach(el => el.classList.remove('active'));' satırını güncelleyelim.
  // Bu kısmı zaten önceki adımlarda yapmıştın, ama şimdi daha doğru bir seçici kullanacağız.
  // (BU KISMI DİREKT KOD İÇİNDE GÖSTERİCEM AŞAĞIDA)
});


const diller = {
  tr: {
    welcome: "Hoş geldin Melisa! 🎀",
    siteTitle: "🎀 Melisa'nın Oyun Sitesi 🎀",
    gamesDropdown: "Oyunlar ▾",
    languageToggle: "🌐 Dil ▾",
    welcomeMsg: "Burada eğlenceli oyunlar seni bekliyor!",
    about: "🙋‍♀️ Hakkımda",
    contact: "📧 İletişim",
    aboutTitle: "🙋‍♀️ Hakkımda", // "Hakkımda" başlığı
    aboutContent: "Ben Melisa. Bu siteyi hobilerimi ve favori oyunlarımı paylaşmak için oluşturdum. Boş zamanlarımda kod yazmayı, yeni oyunlar denemeyi ve pembe renkli her şeyi keşfetmeyi severim. Umarım sitemdeki oyunlardan keyif alırsın!", // "Hakkımda" paragraf içeriği
// İletişim bölümü için çeviriler (YENİ EKLENENLER)
    contactTitle: "📧 İletişim",
    contactP1: "Benimle iletişime geçmek istersen, aşağıdaki yolları kullanabilirsin:",
    contactP2: "Her türlü soru, geri bildirim veya önerin için bana ulaşmaktan çekinme!",

    home: "🏠 Ana Sayfa",
    colorMatch: "Renk Eşleştirme",
    colorMatchWin: "Tebrikler!",
    balloon: "Balon Patlatma",
balloonWin: "Tebrikler!",
    balloonWrong: "Yanlış balon!",
    memory: "Hafıza Oyunu",
    memoryWin: "Tebrikler!",
    animal: "Hayvan Bulma",
    animalWin: "Bravo! Doğru Bildin!",
    animalWrong: "Maalesef, Yanlış Cevap!",
    "Kedi": "Kedi",
    "Köpek": "Köpek",
    "Kuş": "Kuş",
    "Tavşan": "Tavşan",
    "Balık": "Balık",
    "At": "At",
    "İnek": "İnek",
    "Fil": "Fil",
    xox: "XOX",
    xoxWin: "%s kazandı!", // %s yerine X veya O gelecek
    xoxDraw: "Berabere! Tekrar dene.",
    sudoku: "Sudoku",
    maze: "Labirent",
 mazeHitWall: "Duvara çarptın! Başa dönüyorsun...",
    mazeFoundExit: "Tebrikler! Çıkışı buldun!",
    flood: "Renk Doldurma",
    floodWin: "Tebrikler! Hamle: %d",
movesLabel: "Hamle: ",
    numberGuessing: "Sayı Tahmini Oyunu",
    rules_numberGuessing: "1 ile 100 arasında bir sayı tuttum. Tahmin et!",
    guessCount: "Deneme Sayısı:",
    guessInputPlaceholder: "Tahminini gir",
    checkGuessBtn: "Tahmin Et",
    previousGuesses: "Önceki Tahminler:",
    restartBtn: "Yeniden Başlat",
    guessTooHigh: "Daha küçük bir sayı dene.",
    guessTooLow: "Daha büyük bir sayı dene.",
    guessCorrect: "Tebrikler! Doğru tahmin ettin!",
    guessResultCorrectDetailed: "Tebrikler! Doğru tahmin ettin, sayı %s idi ve bunu %d tahminde buldun!",
    whosMissing: "Ne Kayboldu?",
    whosMissingTitle: "Kim Kayboldu? 🕵️‍♀️",
    rules_whosMissing: "Resimlere dikkatlice bak, biri kaybolunca onu bul!",
    whosMissingNextBtn: "Sonraki Tur",
whosMissingWin: "Bravo! Doğru Bildin!",
    whosMissingWrong: "Maalesef, Yanlış Cevap!",
// YENİ EKLENECEK HEDEF VURMA OYUNU ÇEVİRİLERİ
    targetClick: "Hedef Vurma Oyunu", // Oyunun menüdeki adı
    targetClickTitle: "🎯 Hedef Vurma Oyunu", // Oyunun sayfa içi başlığı
    rules_targetClick: "Ekranda beliren hedefe hızlıca tıkla! Süre dolmadan en yüksek puanı topla.", // Oyunun kuralları/açıklaması
    targetClickScore: "Skor: ",
    targetClickTime: "Süre: ",
    targetClickStartBtn: "Oyunu Başlat",
    targetClickGameOver: "Oyun Bitti!",
    targetClickYourScore: "Skorun: %d", // %d yerine skor gelecek
    targetClickHomeTitle: "Hedef Vurma",
    targetClickHomeDesc: "Ekranda beliren hedeflere hızlıca tıkla.",


// Sıvı Ayırma Oyunu için çeviriler
liquidSortWin: "Tebrikler! Sıvıları Ayırdın!",
liquidSort: "Sıvı Ayırma", // Oyunun menüdeki adı
liquidSortTitle: "Sıvı Ayırma", // Oyunun sayfa içi başlığı
rules_liquidSort: "Sıvıları doğru tüplere ayır!", // Oyunun kuralları/açıklaması
// Düşenleri Yakala! Oyunu için çeviriler
catchGame: "Düşenleri Yakala!", // Oyunun menüdeki adı
catchGameTitle: "🌟 Düşenleri Yakala!", // Oyunun sayfa içi başlığı
rules_catchGame: "Sepeti sağa-sola hareket ettirerek düşen yıldızları topla, bombalardan kaç!", // Oyunun kuralları/açıklaması
scoreLabel: "Skor: ",
// Ana Sayfa Oyun Kartları için çeviriler
colorMatchHomeTitle: "Renk Eşleştirme",
colorMatchHomeDesc: "Aynı renkli kutuları bulup eşleştir.",

balloonHomeTitle: "Balon Patlatma",
balloonHomeDesc: "Balonları 1'den 20'ye sırayla patlat.",

animalHomeTitle: "Hayvan Bulma",
animalHomeDesc: "Doğru hayvanı resimlerden seç.",

memoryHomeTitle: "Hafıza Oyunu",
memoryHomeDesc: "Eş olan kartları bul.",

xoxHomeTitle: "XOX",
xoxHomeDesc: "Sırayla X ve O koy, üçlü yap veya bilgisayara karşı oyna.",

sudokuHomeTitle: "Sudoku",
sudokuHomeDesc: "Rakamları doğru yerleştir.",

mazeHomeTitle: "Labirent",
mazeHomeDesc: "Ok tuşları ile karakteri çıkışa ulaştır.",

floodHomeTitle: "Renk Doldurma",
floodHomeDesc: "Tüm kutuları aynı renge boyamaya çalış.",

numberGuessingHomeTitle: "Sayı Tahmini",
numberGuessingHomeDesc: "Doğru sayıyı bul ve Kazan.",

whosMissingHomeTitle: "Kim Kayboldu?",
whosMissingHomeDesc: "Kaybolan Nesneyi bul.",

liquidSortHomeTitle: "Sıvıları Ayırma Oyunu",
liquidSortHomeDesc: "Renkli sıvıları doğru tüplere ayır.",

catchGameHomeTitle: "Yakala Oyunu",
catchGameHomeDesc: "Yukarıdan düşen nesneleri yakala. Bombalara Dikkat!",

// Alt mesaj çevirisi
melisaBottomMsg: "Hoş geldin Melisa, Keyifli Oyunlar! 💖",

// Müzik Çalar için çeviriler
musicPlayerPrevious: "⬅️ Önceki", // "Önceki" butonu metni
musicPlayerPlay: "🎵 Oynat", // "Oynat" butonu metni
musicPlayerPause: "⏸️ Durdur", // "Durdur" butonu metni (Oynat/Durdur butonu için)
musicPlayerNext: "Sonraki ➡️", // "Sonraki" butonu metni

    rules_maze: "Ok tuşları ile karakteri çıkışa ulaştır! Duvara çarparsan başa dönersin.",
    rules_flood: "Tüm kutuları aynı renge boyamaya çalış! Başlangıç: sol üstten başla.",

    rules_colorMatch: "Aynı renkleri bul ve eşleştir!",
    rules_balloon: "Balonları 1'den 20'ye sırayla patlat. Yanlış balona tıklarsan oyun başa döner!",
    rules_animal: "Resme bak, doğru hayvanı seç!",
    rules_memory: "Aynı şekilleri bul ve eşleştir!",
    rules_xox: "Sırayla X ve O koy, üçlü yap veya bilgisayara karşı oyna.",
    rules_sudoku: "Rakamları doğru yerleştir!"
  },
  uk: {
    welcome: "Ласкаво просимо, Мелісо! 🎀",
    siteTitle: "🎀 Ігровий Сайт Меліси 🎀",
    gamesDropdown: "Ігри ▾",
    languageToggle: "🌐 Мова ▾",
    welcomeMsg: "Веселі ігри чекають на тебе тут!",
    about: "🙋‍♀️ Про Мене",
    contact: "📧 Зв'язок",
    aboutTitle: "🙋‍♀️ Про мене", // "Hakkımda" başlığı
    aboutContent: "Привіт! Я Меліса. Я створила цей сайт, щоб поділитися своїми хобі та улюбленими іграми. У вільний час я люблю писати код, пробувати нові ігри та досліджувати все рожеве. Сподіваюся, вам сподобаються ігри на моєму сайті!", // "Hakkımda" paragraf içeriği
// İletişim bölümü için çeviriler (YENİ EKLENENLER)
    contactTitle: "📧 Зв'язок",
    contactP1: "Якщо ви хочете зв'язатися зі мною, ви можете скористатися наступними способами:",
    contactP2: "Не соромтеся звертатися до мене з будь-якими питаннями, відгуками чи пропозиціями!",

    home: "🏠 Головна",
    colorMatch: "Збіг кольорів",
colorMatchWin: "Вітаємо!",
    balloon: "Лопни кульки",
balloonWin: "Вітаємо!", // "Tebrikler!"
    balloonWrong: "Неправильна кулька!",
    memory: "Гра на пам’ять",
    memoryWin: "Вітаємо!",
    animal: "Знайди тварину",
    animalWin: "Молодець! Правильно!", // "Bravo! Doğru Bildin!"
    animalWrong: "На жаль, Невірна Відповідь!",
    "Kedi": "Кіт",
    "Köpek": "Собака",
    "Kuş": "Птах",
    "Tavşan": "Кролик",
    "Balık": "Риба",
    "At": "Кінь",
    "İnek": "Корова",
    "Fil": "Слон",
    xox: "Хрестики-нулики",
    xoxWin: "%s переміг!", // %s yerine X veya O gelecek
    xoxDraw: "Нічия! Спробуй ще раз.",
    sudoku: "Судоку",
    maze: "Лабіринт",
mazeHitWall: "Ти врізався в стіну! Повертаєшся на початок...", // "Duvara çarptın! Başa dönüyorsun..."
    mazeFoundExit: "Вітаємо! Ти знайшов вихід!", // "Tebrikler! Çıkışı buldun!"
    
    flood: "Заповнення кольором",
floodWin: "Вітаємо! Кроки: %d",
movesLabel: "Кроки: ",
    numberGuessing: "Гра Вгадай Число",
    rules_numberGuessing: "Я загадав число від 1 до 100. Вгадай!",
    guessCount: "Кількість спроб:",
    guessInputPlaceholder: "Введіть свою здогадку",
    checkGuessBtn: "Вгадати",
    previousGuesses: "Попередні здогадки:",
    restartBtn: "Перезапустити",
guessTooHigh: "Спробуй менше число.", // "Daha küçük bir sayı dene."
    guessTooLow: "Спробуй більше число.",  // "Daha büyük bir sayı dene."
    guessCorrect: "Вітаємо! Ти вгадав!", // "Tebrikler! Doğru tahmin ettin!"
guessResultCorrectDetailed: "Вітаємо! Ти вгадав, число було %s, і ти знайшов його за %d спроб!",
guessCorrectShort: "Виграв!", // BU SATIRI EKLEYİN!
    // Kim Kayboldu? Oyunu için çeviriler (BURADAN İTİBAREN EKLEYECEĞİNİZ KISIM)
    whosMissing: "Що зникло?",
    whosMissingTitle: "Хто загубився? 🕵️‍♀️",
    rules_whosMissing: "Уважно подивіться на картинки, знайдіть ту, що зникне!",
whosMissingWin: "Молодець! Правильно!", // "Bravo! Doğru Bildin!"
    whosMissingWrong: "На жаль, Невірна Відповідь!",
    whosMissingNextBtn: "Наступний раунд",
// YENİ EKLENECEK HEDEF VURMA OYUNU ÇEVİRİLERİ
    targetClick: "Гра «Влуч у ціль»", // "Hedef Vurma Oyunu"
    targetClickTitle: "🎯 Гра «Влуч у ціль»", // "Hedef Vurma Oyunu"
    rules_targetClick: "Швидко натискайте на ціль, що з'являється на екрані! Зберіть найбільшу кількість балів до закінчення часу.", // "Ekranda beliren hedefe hızlıca tıkla! Süre dolmadan en yüksek puanı topla."
    targetClickScore: "Рахунок: ", // "Skor: "
    targetClickTime: "Час: ", // "Süre: "
    targetClickStartBtn: "Почати гру", // "Oyunu Başlat"
    targetClickGameOver: "Гра закінчена!", // "Oyun Bitti!"
    targetClickYourScore: "Ваш рахунок: %d", // "Skorun: %d"
    targetClickHomeTitle: "Влуч у ціль", // "Hedef Vurma"
    targetClickHomeDesc: "Швидко натискайте на цілі, що з'являються на екрані.", // "Ekranda beliren hedeflere hızlıca tıkla."

// Sıvı Ayırma Oyunu için çeviriler
liquidSortWin: "Вітаємо! Ви відсортували рідини!",
liquidSort: "Сортування Рідини", // Oyunun menüdeki adı
liquidSortTitle: "Гра «Сортування рідини»", // Oyunun sayfa içi başlığı
rules_liquidSort: "Сортуйте рідини в правильні пробірки!", // Oyunun kuralları/açıklaması
// Düşenleri Yakala! Oyunu için çeviriler
catchGame: "Збери падаючі!", // Oyunun menüdeki adı
catchGameTitle: "🌟 Збери падаючі!", // Oyunun sayfa içi başlığı
rules_catchGame: "Рухайте кошик вліво-вправо, збирайте падаючі зірки, уникайте бомб!", // Oyunun kuralları/açıklaması
scoreLabel: "Рахунок: ",

// Ana Sayfa Oyun Kartları için çeviriler
colorMatchHomeTitle: "Кольоровий Матч",
colorMatchHomeDesc: "Знайдіть і зіставте однакові кольорові коробки.",

balloonHomeTitle: "Лопни Кульки",
balloonHomeDesc: "Лопніть кульки по порядку від 1 до 20.",

animalHomeTitle: "Знайди Тварину",
animalHomeDesc: "Виберіть правильну тварину з картинок.",

memoryHomeTitle: "Гра на Пам'ять",
memoryHomeDesc: "Знайдіть пари карт.",

xoxHomeTitle: "Хрестики-Нулики",
xoxHomeDesc: "Ставте X та O по черзі, зробіть трійку або грайте проти комп'ютера.",

sudokuHomeTitle: "Судоку",
sudokuHomeDesc: "Правильно розмістіть цифри.",

mazeHomeTitle: "Лабіринт",
mazeHomeDesc: "Виведіть персонажа до виходу за допомогою клавіш зі стрілками.",

floodHomeTitle: "Заповнення Кольору",
floodHomeDesc: "Спробуйте пофарбувати всі коробки в один колір.",

numberGuessingHomeTitle: "Вгадай Число",
numberGuessingHomeDesc: "Знайдіть правильне число і виграйте.",

whosMissingHomeTitle: "Хто Зник?",
whosMissingHomeDesc: "Знайдіть зниклий об'єкт.",

liquidSortHomeTitle: "Гра Сортування Рідини",
liquidSortHomeDesc: "Розділіть кольорові рідини на правильні пробірки.",

catchGameHomeTitle: "Гра Злови",
catchGameHomeDesc: "Ловіть предмети, що падають зверху. Обережно з бомбами!!",

// Alt mesaj çevirisi
melisaBottomMsg: "Ласкаво просимо, Мелісо, приємних ігор! 💖",

// Müzik Çalar için çeviriler
musicPlayerPrevious: "⬅️ Попередня", // "Önceki" butonu metni
musicPlayerPlay: "🎵 Відтворити", // "Oynat" butonu metni
musicPlayerPause: "⏸️ Пауза", // "Durdur" butonu metni (Oynat/Durdur butonu için)
musicPlayerNext: "Наступна ➡️", // "Sonraki" butonu metni

    rules_colorMatch: "Знайди і зістав однакові кольори!",
    rules_balloon: "Лопай кульки по черзі від 1 до 20. Якщо помилишся — гра почнеться знову!",
    rules_animal: "Подивись на зображення та обери правильну тварину!",
    rules_memory: "Знайди однакові форми та зістав їх!",
    rules_xox: "По черзі став X та O, утвори трійку або грай проти комп’ютера.",
    rules_sudoku: "Розмістіть цифри правильно!",
    rules_maze: "Використовуйте стрілки, щоб провести персонажа до виходу! Якщо вріжетесь в стіну, повернетесь на початок.",
    rules_flood: "Спробуйте зафарбувати всі клітинки одним кольором! Початок: з лівого верхнього кута."

  }
};

function setLanguage(lang) {
    localStorage.setItem("melisaLang", lang);
    const t = diller[lang];

    // Sayfa Başlığını Güncelle (tarayıcı sekmesi)
    document.title = t.siteTitle;

    // Sayfa İçindeki Melisa Başlığını Güncelle (span.melisa-title)
    const melisaTitleSpan = document.querySelector(".melisa-title");
    if (melisaTitleSpan) {
        melisaTitleSpan.textContent = t.siteTitle;
    }

    // Dil seçici butonu metni
    const languageToggleBtnEl = document.getElementById("language-toggle-btn");
    if (languageToggleBtnEl) {
        languageToggleBtnEl.textContent = t.languageToggle;
    }

    // Hakkımda bölümü metinleri
    const aboutTitleEl = document.getElementById("about-title");
    if (aboutTitleEl) {
        aboutTitleEl.textContent = t.aboutTitle;
    }
    const aboutContentEl = document.getElementById("about-content");
    if (aboutContentEl) {
        aboutContentEl.textContent = t.aboutContent;
    }

    // İletişim bölümü metinleri
    const contactTitleEl = document.getElementById("contact-title");
    if (contactTitleEl) {
        contactTitleEl.textContent = t.contactTitle;
    }
    const contactP1El = document.getElementById("contact-p1");
    if (contactP1El) {
        contactP1El.textContent = t.contactP1;
    }
    const contactP2El = document.getElementById("contact-p2");
    if (contactP2El) {
        contactP2El.textContent = t.contactP2;
    }

    // Kim Kayboldu? Oyunu metinleri
    const whosMissingTitleEl = document.getElementById("whos-missing-title");
    if (whosMissingTitleEl) {
        whosMissingTitleEl.textContent = t.whosMissingTitle;
    }
    const rulesWhosMissingEl = document.getElementById("rules-whos-missing");
    if (rulesWhosMissingEl) {
        rulesWhosMissingEl.textContent = t.rules_whosMissing;
    }
    const whosMissingNextBtnEl = document.getElementById("whos-missing-next-btn");
    if (whosMissingNextBtnEl) {
        whosMissingNextBtnEl.textContent = t.whosMissingNextBtn;
    }

    // Sıvı Ayırma Oyunu metinleri
    const liquidSortTitleEl = document.getElementById("liquid-sort-title");
    if (liquidSortTitleEl) {
        liquidSortTitleEl.textContent = t.liquidSortTitle;
    }
    const rulesLiquidSortEl = document.getElementById("rules-liquid-sort");
    if (rulesLiquidSortEl) {
        rulesLiquidSortEl.textContent = t.rules_liquidSort;
    }
    const btnLiquidSort = document.getElementById("btn-liquid-sort");
    if (btnLiquidSort) {
        const spanEl = btnLiquidSort.querySelector("span");
        if (spanEl) {
            spanEl.textContent = t.liquidSort;
        }
    }

    // Düşenleri Yakala! Oyunu metinleri (Sayfa içi başlık ve kurallar)
    const catchGameTitleEl = document.getElementById("catch-game-title");
    if (catchGameTitleEl) {
        catchGameTitleEl.textContent = t.catchGameTitle;
    }
    const rulesCatchGameEl = document.getElementById("rules-catch-game");
    if (rulesCatchGameEl) {
        rulesCatchGameEl.textContent = t.rules_catchGame;
    }
    const catchScoreLabelEl = document.getElementById("catch-score-label");
    if (catchScoreLabelEl) {
        if (catchScoreLabelEl.childNodes.length > 0 && catchScoreLabelEl.childNodes[0].nodeType === Node.TEXT_NODE) {
            catchScoreLabelEl.childNodes[0].nodeValue = t.scoreLabel;
        } else {
            catchScoreLabelEl.textContent = t.scoreLabel + (document.getElementById("catch-score") ? document.getElementById("catch-score").textContent : '0');
        }
    }
    const btnCatchGame = document.getElementById("btn-catch");
    if (btnCatchGame) {
        const spanEl = btnCatchGame.querySelector("span");
        if (spanEl) {
            spanEl.textContent = t.catchGame;
        }
    }

    // Müzik Çalar buton metinleri
    const oncekiBtnEl = document.getElementById("oncekiBtn");
    if (oncekiBtnEl) {
        oncekiBtnEl.textContent = t.musicPlayerPrevious;
    }
    const oynatDurdurBtnEl = document.getElementById("oynatDurdurBtn");
    if (oynatDurdurBtnEl) {
        oynatDurdurBtnEl.textContent = t.musicPlayerPlay;
    }
    if (typeof sesOynatici !== 'undefined' && typeof oynatDurdurBtn !== 'undefined') {
        sesOynatici.addEventListener('play', () => {
            const t = diller[localStorage.getItem("melisaLang") || "tr"];
            oynatDurdurBtn.textContent = t.musicPlayerPause;
        });
        sesOynatici.addEventListener('pause', () => {
            const t = diller[localStorage.getItem("melisaLang") || "tr"];
            oynatDurdurBtn.textContent = t.musicPlayerPlay;
        });
    }
    const sonrakiBtnEl = document.getElementById("sonrakiBtn");
    if (sonrakiBtnEl) {
        sonrakiBtnEl.textContent = t.musicPlayerNext;
    }

    // Statik başlıklar
    document.querySelector(".melisa-welcome-box h2").textContent = t.welcome;
    document.querySelector(".melisa-welcome-msg").textContent = t.welcomeMsg;
    document.getElementById("btn-home").textContent = t.home;
    document.getElementById("btn-about").textContent = t.about;
    document.getElementById("btn-contact").textContent = t.contact;

    // Oyunlar dropdown butonu
    const gamesDropdownBtn = document.querySelector(".dropdown-toggle-btn");
    if (gamesDropdownBtn) {
        gamesDropdownBtn.textContent = t.gamesDropdown;
    }

    // Oyun başlıkları (dropdown menüdeki butonlar)
    document.querySelector("#btn-color-match span").textContent = t.colorMatch;
    document.querySelector("#btn-balloon span").textContent = t.balloon;
    document.querySelector("#btn-animal span").textContent = t.animal;
    document.querySelector("#btn-memory span").textContent = t.memory;
    document.querySelector("#btn-xox span").textContent = t.xox;
    document.querySelector("#btn-target-click span").textContent = t.targetClick;
    const mazeNavBtn = document.querySelector("#btn-maze span");
    if (mazeNavBtn) {
        mazeNavBtn.textContent = t.maze;
    }
    const floodNavBtn = document.querySelector("#btn-flood span");
    if (floodNavBtn) {
        floodNavBtn.textContent = t.flood;
    }
    const numberGuessingNavBtn = document.querySelector("#btn-number-guessing span");
    if (numberGuessingNavBtn) {
        numberGuessingNavBtn.textContent = t.numberGuessing;
    }
    const btnWhosMissing = document.getElementById("btn-whos-missing");
    if (btnWhosMissing) {
        const spanEl = btnWhosMissing.querySelector("span");
        if (spanEl) {
            spanEl.textContent = t.whosMissing;
        }
    }


    // Oyun başlık metinleri (h2)
    document.querySelector("#section-color-match h2").textContent = "🎨 " + t.colorMatch;
    document.querySelector("#section-balloon h2").textContent = "🎈 " + t.balloon;
    document.querySelector("#section-animal h2").textContent = "🐶 " + t.animal;
    document.querySelector("#section-memory h2").textContent = "🃏 " + t.memory;
    document.querySelector("#section-xox h2").textContent = "❌⭕ " + t.xox;
    document.querySelector("#section-target-click h2").textContent = t.targetClickTitle;
    document.querySelector("#section-maze h2").textContent = "🌀 " + t.maze;
    document.querySelector("#section-flood h2").textContent = "🌈 " + t.flood;
    const numberGuessingH2 = document.querySelector("#section-number-guessing h2");
    if (numberGuessingH2) {
        numberGuessingH2.textContent = t.numberGuessing;
    }


    // Kurallar (ve diğer spesifik metinler)
    document.querySelector("#section-color-match .rules").textContent = t.rules_colorMatch;
    document.querySelector("#section-balloon .rules").textContent = t.rules_balloon;
    document.querySelector("#section-animal .rules").textContent = t.rules_animal;
    document.querySelector("#section-memory .rules").textContent = t.rules_memory;
    document.querySelector("#xox-rules-text").textContent = t.rules_xox;
    const targetClickRulesElement = document.querySelector("#rules-target-click"); // <-- YENİ EKLENECEK SATIR
if (targetClickRulesElement) { // Yeni eklenecek
    targetClickRulesElement.textContent = t.rules_targetClick; // Yeni eklenecek
}
    const mazeRulesElement = document.querySelector("#section-maze .rules");
    if (mazeRulesElement) {
        mazeRulesElement.textContent = t.rules_maze;
    }
    document.querySelector("#section-flood .rules").textContent = t.rules_flood;

    // Sayı Tahmini Oyunu'na özel metinler ve butonlar:
    const guessMessageP = document.getElementById("guessMessage");
    if (guessMessageP) {
        guessMessageP.textContent = t.rules_numberGuessing;
    }
    const guessCountP = document.getElementById("guessCount");
    if (guessCountP) {
        guessCountP.textContent = t.guessCount + " 0";
    }
    const guessInput = document.getElementById("guessInput");
    if (guessInput) {
        guessInput.placeholder = t.guessInputPlaceholder;
    }
    const checkGuessBtn = document.getElementById("checkGuessBtn");
    if (checkGuessBtn) {
        checkGuessBtn.textContent = t.checkGuessBtn;
    }
    const previousGuessesP = document.getElementById("previousGuesses");
    if (previousGuessesP) {
        previousGuessesP.textContent = t.previousGuesses;
    }

    // Ana Sayfa Oyun Kartları Başlık ve Açıklamaları (TÜMÜ)
    const gameCards = [
        { idTitle: "color-match-home-title", idDesc: "color-match-home-desc", keyTitle: "colorMatchHomeTitle", keyDesc: "colorMatchHomeDesc" },
        { idTitle: "balloon-home-title", idDesc: "balloon-home-desc", keyTitle: "balloonHomeTitle", keyDesc: "balloonHomeDesc" },
        { idTitle: "animal-home-title", idDesc: "animal-home-desc", keyTitle: "animalHomeTitle", keyDesc: "animalHomeDesc" },
        { idTitle: "memory-home-title", idDesc: "memory-home-desc", keyTitle: "memoryHomeTitle", keyDesc: "memoryHomeDesc" },
        { idTitle: "xox-home-title", idDesc: "xox-home-desc", keyTitle: "xoxHomeTitle", keyDesc: "xoxHomeDesc" },
        { idTitle: "target-click-home-title", idDesc: "target-click-home-desc", keyTitle: "targetClickHomeTitle", keyDesc: "targetClickHomeDesc" },
        { idTitle: "maze-home-title", idDesc: "maze-home-desc", keyTitle: "mazeHomeTitle", keyDesc: "mazeHomeDesc" },
        { idTitle: "flood-home-title", idDesc: "flood-home-desc", keyTitle: "floodHomeTitle", keyDesc: "floodHomeDesc" },
        { idTitle: "number-guessing-home-title", idDesc: "number-guessing-home-desc", keyTitle: "numberGuessingHomeTitle", keyDesc: "numberGuessingHomeDesc" },
        { idTitle: "whos-missing-home-title", idDesc: "whos-missing-home-desc", keyTitle: "whosMissingHomeTitle", keyDesc: "whosMissingHomeDesc" },
        { idTitle: "liquid-sort-home-title", idDesc: "liquid-sort-home-desc", keyTitle: "liquidSortHomeTitle", keyDesc: "liquidSortHomeDesc" },
        { idTitle: "catch-game-home-title", idDesc: "catch-game-home-desc", keyTitle: "catchGameHomeTitle", keyDesc: "catchGameHomeDesc" }
    ];

    gameCards.forEach(card => {
        const titleEl = document.getElementById(card.idTitle);
        if (titleEl) {
            titleEl.textContent = t[card.keyTitle];
        }
        const descEl = document.getElementById(card.idDesc);
        if (descEl) {
            descEl.textContent = t[card.keyDesc];
        }
    });

    // Alt mesaj çevirisi
    const melisaBottomMsgEl = document.getElementById("melisa-bottom-msg-text");
    if (melisaBottomMsgEl) {
        melisaBottomMsgEl.textContent = t.melisaBottomMsg;
    }

   // Genel yeniden başlatma butonları (title özelliği olanlar)
    document.querySelectorAll(".restart-btn").forEach(btn => {
        if (btn.title === "Yeniden Başlat" || btn.title === "Перезапустити" || btn.title === t.restartBtn) {
            btn.title = t.restartBtn;
        }
    });

    // Eğer aktif bir oyun varsa, onu seçilen yeni dilde yeniden başlat
    if (activeGameName) {
        selectGame(activeGameName);
    }
} // setLanguage fonksiyonunun kapanış parantezi


window.addEventListener("DOMContentLoaded", () => {
  const lang = localStorage.getItem("melisaLang") || "tr";
  setLanguage(lang);
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.onclick = () => setLanguage(btn.dataset.lang);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const langToggleBtn = document.querySelector(".language-toggle-btn");
  const langMenu = document.querySelector(".language-dropdown-content");

  langToggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    langMenu.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    langMenu.classList.remove("show");
  });
});

