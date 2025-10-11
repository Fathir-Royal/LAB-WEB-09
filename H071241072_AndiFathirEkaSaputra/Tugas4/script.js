// script.js (Final: Standard Deck, Bot UNO Logic, Player call UNO on Bot, Timer/Penalty, Game Over)
const colors=["red","blue","green","yellow"];
const numbers=[0,1,2,3,4,5,6,7,8,9]; // 0-9
const actions=["skip","reverse","plus2"];
const wilds=["wild","plus_4"];
const INITIAL_SALDO = 5000;

let deck=[], player=[], bot=[], discard=[], turn="player", saldo=INITIAL_SALDO;
let playerUnoTimer=null, playerUnoPending=false, gameActive=false;
let botUnoTimer=null, botUnoPending=false, botUnoCalled=false;

const $=id=>document.getElementById(id);
const rand=arr=>arr[Math.floor(Math.random()*arr.length)];
const cardSrc=c=> c ? (c.color==="black" ? `${c.value}.png` : `${c.color}_${c.value}.png`) : "card_back.png";
const shuffle=a=>a.sort(()=>Math.random()-.5);

// MODIFIKASI: Implementasi Standard UNO Deck (108 Kartu)
function initDeck() {
  deck = [];

  colors.forEach(c => {
    // Kartu 0-9 (hanya satu per warna)
    for (let n = 0; n <= 9; n++) {
      deck.push({ color: c, value: n });
    }

    // Kartu aksi (satu per warna)
    actions.forEach(a => {
      deck.push({ color: c, value: a });
    });
  });

  // Kartu Wild dan +4 (masing-masing satu saja)
  wilds.forEach(w => {
    deck.push({ color: "black", value: w });
  });

  shuffle(deck);
}

function draw(target,n=1){
  for(let i=0;i<n;i++){
    if(deck.length===0) reshuffle();
    if(deck.length===0) break;
    target.push(deck.pop());
  }
}

function reshuffle(){
  if(discard.length<=1) return;
  const top = discard.pop();
  deck = deck.concat(discard.splice(0).map(c=>{
    delete c.chosenColor; // Clear chosenColor on reshuffle
    return c;
  }));
  shuffle(deck);
  discard = [top];
}

function renderHand(area,arr,hide=false){
  area.innerHTML="";
  const playableExists = arr.some(c=>canPlay(c));
  arr.forEach((c,i)=>{
    const playable = canPlay(c);
    const d=document.createElement("div");
    d.className = `card cursor-pointer transform transition-all duration-200
      ${!hide && playable ? "border-4 border-green-500 shadow-lg" : "border border-gray-600"}
      ${!hide ? "hover:-translate-y-2" : ""}`;
    const src = hide ? "card_back.png" : cardSrc(c);
    d.innerHTML = `<img src="assets/${src}" alt="">`;
    if(!hide) d.onclick = ()=>playCard(i);
    area.appendChild(d);
  });

  // Handle discard pulse (only if player's turn, game active, and no playable card)
  const discardImg = $("discard").querySelector("img");
  if(discardImg && gameActive && turn === "player" && arr === player) {
    if(!playableExists) {
      discardImg.classList.add("animate-pulse","ring-4","ring-yellow-400","rounded-lg");
    } else {
      discardImg.classList.remove("animate-pulse","ring-4","ring-yellow-400","rounded-lg");
    }
  } else if (discardImg) {
     discardImg.classList.remove("animate-pulse","ring-4","ring-yellow-400","rounded-lg");
  }
}

function renderAll(){
  // if game inactive, show empty hands
  renderHand($("playerArea"), gameActive ? player : [], false);
  renderHand($("botArea"), gameActive ? bot : [], true);

  let top = (gameActive && discard.length) ? discard[discard.length-1] : null;

  // Add chosen color indicator if it exists
  let cardHtml = `<img src="assets/${cardSrc(top)}" alt="discard" class="rounded-lg shadow-lg">`;
  if(top && top.chosenColor){
    // Small visual indicator for chosen color
    cardHtml += `<div style="position:absolute;bottom:-10px;right:-10px;width:30px;height:30px;border-radius:50%;background-color:${top.chosenColor};border:3px solid #0f1110"></div>`;
  }

  // Use a container for the card and color indicator
  $("discard").innerHTML = `<div style="position:relative;width:100%;height:100%">${cardHtml}</div>`;

  $("saldo").textContent = `💰 Saldo: $${saldo}`;
  $("status").textContent = turn==="player" ? "Giliran Anda!" : (gameActive ? "Menunggu bot..." : $("status").textContent);

  const deckElement = $("deck");
  if (gameActive && turn === "player") {
    const playableExists = player.some(c => canPlay(c));
    if (!playableExists) {
      // Tambahkan border hijau, tanpa pulse/ring
      deckElement.classList.add("border-4", "border-green-500", "shadow-lg");
      // Pastikan kelas yang menyebabkan pulse dihilangkan
      deckElement.classList.remove("animate-pulse", "ring-4", "ring-green-400");
    } else {
      // Hapus efek jika ada kartu yang bisa dimainkan
      deckElement.classList.remove("border-4", "border-green-500", "shadow-lg", "animate-pulse", "ring-4", "ring-green-400");
    }
  } else {
    // Hapus efek jika bukan giliran pemain atau game tidak aktif
    deckElement.classList.remove("border-4", "border-green-500", "shadow-lg", "animate-pulse", "ring-4", "ring-green-400");
  }
}

function canPlay(card){
  const top = discard[discard.length-1];
  if(!top) return true;
  const topColor = top.chosenColor ? top.chosenColor : top.color;
  return card.color==="black" || card.color===topColor || card.value===top.value;
}

// --- MODAL/POPUP FUNCTIONS START ---
function showModal(title, contentHtml, onConfirm, onCancel, confirmText = "OK", cancelText = "Batal", topPosition = '40%') {
  removeModal();
  const modal = document.createElement("div");
  modal.id = "customModalOverlay";
  modal.className = "fixed flex items-center justify-center z-[10000]";
  modal.style.top = topPosition; 
  modal.style.left = '50%';
  modal.style.transform = 'translateX(-50%)';

  modal.innerHTML = `
    <div class="bg-cod-dark border border-cod-metal p-6 rounded-lg shadow-2xl min-w-[300px] text-center">
      <h3 class="text-xl text-yellow-400 mb-4">${title}</h3>
      <div class="text-gray-200 mb-6">${contentHtml}</div>
      <div id="modalButtons" class="flex justify-center gap-4">
        ${onConfirm ? `<button id="modalConfirm" class="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold">${confirmText}</button>` : ''}
        ${onCancel ? `<button id="modalCancel" class="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded font-bold">${cancelText}</button>` : ''}
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  if (onConfirm) $("modalConfirm").onclick = () => { removeModal(); onConfirm(); };
  if (onCancel) $("modalCancel").onclick = () => { removeModal(); onCancel(); };
}

function removeModal() {
  const modal = $("customModalOverlay");
  if (modal) modal.remove();
}

function chooseColorUI(callback){
  const colorButtonsHtml = colors.map(c =>
    `<button class="p-4 rounded-lg font-bold" style="background-color:${c};color:black;" data-color="${c}">${c.toUpperCase()}</button>`
  ).join('');

  showModal("Pilih Warna", `<div class="flex justify-center gap-3">${colorButtonsHtml}</div>`, null, null, null, null, '20%');

  const buttons = document.querySelectorAll("#customModalOverlay button[data-color]");
  buttons.forEach(btn => {
    btn.onclick = () => {
      removeModal();
      callback(btn.getAttribute("data-color"));
    };
  });
}
// --- MODAL/POPUP FUNCTIONS END ---


function startGame(){
  if(document.getElementById("gameOverOverlay")) { alert("Game Over aktif. Tekan Mulai Ulang pada layar Game Over."); return; }
  const bet = parseInt($("taruhan").value)||0;
  if(bet<100||bet>saldo){ alert("Taruhan tidak valid!"); return; }
  initDeck(); player=[]; bot=[]; discard=[]; playerUnoPending=false; botUnoPending=false;
  for(let i=0;i<7;i++){ draw(player); draw(bot); }
  
  discard.push(deck.pop());
  while(discard[discard.length-1].color==="black"){
    deck.unshift(discard.pop()); shuffle(deck);
    discard.push(deck.pop());
  }
  turn="player"; gameActive=true; $("status").textContent="Giliran Anda!";
  showUnoButton(true); 
  renderAll();
}

function playCard(i){
  if(turn!=="player"||!gameActive) return;
  const card = player[i];
  if(!canPlay(card)){ alert("Kartu tidak cocok! Klik deck untuk mengambil kartu."); return; }

  if(card.value === "plus_4"){
    const hasOtherPlayable = player.some((c, idx) => idx !== i && canPlay(c) && c.color !== "black");
    if(hasOtherPlayable){
      alert("Anda tidak boleh memainkan +4 karena masih ada kartu lain yang bisa dimainkan!");
      return;
    }
  }
  
  if(card.color === "black"){
    chooseColorUI(chosenColor => {
      player.splice(i,1);
      discard.push(card);
      discard[discard.length-1].chosenColor = chosenColor;
      applyAction(card,"player");
      renderAll(); postPlayChecks();
    });
    return;
  }

  player.splice(i,1); discard.push(card);
  delete discard[discard.length-1].chosenColor;
  applyAction(card,"player");
  renderAll(); postPlayChecks();
}

function postPlayChecks(){
  // Check Player UNO Status
  if(player.length===1) startPlayerUnoTimer(); else clearPlayerUnoTimer();
  
  // Check Bot UNO Status
  if(bot.length===1) startBotUnoTimer(); else clearBotUnoTimer(); 

  checkWin();
  renderAll();
  if(turn==="bot" && gameActive) setTimeout(botPlay,1500);
}

function botPlay(){
  if(!gameActive) return;
  reshuffle();
  const idx = bot.findIndex(c=> canPlay(c));
  
  if(idx>=0){
    const card = bot.splice(idx,1)[0];
    discard.push(card);
    const chosenColor = rand(colors);
    if(card.color==="black") discard[discard.length-1].chosenColor = chosenColor;
    applyAction(card,"bot", chosenColor);
  } else {
    draw(bot,1);
    const last = bot[bot.length-1];
    if(last && canPlay(last)){
      const card = bot.pop();
      discard.push(card);
      const chosenColor = rand(colors);
      if(card.color==="black") discard[discard.length-1].chosenColor = chosenColor;
      applyAction(card,"bot", chosenColor);
    } else turn="player";
  }
  renderAll(); postPlayChecks();
}

function applyAction(card,playedBy, botChosenColor = null){
  const opp = playedBy==="player" ? "bot" : "player";

  if(card.color==="black"){
    const chosenColor = botChosenColor || discard[discard.length-1].chosenColor;

    if(card.value==="wild"){
      discard[discard.length-1].chosenColor = chosenColor; turn = opp; return;
    }
    if(card.value==="plus_4"){
      draw(playedBy==="player"?bot:player,4);
      discard[discard.length-1].chosenColor = chosenColor;
      turn = playedBy; return;
    }
  }

  if(card.value==="skip"||card.value==="reverse"){ turn = playedBy; return; }
  if(card.value==="plus2"){ draw(playedBy==="player"?bot:player,2); turn = playedBy; return; }
  
  delete discard[discard.length-1].chosenColor;
  turn = opp;
}

// Implementasi checkWin dan Game Over
function checkWin(){
  const bet = parseInt($("taruhan").value)||0;
  if(player.length===0){ saldo += bet; endRound("Anda Menang!"); return; }
  if(bot.length===0){ saldo -= bet; endRound("Anda Kalah!"); return; }
  // Check Saldo habis/minus
  if(saldo<=0){ saldo=0; endRound("GAME OVER!", true); }
}

function clearAllTimers(){
  if(playerUnoTimer) { clearTimeout(playerUnoTimer); playerUnoTimer=null; }
  playerUnoPending=false;
  if(botUnoTimer) { clearTimeout(botUnoTimer); botUnoTimer=null; }
  botUnoPending=false;
}

function endRound(msg, isGameOver = false){
  clearAllTimers();
  gameActive=false;
  player=[]; bot=[]; discard=[];
  renderAll();
  showUnoButton(false);
  removeModal();
  if(isGameOver){
    showGameOverOverlay();
  } else {
    alert(msg);
    $("status").textContent = msg + " Klik Mulai untuk main lagi.";
  }
}

/* Game Over overlay - NO CHANGES NEEDED */
function showGameOverOverlay(){
  if(document.getElementById("gameOverOverlay")) return;
  const ov = document.createElement("div");
  ov.id="gameOverOverlay";
  ov.style.position="fixed";
  ov.style.left=0; ov.style.top=0; ov.style.right=0; ov.style.bottom=0;
  ov.style.background="rgba(0,0,0,0.85)"; ov.style.display="flex";
  ov.style.alignItems="center"; ov.style.justifyContent="center"; ov.style.zIndex=9999;
  ov.innerHTML = `
    <div style="background:#0b0f0b;color:#f8f6f0;padding:28px;border-radius:10px;min-width:320px;text-align:center;border:3px solid #4d4d4d">
      <h2 style="font-size:28px;margin-bottom:8px;color:#ffcc00">GAME OVER</h2>
      <p style="margin-bottom:18px">Saldo Anda habis. Mulai ulang permainan dengan saldo awal?</p>
      <button id="restartBtn" style="background:#2f4b2f;color:#fff;padding:10px 18px;border-radius:6px;border:none;font-weight:700;cursor:pointer">Mulai Ulang ($${INITIAL_SALDO})</button>
    </div>`;
  document.body.appendChild(ov);
  document.getElementById("restartBtn").onclick = ()=>{
    saldo = INITIAL_SALDO;
    clearAllTimers();
    removeGameOverOverlay();
    $("status").textContent = "Saldo di-reset. Tekan Mulai untuk bermain.";
    renderAll();
  };
}

function removeGameOverOverlay(){
  const ov = document.getElementById("gameOverOverlay");
  if(ov) ov.remove();
}

/* UNO pemain - Penalty Timer & Successful Call */
function startPlayerUnoTimer(){
  if(playerUnoPending) return;
  playerUnoPending=true;
  $("status").textContent="Tekan UNO dalam 5 detik!";
  playerUnoTimer = setTimeout(()=>{
    if(playerUnoPending){
      alert("🚨 PENALTI! Bot memanggil UNO pada Anda. Anda lupa memanggil UNO dan harus mengambil 2 kartu.");
      draw(player,2);
      playerUnoPending=false;
      $("status").textContent="Lupa UNO: +2 kartu (penalti)";
      renderAll();
    }
  },5000);
}
function clearPlayerUnoTimer(){ if(playerUnoTimer){ clearTimeout(playerUnoTimer); playerUnoTimer=null;} playerUnoPending=false; }

// LOGIC BARU: UNO Bot - Bot akan "lupa" setelah 5.5 detik
function startBotUnoTimer(){
  if(botUnoPending) return;
  botUnoPending=true;
  botUnoCalled=false;
  
  // Timer penalti 5.5 detik (Player punya 5.5 detik untuk memanggil UNO)
  botUnoTimer = setTimeout(()=>{
    if(botUnoPending){
      draw(bot,2);
      botUnoPending=false;
      $("status").textContent="Bot lupa UNO: +2 kartu (penalti)";
      renderAll();
    }
  },5500);
  
  // Bot "memanggil UNO" setelah 3 detik (simulasi berhasil)
  // Jika player tidak memanggil UNO sebelum 3 detik, bot akan "berhasil"
  setTimeout(() => {
    if (botUnoPending) {
      clearBotUnoTimer();
      botUnoCalled = true;
      $("status").textContent="Bot: UNO!";
      renderAll();
    }
  }, 3000);
}
function clearBotUnoTimer(){ if(botUnoTimer){ clearTimeout(botUnoTimer); botUnoTimer=null; } botUnoPending=false; botUnoCalled=false; }


$("deck").onclick = ()=>{
  if(turn!=="player"||!gameActive) return;
  const hasPlayable = player.some(c=>canPlay(c));
  if(hasPlayable){ alert("Masih ada kartu yang bisa dimainkan!"); return; }

  draw(player,1);
  const lastDrawnCard = player[player.length-1];

  if(lastDrawnCard && canPlay(lastDrawnCard)){
    renderAll();

    const cardIdx = player.length - 1;

    showModal(
      "Kartu Baru yang Diambil",
      `<div class="flex flex-col items-center gap-4">
        <div class="card w-32 h-48 border border-gray-600 rounded-lg overflow-hidden shadow-lg">
          <img src="assets/${cardSrc(lastDrawnCard)}" alt="Kartu yang diambil">
        </div>
        <p>Anda mengambil kartu. Mainkan kartu ini atau lewati giliran?</p>
      </div>`,
      () => {
        if(lastDrawnCard.color === "black"){
          chooseColorUI(chosenColor => {
            player.splice(cardIdx,1); discard.push(lastDrawnCard);
            discard[discard.length-1].chosenColor = chosenColor;
            applyAction(lastDrawnCard, "player");
            renderAll(); postPlayChecks();
          });
        } else {
          player.splice(cardIdx,1); discard.push(lastDrawnCard);
          applyAction(lastDrawnCard,"player");
          renderAll(); postPlayChecks();
        }
      },
      () => {
        turn="bot"; renderAll(); setTimeout(botPlay,1500);
      },
      "Mainkan Kartu",
      "Lewati Giliran",
      '30%'
    );

  } else {
    turn = "bot";
    $("status").textContent = "Menunggu bot...";
    renderAll();
    setTimeout(botPlay, 1500);
    }

};

/* Tombol UNO - MODIFIKASI: Tambah panggil UNO pada Bot */
$("unoBtn").onclick = ()=>{
  if(bot.length === 1 && botUnoCalled) {
    alert("ANDA TERLAMBAT! Bot sudah berhasil memanggil UNO untuk dirinya sendiri.");
    $("status").textContent="Bot berhasil mengamankan UNO.";
    return;
  }

  if(turn==="player" && bot.length===1 && botUnoPending){
    draw(bot, 2);
    clearBotUnoTimer();
    alert("ANDA memanggil UNO pada Bot! Bot mendapat +2 kartu.");
    $("status").textContent="ANDA memanggil UNO pada Bot!";
    renderAll();
    return;
  }
  
  // 2. Player call UNO for themselves
  if(player.length===1 && playerUnoPending){
    clearPlayerUnoTimer();
    alert("UNO! (berhasil)");
    $("status").textContent="UNO ditekan!";
    return;
  }
  
  // 3. Invalid call
  alert("Belum waktunya UNO.");
};

const showUnoButton = (show) => {
    const btn = $("unoBtn");
    if (show) {
        btn.classList.remove("hidden");
        btn.classList.add("flex"); // Ganti 'flex' jika tata letak Anda berbeda
    } else {
        btn.classList.add("hidden");
        btn.classList.remove("flex");
    }
};

/* Tombol Mulai */
$("mulaiBtn").onclick = startGame;

/* inisialisasi tampilan awal */
renderAll();
showUnoButton(false);