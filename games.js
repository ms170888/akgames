/* ========================================================
 AK GAMES - 7 Browser Games for Maaz
 Pure vanilla JS, no dependencies
 ======================================================== */

// ==================== PARTICLES BACKGROUND ====================
(function initParticles() {
 const c = document.getElementById('particles-bg');
 const ctx = c.getContext('2d');
 let W, H;
 const particles = [];
 const COLORS = ['#00ff88', '#00d4ff', '#b44aff', '#ff44aa'];

 function resize() {
 W = c.width = window.innerWidth;
 H = c.height = window.innerHeight;
 }
 resize();
 window.addEventListener('resize', resize);

 for (let i = 0; i < 60; i++) {
 particles.push({
 x: Math.random() * W, y: Math.random() * H,
 vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
 r: Math.random() * 2 + 1,
 color: COLORS[Math.floor(Math.random() * COLORS.length)],
 alpha: Math.random() * 0.5 + 0.2
 });
 }

 function animate() {
 ctx.clearRect(0, 0, W, H);
 for (const p of particles) {
 p.x += p.vx; p.y += p.vy;
 if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
 if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
 ctx.beginPath();
 ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
 ctx.fillStyle = p.color;
 ctx.globalAlpha = p.alpha;
 ctx.fill();
 }
 ctx.globalAlpha = 1;
 requestAnimationFrame(animate);
 }
 animate();
})();

// ==================== NAVIGATION ====================
const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');
const gameTitle = document.getElementById('game-title');
const gameArea = document.getElementById('game-area');
const gameScoreDisplay = document.getElementById('game-score-display');

let currentGame = null;
let gameCleanup = null;

function launchGame(name) {
 mainMenu.classList.add('hidden');
 gameContainer.classList.remove('hidden');
 gameScoreDisplay.textContent = '';
 gameArea.innerHTML = '';

 if (gameCleanup) { gameCleanup(); gameCleanup = null; }

 currentGame = name;
 switch (name) {
 case 'snake': initSnake(); break;
 case 'tictactoe': initTicTacToe(); break;
 case 'memory': initMemory(); break;
 case 'runner': initRunner(); break;
 case 'puzzle': initPuzzle(); break;
 case 'shooter': initShooter(); break;
 case 'pong': initPong(); break;
 case 'bingo': initBingo(); break;
 case 'hideseek': initHideSeek(); break;
 case 'racing': initRacing(); break;
 case 'spotdiff': initSpotDiff(); break;
 case 'tag': initTag(); break;
 case 'geodash': initGeoDash(); break;
 case 'kingshot': initKingShot(); break;
 case 'minicraft': initMiniCraft(); break;
 case 'forest99': initForest99(); break;
 case 'brookhaven': initBrookhaven(); break;
 case 'gorillatag': initGorillaTag(); break;
 case 'fnaf': initFNAF(); break;
 case 'scaryshawarma': initScaryShawarma(); break;
 case 'redgreenlight': initRedGreenLight(); break;
 case 'hittarget': initHitTarget(); break;
 case 'ludo': initLudo(); break;
 case 'connect4': initConnect4(); break;
 case 'chess': initChess(); break;
 case 'basketball': initBasketball(); break;
 case 'soccer': initSoccer(); break;
 case 'football': initFootball(); break;
 case 'granny': initGranny(); break;
 case 'blockblast': initBlockBlast(); break;
 case 'tvhorror': initTVHorror(); break;
 case 'eating': initEatingSimulator(); break;

 }
}

function backToMenu() {
 if (gameCleanup) { gameCleanup(); gameCleanup = null; }
 currentGame = null;
 gameContainer.classList.add('hidden');
 mainMenu.classList.remove('hidden');
}

function getHigh(key) { return parseInt(localStorage.getItem('ak_'+ key) || '0'); }
function setHigh(key, val) {
 const prev = getHigh(key);
 if (val > prev) { localStorage.setItem('ak_'+ key, val); return true; }
 return false;
}

function showGameOver(title, score, highKey, onRestart) {
 const isNew = setHigh(highKey, score);
 const hi = getHigh(highKey);
 const overlay = document.createElement('div');
 overlay.className = 'game-over-overlay';
 overlay.innerHTML = `
 <h2>${title}</h2>
 <div class="final-score">Score: ${score}</div>
 <div class="high-score">Best: ${hi}${isNew? ' - NEW RECORD!': ''}</div>
 `;
 const btn = document.createElement('button');
 btn.className = 'game-btn';
 btn.textContent = 'Play Again';
 btn.onclick = () => { overlay.remove(); onRestart(); };
 overlay.appendChild(btn);

 const menuBtn = document.createElement('button');
 menuBtn.className = 'game-btn';
 menuBtn.textContent = 'Menu';
 menuBtn.onclick = () => { overlay.remove(); backToMenu(); };
 overlay.appendChild(menuBtn);

 document.body.appendChild(overlay);
}


// ==================== 1. SNAKE ====================
function initSnake() {
 gameTitle.textContent = 'Snake';
 const SIZE = 20;
 const canvas = document.createElement('canvas');
 canvas.className = 'game-canvas';
 canvas.width = 400; canvas.height = 400;
 const COLS = canvas.width / SIZE;
 const ROWS = canvas.height / SIZE;
 const ctx = canvas.getContext('2d');

 const info = document.createElement('div');
 info.className = 'game-info';
 info.innerHTML = `<span>Score: <b id="snake-score">0</b></span><span>Best: <b id="snake-high">${getHigh('snake')}</b></span>`;

 const startBtn = document.createElement('button');
 startBtn.className = 'game-btn';
 startBtn.textContent = 'Start';

 // Mobile controls
 const mobileControls = document.createElement('div');
 mobileControls.style.cssText = 'display:grid;grid-template-columns:repeat(3,60px);grid-template-rows:repeat(2,50px);gap:4px;margin-top:12px;justify-content:center;';
 const dirs = [
 ['', 'UP', ''],
 ['LT', 'DN', 'RT']
];
 const dirMap = {'UP':'up', 'DN':'down', 'LT':'left', 'RT':'right'};
 dirs.forEach(row => {
 row.forEach(d => {
 const b = document.createElement('button');
 b.className = 'game-btn';
 b.style.cssText = 'padding:8px;font-size:1.2rem;margin:0;';
 b.textContent = d;
 if (d && dirMap[d]) {
 b.onclick = () => { changeDir(dirMap[d]); };
 } else {
 b.style.visibility = 'hidden';
 }
 mobileControls.appendChild(b);
 });
 });

 gameArea.append(info, canvas, startBtn, mobileControls);

 let snake, dir, nextDir, food, score, running, interval;

 function reset() {
 snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
 dir = 'right'; nextDir = 'right';
 score = 0;
 placeFood();
 draw();
 updateScore();
 }

 function placeFood() {
 do {
 food = { x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS) };
 } while (snake.some(s => s.x === food.x && s.y === food.y));
 }

 function changeDir(d) {
 const opp = {up:'down',down:'up',left:'right',right:'left'};
 if (d!== opp[dir]) nextDir = d;
 }

 function updateScore() {
 document.getElementById('snake-score').textContent = score;
 document.getElementById('snake-high').textContent = getHigh('snake');
 }

 function step() {
 dir = nextDir;
 const head = {...snake[0]};
 if (dir === 'up') head.y--;
 else if (dir === 'down') head.y++;
 else if (dir === 'left') head.x--;
 else if (dir === 'right') head.x++;

 // Wall collision
 if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) { die(); return; }
 // Self collision
 if (snake.some(s => s.x === head.x && s.y === head.y)) { die(); return; }

 snake.unshift(head);
 if (head.x === food.x && head.y === food.y) {
 score += 10;
 updateScore();
 placeFood();
 } else {
 snake.pop();
 }
 draw();
 }

 function die() {
 running = false;
 clearInterval(interval);
 startBtn.textContent = 'Start';
 showGameOver('Game Over!', score, 'snake', () => { reset(); });
 }

 function draw() {
 ctx.fillStyle = '#0d0d20';
 ctx.fillRect(0, 0, canvas.width, canvas.height);

 // Grid lines (subtle)
 ctx.strokeStyle = '#151535';
 ctx.lineWidth = 0.5;
 for (let i = 0; i <= COLS; i++) { ctx.beginPath(); ctx.moveTo(i*SIZE,0); ctx.lineTo(i*SIZE,canvas.height); ctx.stroke(); }
 for (let i = 0; i <= ROWS; i++) { ctx.beginPath(); ctx.moveTo(0,i*SIZE); ctx.lineTo(canvas.width,i*SIZE); ctx.stroke(); }

 // Food
 ctx.fillStyle = '#ff4444';
 ctx.shadowColor = '#ff4444';
 ctx.shadowBlur = 10;
 ctx.beginPath();
 ctx.arc(food.x*SIZE+SIZE/2, food.y*SIZE+SIZE/2, SIZE/2-2, 0, Math.PI*2);
 ctx.fill();
 ctx.shadowBlur = 0;

 // Snake
 snake.forEach((s, i) => {
 const brightness = 1 - (i / snake.length) * 0.5;
 ctx.fillStyle = i === 0? '#00ff88': `rgba(0,255,136,${brightness})`;
 ctx.shadowColor = '#00ff88';
 ctx.shadowBlur = i === 0? 8: 3;
 ctx.fillRect(s.x*SIZE+1, s.y*SIZE+1, SIZE-2, SIZE-2);
 });
 ctx.shadowBlur = 0;
 }

 function onKey(e) {
 if (currentGame!== 'snake') return;
 const map = {ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
 if (map[e.key]) { e.preventDefault(); changeDir(map[e.key]); }
 }

 document.addEventListener('keydown', onKey);

 startBtn.onclick = () => {
 if (running) { running = false; clearInterval(interval); startBtn.textContent = 'Start'; return; }
 reset();
 running = true;
 startBtn.textContent = 'Pause';
 interval = setInterval(step, 120);
 };

 reset();
 gameCleanup = () => { running = false; clearInterval(interval); document.removeEventListener('keydown', onKey); };
}


// ==================== 2. TIC TAC TOE ====================
function initTicTacToe() {
 gameTitle.textContent = 'Tic Tac Toe';

 let board, turn, gameOver;
 let wins = getHigh('ttt_wins'), losses = getHigh('ttt_losses'), draws = getHigh('ttt_draws');

 const scores = document.createElement('div');
 scores.className = 'ttt-scores';
 scores.innerHTML = `<span class="you">You: <b id="ttt-w">${wins}</b></span><span class="draw">Draw: <b id="ttt-d">${draws}</b></span><span class="cpu">CPU: <b id="ttt-l">${losses}</b></span>`;

 const status = document.createElement('div');
 status.className = 'ttt-status';
 status.textContent = 'Your turn! (X)';

 const boardDiv = document.createElement('div');
 boardDiv.className = 'ttt-board';

 const restartBtn = document.createElement('button');
 restartBtn.className = 'game-btn';
 restartBtn.textContent = 'New Game';

 gameArea.append(scores, status, boardDiv, restartBtn);

 function reset() {
 board = Array(9).fill('');
 turn = 'X'; gameOver = false;
 status.textContent = 'Your turn! (X)';
 render();
 }

 function render() {
 boardDiv.innerHTML = '';
 for (let i = 0; i < 9; i++) {
 const cell = document.createElement('div');
 cell.className = 'ttt-cell'+ (board[i] === 'X'? 'x': board[i] === 'O'? 'o': '');
 cell.textContent = board[i];
 cell.onclick = () => playerMove(i);
 boardDiv.appendChild(cell);
 }
 }

 function checkWin(b) {
 const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
 for (const [a,bb,c] of lines) {
 if (b[a] && b[a] === b[bb] && b[a] === b[c]) return b[a];
 }
 return b.every(c => c)? 'draw': null;
 }

 function minimax(b, isMax, depth) {
 const w = checkWin(b);
 if (w === 'O') return 10 - depth;
 if (w === 'X') return depth - 10;
 if (w === 'draw') return 0;

 if (isMax) {
 let best = -Infinity;
 for (let i = 0; i < 9; i++) {
 if (!b[i]) { b[i] = 'O'; best = Math.max(best, minimax(b, false, depth+1)); b[i] = ''; }
 }
 return best;
 } else {
 let best = Infinity;
 for (let i = 0; i < 9; i++) {
 if (!b[i]) { b[i] = 'X'; best = Math.min(best, minimax(b, true, depth+1)); b[i] = ''; }
 }
 return best;
 }
 }

 function cpuMove() {
 // Make CPU beatable: 30% random move
 if (Math.random() < 0.3) {
 const empty = board.map((v,i) => v === ''? i: -1).filter(i => i>=0);
 if (empty.length) {
 board[empty[Math.floor(Math.random()*empty.length)]] = 'O';
 return;
 }
 }
 let bestScore = -Infinity, bestMove = -1;
 for (let i = 0; i < 9; i++) {
 if (!board[i]) {
 board[i] = 'O';
 const s = minimax(board, false, 0);
 board[i] = '';
 if (s > bestScore) { bestScore = s; bestMove = i; }
 }
 }
 if (bestMove >= 0) board[bestMove] = 'O';
 }

 function playerMove(i) {
 if (gameOver || board[i] || turn!== 'X') return;
 board[i] = 'X';
 let result = checkWin(board);
 if (result) { endGame(result); return; }
 turn = 'O';
 status.textContent = 'CPU thinking...';
 render();
 setTimeout(() => {
 cpuMove();
 result = checkWin(board);
 if (result) { endGame(result); return; }
 turn = 'X';
 status.textContent = 'Your turn! (X)';
 render();
 }, 400);
 }

 function endGame(result) {
 gameOver = true;
 if (result === 'X') {
 status.textContent = 'You win!';
 wins++; localStorage.setItem('ak_ttt_wins', wins);
 } else if (result === 'O') {
 status.textContent = 'CPU wins!';
 losses++; localStorage.setItem('ak_ttt_losses', losses);
 } else {
 status.textContent = 'Draw!';
 draws++; localStorage.setItem('ak_ttt_draws', draws);
 }
 document.getElementById('ttt-w').textContent = wins;
 document.getElementById('ttt-d').textContent = draws;
 document.getElementById('ttt-l').textContent = losses;
 render();
 }

 restartBtn.onclick = reset;
 reset();
 gameCleanup = () => {};
}


// ==================== 3. MEMORY MATCH ====================
function initMemory() {
 gameTitle.textContent = 'Memory Match';

 const emojis = ['', '', '', '', '', '', '', ''];
 let cards, flipped, matched, moves, timerStart, timerInterval, locked;

 const info = document.createElement('div');
 info.className = 'game-info';
 info.innerHTML = `<span>Moves: <b id="mem-moves">0</b></span><span>Time: <b id="mem-time">0s</b></span><span>Best: <b id="mem-high">${getHigh('memory') || '- '}</b> moves</span>`;

 const grid = document.createElement('div');
 grid.className = 'memory-grid';

 const restartBtn = document.createElement('button');
 restartBtn.className = 'game-btn';
 restartBtn.textContent = 'New Game';

 gameArea.append(info, grid, restartBtn);

 function shuffle(arr) {
 for (let i = arr.length - 1; i > 0; i--) {
 const j = Math.floor(Math.random() * (i + 1));
 [arr[i], arr[j]] = [arr[j], arr[i]];
 }
 return arr;
 }

 function reset() {
 clearInterval(timerInterval);
 cards = shuffle([...emojis,...emojis]);
 flipped = []; matched = new Set(); moves = 0; locked = false;
 timerStart = null;
 document.getElementById('mem-moves').textContent = '0';
 document.getElementById('mem-time').textContent = '0s';
 document.getElementById('mem-high').textContent = getHigh('memory') || '- ';
 render();
 }

 function render() {
 grid.innerHTML = '';
 cards.forEach((emoji, i) => {
 const card = document.createElement('div');
 card.className = 'memory-card'+
 (flipped.includes(i)? 'flipped': '') +
 (matched.has(i)? 'matched': '');
 card.textContent = (flipped.includes(i) || matched.has(i))? emoji: '?';
 card.onclick = () => flip(i);
 grid.appendChild(card);
 });
 }

 function flip(i) {
 if (locked || flipped.includes(i) || matched.has(i) || flipped.length >= 2) return;
 if (!timerStart) {
 timerStart = Date.now();
 timerInterval = setInterval(() => {
 document.getElementById('mem-time').textContent = Math.floor((Date.now()-timerStart)/1000) + 's';
 }, 1000);
 }

 flipped.push(i);
 render();

 if (flipped.length === 2) {
 moves++;
 document.getElementById('mem-moves').textContent = moves;
 locked = true;
 const [a, b] = flipped;
 if (cards[a] === cards[b]) {
 matched.add(a); matched.add(b);
 flipped = []; locked = false;
 render();
 if (matched.size === cards.length) {
 clearInterval(timerInterval);
 const time = Math.floor((Date.now()-timerStart)/1000);
 // For high score, lower moves is better, so we track inverse
 // Just store moves, show as "best"
 const prev = getHigh('memory');
 if (!prev || moves < prev) localStorage.setItem('ak_memory', moves);
 document.getElementById('mem-high').textContent = localStorage.getItem('ak_memory') || moves;
 showGameOver('You Win!', moves + ' moves in '+ time + 's', 'memory_dummy', reset);
 }
 } else {
 setTimeout(() => { flipped = []; locked = false; render(); }, 800);
 }
 }
 }

 restartBtn.onclick = reset;
 reset();
 gameCleanup = () => { clearInterval(timerInterval); };
}


// ==================== 4. ENDLESS RUNNER ====================
function initRunner() {
 gameTitle.textContent = 'Endless Runner';

 const canvas = document.createElement('canvas');
 canvas.className = 'game-canvas';
 canvas.width = 600; canvas.height = 250;
 const ctx = canvas.getContext('2d');

 const info = document.createElement('div');
 info.className = 'game-info';
 info.innerHTML = `<span>Score: <b id="run-score">0</b></span><span>Best: <b id="run-high">${getHigh('runner')}</b></span>`;

 const startBtn = document.createElement('button');
 startBtn.className = 'game-btn';
 startBtn.textContent = 'Start (Space/Tap to Jump)';

 gameArea.append(info, canvas, startBtn);

 const GROUND = 200;
 const GRAVITY = 0.6;
 const JUMP = -12;
 let player, obstacles, score, speed, running, frameId;

 function reset() {
 player = { x: 60, y: GROUND, vy: 0, w: 30, h: 40, jumping: false };
 obstacles = [];
 score = 0; speed = 4;
 draw();
 }

 function jump() {
 if (!running) return;
 if (!player.jumping) {
 player.vy = JUMP;
 player.jumping = true;
 }
 }

 function step() {
 // Physics
 player.vy += GRAVITY;
 player.y += player.vy;
 if (player.y >= GROUND) { player.y = GROUND; player.vy = 0; player.jumping = false; }

 // Obstacles
 if (Math.random() < 0.02 + score * 0.0001) {
 const h = 20 + Math.random() * 30;
 obstacles.push({ x: canvas.width, y: GROUND + player.h - h, w: 20 + Math.random() * 15, h: h });
 }

 speed = 4 + score * 0.005;
 for (let i = obstacles.length - 1; i >= 0; i--) {
 obstacles[i].x -= speed;
 if (obstacles[i].x + obstacles[i].w < 0) { obstacles.splice(i, 1); continue; }

 // Collision
 const o = obstacles[i];
 const px = player.x, py = player.y, pw = player.w, ph = player.h;
 if (px + pw > o.x + 4 && px < o.x + o.w - 4 && py + ph > o.y + 4) {
 die(); return;
 }
 }

 score++;
 document.getElementById('run-score').textContent = Math.floor(score / 5);
 draw();
 frameId = requestAnimationFrame(step);
 }

 function die() {
 running = false;
 startBtn.textContent = 'Start';
 const finalScore = Math.floor(score / 5);
 showGameOver('Crashed!', finalScore, 'runner', () => { reset(); });
 }

 function draw() {
 // Sky gradient
 const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
 grad.addColorStop(0, '#0a0a2a');
 grad.addColorStop(1, '#1a0a30');
 ctx.fillStyle = grad;
 ctx.fillRect(0, 0, canvas.width, canvas.height);

 // Ground
 ctx.fillStyle = '#1a3a1a';
 ctx.fillRect(0, GROUND + player.h, canvas.width, canvas.height - GROUND - player.h);
 ctx.strokeStyle = '#00ff88';
 ctx.lineWidth = 2;
 ctx.beginPath();
 ctx.moveTo(0, GROUND + player.h);
 ctx.lineTo(canvas.width, GROUND + player.h);
 ctx.stroke();

 // Player (neon character)
 ctx.fillStyle = '#00d4ff';
 ctx.shadowColor = '#00d4ff';
 ctx.shadowBlur = 10;
 // Body
 ctx.fillRect(player.x + 8, player.y + 10, 14, 20);
 // Head
 ctx.beginPath();
 ctx.arc(player.x + 15, player.y + 6, 8, 0, Math.PI * 2);
 ctx.fill();
 // Legs
 ctx.fillRect(player.x + 8, player.y + 30, 6, 10);
 ctx.fillRect(player.x + 16, player.y + 30, 6, 10);
 ctx.shadowBlur = 0;

 // Obstacles (neon cactus-like)
 for (const o of obstacles) {
 ctx.fillStyle = '#ff4466';
 ctx.shadowColor = '#ff4466';
 ctx.shadowBlur = 8;
 ctx.fillRect(o.x, o.y, o.w, o.h);
 ctx.shadowBlur = 0;
 }

 // Stars
 ctx.fillStyle = '#ffffff';
 for (let i = 0; i < 20; i++) {
 const sx = (i * 137 + score * 0.3) % canvas.width;
 const sy = (i * 97) % (GROUND - 20);
 ctx.globalAlpha = 0.3 + Math.sin(score * 0.02 + i) * 0.2;
 ctx.fillRect(sx, sy, 2, 2);
 }
 ctx.globalAlpha = 1;
 }

 function onKey(e) {
 if (currentGame!== 'runner') return;
 if (e.key === ''|| e.key === 'ArrowUp') { e.preventDefault(); jump(); }
 }

 document.addEventListener('keydown', onKey);
 canvas.addEventListener('click', jump);
 canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });

 startBtn.onclick = () => {
 if (running) return;
 reset();
 running = true;
 startBtn.textContent = 'Running...';
 frameId = requestAnimationFrame(step);
 };

 reset();
 gameCleanup = () => {
 running = false;
 cancelAnimationFrame(frameId);
 document.removeEventListener('keydown', onKey);
 };
}


// ==================== 5. SLIDE PUZZLE ====================
function initPuzzle() {
 gameTitle.textContent = 'Slide Puzzle';

 let tiles, emptyIdx, moves, solved;

 const info = document.createElement('div');
 info.className = 'game-info';
 info.innerHTML = `<span>Moves: <b id="puz-moves">0</b></span><span>Best: <b id="puz-high">${getHigh('puzzle') || '- '}</b></span>`;

 const grid = document.createElement('div');
 grid.className = 'puzzle-grid';

 const shuffleBtn = document.createElement('button');
 shuffleBtn.className = 'game-btn';
 shuffleBtn.textContent = 'Shuffle';

 gameArea.append(info, grid, shuffleBtn);

 function isSolvable(arr) {
 let inv = 0;
 const flat = arr.filter(v => v!== 0);
 for (let i = 0; i < flat.length; i++)
 for (let j = i + 1; j < flat.length; j++)
 if (flat[i] > flat[j]) inv++;
 const emptyRow = Math.floor(arr.indexOf(0) / 4);
 return (inv + emptyRow) % 2 === 1;
 }

 function shuffle() {
 do {
 tiles = Array.from({length: 16}, (_, i) => i); // 0 = empty
 for (let i = 15; i > 0; i--) {
 const j = Math.floor(Math.random() * (i + 1));
 [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
 }
 } while (!isSolvable(tiles));
 emptyIdx = tiles.indexOf(0);
 moves = 0; solved = false;
 document.getElementById('puz-moves').textContent = '0';
 render();
 }

 function render() {
 grid.innerHTML = '';
 tiles.forEach((val, i) => {
 const tile = document.createElement('div');
 tile.className = 'puzzle-tile'+ (val === 0? 'empty': '');
 tile.textContent = val === 0? '': val;
 tile.onclick = () => clickTile(i);
 grid.appendChild(tile);
 });
 }

 function clickTile(i) {
 if (solved) return;
 const row = Math.floor(i / 4), col = i % 4;
 const eRow = Math.floor(emptyIdx / 4), eCol = emptyIdx % 4;
 const adj = (Math.abs(row - eRow) + Math.abs(col - eCol)) === 1;
 if (!adj) return;

 [tiles[i], tiles[emptyIdx]] = [tiles[emptyIdx], tiles[i]];
 emptyIdx = i;
 moves++;
 document.getElementById('puz-moves').textContent = moves;
 render();

 // Check solved
 const win = tiles.every((v, idx) => idx === 15? v === 0: v === idx + 1);
 if (win) {
 solved = true;
 const prev = getHigh('puzzle');
 if (!prev || moves < prev) localStorage.setItem('ak_puzzle', moves);
 document.getElementById('puz-high').textContent = localStorage.getItem('ak_puzzle') || moves;
 showGameOver('Solved!', moves + 'moves', 'puzzle_dummy', shuffle);
 }
 }

 shuffleBtn.onclick = shuffle;
 shuffle();
 gameCleanup = () => {};
}


// ==================== 6. TARGET SHOOTER ====================
function initShooter() {
 gameTitle.textContent = 'Target Shooter';

 let score, timeLeft, running, spawnInterval, timerInterval;

 const info = document.createElement('div');
 info.className = 'game-info';
 info.innerHTML = `<span>Score: <b id="shoot-score">0</b></span><span>Time: <b id="shoot-time">60</b>s</span><span>Best: <b id="shoot-high">${getHigh('shooter')}</b></span>`;

 const arena = document.createElement('div');
 arena.className = 'shooter-arena';

 const startBtn = document.createElement('button');
 startBtn.className = 'game-btn';
 startBtn.textContent = 'Start (60 seconds)';

 gameArea.append(info, arena, startBtn);

 function spawnTarget() {
 const target = document.createElement('div');
 target.className = 'target';
 const size = Math.max(20, 55 - score * 1.5);
 target.style.width = size + 'px';
 target.style.height = size + 'px';
 const maxX = arena.offsetWidth - size;
 const maxY = arena.offsetHeight - size;
 target.style.left = Math.random() * maxX + 'px';
 target.style.top = Math.random() * maxY + 'px';
 const ring = document.createElement('div');
 ring.className = 'target-ring';
 target.appendChild(ring);

 target.onclick = (e) => {
 e.stopPropagation();
 score++;
 document.getElementById('shoot-score').textContent = score;
 target.remove();
 // Spawn effects
 const pop = document.createElement('div');
 pop.textContent = '+1';
 pop.style.cssText = `position:absolute;left:${target.style.left};top:${target.style.top};color:#00ff88;font-family:Orbitron;font-size:1.2rem;pointer-events:none;animation:fadeIn 0.3s;`;
 arena.appendChild(pop);
 setTimeout(() => pop.remove(), 500);
 };

 // Auto-remove after decreasing time
 const lifetime = Math.max(800, 2500 - score * 50);
 setTimeout(() => { if (target.parentNode) target.remove(); }, lifetime);

 arena.appendChild(target);
 }

 function start() {
 arena.innerHTML = '';
 score = 0; timeLeft = 60; running = true;
 document.getElementById('shoot-score').textContent = '0';
 document.getElementById('shoot-time').textContent = '60';
 startBtn.textContent = 'Shooting...';

 timerInterval = setInterval(() => {
 timeLeft--;
 document.getElementById('shoot-time').textContent = timeLeft;
 if (timeLeft <= 0) {
 running = false;
 clearInterval(timerInterval);
 clearInterval(spawnInterval);
 startBtn.textContent = 'Start';
 showGameOver('Time Up!', score, 'shooter', start);
 }
 }, 1000);

 spawnInterval = setInterval(() => {
 if (running) spawnTarget();
 }, Math.max(300, 800 - score * 10));
 }

 startBtn.onclick = () => {
 if (running) return;
 start();
 };

 gameCleanup = () => { running = false; clearInterval(timerInterval); clearInterval(spawnInterval); };
}


// ==================== 7. PONG ====================
function initPong() {
 gameTitle.textContent = 'Pong';

 const canvas = document.createElement('canvas');
 canvas.className = 'game-canvas';
 canvas.width = 600; canvas.height = 400;
 const ctx = canvas.getContext('2d');

 const info = document.createElement('div');
 info.className = 'game-info';
 info.innerHTML = `<span>You: <b id="pong-player">0</b></span><span>CPU: <b id="pong-cpu">0</b></span><span>First to 5 wins!</span>`;

 const startBtn = document.createElement('button');
 startBtn.className = 'game-btn';
 startBtn.textContent = 'Start';

 gameArea.append(info, canvas, startBtn);

 const PAD_W = 12, PAD_H = 80, BALL_R = 8;
 let playerY, cpuY, ball, playerScore, cpuScore, running, frameId;
 let mouseY = null;

 function resetBall(dir) {
 ball = {
 x: canvas.width / 2, y: canvas.height / 2,
 vx: 5 * dir, vy: (Math.random() - 0.5) * 6
 };
 }

 function reset() {
 playerY = canvas.height / 2 - PAD_H / 2;
 cpuY = canvas.height / 2 - PAD_H / 2;
 playerScore = 0; cpuScore = 0;
 document.getElementById('pong-player').textContent = '0';
 document.getElementById('pong-cpu').textContent = '0';
 resetBall(1);
 draw();
 }

 function step() {
 // Player paddle (keyboard + mouse)
 if (mouseY!== null) {
 playerY = mouseY - PAD_H / 2;
 }
 playerY = Math.max(0, Math.min(canvas.height - PAD_H, playerY));

 // CPU AI (follows ball with some delay, beatable)
 const cpuCenter = cpuY + PAD_H / 2;
 const diff = ball.y - cpuCenter;
 const cpuSpeed = 3.5;
 if (Math.abs(diff) > 10) {
 cpuY += Math.sign(diff) * Math.min(cpuSpeed, Math.abs(diff));
 }
 cpuY = Math.max(0, Math.min(canvas.height - PAD_H, cpuY));

 // Ball
 ball.x += ball.vx;
 ball.y += ball.vy;

 // Top/bottom bounce
 if (ball.y - BALL_R <= 0 || ball.y + BALL_R >= canvas.height) {
 ball.vy *= -1;
 ball.y = ball.y - BALL_R <= 0? BALL_R: canvas.height - BALL_R;
 }

 // Paddle collision - player (left)
 if (ball.vx < 0 && ball.x - BALL_R <= PAD_W + 15 && ball.y >= playerY && ball.y <= playerY + PAD_H) {
 ball.vx = Math.abs(ball.vx) * 1.05;
 ball.vy += (ball.y - (playerY + PAD_H / 2)) * 0.15;
 ball.x = PAD_W + 15 + BALL_R;
 }

 // Paddle collision - CPU (right)
 if (ball.vx > 0 && ball.x + BALL_R >= canvas.width - PAD_W - 15 && ball.y >= cpuY && ball.y <= cpuY + PAD_H) {
 ball.vx = -Math.abs(ball.vx) * 1.05;
 ball.vy += (ball.y - (cpuY + PAD_H / 2)) * 0.15;
 ball.x = canvas.width - PAD_W - 15 - BALL_R;
 }

 // Scoring
 if (ball.x < 0) {
 cpuScore++;
 document.getElementById('pong-cpu').textContent = cpuScore;
 if (cpuScore >= 5) { endPong('CPU'); return; }
 resetBall(1);
 }
 if (ball.x > canvas.width) {
 playerScore++;
 document.getElementById('pong-player').textContent = playerScore;
 if (playerScore >= 5) { endPong('Player'); return; }
 resetBall(-1);
 }

 // Cap speed
 const maxSpeed = 12;
 ball.vx = Math.sign(ball.vx) * Math.min(Math.abs(ball.vx), maxSpeed);
 ball.vy = Math.sign(ball.vy) * Math.min(Math.abs(ball.vy), maxSpeed);

 draw();
 frameId = requestAnimationFrame(step);
 }

 function endPong(winner) {
 running = false;
 startBtn.textContent = 'Start';
 const won = winner === 'Player';
 if (won) {
 const w = getHigh('pong_wins') + 1;
 localStorage.setItem('ak_pong_wins', w);
 }
 showGameOver(won? 'You Win!': 'CPU Wins!', playerScore + ' - ' + cpuScore, 'pong_dummy', () => { reset(); });
 }

 function draw() {
 // Background
 ctx.fillStyle = '#0a0a25';
 ctx.fillRect(0, 0, canvas.width, canvas.height);

 // Center line
 ctx.setLineDash([8, 8]);
 ctx.strokeStyle = '#333366';
 ctx.lineWidth = 2;
 ctx.beginPath();
 ctx.moveTo(canvas.width / 2, 0);
 ctx.lineTo(canvas.width / 2, canvas.height);
 ctx.stroke();
 ctx.setLineDash([]);

 // Player paddle (left)
 ctx.fillStyle = '#00d4ff';
 ctx.shadowColor = '#00d4ff';
 ctx.shadowBlur = 12;
 ctx.fillRect(15, playerY, PAD_W, PAD_H);

 // CPU paddle (right)
 ctx.fillStyle = '#ff44aa';
 ctx.shadowColor = '#ff44aa';
 ctx.fillRect(canvas.width - PAD_W - 15, cpuY, PAD_W, PAD_H);

 // Ball
 ctx.fillStyle = '#ffffff';
 ctx.shadowColor = '#ffffff';
 ctx.shadowBlur = 15;
 ctx.beginPath();
 ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
 ctx.fill();
 ctx.shadowBlur = 0;

 // Score display on canvas
 ctx.font = '48px Orbitron';
 ctx.fillStyle = '#222244';
 ctx.textAlign = 'center';
 ctx.fillText(playerScore, canvas.width / 4, 60);
 ctx.fillText(cpuScore, canvas.width * 3 / 4, 60);
 }

 function onKey(e) {
 if (currentGame!== 'pong'||!running) return;
 if (e.key === 'ArrowUp') { e.preventDefault(); playerY -= 20; }
 if (e.key === 'ArrowDown') { e.preventDefault(); playerY += 20; }
 }

 function onMouseMove(e) {
 if (currentGame!== 'pong'||!running) return;
 const rect = canvas.getBoundingClientRect();
 mouseY = e.clientY - rect.top;
 }

 function onTouchMove(e) {
 if (currentGame!== 'pong'||!running) return;
 e.preventDefault();
 const rect = canvas.getBoundingClientRect();
 mouseY = e.touches[0].clientY - rect.top;
 }

 document.addEventListener('keydown', onKey);
 canvas.addEventListener('mousemove', onMouseMove);
 canvas.addEventListener('touchmove', onTouchMove, { passive: false });

 startBtn.onclick = () => {
 if (running) return;
 reset();
 running = true;
 startBtn.textContent = 'Playing...';
 frameId = requestAnimationFrame(step);
 };

 reset();
 gameCleanup = () => {
 running = false;
 cancelAnimationFrame(frameId);
 document.removeEventListener('keydown', onKey);
 canvas.removeEventListener('mousemove', onMouseMove);
 canvas.removeEventListener('touchmove', onTouchMove);
 };
}

// ==================== BINGO ====================
function initBingo() {
 gameTitle.textContent = 'Bingo';

 // Generate a random bingo card (5x5) with FREE center
 function generateCard() {
 const cols = {
 B: [], I: [], N: [], G: [], O: []
 };
 const letters = ['B', 'I', 'N', 'G', 'O'];
 const ranges = [[1,15],[16,30],[31,45],[46,60],[61,75]];

 for (let c = 0; c < 5; c++) {
 const [min, max] = ranges[c];
 const nums = [];
 while (nums.length < 5) {
 const n = Math.floor(Math.random() * (max - min + 1)) + min;
 if (!nums.includes(n)) nums.push(n);
 }
 cols[letters[c]] = nums;
 }
 // Build 5x5 grid row by row
 const grid = [];
 for (let r = 0; r < 5; r++) {
 const row = [];
 for (let c = 0; c < 5; c++) {
 row.push(cols[letters[c]][r]);
 }
 grid.push(row);
 }
 grid[2][2] = 'FREE'; // center is free
 return grid;
 }

 // Generate all 75 possible balls
 function generateBalls() {
 const balls = [];
 const letters = ['B', 'I', 'N', 'G', 'O'];
 const ranges = [[1,15],[16,30],[31,45],[46,60],[61,75]];
 for (let c = 0; c < 5; c++) {
 for (let n = ranges[c][0]; n <= ranges[c][1]; n++) {
 balls.push({ letter: letters[c], number: n, display: letters[c] + n });
 }
 }
 // Shuffle
 for (let i = balls.length - 1; i > 0; i--) {
 const j = Math.floor(Math.random() * (i + 1));
 [balls[i], balls[j]] = [balls[j], balls[i]];
 }
 return balls;
 }

 let card, marked, balls, ballIndex, calledNumbers, callInterval, wins, currentBall, gameActive;

 function reset() {
 card = generateCard();
 marked = Array.from({length:5}, () => Array(5).fill(false));
 marked[2][2] = true; // FREE is always marked
 balls = generateBalls();
 ballIndex = 0;
 calledNumbers = new Set();
 wins = 0;
 currentBall = null;
 gameActive = false;
 if (callInterval) clearInterval(callInterval);
 callInterval = null;
 render();
 }

 function checkWin() {
 // Check rows
 for (let r = 0; r < 5; r++) {
 if (marked[r].every(v => v)) return true;
 }
 // Check columns
 for (let c = 0; c < 5; c++) {
 if (marked.every(row => row[c])) return true;
 }
 // Diagonals
 if ([0,1,2,3,4].every(i => marked[i][i])) return true;
 if ([0,1,2,3,4].every(i => marked[i][4-i])) return true;
 return false;
 }

 function getLetter(num) {
 if (num <= 15) return 'B';
 if (num <= 30) return 'I';
 if (num <= 45) return 'N';
 if (num <= 60) return 'G';
 return 'O';
 }

 function callNext() {
 if (ballIndex >= balls.length) {
 clearInterval(callInterval);
 callInterval = null;
 gameActive = false;
 render();
 return;
 }
 currentBall = balls[ballIndex];
 calledNumbers.add(currentBall.number);
 ballIndex++;

 // Auto mark FREE is already done
 render();
 }

 function markCell(r, c) {
 if (!gameActive) return;
 if (marked[r][c]) return;
 const val = card[r][c];
 if (val === 'FREE') return;
 if (!calledNumbers.has(val)) return; // can only mark called numbers

 marked[r][c] = true;
 render();

 if (checkWin()) {
 gameActive = false;
 clearInterval(callInterval);
 callInterval = null;
 wins++;
 const isNew = setHigh('bingo', wins);
 setTimeout(() => {
 render();
 // Show win overlay
 const overlay = document.createElement('div');
 overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;border-radius:12px;';
 overlay.innerHTML = `
 <div style="font-size:3rem;margin-bottom:10px;"></div>
 <div style="font-size:2rem;font-weight:bold;color:#00ff88;font-family:Orbitron,sans-serif;">BINGO!</div>
 <div style="color:#ccc;margin:10px 0;">Wins: ${wins}${isNew? '[star] New Record!': ''}</div>
 <div style="color:#888;margin-bottom:15px;">High Score: ${getHigh('bingo')}</div>
 <button style="padding:12px 30px;font-size:1.1rem;background:linear-gradient(135deg,#00ff88,#00d4ff);border:none;border-radius:8px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;"onclick="this.parentElement.remove()">New Game</button>
 `;
 overlay.querySelector('button').onclick = () => {
 overlay.remove();
 reset();
 gameActive = true;
 callInterval = setInterval(callNext, 3000);
 };
 gameArea.style.position = 'relative';
 gameArea.appendChild(overlay);
 }, 200);
 }
 }

 function render() {
 const letters = ['B', 'I', 'N', 'G', 'O'];
 const ballDisplay = currentBall? `<div style="font-size:2.5rem;font-weight:bold;color:#00ff88;font-family:Orbitron,sans-serif;text-shadow:0 0 20px #00ff88;">${currentBall.display}</div>`: `<div style="font-size:1.2rem;color:#888;">Press Start to play!</div>`;
 const calledCount = ballIndex;

 let gridHTML = '<table style="border-collapse:collapse;margin:0 auto;">';
 // Header row
 gridHTML += '<tr>';
 for (const l of letters) {
 gridHTML += `<th style="width:55px;height:40px;text-align:center;font-family:Orbitron,sans-serif;font-size:1.3rem;color:#00d4ff;text-shadow:0 0 10px #00d4ff;">${l}</th>`;
 }
 gridHTML += '</tr>';
 // Grid rows
 for (let r = 0; r < 5; r++) {
 gridHTML += '<tr>';
 for (let c = 0; c < 5; c++) {
 const val = card[r][c];
 const isMarked = marked[r][c];
 const isFree = val === 'FREE';
 const isCalled = val!== 'FREE'&& calledNumbers.has(val);
 let bg = '#1a1a2e';
 let color = '#fff';
 let border = '2px solid #333';
 let cursor = 'default';
 let glow = '';

 if (isMarked) {
 bg = isFree? '#b44aff': '#00ff88';
 color = '#000';
 glow = isMarked &&!isFree? 'box-shadow:0 0 15px #00ff88;': 'box-shadow:0 0 10px #b44aff;';
 } else if (isCalled) {
 bg = '#1a3a2e';
 border = '2px solid #00ff88';
 cursor = 'pointer';
 glow = 'box-shadow:0 0 8px rgba(0,255,136,0.3);';
 }

 const display = isFree? '': val;
 gridHTML += `<td onclick="window._bingoMark(${r},${c})"style="width:55px;height:55px;text-align:center;font-size:${isFree? '1.5rem': '1.1rem'};font-weight:bold;background:${bg};color:${color};border:${border};border-radius:8px;cursor:${cursor};font-family:Rajdhani,sans-serif;transition:all 0.2s;${glow}">${display}</td>`;
 }
 gridHTML += '</tr>';
 }
 gridHTML += '</table>';

 // Recent calls (last 5)
 const recent = [];
 for (let i = Math.max(0, ballIndex - 5); i < ballIndex; i++) {
 recent.push(balls[i].display);
 }
 const recentHTML = recent.length > 0? `<div style="margin-top:12px;color:#888;font-size:0.9rem;">Recent: ${recent.map(r => `<span style="color:#00d4ff;margin:0 4px;">${r}</span>`).join('')}</div>`: '';

 gameArea.innerHTML = `
 <div style="text-align:center;padding:10px;">
 <div style="margin-bottom:15px;">
 <div style="color:#888;font-size:0.8rem;margin-bottom:5px;">CALLED NUMBER</div>
 ${ballDisplay}
 <div style="color:#666;font-size:0.8rem;margin-top:5px;">${calledCount} / 75 balls called</div>
 </div>
 ${gridHTML}
 ${recentHTML}
 ${!gameActive? `<button id="bingo-start"style="margin-top:15px;padding:12px 35px;font-size:1.1rem;background:linear-gradient(135deg,#00ff88,#00d4ff);border:none;border-radius:8px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;transition:transform 0.2s;"onmouseover= "this.style.transform= 'scale(1.05)'"onmouseout= "this.style.transform= 'scale(1)'">${ballIndex > 0? 'New Game': 'Start'}</button>`: `<div style="margin-top:12px;color:#b44aff;font-size:0.9rem;">Click numbers on your card when they're called!</div>`}
 <div style="margin-top:8px;color:#666;font-size:0.8rem;">Wins: ${wins} | Best: ${getHigh('bingo')}</div>
 </div>
 `;

 // Wire up start button
 const startBtn = document.getElementById('bingo-start');
 if (startBtn) {
 startBtn.onclick = () => {
 if (ballIndex > 0) reset(); // new game
 gameActive = true;
 callInterval = setInterval(callNext, 3000);
 callNext(); // call first ball immediately
 };
 }
 }

 // Expose mark function globally for onclick
 window._bingoMark = markCell;

 gameScoreDisplay.textContent = '';
 reset();

 gameCleanup = () => {
 if (callInterval) clearInterval(callInterval);
 delete window._bingoMark;
 };
}

// ==================== TALKING CAT (Mini Talking Tom) ====================
function initTalkingCat() {
 gameTitle.textContent = 'Talking Cat';

 let happiness = 70;
 let hunger = 50;
 let energy = 80;
 let coins = 0;
 let mood = 'happy';
 let catExpression = ':)';
 let speechBubble = 'Hi! I\'m Tom the Cat! ';
 let animating = false;
 let statInterval = null;
 let outfitIndex = 0;

 const outfits = ['none', '', '', '', '', '', ''];
 const outfitNames = ['None', 'Top Hat', 'Crown', 'Bow', 'Sunglasses', 'Cap', 'Helmet'];
 const catSayings = [
 'Meow meow!:D', 'Pet me more!', 'I love you! [heart]', 'Got any fish?',
 'I\'m the best cat! >:)', 'Purrrrrr... <3', 'Play with me!',
 'That tickles! XD', 'Hehe!', 'You\'re my best friend!',
 'I want treats!', 'Let\'s have fun!', 'Woooo!',
 'Nap time? Zzz', '*stretches*', 'More pets please! '
];

 function updateMood() {
 if (happiness > 80 && hunger < 30 && energy > 50) {
 mood = 'happy'; catExpression = ':)';
 } else if (happiness > 60) {
 mood = 'content'; catExpression = '';
 } else if (hunger > 70) {
 mood = 'hungry'; catExpression = ';(';
 speechBubble = 'I\'m sooo hungry! Feed me! ';
 } else if (energy < 20) {
 mood = 'sleepy'; catExpression = 'Zzz';
 speechBubble = 'So tired... need sleep... ';
 } else if (happiness < 30) {
 mood = 'sad'; catExpression = ';(';
 speechBubble = 'I\'m sad... pet me please! ';
 } else {
 mood = 'normal'; catExpression = '';
 }
 }

 function clamp(v) { return Math.max(0, Math.min(100, v)); }

 function petCat() {
 if (animating) return;
 animating = true;
 happiness = clamp(happiness + 10);
 energy = clamp(energy - 3);
 coins += 1;
 catExpression = '<3';
 speechBubble = catSayings[Math.floor(Math.random() * catSayings.length)];
 render();
 setTimeout(() => { animating = false; updateMood(); render(); }, 1200);
 }

 function feedCat() {
 if (animating) return;
 animating = true;
 hunger = clamp(hunger - 25);
 happiness = clamp(happiness + 5);
 energy = clamp(energy + 5);
 coins += 2;
 catExpression = ':D';
 speechBubble = 'Yummy! That was delicious! ';
 render();
 setTimeout(() => { animating = false; updateMood(); render(); }, 1200);
 }

 function playCat() {
 if (animating) return;
 if (energy < 10) {
 speechBubble = 'Too tired to play... let me sleep first! Zzz';
 render();
 return;
 }
 animating = true;
 happiness = clamp(happiness + 15);
 energy = clamp(energy - 15);
 hunger = clamp(hunger + 10);
 coins += 3;
 catExpression = 'D:';
 speechBubble = 'Wheeeee! So fun! ';
 render();
 setTimeout(() => {
 catExpression = ':D';
 speechBubble = 'That was awesome! Again! ';
 render();
 setTimeout(() => { animating = false; updateMood(); render(); }, 800);
 }, 800);
 }

 function sleepCat() {
 if (animating) return;
 animating = true;
 energy = clamp(energy + 30);
 hunger = clamp(hunger + 10);
 catExpression = 'Zzz';
 speechBubble = 'Zzzzz... ';
 render();
 setTimeout(() => {
 catExpression = ':)';
 speechBubble = 'Ahh! I feel great now! ';
 energy = clamp(energy + 10);
 animating = false;
 updateMood();
 render();
 }, 2500);
 }

 function tickleCat() {
 if (animating) return;
 animating = true;
 happiness = clamp(happiness + 8);
 coins += 1;
 catExpression = 'XD';
 speechBubble = 'HAHAHA stop it!! That tickles!! ';
 render();
 setTimeout(() => {
 catExpression = ':D';
 speechBubble = 'Hehe... do it again! ';
 render();
 setTimeout(() => { animating = false; updateMood(); render(); }, 600);
 }, 1000);
 }

 function changeOutfit() {
 outfitIndex = (outfitIndex + 1) % outfits.length;
 const name = outfitNames[outfitIndex];
 speechBubble = outfits[outfitIndex] === 'none'? 'Au naturel! ': `How do I look with my ${name}? ${outfits[outfitIndex]}`;
 render();
 }

 function statBar(label, value, color) {
 return `
 <div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
 <span style="width:70px;font-size:0.8rem;color:#aaa;text-align:right;">${label}</span>
 <div style="flex:1;height:14px;background:#1a1a2e;border-radius:7px;overflow:hidden;border:1px solid #333;">
 <div style="width:${value}%;height:100%;background:${color};border-radius:7px;transition:width 0.5s;${value < 25? 'animation:pulse 1s infinite;': ''}"></div>
 </div>
 <span style="width:35px;font-size:0.8rem;color:${color};font-weight:bold;">${Math.round(value)}%</span>
 </div>
 `;
 }

 function render() {
 const outfit = outfits[outfitIndex];
 const outfitDisplay = outfit === 'none'? '': `<div style="font-size:2.5rem;position:absolute;top:-10px;left:50%;transform:translateX(-50%);">${outfit}</div>`;

 const bgColor = mood === 'happy'? '#0a2a1a': mood === 'sad'? '#2a0a1a': mood === 'hungry'? '#2a2a0a': mood === 'sleepy'? '#0a0a2a': '#1a1a2e';

 gameArea.innerHTML = `
 <style>
 @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }
 @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
 @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
.cat-btn { padding:12px 16px; font-size:1.5rem; background:#1a1a2e; border:2px solid #333; border-radius:12px; cursor:pointer; transition:all 0.2s; }
.cat-btn:hover { transform:scale(1.1); border-color:#00ff88; box-shadow:0 0 15px rgba(0,255,136,0.3); }
.cat-btn:active { transform:scale(0.95); }
 </style>
 <div style="text-align:center;padding:10px;max-width:400px;margin:0 auto;">
 <!-- Speech Bubble -->
 <div style="background:#1a1a2e;border:2px solid #00d4ff;border-radius:20px;padding:12px 18px;margin-bottom:10px;position:relative;box-shadow:0 0 15px rgba(0,212,255,0.2);min-height:40px;">
 <div style="color:#fff;font-size:1rem;font-family:Rajdhani,sans-serif;">${speechBubble}</div>
 <div style="position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:10px solid #00d4ff;"></div>
 </div>

 <!-- Cat -->
 <div style="position:relative;display:inline-block;animation:${animating? 'bounce 0.6s': 'float 3s infinite'};margin:15px 0;">
 ${outfitDisplay}
 <div style="font-size:8rem;cursor:pointer;user-select:none;filter:drop-shadow(0 0 20px rgba(0,255,136,0.3));"onclick="window._talkingCatPet()">${catExpression}</div>
 <div style="font-size:0.7rem;color:#666;margin-top:-5px;">tap the cat to pet!</div>
 </div>

 <!-- Stats -->
 <div style="background:${bgColor};border-radius:12px;padding:12px;margin:10px 0;border:1px solid #333;">
 ${statBar('Happy', happiness, '#00ff88')}
 ${statBar('Hunger', 100 - hunger, hunger > 70? '#ff4444': '#ffaa00')}
 ${statBar('Energy', energy, '#00d4ff')}
 <div style="text-align:center;margin-top:8px;color:#ffaa00;font-family:Orbitron,sans-serif;font-size:0.9rem;">$ ${coins} coins</div>
 </div>

 <!-- Action Buttons -->
 <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px;">
 <button class="cat-btn"onclick="window._talkingCatFeed()"><br><span style="font-size:0.7rem;color:#aaa;">Feed</span></button>
 <button class="cat-btn"onclick="window._talkingCatPlay()"><br><span style="font-size:0.7rem;color:#aaa;">Play</span></button>
 <button class="cat-btn"onclick="window._talkingCatSleep()"><br><span style="font-size:0.7rem;color:#aaa;">Sleep</span></button>
 <button class="cat-btn"onclick="window._talkingCatTickle()"><br><span style="font-size:0.7rem;color:#aaa;">Tickle</span></button>
 <button class="cat-btn"onclick="window._talkingCatOutfit()"><br><span style="font-size:0.7rem;color:#aaa;">Outfit</span></button>
 <button class="cat-btn"onclick="window._talkingCatPet()"><br><span style="font-size:0.7rem;color:#aaa;">Pet</span></button>
 </div>
 </div>
 `;
 }

 // Stats decay over time
 statInterval = setInterval(() => {
 if (animating) return;
 hunger = clamp(hunger + 2);
 happiness = clamp(happiness - 1);
 energy = clamp(energy - 1);
 updateMood();
 render();
 }, 5000);

 // Expose functions
 window._talkingCatPet = petCat;
 window._talkingCatFeed = feedCat;
 window._talkingCatPlay = playCat;
 window._talkingCatSleep = sleepCat;
 window._talkingCatTickle = tickleCat;
 window._talkingCatOutfit = changeOutfit;

 gameScoreDisplay.textContent = '';
 updateMood();
 render();

 gameCleanup = () => {
 if (statInterval) clearInterval(statInterval);
 delete window._talkingCatPet;
 delete window._talkingCatFeed;
 delete window._talkingCatPlay;
 delete window._talkingCatSleep;
 delete window._talkingCatTickle;
 delete window._talkingCatOutfit;
 };
}

// ==================== HIDE & SEEK ====================
function initHideSeek() {
 gameTitle.textContent = 'Hide and Seek';

 const characters = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
 const hidingSpots = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];

 let level, found, toFind, grid, timer, timerInterval, score, gridSize, hiddenPositions;

 function startLevel() {
 gridSize = Math.min(4 + Math.floor(level / 2), 7);
 toFind = Math.min(3 + Math.floor(level / 2), 8);
 found = 0;
 timer = 30 + level * 5;

 // Build grid with hiding spots
 const totalCells = gridSize * gridSize;
 grid = [];
 for (let i = 0; i < totalCells; i++) {
 grid.push({
 spot: hidingSpots[Math.floor(Math.random() * hidingSpots.length)],
 hidden: null,
 revealed: false,
 checked: false
 });
 }

 // Place hidden characters
 hiddenPositions = [];
 const available = [...Array(totalCells).keys()];
 for (let i = available.length - 1; i > 0; i--) {
 const j = Math.floor(Math.random() * (i + 1));
 [available[i], available[j]] = [available[j], available[i]];
 }
 for (let i = 0; i < toFind; i++) {
 const pos = available[i];
 grid[pos].hidden = characters[Math.floor(Math.random() * characters.length)];
 hiddenPositions.push(pos);
 }

 if (timerInterval) clearInterval(timerInterval);
 timerInterval = setInterval(() => {
 timer--;
 render();
 if (timer <= 0) {
 clearInterval(timerInterval);
 timerInterval = null;
 // Reveal all hidden
 hiddenPositions.forEach(p => { grid[p].revealed = true; });
 render();
 setTimeout(() => {
 const isNew = setHigh('hideseek', score);
 showGameOver('Time\'s Up!', score, 'hideseek', () => {
 level = 1; score = 0; startLevel();
 });
 }, 1500);
 }
 }, 1000);

 render();
 }

 function checkSpot(idx) {
 if (grid[idx].revealed || grid[idx].checked) return;

 if (grid[idx].hidden) {
 grid[idx].revealed = true;
 found++;
 score += 10 + level * 5;

 if (found >= toFind) {
 clearInterval(timerInterval);
 timerInterval = null;
 score += timer * 2; // bonus for remaining time
 render();
 setTimeout(() => {
 level++;
 startLevel();
 }, 1200);
 } else {
 render();
 }
 } else {
 grid[idx].checked = true;
 timer = Math.max(0, timer - 2); // penalty: lose 2 seconds
 render();
 }
 }

 function render() {
 const cellSize = Math.max(40, Math.min(60, Math.floor(320 / gridSize)));

 let gridHTML = `<div style="display:inline-grid;grid-template-columns:repeat(${gridSize},${cellSize}px);gap:4px;margin:10px auto;">`;
 for (let i = 0; i < grid.length; i++) {
 const cell = grid[i];
 let content, bg, border, cursor, glow;

 if (cell.revealed) {
 content = cell.hidden;
 bg = '#0a3a1a';
 border = '2px solid #00ff88';
 cursor = 'default';
 glow = 'box-shadow:0 0 15px rgba(0,255,136,0.4);';
 } else if (cell.checked) {
 content = '';
 bg = '#2a0a0a';
 border = '2px solid #ff4444';
 cursor = 'default';
 glow = '';
 } else {
 content = cell.spot;
 bg = '#1a1a2e';
 border = '2px solid #333';
 cursor = 'pointer';
 glow = '';
 }

 gridHTML += `<div onclick="window._hideSeekCheck(${i})"style="width:${cellSize}px;height:${cellSize}px;display:flex;align-items:center;justify-content:center;font-size:${cellSize * 0.55}px;background:${bg};border:${border};border-radius:10px;cursor:${cursor};transition:all 0.2s;user-select:none;${glow}">${content}</div>`;
 }
 gridHTML += '</div>';

 const progressDots = [];
 for (let i = 0; i < toFind; i++) {
 progressDots.push(i < found? '': '');
 }

 gameArea.innerHTML = `
 <div style="text-align:center;padding:10px;">
 <div style="display:flex;justify-content:space-between;align-items:center;max-width:350px;margin:0 auto 10px;">
 <div style="color:#b44aff;font-family:Orbitron,sans-serif;font-size:0.9rem;">Level ${level}</div>
 <div style="color:${timer <= 10? '#ff4444': '#00d4ff'};font-family:Orbitron,sans-serif;font-size:1.2rem;${timer <= 10? 'animation:pulse 0.5s infinite;': ''}"> ${timer}s</div>
 <div style="color:#00ff88;font-family:Orbitron,sans-serif;font-size:0.9rem;">Score: ${score}</div>
 </div>
 <div style="margin-bottom:8px;color:#aaa;font-size:0.85rem;">Find ${toFind} hidden characters! (${found}/${toFind})</div>
 <div style="margin-bottom:10px;font-size:1.2rem;letter-spacing:4px;">${progressDots.join('')}</div>
 ${gridHTML}
 <div style="margin-top:10px;color:#666;font-size:0.75rem;">Tap hiding spots to look behind them! Wrong guesses lose 2 seconds.</div>
 <div style="margin-top:5px;color:#888;font-size:0.8rem;">High Score: ${getHigh('hideseek')}</div>
 </div>
 <style>@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}</style>
 `;
 }

 window._hideSeekCheck = checkSpot;

 gameScoreDisplay.textContent = '';
 level = 1;
 score = 0;
 startLevel();

 gameCleanup = () => {
 if (timerInterval) clearInterval(timerInterval);
 delete window._hideSeekCheck;
 };
}

// ==================== RACING ====================
function initRacing() {
 gameTitle.textContent = 'Racing';

 const canvas = document.createElement('canvas');
 canvas.width = 320;
 canvas.height = 480;
 canvas.style.cssText = 'display:block;margin:0 auto;border:2px solid #00ff88;border-radius:12px;background:#333;touch-action:none;';
 const startBtn = document.createElement('button');
 startBtn.textContent = 'Start Race!';
 startBtn.style.cssText = 'display:block;margin:10px auto;padding:12px 30px;font-size:1.1rem;background:linear-gradient(135deg,#00ff88,#00d4ff);border:none;border-radius:8px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;';
 const info = document.createElement('div');
 info.style.cssText = 'text-align:center;color:#666;font-size:0.75rem;margin-top:8px;';
 info.textContent = 'Arrow keys or tilt phone to steer. Dodge traffic!';

 // Mobile buttons
 const mobileControls = document.createElement('div');
 mobileControls.style.cssText = 'display:flex;justify-content:center;gap:20px;margin-top:10px;';
 mobileControls.innerHTML = `
 <button id="race-left"style="padding:15px 25px;font-size:1.5rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:12px;color:#00d4ff;cursor:pointer;">LT</button>
 <button id="race-right"style="padding:15px 25px;font-size:1.5rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:12px;color:#00d4ff;cursor:pointer;">RT</button>
 `;

 gameArea.appendChild(canvas);
 gameArea.appendChild(startBtn);
 gameArea.appendChild(mobileControls);
 gameArea.appendChild(info);

 const ctx = canvas.getContext('2d');
 const W = canvas.width, H = canvas.height;

 // Road settings
 const roadLeft = 60;
 const roadRight = W - 60;
 const laneWidth = (roadRight - roadLeft) / 3;
 const lanes = [roadLeft + laneWidth * 0.5, roadLeft + laneWidth * 1.5, roadLeft + laneWidth * 2.5];

 // Player car
 let playerX, playerLane, speed, score, running, frameId;
 let obstacles = [];
 let roadOffset = 0;
 let moveLeft = false, moveRight = false;
 let touchStartX = null;

 const carColors = ['#ff4444', '#4444ff', '#ffaa00', '#ff44ff', '#44ffaa', '#ff8800'];
 const playerColor = '#00ff88';

 function reset() {
 playerLane = 1;
 playerX = lanes[1];
 speed = 3;
 score = 0;
 obstacles = [];
 roadOffset = 0;
 running = false;
 }

 function spawnObstacle() {
 const lane = Math.floor(Math.random() * 3);
 obstacles.push({
 x: lanes[lane],
 y: -60,
 w: 30,
 h: 50,
 color: carColors[Math.floor(Math.random() * carColors.length)],
 speed: speed * (0.5 + Math.random() * 0.3)
 });
 }

 function drawRoad() {
 // Grass
 ctx.fillStyle = '#1a4a1a';
 ctx.fillRect(0, 0, roadLeft, H);
 ctx.fillRect(roadRight, 0, W - roadRight, H);

 // Road
 ctx.fillStyle = '#333';
 ctx.fillRect(roadLeft, 0, roadRight - roadLeft, H);

 // Road edges
 ctx.strokeStyle = '#fff';
 ctx.lineWidth = 3;
 ctx.beginPath();
 ctx.moveTo(roadLeft, 0); ctx.lineTo(roadLeft, H);
 ctx.moveTo(roadRight, 0); ctx.lineTo(roadRight, H);
 ctx.stroke();

 // Lane dashes
 ctx.strokeStyle = '#666';
 ctx.lineWidth = 2;
 ctx.setLineDash([30, 20]);
 ctx.lineDashOffset = -roadOffset;
 for (let i = 1; i < 3; i++) {
 const x = roadLeft + laneWidth * i;
 ctx.beginPath();
 ctx.moveTo(x, 0); ctx.lineTo(x, H);
 ctx.stroke();
 }
 ctx.setLineDash([]);
 }

 function drawCar(x, y, w, h, color, isPlayer) {
 // Car body
 ctx.fillStyle = color;
 ctx.beginPath();
 ctx.roundRect(x - w/2, y - h/2, w, h, 6);
 ctx.fill();

 // Windshield
 ctx.fillStyle = isPlayer? '#005533': '#222';
 ctx.fillRect(x - w/2 + 4, y - h/2 + (isPlayer? 6: h - 18), w - 8, 12);

 // Wheels
 ctx.fillStyle = '#111';
 ctx.fillRect(x - w/2 - 3, y - h/2 + 5, 5, 10);
 ctx.fillRect(x + w/2 - 2, y - h/2 + 5, 5, 10);
 ctx.fillRect(x - w/2 - 3, y + h/2 - 15, 5, 10);
 ctx.fillRect(x + w/2 - 2, y + h/2 - 15, 5, 10);

 if (isPlayer) {
 // Glow effect
 ctx.shadowColor = color;
 ctx.shadowBlur = 15;
 ctx.fillStyle = color;
 ctx.beginPath();
 ctx.roundRect(x - w/2, y - h/2, w, h, 6);
 ctx.fill();
 ctx.shadowBlur = 0;
 }
 }

 function drawHUD() {
 ctx.fillStyle = 'rgba(0,0,0,0.5)';
 ctx.fillRect(0, 0, W, 35);
 ctx.font = 'bold 14px Orbitron, sans-serif';
 ctx.fillStyle = '#00ff88';
 ctx.textAlign = 'left';
 ctx.fillText('Score: '+ score, 10, 24);
 ctx.fillStyle = '#00d4ff';
 ctx.textAlign = 'right';
 ctx.fillText('Speed: '+ Math.floor(speed * 10), W - 10, 24);
 }

 function step() {
 if (!running) return;

 // Move road
 roadOffset += speed;

 // Player movement (smooth)
 const targetX = lanes[playerLane];
 playerX += (targetX - playerX) * 0.15;

 // Move obstacles
 for (let i = obstacles.length - 1; i >= 0; i--) {
 obstacles[i].y += speed - obstacles[i].speed + 2;
 if (obstacles[i].y > H + 60) {
 obstacles.splice(i, 1);
 score += 10;
 }
 }

 // Spawn new obstacles
 if (Math.random() < 0.02 + speed * 0.003) {
 spawnObstacle();
 }

 // Collision check
 const pw = 30, ph = 50;
 const py = H - 90;
 for (const obs of obstacles) {
 if (Math.abs(playerX - obs.x) < (pw + obs.w) / 2 - 5 &&
 Math.abs(py - obs.y) < (ph + obs.h) / 2 - 5) {
 // Crash!
 running = false;
 startBtn.textContent = 'Race Again!';
 showGameOver('Crash!', score, 'racing', () => { reset(); });
 return;
 }
 }

 // Increase speed
 speed = 3 + score / 200;

 // Draw
 ctx.clearRect(0, 0, W, H);
 drawRoad();
 for (const obs of obstacles) {
 drawCar(obs.x, obs.y, obs.w, obs.h, obs.color, false);
 }
 drawCar(playerX, py, pw, ph, playerColor, true);
 drawHUD();

 score++;
 frameId = requestAnimationFrame(step);
 }

 function onKey(e) {
 if (!running) return;
 if (e.key === 'ArrowLeft'|| e.key === 'a') {
 playerLane = Math.max(0, playerLane - 1);
 } else if (e.key === 'ArrowRight'|| e.key === 'd') {
 playerLane = Math.min(2, playerLane + 1);
 }
 }

 // Touch controls
 canvas.addEventListener('touchstart', (e) => {
 touchStartX = e.touches[0].clientX;
 }, {passive: true});

 canvas.addEventListener('touchmove', (e) => {
 if (!touchStartX ||!running) return;
 const diff = e.touches[0].clientX - touchStartX;
 if (Math.abs(diff) > 30) {
 if (diff < 0) playerLane = Math.max(0, playerLane - 1);
 else playerLane = Math.min(2, playerLane + 1);
 touchStartX = e.touches[0].clientX;
 }
 }, {passive: true});

 // Mobile button controls
 const leftBtn = document.getElementById('race-left');
 const rightBtn = document.getElementById('race-right');
 if (leftBtn) leftBtn.onclick = () => { if (running) playerLane = Math.max(0, playerLane - 1); };
 if (rightBtn) rightBtn.onclick = () => { if (running) playerLane = Math.min(2, playerLane + 1); };

 document.addEventListener('keydown', onKey);

 startBtn.onclick = () => {
 if (running) return;
 reset();
 running = true;
 startBtn.textContent = 'Racing...';
 frameId = requestAnimationFrame(step);
 };

 reset();

 // Draw initial screen
 ctx.clearRect(0, 0, W, H);
 drawRoad();
 drawCar(lanes[1], H - 90, 30, 50, playerColor, true);
 ctx.font = 'bold 20px Orbitron, sans-serif';
 ctx.fillStyle = '#00ff88';
 ctx.textAlign = 'center';
 ctx.fillText('Ready to Race?', W/2, H/2);

 gameScoreDisplay.textContent = 'High: '+ getHigh('racing');

 gameCleanup = () => {
 running = false;
 cancelAnimationFrame(frameId);
 document.removeEventListener('keydown', onKey);
 };
}

// ==================== SPOT THE DIFFERENCE ====================
function initSpotDiff() {
 gameTitle.textContent = 'Spot the Difference';

 // Scenes are emoji grids. We generate a grid then change some emojis for the "different"version.
 const emojiSets = [
 ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
 ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
 ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
 ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
 ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
 ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
];

 const swapEmojis = {
 '':'', '':'', '':'', '':'', '':'', '':'', '':'', '':'',
 '':'', '':'', '':'', '':'', '':'', '':'', '':'', '':'',
 '':'', '':'', '':'', '':'', '':'', '':'', '':'', '':'',
 '':'', '':'', '':'', '':'', '':'', '':'', '':'', '':'',
 '':'', '':'', '':'', '':'', '':'', '':'', '':'', '':'',
 '':'', '':'', '':'', '':'', '':'', '':'', '':'', '':'',
 '':'', '':'', '':'', '':'', '':'', '':'', '':'', '':'',
 '':'', '':'', '':'', '':'', '':'', '':'', '':'', '':'',
 '':'', '':'', '':'', '':'', '':'', '':'', '':'', '':''
 };

 let level, score, found, differences, timer, timerInterval, originalGrid, modifiedGrid, gridSize, diffPositions;

 function startLevel() {
 gridSize = 4;
 const numDiffs = Math.min(3 + Math.floor(level / 2), 6);
 found = 0;
 differences = numDiffs;
 timer = 30 + level * 3;

 // Pick a random emoji set
 const setIndex = Math.floor(Math.random() * emojiSets.length);
 const emojiPool = [...emojiSets[setIndex]];

 // Shuffle
 for (let i = emojiPool.length - 1; i > 0; i--) {
 const j = Math.floor(Math.random() * (i + 1));
 [emojiPool[i], emojiPool[j]] = [emojiPool[j], emojiPool[i]];
 }

 originalGrid = emojiPool.slice(0, gridSize * gridSize);
 modifiedGrid = [...originalGrid];

 // Pick positions to change
 const allPositions = [...Array(gridSize * gridSize).keys()];
 for (let i = allPositions.length - 1; i > 0; i--) {
 const j = Math.floor(Math.random() * (i + 1));
 [allPositions[i], allPositions[j]] = [allPositions[j], allPositions[i]];
 }
 diffPositions = new Set(allPositions.slice(0, numDiffs));

 diffPositions.forEach(pos => {
 const orig = originalGrid[pos];
 modifiedGrid[pos] = swapEmojis[orig] || '';
 });

 if (timerInterval) clearInterval(timerInterval);
 timerInterval = setInterval(() => {
 timer--;
 render();
 if (timer <= 0) {
 clearInterval(timerInterval);
 timerInterval = null;
 // Reveal all remaining differences
 render(true);
 setTimeout(() => {
 showGameOver('Time\'s Up!', score, 'spotdiff', () => {
 level = 1; score = 0; startLevel();
 });
 }, 2000);
 }
 }, 1000);

 render();
 }

 function checkCell(idx) {
 if (!diffPositions.has(idx)) {
 timer = Math.max(0, timer - 3);
 render();
 return;
 }

 diffPositions.delete(idx);
 found++;
 score += 15 + level * 5;

 if (found >= differences) {
 clearInterval(timerInterval);
 timerInterval = null;
 score += timer * 3;
 render();
 setTimeout(() => {
 level++;
 startLevel();
 }, 1200);
 } else {
 render();
 }
 }

 function render(revealAll) {
 const cellSize = 60;

 function buildGrid(gridData, clickable, label) {
 let html = `<div style="text-align:center;"><div style="color:#aaa;font-size:0.8rem;margin-bottom:5px;">${label}</div>`;
 html += `<div style="display:inline-grid;grid-template-columns:repeat(${gridSize},${cellSize}px);gap:3px;">`;
 for (let i = 0; i < gridData.length; i++) {
 const isFound =!diffPositions.has(i) && modifiedGrid[i]!== originalGrid[i];
 const isRevealed = revealAll && diffPositions.has(i);
 let bg = '#1a1a2e';
 let border = '2px solid #333';
 let glow = '';

 if (isFound && clickable) {
 bg = '#0a3a1a';
 border = '2px solid #00ff88';
 glow = 'box-shadow:0 0 12px rgba(0,255,136,0.4);';
 }
 if (isRevealed) {
 bg = '#3a1a0a';
 border = '2px solid #ff4444';
 glow = 'box-shadow:0 0 12px rgba(255,68,68,0.4);';
 }

 const onclick = clickable? `onclick="window._spotDiffCheck(${i})"`: '';
 html += `<div ${onclick} style="width:${cellSize}px;height:${cellSize}px;display:flex;align-items:center;justify-content:center;font-size:${cellSize * 0.6}px;background:${bg};border:${border};border-radius:8px;cursor:${clickable? 'pointer': 'default'};transition:all 0.2s;user-select:none;${glow}">${gridData[i]}</div>`;
 }
 html += '</div></div>';
 return html;
 }

 const remaining = differences - found;

 gameArea.innerHTML = `
 <div style="text-align:center;padding:10px;">
 <div style="display:flex;justify-content:space-between;align-items:center;max-width:350px;margin:0 auto 10px;">
 <div style="color:#b44aff;font-family:Orbitron,sans-serif;font-size:0.9rem;">Level ${level}</div>
 <div style="color:${timer <= 10? '#ff4444': '#00d4ff'};font-family:Orbitron,sans-serif;font-size:1.1rem;${timer <= 10? 'animation:blink 0.5s infinite;': ''}"> ${timer}s</div>
 <div style="color:#00ff88;font-family:Orbitron,sans-serif;font-size:0.9rem;">Score: ${score}</div>
 </div>
 <div style="margin-bottom:10px;color:#ffaa00;font-size:0.9rem;">Find ${remaining} difference${remaining!== 1? 's': ''}! Tap on the RIGHT image.</div>
 <div style="display:flex;justify-content:center;gap:15px;flex-wrap:wrap;">
 ${buildGrid(originalGrid, false, 'Original')}
 ${buildGrid(modifiedGrid, true, 'Changed')}
 </div>
 <div style="margin-top:10px;color:#666;font-size:0.75rem;">Wrong taps lose 3 seconds!</div>
 <div style="margin-top:5px;color:#888;font-size:0.8rem;">High Score: ${getHigh('spotdiff')}</div>
 </div>
 <style>@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}</style>
 `;
 }

 window._spotDiffCheck = checkCell;

 gameScoreDisplay.textContent = '';
 level = 1;
 score = 0;
 startLevel();

 gameCleanup = () => {
 if (timerInterval) clearInterval(timerInterval);
 delete window._spotDiffCheck;
 };
}

// ==================== TAG ====================
function initTag() {
 gameTitle.textContent = 'Tag';

 const canvas = document.createElement('canvas');
 canvas.width = 320;
 canvas.height = 400;
 canvas.style.cssText = 'display:block;margin:0 auto;border:2px solid #00ff88;border-radius:12px;background:#1a1a2e;touch-action:none;';
 const startBtn = document.createElement('button');
 startBtn.textContent = 'Start!';
 startBtn.style.cssText = 'display:block;margin:10px auto;padding:12px 30px;font-size:1.1rem;background:linear-gradient(135deg,#00ff88,#00d4ff);border:none;border-radius:8px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;';
 const info = document.createElement('div');
 info.style.cssText = 'text-align:center;color:#666;font-size:0.75rem;margin-top:8px;';
 info.textContent = 'Arrow keys / WASD / tap to move. Tag everyone before time runs out!';

 // Mobile D-pad
 const dpad = document.createElement('div');
 dpad.style.cssText = 'display:grid;grid-template-columns:50px 50px 50px;grid-template-rows:50px 50px 50px;justify-content:center;gap:4px;margin-top:10px;';
 dpad.innerHTML = `
 <div></div>
 <button id="tag-up"style="font-size:1.3rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:10px;color:#00d4ff;cursor:pointer;">UP</button>
 <div></div>
 <button id="tag-left"style="font-size:1.3rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:10px;color:#00d4ff;cursor:pointer;">LT</button>
 <div></div>
 <button id="tag-right"style="font-size:1.3rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:10px;color:#00d4ff;cursor:pointer;">RT</button>
 <div></div>
 <button id="tag-down"style="font-size:1.3rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:10px;color:#00d4ff;cursor:pointer;">DN</button>
 <div></div>
 `;

 gameArea.appendChild(canvas);
 gameArea.appendChild(startBtn);
 gameArea.appendChild(dpad);
 gameArea.appendChild(info);

 const ctx = canvas.getContext('2d');
 const W = canvas.width, H = canvas.height;

 const runnerEmojis = [':D', '', '', '', '', '', '', '', '', '', '', ''];

 let player, runners, tagged, level, score, timer, running, frameId, timerInterval;
 let keys = { up: false, down: false, left: false, right: false };

 function reset() {
 level = 1;
 score = 0;
 running = false;
 }

 function startLevel() {
 const numRunners = Math.min(3 + level, 10);
 timer = 20 + level * 5;
 tagged = 0;

 player = { x: W / 2, y: H / 2, size: 20, speed: 3.5 };

 runners = [];
 for (let i = 0; i < numRunners; i++) {
 runners.push({
 x: Math.random() * (W - 40) + 20,
 y: Math.random() * (H - 40) + 20,
 size: 16,
 speed: 1.2 + Math.random() * 0.8 + level * 0.15,
 emoji: runnerEmojis[i % runnerEmojis.length],
 tagged: false,
 dx: (Math.random() - 0.5) * 2,
 dy: (Math.random() - 0.5) * 2,
 changeTimer: 0
 });
 }

 if (timerInterval) clearInterval(timerInterval);
 timerInterval = setInterval(() => {
 if (!running) return;
 timer--;
 if (timer <= 0) {
 clearInterval(timerInterval);
 timerInterval = null;
 running = false;
 startBtn.textContent = 'Try Again';
 showGameOver('Time\'s Up!', score, 'tag', () => { reset(); });
 }
 }, 1000);

 running = true;
 startBtn.textContent = 'Playing...';
 frameId = requestAnimationFrame(step);
 }

 function step() {
 if (!running) return;

 // Move player
 let dx = 0, dy = 0;
 if (keys.up) dy -= player.speed;
 if (keys.down) dy += player.speed;
 if (keys.left) dx -= player.speed;
 if (keys.right) dx += player.speed;

 // Normalize diagonal
 if (dx!== 0 && dy!== 0) {
 dx *= 0.707;
 dy *= 0.707;
 }

 player.x = Math.max(player.size, Math.min(W - player.size, player.x + dx));
 player.y = Math.max(player.size, Math.min(H - player.size, player.y + dy));

 // Move runners (they run away from player)
 for (const r of runners) {
 if (r.tagged) continue;

 // Distance to player
 const distX = r.x - player.x;
 const distY = r.y - player.y;
 const dist = Math.sqrt(distX * distX + distY * distY);

 r.changeTimer--;

 if (dist < 100) {
 // Run away from player
 const angle = Math.atan2(distY, distX);
 r.dx = Math.cos(angle) * r.speed * 1.5;
 r.dy = Math.sin(angle) * r.speed * 1.5;
 } else if (r.changeTimer <= 0) {
 // Random wandering
 const angle = Math.random() * Math.PI * 2;
 r.dx = Math.cos(angle) * r.speed;
 r.dy = Math.sin(angle) * r.speed;
 r.changeTimer = 30 + Math.random() * 60;
 }

 r.x += r.dx;
 r.y += r.dy;

 // Bounce off walls
 if (r.x < r.size) { r.x = r.size; r.dx *= -1; }
 if (r.x > W - r.size) { r.x = W - r.size; r.dx *= -1; }
 if (r.y < r.size) { r.y = r.size; r.dy *= -1; }
 if (r.y > H - r.size) { r.y = H - r.size; r.dy *= -1; }

 // Check if tagged
 if (dist < player.size + r.size) {
 r.tagged = true;
 tagged++;
 score += 20 + level * 10;

 // Check if all tagged
 if (tagged >= runners.length) {
 clearInterval(timerInterval);
 timerInterval = null;
 score += timer * 5;
 running = false;
 // Next level
 setTimeout(() => {
 level++;
 startLevel();
 }, 800);
 return;
 }
 }
 }

 // Draw
 ctx.clearRect(0, 0, W, H);

 // Draw grass field
 ctx.fillStyle = '#0a2a0a';
 ctx.fillRect(0, 0, W, H);

 // Grid lines for depth
 ctx.strokeStyle = 'rgba(0,255,136,0.05)';
 ctx.lineWidth = 1;
 for (let x = 0; x < W; x += 30) {
 ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
 }
 for (let y = 0; y < H; y += 30) {
 ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
 }

 // Draw tagged runners (faded)
 for (const r of runners) {
 if (!r.tagged) continue;
 ctx.globalAlpha = 0.3;
 ctx.font = `${r.size * 2}px serif`;
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText(r.emoji, r.x, r.y);
 ctx.globalAlpha = 1;
 // Tag marker
 ctx.font = '12px serif';
 ctx.fillText('', r.x, r.y - r.size - 5);
 }

 // Draw active runners
 for (const r of runners) {
 if (r.tagged) continue;
 ctx.font = `${r.size * 2}px serif`;
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText(r.emoji, r.x, r.y);

 // Exclamation if close to player
 const distX = r.x - player.x;
 const distY = r.y - player.y;
 const dist = Math.sqrt(distX * distX + distY * distY);
 if (dist < 80) {
 ctx.font = '14px serif';
 ctx.fillText('', r.x, r.y - r.size - 8);
 }
 }

 // Draw player (YOU)
 ctx.font = `${player.size * 2}px serif`;
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('P', player.x, player.y);

 // Glow around player
 ctx.beginPath();
 ctx.arc(player.x, player.y, player.size + 5, 0, Math.PI * 2);
 ctx.strokeStyle = 'rgba(0,255,136,0.3)';
 ctx.lineWidth = 2;
 ctx.stroke();

 // HUD
 ctx.fillStyle = 'rgba(0,0,0,0.6)';
 ctx.fillRect(0, 0, W, 32);
 ctx.font = 'bold 12px Orbitron, sans-serif';
 ctx.textAlign = 'left';
 ctx.textBaseline = 'top';
 ctx.fillStyle = '#b44aff';
 ctx.fillText('Lvl '+ level, 8, 9);
 ctx.fillStyle = timer <= 5? '#ff4444': '#00d4ff';
 ctx.textAlign = 'center';
 ctx.fillText(''+ timer + 's', W / 2, 9);
 ctx.fillStyle = '#00ff88';
 ctx.textAlign = 'right';
 ctx.fillText(tagged + '/'+ runners.length + 'tagged', W - 8, 9);

 frameId = requestAnimationFrame(step);
 }

 function onKey(e) {
 const down = e.type === 'keydown';
 switch (e.key) {
 case 'ArrowUp': case 'w': case 'W': keys.up = down; break;
 case 'ArrowDown': case 's': case 'S': keys.down = down; break;
 case 'ArrowLeft': case 'a': case 'A': keys.left = down; break;
 case 'ArrowRight': case 'd': case 'D': keys.right = down; break;
 }
 }

 // Touch: tap to move toward that point
 let touchTarget = null;
 canvas.addEventListener('touchstart', (e) => {
 const rect = canvas.getBoundingClientRect();
 touchTarget = {
 x: (e.touches[0].clientX - rect.left) * (W / rect.width),
 y: (e.touches[0].clientY - rect.top) * (H / rect.height)
 };
 }, {passive: true});
 canvas.addEventListener('touchmove', (e) => {
 const rect = canvas.getBoundingClientRect();
 touchTarget = {
 x: (e.touches[0].clientX - rect.left) * (W / rect.width),
 y: (e.touches[0].clientY - rect.top) * (H / rect.height)
 };
 }, {passive: true});
 canvas.addEventListener('touchend', () => { touchTarget = null; }, {passive: true});

 // Override step to also handle touch
 const origStep = step;
 const touchStep = () => {
 if (touchTarget && running) {
 const dx = touchTarget.x - player.x;
 const dy = touchTarget.y - player.y;
 const dist = Math.sqrt(dx * dx + dy * dy);
 if (dist > 5) {
 keys.up = dy < -5;
 keys.down = dy > 5;
 keys.left = dx < -5;
 keys.right = dx > 5;
 } else {
 keys.up = keys.down = keys.left = keys.right = false;
 }
 } else if (!touchTarget) {
 // Don't clear keys if using keyboard
 }
 };

 // Wrap step with touch handling
 const realStep = step;

 // Mobile buttons
 const btnUp = document.getElementById('tag-up');
 const btnDown = document.getElementById('tag-down');
 const btnLeft = document.getElementById('tag-left');
 const btnRight = document.getElementById('tag-right');

 function holdBtn(btn, key) {
 let interval;
 btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[key] = true; });
 btn.addEventListener('touchend', () => { keys[key] = false; });
 btn.addEventListener('mousedown', () => { keys[key] = true; });
 btn.addEventListener('mouseup', () => { keys[key] = false; });
 btn.addEventListener('mouseleave', () => { keys[key] = false; });
 }
 if (btnUp) holdBtn(btnUp, 'up');
 if (btnDown) holdBtn(btnDown, 'down');
 if (btnLeft) holdBtn(btnLeft, 'left');
 if (btnRight) holdBtn(btnRight, 'right');

 document.addEventListener('keydown', onKey);
 document.addEventListener('keyup', onKey);

 startBtn.onclick = () => {
 if (running) return;
 reset();
 level = 1;
 score = 0;
 startLevel();
 };

 reset();

 // Draw initial screen
 ctx.fillStyle = '#0a2a0a';
 ctx.fillRect(0, 0, W, H);
 ctx.font = 'bold 20px Orbitron, sans-serif';
 ctx.fillStyle = '#00ff88';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('Ready to Tag?', W / 2, H / 2);

 gameScoreDisplay.textContent = 'High: '+ getHigh('tag');

 gameCleanup = () => {
 running = false;
 cancelAnimationFrame(frameId);
 if (timerInterval) clearInterval(timerInterval);
 document.removeEventListener('keydown', onKey);
 document.removeEventListener('keyup', onKey);
 };
}

// ==================== GEOMETRY DASH ====================
function initGeoDash() {
 gameTitle.textContent = 'Geometry Dash';

 const canvas = document.createElement('canvas');
 canvas.width = 400;
 canvas.height = 300;
 canvas.style.cssText = 'display:block;margin:0 auto;border:2px solid #b44aff;border-radius:12px;background:#0a0a1a;touch-action:none;cursor:pointer;';
 const startBtn = document.createElement('button');
 startBtn.textContent = 'Start!';
 startBtn.style.cssText = 'display:block;margin:10px auto;padding:12px 30px;font-size:1.1rem;background:linear-gradient(135deg,#b44aff,#ff44aa);border:none;border-radius:8px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;color:#fff;';
 const info = document.createElement('div');
 info.style.cssText = 'text-align:center;color:#666;font-size:0.75rem;margin-top:8px;';
 info.textContent = 'Tap, click, or press SPACE to jump! Don\'t hit the obstacles!';

 gameArea.appendChild(canvas);
 gameArea.appendChild(startBtn);
 gameArea.appendChild(info);

 const ctx = canvas.getContext('2d');
 const W = canvas.width, H = canvas.height;
 const groundY = H - 50;

 // Colors that cycle through like GD
 const bgColors = ['#0a0a2e', '#1a0a2e', '#2e0a1a', '#0a1a2e', '#0a2e1a', '#2e1a0a'];
 const playerColors = ['#00ff88', '#00d4ff', '#ff44aa', '#ffaa00', '#b44aff', '#ff4444'];
 const obstacleColors = ['#ff4444', '#ff44aa', '#b44aff', '#00d4ff', '#00ff88', '#ffaa00'];

 let player, obstacles, particles, score, speed, running, frameId, jumpCount;
 let colorIndex = 0;
 let bgOffset = 0;
 let attempts = 0;
 let groundPulse = 0;

 function reset() {
 player = {
 x: 80,
 y: groundY - 20,
 w: 20,
 h: 20,
 vy: 0,
 rotation: 0,
 grounded: true,
 jumping: false
 };
 obstacles = [];
 particles = [];
 score = 0;
 speed = 4;
 running = false;
 jumpCount = 0;
 colorIndex = 0;
 bgOffset = 0;
 }

 function jump() {
 if (!running) return;
 if (player.grounded) {
 player.vy = -9;
 player.grounded = false;
 player.jumping = true;
 // Spawn jump particles
 for (let i = 0; i < 5; i++) {
 particles.push({
 x: player.x, y: player.y + player.h,
 vx: (Math.random() - 0.5) * 3,
 vy: Math.random() * 2 + 1,
 life: 20,
 color: playerColors[colorIndex % playerColors.length]
 });
 }
 }
 }

 function spawnObstacle() {
 const type = Math.random();
 if (type < 0.4) {
 // Spike (triangle)
 obstacles.push({
 type: 'spike',
 x: W + 20,
 y: groundY,
 w: 25,
 h: 30
 });
 } else if (type < 0.7) {
 // Block
 const h = 20 + Math.random() * 20;
 obstacles.push({
 type: 'block',
 x: W + 20,
 y: groundY - h,
 w: 25,
 h: h
 });
 } else if (type < 0.85) {
 // Double spike
 obstacles.push({ type: 'spike', x: W + 20, y: groundY, w: 25, h: 30 });
 obstacles.push({ type: 'spike', x: W + 50, y: groundY, w: 25, h: 30 });
 } else {
 // Tall pillar (must jump early)
 obstacles.push({
 type: 'block',
 x: W + 20,
 y: groundY - 50,
 w: 20,
 h: 50
 });
 }
 }

 function checkCollision(obs) {
 const px = player.x - player.w / 2;
 const py = player.y - player.h;
 const pw = player.w;
 const ph = player.h;

 if (obs.type === 'spike') {
 // Triangle collision (simplified with smaller hitbox)
 const cx = obs.x + obs.w / 2;
 const cy = obs.y - obs.h;
 const margin = 6;
 // Simple rect check with margin
 return px + pw > obs.x + margin && px < obs.x + obs.w - margin &&
 py + ph > obs.y - obs.h + margin && py < obs.y;
 } else {
 // Block collision
 return px + pw > obs.x + 3 && px < obs.x + obs.w - 3 &&
 py + ph > obs.y + 3 && py < obs.y + obs.h - 3;
 }
 }

 function step() {
 if (!running) return;

 // Gravity
 player.vy += 0.5;
 player.y += player.vy;

 // Ground check
 if (player.y >= groundY - player.h) {
 player.y = groundY - player.h;
 player.vy = 0;
 player.grounded = true;
 player.jumping = false;
 }

 // Rotate player when jumping
 if (!player.grounded) {
 player.rotation += speed * 3;
 } else {
 // Snap rotation to nearest 90
 player.rotation = Math.round(player.rotation / 90) * 90;
 }

 // Move obstacles
 for (let i = obstacles.length - 1; i >= 0; i--) {
 obstacles[i].x -= speed;
 if (obstacles[i].x < -40) {
 obstacles.splice(i, 1);
 score += 1;
 }
 }

 // Spawn obstacles
 const lastObs = obstacles.length > 0? obstacles[obstacles.length - 1]: null;
 if (!lastObs || lastObs.x < W - (120 + Math.random() * 80)) {
 spawnObstacle();
 }

 // Move particles
 for (let i = particles.length - 1; i >= 0; i--) {
 const p = particles[i];
 p.x += p.vx;
 p.y += p.vy;
 p.life--;
 if (p.life <= 0) particles.splice(i, 1);
 }

 // Trail particles
 if (Math.random() < 0.3) {
 particles.push({
 x: player.x - player.w / 2,
 y: player.y,
 vx: -speed * 0.5 + (Math.random() - 0.5),
 vy: (Math.random() - 0.5) * 2,
 life: 15,
 color: playerColors[colorIndex % playerColors.length]
 });
 }

 // Collision
 for (const obs of obstacles) {
 if (checkCollision(obs)) {
 running = false;
 attempts++;

 // Death particles
 for (let i = 0; i < 20; i++) {
 particles.push({
 x: player.x, y: player.y,
 vx: (Math.random() - 0.5) * 8,
 vy: (Math.random() - 0.5) * 8,
 life: 30,
 color: playerColors[colorIndex % playerColors.length]
 });
 }

 // Draw death frame
 drawFrame(true);

 setTimeout(() => {
 startBtn.textContent = 'Retry (Attempt '+ attempts +')';
 showGameOver('Crashed!', score, 'geodash', () => { reset(); });
 }, 500);
 return;
 }
 }

 // Speed up
 speed = 4 + score * 0.05;

 // Color change every 20 points
 colorIndex = Math.floor(score / 20);

 // BG scroll
 bgOffset = (bgOffset + speed * 0.5) % 40;
 groundPulse = (groundPulse + 0.05) % (Math.PI * 2);

 drawFrame(false);
 frameId = requestAnimationFrame(step);
 }

 function drawFrame(dead) {
 const bgCol = bgColors[colorIndex % bgColors.length];
 const pCol = playerColors[colorIndex % playerColors.length];
 const oCol = obstacleColors[colorIndex % obstacleColors.length];

 // Background
 ctx.fillStyle = bgCol;
 ctx.fillRect(0, 0, W, H);

 // Background grid (moving)
 ctx.strokeStyle = 'rgba(255,255,255,0.03)';
 ctx.lineWidth = 1;
 for (let x = -bgOffset; x < W; x += 40) {
 ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
 }
 for (let y = 0; y < H; y += 40) {
 ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
 }

 // Ground
 const groundGlow = Math.sin(groundPulse) * 0.2 + 0.8;
 ctx.fillStyle = pCol;
 ctx.globalAlpha = 0.15 * groundGlow;
 ctx.fillRect(0, groundY, W, H - groundY);
 ctx.globalAlpha = 1;
 ctx.fillStyle = pCol;
 ctx.fillRect(0, groundY, W, 2);

 // Particles
 for (const p of particles) {
 ctx.globalAlpha = p.life / 30;
 ctx.fillStyle = p.color;
 ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
 }
 ctx.globalAlpha = 1;

 // Obstacles
 for (const obs of obstacles) {
 if (obs.type === 'spike') {
 ctx.fillStyle = oCol;
 ctx.beginPath();
 ctx.moveTo(obs.x + obs.w / 2, obs.y - obs.h);
 ctx.lineTo(obs.x, obs.y);
 ctx.lineTo(obs.x + obs.w, obs.y);
 ctx.closePath();
 ctx.fill();
 // Glow
 ctx.shadowColor = oCol;
 ctx.shadowBlur = 8;
 ctx.fill();
 ctx.shadowBlur = 0;
 } else {
 ctx.fillStyle = oCol;
 ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
 ctx.shadowColor = oCol;
 ctx.shadowBlur = 8;
 ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
 ctx.shadowBlur = 0;
 }
 }

 // Player (rotating square)
 ctx.save();
 ctx.translate(player.x, player.y - player.h / 2);
 ctx.rotate(player.rotation * Math.PI / 180);
 ctx.fillStyle = pCol;
 ctx.shadowColor = pCol;
 ctx.shadowBlur = 15;
 ctx.fillRect(-player.w / 2, -player.h / 2, player.w, player.h);
 ctx.shadowBlur = 0;
 // Inner detail
 ctx.fillStyle = 'rgba(255,255,255,0.3)';
 ctx.fillRect(-player.w / 2 + 3, -player.h / 2 + 3, player.w - 6, player.h / 2 - 3);
 ctx.restore();

 // HUD
 ctx.fillStyle = 'rgba(0,0,0,0.5)';
 ctx.fillRect(0, 0, W, 28);
 ctx.font = 'bold 13px Orbitron, sans-serif';
 ctx.fillStyle = pCol;
 ctx.textAlign = 'left';
 ctx.textBaseline = 'top';
 ctx.fillText('Score: '+ score, 8, 7);
 ctx.textAlign = 'center';
 ctx.fillStyle = '#888';
 ctx.fillText('Attempt '+ attempts, W / 2, 7);
 ctx.textAlign = 'right';
 ctx.fillStyle = '#ffaa00';
 ctx.fillText('Best: '+ getHigh('geodash'), W - 8, 7);

 if (dead) {
 ctx.fillStyle = 'rgba(255,0,0,0.3)';
 ctx.fillRect(0, 0, W, H);
 }
 }

 function onKey(e) {
 if (e.code === 'Space'|| e.key === 'ArrowUp'|| e.key === 'w') {
 e.preventDefault();
 jump();
 }
 }

 canvas.addEventListener('click', jump);
 canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });
 document.addEventListener('keydown', onKey);

 startBtn.onclick = () => {
 if (running) return;
 reset();
 attempts++;
 running = true;
 startBtn.textContent = 'Running...';
 frameId = requestAnimationFrame(step);
 };

 reset();
 attempts = 0;

 // Draw initial screen
 ctx.fillStyle = '#0a0a2e';
 ctx.fillRect(0, 0, W, H);
 ctx.fillStyle = '#b44aff';
 ctx.fillRect(0, groundY, W, 2);
 // Player preview
 ctx.fillStyle = '#00ff88';
 ctx.shadowColor = '#00ff88';
 ctx.shadowBlur = 15;
 ctx.fillRect(player.x - 10, groundY - 30, 20, 20);
 ctx.shadowBlur = 0;
 // Spike preview
 ctx.fillStyle = '#ff4444';
 ctx.beginPath();
 ctx.moveTo(200, groundY - 30); ctx.lineTo(187, groundY); ctx.lineTo(213, groundY);
 ctx.closePath(); ctx.fill();

 ctx.font = 'bold 18px Orbitron, sans-serif';
 ctx.fillStyle = '#b44aff';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('Geometry Dash', W / 2, H / 2 - 30);
 ctx.font = '12px Rajdhani, sans-serif';
 ctx.fillStyle = '#888';
 ctx.fillText('Tap or press SPACE to jump!', W / 2, H / 2);

 gameScoreDisplay.textContent = 'High: '+ getHigh('geodash');

 gameCleanup = () => {
 running = false;
 cancelAnimationFrame(frameId);
 document.removeEventListener('keydown', onKey);
 };
}

// ==================== KING SHOT ====================
function initKingShot() {
 gameTitle.textContent = 'King Shot';

 const canvas = document.createElement('canvas');
 canvas.width = 380;
 canvas.height = 400;
 canvas.style.cssText = 'display:block;margin:0 auto;border:2px solid #ffaa00;border-radius:12px;background:#1a1a2e;touch-action:none;cursor:crosshair;';
 const info = document.createElement('div');
 info.style.cssText = 'text-align:center;color:#666;font-size:0.75rem;margin-top:8px;';
 info.textContent = 'Drag from the cannon to aim and release to shoot! Knock all targets off!';

 gameArea.appendChild(canvas);
 gameArea.appendChild(info);

 const ctx = canvas.getContext('2d');
 const W = canvas.width, H = canvas.height;
 const gravity = 0.3;
 const groundY = H - 30;

 // Cannon position
 const cannonX = 50;
 const cannonY = groundY - 10;

 let balls, targets, blocks, level, score, shotsLeft, dragging, dragStart, dragEnd;
 let activeBall, running, frameId, particles;

 function buildLevel(lvl) {
 targets = [];
 blocks = [];

 const baseX = 220;
 const blockW = 20;
 const blockH = 40;

 if (lvl <= 2) {
 // Simple stack
 const cols = lvl + 1;
 for (let c = 0; c < cols; c++) {
 blocks.push({ x: baseX + c * 50, y: groundY - blockH, w: blockW, h: blockH, vy: 0, vx: 0, fallen: false });
 targets.push({ x: baseX + c * 50 + blockW / 2, y: groundY - blockH - 15, r: 12, hit: false, emoji: ''});
 }
 } else if (lvl <= 4) {
 // Two rows
 for (let c = 0; c < 2; c++) {
 blocks.push({ x: baseX + c * 60, y: groundY - blockH, w: blockW, h: blockH, vy: 0, vx: 0, fallen: false });
 // Plank on top
 }
 blocks.push({ x: baseX - 5, y: groundY - blockH - 10, w: 80, h: 10, vy: 0, vx: 0, fallen: false });
 targets.push({ x: baseX + 30, y: groundY - blockH - 35, r: 12, hit: false, emoji: ''});
 targets.push({ x: baseX - 10, y: groundY - 15, r: 10, hit: false, emoji: ''});
 targets.push({ x: baseX + 70, y: groundY - 15, r: 10, hit: false, emoji: ''});
 } else {
 // Complex structure
 const numCols = Math.min(3 + Math.floor(lvl / 3), 5);
 const numRows = Math.min(1 + Math.floor(lvl / 4), 3);
 for (let row = 0; row < numRows; row++) {
 for (let c = 0; c < numCols; c++) {
 const bx = baseX + c * 40 - (numCols * 20);
 const by = groundY - blockH * (row + 1) - row * 10;
 blocks.push({ x: bx, y: by, w: blockW, h: blockH, vy: 0, vx: 0, fallen: false });
 }
 // Planks between rows
 if (row < numRows - 1) {
 blocks.push({ x: baseX - (numCols * 20) - 5, y: groundY - blockH * (row + 1) - (row + 1) * 10, w: numCols * 40 + 10, h: 8, vy: 0, vx: 0, fallen: false });
 }
 }
 // Targets on top and sides
 for (let c = 0; c < Math.min(numCols, 3); c++) {
 targets.push({
 x: baseX + c * 40 - (numCols * 20) + 10,
 y: groundY - blockH * numRows - numRows * 10 - 15,
 r: 11, hit: false,
 emoji: c === 1? '': ''
 });
 }
 }

 shotsLeft = 3 + Math.floor(lvl / 3);
 activeBall = null;
 }

 function resetGame() {
 level = 1;
 score = 0;
 particles = [];
 balls = [];
 dragging = false;
 running = true;
 buildLevel(level);
 draw();
 }

 function shoot(vx, vy) {
 if (shotsLeft <= 0 || activeBall) return;
 shotsLeft--;
 activeBall = {
 x: cannonX + 20,
 y: cannonY - 20,
 vx: vx,
 vy: vy,
 r: 8
 };
 balls.push(activeBall);
 }

 function step() {
 if (!running) return;

 // Move active ball
 if (activeBall) {
 activeBall.vy += gravity;
 activeBall.x += activeBall.vx;
 activeBall.y += activeBall.vy;

 // Ball vs blocks
 for (const b of blocks) {
 if (b.fallen) continue;
 if (activeBall.x + activeBall.r > b.x && activeBall.x - activeBall.r < b.x + b.w &&
 activeBall.y + activeBall.r > b.y && activeBall.y - activeBall.r < b.y + b.h) {
 // Hit block - knock it
 b.vx = activeBall.vx * 0.6;
 b.vy = -3 - Math.random() * 2;
 b.fallen = true;
 activeBall.vx *= 0.3;
 activeBall.vy *= 0.3;
 // Particles
 for (let i = 0; i < 6; i++) {
 particles.push({
 x: activeBall.x, y: activeBall.y,
 vx: (Math.random() - 0.5) * 5,
 vy: (Math.random() - 0.5) * 5,
 life: 20, color: '#ffaa00'
 });
 }
 }
 }

 // Ball vs targets
 for (const t of targets) {
 if (t.hit) continue;
 const dx = activeBall.x - t.x;
 const dy = activeBall.y - t.y;
 if (Math.sqrt(dx * dx + dy * dy) < activeBall.r + t.r) {
 t.hit = true;
 score += 50 + level * 10;
 for (let i = 0; i < 10; i++) {
 particles.push({
 x: t.x, y: t.y,
 vx: (Math.random() - 0.5) * 6,
 vy: (Math.random() - 0.5) * 6,
 life: 25, color: t.emoji === ''? '#ffaa00': '#ff4444'
 });
 }
 }
 }

 // Ball off screen
 if (activeBall.y > H + 50 || activeBall.x > W + 50 || activeBall.x < -50) {
 activeBall = null;
 }
 }

 // Fallen blocks physics
 for (const b of blocks) {
 if (!b.fallen) continue;
 b.vy += gravity;
 b.x += b.vx;
 b.y += b.vy;

 // Fallen blocks hit targets
 for (const t of targets) {
 if (t.hit) continue;
 if (b.x + b.w > t.x - t.r && b.x < t.x + t.r &&
 b.y + b.h > t.y - t.r && b.y < t.y + t.r) {
 t.hit = true;
 score += 50 + level * 10;
 for (let i = 0; i < 8; i++) {
 particles.push({
 x: t.x, y: t.y,
 vx: (Math.random() - 0.5) * 5,
 vy: (Math.random() - 0.5) * 5,
 life: 20, color: '#ff44aa'
 });
 }
 }
 }
 }

 // Particles
 for (let i = particles.length - 1; i >= 0; i--) {
 particles[i].x += particles[i].vx;
 particles[i].y += particles[i].vy;
 particles[i].life--;
 if (particles[i].life <= 0) particles.splice(i, 1);
 }

 // Check win/lose
 const allHit = targets.every(t => t.hit);
 if (allHit && targets.length > 0) {
 running = false;
 score += shotsLeft * 30; // bonus for remaining shots
 setTimeout(() => {
 level++;
 particles = [];
 balls = [];
 activeBall = null;
 dragging = false;
 running = true;
 buildLevel(level);
 frameId = requestAnimationFrame(step);
 }, 1000);
 } else if (!activeBall && shotsLeft <= 0 &&!allHit) {
 // Wait a beat for physics to settle
 setTimeout(() => {
 const nowAllHit = targets.every(t => t.hit);
 if (!nowAllHit) {
 running = false;
 showGameOver('Out of shots!', score, 'kingshot', resetGame);
 }
 }, 1500);
 }

 draw();
 if (running) frameId = requestAnimationFrame(step);
 }

 function draw() {
 // Sky gradient
 const grad = ctx.createLinearGradient(0, 0, 0, H);
 grad.addColorStop(0, '#0a0a2e');
 grad.addColorStop(1, '#1a1a3e');
 ctx.fillStyle = grad;
 ctx.fillRect(0, 0, W, H);

 // Ground
 ctx.fillStyle = '#2a1a0a';
 ctx.fillRect(0, groundY, W, H - groundY);
 ctx.fillStyle = '#3a2a1a';
 ctx.fillRect(0, groundY, W, 3);

 // Cannon
 ctx.fillStyle = '#555';
 ctx.fillRect(cannonX - 5, cannonY - 30, 30, 30);
 ctx.fillStyle = '#777';
 ctx.beginPath();
 ctx.arc(cannonX + 10, cannonY - 15, 12, 0, Math.PI * 2);
 ctx.fill();

 // Aim line when dragging
 if (dragging && dragStart && dragEnd) {
 const dx = dragStart.x - dragEnd.x;
 const dy = dragStart.y - dragEnd.y;
 ctx.strokeStyle = 'rgba(255,170,0,0.6)';
 ctx.lineWidth = 2;
 ctx.setLineDash([5, 5]);
 ctx.beginPath();
 ctx.moveTo(cannonX + 20, cannonY - 20);
 ctx.lineTo(cannonX + 20 + dx * 0.5, cannonY - 20 + dy * 0.5);
 ctx.stroke();
 ctx.setLineDash([]);

 // Power indicator
 const power = Math.min(Math.sqrt(dx * dx + dy * dy), 150);
 ctx.fillStyle = power > 100? '#ff4444': power > 60? '#ffaa00': '#00ff88';
 ctx.font = '11px Orbitron, sans-serif';
 ctx.textAlign = 'center';
 ctx.fillText('Power: '+ Math.round(power), cannonX + 20, cannonY - 45);
 }

 // Blocks
 for (const b of blocks) {
 if (b.y > H + 50) continue;
 ctx.fillStyle = '#8B4513';
 ctx.fillRect(b.x, b.y, b.w, b.h);
 ctx.strokeStyle = '#A0522D';
 ctx.lineWidth = 1;
 ctx.strokeRect(b.x, b.y, b.w, b.h);
 }

 // Targets
 for (const t of targets) {
 if (t.hit) continue;
 ctx.font = `${t.r * 2}px serif`;
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText(t.emoji, t.x, t.y);
 }

 // Balls
 for (const ball of balls) {
 if (ball.y > H + 50) continue;
 ctx.beginPath();
 ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
 ctx.fillStyle = '#ffaa00';
 ctx.shadowColor = '#ffaa00';
 ctx.shadowBlur = 10;
 ctx.fill();
 ctx.shadowBlur = 0;
 }

 // Particles
 for (const p of particles) {
 ctx.globalAlpha = p.life / 25;
 ctx.fillStyle = p.color;
 ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
 }
 ctx.globalAlpha = 1;

 // HUD
 ctx.fillStyle = 'rgba(0,0,0,0.5)';
 ctx.fillRect(0, 0, W, 30);
 ctx.font = 'bold 12px Orbitron, sans-serif';
 ctx.textBaseline = 'top';
 ctx.textAlign = 'left';
 ctx.fillStyle = '#b44aff';
 ctx.fillText('Level '+ level, 8, 8);
 ctx.textAlign = 'center';
 ctx.fillStyle = '#ffaa00';
 ctx.fillText(''.repeat(shotsLeft), W / 2, 6);
 ctx.textAlign = 'right';
 ctx.fillStyle = '#00ff88';
 ctx.fillText('Score: '+ score, W - 8, 8);
 }

 // Input handling
 function getPos(e) {
 const rect = canvas.getBoundingClientRect();
 const clientX = e.touches? e.touches[0].clientX: e.clientX;
 const clientY = e.touches? e.touches[0].clientY: e.clientY;
 return {
 x: (clientX - rect.left) * (W / rect.width),
 y: (clientY - rect.top) * (H / rect.height)
 };
 }

 function onDown(e) {
 if (!running || activeBall) return;
 e.preventDefault();
 dragging = true;
 dragStart = getPos(e);
 dragEnd = dragStart;
 }

 function onMove(e) {
 if (!dragging) return;
 e.preventDefault();
 dragEnd = getPos(e);
 draw();
 }

 function onUp(e) {
 if (!dragging) return;
 dragging = false;
 if (!dragStart ||!dragEnd) return;

 const dx = dragStart.x - dragEnd.x;
 const dy = dragStart.y - dragEnd.y;
 const power = Math.min(Math.sqrt(dx * dx + dy * dy), 150);

 if (power > 10) {
 const angle = Math.atan2(dy, dx);
 const vx = Math.cos(angle) * power * 0.08;
 const vy = Math.sin(angle) * power * 0.08;
 shoot(vx, vy);
 if (!frameId ||!running) {
 running = true;
 frameId = requestAnimationFrame(step);
 }
 }
 dragStart = null;
 dragEnd = null;
 }

 canvas.addEventListener('mousedown', onDown);
 canvas.addEventListener('mousemove', onMove);
 canvas.addEventListener('mouseup', onUp);
 canvas.addEventListener('touchstart', onDown, {passive: false});
 canvas.addEventListener('touchmove', onMove, {passive: false});
 canvas.addEventListener('touchend', onUp);

 gameScoreDisplay.textContent = 'High: '+ getHigh('kingshot');

 resetGame();
 running = false; // wait for first shot to start physics

 // Draw initial
 draw();
 ctx.font = 'bold 16px Orbitron, sans-serif';
 ctx.fillStyle = '#ffaa00';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('Drag to Aim & Shoot!', W / 2, H / 2 - 40);

 running = true;

 gameCleanup = () => {
 running = false;
 cancelAnimationFrame(frameId);
 canvas.removeEventListener('mousedown', onDown);
 canvas.removeEventListener('mousemove', onMove);
 canvas.removeEventListener('mouseup', onUp);
 canvas.removeEventListener('touchstart', onDown);
 canvas.removeEventListener('touchmove', onMove);
 canvas.removeEventListener('touchend', onUp);
 };
}

// ==================== MINICRAFT (Mini Minecraft) ====================
function initMiniCraft() {
 gameTitle.textContent = 'MiniCraft';

 const TILE = 24;
 const COLS = 16;
 const ROWS = 14;
 const W = COLS * TILE;
 const HH = ROWS * TILE;

 const canvas = document.createElement('canvas');
 canvas.width = W;
 canvas.height = HH;
 canvas.style.cssText = 'display:block;margin:0 auto;border:2px solid #00ff88;border-radius:8px;image-rendering:pixelated;touch-action:none;cursor:crosshair;';

 // Block selector
 const selector = document.createElement('div');
 selector.style.cssText = 'display:flex;justify-content:center;gap:6px;margin:10px auto;flex-wrap:wrap;max-width:390px;';

 // Mobile controls
 const controls = document.createElement('div');
 controls.style.cssText = 'display:flex;justify-content:center;gap:8px;margin-top:8px;flex-wrap:wrap;';
 controls.innerHTML = `
 <div style="display:grid;grid-template-columns:40px 40px 40px;grid-template-rows:40px 40px;gap:3px;">
 <div></div>
 <button id="mc-up"style="font-size:1.2rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:8px;color:#00d4ff;cursor:pointer;">UP</button>
 <div></div>
 <button id="mc-left"style="font-size:1.2rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:8px;color:#00d4ff;cursor:pointer;">LT</button>
 <button id="mc-down"style="font-size:1.2rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:8px;color:#00d4ff;cursor:pointer;">DN</button>
 <button id="mc-right"style="font-size:1.2rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:8px;color:#00d4ff;cursor:pointer;">RT</button>
 </div>
 <div style="display:flex;flex-direction:column;gap:3px;margin-left:20px;">
 <button id="mc-mine"style="padding:8px 16px;font-size:0.9rem;background:#1a1a2e;border:2px solid #ff4444;border-radius:8px;color:#ff4444;cursor:pointer;"> Mine</button>
 <button id="mc-place"style="padding:8px 16px;font-size:0.9rem;background:#1a1a2e;border:2px solid #00ff88;border-radius:8px;color:#00ff88;cursor:pointer;"> Place</button>
 </div>
 `;

 const info = document.createElement('div');
 info.style.cssText = 'text-align:center;color:#666;font-size:0.7rem;margin-top:6px;';
 info.textContent = 'WASD/Arrows: move | Click: mine/place | 1-7: select block';

 gameArea.appendChild(canvas);
 gameArea.appendChild(selector);
 gameArea.appendChild(controls);
 gameArea.appendChild(info);

 const ctx = canvas.getContext('2d');

 // Block types
 const BLOCKS = {
 0: { name: 'Air', color: null },
 1: { name: 'Dirt', color: '#8B5E3C', dark: '#6B4226', detail: '#7A5230'},
 2: { name: 'Grass', color: '#4CAF50', dark: '#388E3C', top: '#66BB6A'},
 3: { name: 'Stone', color: '#9E9E9E', dark: '#757575', detail: '#BDBDBD'},
 4: { name: 'Wood', color: '#A1887F', dark: '#795548', detail: '#8D6E63'},
 5: { name: 'Leaves', color: '#2E7D32', dark: '#1B5E20', detail: '#43A047'},
 6: { name: 'Water', color: '#1565C0', dark: '#0D47A1', detail: '#1976D2'},
 7: { name: 'Sand', color: '#FDD835', dark: '#F9A825', detail: '#FFEE58'},
 8: { name: 'Coal', color: '#424242', dark: '#212121', detail: '#616161'},
 9: { name: 'Gold', color: '#FFD700', dark: '#FFA000', detail: '#FFE082'},
 10: { name: 'Diamond', color: '#4DD0E1', dark: '#00ACC1', detail: '#80DEEA'},
 11: { name: 'Bedrock', color: '#333', dark: '#111', detail: '#444'}
 };

 const PLACEABLE = [1, 2, 3, 4, 5, 7]; // blocks player can place

 let world, playerPos, selectedBlock, inventory, facing, frameId;

 function generateWorld() {
 world = Array.from({length: ROWS}, () => Array(COLS).fill(0));

 // Ground level
 const groundLevel = 8;

 for (let x = 0; x < COLS; x++) {
 // Terrain height variation
 const height = groundLevel + Math.floor(Math.sin(x * 0.5) * 2);

 for (let y = 0; y < ROWS; y++) {
 if (y === ROWS - 1) {
 world[y][x] = 11; // bedrock
 } else if (y >= height) {
 if (y === height) {
 world[y][x] = 2; // grass top
 } else if (y < height + 3) {
 world[y][x] = 1; // dirt
 } else {
 world[y][x] = 3; // stone
 // Ores
 if (Math.random() < 0.08) world[y][x] = 8; // coal
 if (y > ROWS - 4 && Math.random() < 0.05) world[y][x] = 9; // gold
 if (y > ROWS - 3 && Math.random() < 0.03) world[y][x] = 10; // diamond
 }
 } else {
 world[y][x] = 0; // air
 }
 }

 // Trees
 if (Math.random() < 0.15 && world[groundLevel - 1]!== undefined) {
 const treeH = 3 + Math.floor(Math.random() * 2);
 const treeBase = height - 1;
 for (let ty = 0; ty < treeH; ty++) {
 const wy = treeBase - ty;
 if (wy >= 0 && wy < ROWS) world[wy][x] = 4; // trunk
 }
 // Leaves
 for (let ly = -1; ly <= 1; ly++) {
 for (let lx = -1; lx <= 1; lx++) {
 const wx = x + lx;
 const wy = treeBase - treeH + ly;
 if (wx >= 0 && wx < COLS && wy >= 0 && wy < ROWS && world[wy][wx] === 0) {
 world[wy][wx] = 5;
 }
 }
 }
 }
 }

 // Water pools
 for (let x = 0; x < COLS; x++) {
 const height = groundLevel + Math.floor(Math.sin(x * 0.5) * 2);
 if (height > groundLevel + 1) {
 for (let y = groundLevel; y < height; y++) {
 if (world[y][x] === 0) world[y][x] = 6;
 }
 }
 }

 // Find spawn (air above ground)
 for (let y = 0; y < ROWS; y++) {
 const mid = Math.floor(COLS / 2);
 if (world[y][mid]!== 0 && y > 0 && world[y - 1][mid] === 0) {
 playerPos = { x: mid, y: y - 1 };
 break;
 }
 }
 if (!playerPos) playerPos = { x: 8, y: 5 };
 }

 function buildSelector() {
 selector.innerHTML = '';
 PLACEABLE.forEach((id, i) => {
 const b = BLOCKS[id];
 const btn = document.createElement('button');
 btn.style.cssText = `width:36px;height:36px;background:${b.color};border:${selectedBlock === id? '3px solid #00ff88': '2px solid #555'};border-radius:6px;cursor:pointer;font-size:0.6rem;color:#fff;font-family:Rajdhani,sans-serif;${selectedBlock === id? 'box-shadow:0 0 10px #00ff88;': ''}`;
 btn.textContent = b.name.slice(0, 4);
 btn.title = b.name + '('+ (i + 1) +')';
 btn.onclick = () => { selectedBlock = id; buildSelector(); };
 selector.appendChild(btn);
 });
 // Inventory display
 const invDiv = document.createElement('div');
 invDiv.style.cssText = 'width:100%;text-align:center;margin-top:4px;font-size:0.7rem;color:#aaa;font-family:Rajdhani,sans-serif;';
 let invText = '';
 for (const [id, count] of Object.entries(inventory)) {
 if (count > 0) invText += `${BLOCKS[id].name}: ${count} `;
 }
 invDiv.textContent = invText || 'Mine blocks to collect them!';
 selector.appendChild(invDiv);
 }

 function drawBlock(x, y, id) {
 if (id === 0) return;
 const b = BLOCKS[id];
 const px = x * TILE;
 const py = y * TILE;

 ctx.fillStyle = b.color;
 ctx.fillRect(px, py, TILE, TILE);

 // Darker edges
 ctx.fillStyle = b.dark;
 ctx.fillRect(px, py + TILE - 3, TILE, 3);
 ctx.fillRect(px + TILE - 3, py, 3, TILE);

 // Top highlight
 if (b.top) {
 ctx.fillStyle = b.top;
 ctx.fillRect(px, py, TILE, 4);
 }

 // Detail dots for ores
 if (id === 8 || id === 9 || id === 10) {
 ctx.fillStyle = b.detail;
 ctx.fillRect(px + 4, py + 6, 4, 4);
 ctx.fillRect(px + 14, py + 12, 4, 4);
 ctx.fillRect(px + 8, py + 16, 3, 3);
 }

 // Grid line
 ctx.strokeStyle = 'rgba(0,0,0,0.15)';
 ctx.lineWidth = 0.5;
 ctx.strokeRect(px, py, TILE, TILE);
 }

 function draw() {
 // Sky
 const skyGrad = ctx.createLinearGradient(0, 0, 0, HH);
 skyGrad.addColorStop(0, '#87CEEB');
 skyGrad.addColorStop(0.6, '#B0E0E6');
 skyGrad.addColorStop(1, '#1a1a2e');
 ctx.fillStyle = skyGrad;
 ctx.fillRect(0, 0, W, HH);

 // Blocks
 for (let y = 0; y < ROWS; y++) {
 for (let x = 0; x < COLS; x++) {
 drawBlock(x, y, world[y][x]);
 }
 }

 // Player
 const px = playerPos.x * TILE;
 const py = playerPos.y * TILE;

 // Body
 ctx.fillStyle = '#00BCD4';
 ctx.fillRect(px + 6, py + 8, 12, 14);
 // Head
 ctx.fillStyle = '#FFCCBC';
 ctx.fillRect(px + 7, py + 1, 10, 8);
 // Eyes
 ctx.fillStyle = '#fff';
 ctx.fillRect(px + 9, py + 3, 3, 3);
 ctx.fillRect(px + 13, py + 3, 3, 3);
 ctx.fillStyle = '#333';
 if (facing === 'left') {
 ctx.fillRect(px + 9, py + 4, 2, 2);
 ctx.fillRect(px + 13, py + 4, 2, 2);
 } else {
 ctx.fillRect(px + 10, py + 4, 2, 2);
 ctx.fillRect(px + 14, py + 4, 2, 2);
 }
 // Legs
 ctx.fillStyle = '#5D4037';
 ctx.fillRect(px + 7, py + 20, 4, 4);
 ctx.fillRect(px + 13, py + 20, 4, 4);

 // Cursor highlight (block in front of player)
 const cx = facing === 'left'? playerPos.x - 1: playerPos.x + 1;
 const cy = playerPos.y;
 if (cx >= 0 && cx < COLS && cy >= 0 && cy < ROWS) {
 ctx.strokeStyle = 'rgba(255,255,255,0.5)';
 ctx.lineWidth = 2;
 ctx.setLineDash([4, 4]);
 ctx.strokeRect(cx * TILE, cy * TILE, TILE, TILE);
 ctx.setLineDash([]);
 }
 }

 function movePlayer(dx, dy) {
 if (dx < 0) facing = 'left';
 if (dx > 0) facing = 'right';

 const nx = playerPos.x + dx;
 const ny = playerPos.y + dy;

 if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return;
 if (world[ny][nx]!== 0 && world[ny][nx]!== 6) return; // can walk through water

 playerPos.x = nx;
 playerPos.y = ny;

 // Gravity: fall if no block below
 applyGravity();
 draw();
 buildSelector();
 }

 function applyGravity() {
 while (playerPos.y < ROWS - 1 && world[playerPos.y + 1][playerPos.x] === 0) {
 playerPos.y++;
 }
 }

 function mineBlock() {
 const tx = facing === 'left'? playerPos.x - 1: playerPos.x + 1;
 const ty = playerPos.y;

 if (tx < 0 || tx >= COLS || ty < 0 || ty >= ROWS) return;
 const blockId = world[ty][tx];
 if (blockId === 0 || blockId === 11) return; // can't mine air or bedrock

 // Add to inventory
 if (!inventory[blockId]) inventory[blockId] = 0;
 inventory[blockId]++;

 world[ty][tx] = 0;
 draw();
 buildSelector();
 }

 function placeBlock() {
 const tx = facing === 'left'? playerPos.x - 1: playerPos.x + 1;
 const ty = playerPos.y;

 if (tx < 0 || tx >= COLS || ty < 0 || ty >= ROWS) return;
 if (world[ty][tx]!== 0) return; // spot taken

 if (!inventory[selectedBlock] || inventory[selectedBlock] <= 0) return;

 world[ty][tx] = selectedBlock;
 inventory[selectedBlock]--;

 draw();
 buildSelector();
 }

 function onKey(e) {
 switch (e.key) {
 case 'ArrowLeft': case 'a': case 'A': movePlayer(-1, 0); break;
 case 'ArrowRight': case 'd': case 'D': movePlayer(1, 0); break;
 case 'ArrowUp': case 'w': case 'W': movePlayer(0, -1); break;
 case 'ArrowDown': case 's': case 'S': movePlayer(0, 1); break;
 case 'q': case 'Q': mineBlock(); break;
 case 'e': case 'E': placeBlock(); break;
 case '1': selectedBlock = PLACEABLE[0]; buildSelector(); break;
 case '2': selectedBlock = PLACEABLE[1]; buildSelector(); break;
 case '3': selectedBlock = PLACEABLE[2]; buildSelector(); break;
 case '4': selectedBlock = PLACEABLE[3]; buildSelector(); break;
 case '5': selectedBlock = PLACEABLE[4]; buildSelector(); break;
 case '6': selectedBlock = PLACEABLE[5]; buildSelector(); break;
 }
 }

 // Click to mine/place
 canvas.addEventListener('click', (e) => {
 const rect = canvas.getBoundingClientRect();
 const mx = Math.floor((e.clientX - rect.left) * (W / rect.width) / TILE);
 const my = Math.floor((e.clientY - rect.top) * (HH / rect.height) / TILE);

 if (mx < 0 || mx >= COLS || my < 0 || my >= ROWS) return;

 // Update facing
 if (mx < playerPos.x) facing = 'left';
 else if (mx > playerPos.x) facing = 'right';

 // If clicking on a block, mine it (if adjacent)
 const dist = Math.abs(mx - playerPos.x) + Math.abs(my - playerPos.y);
 if (dist <= 2) {
 if (world[my][mx]!== 0 && world[my][mx]!== 11) {
 if (!inventory[world[my][mx]]) inventory[world[my][mx]] = 0;
 inventory[world[my][mx]]++;
 world[my][mx] = 0;
 } else if (world[my][mx] === 0 && inventory[selectedBlock] > 0) {
 world[my][mx] = selectedBlock;
 inventory[selectedBlock]--;
 }
 }

 draw();
 buildSelector();
 });

 // Mobile controls
 document.addEventListener('keydown', onKey);

 const setupMobileBtn = (id, fn) => {
 const btn = document.getElementById(id);
 if (btn) {
 btn.addEventListener('click', fn);
 btn.addEventListener('touchstart', (e) => { e.preventDefault(); fn(); });
 }
 };

 setupMobileBtn('mc-up', () => movePlayer(0, -1));
 setupMobileBtn('mc-down', () => movePlayer(0, 1));
 setupMobileBtn('mc-left', () => movePlayer(-1, 0));
 setupMobileBtn('mc-right', () => movePlayer(1, 0));
 setupMobileBtn('mc-mine', mineBlock);
 setupMobileBtn('mc-place', placeBlock);

 // Init
 selectedBlock = PLACEABLE[0];
 inventory = {};
 facing = 'right';
 generateWorld();
 buildSelector();
 draw();

 gameScoreDisplay.textContent = '';

 gameCleanup = () => {
 document.removeEventListener('keydown', onKey);
 };
}

// ==================== 99 NIGHTS IN THE FOREST ====================
function initForest99() {
 gameTitle.textContent = '99 Nights';

 const canvas = document.createElement('canvas');
 canvas.width = 360;
 canvas.height = 360;
 canvas.style.cssText = 'display:block;margin:0 auto;border:2px solid #1B5E20;border-radius:12px;background:#0a0a0a;touch-action:none;';

 const startBtn = document.createElement('button');
 startBtn.textContent = 'Enter the Forest';
 startBtn.style.cssText = 'display:block;margin:10px auto;padding:12px 30px;font-size:1.1rem;background:linear-gradient(135deg,#1B5E20,#004D40);border:none;border-radius:8px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;color:#A5D6A7;';

 const dpad = document.createElement('div');
 dpad.style.cssText = 'display:grid;grid-template-columns:45px 45px 45px;grid-template-rows:45px 45px;gap:3px;justify-content:center;margin-top:8px;';
 dpad.innerHTML = `
 <div></div>
 <button id="f99-up"style="font-size:1.2rem;background:#0a1a0a;border:2px solid #2E7D32;border-radius:8px;color:#4CAF50;cursor:pointer;">UP</button>
 <div></div>
 <button id="f99-left"style="font-size:1.2rem;background:#0a1a0a;border:2px solid #2E7D32;border-radius:8px;color:#4CAF50;cursor:pointer;">LT</button>
 <button id="f99-action"style="font-size:0.8rem;background:#0a1a0a;border:2px solid #FF6F00;border-radius:8px;color:#FFA726;cursor:pointer;"></button>
 <button id="f99-right"style="font-size:1.2rem;background:#0a1a0a;border:2px solid #2E7D32;border-radius:8px;color:#4CAF50;cursor:pointer;">RT</button>
 <div></div>
 <button id="f99-down"style="font-size:1.2rem;background:#0a1a0a;border:2px solid #2E7D32;border-radius:8px;color:#4CAF50;cursor:pointer;">DN</button>
 <div></div>
 `;

 const info = document.createElement('div');
 info.style.cssText = 'text-align:center;color:#555;font-size:0.7rem;margin-top:6px;';
 info.textContent = 'WASD/Arrows: move | F: flashlight | Collect items, survive all nights!';

 gameArea.appendChild(canvas);
 gameArea.appendChild(startBtn);
 gameArea.appendChild(dpad);
 gameArea.appendChild(info);

 const ctx = canvas.getContext('2d');
 const W = canvas.width, H = canvas.height;
 const TILE = 24;
 const COLS = Math.floor(W / TILE);
 const ROWS = Math.floor(H / TILE);

 let world, player, ghosts, items, night, health, flashlight, flashlightOn;
 let running, frameId, nightTimer, nightInterval, collected, totalItems;
 let msgText, msgTimer;

 const TREE = 1;
 const BUSH = 2;
 const ROCK = 3;
 const ITEM_KEY = 4;
 const ITEM_BATTERY = 5;
 const ITEM_MEDKIT = 6;
 const EXIT = 7;

 function generateForest() {
 world = Array.from({length: ROWS}, () => Array(COLS).fill(0));

 // Border
 for (let x = 0; x < COLS; x++) { world[0][x] = TREE; world[ROWS-1][x] = TREE; }
 for (let y = 0; y < ROWS; y++) { world[y][0] = TREE; world[y][COLS-1] = TREE; }

 // Trees scattered
 for (let i = 0; i < 30 + night * 3; i++) {
 const x = 1 + Math.floor(Math.random() * (COLS - 2));
 const y = 1 + Math.floor(Math.random() * (ROWS - 2));
 if (world[y][x] === 0) world[y][x] = Math.random() < 0.7? TREE: (Math.random() < 0.5? BUSH: ROCK);
 }

 // Place items
 items = [];
 const numItems = 2 + Math.floor(night / 3);
 for (let i = 0; i < numItems; i++) {
 let x, y;
 do { x = 1 + Math.floor(Math.random() * (COLS - 2)); y = 1 + Math.floor(Math.random() * (ROWS - 2)); }
 while (world[y][x]!== 0);
 const type = Math.random() < 0.4? ITEM_KEY: (Math.random() < 0.5? ITEM_BATTERY: ITEM_MEDKIT);
 items.push({x, y, type, collected: false});
 }
 totalItems = items.filter(i => i.type === ITEM_KEY).length;

 // Place exit
 let ex, ey;
 do { ex = 1 + Math.floor(Math.random() * (COLS - 2)); ey = 1 + Math.floor(Math.random() * (ROWS - 2)); }
 while (world[ey][ex]!== 0);
 world[ey][ex] = EXIT;

 // Player spawn
 do {
 player.x = 1 + Math.floor(Math.random() * (COLS - 2));
 player.y = 1 + Math.floor(Math.random() * (ROWS - 2));
 } while (world[player.y][player.x]!== 0);

 // Ghosts
 ghosts = [];
 const numGhosts = Math.min(2 + Math.floor(night / 2), 8);
 for (let i = 0; i < numGhosts; i++) {
 let gx, gy;
 do { gx = 1 + Math.floor(Math.random() * (COLS - 2)); gy = 1 + Math.floor(Math.random() * (ROWS - 2)); }
 while (world[gy][gx]!== 0 || (Math.abs(gx - player.x) < 4 && Math.abs(gy - player.y) < 4));
 ghosts.push({x: gx, y: gy, moveTimer: 0, emoji: ['', '', '', '', '', '', '', ''][i % 8]});
 }

 collected = 0;
 }

 function showMsg(text) {
 msgText = text;
 msgTimer = 90;
 }

 function movePlayer(dx, dy) {
 if (!running) return;
 const nx = player.x + dx;
 const ny = player.y + dy;
 if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return;
 const tile = world[ny][nx];
 if (tile === TREE || tile === ROCK) return;

 if (tile === BUSH) {
 world[ny][nx] = 0; // break bush
 }

 if (tile === EXIT) {
 const keysNeeded = totalItems;
 const keysHave = items.filter(i => i.type === ITEM_KEY && i.collected).length;
 if (keysHave >= keysNeeded || keysNeeded === 0) {
 // Win this night!
 night++;
 flashlight = Math.min(100, flashlight + 20);
 showMsg('Night '+ (night - 1) + 'survived! Entering night '+ night + '...');
 generateForest();
 return;
 } else {
 showMsg('Need '+ (keysNeeded - keysHave) + 'more key(s)!');
 return;
 }
 }

 player.x = nx;
 player.y = ny;

 // Check item pickup
 for (const item of items) {
 if (!item.collected && item.x === nx && item.y === ny) {
 item.collected = true;
 if (item.type === ITEM_KEY) { collected++; showMsg('Got a key! ('+ collected + '/'+ totalItems +')'); }
 if (item.type === ITEM_BATTERY) { flashlight = Math.min(100, flashlight + 30); showMsg('Flashlight recharged!'); }
 if (item.type === ITEM_MEDKIT) { health = Math.min(100, health + 25); showMsg('Health restored!'); }
 }
 }

 // Check ghost collision
 for (const g of ghosts) {
 if (g.x === nx && g.y === ny) {
 health -= 20;
 showMsg('A ghost got you! -20 HP');
 // Push ghost away
 g.x = Math.max(1, Math.min(COLS - 2, g.x + (Math.random() < 0.5? 3: -3)));
 g.y = Math.max(1, Math.min(ROWS - 2, g.y + (Math.random() < 0.5? 3: -3)));
 }
 }

 if (health <= 0) {
 running = false;
 if (nightInterval) { clearInterval(nightInterval); nightInterval = null; }
 showGameOver('You didn\'t survive...', night - 1, 'forest99', resetGame);
 }
 }

 function moveGhosts() {
 for (const g of ghosts) {
 g.moveTimer--;
 if (g.moveTimer > 0) continue;
 g.moveTimer = 3 + Math.floor(Math.random() * 3);

 // Chase player
 let dx = 0, dy = 0;
 const distX = player.x - g.x;
 const distY = player.y - g.y;
 const dist = Math.abs(distX) + Math.abs(distY);

 // Flashlight scares them
 if (flashlightOn && dist < 5) {
 dx = distX > 0? -1: 1;
 dy = distY > 0? -1: 1;
 } else if (dist < 8) {
 if (Math.random() < 0.6) {
 dx = distX > 0? 1: (distX < 0? -1: 0);
 dy = distY > 0? 1: (distY < 0? -1: 0);
 } else {
 dx = Math.floor(Math.random() * 3) - 1;
 dy = Math.floor(Math.random() * 3) - 1;
 }
 } else {
 dx = Math.floor(Math.random() * 3) - 1;
 dy = Math.floor(Math.random() * 3) - 1;
 }

 const nx = g.x + dx;
 const ny = g.y + dy;
 if (nx > 0 && nx < COLS - 1 && ny > 0 && ny < ROWS - 1 && world[ny][nx]!== TREE && world[ny][nx]!== ROCK) {
 g.x = nx;
 g.y = ny;
 }

 // Ghost hits player
 if (g.x === player.x && g.y === player.y) {
 health -= 15;
 showMsg(g.emoji + 'attacked you! -15 HP');
 g.x = Math.max(1, Math.min(COLS - 2, g.x + (Math.random() < 0.5? 3: -3)));
 }

 if (health <= 0) {
 running = false;
 if (nightInterval) { clearInterval(nightInterval); nightInterval = null; }
 showGameOver('You didn\'t survive...', night - 1, 'forest99', resetGame);
 }
 }
 }

 function draw() {
 ctx.fillStyle = '#050505';
 ctx.fillRect(0, 0, W, H);

 const viewDist = flashlightOn? 6: 3;

 for (let y = 0; y < ROWS; y++) {
 for (let x = 0; x < COLS; x++) {
 const dist = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
 if (dist > viewDist + 1) continue;

 const alpha = Math.max(0, 1 - dist / (viewDist + 1));
 const px = x * TILE;
 const py = y * TILE;

 ctx.globalAlpha = alpha;

 // Ground
 ctx.fillStyle = '#1a2e1a';
 ctx.fillRect(px, py, TILE, TILE);

 const tile = world[y][x];
 if (tile === TREE) {
 ctx.font = `${TILE - 4}px serif`;
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('', px + TILE / 2, py + TILE / 2);
 } else if (tile === BUSH) {
 ctx.font = `${TILE - 6}px serif`;
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('', px + TILE / 2, py + TILE / 2);
 } else if (tile === ROCK) {
 ctx.font = `${TILE - 4}px serif`;
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('', px + TILE / 2, py + TILE / 2);
 } else if (tile === EXIT) {
 ctx.font = `${TILE - 4}px serif`;
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('', px + TILE / 2, py + TILE / 2);
 }
 }
 }

 // Items
 for (const item of items) {
 if (item.collected) continue;
 const dist = Math.sqrt((item.x - player.x) ** 2 + (item.y - player.y) ** 2);
 if (dist > viewDist + 1) continue;
 ctx.globalAlpha = Math.max(0, 1 - dist / (viewDist + 1));
 const emoji = item.type === ITEM_KEY? '': (item.type === ITEM_BATTERY? '': '');
 ctx.font = `${TILE - 6}px serif`;
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText(emoji, item.x * TILE + TILE / 2, item.y * TILE + TILE / 2);
 }

 // Ghosts
 for (const g of ghosts) {
 const dist = Math.sqrt((g.x - player.x) ** 2 + (g.y - player.y) ** 2);
 if (dist > viewDist + 1) continue;
 ctx.globalAlpha = Math.max(0.2, 1 - dist / (viewDist + 1));
 ctx.font = `${TILE - 2}px serif`;
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText(g.emoji, g.x * TILE + TILE / 2, g.y * TILE + TILE / 2);
 }

 // Player
 ctx.globalAlpha = 1;
 ctx.font = `${TILE}px serif`;
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('P', player.x * TILE + TILE / 2, player.y * TILE + TILE / 2);

 // Flashlight glow
 if (flashlightOn) {
 const grad = ctx.createRadialGradient(
 player.x * TILE + TILE / 2, player.y * TILE + TILE / 2, 10,
 player.x * TILE + TILE / 2, player.y * TILE + TILE / 2, viewDist * TILE
);
 grad.addColorStop(0, 'rgba(255,200,50,0.1)');
 grad.addColorStop(1, 'rgba(0,0,0,0)');
 ctx.fillStyle = grad;
 ctx.fillRect(0, 0, W, H);
 }

 // Vignette
 const vig = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W * 0.7);
 vig.addColorStop(0, 'rgba(0,0,0,0)');
 vig.addColorStop(1, 'rgba(0,0,0,0.7)');
 ctx.fillStyle = vig;
 ctx.fillRect(0, 0, W, H);

 // HUD
 ctx.globalAlpha = 1;
 ctx.fillStyle = 'rgba(0,0,0,0.7)';
 ctx.fillRect(0, 0, W, 28);

 ctx.font = 'bold 11px Orbitron, sans-serif';
 ctx.textBaseline = 'top';
 ctx.textAlign = 'left';
 ctx.fillStyle = '#b44aff';
 ctx.fillText('Night '+ night, 6, 7);

 // Health bar
 ctx.fillStyle = '#333';
 ctx.fillRect(90, 8, 60, 12);
 ctx.fillStyle = health > 50? '#4CAF50': (health > 25? '#FF9800': '#f44336');
 ctx.fillRect(90, 8, 60 * (health / 100), 12);
 ctx.strokeStyle = '#555';
 ctx.strokeRect(90, 8, 60, 12);
 ctx.fillStyle = '#fff';
 ctx.font = '9px Orbitron';
 ctx.textAlign = 'center';
 ctx.fillText('[heart]'+ health, 120, 9);

 // Flashlight bar
 ctx.fillStyle = '#333';
 ctx.fillRect(165, 8, 50, 12);
 ctx.fillStyle = flashlight > 30? '#FFC107': '#FF5722';
 ctx.fillRect(165, 8, 50 * (flashlight / 100), 12);
 ctx.strokeStyle = '#555';
 ctx.strokeRect(165, 8, 50, 12);
 ctx.fillStyle = '#fff';
 ctx.font = '9px Orbitron';
 ctx.fillText(''+ Math.round(flashlight), 190, 9);

 // Keys
 ctx.textAlign = 'right';
 ctx.fillStyle = '#FFD700';
 ctx.font = 'bold 11px Orbitron';
 ctx.fillText(''+ collected + '/'+ totalItems, W - 6, 7);

 // Message
 if (msgTimer > 0) {
 msgTimer--;
 ctx.globalAlpha = Math.min(1, msgTimer / 30);
 ctx.fillStyle = 'rgba(0,0,0,0.8)';
 ctx.fillRect(20, H - 50, W - 40, 30);
 ctx.fillStyle = '#fff';
 ctx.font = '12px Rajdhani, sans-serif';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText(msgText, W / 2, H - 35);
 ctx.globalAlpha = 1;
 }
 }

 function gameLoop() {
 if (!running) return;

 // Drain flashlight
 if (flashlightOn) {
 flashlight -= 0.15;
 if (flashlight <= 0) {
 flashlight = 0;
 flashlightOn = false;
 showMsg('Flashlight died!');
 }
 }

 moveGhosts();
 draw();
 frameId = requestAnimationFrame(gameLoop);
 }

 function resetGame() {
 night = 1;
 health = 100;
 flashlight = 80;
 flashlightOn = true;
 running = true;
 msgText = '';
 msgTimer = 0;
 player = {x: 5, y: 5};
 generateForest();
 showMsg('Night 1... Find the keys and reach the door!');
 frameId = requestAnimationFrame(gameLoop);
 }

 function onKey(e) {
 switch (e.key) {
 case 'ArrowUp': case 'w': case 'W': movePlayer(0, -1); break;
 case 'ArrowDown': case 's': case 'S': movePlayer(0, 1); break;
 case 'ArrowLeft': case 'a': case 'A': movePlayer(-1, 0); break;
 case 'ArrowRight': case 'd': case 'D': movePlayer(1, 0); break;
 case 'f': case 'F':
 if (flashlight > 0) { flashlightOn =!flashlightOn; showMsg(flashlightOn? 'Light ON': 'Light OFF'); }
 break;
 }
 }

 document.addEventListener('keydown', onKey);

 const setupBtn = (id, fn) => {
 const btn = document.getElementById(id);
 if (btn) {
 btn.addEventListener('click', fn);
 btn.addEventListener('touchstart', (e) => { e.preventDefault(); fn(); });
 }
 };

 setupBtn('f99-up', () => movePlayer(0, -1));
 setupBtn('f99-down', () => movePlayer(0, 1));
 setupBtn('f99-left', () => movePlayer(-1, 0));
 setupBtn('f99-right', () => movePlayer(1, 0));
 setupBtn('f99-action', () => {
 if (flashlight > 0) { flashlightOn =!flashlightOn; showMsg(flashlightOn? 'Light ON': 'Light OFF'); }
 });

 startBtn.onclick = () => {
 resetGame();
 startBtn.style.display = 'none';
 };

 gameScoreDisplay.textContent = 'Best: Night '+ getHigh('forest99');

 // Initial draw
 ctx.fillStyle = '#050505';
 ctx.fillRect(0, 0, W, H);
 ctx.font = 'bold 16px Orbitron, sans-serif';
 ctx.fillStyle = '#2E7D32';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('99 Nights', W / 2, H / 2 - 30);
 ctx.font = '11px Rajdhani, sans-serif';
 ctx.fillStyle = '#666';
 ctx.fillText('Survive the haunted forest...', W / 2, H / 2);
 ctx.fillText('Find keys Avoid ghosts Reach the exit', W / 2, H / 2 + 20);

 gameCleanup = () => {
 running = false;
 cancelAnimationFrame(frameId);
 document.removeEventListener('keydown', onKey);
 };
}

// ==================== BROOKHAVEN ====================
function initBrookhaven() {
 gameTitle.textContent = 'Brookhaven';

 const TILE = 20;
 const VIEW_W = 18;
 const VIEW_H = 16;
 const W = VIEW_W * TILE;
 const HH = VIEW_H * TILE;

 const canvas = document.createElement('canvas');
 canvas.width = W;
 canvas.height = HH;
 canvas.style.cssText = 'display:block;margin:0 auto;border:2px solid #00d4ff;border-radius:8px;touch-action:none;';

 const statusBar = document.createElement('div');
 statusBar.id = 'bh-status';
 statusBar.style.cssText = 'text-align:center;color:#aaa;font-size:0.8rem;margin:6px auto;max-width:370px;font-family:Rajdhani,sans-serif;';

 const dpad = document.createElement('div');
 dpad.style.cssText = 'display:grid;grid-template-columns:42px 42px 42px;grid-template-rows:42px 42px;gap:3px;justify-content:center;margin-top:8px;';
 dpad.innerHTML = `
 <div></div>
 <button id="bh-up"style="font-size:1.1rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:8px;color:#00d4ff;cursor:pointer;">UP</button>
 <div></div>
 <button id="bh-left"style="font-size:1.1rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:8px;color:#00d4ff;cursor:pointer;">LT</button>
 <button id="bh-action"style="font-size:0.7rem;background:#1a1a2e;border:2px solid #ffaa00;border-radius:8px;color:#ffaa00;cursor:pointer;">Enter</button>
 <button id="bh-right"style="font-size:1.1rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:8px;color:#00d4ff;cursor:pointer;">RT</button>
 <div></div>
 <button id="bh-down"style="font-size:1.1rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:8px;color:#00d4ff;cursor:pointer;">DN</button>
 <div></div>
 `;

 const info = document.createElement('div');
 info.style.cssText = 'text-align:center;color:#555;font-size:0.7rem;margin-top:4px;';
 info.textContent = 'WASD: move | E: enter buildings/interact | Explore the town!';

 gameArea.appendChild(canvas);
 gameArea.appendChild(statusBar);
 gameArea.appendChild(dpad);
 gameArea.appendChild(info);

 const ctx = canvas.getContext('2d');

 const GRASS = 0, ROAD = 1, SIDE = 2, WATER = 3, TTREE = 4;
 const BH1 = 10, BH2 = 11, BH3 = 12, BSHOP = 13, BPOLICE = 14, BHOSPITAL = 15, BSCHOOL = 16;
 const BENCH = 17, BCAR = 18, BFLOWER = 20;

 const MAP_W = 40, MAP_H = 30;
 const map = Array.from({length: MAP_H}, () => Array(MAP_W).fill(GRASS));
 const buildings = [];

 function buildTown() {
 for (let x = 0; x < MAP_W; x++) {
 for (let dy = 0; dy < 2; dy++) { map[8+dy][x] = ROAD; map[18+dy][x] = ROAD; }
 }
 for (let y = 0; y < MAP_H; y++) {
 for (let dx = 0; dx < 2; dx++) { map[y][12+dx] = ROAD; map[y][26+dx] = ROAD; }
 }
 for (let x = 0; x < MAP_W; x++) {
 [7,10,17,20].forEach(r => { if (map[r][x]!== ROAD) map[r][x] = SIDE; });
 }
 for (let y = 0; y < MAP_H; y++) {
 [11,14,25,28].forEach(c => { if (map[y][c]!== ROAD && map[y][c]!== SIDE) map[y][c] = SIDE; });
 }

 function placeB(x,y,type,style) {
 for (let dy=0;dy<2;dy++) for (let dx=0;dx<3;dx++) if(y+dy<MAP_H&&x+dx<MAP_W) map[y+dy][x+dx]=type;
 const names = {[BH1]:'House',[BH2]:'House',[BH3]:'House',[BSHOP]:'Shop',[BPOLICE]:'Police Station',[BHOSPITAL]:'Hospital',[BSCHOOL]:'School'};
 buildings.push({x,y,w:3,h:2,type,style,name:(names[type]||'Building')});
 }

 placeB(2,2,BH1, 'blue'); placeB(6,2,BH2, 'red'); placeB(2,5,BH3, 'yellow'); placeB(6,5,BH1, 'green');
 placeB(15,2,BSHOP, 'shop'); placeB(19,2,BSHOP, 'shop'); placeB(15,5,BPOLICE, 'police'); placeB(19,5,BHOSPITAL, 'hospital');
 placeB(2,12,BSCHOOL, 'school'); placeB(6,12,BSCHOOL, 'school');
 placeB(29,2,BH1, 'purple'); placeB(33,2,BH2, 'orange'); placeB(29,12,BH3, 'pink'); placeB(33,12,BH1, 'cyan');
 placeB(29,22,BH2, 'white'); placeB(33,22,BH3, 'lime');

 for (let x=15;x<24;x++) for (let y=22;y<28;y++) {
 if (Math.random()<0.15) map[y][x]=TTREE;
 else if (Math.random()<0.1) map[y][x]=BFLOWER;
 else if (Math.random()<0.05) map[y][x]=BENCH;
 }

 for (let x=2;x<9;x++) for (let y=22;y<27;y++) {
 const dx=x-5.5, dy=y-24.5;
 if(dx*dx/12+dy*dy/6<1) map[y][x]=WATER;
 }

 for (let x=0;x<MAP_W;x++){map[0][x]=TTREE;map[MAP_H-1][x]=TTREE;}
 for (let y=0;y<MAP_H;y++){map[y][0]=TTREE;map[y][MAP_W-1]=TTREE;}
 for (let y=1;y<MAP_H-1;y++) for(let x=1;x<MAP_W-1;x++){
 if(map[y][x]===GRASS&&Math.random()<0.04) map[y][x]=TTREE;
 if(map[y][x]===GRASS&&Math.random()<0.03) map[y][x]=BFLOWER;
 }
 map[8][5]=BCAR; map[9][16]=BCAR; map[18][30]=BCAR; map[19][22]=BCAR;
 }

 let npcs = [
 {emoji:'',name:'Sarah',x:4,y:7,sayings:['Hi! Welcome to Brookhaven!', 'Nice weather!', 'Visit the park!'],moveTimer:0},
 {emoji:'',name:'Officer Dan',x:16,y:7,sayings:['Stay safe, citizen!', 'No running!', 'Peaceful day.'],moveTimer:0},
 {emoji:'',name:'Dr. Kim',x:20,y:7,sayings:['Stay healthy!', 'Drink water!', 'An apple a day!'],moveTimer:0},
 {emoji:'',name:'Mr. Lee',x:3,y:14,sayings:['School at 8 AM!', 'Homework done?', 'Reading is fun!'],moveTimer:0},
 {emoji:'',name:'Chef Marco',x:16,y:4,sayings:['Special: pizza!', 'Want a cookie?', 'Come eat!'],moveTimer:0},
 {emoji:'',name:'Emma',x:30,y:7,sayings:['Wanna play?', 'I love this town!', 'Be friends!'],moveTimer:0},
 {emoji:'',name:'Grandpa Joe',x:6,y:24,sayings:['Lake is beautiful...', 'All fields once.', 'Catch fish?'],moveTimer:0},
 {emoji:'',name:'Buddy',x:18,y:25,sayings:['Woof!', '*wags tail*', 'Woof woof! '],moveTimer:0},
];

 let player, money, currentLocation, msgText, msgTimer, timeOfDay, dayTimer, bhInventory;

 function resetGame() {
 buildTown();
 player={x:10,y:10,emoji:''}; money=100; currentLocation= 'Outside';
 msgText= ''; msgTimer=0; timeOfDay=0; dayTimer=0;
 bhInventory=['House Key'];
 draw();
 }

 function showMsg(t,d){msgText=t;msgTimer=d||120;}

 function movePlayer(dx,dy){
 const nx=player.x+dx, ny=player.y+dy;
 if(nx<0||nx>=MAP_W||ny<0||ny>=MAP_H) return;
 const tile=map[ny][nx];
 if(tile===TTREE||tile===WATER) return;
 if(tile>=10&&tile<=16){
 const b=buildings.find(b=>nx>=b.x&&nx<b.x+b.w&&ny>=b.y&&ny<b.y+b.h);
 if(b) showMsg(''+b.name+'- Press E to enter!');
 return;
 }
 player.x=nx; player.y=ny;
 currentLocation=tile===ROAD?'Road':(tile===SIDE?'Sidewalk':'Outside');
 for(const npc of npcs){
 if(Math.abs(npc.x-player.x)<=1&&Math.abs(npc.y-player.y)<=1)
 showMsg(npc.emoji+''+npc.name+': "'+npc.sayings[Math.floor(Math.random()*npc.sayings.length)]+'"');
 }
 draw();
 }

 function interact(){
 for(const b of buildings){
 if(Math.abs(player.x-(b.x+1))+Math.abs(player.y-(b.y+2))<=2){enterBuilding(b);return;}
 }
 for(const npc of npcs){
 if(Math.abs(npc.x-player.x)<=1&&Math.abs(npc.y-player.y)<=1){
 showMsg(npc.emoji+''+npc.name+': "'+npc.sayings[Math.floor(Math.random()*npc.sayings.length)]+'"');return;
 }
 }
 if(map[player.y][player.x]===BCAR){showMsg('Vroom vroom!');return;}
 showMsg('Nothing here.');
 }

 function enterBuilding(b){
 if(b.type===BSHOP){
 if(money>=10){money-=10;const items=['Pizza', 'Ice Cream', 'Teddy Bear', 'Toy Phone', 'Gameboy', 'Sneakers'];
 const item=items[Math.floor(Math.random()*items.length)];bhInventory.push(item);
 showMsg('Bought '+item+'for $10! ($'+money+'left)',150);
 }else showMsg('Not enough! You have $'+money);
 }else if(b.type===BPOLICE){money+=20;showMsg('"Thanks for visiting! Here\'s $20!"$');}
 else if(b.type===BHOSPITAL){showMsg('"Have a lollipop! "');bhInventory.push('Lollipop');}
 else if(b.type===BSCHOOL){
 const facts=['The sun is a star! [star]', 'Octopuses have 3 hearts!', 'Honey never spoils!', 'Bananas are berries!', 'Lightning is 5x hotter than the sun! '];
 showMsg('Learned: '+facts[Math.floor(Math.random()*facts.length)],150);
 }else showMsg('Visited '+b.name+'! Cozy inside.');
 draw();
 }

 function moveNPCs(){
 for(const npc of npcs){
 npc.moveTimer--;if(npc.moveTimer>0) continue;
 npc.moveTimer=15+Math.floor(Math.random()*20);
 const dx=Math.floor(Math.random()*3)-1, dy=Math.floor(Math.random()*3)-1;
 const nx=npc.x+dx, ny=npc.y+dy;
 if(nx>0&&nx<MAP_W-1&&ny>0&&ny<MAP_H-1){
 const t=map[ny][nx]; if(t===GRASS||t===ROAD||t===SIDE||t===BFLOWER){npc.x=nx;npc.y=ny;}
 }
 }
 }

 const bldColors={blue:'#1565C0',red:'#C62828',yellow:'#F9A825',green:'#2E7D32',purple:'#6A1B9A',orange:'#E65100',pink:'#AD1457',cyan:'#00838F',white:'#BDBDBD',lime:'#689F38',shop:'#FF6F00',police:'#1565C0',hospital:'#C62828',school:'#6A1B9A'};

 function draw(){
 const camX=Math.max(0,Math.min(MAP_W-VIEW_W,player.x-Math.floor(VIEW_W/2)));
 const camY=Math.max(0,Math.min(MAP_H-VIEW_H,player.y-Math.floor(VIEW_H/2)));
 dayTimer++;if(dayTimer>600){dayTimer=0;timeOfDay=(timeOfDay+1)%4;}
 const timeNames=['Morning', 'Afternoon', 'Evening', 'Night'];
 const skyColors=['#87CEEB', '#64B5F6', '#FF8A65', '#1a1a3e'];
 ctx.fillStyle=skyColors[timeOfDay]; ctx.fillRect(0,0,W,HH);

 for(let vy=0;vy<VIEW_H;vy++) for(let vx=0;vx<VIEW_W;vx++){
 const mx=camX+vx,my=camY+vy; if(mx>=MAP_W||my>=MAP_H) continue;
 const px=vx*TILE,py=vy*TILE,tile=map[my][mx];
 const tColors={[GRASS]:'#4CAF50',[ROAD]:'#616161',[SIDE]:'#9E9E9E',[WATER]:'#1565C0',[TTREE]:'#4CAF50',[BFLOWER]:'#4CAF50',[BENCH]:'#795548',[BCAR]:'#616161'};
 ctx.fillStyle=tColors[tile]||'#4CAF50';
 if(tile>=10&&tile<=16){const b=buildings.find(b=>mx>=b.x&&mx<b.x+b.w&&my>=b.y&&my<b.y+b.h);ctx.fillStyle=b?(bldColors[b.style]||'#888'):'#888';}
 ctx.fillRect(px,py,TILE,TILE);

 if(tile===TTREE){ctx.fillStyle= '#1B5E20';ctx.beginPath();ctx.moveTo(px+TILE/2,py+2);ctx.lineTo(px+2,py+TILE-2);ctx.lineTo(px+TILE-2,py+TILE-2);ctx.fill();ctx.fillStyle= '#5D4037';ctx.fillRect(px+TILE/2-2,py+TILE-5,4,5);}
 else if(tile===BFLOWER){ctx.fillStyle=['#E91E63', '#FF9800', '#9C27B0', '#FFEB3B'][(mx+my*7)%4];ctx.beginPath();ctx.arc(px+TILE/2,py+TILE/2,4,0,Math.PI*2);ctx.fill();}
 else if(tile===WATER){ctx.fillStyle= 'rgba(255,255,255,0.1)';ctx.fillRect(px+2,py+TILE/2,TILE-4,2);}
 else if(tile===ROAD){ctx.fillStyle= '#FFD54F';if(my===8||my===18) ctx.fillRect(px+TILE/2-1,py,2,TILE);if(mx===12||mx===26) ctx.fillRect(px,py+TILE/2-1,TILE,2);}
 else if(tile===BCAR){ctx.fillStyle= '#F44336';ctx.fillRect(px+2,py+4,TILE-4,TILE-8);ctx.fillStyle= '#90CAF9';ctx.fillRect(px+4,py+5,TILE-8,5);}
 else if(tile>=10&&tile<=16){ctx.fillStyle=timeOfDay===3?'#FFEB3B':'#90CAF9';ctx.fillRect(px+5,py+6,5,5);ctx.fillRect(px+TILE-10,py+6,5,5);
 const b=buildings.find(b=>mx===b.x+1&&my===b.y+1);if(b){ctx.fillStyle= '#5D4037';ctx.fillRect(px+TILE/2-3,py+TILE-8,6,8);}}
 }

 for(const npc of npcs){const sx=(npc.x-camX)*TILE,sy=(npc.y-camY)*TILE;if(sx<-TILE||sx>W||sy<-TILE||sy>HH) continue;ctx.font=`${TILE-2}px serif`;ctx.textAlign= 'center';ctx.textBaseline= 'middle';ctx.fillText(npc.emoji,sx+TILE/2,sy+TILE/2);}
 const ppx=(player.x-camX)*TILE,ppy=(player.y-camY)*TILE;
 ctx.font=`${TILE}px serif`;ctx.textAlign= 'center';ctx.textBaseline= 'middle';ctx.fillText(player.emoji,ppx+TILE/2,ppy+TILE/2);

 if(timeOfDay===3){ctx.fillStyle= 'rgba(0,0,20,0.4)';ctx.fillRect(0,0,W,HH);}
 else if(timeOfDay===2){ctx.fillStyle= 'rgba(255,100,0,0.1)';ctx.fillRect(0,0,W,HH);}

 ctx.fillStyle= 'rgba(0,0,0,0.6)';ctx.fillRect(0,0,W,22);
 ctx.font= 'bold 10px Orbitron, sans-serif';ctx.textBaseline= 'top';
 ctx.textAlign= 'left';ctx.fillStyle= '#4CAF50';ctx.fillText(timeNames[timeOfDay],4,5);
 ctx.textAlign= 'center';ctx.fillStyle= '#ffaa00';ctx.fillText('$$'+money,W/2,5);
 ctx.textAlign= 'right';ctx.fillStyle= '#00d4ff';ctx.fillText(''+bhInventory.length,W-4,5);

 if(msgTimer>0){msgTimer--;ctx.globalAlpha=Math.min(1,msgTimer/30);ctx.fillStyle= 'rgba(0,0,0,0.85)';ctx.fillRect(10,HH-45,W-20,32);ctx.fillStyle= '#fff';ctx.font= '11px Rajdhani, sans-serif';ctx.textAlign= 'center';ctx.textBaseline= 'middle';ctx.fillText(msgText,W/2,HH-29);ctx.globalAlpha=1;}

 const st=document.getElementById('bh-status');
 if(st) st.textContent= ''+currentLocation+'| '+bhInventory.join(',');
 }

 let frameId;
 function gameLoop(){moveNPCs();draw();frameId=requestAnimationFrame(gameLoop);}

 function onKey(e){
 switch(e.key){
 case 'ArrowUp':case 'w':case 'W':movePlayer(0,-1);break;
 case 'ArrowDown':case 's':case 'S':movePlayer(0,1);break;
 case 'ArrowLeft':case 'a':case 'A':movePlayer(-1,0);break;
 case 'ArrowRight':case 'd':case 'D':movePlayer(1,0);break;
 case 'e':case 'E':interact();break;
 }
 }
 document.addEventListener('keydown',onKey);

 const setupBtn=(id,fn)=>{const b=document.getElementById(id);if(b){b.addEventListener('click',fn);b.addEventListener('touchstart',(e)=>{e.preventDefault();fn();});}};
 setupBtn('bh-up',()=>movePlayer(0,-1));setupBtn('bh-down',()=>movePlayer(0,1));
 setupBtn('bh-left',()=>movePlayer(-1,0));setupBtn('bh-right',()=>movePlayer(1,0));
 setupBtn('bh-action',interact);

 resetGame();showMsg('Welcome to Brookhaven! Explore the town!',150);
 frameId=requestAnimationFrame(gameLoop);
 gameScoreDisplay.textContent= '';

 gameCleanup=()=>{cancelAnimationFrame(frameId);document.removeEventListener('keydown',onKey);};
}

// ==================== GORILLA TAG ====================
function initGorillaTag() {
 gameTitle.textContent = 'Gorilla Tag';

 const canvas = document.createElement('canvas');
 canvas.width = 380;
 canvas.height = 380;
 canvas.style.cssText = 'display:block;margin:0 auto;border:2px solid #4CAF50;border-radius:12px;background:#1a2e1a;touch-action:none;';

 const startBtn = document.createElement('button');
 startBtn.textContent = 'Start!';
 startBtn.style.cssText = 'display:block;margin:10px auto;padding:12px 30px;font-size:1.1rem;background:linear-gradient(135deg,#4CAF50,#8BC34A);border:none;border-radius:8px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;color:#fff;';

 const dpad = document.createElement('div');
 dpad.style.cssText = 'display:grid;grid-template-columns:45px 45px 45px;grid-template-rows:45px 45px;gap:3px;justify-content:center;margin-top:8px;';
 dpad.innerHTML = `
 <div></div>
 <button id="gt-up"style="font-size:1.2rem;background:#1a2e1a;border:2px solid #4CAF50;border-radius:8px;color:#4CAF50;cursor:pointer;">UP</button>
 <div></div>
 <button id="gt-left"style="font-size:1.2rem;background:#1a2e1a;border:2px solid #4CAF50;border-radius:8px;color:#4CAF50;cursor:pointer;">LT</button>
 <button id="gt-jump"style="font-size:0.8rem;background:#1a2e1a;border:2px solid #FF9800;border-radius:8px;color:#FF9800;cursor:pointer;">Jump</button>
 <button id="gt-right"style="font-size:1.2rem;background:#1a2e1a;border:2px solid #4CAF50;border-radius:8px;color:#4CAF50;cursor:pointer;">RT</button>
 <div></div>
 <button id="gt-down"style="font-size:1.2rem;background:#1a2e1a;border:2px solid #4CAF50;border-radius:8px;color:#4CAF50;cursor:pointer;">DN</button>
 <div></div>
 `;

 const info = document.createElement('div');
 info.style.cssText = 'text-align:center;color:#555;font-size:0.7rem;margin-top:6px;';
 info.textContent = 'WASD: move | SPACE: jump/climb | Tag the gorillas or escape!';

 gameArea.appendChild(canvas);
 gameArea.appendChild(startBtn);
 gameArea.appendChild(dpad);
 gameArea.appendChild(info);

 const ctx = canvas.getContext('2d');
 const W = canvas.width, H = canvas.height;
 const gravity = 0.4;
 const groundY = H - 40;

 // Platforms / trees to climb
 let platforms, player, gorillas, tagged, score, timer, running, frameId, timerInterval;
 let keys = {left:false, right:false, up:false, down:false, jump:false};
 let isIT = true; // player is "it"first
 let round = 0;

 function generateLevel() {
 platforms = [
 {x:0, y:groundY, w:W, h:H-groundY, color:'#2E7D32'}, // ground
];
 // Trees (vertical platforms to climb)
 const treePositions = [60, 130, 200, 270, 340];
 for (const tx of treePositions) {
 // Trunk
 platforms.push({x:tx-8, y:groundY-80-Math.random()*40, w:16, h:80+Math.random()*40, color:'#5D4037', isTree:true});
 // Branches
 platforms.push({x:tx-30, y:groundY-70-Math.random()*30, w:60, h:10, color:'#4CAF50'});
 if (Math.random()>0.4) platforms.push({x:tx-25, y:groundY-120-Math.random()*20, w:50, h:10, color:'#388E3C'});
 }
 // Floating platforms
 for (let i=0; i<5; i++) {
 platforms.push({x:30+Math.random()*(W-100), y:100+Math.random()*100, w:50+Math.random()*30, h:10, color:'#795548'});
 }
 // High platform
 platforms.push({x:W/2-40, y:50, w:80, h:10, color:'#FF9800'});
 }

 function spawnGorillas() {
 gorillas = [];
 const num = Math.min(3 + round, 8);
 const colors = ['#FF5722', '#E91E63', '#9C27B0', '#3F51B5', '#00BCD4', '#FFEB3B', '#FF9800', '#795548'];
 for (let i=0; i<num; i++) {
 gorillas.push({
 x: 30 + Math.random()*(W-60),
 y: groundY - 25,
 vx: 0, vy: 0,
 w: 22, h: 22,
 grounded: false,
 color: colors[i%colors.length],
 tagged: false,
 moveTimer: 0,
 jumpTimer: 0,
 dir: Math.random()<0.5?-1:1
 });
 }
 tagged = 0;
 }

 function reset() {
 round = 0;
 score = 0;
 running = false;
 }

 function startRound() {
 generateLevel();
 spawnGorillas();
 player = {x:W/2, y:groundY-25, vx:0, vy:0, w:22, h:22, grounded:false};
 timer = 30 + round*5;
 tagged = 0;
 isIT = round%2===0; // alternate who's it
 running = true;

 if(timerInterval) clearInterval(timerInterval);
 timerInterval = setInterval(()=>{
 if(!running) return;
 timer--;
 if(timer<=0){
 clearInterval(timerInterval); timerInterval=null;
 running=false;
 if(isIT) {
 showGameOver('Time\'s up! Tagged '+tagged+'/'+gorillas.length, score, 'gorillatag', ()=>{reset();});
 } else {
 score += 100; // survived!
 round++;
 startRound();
 }
 }
 },1000);

 startBtn.textContent = isIT? 'You\'re IT! Tag them!': 'RUN! Don\'t get tagged!';
 }

 function resolveCollisions(obj) {
 obj.grounded = false;
 for (const p of platforms) {
 if (p.isTree) {
 // Tree climbing: can grab sides
 if (obj.x+obj.w>p.x && obj.x<p.x+p.w && obj.y+obj.h>p.y && obj.y<p.y+p.h) {
 if (keys.up || obj.climbIntent) {
 obj.vy = -2.5;
 obj.grounded = true;
 }
 }
 continue;
 }
 // Normal platform: land on top
 if (obj.x+obj.w > p.x && obj.x < p.x+p.w) {
 if (obj.vy >= 0 && obj.y+obj.h >= p.y && obj.y+obj.h <= p.y+p.h+obj.vy+2) {
 obj.y = p.y - obj.h;
 obj.vy = 0;
 obj.grounded = true;
 }
 }
 }
 }

 function step() {
 if (!running) return;

 // Player physics
 if (keys.left) player.vx = -4;
 else if (keys.right) player.vx = 4;
 else player.vx *= 0.8;

 if (keys.jump && player.grounded) {
 player.vy = -9;
 player.grounded = false;
 }

 player.vy += gravity;
 player.x += player.vx;
 player.y += player.vy;

 // Boundaries
 if (player.x<0) {player.x=0;player.vx=0;}
 if (player.x+player.w>W) {player.x=W-player.w;player.vx=0;}
 if (player.y>H+50) {player.y=groundY-50;player.vy=0;} // respawn if fall off

 resolveCollisions(player);

 // Gorilla AI
 for (const g of gorillas) {
 if (g.tagged) continue;

 g.moveTimer--;
 g.jumpTimer--;

 const dx = player.x - g.x;
 const dy = player.y - g.y;
 const dist = Math.sqrt(dx*dx+dy*dy);

 if (isIT) {
 // Gorillas RUN AWAY
 if (dist < 150) {
 g.vx = dx > 0? -3: 3;
 if (g.jumpTimer <= 0 && g.grounded && Math.random()<0.15) {
 g.vy = -8 - Math.random()*3;
 g.grounded = false;
 g.jumpTimer = 20;
 }
 } else if (g.moveTimer <= 0) {
 g.dir = Math.random()<0.5?-1:1;
 g.vx = g.dir * (1+Math.random()*2);
 g.moveTimer = 20+Math.floor(Math.random()*30);
 if (g.grounded && Math.random()<0.2) {
 g.vy = -7;
 g.grounded = false;
 }
 }
 } else {
 // Gorillas CHASE player
 if (dist < 250) {
 g.vx = dx > 0? 2.5: -2.5;
 if (g.jumpTimer<=0 && g.grounded && (dy<-20 || Math.random()<0.1)) {
 g.vy = -8;
 g.grounded = false;
 g.jumpTimer = 15;
 }
 } else if (g.moveTimer<=0) {
 g.vx = (Math.random()-0.5)*3;
 g.moveTimer = 30;
 }
 }

 g.vy += gravity;
 g.x += g.vx;
 g.y += g.vy;
 g.vx *= 0.9;

 if(g.x<0){g.x=0;g.vx*=-1;}
 if(g.x+g.w>W){g.x=W-g.w;g.vx*=-1;}
 if(g.y>H+50){g.y=groundY-50;g.vy=0;}

 g.climbIntent = isIT? (dist<100): true;
 resolveCollisions(g);

 // Tag check
 if (Math.abs(player.x-g.x)<(player.w+g.w)/2+5 && Math.abs(player.y-g.y)<(player.h+g.h)/2+5) {
 if (isIT &&!g.tagged) {
 g.tagged = true;
 tagged++;
 score += 30 + round*10;
 if (tagged >= gorillas.length) {
 clearInterval(timerInterval); timerInterval=null;
 score += timer*5;
 running = false;
 setTimeout(()=>{round++;startRound();},800);
 return;
 }
 } else if (!isIT) {
 // Player got tagged!
 clearInterval(timerInterval); timerInterval=null;
 running = false;
 showGameOver('You got tagged!', score, 'gorillatag', ()=>{reset();});
 return;
 }
 }
 }

 drawFrame();
 frameId = requestAnimationFrame(step);
 }

 function drawFrame() {
 // Background
 const grad = ctx.createLinearGradient(0,0,0,H);
 grad.addColorStop(0, '#1a3a1a');
 grad.addColorStop(1, '#0a1a0a');
 ctx.fillStyle = grad;
 ctx.fillRect(0,0,W,H);

 // Platforms
 for (const p of platforms) {
 ctx.fillStyle = p.color;
 if (p.isTree) {
 ctx.fillRect(p.x, p.y, p.w, p.h);
 // Bark texture
 ctx.fillStyle = 'rgba(0,0,0,0.1)';
 for (let ty=p.y;ty<p.y+p.h;ty+=8) ctx.fillRect(p.x+2,ty,p.w-4,2);
 } else {
 ctx.fillRect(p.x, p.y, p.w, p.h);
 if (p.y < groundY) {
 ctx.fillStyle = 'rgba(255,255,255,0.1)';
 ctx.fillRect(p.x, p.y, p.w, 3);
 }
 }
 }

 // Vines
 ctx.strokeStyle = '#2E7D32';
 ctx.lineWidth = 2;
 [90,180,310].forEach(vx=>{
 ctx.beginPath();
 ctx.moveTo(vx,40);
 for(let vy=40;vy<groundY;vy+=10) ctx.lineTo(vx+Math.sin(vy*0.1)*8,vy);
 ctx.stroke();
 });

 // Gorillas
 for (const g of gorillas) {
 if (g.tagged) {
 ctx.globalAlpha = 0.3;
 }
 // Body
 ctx.fillStyle = g.color;
 ctx.beginPath();
 ctx.ellipse(g.x+g.w/2, g.y+g.h/2, g.w/2, g.h/2, 0, 0, Math.PI*2);
 ctx.fill();
 // Face
 ctx.fillStyle = '#333';
 ctx.fillRect(g.x+5, g.y+6, 4, 4);
 ctx.fillRect(g.x+g.w-9, g.y+6, 4, 4);
 // Mouth
 ctx.fillStyle = g.tagged? '#666': '#fff';
 ctx.fillRect(g.x+7, g.y+13, g.w-14, 3);
 // Arms
 ctx.fillStyle = g.color;
 ctx.fillRect(g.x-5, g.y+5, 6, 12);
 ctx.fillRect(g.x+g.w-1, g.y+5, 6, 12);

 if (g.tagged) {
 ctx.globalAlpha = 1;
 ctx.font = '12px serif';
 ctx.textAlign = 'center';
 ctx.fillText('', g.x+g.w/2, g.y-5);
 }

 // Exclamation when close
 if (!g.tagged) {
 const dist = Math.sqrt((player.x-g.x)**2+(player.y-g.y)**2);
 if (dist < 60) {
 ctx.font = '14px serif';
 ctx.textAlign = 'center';
 ctx.fillText(isIT?'!!':'', g.x+g.w/2, g.y-10);
 }
 }
 }

 // Player gorilla
 ctx.fillStyle = isIT? '#f44336': '#4CAF50';
 ctx.beginPath();
 ctx.ellipse(player.x+player.w/2, player.y+player.h/2, player.w/2+2, player.h/2+2, 0, 0, Math.PI*2);
 ctx.fill();
 // Glow
 ctx.shadowColor = isIT? '#f44336': '#4CAF50';
 ctx.shadowBlur = 12;
 ctx.fill();
 ctx.shadowBlur = 0;
 // Face
 ctx.fillStyle = '#fff';
 ctx.fillRect(player.x+5, player.y+5, 5, 5);
 ctx.fillRect(player.x+player.w-10, player.y+5, 5, 5);
 ctx.fillStyle = '#000';
 ctx.fillRect(player.x+7, player.y+7, 2, 2);
 ctx.fillRect(player.x+player.w-8, player.y+7, 2, 2);
 // Mouth
 ctx.fillStyle = '#fff';
 ctx.fillRect(player.x+7, player.y+14, player.w-14, 3);
 // Arms
 ctx.fillStyle = isIT? '#d32f2f': '#388E3C';
 ctx.fillRect(player.x-6, player.y+4, 7, 14);
 ctx.fillRect(player.x+player.w-1, player.y+4, 7, 14);
 // Label
 ctx.font = 'bold 9px Orbitron';
 ctx.textAlign = 'center';
 ctx.fillStyle = '#fff';
 ctx.fillText(isIT?'IT':'YOU', player.x+player.w/2, player.y-6);

 // HUD
 ctx.fillStyle = 'rgba(0,0,0,0.6)';
 ctx.fillRect(0,0,W,28);
 ctx.font = 'bold 11px Orbitron, sans-serif';
 ctx.textBaseline = 'top';
 ctx.textAlign = 'left';
 ctx.fillStyle = '#FF9800';
 ctx.fillText('Round '+(round+1), 6, 7);
 ctx.textAlign = 'center';
 ctx.fillStyle = timer<=5?'#f44336':'#00d4ff';
 ctx.fillText(''+timer+'s', W/2, 7);
 ctx.textAlign = 'right';
 ctx.fillStyle = '#4CAF50';
 if(isIT) ctx.fillText('Tagged: '+tagged+'/'+gorillas.length, W-6, 7);
 else ctx.fillText('Score: '+score, W-6, 7);

 // Mode indicator
 ctx.fillStyle = isIT? 'rgba(255,0,0,0.1)': 'rgba(0,255,0,0.1)';
 ctx.fillRect(0, H-20, W, 20);
 ctx.font = 'bold 10px Orbitron';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillStyle = isIT? '#f44336': '#4CAF50';
 ctx.fillText(isIT? 'YOU\'RE IT! Tag them all!': 'ESCAPE! Don\'t get tagged!', W/2, H-10);
 }

 function onKey(e) {
 const down = e.type === 'keydown';
 switch(e.key) {
 case 'ArrowLeft':case 'a':case 'A': keys.left=down; break;
 case 'ArrowRight':case 'd':case 'D': keys.right=down; break;
 case 'ArrowUp':case 'w':case 'W': keys.up=down; break;
 case 'ArrowDown':case 's':case 'S': keys.down=down; break;
 case '': e.preventDefault(); keys.jump=down; break;
 }
 }

 document.addEventListener('keydown', onKey);
 document.addEventListener('keyup', onKey);

 // Mobile controls
 function holdBtn(id, key) {
 const btn = document.getElementById(id);
 if (!btn) return;
 btn.addEventListener('touchstart', (e)=>{e.preventDefault();keys[key]=true;});
 btn.addEventListener('touchend', ()=>{keys[key]=false;});
 btn.addEventListener('mousedown', ()=>{keys[key]=true;});
 btn.addEventListener('mouseup', ()=>{keys[key]=false;});
 btn.addEventListener('mouseleave', ()=>{keys[key]=false;});
 }
 holdBtn('gt-left', 'left'); holdBtn('gt-right', 'right');
 holdBtn('gt-up', 'up'); holdBtn('gt-down', 'down');
 holdBtn('gt-jump', 'jump');

 startBtn.onclick = () => {
 if (running) return;
 reset();
 startRound();
 frameId = requestAnimationFrame(step);
 };

 reset();

 // Initial screen
 ctx.fillStyle = '#1a3a1a';
 ctx.fillRect(0,0,W,H);
 ctx.font = 'bold 22px Orbitron, sans-serif';
 ctx.fillStyle = '#4CAF50';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('Gorilla Tag', W/2, H/2-30);
 ctx.font = '12px Rajdhani, sans-serif';
 ctx.fillStyle = '#888';
 ctx.fillText('Swing through trees, tag gorillas!', W/2, H/2);
 ctx.fillText('SPACE to jump | Climb trees!', W/2, H/2+20);

 gameScoreDisplay.textContent = 'Best: '+ getHigh('gorillatag');

 gameCleanup = () => {
 running = false;
 cancelAnimationFrame(frameId);
 if(timerInterval) clearInterval(timerInterval);
 document.removeEventListener('keydown', onKey);
 document.removeEventListener('keyup', onKey);
 };
}

// ==================== FNAF (Freddy's Pizzeria) ====================
function initFNAF() {
 gameTitle.textContent = 'Freddy\'s Pizzeria';

 gameArea.innerHTML = `
 <div id="fnaf-game"style="max-width:380px;margin:0 auto;text-align:center;font-family:Rajdhani,sans-serif;">
 <div id="fnaf-screen"style="background:#0a0a0a;border:2px solid #333;border-radius:12px;min-height:280px;position:relative;overflow:hidden;padding:10px;">
 </div>
 <div id="fnaf-controls"style="display:flex;justify-content:center;gap:8px;margin-top:10px;flex-wrap:wrap;">
 <button id="fnaf-cam"style="padding:10px 16px;font-size:0.9rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:8px;color:#00d4ff;cursor:pointer;"> Cameras</button>
 <button id="fnaf-ldoor"style="padding:10px 16px;font-size:0.9rem;background:#1a1a2e;border:2px solid #ff4444;border-radius:8px;color:#ff4444;cursor:pointer;"> Left Door</button>
 <button id="fnaf-rdoor"style="padding:10px 16px;font-size:0.9rem;background:#1a1a2e;border:2px solid #ff4444;border-radius:8px;color:#ff4444;cursor:pointer;"> Right Door</button>
 <button id="fnaf-light"style="padding:10px 16px;font-size:0.9rem;background:#1a1a2e;border:2px solid #ffaa00;border-radius:8px;color:#ffaa00;cursor:pointer;"> Light</button>
 </div>
 <div style="color:#555;font-size:0.7rem;margin-top:6px;">Check cameras, close doors when animatronics are near, survive until 6 AM!</div>
 </div>
 `;

 const screen = document.getElementById('fnaf-screen');

 const animatronics = [
 {name:'Freddy', emoji:'', room:0, aggressiveness:1, color:'#8B4513'},
 {name:'Bonnie', emoji:'', room:0, aggressiveness:2, color:'#6A1B9A'},
 {name:'Chica', emoji:'', room:0, aggressiveness:2, color:'#F9A825'},
 {name:'Foxy', emoji:'', room:0, aggressiveness:3, color:'#D84315'}
];

 // Rooms: 0=Show Stage, 1=Dining Area, 2=Backstage, 3=West Hall, 4=East Hall,
 // 5=Left Door, 6=Right Door, 7=Kitchen, 8=Supply Closet, 9=Pirate Cove (Foxy)
 const roomNames = ['Show Stage', 'Dining Area', 'Backstage', 'West Hall', 'East Hall', 'Left Door', 'Right Door', 'Kitchen', 'Supply Closet', 'Pirate Cove'];
 const roomEmojis = ['', '', '', '', '', '', '', '', '', ''];

 // Movement paths
 const paths = {
 0: [1,2], // Stage -> Dining or Backstage
 1: [3,4,7], // Dining -> West/East Hall or Kitchen
 2: [3], // Backstage -> West Hall
 3: [5], // West Hall -> Left Door
 4: [6], // East Hall -> Right Door
 7: [4], // Kitchen -> East Hall
 8: [3], // Supply -> West Hall
 9: [3,1] // Pirate Cove -> West Hall or Dining
 };

 let night, hour, power, leftDoor, rightDoor, viewingCams, selectedCam;
 let gameActive, hourInterval, moveInterval, powerInterval, lightOn;
 let jumpscareActive, msgText;

 function resetGame() {
 night = 1;
 startNight();
 }

 function startNight() {
 hour = 0; // 12 AM = 0, 1 AM = 1,... 6 AM = 6
 power = 100;
 leftDoor = false;
 rightDoor = false;
 viewingCams = false;
 selectedCam = 0;
 lightOn = false;
 jumpscareActive = false;
 gameActive = true;
 msgText = '';

 // Reset animatronic positions
 animatronics[0].room = 0; // Freddy on stage
 animatronics[1].room = 0; // Bonnie on stage
 animatronics[2].room = 0; // Chica on stage
 animatronics[3].room = 9; // Foxy in Pirate Cove

 // Adjust aggressiveness per night
 animatronics.forEach(a => {
 a.aggressiveness = Math.min(a.aggressiveness + (night-1) * 0.5, 10);
 });

 if (hourInterval) clearInterval(hourInterval);
 if (moveInterval) clearInterval(moveInterval);
 if (powerInterval) clearInterval(powerInterval);

 // Hour advances every 8 seconds (48 sec per night)
 hourInterval = setInterval(() => {
 if (!gameActive) return;
 hour++;
 if (hour >= 6) {
 // Survived!
 gameActive = false;
 clearIntervals();
 const isNew = setHigh('fnaf', night);
 screen.innerHTML = `
 <div style="padding:40px;text-align:center;">
 <div style="font-size:4rem;"></div>
 <div style="font-size:2rem;color:#ffaa00;font-family:Orbitron,sans-serif;margin:10px 0;">6 AM</div>
 <div style="color:#4CAF50;font-size:1.3rem;">You survived Night ${night}! </div>
 ${isNew? '<div style="color:#ffaa00;margin:5px 0;">[star] New Record!</div>': ''}
 <button id="fnaf-next"style="margin-top:15px;padding:10px 25px;font-size:1rem;background:linear-gradient(135deg,#ff4444,#b44aff);border:none;border-radius:8px;cursor:pointer;color:#fff;font-family:Orbitron,sans-serif;">Night ${night+1} </button>
 </div>
 `;
 document.getElementById('fnaf-next').onclick = () => { night++; startNight(); };
 }
 render();
 }, 8000);

 // Animatronics move every 5 seconds
 moveInterval = setInterval(() => {
 if (!gameActive) return;
 moveAnimatronics();
 checkAttack();
 render();
 }, 5000);

 // Power drain
 powerInterval = setInterval(() => {
 if (!gameActive) return;
 let drain = 1;
 if (leftDoor) drain += 1;
 if (rightDoor) drain += 1;
 if (viewingCams) drain += 1;
 if (lightOn) drain += 0.5;
 power = Math.max(0, power - drain);

 if (power <= 0) {
 // Power out - Freddy comes
 leftDoor = false;
 rightDoor = false;
 viewingCams = false;
 lightOn = false;
 setTimeout(() => {
 if (!gameActive) return;
 jumpscare(animatronics[0]);
 }, 3000);
 }
 render();
 }, 2000);

 render();
 }

 function clearIntervals() {
 if (hourInterval) { clearInterval(hourInterval); hourInterval = null; }
 if (moveInterval) { clearInterval(moveInterval); moveInterval = null; }
 if (powerInterval) { clearInterval(powerInterval); powerInterval = null; }
 }

 function moveAnimatronics() {
 for (const a of animatronics) {
 if (a.room === 5 || a.room === 6) continue; // at doors, don't move further
 if (Math.random() * 10 > a.aggressiveness) continue; // chance to not move

 const possibleRooms = paths[a.room];
 if (!possibleRooms || possibleRooms.length === 0) continue;
 a.room = possibleRooms[Math.floor(Math.random() * possibleRooms.length)];
 }
 }

 function checkAttack() {
 // Check left door
 const atLeft = animatronics.filter(a => a.room === 5);
 if (atLeft.length > 0 &&!leftDoor) {
 jumpscare(atLeft[0]);
 return;
 }

 // Check right door
 const atRight = animatronics.filter(a => a.room === 6);
 if (atRight.length > 0 &&!rightDoor) {
 jumpscare(atRight[0]);
 return;
 }

 // If door is closed, push them back
 atLeft.forEach(a => { a.room = 3; });
 atRight.forEach(a => { a.room = 4; });
 }

 function jumpscare(animatronic) {
 gameActive = false;
 jumpscareActive = true;
 clearIntervals();

 screen.innerHTML = `
 <div style="background:#0a0a0a;padding:20px;text-align:center;animation:shake 0.3s infinite;">
 <div style="font-size:8rem;filter:drop-shadow(0 0 20px ${animatronic.color});">${animatronic.emoji}</div>
 <div style="font-size:1.5rem;color:${animatronic.color};font-family:Orbitron,sans-serif;margin:10px 0;">${animatronic.name.toUpperCase()}!</div>
 <div style="color:#ff4444;font-size:1.1rem;"> Game Over - Night ${night}</div>
 <div style="color:#888;margin:5px 0;">Best: Night ${getHigh('fnaf')}</div>
 <button id="fnaf-retry"style="margin-top:15px;padding:10px 25px;font-size:1rem;background:#ff4444;border:none;border-radius:8px;cursor:pointer;color:#fff;font-family:Orbitron,sans-serif;"> Try Again</button>
 </div>
 <style>@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}</style>
 `;
 document.getElementById('fnaf-retry').onclick = resetGame;
 }

 function render() {
 if (jumpscareActive) return;

 const hourStr = hour === 0? '12 AM': hour + 'AM';

 if (viewingCams) {
 // Camera view
 const camRoom = selectedCam;
 const inRoom = animatronics.filter(a => a.room === camRoom);
 const static1 = Math.random() > 0.7? 'filter:brightness(0.5);': '';

 let camContent = `<div style="font-size:3rem;margin:15px 0;">${roomEmojis[camRoom]}</div>`;
 if (inRoom.length > 0) {
 camContent += `<div style="font-size:2.5rem;margin:10px 0;${static1}">${inRoom.map(a=>a.emoji).join('')}</div>`;
 camContent += `<div style="color:#ff4444;font-size:0.9rem;">${inRoom.map(a=>a.name).join(',')} spotted!</div>`;
 } else {
 camContent += `<div style="color:#4CAF50;font-size:0.9rem;margin:10px 0;">Room is clear </div>`;
 }

 let camButtons = '';
 roomNames.forEach((name, i) => {
 if (i === 5 || i === 6) return; // skip door rooms from cam list
 const hasAnim = animatronics.some(a => a.room === i);
 const sel = selectedCam === i;
 camButtons += `<button onclick="window._fnafCam(${i})"style="padding:4px 8px;font-size:0.7rem;background:${sel?'#333':'#111'};border:1px solid ${hasAnim?'#ff4444':'#333'};border-radius:4px;color:${hasAnim?'#ff4444':'#888'};cursor:pointer;margin:2px;">${name}</button>`;
 });

 screen.innerHTML = `
 <div style="position:relative;">
 <div style="background:#0a0a0a;padding:10px;border-bottom:1px solid #333;">
 <div style="display:flex;justify-content:space-between;align-items:center;">
 <span style="color:#00d4ff;font-family:Orbitron;font-size:0.8rem;"> CAM ${String(camRoom+1).padStart(2, '0')}</span>
 <span style="color:#ffaa00;font-family:Orbitron;font-size:0.9rem;">${hourStr}</span>
 <span style="color:${power<20?'#ff4444':'#4CAF50'};font-family:Orbitron;font-size:0.8rem;">${Math.round(power)}%</span>
 </div>
 </div>
 <div style="padding:15px;min-height:140px;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.02) 2px,rgba(255,255,255,0.02) 4px);">
 <div style="color:#aaa;font-size:0.8rem;">${roomNames[camRoom]}</div>
 ${camContent}
 </div>
 <div style="padding:8px;display:flex;flex-wrap:wrap;justify-content:center;gap:2px;background:#111;">
 ${camButtons}
 </div>
 <div style="color:#666;font-size:0.7rem;margin-top:5px;">Night ${night} | L:${leftDoor?'SHUT':'OPEN'} R:${rightDoor?'SHUT':'OPEN'}</div>
 </div>
 `;
 } else {
 // Office view
 const leftCheck = animatronics.filter(a => a.room === 5);
 const rightCheck = animatronics.filter(a => a.room === 6);
 const leftHallCheck = animatronics.filter(a => a.room === 3);
 const rightHallCheck = animatronics.filter(a => a.room === 4);

 let leftStatus = leftDoor? 'CLOSED': 'OPEN';
 let rightStatus = rightDoor? 'CLOSED': 'OPEN';

 let officeView = '<div style="font-size:2rem;margin:10px 0;">Your Office</div>';

 if (lightOn) {
 if (leftCheck.length > 0) {
 officeView += `<div style="color:#ff4444;font-size:1.2rem;animation:shake 0.2s infinite;"> ${leftCheck[0].emoji} ${leftCheck[0].name} AT LEFT DOOR! </div>`;
 }
 if (rightCheck.length > 0) {
 officeView += `<div style="color:#ff4444;font-size:1.2rem;animation:shake 0.2s infinite;"> ${rightCheck[0].emoji} ${rightCheck[0].name} AT RIGHT DOOR! </div>`;
 }
 if (leftHallCheck.length > 0) {
 officeView += `<div style="color:#ffaa00;font-size:0.9rem;"> ${leftHallCheck.map(a=>a.emoji+''+a.name).join(',')} in West Hall</div>`;
 }
 if (rightHallCheck.length > 0) {
 officeView += `<div style="color:#ffaa00;font-size:0.9rem;"> ${rightHallCheck.map(a=>a.emoji+''+a.name).join(',')} in East Hall</div>`;
 }
 if (leftCheck.length===0 && rightCheck.length===0 && leftHallCheck.length===0 && rightHallCheck.length===0) {
 officeView += `<div style="color:#4CAF50;font-size:0.9rem;">All clear... for now </div>`;
 }
 } else {
 officeView += `<div style="color:#555;font-size:0.9rem;margin:10px 0;"> Turn on the light to check the halls...</div>`;
 }

 screen.innerHTML = `
 <div>
 <div style="background:#0a0a0a;padding:10px;border-bottom:1px solid #333;">
 <div style="display:flex;justify-content:space-between;align-items:center;">
 <span style="color:#888;font-family:Orbitron;font-size:0.8rem;">Night ${night}</span>
 <span style="color:#ffaa00;font-family:Orbitron;font-size:1rem;">${hourStr}</span>
 <span style="color:${power<20?'#ff4444':'#4CAF50'};font-family:Orbitron;font-size:0.8rem;">${Math.round(power)}%</span>
 </div>
 </div>
 <div style="padding:15px;min-height:160px;background:${lightOn?'#111':'#050505'};">
 ${officeView}
 </div>
 <div style="display:flex;justify-content:space-between;padding:8px;background:#0a0a0a;">
 <div style="text-align:center;">
 <div style="color:#888;font-size:0.7rem;">Left Door</div>
 <div style="font-size:0.8rem;">${leftStatus}</div>
 </div>
 <div style="font-size:2rem;">${lightOn?'':''}</div>
 <div style="text-align:center;">
 <div style="color:#888;font-size:0.7rem;">Right Door</div>
 <div style="font-size:0.8rem;">${rightStatus}</div>
 </div>
 </div>
 </div>
 <style>@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}</style>
 `;
 }
 }

 // Camera selection
 window._fnafCam = (room) => { selectedCam = room; render(); };

 // Controls
 document.getElementById('fnaf-cam').onclick = () => {
 if (!gameActive) return;
 viewingCams =!viewingCams;
 document.getElementById('fnaf-cam').textContent = viewingCams? 'Office': 'Cameras';
 render();
 };
 document.getElementById('fnaf-ldoor').onclick = () => {
 if (!gameActive) return;
 leftDoor =!leftDoor;
 checkAttack();
 render();
 };
 document.getElementById('fnaf-rdoor').onclick = () => {
 if (!gameActive) return;
 rightDoor =!rightDoor;
 checkAttack();
 render();
 };
 document.getElementById('fnaf-light').onclick = () => {
 if (!gameActive) return;
 lightOn =!lightOn;
 render();
 };

 gameScoreDisplay.textContent = 'Best: Night '+ getHigh('fnaf');
 resetGame();

 gameCleanup = () => {
 gameActive = false;
 clearIntervals();
 delete window._fnafCam;
 };
}

// ==================== SCARY SHAWARMA ====================
function initScaryShawarma() {
 gameTitle.textContent = 'Scary Shawarma';

 const canvas = document.createElement('canvas');
 canvas.width = 360;
 canvas.height = 400;
 canvas.style.cssText = 'display:block;margin:0 auto;border:2px solid #FF6F00;border-radius:12px;background:#1a0a0a;touch-action:none;cursor:pointer;';

 const startBtn = document.createElement('button');
 startBtn.textContent = 'Open the Kitchen!';
 startBtn.style.cssText = 'display:block;margin:10px auto;padding:12px 30px;font-size:1.1rem;background:linear-gradient(135deg,#FF6F00,#f44336);border:none;border-radius:8px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;color:#fff;';

 const dpad = document.createElement('div');
 dpad.style.cssText = 'display:grid;grid-template-columns:45px 45px 45px;grid-template-rows:45px 45px;gap:3px;justify-content:center;margin-top:8px;';
 dpad.innerHTML = `
 <div></div>
 <button id="ss-up"style="font-size:1.2rem;background:#1a0a0a;border:2px solid #FF6F00;border-radius:8px;color:#FF6F00;cursor:pointer;">UP</button>
 <div></div>
 <button id="ss-left"style="font-size:1.2rem;background:#1a0a0a;border:2px solid #FF6F00;border-radius:8px;color:#FF6F00;cursor:pointer;">LT</button>
 <button id="ss-grab"style="font-size:0.7rem;background:#1a0a0a;border:2px solid #4CAF50;border-radius:8px;color:#4CAF50;cursor:pointer;">Grab</button>
 <button id="ss-right"style="font-size:1.2rem;background:#1a0a0a;border:2px solid #FF6F00;border-radius:8px;color:#FF6F00;cursor:pointer;">RT</button>
 <div></div>
 <button id="ss-down"style="font-size:1.2rem;background:#1a0a0a;border:2px solid #FF6F00;border-radius:8px;color:#FF6F00;cursor:pointer;">DN</button>
 <div></div>
 `;

 const info = document.createElement('div');
 info.style.cssText = 'text-align:center;color:#555;font-size:0.7rem;margin-top:6px;';
 info.textContent = 'WASD: move | E: grab ingredients | Collect ingredients, make shawarmas, avoid the haunted food!';

 gameArea.appendChild(canvas);
 gameArea.appendChild(startBtn);
 gameArea.appendChild(dpad);
 gameArea.appendChild(info);

 const ctx = canvas.getContext('2d');
 const W = canvas.width, H = canvas.height;
 const groundY = H - 30;

 // Game state
 let player, score, level, health, ingredients, hauntedFood, shawarmasMade;
 let timer, timerInterval, running, frameId;
 let collectedIngredients, recipe, msgText, msgTimer;
 let kitchenItems, spookEffects;

 const INGREDIENTS = [
 {name:'Meat', emoji:'', color:'#C62828'},
 {name:'Bread', emoji:'', color:'#D7CCC8'},
 {name:'Lettuce', emoji:'', color:'#4CAF50'},
 {name:'Tomato', emoji:'', color:'#f44336'},
 {name:'Onion', emoji:'', color:'#E1BEE7'},
 {name:'Sauce', emoji:'', color:'#FF8F00'},
 {name:'Cheese', emoji:'', color:'#FFC107'},
 {name:'Pepper', emoji:'', color:'#D32F2F'}
];

 const HAUNTED = [
 {name:'Ghost Pepper', emoji:'', speed:2, damage:15},
 {name:'Zombie Meat', emoji:'', speed:1.5, damage:20},
 {name:'Evil Tomato', emoji:'', speed:2.5, damage:10},
 {name:'Cursed Onion', emoji:'', speed:1.8, damage:25},
 {name:'Demon Cheese', emoji:'', speed:3, damage:12},
 {name:'Witch Sauce', emoji:'', speed:2.2, damage:18}
];

 const SCARY_MSGS = [
 'THE SHAWARMA DEMANDS A SACRIFICE!',
 'WHO TURNED OFF THE LIGHTS?!!!',
 'The meat... it MOVED!',
 'Something is watching from the fridge...',
 'The sauce is ALIVE!',
 'DO NOT OPEN THE OVEN!',
 'The lettuce whispers your name...',
 'BEHIND YOU!...just kidding '
];

 function reset() {
 player = {x: W/2, y: H/2, size: 18};
 score = 0;
 level = 1;
 health = 100;
 shawarmasMade = 0;
 collectedIngredients = [];
 msgText = '';
 msgTimer = 0;
 spookEffects = [];
 running = false;
 }

 function startLevel() {
 // Recipe: random 3-4 ingredients needed
 const numNeeded = Math.min(3 + Math.floor(level/3), 5);
 const shuffled = [...INGREDIENTS].sort(()=>Math.random()-0.5);
 recipe = shuffled.slice(0, numNeeded);
 collectedIngredients = [];

 // Spawn ingredients on the map
 ingredients = [];
 for (let i = 0; i < recipe.length * 2 + 3; i++) {
 const ing = INGREDIENTS[Math.floor(Math.random()*INGREDIENTS.length)];
 ingredients.push({
 x: 30 + Math.random()*(W-60),
 y: 50 + Math.random()*(H-120),
...ing,
 bobOffset: Math.random()*Math.PI*2
 });
 }

 // Spawn haunted food
 hauntedFood = [];
 const numHaunted = Math.min(2 + Math.floor(level/2), 7);
 for (let i = 0; i < numHaunted; i++) {
 const h = HAUNTED[Math.floor(Math.random()*HAUNTED.length)];
 hauntedFood.push({
 x: Math.random() < 0.5? -20: W + 20,
 y: 50 + Math.random()*(H-120),
...h,
 speed: h.speed + level * 0.2,
 dir: Math.random()*Math.PI*2,
 changeTimer: 0
 });
 }

 timer = 30 + level * 5;
 if (timerInterval) clearInterval(timerInterval);
 timerInterval = setInterval(()=>{
 if (!running) return;
 timer--;
 if (timer <= 10 && Math.random()<0.3) {
 spookEffects.push({type:'msg', text:SCARY_MSGS[Math.floor(Math.random()*SCARY_MSGS.length)], timer:60});
 }
 if (timer <= 0) {
 clearInterval(timerInterval); timerInterval = null;
 running = false;
 showGameOver('Time\'s up! Kitchen closed!', score, 'scaryshawarma', ()=>{reset();});
 }
 }, 1000);

 running = true;
 showMsg('Night '+ level + ': Make a shawarma! Collect: '+ recipe.map(r=>r.emoji).join(''));
 }

 function showMsg(t) { msgText = t; msgTimer = 120; }

 function grab() {
 if (!running) return;
 // Check nearby ingredients
 for (let i = ingredients.length - 1; i >= 0; i--) {
 const ing = ingredients[i];
 const dist = Math.sqrt((player.x - ing.x)**2 + (player.y - ing.y)**2);
 if (dist < 30) {
 collectedIngredients.push(ing);
 ingredients.splice(i, 1);
 showMsg('Got '+ ing.emoji + ''+ ing.name + '!');

 // Check if we have all recipe ingredients
 const needed = recipe.map(r => r.name);
 const have = collectedIngredients.map(c => c.name);
 const complete = needed.every(n => have.includes(n));

 if (complete) {
 // SHAWARMA MADE!
 shawarmasMade++;
 score += 100 + level * 20;
 health = Math.min(100, health + 10);

 spookEffects.push({type:'shawarma', timer:60});
 showMsg('SHAWARMA COMPLETE! +'+ (100 + level*20) + 'points!');

 // Next level after delay
 setTimeout(() => {
 if (running) { level++; startLevel(); }
 }, 1500);
 }
 return;
 }
 }
 }

 function movePlayer(dx, dy) {
 if (!running) return;
 player.x = Math.max(15, Math.min(W-15, player.x + dx * 4));
 player.y = Math.max(40, Math.min(H-45, player.y + dy * 4));
 }

 function step() {
 if (!running) { if (running!== false) frameId = requestAnimationFrame(step); return; }

 // Move haunted food toward player
 for (const h of hauntedFood) {
 h.changeTimer--;
 const dx = player.x - h.x;
 const dy = player.y - h.y;
 const dist = Math.sqrt(dx*dx + dy*dy);

 if (dist < 150 || h.changeTimer <= 0) {
 h.dir = Math.atan2(dy, dx);
 h.changeTimer = 30 + Math.random()*20;
 }

 h.x += Math.cos(h.dir) * h.speed;
 h.y += Math.sin(h.dir) * h.speed;

 // Bounce off walls
 if (h.x < 10 || h.x > W-10) h.dir = Math.PI - h.dir;
 if (h.y < 40 || h.y > H-40) h.dir = -h.dir;
 h.x = Math.max(10, Math.min(W-10, h.x));
 h.y = Math.max(40, Math.min(H-40, h.y));

 // Hit player
 if (dist < 25) {
 health -= h.damage * 0.1;
 spookEffects.push({type:'hit', timer:15});
 // Push haunted away
 h.x += (h.x - player.x) * 0.5;
 h.y += (h.y - player.y) * 0.5;
 h.dir += Math.PI;
 }
 }

 if (health <= 0) {
 health = 0;
 running = false;
 clearInterval(timerInterval);
 showGameOver('The haunted food got you!', score, 'scaryshawarma', ()=>{reset();});
 return;
 }

 // Update spook effects
 for (let i = spookEffects.length-1; i >= 0; i--) {
 spookEffects[i].timer--;
 if (spookEffects[i].timer <= 0) spookEffects.splice(i, 1);
 }

 drawFrame();
 frameId = requestAnimationFrame(step);
 }

 function drawFrame() {
 // Kitchen background
 const isSpooky = timer <= 10 || spookEffects.some(e => e.type === 'hit');
 ctx.fillStyle = isSpooky? '#1a0000': '#1a1a0a';
 ctx.fillRect(0, 0, W, H);

 // Kitchen tiles
 ctx.strokeStyle = 'rgba(255,255,255,0.03)';
 for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
 for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

 // Kitchen counter (bottom)
 ctx.fillStyle = '#3E2723';
 ctx.fillRect(0, H-30, W, 30);
 ctx.fillStyle = '#5D4037';
 ctx.fillRect(0, H-32, W, 4);

 // Flickering light effect
 if (isSpooky && Math.random() < 0.3) {
 ctx.fillStyle = 'rgba(0,0,0,0.5)';
 ctx.fillRect(0, 0, W, H);
 }

 // Ingredients
 const time = Date.now() / 1000;
 for (const ing of ingredients) {
 const bob = Math.sin(time * 2 + ing.bobOffset) * 3;
 ctx.font = '22px serif';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText(ing.emoji, ing.x, ing.y + bob);

 // Glow if it's in the recipe
 if (recipe.some(r => r.name === ing.name)) {
 ctx.beginPath();
 ctx.arc(ing.x, ing.y + bob, 16, 0, Math.PI*2);
 ctx.strokeStyle = 'rgba(0,255,136,0.3)';
 ctx.lineWidth = 2;
 ctx.stroke();
 }
 }

 // Haunted food
 for (const h of hauntedFood) {
 // Shadow/trail
 ctx.globalAlpha = 0.3;
 ctx.font = '20px serif';
 ctx.fillText(h.emoji, h.x-3, h.y+3);
 ctx.globalAlpha = 1;
 // Main
 ctx.font = '24px serif';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText(h.emoji, h.x, h.y);
 // Evil glow
 ctx.beginPath();
 ctx.arc(h.x, h.y, 18, 0, Math.PI*2);
 ctx.strokeStyle = 'rgba(255,0,0,0.3)';
 ctx.lineWidth = 2;
 ctx.stroke();
 }

 // Player (chef)
 ctx.font = '28px serif';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('P', player.x, player.y);
 // Glow
 ctx.beginPath();
 ctx.arc(player.x, player.y, 20, 0, Math.PI*2);
 ctx.strokeStyle = 'rgba(255,170,0,0.3)';
 ctx.lineWidth = 2;
 ctx.stroke();

 // Spook effects
 for (const e of spookEffects) {
 if (e.type === 'hit') {
 ctx.fillStyle = `rgba(255,0,0,${e.timer/15*0.3})`;
 ctx.fillRect(0, 0, W, H);
 }
 if (e.type === 'shawarma') {
 ctx.font = `${60 + (60 - e.timer)}px serif`;
 ctx.globalAlpha = e.timer / 60;
 ctx.textAlign = 'center';
 ctx.fillText('', W/2, H/2);
 ctx.globalAlpha = 1;
 }
 if (e.type === 'msg') {
 ctx.globalAlpha = Math.min(1, e.timer/20);
 ctx.fillStyle = 'rgba(100,0,0,0.8)';
 ctx.fillRect(20, H/2-20, W-40, 40);
 ctx.font = 'bold 11px Rajdhani';
 ctx.fillStyle = '#ff4444';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText(e.text, W/2, H/2);
 ctx.globalAlpha = 1;
 }
 }

 // HUD
 ctx.fillStyle = 'rgba(0,0,0,0.7)';
 ctx.fillRect(0, 0, W, 35);

 ctx.font = 'bold 10px Orbitron';
 ctx.textBaseline = 'top';
 ctx.textAlign = 'left';
 ctx.fillStyle = '#FF6F00';
 ctx.fillText('Night '+ level, 6, 4);
 ctx.fillStyle = '#ffaa00';
 ctx.fillText('x'+ shawarmasMade, 6, 18);

 ctx.textAlign = 'center';
 ctx.fillStyle = timer <= 10? '#ff4444': '#00d4ff';
 ctx.fillText(''+ timer + 's', W/2, 4);

 // Health bar
 ctx.fillStyle = '#333';
 ctx.fillRect(W/2-30, 19, 60, 10);
 ctx.fillStyle = health > 50? '#4CAF50': (health > 25? '#FF9800': '#f44336');
 ctx.fillRect(W/2-30, 19, 60*(health/100), 10);

 ctx.textAlign = 'right';
 ctx.fillStyle = '#00ff88';
 ctx.fillText('Score: '+ score, W-6, 4);

 // Recipe display
 ctx.fillStyle = '#888';
 ctx.font = '9px Rajdhani';
 ctx.textAlign = 'right';
 const recipeStr = 'Need: '+ recipe.map(r => {
 const have = collectedIngredients.some(c => c.name === r.name);
 return (have? '': '') + r.emoji;
 }).join('');
 ctx.fillText(recipeStr, W-6, 18);

 // Message
 if (msgTimer > 0) {
 msgTimer--;
 ctx.globalAlpha = Math.min(1, msgTimer/30);
 ctx.fillStyle = 'rgba(0,0,0,0.85)';
 ctx.fillRect(10, H-65, W-20, 28);
 ctx.fillStyle = '#fff';
 ctx.font = '11px Rajdhani';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText(msgText, W/2, H-51);
 ctx.globalAlpha = 1;
 }
 }

 function onKey(e) {
 switch(e.key) {
 case 'ArrowLeft':case 'a':case 'A': movePlayer(-1,0); break;
 case 'ArrowRight':case 'd':case 'D': movePlayer(1,0); break;
 case 'ArrowUp':case 'w':case 'W': movePlayer(0,-1); break;
 case 'ArrowDown':case 's':case 'S': movePlayer(0,1); break;
 case 'e':case 'E':case '': grab(); break;
 }
 }
 document.addEventListener('keydown', onKey);

 const setupBtn=(id,fn)=>{const b=document.getElementById(id);if(b){b.addEventListener('click',fn);b.addEventListener('touchstart',(e)=>{e.preventDefault();fn();});}};
 setupBtn('ss-up',()=>movePlayer(0,-1)); setupBtn('ss-down',()=>movePlayer(0,1));
 setupBtn('ss-left',()=>movePlayer(-1,0)); setupBtn('ss-right',()=>movePlayer(1,0));
 setupBtn('ss-grab',grab);

 startBtn.onclick = () => {
 if (running) return;
 reset();
 startLevel();
 frameId = requestAnimationFrame(step);
 };

 reset();

 // Initial screen
 ctx.fillStyle = '#1a0a0a';
 ctx.fillRect(0,0,W,H);
 ctx.font = 'bold 20px Orbitron';
 ctx.fillStyle = '#FF6F00';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('Scary Shawarma', W/2, H/2-40);
 ctx.font = '40px serif';
 ctx.fillText('', W/2, H/2+10);
 ctx.font = '11px Rajdhani';
 ctx.fillStyle = '#888';
 ctx.fillText('Cook shawarmas in a haunted kitchen!', W/2, H/2+50);
 ctx.fillText('Avoid the cursed ingredients!!!', W/2, H/2+65);

 gameScoreDisplay.textContent = 'Best: '+ getHigh('scaryshawarma');

 gameCleanup = () => {
 running = false;
 cancelAnimationFrame(frameId);
 if (timerInterval) clearInterval(timerInterval);
 document.removeEventListener('keydown', onKey);
 };
}


// ==================== 21. RED LIGHT GREEN LIGHT ====================
function initRedGreenLight() {
 gameTitle.textContent = 'Red Light Green Light';

 const canvas = document.createElement('canvas');
 canvas.width = 360;
 canvas.height = 500;
 canvas.style.cssText = 'display:block;margin:0 auto;border:2px solid #00ff88;border-radius:12px;background:#1a1a2e;touch-action:none;';

 const diffDiv = document.createElement('div');
 diffDiv.style.cssText = 'text-align:center;margin:10px 0;';
 diffDiv.innerHTML = `
 <span style="color:#aaa;font-family:Rajdhani;font-size:0.9rem;">Difficulty: </span>
 <button id="rgl-easy"class="game-btn"style="padding:6px 14px;font-size:0.8rem;margin:0 3px;">Easy</button>
 <button id="rgl-med"class="game-btn"style="padding:6px 14px;font-size:0.8rem;margin:0 3px;">Medium</button>
 <button id="rgl-hard"class="game-btn"style="padding:6px 14px;font-size:0.8rem;margin:0 3px;">Hard</button>
 `;

 const startBtn = document.createElement('button');
 startBtn.textContent = 'Start Running!';
 startBtn.style.cssText = 'display:block;margin:10px auto;padding:12px 30px;font-size:1.1rem;background:linear-gradient(135deg,#00ff88,#00d4ff);border:none;border-radius:8px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;color:#000;';

 const runBtn = document.createElement('button');
 runBtn.textContent = 'TAP TO RUN!';
 runBtn.style.cssText = 'display:none;margin:10px auto;padding:20px 50px;font-size:1.3rem;background:linear-gradient(135deg,#00ff88,#4CAF50);border:none;border-radius:12px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;color:#000;user-select:none;-webkit-user-select:none;touch-action:manipulation;';

 const info = document.createElement('div');
 info.style.cssText = 'text-align:center;color:#555;font-size:0.7rem;margin-top:6px;';
 info.textContent = 'Tap RUN during green light. STOP during red light or you\'re OUT!';

 gameArea.appendChild(canvas);
 gameArea.appendChild(diffDiv);
 gameArea.appendChild(startBtn);
 gameArea.appendChild(runBtn);
 gameArea.appendChild(info);

 const ctx = canvas.getContext('2d');
 const W = canvas.width, H = canvas.height;

 // Audio context for sound effects
 let audioCtx = null;
 function initAudio() {
 if (!audioCtx) {
 try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
 }
 }
 function playTone(freq, duration, type) {
 if (!audioCtx) return;
 try {
 const osc = audioCtx.createOscillator();
 const gain = audioCtx.createGain();
 osc.connect(gain);
 gain.connect(audioCtx.destination);
 osc.type = type || 'square';
 osc.frequency.value = freq;
 gain.gain.value = 0.15;
 gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
 osc.start();
 osc.stop(audioCtx.currentTime + duration);
 } catch(e) {}
 }
 function greenBeep() { playTone(880, 0.15, 'sine'); }
 function redBuzz() { playTone(150, 0.4, 'sawtooth'); }
 function winSound() { playTone(523, 0.1, 'sine'); setTimeout(()=>playTone(659, 0.1, 'sine'), 100); setTimeout(()=>playTone(784, 0.1, 'sine'), 200); setTimeout(()=>playTone(1047, 0.3, 'sine'), 300); }
 function loseSound() { playTone(300, 0.15, 'sawtooth'); setTimeout(()=>playTone(200, 0.15, 'sawtooth'), 150); setTimeout(()=>playTone(100, 0.4, 'sawtooth'), 300); }

 // Difficulty settings
 const DIFFICULTY = {
 easy: { greenMin: 3000, greenMax: 5000, redMin: 2000, redMax: 3000, graceMs: 400, timer: 60, label: 'Easy'},
 medium: { greenMin: 2000, greenMax: 4000, redMin: 1500, redMax: 3000, graceMs: 200, timer: 45, label: 'Medium'},
 hard: { greenMin: 1500, greenMax: 3000, redMin: 1000, redMax: 2500, graceMs: 80, timer: 35, label: 'Hard'}
 };
 let difficulty = 'medium';

 // Game state
 let playerY, progress, isGreen, running, caught, won, timer, frameId;
 let lightSwitchTimeout, timerInterval;
 let isRunning; // whether the player is currently running (holding button)
 let dollFacing; // 'away'(green) or 'watching'(red)
 let dollRotation; // for smooth rotation animation
 let lightSwitchTime; // when the last switch happened
 let tintAlpha; // for screen tint effect
 let confetti; // confetti particles for win
 let settings;
 let stepCount; // for animation

 const FINISH_Y = 60;
 const START_Y = H - 60;
 const TRACK_LENGTH = START_Y - FINISH_Y;

 function reset() {
 settings = DIFFICULTY[difficulty];
 playerY = START_Y;
 progress = 0;
 isGreen = false;
 running = false;
 caught = false;
 won = false;
 timer = settings.timer;
 isRunning = false;
 dollFacing = 'away';
 dollRotation = 0;
 lightSwitchTime = 0;
 tintAlpha = 0;
 confetti = [];
 stepCount = 0;
 runBtn.style.display = 'none';
 startBtn.style.display = 'block';
 }

 function startGame() {
 initAudio();
 reset();
 running = true;
 startBtn.style.display = 'none';
 runBtn.style.display = 'block';
 runBtn.style.background = 'linear-gradient(135deg,#666,#444)';
 runBtn.textContent = 'Get Ready...';

 // Brief countdown, then first green light
 setTimeout(() => {
 if (!running) return;
 switchToGreen();
 timerInterval = setInterval(() => {
 if (!running) return;
 timer--;
 if (timer <= 0) {
 timer = 0;
 running = false;
 loseSound();
 showGameOver('Time\'s up!', 0, 'redgreenlight', () => { reset(); drawInitial(); });
 }
 }, 1000);
 frameId = requestAnimationFrame(gameLoop);
 }, 1500);

 drawFrame();
 frameId = requestAnimationFrame(gameLoop);
 }

 function switchToGreen() {
 if (!running) return;
 isGreen = true;
 dollFacing = 'away';
 lightSwitchTime = Date.now();
 tintAlpha = 0.25;
 greenBeep();
 runBtn.style.background = 'linear-gradient(135deg,#00ff88,#4CAF50)';
 runBtn.textContent = 'TAP TO RUN!';

 const dur = settings.greenMin + Math.random() * (settings.greenMax - settings.greenMin);
 clearTimeout(lightSwitchTimeout);
 lightSwitchTimeout = setTimeout(() => { if (running) switchToRed(); }, dur);
 }

 function switchToRed() {
 if (!running) return;
 isGreen = false;
 dollFacing = 'watching';
 lightSwitchTime = Date.now();
 tintAlpha = 0.25;
 redBuzz();
 runBtn.style.background = 'linear-gradient(135deg,#f44336,#c62828)';
 runBtn.textContent = 'STOP!';

 const dur = settings.redMin + Math.random() * (settings.redMax - settings.redMin);
 clearTimeout(lightSwitchTimeout);
 lightSwitchTimeout = setTimeout(() => { if (running) switchToGreen(); }, dur);
 }

 function playerRun() {
 if (!running || caught || won) return;
 if (isGreen) {
 // Move forward
 const moveAmount = 3 + Math.random() * 2;
 playerY -= moveAmount;
 progress = (START_Y - playerY) / TRACK_LENGTH;
 stepCount++;
 if (progress >= 1) {
 progress = 1;
 playerY = FINISH_Y;
 won = true;
 running = false;
 clearTimeout(lightSwitchTimeout);
 clearInterval(timerInterval);
 winSound();

 // Create confetti
 for (let i = 0; i < 80; i++) {
 confetti.push({
 x: W / 2,
 y: FINISH_Y,
 vx: (Math.random() - 0.5) * 8,
 vy: -Math.random() * 6 - 2,
 color: ['#00ff88', '#00d4ff', '#ff44aa', '#ffaa00', '#b44aff', '#ff6600'][Math.floor(Math.random()*6)],
 size: Math.random() * 6 + 2,
 rotation: Math.random() * 360,
 rotSpeed: (Math.random() - 0.5) * 10
 });
 }

 const score = Math.max(0, timer);
 setTimeout(() => {
 showGameOver('YOU CROSSED THE LINE!', score, 'redgreenlight', () => { reset(); drawInitial(); });
 }, 2000);
 }
 } else {
 // Red light! Check grace period
 const timeSinceSwitch = Date.now() - lightSwitchTime;
 if (timeSinceSwitch > settings.graceMs) {
 // CAUGHT!
 caught = true;
 running = false;
 clearTimeout(lightSwitchTimeout);
 clearInterval(timerInterval);
 loseSound();
 setTimeout(() => {
 showGameOver('CAUGHT! You moved during red light!', 0, 'redgreenlight', () => { reset(); drawInitial(); });
 }, 1200);
 }
 }
 }

 function gameLoop() {
 if (!running &&!won &&!caught) return;
 drawFrame();
 // Update confetti
 for (const c of confetti) {
 c.x += c.vx;
 c.vy += 0.15;
 c.y += c.vy;
 c.rotation += c.rotSpeed;
 }
 // Fade tint
 if (tintAlpha > 0) tintAlpha -= 0.005;
 // Animate doll rotation
 if (dollFacing === 'away') { dollRotation += (0 - dollRotation) * 0.15; }
 else { dollRotation += (180 - dollRotation) * 0.15; }

 if (running || won || caught) {
 frameId = requestAnimationFrame(gameLoop);
 }
 }

 function drawFrame() {
 // Background
 ctx.fillStyle = '#1a1a2e';
 ctx.fillRect(0, 0, W, H);

 // Screen tint
 if (tintAlpha > 0) {
 ctx.fillStyle = isGreen? `rgba(0,255,100,${tintAlpha})`: `rgba(255,0,0,${tintAlpha})`;
 ctx.fillRect(0, 0, W, H);
 }

 // Track/field
 ctx.fillStyle = '#2a2a3e';
 ctx.fillRect(30, FINISH_Y - 10, W - 60, TRACK_LENGTH + 30);
 // Lane lines
 ctx.strokeStyle = 'rgba(255,255,255,0.05)';
 ctx.setLineDash([10, 10]);
 for (let x = 60; x < W - 60; x += 40) {
 ctx.beginPath();
 ctx.moveTo(x, FINISH_Y);
 ctx.lineTo(x, START_Y + 15);
 ctx.stroke();
 }
 ctx.setLineDash([]);

 // Finish line
 const blockSize = 10;
 for (let x = 30; x < W - 30; x += blockSize) {
 for (let row = 0; row < 2; row++) {
 const isWhite = ((x / blockSize) + row) % 2 === 0;
 ctx.fillStyle = isWhite? '#fff': '#000';
 ctx.fillRect(x, FINISH_Y - 10 + row * blockSize, blockSize, blockSize);
 }
 }

 // Progress bar (left side)
 ctx.fillStyle = '#333';
 ctx.fillRect(8, FINISH_Y, 14, TRACK_LENGTH);
 const progH = TRACK_LENGTH * progress;
 const progGrad = ctx.createLinearGradient(8, FINISH_Y + TRACK_LENGTH - progH, 8, FINISH_Y + TRACK_LENGTH);
 progGrad.addColorStop(0, '#00ff88');
 progGrad.addColorStop(1, '#00d4ff');
 ctx.fillStyle = progGrad;
 ctx.fillRect(8, FINISH_Y + TRACK_LENGTH - progH, 14, progH);
 ctx.strokeStyle = '#555';
 ctx.strokeRect(8, FINISH_Y, 14, TRACK_LENGTH);

 // Doll at top
 const dollX = W / 2;
 const dollY = FINISH_Y - 30;
 ctx.save();
 ctx.translate(dollX, dollY);

 // Doll body
 if (dollFacing === 'watching'|| dollRotation > 90) {
 // Facing player (red light) - angry face
 ctx.font = '35px serif';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('', 0, 0);

 // Red glow around doll
 ctx.beginPath();
 ctx.arc(0, 0, 28, 0, Math.PI * 2);
 ctx.strokeStyle = `rgba(255,0,0,${0.3 + Math.sin(Date.now()/200)*0.2})`;
 ctx.lineWidth = 3;
 ctx.stroke();

 // Scanning beam
 if (!caught && running) {
 ctx.beginPath();
 ctx.moveTo(-20, 20);
 ctx.lineTo(-80, START_Y - dollY);
 ctx.lineTo(80, START_Y - dollY);
 ctx.lineTo(20, 20);
 ctx.fillStyle = 'rgba(255,0,0,0.04)';
 ctx.fill();
 }
 } else {
 // Facing away (green light)
 ctx.font = '35px serif';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('', 0, 0);

 // Green glow
 ctx.beginPath();
 ctx.arc(0, 0, 28, 0, Math.PI * 2);
 ctx.strokeStyle = 'rgba(0,255,136,0.3)';
 ctx.lineWidth = 2;
 ctx.stroke();
 }
 ctx.restore();

 // "TURNED AWAY"/ "WATCHING"text near doll
 ctx.font = 'bold 9px Orbitron';
 ctx.textAlign = 'center';
 if (dollFacing === 'away') {
 ctx.fillStyle = '#00ff88';
 ctx.fillText('TURNED AWAY', dollX, dollY + 28);
 } else {
 ctx.fillStyle = '#ff4444';
 ctx.fillText('WATCHING YOU', dollX, dollY + 28);
 }

 // Player character
 const pX = W / 2;
 ctx.font = '28px serif';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';

 if (caught) {
 // Caught animation - X eyes
 ctx.fillText('', pX, playerY);
 // Red flash
 ctx.fillStyle = 'rgba(255,0,0,0.3)';
 ctx.fillRect(0, 0, W, H);
 // "CAUGHT"text
 ctx.font = 'bold 28px Orbitron';
 ctx.fillStyle = '#ff4444';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('CAUGHT!', W/2, H/2);
 } else if (won) {
 ctx.fillText('', pX, playerY);
 } else {
 // Running or standing animation
 const bobble = (isRunning && isGreen)? Math.sin(stepCount * 0.5) * 3: 0;
 ctx.fillText('', pX, playerY + bobble);
 }

 // Other "NPC runners"for ambiance (static positions)
 const npcs = [
 { x: W * 0.2, progress: 0.3, emoji: ''},
 { x: W * 0.35, progress: 0.55, emoji: ''},
 { x: W * 0.65, progress: 0.15, emoji: ''},
 { x: W * 0.8, progress: 0.45, emoji: ''}
];
 ctx.globalAlpha = 0.4;
 ctx.font = '18px serif';
 for (const npc of npcs) {
 const npcY = START_Y - npc.progress * TRACK_LENGTH;
 ctx.fillText(npc.emoji, npc.x, npcY);
 }
 ctx.globalAlpha = 1;

 // Light indicator (top right)
 const lightX = W - 40;
 const lightY = 25;
 // Traffic light housing
 ctx.fillStyle = '#222';
 ctx.beginPath();
 ctx.roundRect(lightX - 18, lightY - 25, 36, 55, 6);
 ctx.fill();
 ctx.strokeStyle = '#444';
 ctx.lineWidth = 2;
 ctx.stroke();
 // Red light
 ctx.beginPath();
 ctx.arc(lightX, lightY - 12, 10, 0, Math.PI * 2);
 ctx.fillStyle = isGreen? '#440000': '#ff0000';
 ctx.fill();
 if (!isGreen) {
 ctx.shadowColor = '#ff0000';
 ctx.shadowBlur = 15;
 ctx.fill();
 ctx.shadowBlur = 0;
 }
 // Green light
 ctx.beginPath();
 ctx.arc(lightX, lightY + 14, 10, 0, Math.PI * 2);
 ctx.fillStyle = isGreen? '#00ff88': '#003300';
 ctx.fill();
 if (isGreen) {
 ctx.shadowColor = '#00ff88';
 ctx.shadowBlur = 15;
 ctx.fill();
 ctx.shadowBlur = 0;
 }

 // HUD
 ctx.fillStyle = 'rgba(0,0,0,0.7)';
 ctx.fillRect(0, 0, W, 30);

 ctx.font = 'bold 10px Orbitron';
 ctx.textBaseline = 'top';
 ctx.textAlign = 'left';
 ctx.fillStyle = '#00ff88';
 ctx.fillText(settings.label, 8, 4);
 ctx.fillStyle = '#aaa';
 ctx.fillText(Math.floor(progress * 100) + '%', 8, 17);

 ctx.textAlign = 'center';
 ctx.fillStyle = timer <= 10? '#ff4444': '#00d4ff';
 ctx.fillText(''+ timer + 's', W/2, 4);

 // Light text
 ctx.font = 'bold 11px Orbitron';
 ctx.textAlign = 'center';
 if (isGreen) {
 ctx.fillStyle = '#00ff88';
 ctx.fillText('GREEN LIGHT', W/2, 17);
 } else {
 ctx.fillStyle = '#ff4444';
 ctx.fillText('RED LIGHT', W/2, 17);
 }

 ctx.textAlign = 'right';
 ctx.fillStyle = '#ffaa00';
 ctx.font = 'bold 10px Orbitron';
 ctx.fillText(''+ getHigh('redgreenlight'), W - 8, 4);

 // Confetti
 for (const c of confetti) {
 ctx.save();
 ctx.translate(c.x, c.y);
 ctx.rotate(c.rotation * Math.PI / 180);
 ctx.fillStyle = c.color;
 ctx.fillRect(-c.size/2, -c.size/2, c.size, c.size);
 ctx.restore();
 }
 }

 function drawInitial() {
 ctx.fillStyle = '#1a1a2e';
 ctx.fillRect(0, 0, W, H);
 ctx.font = 'bold 18px Orbitron';
 ctx.fillStyle = '#00ff88';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('Red Light', W/2, H/2 - 50);
 ctx.fillText('Green Light', W/2, H/2 - 25);
 ctx.font = '50px serif';
 ctx.fillText('', W/2, H/2 + 25);
 ctx.font = '11px Rajdhani';
 ctx.fillStyle = '#888';
 ctx.fillText('Run when green! Stop when red!', W/2, H/2 + 65);
 ctx.fillText('Reach the finish line before time runs out!', W/2, H/2 + 82);
 }

 // Event handlers
 function onKey(e) {
 if (e.key === ''|| e.key === 'Enter') {
 e.preventDefault();
 playerRun();
 }
 }
 document.addEventListener('keydown', onKey);

 // Run button - tap/click
 let runInterval = null;
 function startRunning() {
 isRunning = true;
 playerRun();
 if (runInterval) clearInterval(runInterval);
 runInterval = setInterval(() => {
 if (running && isRunning) playerRun();
 }, 80);
 }
 function stopRunning() {
 isRunning = false;
 if (runInterval) { clearInterval(runInterval); runInterval = null; }
 }

 runBtn.addEventListener('mousedown', (e) => { e.preventDefault(); startRunning(); });
 runBtn.addEventListener('mouseup', stopRunning);
 runBtn.addEventListener('mouseleave', stopRunning);
 runBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startRunning(); });
 runBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopRunning(); });
 runBtn.addEventListener('touchcancel', stopRunning);

 // Canvas tap to run too (mobile)
 canvas.addEventListener('touchstart', (e) => { e.preventDefault(); if (running) startRunning(); });
 canvas.addEventListener('touchend', (e) => { e.preventDefault(); stopRunning(); });
 canvas.addEventListener('mousedown', (e) => { if (running) startRunning(); });
 canvas.addEventListener('mouseup', stopRunning);

 // Difficulty buttons
 const setupDiff = (id, diff) => {
 const btn = document.getElementById(id);
 if (btn) {
 btn.onclick = () => {
 difficulty = diff;
 document.getElementById('rgl-easy').style.opacity = diff === 'easy'? '1': '0.5';
 document.getElementById('rgl-med').style.opacity = diff === 'medium'? '1': '0.5';
 document.getElementById('rgl-hard').style.opacity = diff === 'hard'? '1': '0.5';
 reset();
 drawInitial();
 };
 }
 };
 setupDiff('rgl-easy', 'easy');
 setupDiff('rgl-med', 'medium');
 setupDiff('rgl-hard', 'hard');

 // Highlight default difficulty
 setTimeout(() => {
 const easyBtn = document.getElementById('rgl-easy');
 const medBtn = document.getElementById('rgl-med');
 const hardBtn = document.getElementById('rgl-hard');
 if (easyBtn) easyBtn.style.opacity = '0.5';
 if (medBtn) medBtn.style.opacity = '1';
 if (hardBtn) hardBtn.style.opacity = '0.5';
 }, 0);

 startBtn.onclick = startGame;

 reset();
 drawInitial();

 gameScoreDisplay.textContent = 'Best: '+ getHigh('redgreenlight');

 gameCleanup = () => {
 running = false;
 caught = false;
 won = false;
 cancelAnimationFrame(frameId);
 clearTimeout(lightSwitchTimeout);
 clearInterval(timerInterval);
 stopRunning();
 document.removeEventListener('keydown', onKey);
 };
}

// ==================== HIT THE TARGET (Archery) ====================
function initHitTarget() {
 gameTitle.textContent = 'Hit the Target';
 const best = getHigh('hittarget');
 gameScoreDisplay.textContent = best? 'Best: '+ best: '';

 const AudioCtx = window.AudioContext || window.webkitAudioContext;
 const audioCtx = new AudioCtx();
 function playTone(freq, dur, type) {
 const osc = audioCtx.createOscillator();
 const gain = audioCtx.createGain();
 osc.type = type || 'sine';
 osc.frequency.value = freq;
 gain.gain.value = 0.12;
 osc.connect(gain); gain.connect(audioCtx.destination);
 osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
 osc.stop(audioCtx.currentTime + dur);
 }
 function shootSound() { playTone(400, 0.1, 'triangle'); setTimeout(() => playTone(200, 0.15, 'sine'), 100); }
 function hitSound(pts) { playTone(600 + pts * 40, 0.15, 'sine'); }
 function missSound() { playTone(150, 0.2, 'sawtooth'); }
 function winSound() { [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f, 0.2, 'sine'), i*120)); }

 let canvas, ctx, W, H;
 let running = false;
 let score = 0;
 let arrows = 10;
 let round = 0;
 let totalRounds = 10;
 let aiming = false;
 let power = 0;
 let powerDir = 1;
 let angle = 0;
 let arrowFlying = false;
 let arrowX, arrowY, arrowVX, arrowVY;
 let targetX, targetY, targetR;
 let targetVY = 0;
 let targetDir = 1;
 let frameId;
 let phase = 'menu'; // menu, aim, power, fly, result, gameover
 let hitResult = null;
 let hitTimer = 0;
 let difficulty = 'medium';
 let wind = 0;

 const DIFF = {
 easy: { targetR: 50, speed: 0.5, arrows: 12, wind: 0 },
 medium: { targetR: 40, speed: 1.0, arrows: 10, wind: 1 },
 hard: { targetR: 30, speed: 1.8, arrows: 8, wind: 2 }
 };

 gameArea.innerHTML = '<canvas id="ht-canvas"style="width:100%;height:100%;display:block;border-radius:12px;cursor:crosshair;"></canvas>';
 canvas = document.getElementById('ht-canvas');
 ctx = canvas.getContext('2d');

 function resize() {
 const rect = gameArea.getBoundingClientRect();
 W = canvas.width = rect.width;
 H = canvas.height = rect.height;
 }
 resize();
 window.addEventListener('resize', resize);

 function newTarget() {
 const s = DIFF[difficulty];
 targetR = s.targetR;
 targetX = W * 0.75;
 targetY = H * 0.3 + Math.random() * (H * 0.35);
 targetDir = 1;
 wind = (Math.random() - 0.5) * s.wind * 2;
 }

 function drawBg() {
 // Sky
 const grad = ctx.createLinearGradient(0, 0, 0, H);
 grad.addColorStop(0, '#1a1a3e');
 grad.addColorStop(0.6, '#2a2a5e');
 grad.addColorStop(1, '#1a3a1a');
 ctx.fillStyle = grad;
 ctx.fillRect(0, 0, W, H);
 // Ground
 ctx.fillStyle = '#2d5a1e';
 ctx.fillRect(0, H * 0.85, W, H * 0.15);
 ctx.fillStyle = '#3a7a2a';
 ctx.fillRect(0, H * 0.85, W, 3);
 }

 function drawTarget() {
 const colors = ['#ff0000', '#ffffff', '#ff0000', '#ffffff', '#ff4444'];
 const rings = [targetR, targetR*0.8, targetR*0.6, targetR*0.4, targetR*0.2];
 for (let i = 0; i < rings.length; i++) {
 ctx.beginPath();
 ctx.arc(targetX, targetY, rings[i], 0, Math.PI * 2);
 ctx.fillStyle = colors[i];
 ctx.fill();
 ctx.strokeStyle = '#333';
 ctx.lineWidth = 1;
 ctx.stroke();
 }
 // Bullseye
 ctx.beginPath();
 ctx.arc(targetX, targetY, targetR * 0.08, 0, Math.PI * 2);
 ctx.fillStyle = '#ffdd00';
 ctx.fill();
 }

 function drawBow() {
 const bowX = W * 0.1;
 const bowY = H * 0.7;
 // Bow
 ctx.beginPath();
 ctx.arc(bowX, bowY, 40, -Math.PI*0.4, Math.PI*0.4);
 ctx.strokeStyle = '#8B4513';
 ctx.lineWidth = 5;
 ctx.stroke();
 // String
 ctx.beginPath();
 ctx.moveTo(bowX + 40 * Math.cos(-Math.PI*0.4), bowY + 40 * Math.sin(-Math.PI*0.4));
 const pullBack = phase === 'power'? power / 100 * 15: 0;
 ctx.lineTo(bowX - pullBack, bowY);
 ctx.lineTo(bowX + 40 * Math.cos(Math.PI*0.4), bowY + 40 * Math.sin(Math.PI*0.4));
 ctx.strokeStyle = '#ddd';
 ctx.lineWidth = 2;
 ctx.stroke();
 // Arrow on bow
 if (phase === 'aim'|| phase === 'power') {
 ctx.beginPath();
 ctx.moveTo(bowX - pullBack - 5, bowY);
 ctx.lineTo(bowX + 30, bowY - Math.tan(angle) * 30);
 ctx.strokeStyle = '#ffdd00';
 ctx.lineWidth = 3;
 ctx.stroke();
 // Arrowhead
 const tipX = bowX + 30;
 const tipY = bowY - Math.tan(angle) * 30;
 ctx.beginPath();
 ctx.moveTo(tipX + 8, tipY);
 ctx.lineTo(tipX - 4, tipY - 5);
 ctx.lineTo(tipX - 4, tipY + 5);
 ctx.fillStyle = '#aaa';
 ctx.fill();
 }
 // Archer emoji
 ctx.font = '36px serif';
 ctx.fillText('', bowX - 30, bowY + 10);
 }

 function drawArrow() {
 if (!arrowFlying) return;
 ctx.beginPath();
 ctx.moveTo(arrowX - 15, arrowY);
 ctx.lineTo(arrowX + 15, arrowY);
 ctx.strokeStyle = '#ffdd00';
 ctx.lineWidth = 3;
 ctx.stroke();
 // Arrowhead
 ctx.beginPath();
 ctx.moveTo(arrowX + 20, arrowY);
 ctx.lineTo(arrowX + 10, arrowY - 5);
 ctx.lineTo(arrowX + 10, arrowY + 5);
 ctx.fillStyle = '#ccc';
 ctx.fill();
 }

 function drawHUD() {
 ctx.fillStyle = '#fff';
 ctx.font = '18px Orbitron, sans-serif';
 ctx.textAlign = 'left';
 ctx.fillText('Score: '+ score, 15, 30);
 ctx.fillText('Arrows: '+ arrows, 15, 55);
 ctx.textAlign = 'right';
 ctx.fillText('Round: '+ round + '/'+ totalRounds, W - 15, 30);
 if (wind!== 0) {
 const windTxt = wind > 0? 'Wind: -> '+ wind.toFixed(1): 'Wind: <- '+ Math.abs(wind).toFixed(1);
 ctx.fillText(windTxt, W - 15, 55);
 }
 ctx.textAlign = 'left';

 // Power bar
 if (phase === 'power') {
 ctx.fillStyle = '#333';
 ctx.fillRect(W * 0.08, H * 0.88, W * 0.2, 16);
 const pColor = power < 40? '#00ff88': power < 75? '#ffaa00': '#ff4444';
 ctx.fillStyle = pColor;
 ctx.fillRect(W * 0.08, H * 0.88, (W * 0.2) * (power / 100), 16);
 ctx.strokeStyle = '#fff';
 ctx.lineWidth = 1;
 ctx.strokeRect(W * 0.08, H * 0.88, W * 0.2, 16);
 ctx.fillStyle = '#fff';
 ctx.font = '12px Rajdhani, sans-serif';
 ctx.fillText('POWER', W * 0.08, H * 0.88 - 4);
 }

 // Aim indicator
 if (phase === 'aim') {
 ctx.fillStyle = '#00d4ff';
 ctx.font = '16px Rajdhani, sans-serif';
 ctx.fillText('TAP to set aim!', W * 0.08, H * 0.95);
 }
 }

 function drawResult() {
 if (!hitResult) return;
 hitTimer--;
 const alpha = Math.min(1, hitTimer / 30);
 ctx.globalAlpha = alpha;
 ctx.textAlign = 'center';
 ctx.font = 'bold 36px Orbitron, sans-serif';
 if (hitResult === 'miss') {
 ctx.fillStyle = '#ff4444';
 ctx.fillText('MISS!', W / 2, H / 2);
 } else {
 ctx.fillStyle = hitResult >= 8? '#ffdd00': hitResult >= 4? '#00ff88': '#fff';
 ctx.fillText('+'+ hitResult, W / 2, H / 2 - 20);
 if (hitResult >= 8) {
 ctx.font = '20px Orbitron, sans-serif';
 ctx.fillText(hitResult === 10? 'BULLSEYE!!': 'GREAT SHOT!', W / 2, H / 2 + 20);
 }
 }
 ctx.globalAlpha = 1;
 ctx.textAlign = 'left';
 if (hitTimer <= 0) {
 hitResult = null;
 if (arrows <= 0 || round >= totalRounds) {
 phase = 'gameover';
 } else {
 newTarget();
 phase = 'aim';
 angle = 0;
 }
 }
 }

 function drawMenu() {
 ctx.fillStyle = 'rgba(0,0,0,0.7)';
 ctx.fillRect(0, 0, W, H);
 ctx.textAlign = 'center';
 ctx.fillStyle = '#fff';
 ctx.font = 'bold 32px Orbitron, sans-serif';
 ctx.fillText(' Hit the Target', W/2, H*0.25);
 ctx.font = '16px Rajdhani, sans-serif';
 ctx.fillStyle = '#aaa';
 ctx.fillText('Click/tap to aim, then set power!', W/2, H*0.33);

 // Difficulty buttons
 const bw = 90, bh = 36, gap = 15;
 const startX = W/2 - (bw*3 + gap*2)/2;
 ['Easy', 'Medium', 'Hard'].forEach((d, i) => {
 const x = startX + i * (bw + gap);
 const y = H * 0.42;
 const sel = d.toLowerCase() === difficulty;
 ctx.fillStyle = sel? (i===0?'#00ff88':i===1?'#00d4ff':'#ff4444'): '#333';
 ctx.beginPath();
 ctx.roundRect(x, y, bw, bh, 8);
 ctx.fill();
 ctx.fillStyle = sel? '#000': '#aaa';
 ctx.font = (sel? 'bold ': '') + '16px Rajdhani, sans-serif';
 ctx.fillText(d, x + bw/2, y + 24);
 });

 // Start button
 ctx.fillStyle = '#00ff88';
 ctx.beginPath();
 ctx.roundRect(W/2 - 70, H*0.55, 140, 50, 12);
 ctx.fill();
 ctx.fillStyle = '#000';
 ctx.font = 'bold 22px Orbitron, sans-serif';
 ctx.fillText(' START', W/2, H*0.55 + 35);

 ctx.textAlign = 'left';
 }

 function drawGameOver() {
 ctx.fillStyle = 'rgba(0,0,0,0.8)';
 ctx.fillRect(0, 0, W, H);
 ctx.textAlign = 'center';
 ctx.font = 'bold 36px Orbitron, sans-serif';
 const isNew = setHigh('hittarget', score);
 ctx.fillStyle = score >= 60? '#00ff88': score >= 30? '#ffaa00': '#ff4444';
 ctx.fillText(score >= 60? ' AMAZING!': score >= 30? ' NICE!': ' TRY AGAIN!', W/2, H*0.3);
 ctx.fillStyle = '#fff';
 ctx.font = '24px Orbitron, sans-serif';
 ctx.fillText('Score: '+ score, W/2, H*0.42);
 if (isNew) {
 ctx.fillStyle = '#ffdd00';
 ctx.font = '18px Rajdhani, sans-serif';
 ctx.fillText(' NEW HIGH SCORE!', W/2, H*0.50);
 }
 gameScoreDisplay.textContent = 'Best: '+ getHigh('hittarget');

 ctx.fillStyle = '#00d4ff';
 ctx.beginPath();
 ctx.roundRect(W/2 - 70, H*0.58, 140, 50, 12);
 ctx.fill();
 ctx.fillStyle = '#000';
 ctx.font = 'bold 20px Orbitron, sans-serif';
 ctx.fillText(' RETRY', W/2, H*0.58 + 35);
 ctx.textAlign = 'left';
 }

 let aimAngle = 0;
 let aimDir = 1;

 function update() {
 if (!running) return;
 frameId = requestAnimationFrame(update);
 drawBg();

 if (phase === 'menu') { drawMenu(); return; }
 if (phase === 'gameover') { drawGameOver(); if (score >= 60) winSound; return; }

 // Move target
 const s = DIFF[difficulty];
 targetY += s.speed * targetDir;
 if (targetY < H * 0.15 + targetR) targetDir = 1;
 if (targetY > H * 0.75 - targetR) targetDir = -1;

 drawTarget();
 drawBow();

 // Aim oscillation
 if (phase === 'aim') {
 aimAngle += 0.02 * aimDir;
 if (aimAngle > 0.5) aimDir = -1;
 if (aimAngle < -0.3) aimDir = 1;
 angle = aimAngle;
 // Draw aim line
 const bowX = W * 0.1, bowY = H * 0.7;
 ctx.setLineDash([5, 5]);
 ctx.beginPath();
 ctx.moveTo(bowX + 30, bowY);
 ctx.lineTo(bowX + W * 0.8, bowY - Math.tan(angle) * W * 0.8);
 ctx.strokeStyle = 'rgba(0,212,255,0.3)';
 ctx.lineWidth = 1;
 ctx.stroke();
 ctx.setLineDash([]);
 }

 if (phase === 'power') {
 power += 1.5 * powerDir;
 if (power >= 100) powerDir = -1;
 if (power <= 0) powerDir = 1;
 }

 if (phase === 'fly') {
 arrowX += arrowVX;
 arrowY += arrowVY;
 arrowVY += 0.15; // gravity
 arrowVX += wind * 0.02; // wind

 // Check hit
 const dx = arrowX - targetX;
 const dy = arrowY - targetY;
 const dist = Math.sqrt(dx*dx + dy*dy);
 if (dist < targetR) {
 arrowFlying = false;
 const pct = 1 - dist / targetR;
 const pts = Math.ceil(pct * 10);
 score += pts;
 hitResult = pts;
 hitTimer = 60;
 hitSound(pts);
 phase = 'result';
 } else if (arrowX > W + 50 || arrowY > H + 50 || arrowX < -50 || arrowY < -50) {
 arrowFlying = false;
 hitResult = 'miss';
 hitTimer = 45;
 missSound();
 phase = 'result';
 }
 }

 drawArrow();
 drawHUD();
 drawResult();
 }

 function onClick(e) {
 const rect = canvas.getBoundingClientRect();
 const mx = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
 const my = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
 const sx = mx / rect.width * W;
 const sy = my / rect.height * H;

 if (phase === 'menu') {
 // Check difficulty buttons
 const bw = 90, bh = 36, gap = 15;
 const startX = W/2 - (bw*3 + gap*2)/2;
 ['easy', 'medium', 'hard'].forEach((d, i) => {
 const x = startX + i * (bw + gap);
 const y = H * 0.42;
 if (sx >= x && sx <= x+bw && sy >= y && sy <= y+bh) {
 difficulty = d;
 }
 });
 // Check start
 if (sx >= W/2-70 && sx <= W/2+70 && sy >= H*0.55 && sy <= H*0.55+50) {
 const s = DIFF[difficulty];
 score = 0;
 round = 0;
 arrows = s.arrows;
 totalRounds = s.arrows;
 newTarget();
 phase = 'aim';
 }
 return;
 }
 if (phase === 'gameover') {
 if (sx >= W/2-70 && sx <= W/2+70 && sy >= H*0.58 && sy <= H*0.58+50) {
 phase = 'menu';
 }
 return;
 }
 if (phase === 'aim') {
 angle = aimAngle;
 phase = 'power';
 power = 0;
 powerDir = 1;
 return;
 }
 if (phase === 'power') {
 // Fire!
 round++;
 arrows--;
 shootSound();
 const bowX = W * 0.1, bowY = H * 0.7;
 arrowX = bowX + 30;
 arrowY = bowY;
 const speed = 5 + (power / 100) * 15;
 arrowVX = speed * Math.cos(-angle);
 arrowVY = speed * Math.sin(-angle);
 arrowFlying = true;
 phase = 'fly';
 return;
 }
 }

 canvas.addEventListener('click', onClick);
 canvas.addEventListener('touchstart', function(e) { e.preventDefault(); onClick(e); }, { passive: false });

 running = true;
 phase = 'menu';
 update();

 gameCleanup = () => {
 running = false;
 cancelAnimationFrame(frameId);
 window.removeEventListener('resize', resize);
 canvas.removeEventListener('click', onClick);
 };
}

// ==================== LUDO BOARD GAME ====================
function initLudo() {
 gameTitle.textContent = 'Ludo';
 gameScoreDisplay.textContent = 'Wins: '+ getHigh('ludo');

 const canvas = document.createElement('canvas');
 canvas.className = 'game-canvas';
 const W = Math.min(window.innerWidth - 20, 500);
 canvas.width = W; canvas.height = W + 80;
 const ctx = canvas.getContext('2d');
 gameArea.appendChild(canvas);

 const CELL = W / 15;
 const BOARD_SIZE = W;

 // Audio context for sounds
 const AudioCtx = window.AudioContext || window.webkitAudioContext;
 const audioCtx = new AudioCtx();
 function playSound(freq, dur, type) {
 try {
 const osc = audioCtx.createOscillator();
 const gain = audioCtx.createGain();
 osc.type = type || 'square';
 osc.frequency.value = freq;
 gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
 gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
 osc.connect(gain); gain.connect(audioCtx.destination);
 osc.start(); osc.stop(audioCtx.currentTime + dur);
 } catch(e) {}
 }
 function diceSound() { for(let i=0;i<3;i++) setTimeout(()=>playSound(200+i*100,0.08, 'triangle'),i*60); }
 function moveSound() { playSound(440,0.1, 'sine'); }
 function captureSound() { playSound(800,0.15, 'square'); playSound(600,0.15, 'square'); }
 function winSound() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>playSound(f,0.3, 'sine'),i*150)); }

 // Colors
 const COLORS = {
 0: { main: '#e74c3c', light: '#ff6b6b', dark: '#c0392b', name: 'Red'},
 1: { main: '#3498db', light: '#5dade2', dark: '#2980b9', name: 'Blue'},
 2: { main: '#f1c40f', light: '#f9e154', dark: '#d4ac0f', name: 'Yellow'},
 3: { main: '#2ecc71', light: '#58d68d', dark: '#27ae60', name: 'Green'}
 };

 // Board layout: 15x15 grid
 // Each player has 4 pieces. Path is 52 cells around the board + 5 home stretch cells per player.
 // We define paths as sequences of (row, col) on the 15x15 grid.

 // Main path (52 cells, shared by all players, starting positions differ)
 // Going clockwise from Red's start
 const mainPath = [
 // Red exits base going up column 6 (from row 6 to row 0)
 [6,1],[6,2],[6,3],[6,4],[6,5],
 // Turn right at top, go across row 0
 [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],
 // Turn down column 8
 [0,7],[0,8],
 // Down column 8
 [1,8],[2,8],[3,8],[4,8],[5,8],
 // Right across row 6
 [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
 // Down
 [7,14],[8,14],
 // Left across row 8
 [8,13],[8,12],[8,11],[8,10],[8,9],
 // Down column 6 (right side)
 [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
 // Left
 [14,7],[14,6],
 // Up column 6 (left side)
 [13,6],[12,6],[11,6],[10,6],[9,6],
 // Left across row 8
 [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
 // Up
 [7,0],[6,0]
];

 // Home stretch paths (5 cells each, leading to center)
 const homeStretch = {
 0: [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]], // Red: row 7, col 1-6
 1: [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]], // Blue: col 7, row 1-6
 2: [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]], // Yellow: row 7, col 13-8
 3: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]] // Green: col 7, row 13-8
 };

 // Start positions on main path for each player
 const startIndex = { 0: 0, 1: 13, 2: 26, 3: 39 };
 // Entry to home stretch: the cell BEFORE entering home stretch
 const homeEntry = { 0: 50, 1: 11, 2: 24, 3: 37 };

 // Base positions (where pieces sit before entering the board)
 const basePositions = {
 0: [[2,2],[2,4],[4,2],[4,4]], // Red: top-left
 1: [[2,10],[2,12],[4,10],[4,12]], // Blue: top-right
 2: [[10,10],[10,12],[12,10],[12,12]], // Yellow: bottom-right
 3: [[10,2],[10,4],[12,2],[12,4]] // Green: bottom-left
 };

 // Safe spots (star positions on mainPath indices)
 const safeSpots = [0, 8, 13, 21, 26, 34, 39, 47];

 // Game state
 let pieces = {}; // pieces[player][pieceIdx] = { state: 'base'|'active'|'home', pathPos: number }
 let currentPlayer = 0;
 let diceValue = 0;
 let diceRolling = false;
 let diceRollFrames = 0;
 let phase = 'roll'; // 'roll', 'rolling', 'select', 'moving', 'gameover'
 let movablePieces = [];
 let animating = false;
 let animPiece = null;
 let animFrom = null;
 let animTo = null;
 let animProgress = 0;
 let winner = -1;
 let running = true;
 let frameId;
 let consecutiveSixes = 0;
 let message = 'Tap to roll dice!';

 // Initialize pieces
 for (let p = 0; p < 4; p++) {
 pieces[p] = [];
 for (let i = 0; i < 4; i++) {
 pieces[p].push({ state: 'base', pathPos: -1, homePos: -1 });
 }
 }

 // Get the absolute position on the main path for a given player and their relative path position
 function getAbsoluteMainPos(player, relPos) {
 return (startIndex[player] + relPos) % 52;
 }

 // Get screen coordinates for a piece
 function getPiecePos(player, piece) {
 const p = pieces[player][piece];
 if (p.state === 'base') {
 const bp = basePositions[player][piece];
 return { x: bp[1] * CELL + CELL/2, y: bp[0] * CELL + CELL/2 };
 }
 if (p.state === 'home') {
 return { x: 7 * CELL + CELL/2, y: 7 * CELL + CELL/2 }; // center
 }
 if (p.homePos >= 0) {
 const hp = homeStretch[player][p.homePos];
 return { x: hp[1] * CELL + CELL/2, y: hp[0] * CELL + CELL/2 };
 }
 const absPos = getAbsoluteMainPos(player, p.pathPos);
 const cell = mainPath[absPos];
 return { x: cell[1] * CELL + CELL/2, y: cell[0] * CELL + CELL/2 };
 }

 // Check if a move is valid
 function canMove(player, pieceIdx, dice) {
 const p = pieces[player][pieceIdx];
 if (p.state === 'home') return false;
 if (p.state === 'base') {
 return dice === 6;
 }
 // Active piece
 if (p.homePos >= 0) {
 // Already on home stretch
 const newHomePos = p.homePos + dice;
 if (newHomePos === 6) return true; // exact to home
 if (newHomePos > 6) return false;
 return true;
 }
 // Check if piece would enter home stretch
 const currentRel = p.pathPos;
 const newRel = currentRel + dice;
 // How many cells until home entry?
 const distToHome = getDistToHome(player, currentRel);
 if (newRel > distToHome + 6) return false; // overshoot home
 return true;
 }

 function getDistToHome(player, relPos) {
 // Distance from relPos to the home entry point
 // Home entry is at relative position: (homeEntry[player] - startIndex[player] + 52) % 52
 // But we need to account for the path going around
 const homeRel = (homeEntry[player] - startIndex[player] + 52) % 52;
 if (relPos <= homeRel) return homeRel - relPos;
 return 52 - relPos + homeRel;
 }

 // Move a piece
 function movePiece(player, pieceIdx, dice, callback) {
 const p = pieces[player][pieceIdx];
 if (p.state === 'base') {
 // Move out of base to start position
 p.state = 'active';
 p.pathPos = 0;
 p.homePos = -1;
 moveSound();
 checkCapture(player, pieceIdx);
 if (callback) callback();
 return;
 }

 if (p.homePos >= 0) {
 // Moving on home stretch
 p.homePos += dice;
 if (p.homePos >= 6) {
 p.state = 'home';
 p.homePos = -1;
 moveSound();
 } else {
 moveSound();
 }
 if (callback) callback();
 return;
 }

 // Moving on main path
 const currentRel = p.pathPos;
 const newRel = currentRel + dice;
 const homeRel = (homeEntry[player] - startIndex[player] + 52) % 52;

 if (currentRel <= homeRel && newRel > homeRel) {
 // Entering home stretch
 const stepsIntoHome = newRel - homeRel - 1;
 p.pathPos = -1;
 p.homePos = stepsIntoHome;
 if (p.homePos >= 6) {
 p.state = 'home';
 p.homePos = -1;
 }
 moveSound();
 } else {
 p.pathPos = newRel % 52;
 // Fix: if we wrapped around and passed home entry
 if (newRel >= 52) {
 const wrappedRel = newRel % 52;
 // Check if home entry was passed during wrap
 if (currentRel > homeRel || wrappedRel > homeRel) {
 // Recalculate properly
 const totalDist = getDistToHome(player, currentRel);
 if (dice > totalDist) {
 const stepsIntoHome2 = dice - totalDist - 1;
 p.pathPos = -1;
 p.homePos = stepsIntoHome2;
 if (p.homePos >= 6) {
 p.state = 'home';
 p.homePos = -1;
 }
 }
 }
 }
 moveSound();
 checkCapture(player, pieceIdx);
 }
 if (callback) callback();
 }

 // Check capture
 function checkCapture(player, pieceIdx) {
 const p = pieces[player][pieceIdx];
 if (p.state!== 'active'|| p.homePos >= 0) return;
 const absPos = getAbsoluteMainPos(player, p.pathPos);

 // Check if on safe spot
 if (safeSpots.includes(absPos)) return;

 for (let op = 0; op < 4; op++) {
 if (op === player) continue;
 for (let oi = 0; oi < 4; oi++) {
 const other = pieces[op][oi];
 if (other.state!== 'active'|| other.homePos >= 0) continue;
 const otherAbs = getAbsoluteMainPos(op, other.pathPos);
 if (otherAbs === absPos) {
 // Capture!
 other.state = 'base';
 other.pathPos = -1;
 other.homePos = -1;
 captureSound();
 message = COLORS[player].name + 'captured '+ COLORS[op].name + '!';
 }
 }
 }
 }

 // Check win condition
 function checkWin(player) {
 return pieces[player].every(p => p.state === 'home');
 }

 // Get movable pieces for current player
 function getMovablePieces(player, dice) {
 const result = [];
 for (let i = 0; i < 4; i++) {
 if (canMove(player, i, dice)) result.push(i);
 }
 return result;
 }

 // AI logic: pick best piece to move
 function aiChoosePiece(player, dice, movable) {
 // Priority: capture > get out on 6 > move piece closest to home > any
 let bestPiece = movable[0];
 let bestScore = -1;

 for (const idx of movable) {
 const p = pieces[player][idx];
 let score = 0;

 if (p.state === 'base') {
 // Getting out of base
 score = 50;
 } else if (p.homePos >= 0) {
 // Moving on home stretch, close to finishing
 score = 80 + p.homePos;
 if (p.homePos + dice === 6) score = 100; // reaches home!
 } else {
 // Check if this move would capture
 const newRel = (p.pathPos + dice) % 52;
 const newAbs = getAbsoluteMainPos(player, newRel);
 let wouldCapture = false;
 for (let op = 0; op < 4; op++) {
 if (op === player) continue;
 for (let oi = 0; oi < 4; oi++) {
 const other = pieces[op][oi];
 if (other.state === 'active'&& other.homePos < 0) {
 if (getAbsoluteMainPos(op, other.pathPos) === newAbs &&!safeSpots.includes(newAbs)) {
 wouldCapture = true;
 }
 }
 }
 }
 if (wouldCapture) score = 90;

 // Check if entering home stretch
 const homeRel = (homeEntry[player] - startIndex[player] + 52) % 52;
 const distToHome = getDistToHome(player, p.pathPos);
 if (dice > distToHome && dice <= distToHome + 6) {
 score = Math.max(score, 85);
 }

 // Prefer piece furthest along
 score = Math.max(score, p.pathPos);
 }

 if (score > bestScore) {
 bestScore = score;
 bestPiece = idx;
 }
 }
 return bestPiece;
 }

 // Draw the board
 function drawBoard() {
 ctx.fillStyle = '#1a1a2e';
 ctx.fillRect(0, 0, canvas.width, canvas.height);

 // Draw colored bases (corners)
 const baseSize = 6 * CELL;
 // Red - top left
 ctx.fillStyle = COLORS[0].dark;
 ctx.fillRect(0, 0, baseSize, baseSize);
 ctx.strokeStyle = COLORS[0].main;
 ctx.lineWidth = 2;
 ctx.strokeRect(1, 1, baseSize-2, baseSize-2);

 // Blue - top right
 ctx.fillStyle = COLORS[1].dark;
 ctx.fillRect(9*CELL, 0, baseSize, baseSize);
 ctx.strokeStyle = COLORS[1].main;
 ctx.strokeRect(9*CELL+1, 1, baseSize-2, baseSize-2);

 // Yellow - bottom right
 ctx.fillStyle = COLORS[2].dark;
 ctx.fillRect(9*CELL, 9*CELL, baseSize, baseSize);
 ctx.strokeStyle = COLORS[2].main;
 ctx.strokeRect(9*CELL+1, 9*CELL+1, baseSize-2, baseSize-2);

 // Green - bottom left
 ctx.fillStyle = COLORS[3].dark;
 ctx.fillRect(0, 9*CELL, baseSize, baseSize);
 ctx.strokeStyle = COLORS[3].main;
 ctx.strokeRect(1, 9*CELL+1, baseSize-2, baseSize-2);

 // Draw base circles (piece starting positions)
 for (let p = 0; p < 4; p++) {
 ctx.fillStyle = COLORS[p].main;
 for (const bp of basePositions[p]) {
 const cx = bp[1]*CELL + CELL/2;
 const cy = bp[0]*CELL + CELL/2;
 // White circle background
 ctx.beginPath();
 ctx.arc(cx, cy, CELL*0.42, 0, Math.PI*2);
 ctx.fillStyle = '#fff';
 ctx.fill();
 ctx.strokeStyle = COLORS[p].main;
 ctx.lineWidth = 2;
 ctx.stroke();
 }
 }

 // Draw main path cells
 for (let i = 0; i < mainPath.length; i++) {
 const [r, c] = mainPath[i];
 const x = c * CELL;
 const y = r * CELL;
 ctx.fillStyle = '#e8e8e8';
 // Color start cells
 if (i === 0) ctx.fillStyle = COLORS[0].light;
 if (i === 13) ctx.fillStyle = COLORS[1].light;
 if (i === 26) ctx.fillStyle = COLORS[2].light;
 if (i === 39) ctx.fillStyle = COLORS[3].light;
 // Safe spots get a star
 ctx.fillRect(x+1, y+1, CELL-2, CELL-2);
 ctx.strokeStyle = '#999';
 ctx.lineWidth = 0.5;
 ctx.strokeRect(x+1, y+1, CELL-2, CELL-2);

 if (safeSpots.includes(i)) {
 ctx.fillStyle = '#ffd700';
 ctx.font = (CELL*0.5) + 'px sans-serif';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('', x+CELL/2, y+CELL/2);
 }
 }

 // Draw home stretch cells
 for (let p = 0; p < 4; p++) {
 for (let i = 0; i < 6; i++) {
 const [r, c] = homeStretch[p][i];
 const x = c * CELL;
 const y = r * CELL;
 ctx.fillStyle = COLORS[p].light;
 ctx.globalAlpha = 0.6 + (i * 0.06);
 ctx.fillRect(x+1, y+1, CELL-2, CELL-2);
 ctx.globalAlpha = 1;
 ctx.strokeStyle = COLORS[p].main;
 ctx.lineWidth = 0.5;
 ctx.strokeRect(x+1, y+1, CELL-2, CELL-2);
 }
 }

 // Draw center (home) triangle
 const cx = 7.5 * CELL;
 const cy = 7.5 * CELL;
 for (let p = 0; p < 4; p++) {
 ctx.fillStyle = COLORS[p].main;
 ctx.beginPath();
 const angle1 = (p * Math.PI / 2) - Math.PI/4;
 const angle2 = angle1 + Math.PI/2;
 ctx.moveTo(cx, cy);
 ctx.lineTo(cx + CELL*1.4*Math.cos(angle1), cy + CELL*1.4*Math.sin(angle1));
 ctx.lineTo(cx + CELL*1.4*Math.cos(angle2), cy + CELL*1.4*Math.sin(angle2));
 ctx.closePath();
 ctx.fill();
 ctx.strokeStyle = '#fff';
 ctx.lineWidth = 1;
 ctx.stroke();
 }
 }

 // Draw a piece
 function drawPiece(x, y, player, highlighted, isStacked) {
 const r = CELL * 0.35;
 const offset = isStacked? -3: 0;

 // Shadow
 ctx.beginPath();
 ctx.arc(x+2, y+2+offset, r, 0, Math.PI*2);
 ctx.fillStyle = 'rgba(0,0,0,0.3)';
 ctx.fill();

 // Main circle
 ctx.beginPath();
 ctx.arc(x, y+offset, r, 0, Math.PI*2);
 ctx.fillStyle = COLORS[player].main;
 ctx.fill();

 // Inner circle
 ctx.beginPath();
 ctx.arc(x, y+offset, r*0.6, 0, Math.PI*2);
 ctx.fillStyle = COLORS[player].light;
 ctx.fill();

 if (highlighted) {
 ctx.beginPath();
 ctx.arc(x, y+offset, r+4, 0, Math.PI*2);
 ctx.strokeStyle = '#fff';
 ctx.lineWidth = 3;
 ctx.stroke();
 ctx.beginPath();
 ctx.arc(x, y+offset, r+4, 0, Math.PI*2);
 ctx.strokeStyle = COLORS[player].main;
 ctx.lineWidth = 1.5;
 ctx.setLineDash([4,4]);
 ctx.stroke();
 ctx.setLineDash([]);
 }
 }

 // Draw dice
 function drawDice(value, x, y, size, rolling) {
 const s = size || CELL * 2;
 // Dice background
 ctx.save();
 ctx.shadowColor = 'rgba(0,0,0,0.5)';
 ctx.shadowBlur = 8;
 ctx.fillStyle = '#fff';
 roundRect(ctx, x-s/2, y-s/2, s, s, 6);
 ctx.fill();
 ctx.restore();
 ctx.strokeStyle = '#333';
 ctx.lineWidth = 2;
 roundRect(ctx, x-s/2, y-s/2, s, s, 6);
 ctx.stroke();

 const v = rolling? Math.floor(Math.random()*6)+1: value;
 const dotR = s * 0.08;
 ctx.fillStyle = '#1a1a2e';

 const cx = x, cy = y;
 const off = s * 0.25;

 // Dot positions
 const dots = {
 1: [[0,0]],
 2: [[-off,-off],[off,off]],
 3: [[-off,-off],[0,0],[off,off]],
 4: [[-off,-off],[off,-off],[-off,off],[off,off]],
 5: [[-off,-off],[off,-off],[0,0],[-off,off],[off,off]],
 6: [[-off,-off],[off,-off],[-off,0],[off,0],[-off,off],[off,off]]
 };

 (dots[v] || dots[1]).forEach(([dx,dy]) => {
 ctx.beginPath();
 ctx.arc(cx+dx, cy+dy, dotR, 0, Math.PI*2);
 ctx.fill();
 });
 }

 function roundRect(ctx, x, y, w, h, r) {
 ctx.beginPath();
 ctx.moveTo(x+r, y);
 ctx.lineTo(x+w-r, y);
 ctx.quadraticCurveTo(x+w, y, x+w, y+r);
 ctx.lineTo(x+w, y+h-r);
 ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
 ctx.lineTo(x+r, y+h);
 ctx.quadraticCurveTo(x, y+h, x, y+h-r);
 ctx.lineTo(x, y+r);
 ctx.quadraticCurveTo(x, y, x+r, y);
 ctx.closePath();
 }

 // Draw all pieces
 function drawPieces() {
 // Track positions for stacking
 const posMap = {};
 for (let p = 0; p < 4; p++) {
 for (let i = 0; i < 4; i++) {
 if (pieces[p][i].state === 'home') continue;
 const pos = getPiecePos(p, i);
 const key = Math.round(pos.x) +', '+ Math.round(pos.y);
 if (!posMap[key]) posMap[key] = [];
 posMap[key].push({player: p, piece: i});
 }
 }

 for (let p = 0; p < 4; p++) {
 for (let i = 0; i < 4; i++) {
 if (pieces[p][i].state === 'home') continue;
 const pos = getPiecePos(p, i);
 const key = Math.round(pos.x) +', '+ Math.round(pos.y);
 const isHighlighted = phase === 'select'&& p === currentPlayer && movablePieces.includes(i);
 const stack = posMap[key];
 const stackIdx = stack? stack.findIndex(s => s.player === p && s.piece === i): 0;
 const isStacked = stack && stack.length > 1;
 const offsetX = isStacked? (stackIdx - (stack.length-1)/2) * 6: 0;
 drawPiece(pos.x + offsetX, pos.y, p, isHighlighted, isStacked);
 }
 }
 }

 // Draw UI
 function drawUI() {
 const uiY = BOARD_SIZE + 5;

 // Current player indicator
 ctx.fillStyle = COLORS[currentPlayer].main;
 ctx.font = 'bold '+ (CELL*0.55) + 'px sans-serif';
 ctx.textAlign = 'left';
 ctx.textBaseline = 'top';
 const turnText = COLORS[currentPlayer].name + "'s turn"+ (currentPlayer === 0? '(You)': '(AI)');
 ctx.fillText(turnText, 8, uiY + 5);

 // Dice
 const diceX = W - CELL*1.5;
 const diceY = uiY + CELL*1;
 drawDice(diceValue, diceX, diceY, CELL*1.5, diceRolling);

 // Message
 ctx.fillStyle = '#aaa';
 ctx.font = (CELL*0.4) + 'px sans-serif';
 ctx.textAlign = 'left';
 ctx.fillText(message, 8, uiY + CELL*1.3);

 // Home count per player
 for (let p = 0; p < 4; p++) {
 const homeCount = pieces[p].filter(pc => pc.state === 'home').length;
 ctx.fillStyle = COLORS[p].main;
 ctx.font = (CELL*0.35) + 'px sans-serif';
 const hx = 8 + p * (W/4);
 ctx.fillText(COLORS[p].name + ': '+ homeCount + '/4', hx, uiY + CELL*2);
 }
 }

 // Main draw
 function draw() {
 drawBoard();
 drawPieces();
 drawUI();
 }

 // Game loop
 function update() {
 if (!running) return;

 if (diceRolling) {
 diceRollFrames++;
 if (diceRollFrames > 20) {
 diceRolling = false;
 diceSound();
 afterRoll();
 }
 }

 draw();
 frameId = requestAnimationFrame(update);
 }

 function afterRoll() {
 movablePieces = getMovablePieces(currentPlayer, diceValue);

 if (movablePieces.length === 0) {
 message = COLORS[currentPlayer].name + 'rolled '+ diceValue + '- no moves!';
 consecutiveSixes = 0;
 setTimeout(() => { nextTurn(); }, 800);
 return;
 }

 if (currentPlayer === 0) {
 // Human player
 if (movablePieces.length === 1) {
 message = 'Moving your piece...';
 setTimeout(() => {
 doMove(currentPlayer, movablePieces[0]);
 }, 300);
 } else {
 message = 'Tap a highlighted piece to move (rolled '+ diceValue +')';
 phase = 'select';
 }
 } else {
 // AI player
 message = COLORS[currentPlayer].name + 'rolled '+ diceValue;
 setTimeout(() => {
 const choice = aiChoosePiece(currentPlayer, diceValue, movablePieces);
 doMove(currentPlayer, choice);
 }, 600);
 }
 }

 function doMove(player, pieceIdx) {
 phase = 'moving';
 movePiece(player, pieceIdx, diceValue, () => {
 if (checkWin(player)) {
 phase = 'gameover';
 winner = player;
 winSound();
 if (player === 0) {
 const wins = getHigh('ludo') + 1;
 setHigh('ludo', wins);
 gameScoreDisplay.textContent = 'Wins: '+ wins;
 message = 'YOU WIN!';
 } else {
 message = COLORS[player].name + 'wins!';
 }
 setTimeout(() => {
 showLudoGameOver(player);
 }, 1500);
 return;
 }

 // Roll again on 6
 if (diceValue === 6) {
 consecutiveSixes++;
 if (consecutiveSixes >= 3) {
 message = 'Three 6s in a row! Turn skipped.';
 consecutiveSixes = 0;
 setTimeout(() => nextTurn(), 600);
 return;
 }
 message = COLORS[currentPlayer].name + 'rolled 6, roll again!';
 setTimeout(() => {
 if (currentPlayer === 0) {
 phase = 'roll';
 message = 'Rolled 6! Tap to roll again!';
 } else {
 rollDice();
 }
 }, 500);
 return;
 }

 consecutiveSixes = 0;
 setTimeout(() => nextTurn(), 400);
 });
 }

 function nextTurn() {
 currentPlayer = (currentPlayer + 1) % 4;
 // Skip players who already won
 let attempts = 0;
 while (checkWin(currentPlayer) && attempts < 4) {
 currentPlayer = (currentPlayer + 1) % 4;
 attempts++;
 }
 if (attempts >= 4) {
 phase = 'gameover';
 return;
 }

 diceValue = 0;
 if (currentPlayer === 0) {
 phase = 'roll';
 message = 'Your turn! Tap to roll dice.';
 } else {
 // AI rolls automatically
 setTimeout(() => rollDice(), 500);
 }
 }

 function rollDice() {
 diceValue = Math.floor(Math.random() * 6) + 1;
 diceRolling = true;
 diceRollFrames = 0;
 phase = 'rolling';
 diceSound();
 }

 function showLudoGameOver(winnerPlayer) {
 const overlay = document.createElement('div');
 overlay.className = 'game-over-overlay';
 overlay.innerHTML =
 '<h2>'+ (winnerPlayer === 0? 'You Win!': COLORS[winnerPlayer].name + 'Wins!') + '</h2>'+
 '<div class="final-score">'+ (winnerPlayer === 0? 'Congratulations!': 'Better luck next time!') + '</div>'+
 '<div class="high-score"> Total Wins: '+ getHigh('ludo') + '</div>';
 const btn = document.createElement('button');
 btn.className = 'game-btn';
 btn.textContent = 'Play Again';
 btn.onclick = () => { overlay.remove(); resetGame(); };
 overlay.appendChild(btn);
 const menuBtn = document.createElement('button');
 menuBtn.className = 'game-btn';
 menuBtn.textContent = 'Menu';
 menuBtn.onclick = () => { overlay.remove(); backToMenu(); };
 overlay.appendChild(menuBtn);
 document.body.appendChild(overlay);
 }

 function resetGame() {
 for (let p = 0; p < 4; p++) {
 for (let i = 0; i < 4; i++) {
 pieces[p][i] = { state: 'base', pathPos: -1, homePos: -1 };
 }
 }
 currentPlayer = 0;
 diceValue = 0;
 phase = 'roll';
 consecutiveSixes = 0;
 winner = -1;
 message = 'Tap to roll dice!';
 }

 // Click/tap handler
 function onClick(e) {
 e.preventDefault();
 const rect = canvas.getBoundingClientRect();
 const scaleX = canvas.width / rect.width;
 const scaleY = canvas.height / rect.height;
 const touch = e.touches? e.touches[0]: e;
 const mx = (touch.clientX - rect.left) * scaleX;
 const my = (touch.clientY - rect.top) * scaleY;

 if (phase === 'roll'&& currentPlayer === 0) {
 rollDice();
 return;
 }

 if (phase === 'select'&& currentPlayer === 0) {
 // Check which highlighted piece was clicked
 let bestDist = CELL;
 let bestPiece = -1;
 for (const idx of movablePieces) {
 const pos = getPiecePos(currentPlayer, idx);
 const dx = mx - pos.x;
 const dy = my - pos.y;
 const dist = Math.sqrt(dx*dx + dy*dy);
 if (dist < bestDist) {
 bestDist = dist;
 bestPiece = idx;
 }
 }
 if (bestPiece >= 0) {
 doMove(currentPlayer, bestPiece);
 }
 }
 }

 canvas.addEventListener('click', onClick);
 canvas.addEventListener('touchstart', function(e) { e.preventDefault(); onClick(e); }, { passive: false });

 // Handle resize
 function resize() {
 const newW = Math.min(window.innerWidth - 20, 500);
 // Don't resize canvas to avoid complexity, it's fine
 }
 window.addEventListener('resize', resize);

 // Start
 running = true;
 phase = 'roll';
 message = 'Your turn! Tap to roll dice.';
 update();

 gameCleanup = () => {
 running = false;
 cancelAnimationFrame(frameId);
 window.removeEventListener('resize', resize);
 canvas.removeEventListener('click', onClick);
 try { audioCtx.close(); } catch(e) {}
 };
}


// ==================== FOUR IN A ROW (Connect 4) ====================
function initConnect4() {
 gameTitle.textContent = 'Four in a Row';
 const best = getHigh('connect4');
 gameScoreDisplay.textContent = best? 'Wins: '+ best: '';

 const AudioCtx = window.AudioContext || window.webkitAudioContext;
 const audioCtx = new AudioCtx();
 function playTone(freq, dur, type) {
 const osc = audioCtx.createOscillator();
 const gain = audioCtx.createGain();
 osc.type = type || 'sine';
 osc.frequency.value = freq;
 gain.gain.value = 0.12;
 osc.connect(gain); gain.connect(audioCtx.destination);
 osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
 osc.stop(audioCtx.currentTime + dur);
 }
 function dropSound() { playTone(300, 0.1, 'triangle'); setTimeout(() => playTone(200, 0.08, 'sine'), 80); }
 function winSound() { [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f, 0.2, 'sine'), i*120)); }
 function drawSound() { playTone(250, 0.3, 'sawtooth'); }

 const ROWS = 6, COLS = 7;
 let board = [];
 let currentPlayer = 1; // 1 = red (human), 2 = yellow (AI)
 let gameOver = false;
 let winCells = [];
 let canvas, ctx, W, H;
 let cellSize, boardX, boardY;
 let hoverCol = -1;
 let dropping = false;
 let dropCol = -1, dropRow = -1, dropY = 0, dropTarget = 0, dropPlayer = 0;
 let frameId;
 let running = false;
 let difficulty = 'medium';
 let phase = 'menu';

 gameArea.innerHTML = '<canvas id="c4-canvas"style="width:100%;height:100%;display:block;border-radius:12px;cursor:pointer;"></canvas>';
 canvas = document.getElementById('c4-canvas');
 ctx = canvas.getContext('2d');

 function resize() {
 const rect = gameArea.getBoundingClientRect();
 W = canvas.width = rect.width;
 H = canvas.height = rect.height;
 cellSize = Math.min((W - 40) / COLS, (H - 120) / (ROWS + 1));
 boardX = (W - cellSize * COLS) / 2;
 boardY = 80;
 }
 resize();
 window.addEventListener('resize', resize);

 function resetBoard() {
 board = [];
 for (let r = 0; r < ROWS; r++) {
 board[r] = [];
 for (let c = 0; c < COLS; c++) board[r][c] = 0;
 }
 currentPlayer = 1;
 gameOver = false;
 winCells = [];
 hoverCol = -1;
 dropping = false;
 }

 function getRow(col) {
 for (let r = ROWS - 1; r >= 0; r--) {
 if (board[r][col] === 0) return r;
 }
 return -1;
 }

 function checkWin(p) {
 // Horizontal
 for (let r = 0; r < ROWS; r++) {
 for (let c = 0; c <= COLS - 4; c++) {
 if (board[r][c]===p && board[r][c+1]===p && board[r][c+2]===p && board[r][c+3]===p) {
 return [[r,c],[r,c+1],[r,c+2],[r,c+3]];
 }
 }
 }
 // Vertical
 for (let r = 0; r <= ROWS - 4; r++) {
 for (let c = 0; c < COLS; c++) {
 if (board[r][c]===p && board[r+1][c]===p && board[r+2][c]===p && board[r+3][c]===p) {
 return [[r,c],[r+1,c],[r+2,c],[r+3,c]];
 }
 }
 }
 // Diagonal down-right
 for (let r = 0; r <= ROWS - 4; r++) {
 for (let c = 0; c <= COLS - 4; c++) {
 if (board[r][c]===p && board[r+1][c+1]===p && board[r+2][c+2]===p && board[r+3][c+3]===p) {
 return [[r,c],[r+1,c+1],[r+2,c+2],[r+3,c+3]];
 }
 }
 }
 // Diagonal down-left
 for (let r = 0; r <= ROWS - 4; r++) {
 for (let c = 3; c < COLS; c++) {
 if (board[r][c]===p && board[r+1][c-1]===p && board[r+2][c-2]===p && board[r+3][c-3]===p) {
 return [[r,c],[r+1,c-1],[r+2,c-2],[r+3,c-3]];
 }
 }
 }
 return null;
 }

 function isBoardFull() {
 for (let c = 0; c < COLS; c++) if (board[0][c] === 0) return false;
 return true;
 }

 function scorePosition(b, p) {
 let score = 0;
 // Center column preference
 for (let r = 0; r < ROWS; r++) if (b[r][3] === p) score += 3;

 function evalWindow(cells) {
 let mine = 0, opp = 0, empty = 0;
 const op = p === 1? 2: 1;
 cells.forEach(v => { if (v===p) mine++; else if (v===op) opp++; else empty++; });
 if (mine === 4) return 100;
 if (mine === 3 && empty === 1) return 5;
 if (mine === 2 && empty === 2) return 2;
 if (opp === 3 && empty === 1) return -4;
 return 0;
 }
 // Horizontal
 for (let r = 0; r < ROWS; r++) for (let c = 0; c <= COLS-4; c++) score += evalWindow([b[r][c],b[r][c+1],b[r][c+2],b[r][c+3]]);
 // Vertical
 for (let r = 0; r <= ROWS-4; r++) for (let c = 0; c < COLS; c++) score += evalWindow([b[r][c],b[r+1][c],b[r+2][c],b[r+3][c]]);
 // Diagonals
 for (let r = 0; r <= ROWS-4; r++) for (let c = 0; c <= COLS-4; c++) score += evalWindow([b[r][c],b[r+1][c+1],b[r+2][c+2],b[r+3][c+3]]);
 for (let r = 0; r <= ROWS-4; r++) for (let c = 3; c < COLS; c++) score += evalWindow([b[r][c],b[r+1][c-1],b[r+2][c-2],b[r+3][c-3]]);
 return score;
 }

 function minimax(b, depth, alpha, beta, maximizing) {
 const p1win = checkWinBoard(b, 2);
 const p2win = checkWinBoard(b, 1);
 if (p1win) return [null, 100000];
 if (p2win) return [null, -100000];
 let full = true;
 for (let c = 0; c < COLS; c++) if (b[0][c]===0) { full = false; break; }
 if (full || depth === 0) return [null, scorePosition(b, 2)];

 if (maximizing) {
 let best = -Infinity, bestCol = 3;
 for (let c = 0; c < COLS; c++) {
 let r = -1;
 for (let rr = ROWS-1; rr >= 0; rr--) { if (b[rr][c]===0) { r = rr; break; } }
 if (r === -1) continue;
 const nb = b.map(row => [...row]);
 nb[r][c] = 2;
 const [, sc] = minimax(nb, depth-1, alpha, beta, false);
 if (sc > best) { best = sc; bestCol = c; }
 alpha = Math.max(alpha, best);
 if (alpha >= beta) break;
 }
 return [bestCol, best];
 } else {
 let best = Infinity, bestCol = 3;
 for (let c = 0; c < COLS; c++) {
 let r = -1;
 for (let rr = ROWS-1; rr >= 0; rr--) { if (b[rr][c]===0) { r = rr; break; } }
 if (r === -1) continue;
 const nb = b.map(row => [...row]);
 nb[r][c] = 1;
 const [, sc] = minimax(nb, depth-1, alpha, beta, true);
 if (sc < best) { best = sc; bestCol = c; }
 beta = Math.min(beta, best);
 if (alpha >= beta) break;
 }
 return [bestCol, best];
 }
 }

 function checkWinBoard(b, p) {
 for (let r = 0; r < ROWS; r++) for (let c = 0; c <= COLS-4; c++) if (b[r][c]===p&&b[r][c+1]===p&&b[r][c+2]===p&&b[r][c+3]===p) return true;
 for (let r = 0; r <= ROWS-4; r++) for (let c = 0; c < COLS; c++) if (b[r][c]===p&&b[r+1][c]===p&&b[r+2][c]===p&&b[r+3][c]===p) return true;
 for (let r = 0; r <= ROWS-4; r++) for (let c = 0; c <= COLS-4; c++) if (b[r][c]===p&&b[r+1][c+1]===p&&b[r+2][c+2]===p&&b[r+3][c+3]===p) return true;
 for (let r = 0; r <= ROWS-4; r++) for (let c = 3; c < COLS; c++) if (b[r][c]===p&&b[r+1][c-1]===p&&b[r+2][c-2]===p&&b[r+3][c-3]===p) return true;
 return false;
 }

 function aiMove() {
 const depths = { easy: 1, medium: 3, hard: 5 };
 const [col] = minimax(board.map(r=>[...r]), depths[difficulty], -Infinity, Infinity, true);
 return col!== null? col: 3;
 }

 function drawBoard() {
 // Background
 ctx.fillStyle = '#1a1a2e';
 ctx.fillRect(0, 0, W, H);

 // Turn indicator
 ctx.textAlign = 'center';
 ctx.font = 'bold 20px Orbitron, sans-serif';
 if (gameOver) {
 if (winCells.length > 0) {
 const winner = currentPlayer === 1? 2: 1;
 ctx.fillStyle = winner === 1? '#ff4444': '#ffdd00';
 ctx.fillText(winner === 1? ' YOU WIN!': ' AI WINS!', W/2, 35);
 } else {
 ctx.fillStyle = '#aaa';
 ctx.fillText("It's a DRAW!", W/2, 35);
 }
 ctx.font = '14px Rajdhani, sans-serif';
 ctx.fillStyle = '#888';
 ctx.fillText('Tap to play again', W/2, 58);
 } else if (!dropping) {
 ctx.fillStyle = currentPlayer === 1? '#ff4444': '#ffdd00';
 ctx.fillText(currentPlayer === 1? ' Your Turn!': ' AI Thinking...', W/2, 35);
 }
 ctx.textAlign = 'left';

 // Board frame
 ctx.fillStyle = '#1a3a8a';
 const pad = 8;
 ctx.beginPath();
 ctx.roundRect(boardX - pad, boardY - pad, cellSize * COLS + pad*2, cellSize * ROWS + pad*2, 12);
 ctx.fill();

 // Hover preview
 if (hoverCol >= 0 &&!gameOver &&!dropping && currentPlayer === 1) {
 const hx = boardX + hoverCol * cellSize + cellSize/2;
 ctx.beginPath();
 ctx.arc(hx, boardY - cellSize/2 - pad, cellSize * 0.38, 0, Math.PI*2);
 ctx.fillStyle = 'rgba(255,68,68,0.5)';
 ctx.fill();
 }

 // Cells
 for (let r = 0; r < ROWS; r++) {
 for (let c = 0; c < COLS; c++) {
 const cx = boardX + c * cellSize + cellSize/2;
 const cy = boardY + r * cellSize + cellSize/2;
 const rad = cellSize * 0.4;

 ctx.beginPath();
 ctx.arc(cx, cy, rad, 0, Math.PI*2);

 const isWin = winCells.some(w => w[0]===r && w[1]===c);
 if (board[r][c] === 1) {
 ctx.fillStyle = isWin? '#ff8888': '#ff4444';
 ctx.fill();
 if (isWin) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke(); }
 } else if (board[r][c] === 2) {
 ctx.fillStyle = isWin? '#ffee88': '#ffdd00';
 ctx.fill();
 if (isWin) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke(); }
 } else {
 ctx.fillStyle = '#0a1a4a';
 ctx.fill();
 }
 }
 }

 // Dropping animation
 if (dropping) {
 const cx = boardX + dropCol * cellSize + cellSize/2;
 ctx.beginPath();
 ctx.arc(cx, dropY, cellSize * 0.4, 0, Math.PI*2);
 ctx.fillStyle = dropPlayer === 1? '#ff4444': '#ffdd00';
 ctx.fill();
 }

 // Difficulty at bottom
 if (!gameOver &&!dropping) {
 ctx.textAlign = 'center';
 ctx.font = '12px Rajdhani, sans-serif';
 ctx.fillStyle = '#555';
 ctx.fillText(difficulty.toUpperCase(), W/2, H - 10);
 ctx.textAlign = 'left';
 }
 }

 function drawMenu() {
 ctx.fillStyle = '#1a1a2e';
 ctx.fillRect(0, 0, W, H);
 ctx.textAlign = 'center';
 ctx.fillStyle = '#fff';
 ctx.font = 'bold 32px Orbitron, sans-serif';
 ctx.fillText(' Four in a Row', W/2, H*0.2);
 ctx.font = '16px Rajdhani, sans-serif';
 ctx.fillStyle = '#aaa';
 ctx.fillText('Drop pieces, connect 4 to win!', W/2, H*0.28);
 ctx.fillText('You are Red, AI is Yellow', W/2, H*0.34);

 const bw = 90, bh = 36, gap = 15;
 const startX = W/2 - (bw*3 + gap*2)/2;
 ['Easy', 'Medium', 'Hard'].forEach((d, i) => {
 const x = startX + i*(bw+gap);
 const y = H*0.42;
 const sel = d.toLowerCase() === difficulty;
 ctx.fillStyle = sel? (i===0?'#00ff88':i===1?'#00d4ff':'#ff4444'): '#333';
 ctx.beginPath(); ctx.roundRect(x, y, bw, bh, 8); ctx.fill();
 ctx.fillStyle = sel? '#000': '#aaa';
 ctx.font = (sel?'bold ':'')+'16px Rajdhani, sans-serif';
 ctx.fillText(d, x+bw/2, y+24);
 });

 ctx.fillStyle = '#00ff88';
 ctx.beginPath(); ctx.roundRect(W/2-70, H*0.55, 140, 50, 12); ctx.fill();
 ctx.fillStyle = '#000';
 ctx.font = 'bold 22px Orbitron, sans-serif';
 ctx.fillText(' START', W/2, H*0.55+35);
 ctx.textAlign = 'left';
 }

 function update() {
 if (!running) return;
 frameId = requestAnimationFrame(update);
 if (phase === 'menu') { drawMenu(); return; }

 if (dropping) {
 dropY += 12;
 if (dropY >= boardY + dropRow * cellSize + cellSize/2) {
 dropY = boardY + dropRow * cellSize + cellSize/2;
 board[dropRow][dropCol] = dropPlayer;
 dropping = false;
 dropSound();

 const w = checkWin(dropPlayer);
 if (w) {
 winCells = w;
 gameOver = true;
 if (dropPlayer === 1) {
 winSound();
 const wins = getHigh('connect4') + 1;
 setHigh('connect4', wins);
 gameScoreDisplay.textContent = 'Wins: '+ wins;
 }
 } else if (isBoardFull()) {
 gameOver = true;
 drawSound();
 } else {
 currentPlayer = currentPlayer === 1? 2: 1;
 if (currentPlayer === 2 &&!gameOver) {
 setTimeout(doAiMove, 400);
 }
 }
 }
 }
 drawBoard();
 }

 function dropPiece(col, player) {
 const row = getRow(col);
 if (row === -1) return false;
 dropping = true;
 dropCol = col;
 dropRow = row;
 dropY = boardY - cellSize/2;
 dropPlayer = player;
 return true;
 }

 function doAiMove() {
 if (gameOver ||!running) return;
 const col = aiMove();
 dropPiece(col, 2);
 }

 function onClick(e) {
 const rect = canvas.getBoundingClientRect();
 const mx = ((e.clientX || (e.touches&&e.touches[0]&&e.touches[0].clientX)) - rect.left) / rect.width * W;
 const my = ((e.clientY || (e.touches&&e.touches[0]&&e.touches[0].clientY)) - rect.top) / rect.height * H;

 if (phase === 'menu') {
 const bw = 90, bh = 36, gap = 15;
 const startX = W/2 - (bw*3+gap*2)/2;
 ['easy', 'medium', 'hard'].forEach((d,i) => {
 const x = startX+i*(bw+gap), y = H*0.42;
 if (mx>=x&&mx<=x+bw&&my>=y&&my<=y+bh) difficulty = d;
 });
 if (mx>=W/2-70&&mx<=W/2+70&&my>=H*0.55&&my<=H*0.55+50) {
 phase = 'play';
 resetBoard();
 }
 return;
 }

 if (gameOver) { phase = 'menu'; return; }
 if (dropping || currentPlayer!== 1) return;

 const col = Math.floor((mx - boardX) / cellSize);
 if (col < 0 || col >= COLS) return;
 dropPiece(col, 1);
 }

 function onMove(e) {
 if (phase!== 'play'|| gameOver || dropping || currentPlayer!== 1) { hoverCol = -1; return; }
 const rect = canvas.getBoundingClientRect();
 const mx = ((e.clientX || (e.touches&&e.touches[0]&&e.touches[0].clientX)) - rect.left) / rect.width * W;
 hoverCol = Math.floor((mx - boardX) / cellSize);
 if (hoverCol < 0 || hoverCol >= COLS) hoverCol = -1;
 }

 canvas.addEventListener('click', onClick);
 canvas.addEventListener('touchstart', function(e) { e.preventDefault(); onClick(e); }, {passive:false});
 canvas.addEventListener('mousemove', onMove);

 running = true;
 phase = 'menu';
 update();

 gameCleanup = () => {
 running = false;
 cancelAnimationFrame(frameId);
 window.removeEventListener('resize', resize);
 };
}


function initChess() {
 gameTitle.textContent = 'Chess';
 const best = getHigh('chess');
 gameScoreDisplay.textContent = best? 'Wins: '+ best: '';

 const AudioCtx = window.AudioContext || window.webkitAudioContext;
 const audioCtx = new AudioCtx();
 function playTone(freq, dur, type) {
 const osc = audioCtx.createOscillator();
 const gain = audioCtx.createGain();
 osc.type = type || 'sine';
 osc.frequency.value = freq;
 gain.gain.value = 0.12;
 osc.connect(gain); gain.connect(audioCtx.destination);
 osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
 osc.stop(audioCtx.currentTime + dur);
 }
 function moveSound() { playTone(400, 0.08, 'triangle'); setTimeout(function() { playTone(500, 0.06, 'sine'); }, 50); }
 function captureSound() { playTone(250, 0.12, 'sawtooth'); setTimeout(function() { playTone(350, 0.1, 'triangle'); }, 60); }
 function checkSound() { playTone(600, 0.15, 'square'); setTimeout(function() { playTone(700, 0.12, 'sine'); }, 80); }
 function checkmateSound() { [523,659,784,1047,1319].forEach(function(f,i) { setTimeout(function() { playTone(f, 0.25, 'sine'); }, i*140); }); }
 function gameOverLoseSound() { [400,350,300,250].forEach(function(f,i) { setTimeout(function() { playTone(f, 0.2, 'sawtooth'); }, i*150); }); }

 // Piece constants
 var EMPTY = 0, WP = 1, WN = 2, WB = 3, WR = 4, WQ = 5, WK = 6;
 var BP = 7, BN = 8, BB = 9, BR = 10, BQ = 11, BK = 12;

 var pieceChars = {};
 pieceChars[WP] = '\u2659'; pieceChars[WN] = '\u2658'; pieceChars[WB] = '\u2657';
 pieceChars[WR] = '\u2656'; pieceChars[WQ] = '\u2655'; pieceChars[WK] = '\u2654';
 pieceChars[BP] = '\u265F'; pieceChars[BN] = '\u265E'; pieceChars[BB] = '\u265D';
 pieceChars[BR] = '\u265C'; pieceChars[BQ] = '\u265B'; pieceChars[BK] = '\u265A';

 var pieceNames = {};
 pieceNames[WP] = 'P'; pieceNames[WN] = 'N'; pieceNames[WB] = 'B';
 pieceNames[WR] = 'R'; pieceNames[WQ] = 'Q'; pieceNames[WK] = 'K';
 pieceNames[BP] = 'P'; pieceNames[BN] = 'N'; pieceNames[BB] = 'B';
 pieceNames[BR] = 'R'; pieceNames[BQ] = 'Q'; pieceNames[BK] = 'K';

 var pieceValues = {};
 pieceValues[WP] = 100; pieceValues[WN] = 320; pieceValues[WB] = 330;
 pieceValues[WR] = 500; pieceValues[WQ] = 900; pieceValues[WK] = 20000;
 pieceValues[BP] = 100; pieceValues[BN] = 320; pieceValues[BB] = 330;
 pieceValues[BR] = 500; pieceValues[BQ] = 900; pieceValues[BK] = 20000;

 function isWhite(p) { return p >= 1 && p <= 6; }
 function isBlack(p) { return p >= 7 && p <= 12; }
 function colorOf(p) { if (isWhite(p)) return 'w'; if (isBlack(p)) return 'b'; return null; }

 // Piece-square tables (from white's perspective, flipped for black)
 var pstPawn = [
 0, 0, 0, 0, 0, 0, 0, 0,
 50, 50, 50, 50, 50, 50, 50, 50,
 10, 10, 20, 30, 30, 20, 10, 10,
 5, 5, 10, 25, 25, 10, 5, 5,
 0, 0, 0, 20, 20, 0, 0, 0,
 5, -5,-10, 0, 0,-10, -5, 5,
 5, 10, 10,-20,-20, 10, 10, 5,
 0, 0, 0, 0, 0, 0, 0, 0
];
 var pstKnight = [
 -50,-40,-30,-30,-30,-30,-40,-50,
 -40,-20, 0, 0, 0, 0,-20,-40,
 -30, 0, 10, 15, 15, 10, 0,-30,
 -30, 5, 15, 20, 20, 15, 5,-30,
 -30, 0, 15, 20, 20, 15, 0,-30,
 -30, 5, 10, 15, 15, 10, 5,-30,
 -40,-20, 0, 5, 5, 0,-20,-40,
 -50,-40,-30,-30,-30,-30,-40,-50
];
 var pstBishop = [
 -20,-10,-10,-10,-10,-10,-10,-20,
 -10, 0, 0, 0, 0, 0, 0,-10,
 -10, 0, 10, 10, 10, 10, 0,-10,
 -10, 5, 5, 10, 10, 5, 5,-10,
 -10, 0, 10, 10, 10, 10, 0,-10,
 -10, 10, 10, 10, 10, 10, 10,-10,
 -10, 5, 0, 0, 0, 0, 5,-10,
 -20,-10,-10,-10,-10,-10,-10,-20
];
 var pstRook = [
 0, 0, 0, 0, 0, 0, 0, 0,
 5, 10, 10, 10, 10, 10, 10, 5,
 -5, 0, 0, 0, 0, 0, 0, -5,
 -5, 0, 0, 0, 0, 0, 0, -5,
 -5, 0, 0, 0, 0, 0, 0, -5,
 -5, 0, 0, 0, 0, 0, 0, -5,
 -5, 0, 0, 0, 0, 0, 0, -5,
 0, 0, 0, 5, 5, 0, 0, 0
];
 var pstQueen = [
 -20,-10,-10, -5, -5,-10,-10,-20,
 -10, 0, 0, 0, 0, 0, 0,-10,
 -10, 0, 5, 5, 5, 5, 0,-10,
 -5, 0, 5, 5, 5, 5, 0, -5,
 0, 0, 5, 5, 5, 5, 0, -5,
 -10, 5, 5, 5, 5, 5, 0,-10,
 -10, 0, 5, 0, 0, 0, 0,-10,
 -20,-10,-10, -5, -5,-10,-10,-20
];
 var pstKing = [
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -20,-30,-30,-40,-40,-30,-30,-20,
 -10,-20,-20,-20,-20,-20,-20,-10,
 20, 20, 0, 0, 0, 0, 20, 20,
 20, 30, 10, 0, 0, 10, 30, 20
];

 function getPST(piece, row, col) {
 var table;
 var baseP = isWhite(piece)? piece: piece - 6;
 if (baseP === 1) table = pstPawn;
 else if (baseP === 2) table = pstKnight;
 else if (baseP === 3) table = pstBishop;
 else if (baseP === 4) table = pstRook;
 else if (baseP === 5) table = pstQueen;
 else if (baseP === 6) table = pstKing;
 else return 0;

 var idx;
 if (isWhite(piece)) {
 idx = row * 8 + col;
 } else {
 idx = (7 - row) * 8 + col;
 }
 return table[idx];
 }

 // Game state
 var board = [];
 var selected = null; // {r, c}
 var validMoves = []; // [{r,c, special}]
 var turn = 'w'; // 'w'or 'b'
 var inCheck = false;
 var gameOverState = null; // null, 'checkmate', 'stalemate'
 var winner = null; // 'w', 'b', or null (draw)
 var castleRights = { wK: true, wQ: true, bK: true, bQ: true };
 var enPassantTarget = null; // {r, c} or null
 var moveHistory = [];
 var capturedWhite = []; // black pieces captured by white
 var capturedBlack = []; // white pieces captured by black
 var difficulty = 'medium';
 var phase = 'menu';
 var running = true;
 var frameId;
 var aiThinking = false;

 var canvas, ctx, W, H;
 var boardSize, cellSize, boardX, boardY;

 gameArea.innerHTML = '<canvas id="chess-canvas"style="width:100%;height:100%;display:block;border-radius:12px;cursor:pointer;"></canvas>';
 canvas = document.getElementById('chess-canvas');
 ctx = canvas.getContext('2d');

 function resize() {
 var rect = gameArea.getBoundingClientRect();
 W = canvas.width = rect.width;
 H = canvas.height = Math.max(rect.height, 500);
 canvas.style.height = H + 'px';
 var maxBoard = Math.min(W - 20, H - 140);
 boardSize = Math.floor(maxBoard / 8) * 8;
 cellSize = boardSize / 8;
 boardX = (W - boardSize) / 2;
 boardY = 70;
 }
 resize();
 window.addEventListener('resize', resize);

 function initBoard() {
 board = [
 [BR, BN, BB, BQ, BK, BB, BN, BR],
 [BP, BP, BP, BP, BP, BP, BP, BP],
 [0, 0, 0, 0, 0, 0, 0, 0],
 [0, 0, 0, 0, 0, 0, 0, 0],
 [0, 0, 0, 0, 0, 0, 0, 0],
 [0, 0, 0, 0, 0, 0, 0, 0],
 [WP, WP, WP, WP, WP, WP, WP, WP],
 [WR, WN, WB, WQ, WK, WB, WN, WR]
];
 turn = 'w';
 selected = null;
 validMoves = [];
 inCheck = false;
 gameOverState = null;
 winner = null;
 castleRights = { wK: true, wQ: true, bK: true, bQ: true };
 enPassantTarget = null;
 moveHistory = [];
 capturedWhite = [];
 capturedBlack = [];
 aiThinking = false;
 }

 function cloneBoard(b) {
 var nb = [];
 for (var r = 0; r < 8; r++) {
 nb[r] = [];
 for (var c = 0; c < 8; c++) nb[r][c] = b[r][c];
 }
 return nb;
 }

 function findKing(b, color) {
 var king = color === 'w'? WK: BK;
 for (var r = 0; r < 8; r++) {
 for (var c = 0; c < 8; c++) {
 if (b[r][c] === king) return { r: r, c: c };
 }
 }
 return null;
 }

 function isAttacked(b, row, col, byColor) {
 // Check if square (row,col) is attacked by any piece of byColor
 var r, c, p;

 // Pawn attacks
 if (byColor === 'w') {
 if (row + 1 < 8) {
 if (col - 1 >= 0 && b[row + 1][col - 1] === WP) return true;
 if (col + 1 < 8 && b[row + 1][col + 1] === WP) return true;
 }
 } else {
 if (row - 1 >= 0) {
 if (col - 1 >= 0 && b[row - 1][col - 1] === BP) return true;
 if (col + 1 < 8 && b[row - 1][col + 1] === BP) return true;
 }
 }

 // Knight attacks
 var knightMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
 var kn = byColor === 'w'? WN: BN;
 for (var i = 0; i < knightMoves.length; i++) {
 r = row + knightMoves[i][0]; c = col + knightMoves[i][1];
 if (r >= 0 && r < 8 && c >= 0 && c < 8 && b[r][c] === kn) return true;
 }

 // King attacks
 var kg = byColor === 'w'? WK: BK;
 for (var dr = -1; dr <= 1; dr++) {
 for (var dc = -1; dc <= 1; dc++) {
 if (dr === 0 && dc === 0) continue;
 r = row + dr; c = col + dc;
 if (r >= 0 && r < 8 && c >= 0 && c < 8 && b[r][c] === kg) return true;
 }
 }

 // Rook/Queen (straight lines)
 var rq1 = byColor === 'w'? WR: BR;
 var rq2 = byColor === 'w'? WQ: BQ;
 var dirs = [[0,1],[0,-1],[1,0],[-1,0]];
 for (var d = 0; d < dirs.length; d++) {
 r = row + dirs[d][0]; c = col + dirs[d][1];
 while (r >= 0 && r < 8 && c >= 0 && c < 8) {
 if (b[r][c]!== EMPTY) {
 if (b[r][c] === rq1 || b[r][c] === rq2) return true;
 break;
 }
 r += dirs[d][0]; c += dirs[d][1];
 }
 }

 // Bishop/Queen (diagonals)
 var bq1 = byColor === 'w'? WB: BB;
 var bq2 = byColor === 'w'? WQ: BQ;
 var diags = [[1,1],[1,-1],[-1,1],[-1,-1]];
 for (var d = 0; d < diags.length; d++) {
 r = row + diags[d][0]; c = col + diags[d][1];
 while (r >= 0 && r < 8 && c >= 0 && c < 8) {
 if (b[r][c]!== EMPTY) {
 if (b[r][c] === bq1 || b[r][c] === bq2) return true;
 break;
 }
 r += diags[d][0]; c += diags[d][1];
 }
 }

 return false;
 }

 function isInCheck(b, color) {
 var king = findKing(b, color);
 if (!king) return false;
 var enemy = color === 'w'? 'b': 'w';
 return isAttacked(b, king.r, king.c, enemy);
 }

 // Generate pseudo-legal moves for a piece at (row, col)
 function generatePieceMoves(b, row, col, cr, ep) {
 var piece = b[row][col];
 if (piece === EMPTY) return [];
 var color = colorOf(piece);
 var moves = [];
 var r, c, d;

 function addMove(tr, tc, special) {
 moves.push({ fr: row, fc: col, tr: tr, tc: tc, special: special || null });
 }

 var base = isWhite(piece)? piece: piece - 6;

 if (base === 1) { // Pawn
 var dir = color === 'w'? -1: 1;
 var startRow = color === 'w'? 6: 1;
 var promoRow = color === 'w'? 0: 7;

 // Forward
 if (row + dir >= 0 && row + dir < 8 && b[row + dir][col] === EMPTY) {
 if (row + dir === promoRow) {
 addMove(row + dir, col, 'promote');
 } else {
 addMove(row + dir, col);
 }
 // Double move
 if (row === startRow && b[row + 2 * dir][col] === EMPTY) {
 addMove(row + 2 * dir, col, 'double');
 }
 }
 // Captures
 for (d = -1; d <= 1; d += 2) {
 c = col + d;
 if (c >= 0 && c < 8 && row + dir >= 0 && row + dir < 8) {
 var target = b[row + dir][c];
 if (target!== EMPTY && colorOf(target)!== color) {
 if (row + dir === promoRow) {
 addMove(row + dir, c, 'promote');
 } else {
 addMove(row + dir, c);
 }
 }
 // En passant
 if (ep && ep.r === row + dir && ep.c === c) {
 addMove(row + dir, c, 'enpassant');
 }
 }
 }
 } else if (base === 2) { // Knight
 var km = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
 for (var i = 0; i < km.length; i++) {
 r = row + km[i][0]; c = col + km[i][1];
 if (r >= 0 && r < 8 && c >= 0 && c < 8) {
 if (b[r][c] === EMPTY || colorOf(b[r][c])!== color) addMove(r, c);
 }
 }
 } else if (base === 3 || base === 4 || base === 5) { // Bishop, Rook, Queen
 var slideDirections = [];
 if (base === 3 || base === 5) slideDirections = slideDirections.concat([[1,1],[1,-1],[-1,1],[-1,-1]]);
 if (base === 4 || base === 5) slideDirections = slideDirections.concat([[0,1],[0,-1],[1,0],[-1,0]]);
 for (d = 0; d < slideDirections.length; d++) {
 r = row + slideDirections[d][0]; c = col + slideDirections[d][1];
 while (r >= 0 && r < 8 && c >= 0 && c < 8) {
 if (b[r][c] === EMPTY) {
 addMove(r, c);
 } else {
 if (colorOf(b[r][c])!== color) addMove(r, c);
 break;
 }
 r += slideDirections[d][0]; c += slideDirections[d][1];
 }
 }
 } else if (base === 6) { // King
 for (var dr = -1; dr <= 1; dr++) {
 for (var dc = -1; dc <= 1; dc++) {
 if (dr === 0 && dc === 0) continue;
 r = row + dr; c = col + dc;
 if (r >= 0 && r < 8 && c >= 0 && c < 8) {
 if (b[r][c] === EMPTY || colorOf(b[r][c])!== color) addMove(r, c);
 }
 }
 }
 // Castling
 var enemy = color === 'w'? 'b': 'w';
 var kRow = color === 'w'? 7: 0;
 if (row === kRow && col === 4) {
 // Kingside
 var ksKey = color === 'w'? 'wK': 'bK';
 if (cr[ksKey] && b[kRow][5] === EMPTY && b[kRow][6] === EMPTY && b[kRow][7] === (color === 'w'? WR: BR)) {
 if (!isAttacked(b, kRow, 4, enemy) &&!isAttacked(b, kRow, 5, enemy) &&!isAttacked(b, kRow, 6, enemy)) {
 addMove(kRow, 6, 'castle_k');
 }
 }
 // Queenside
 var qsKey = color === 'w'? 'wQ': 'bQ';
 if (cr[qsKey] && b[kRow][3] === EMPTY && b[kRow][2] === EMPTY && b[kRow][1] === EMPTY && b[kRow][0] === (color === 'w'? WR: BR)) {
 if (!isAttacked(b, kRow, 4, enemy) &&!isAttacked(b, kRow, 3, enemy) &&!isAttacked(b, kRow, 2, enemy)) {
 addMove(kRow, 2, 'castle_q');
 }
 }
 }
 }

 return moves;
 }

 // Generate all legal moves for a color
 function generateAllMoves(b, color, cr, ep) {
 var allMoves = [];
 for (var r = 0; r < 8; r++) {
 for (var c = 0; c < 8; c++) {
 if (b[r][c]!== EMPTY && colorOf(b[r][c]) === color) {
 var pMoves = generatePieceMoves(b, r, c, cr, ep);
 for (var i = 0; i < pMoves.length; i++) {
 allMoves.push(pMoves[i]);
 }
 }
 }
 }
 return allMoves;
 }

 function generateLegalMoves(b, color, cr, ep) {
 var pseudo = generateAllMoves(b, color, cr, ep);
 var legal = [];
 for (var i = 0; i < pseudo.length; i++) {
 var m = pseudo[i];
 var nb = cloneBoard(b);
 applyMoveOnBoard(nb, m);
 if (!isInCheck(nb, color)) {
 legal.push(m);
 }
 }
 return legal;
 }

 function applyMoveOnBoard(b, move) {
 var piece = b[move.fr][move.fc];
 b[move.tr][move.tc] = piece;
 b[move.fr][move.fc] = EMPTY;

 if (move.special === 'enpassant') {
 var capturedRow = move.fr; // The pawn that's captured is on the same row as the moving pawn
 b[capturedRow][move.tc] = EMPTY;
 } else if (move.special === 'promote') {
 b[move.tr][move.tc] = isWhite(piece)? WQ: BQ;
 } else if (move.special === 'castle_k') {
 var kRow = move.tr;
 b[kRow][5] = b[kRow][7];
 b[kRow][7] = EMPTY;
 } else if (move.special === 'castle_q') {
 var kRow2 = move.tr;
 b[kRow2][3] = b[kRow2][0];
 b[kRow2][0] = EMPTY;
 }
 }

 function makeMove(move) {
 var piece = board[move.fr][move.fc];
 var captured = board[move.tr][move.tc];
 var wasCapture = captured!== EMPTY;
 var color = colorOf(piece);

 // Handle en passant capture
 if (move.special === 'enpassant') {
 captured = board[move.fr][move.tc];
 wasCapture = true;
 }

 // Record captured piece
 if (wasCapture && captured!== EMPTY) {
 if (isWhite(captured)) {
 capturedBlack.push(captured);
 } else {
 capturedWhite.push(captured);
 }
 }

 // Build move notation
 var notation = '';
 var pn = pieceNames[piece];
 var colLetters = 'abcdefgh';
 if (pn!== 'P') notation += pn;
 if (wasCapture) {
 if (pn === 'P') notation += colLetters[move.fc];
 notation += 'x';
 }
 notation += colLetters[move.tc] + (8 - move.tr);
 if (move.special === 'promote') notation += '=Q';
 if (move.special === 'castle_k') notation = 'O-O';
 if (move.special === 'castle_q') notation = 'O-O-O';

 // Apply move on board
 applyMoveOnBoard(board, move);

 // Update en passant target
 if (move.special === 'double') {
 enPassantTarget = { r: (move.fr + move.tr) / 2, c: move.fc };
 } else {
 enPassantTarget = null;
 }

 // Update castling rights
 if (piece === WK) { castleRights.wK = false; castleRights.wQ = false; }
 if (piece === BK) { castleRights.bK = false; castleRights.bQ = false; }
 if (piece === WR && move.fr === 7 && move.fc === 0) castleRights.wQ = false;
 if (piece === WR && move.fr === 7 && move.fc === 7) castleRights.wK = false;
 if (piece === BR && move.fr === 0 && move.fc === 0) castleRights.bQ = false;
 if (piece === BR && move.fr === 0 && move.fc === 7) castleRights.bK = false;
 // If rook is captured
 if (move.tr === 7 && move.tc === 0) castleRights.wQ = false;
 if (move.tr === 7 && move.tc === 7) castleRights.wK = false;
 if (move.tr === 0 && move.tc === 0) castleRights.bQ = false;
 if (move.tr === 0 && move.tc === 7) castleRights.bK = false;

 // Switch turn
 turn = turn === 'w'? 'b': 'w';

 // Check for check/checkmate/stalemate
 inCheck = isInCheck(board, turn);
 var legalMoves = generateLegalMoves(board, turn, castleRights, enPassantTarget);

 if (inCheck) notation += '+';

 if (legalMoves.length === 0) {
 if (inCheck) {
 gameOverState = 'checkmate';
 winner = turn === 'w'? 'b': 'w';
 notation = notation.replace('+', '#');
 if (winner === 'w') {
 checkmateSound();
 var wins = getHigh('chess') + 1;
 setHigh('chess', wins);
 gameScoreDisplay.textContent = 'Wins: '+ wins;
 } else {
 gameOverLoseSound();
 }
 } else {
 gameOverState = 'stalemate';
 winner = null;
 gameOverLoseSound();
 }
 } else {
 if (wasCapture) {
 captureSound();
 } else if (inCheck) {
 checkSound();
 } else {
 moveSound();
 }
 }

 moveHistory.push((color === 'w'? 'W: ': 'B:') + notation);
 if (moveHistory.length > 10) moveHistory.shift();

 selected = null;
 validMoves = [];
 }

 // --- AI ---
 function evaluateBoard(b) {
 var score = 0;
 for (var r = 0; r < 8; r++) {
 for (var c = 0; c < 8; c++) {
 var p = b[r][c];
 if (p === EMPTY) continue;
 var val = pieceValues[p] + getPST(p, r, c);
 if (isWhite(p)) score -= val; // White is the human, we want to minimize for AI
 else score += val;
 }
 }
 return score;
 }

 function minimax(b, depth, alpha, beta, isMaximizing, cr, ep) {
 if (depth === 0) return evaluateBoard(b);

 var color = isMaximizing? 'b': 'w';
 var moves = generateLegalMoves(b, color, cr, ep);

 if (moves.length === 0) {
 if (isInCheck(b, color)) {
 return isMaximizing? -99999 + (3 - depth): 99999 - (3 - depth);
 }
 return 0; // stalemate
 }

 // Move ordering: captures first
 moves.sort(function(a, bb2) {
 var scoreA = b[a.tr][a.tc]!== EMPTY? pieceValues[b[a.tr][a.tc]]: 0;
 var scoreB = b[bb2.tr][bb2.tc]!== EMPTY? pieceValues[b[bb2.tr][bb2.tc]]: 0;
 return scoreB - scoreA;
 });

 var best;
 if (isMaximizing) {
 best = -Infinity;
 for (var i = 0; i < moves.length; i++) {
 var nb = cloneBoard(b);
 var m = moves[i];
 var newCr = { wK: cr.wK, wQ: cr.wQ, bK: cr.bK, bQ: cr.bQ };
 var piece = nb[m.fr][m.fc];
 applyMoveOnBoard(nb, m);

 // Update castling rights
 if (piece === BK) { newCr.bK = false; newCr.bQ = false; }
 if (piece === BR && m.fr === 0 && m.fc === 0) newCr.bQ = false;
 if (piece === BR && m.fr === 0 && m.fc === 7) newCr.bK = false;
 if (m.tr === 7 && m.tc === 0) newCr.wQ = false;
 if (m.tr === 7 && m.tc === 7) newCr.wK = false;

 var newEp = null;
 if (m.special === 'double') newEp = { r: (m.fr + m.tr) / 2, c: m.fc };

 var val = minimax(nb, depth - 1, alpha, beta, false, newCr, newEp);
 if (val > best) best = val;
 if (best > alpha) alpha = best;
 if (beta <= alpha) break;
 }
 } else {
 best = Infinity;
 for (var i = 0; i < moves.length; i++) {
 var nb = cloneBoard(b);
 var m = moves[i];
 var newCr = { wK: cr.wK, wQ: cr.wQ, bK: cr.bK, bQ: cr.bQ };
 var piece = nb[m.fr][m.fc];
 applyMoveOnBoard(nb, m);

 if (piece === WK) { newCr.wK = false; newCr.wQ = false; }
 if (piece === WR && m.fr === 7 && m.fc === 0) newCr.wQ = false;
 if (piece === WR && m.fr === 7 && m.fc === 7) newCr.wK = false;
 if (m.tr === 0 && m.tc === 0) newCr.bQ = false;
 if (m.tr === 0 && m.tc === 7) newCr.bK = false;

 var newEp = null;
 if (m.special === 'double') newEp = { r: (m.fr + m.tr) / 2, c: m.fc };

 var val = minimax(nb, depth - 1, alpha, beta, true, newCr, newEp);
 if (val < best) best = val;
 if (best < beta) beta = best;
 if (beta <= alpha) break;
 }
 }
 return best;
 }

 function aiMove() {
 if (gameOverState || turn!== 'b') return;
 aiThinking = true;

 var depthMap = { easy: 1, medium: 2, hard: 3 };
 var depth = depthMap[difficulty] || 2;

 setTimeout(function() {
 var moves = generateLegalMoves(board, 'b', castleRights, enPassantTarget);
 if (moves.length === 0) { aiThinking = false; return; }

 var bestScore = -Infinity;
 var bestMoves = [];

 for (var i = 0; i < moves.length; i++) {
 var nb = cloneBoard(board);
 var m = moves[i];
 var newCr = { wK: castleRights.wK, wQ: castleRights.wQ, bK: castleRights.bK, bQ: castleRights.bQ };
 applyMoveOnBoard(nb, m);

 var piece = board[m.fr][m.fc];
 if (piece === BK) { newCr.bK = false; newCr.bQ = false; }
 if (piece === BR && m.fr === 0 && m.fc === 0) newCr.bQ = false;
 if (piece === BR && m.fr === 0 && m.fc === 7) newCr.bK = false;
 if (m.tr === 7 && m.tc === 0) newCr.wQ = false;
 if (m.tr === 7 && m.tc === 7) newCr.wK = false;

 var newEp = null;
 if (m.special === 'double') newEp = { r: (m.fr + m.tr) / 2, c: m.fc };

 var score = minimax(nb, depth - 1, -Infinity, Infinity, false, newCr, newEp);

 // Add some randomness for easy mode
 if (difficulty === 'easy') score += (Math.random() - 0.5) * 50;

 if (score > bestScore) {
 bestScore = score;
 bestMoves = [m];
 } else if (score === bestScore) {
 bestMoves.push(m);
 }
 }

 var chosen = bestMoves[Math.floor(Math.random() * bestMoves.length)];
 makeMove(chosen);
 aiThinking = false;
 }, 100);
 }

 // --- DRAWING ---
 function draw() {
 if (!running) return;
 ctx.clearRect(0, 0, W, H);

 if (phase === 'menu') {
 drawMenu();
 } else if (phase === 'playing') {
 drawBoard();
 drawPieces();
 drawUI();
 if (gameOverState) drawGameOver();
 }

 frameId = requestAnimationFrame(draw);
 }

 function drawMenu() {
 // Background
 ctx.fillStyle = '#1a1a2e';
 ctx.fillRect(0, 0, W, H);

 // Title
 ctx.fillStyle = '#e0e0e0';
 ctx.font = 'bold '+ Math.max(28, W * 0.06) + 'px Arial';
 ctx.textAlign = 'center';
 ctx.fillText('Chess', W / 2, H * 0.15);

 // Subtitle
 ctx.font = Math.max(14, W * 0.03) + 'px Arial';
 ctx.fillStyle = '#aaa';
 ctx.fillText('Play as White vs AI', W / 2, H * 0.22);

 // Difficulty buttons
 var btnW = Math.min(180, W * 0.4);
 var btnH = 45;
 var btnX = W / 2 - btnW / 2;
 var startY = H * 0.28;
 var gap = Math.min(55, H * 0.1);
 var diffs = ['easy', 'medium', 'hard'];
 var diffLabels = ['Easy', 'Medium', 'Hard'];
 var diffColors = ['#4CAF50', '#FF9800', '#f44336'];

 for (var i = 0; i < 3; i++) {
 var y = startY + i * gap;
 var isSelected = difficulty === diffs[i];
 ctx.fillStyle = isSelected? diffColors[i]: '#333';
 ctx.strokeStyle = diffColors[i];
 ctx.lineWidth = 2;
 ctx.beginPath();
 ctx.roundRect(btnX, y, btnW, btnH, 8);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = isSelected? '#fff': '#ccc';
 ctx.font = 'bold '+ Math.max(16, W * 0.035) + 'px Arial';
 ctx.fillText(diffLabels[i], W / 2, y + btnH / 2 + 6);
 }

 // START button
 var startBtnY = startY + 3 * gap + 5;
 ctx.fillStyle = '#4a90d9';
 ctx.beginPath();
 ctx.roundRect(btnX, startBtnY, btnW, 50, 10);
 ctx.fill();

 ctx.fillStyle = '#fff';
 ctx.font = 'bold '+ Math.max(18, W * 0.04) + 'px Arial';
 ctx.fillText('START', W / 2, startBtnY + 32);

 // Store button positions for click handling
 canvas._menuBtns = [];
 for (var i = 0; i < 3; i++) {
 canvas._menuBtns.push({ x: btnX, y: startY + i * gap, w: btnW, h: btnH, diff: diffs[i] });
 }
 canvas._startBtn = { x: btnX, y: startBtnY, w: btnW, h: 50 };
 }

 function drawBoard() {
 var lightColor = '#eeeed2';
 var darkColor = '#769656';

 for (var r = 0; r < 8; r++) {
 for (var c = 0; c < 8; c++) {
 var x = boardX + c * cellSize;
 var y = boardY + r * cellSize;
 ctx.fillStyle = (r + c) % 2 === 0? lightColor: darkColor;
 ctx.fillRect(x, y, cellSize, cellSize);

 // Highlight selected square
 if (selected && selected.r === r && selected.c === c) {
 ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
 ctx.fillRect(x, y, cellSize, cellSize);
 }

 // Highlight king in check
 if (inCheck) {
 var king = findKing(board, turn);
 if (king && king.r === r && king.c === c) {
 ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
 ctx.fillRect(x, y, cellSize, cellSize);
 }
 }

 // Highlight last move
 if (moveHistory.length > 0) {
 // We don't store last move coords separately to keep it simple
 }
 }
 }

 // Valid move indicators
 for (var i = 0; i < validMoves.length; i++) {
 var mv = validMoves[i];
 var mx = boardX + mv.tc * cellSize + cellSize / 2;
 var my = boardY + mv.tr * cellSize + cellSize / 2;
 if (board[mv.tr][mv.tc]!== EMPTY) {
 // Capture: draw ring
 ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
 ctx.lineWidth = 3;
 ctx.beginPath();
 ctx.arc(mx, my, cellSize * 0.42, 0, Math.PI * 2);
 ctx.stroke();
 } else {
 // Move: draw dot
 ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
 ctx.beginPath();
 ctx.arc(mx, my, cellSize * 0.15, 0, Math.PI * 2);
 ctx.fill();
 }
 }

 // Board border
 ctx.strokeStyle = '#555';
 ctx.lineWidth = 2;
 ctx.strokeRect(boardX, boardY, boardSize, boardSize);

 // Rank and file labels
 ctx.fillStyle = '#aaa';
 ctx.font = Math.max(10, cellSize * 0.22) + 'px Arial';
 ctx.textAlign = 'center';
 var files = 'abcdefgh';
 for (var c = 0; c < 8; c++) {
 ctx.fillText(files[c], boardX + c * cellSize + cellSize / 2, boardY + boardSize + 15);
 }
 ctx.textAlign = 'right';
 for (var r = 0; r < 8; r++) {
 ctx.fillText(String(8 - r), boardX - 5, boardY + r * cellSize + cellSize / 2 + 4);
 }
 }

 function drawPieces() {
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.font = 'bold '+ Math.max(20, cellSize * 0.7) + 'px Arial';

 for (var r = 0; r < 8; r++) {
 for (var c = 0; c < 8; c++) {
 var p = board[r][c];
 if (p === EMPTY) continue;
 var px = boardX + c * cellSize + cellSize / 2;
 var py = boardY + r * cellSize + cellSize / 2;

 // Draw piece with shadow
 ctx.fillStyle = 'rgba(0,0,0,0.3)';
 ctx.fillText(pieceChars[p], px + 1, py + 2);
 ctx.fillStyle = isWhite(p)? '#fff': '#111';
 ctx.fillText(pieceChars[p], px, py);
 }
 }
 ctx.textBaseline = 'alphabetic';
 }

 function drawUI() {
 // Turn indicator
 ctx.fillStyle = '#e0e0e0';
 ctx.font = 'bold '+ Math.max(14, W * 0.03) + 'px Arial';
 ctx.textAlign = 'center';
 if (aiThinking) {
 ctx.fillText('AI is thinking...', W / 2, boardY - 15);
 } else if (turn === 'w') {
 ctx.fillText('Your turn (White)', W / 2, boardY - 15);
 } else {
 ctx.fillText('Black\'s turn', W / 2, boardY - 15);
 }

 // Captured pieces
 var capY = boardY + boardSize + 25;
 ctx.font = Math.max(12, cellSize * 0.35) + 'px Arial';
 ctx.textAlign = 'left';

 // Pieces captured by white (black pieces)
 if (capturedWhite.length > 0) {
 ctx.fillStyle = '#aaa';
 ctx.fillText('Captured:', boardX, capY);
 var cxOffset = boardX + 70;
 for (var i = 0; i < capturedWhite.length; i++) {
 ctx.fillStyle = '#111';
 ctx.fillText(pieceChars[capturedWhite[i]], cxOffset + i * 18, capY);
 }
 }

 // Pieces captured by black (white pieces)
 if (capturedBlack.length > 0) {
 ctx.fillStyle = '#aaa';
 ctx.fillText('Lost:', boardX, capY + 20);
 var cxOffset2 = boardX + 70;
 for (var i = 0; i < capturedBlack.length; i++) {
 ctx.fillStyle = '#fff';
 ctx.fillText(pieceChars[capturedBlack[i]], cxOffset2 + i * 18, capY + 20);
 }
 }

 // Move history
 var histX = boardX + boardSize + 10;
 var availableW = W - histX - 5;
 if (availableW > 50) {
 ctx.fillStyle = '#aaa';
 ctx.font = Math.max(10, W * 0.02) + 'px Arial';
 ctx.textAlign = 'left';
 ctx.fillText('Moves:', histX, boardY);
 var showMoves = moveHistory.slice(-10);
 for (var i = 0; i < showMoves.length; i++) {
 ctx.fillStyle = '#ccc';
 ctx.fillText(showMoves[i], histX, boardY + 18 + i * 16);
 }
 }

 // Difficulty label
 ctx.fillStyle = '#888';
 ctx.font = Math.max(10, W * 0.02) + 'px Arial';
 ctx.textAlign = 'right';
 var diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
 ctx.fillText('Difficulty: '+ diffLabel, boardX + boardSize, boardY - 15);
 }

 function drawGameOver() {
 ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
 ctx.fillRect(0, 0, W, H);

 ctx.fillStyle = '#fff';
 ctx.font = 'bold '+ Math.max(24, W * 0.05) + 'px Arial';
 ctx.textAlign = 'center';

 if (gameOverState === 'checkmate') {
 if (winner === 'w') {
 ctx.fillText('Checkmate! You Win!', W / 2, H / 2 - 40);
 } else {
 ctx.fillText('Checkmate! AI Wins', W / 2, H / 2 - 40);
 }
 } else {
 ctx.fillText('Stalemate! Draw', W / 2, H / 2 - 40);
 }

 // Retry button
 var btnW2 = Math.min(180, W * 0.4);
 var btnH2 = 45;
 var retryX = W / 2 - btnW2 / 2;
 var retryY = H / 2 + 20;
 ctx.fillStyle = '#4a90d9';
 ctx.beginPath();
 ctx.roundRect(retryX, retryY, btnW2, btnH2, 8);
 ctx.fill();
 ctx.fillStyle = '#fff';
 ctx.font = 'bold '+ Math.max(16, W * 0.035) + 'px Arial';
 ctx.fillText('Play Again', W / 2, retryY + btnH2 / 2 + 6);

 // Menu button
 var menuY = retryY + 60;
 ctx.fillStyle = '#666';
 ctx.beginPath();
 ctx.roundRect(retryX, menuY, btnW2, btnH2, 8);
 ctx.fill();
 ctx.fillStyle = '#fff';
 ctx.fillText('Menu', W / 2, menuY + btnH2 / 2 + 6);

 canvas._retryBtn = { x: retryX, y: retryY, w: btnW2, h: btnH2 };
 canvas._menuBtn2 = { x: retryX, y: menuY, w: btnW2, h: btnH2 };
 }

 // --- INPUT ---
 function getClickPos(e) {
 var rect = canvas.getBoundingClientRect();
 var scaleX = canvas.width / rect.width;
 var scaleY = canvas.height / rect.height;
 var clientX, clientY;
 if (e.touches && e.touches.length > 0) {
 clientX = e.touches[0].clientX;
 clientY = e.touches[0].clientY;
 } else {
 clientX = e.clientX;
 clientY = e.clientY;
 }
 return {
 x: (clientX - rect.left) * scaleX,
 y: (clientY - rect.top) * scaleY
 };
 }

 function hitBox(pos, btn) {
 return pos.x >= btn.x && pos.x <= btn.x + btn.w && pos.y >= btn.y && pos.y <= btn.y + btn.h;
 }

 function onClick(e) {
 var pos = getClickPos(e);

 if (phase === 'menu') {
 // Difficulty buttons
 if (canvas._menuBtns) {
 for (var i = 0; i < canvas._menuBtns.length; i++) {
 if (hitBox(pos, canvas._menuBtns[i])) {
 difficulty = canvas._menuBtns[i].diff;
 return;
 }
 }
 }
 // Start button
 if (canvas._startBtn && hitBox(pos, canvas._startBtn)) {
 initBoard();
 phase = 'playing';
 return;
 }
 return;
 }

 if (phase === 'playing'&& gameOverState) {
 if (canvas._retryBtn && hitBox(pos, canvas._retryBtn)) {
 initBoard();
 return;
 }
 if (canvas._menuBtn2 && hitBox(pos, canvas._menuBtn2)) {
 phase = 'menu';
 return;
 }
 return;
 }

 if (phase === 'playing'&&!gameOverState && turn === 'w'&&!aiThinking) {
 // Convert click to board coordinates
 var col = Math.floor((pos.x - boardX) / cellSize);
 var row = Math.floor((pos.y - boardY) / cellSize);

 if (row < 0 || row > 7 || col < 0 || col > 7) {
 selected = null;
 validMoves = [];
 return;
 }

 // Check if clicking a valid move target
 if (selected) {
 for (var i = 0; i < validMoves.length; i++) {
 if (validMoves[i].tr === row && validMoves[i].tc === col) {
 makeMove(validMoves[i]);
 if (!gameOverState && turn === 'b') {
 aiMove();
 }
 return;
 }
 }
 }

 // Select a piece
 var piece = board[row][col];
 if (piece!== EMPTY && isWhite(piece)) {
 selected = { r: row, c: col };
 validMoves = generateLegalMoves(board, 'w', castleRights, enPassantTarget).filter(function(m) {
 return m.fr === row && m.fc === col;
 });
 } else {
 selected = null;
 validMoves = [];
 }
 }
 }

 canvas.addEventListener('click', onClick);
 canvas.addEventListener('touchstart', function(e) { e.preventDefault(); onClick(e); }, { passive: false });

 running = true;
 phase = 'menu';
 draw();

 gameCleanup = function() {
 running = false;
 cancelAnimationFrame(frameId);
 window.removeEventListener('resize', resize);
 };
}


// ==================== BASKETBALL ====================
function initBasketball() {
 gameTitle.textContent = 'Basketball';
 const best = getHigh('basketball');
 gameScoreDisplay.textContent = best? 'Best: '+ best: '';

 const AudioCtx = window.AudioContext || window.webkitAudioContext;
 const audioCtx = new AudioCtx();
 function playTone(freq, dur, type) {
 const osc = audioCtx.createOscillator();
 const gain = audioCtx.createGain();
 osc.type = type || 'sine';
 osc.frequency.value = freq;
 gain.gain.value = 0.12;
 osc.connect(gain); gain.connect(audioCtx.destination);
 osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
 osc.stop(audioCtx.currentTime + dur);
 }
 function swishSound() { playTone(800, 0.1, 'sine'); setTimeout(() => playTone(1200, 0.15, 'sine'), 80); }
 function bounceSound() { playTone(200, 0.08, 'triangle'); }
 function rimSound() { playTone(400, 0.15, 'triangle'); setTimeout(() => playTone(350, 0.1, 'triangle'), 100); }
 function buzzSound() { playTone(150, 0.4, 'sawtooth'); }
 function winSound() { [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f, 0.2, 'sine'), i*120)); }

 let canvas, ctx, W, H;
 let frameId, running = false;
 let phase = 'menu'; // menu, aiming, flying, result, gameover
 let score = 0, shots = 0, maxShots = 15;
 let streak = 0, bestStreak = 0;
 let difficulty = 'medium';
 let ball, hoop, dragging = false, dragStart = null, dragEnd = null;
 let timeLeft = 45, timerInterval = null;

 const DIFF = {
 easy: { time: 60, shots: 20, hoopW: 70, wind: 0, hoopMove: 0 },
 medium: { time: 45, shots: 15, hoopW: 60, wind: 0.5, hoopMove: 0.5 },
 hard: { time: 30, shots: 12, hoopW: 50, wind: 1.2, hoopMove: 1.0 }
 };

 gameArea.innerHTML = '<canvas id="bb-canvas"style="width:100%;height:100%;display:block;border-radius:12px;cursor:pointer;touch-action:none;"></canvas>';
 canvas = document.getElementById('bb-canvas');
 ctx = canvas.getContext('2d');

 function resize() {
 const rect = gameArea.getBoundingClientRect();
 W = canvas.width = rect.width;
 H = canvas.height = Math.max(rect.height, 480);
 canvas.style.height = H + 'px';
 }
 resize();
 window.addEventListener('resize', resize);

 function resetBall() {
 ball = { x: W / 2, y: H - 60, r: 16, vx: 0, vy: 0, flying: false, trail: [] };
 phase = 'aiming';
 }

 function resetHoop() {
 const s = DIFF[difficulty];
 hoop = { x: W * 0.3 + Math.random() * W * 0.4, y: 100 + Math.random() * 60, w: s.hoopW, dir: 1 };
 }

 function startGame() {
 const s = DIFF[difficulty];
 score = 0; shots = 0; streak = 0; bestStreak = 0;
 maxShots = s.shots;
 timeLeft = s.time;
 resetHoop();
 resetBall();
 phase = 'aiming';
 if (timerInterval) clearInterval(timerInterval);
 timerInterval = setInterval(() => {
 timeLeft--;
 if (timeLeft <= 0) { clearInterval(timerInterval); endGame(); }
 }, 1000);
 }

 function endGame() {
 phase = 'gameover';
 if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
 buzzSound();
 const isNew = setHigh('basketball', score);
 if (isNew) gameScoreDisplay.textContent = 'Best: '+ score;
 }

 function drawCourt() {
 // Sky gradient
 const grad = ctx.createLinearGradient(0, 0, 0, H);
 grad.addColorStop(0, '#1a1a3e');
 grad.addColorStop(0.5, '#2a2a5e');
 grad.addColorStop(1, '#3a2a1a');
 ctx.fillStyle = grad;
 ctx.fillRect(0, 0, W, H);

 // Court floor
 ctx.fillStyle = '#C67C4E';
 ctx.fillRect(0, H - 30, W, 30);
 ctx.fillStyle = '#A0623D';
 ctx.fillRect(0, H - 30, W, 3);

 // Court lines
 ctx.strokeStyle = '#ddd';
 ctx.lineWidth = 2;
 ctx.setLineDash([10, 10]);
 ctx.beginPath();
 ctx.moveTo(0, H - 30);
 ctx.lineTo(W, H - 30);
 ctx.stroke();
 ctx.setLineDash([]);
 }

 function drawHoop() {
 if (!hoop) return;
 // Backboard
 ctx.fillStyle = '#fff';
 ctx.fillRect(hoop.x - 5, hoop.y - 40, 10, 55);
 ctx.strokeStyle = '#333';
 ctx.lineWidth = 2;
 ctx.strokeRect(hoop.x - 5, hoop.y - 40, 10, 55);

 // Backboard square
 ctx.strokeStyle = '#ff4444';
 ctx.lineWidth = 2;
 ctx.strokeRect(hoop.x - 15, hoop.y - 25, 30, 20);

 // Rim (left side)
 ctx.strokeStyle = '#ff6600';
 ctx.lineWidth = 4;
 ctx.beginPath();
 ctx.moveTo(hoop.x - hoop.w / 2, hoop.y + 15);
 ctx.lineTo(hoop.x + hoop.w / 2, hoop.y + 15);
 ctx.stroke();

 // Rim circles
 ctx.beginPath();
 ctx.arc(hoop.x - hoop.w / 2, hoop.y + 15, 4, 0, Math.PI * 2);
 ctx.fillStyle = '#ff6600';
 ctx.fill();
 ctx.beginPath();
 ctx.arc(hoop.x + hoop.w / 2, hoop.y + 15, 4, 0, Math.PI * 2);
 ctx.fill();

 // Net
 ctx.strokeStyle = 'rgba(255,255,255,0.5)';
 ctx.lineWidth = 1;
 for (let i = 0; i < 5; i++) {
 const nx = hoop.x - hoop.w / 2 + (hoop.w / 4) * i;
 ctx.beginPath();
 ctx.moveTo(nx, hoop.y + 15);
 ctx.lineTo(nx + (i < 3? 3: -3), hoop.y + 45);
 ctx.stroke();
 }
 // Horizontal net lines
 for (let j = 0; j < 3; j++) {
 const ny = hoop.y + 20 + j * 8;
 ctx.beginPath();
 ctx.moveTo(hoop.x - hoop.w / 2 + j * 3, ny);
 ctx.lineTo(hoop.x + hoop.w / 2 - j * 3, ny);
 ctx.stroke();
 }
 }

 function drawBall() {
 if (!ball) return;

 // Trail
 ctx.globalAlpha = 0.3;
 for (let i = 0; i < ball.trail.length; i++) {
 const t = ball.trail[i];
 const a = i / ball.trail.length * 0.3;
 ctx.globalAlpha = a;
 ctx.beginPath();
 ctx.arc(t.x, t.y, ball.r * 0.8, 0, Math.PI * 2);
 ctx.fillStyle = '#ff8800';
 ctx.fill();
 }
 ctx.globalAlpha = 1;

 // Ball
 ctx.beginPath();
 ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
 const ballGrad = ctx.createRadialGradient(ball.x - 4, ball.y - 4, 2, ball.x, ball.y, ball.r);
 ballGrad.addColorStop(0, '#ffaa44');
 ballGrad.addColorStop(1, '#cc5500');
 ctx.fillStyle = ballGrad;
 ctx.fill();
 ctx.strokeStyle = '#993300';
 ctx.lineWidth = 2;
 ctx.stroke();

 // Ball lines
 ctx.strokeStyle = '#88330088';
 ctx.lineWidth = 1;
 ctx.beginPath();
 ctx.moveTo(ball.x - ball.r, ball.y);
 ctx.lineTo(ball.x + ball.r, ball.y);
 ctx.stroke();
 ctx.beginPath();
 ctx.arc(ball.x, ball.y, ball.r * 0.7, -0.5, 0.5);
 ctx.stroke();
 }

 function drawAimLine() {
 if (phase!== 'aiming'||!dragging ||!dragStart ||!dragEnd) return;
 const dx = dragStart.x - dragEnd.x;
 const dy = dragStart.y - dragEnd.y;
 const power = Math.min(Math.sqrt(dx * dx + dy * dy), 200);

 // Arrow line
 ctx.strokeStyle = 'rgba(0,212,255,0.6)';
 ctx.lineWidth = 3;
 ctx.setLineDash([8, 4]);
 ctx.beginPath();
 ctx.moveTo(ball.x, ball.y);
 ctx.lineTo(ball.x + dx * 1.5, ball.y + dy * 1.5);
 ctx.stroke();
 ctx.setLineDash([]);

 // Power indicator
 const pct = power / 200;
 ctx.fillStyle = pct < 0.4? '#00ff88': pct < 0.7? '#ffaa00': '#ff4444';
 ctx.font = 'bold 16px Orbitron, sans-serif';
 ctx.textAlign = 'center';
 ctx.fillText(Math.round(pct * 100) + '%', ball.x, ball.y + ball.r + 25);
 ctx.textAlign = 'left';
 }

 function drawHUD() {
 ctx.fillStyle = '#fff';
 ctx.font = 'bold 18px Orbitron, sans-serif';
 ctx.textAlign = 'left';
 ctx.fillText('Score: '+ score, 15, 30);
 ctx.fillText('Shots: '+ (maxShots - shots), 15, 55);
 ctx.textAlign = 'right';
 ctx.fillText(timeLeft + 's', W - 15, 30);
 if (streak >= 2) {
 ctx.fillStyle = '#ffdd00';
 ctx.fillText(streak + 'x streak!', W - 15, 55);
 }
 ctx.textAlign = 'left';
 }

 let resultText = '', resultTimer = 0;
 function showResult(text, color) {
 resultText = text;
 resultTimer = 50;
 phase = 'result';
 }

 function drawResult() {
 if (resultTimer <= 0) return;
 resultTimer--;
 ctx.globalAlpha = Math.min(1, resultTimer / 20);
 ctx.textAlign = 'center';
 ctx.font = 'bold 32px Orbitron, sans-serif';
 ctx.fillStyle = resultText.includes('MISS')? '#ff4444': '#00ff88';
 ctx.fillText(resultText, W / 2, H / 2);
 ctx.globalAlpha = 1;
 ctx.textAlign = 'left';
 if (resultTimer <= 0) {
 if (shots >= maxShots || timeLeft <= 0) { endGame(); }
 else { resetHoop(); resetBall(); }
 }
 }

 function drawMenu() {
 ctx.fillStyle = '#1a1a2e';
 ctx.fillRect(0, 0, W, H);
 ctx.textAlign = 'center';
 ctx.fillStyle = '#fff';
 ctx.font = 'bold 32px Orbitron, sans-serif';
 ctx.fillText('Basketball', W / 2, H * 0.15);
 ctx.font = '50px serif';
 ctx.fillText('', W / 2, H * 0.25);
 ctx.font = '14px Rajdhani, sans-serif';
 ctx.fillStyle = '#aaa';
 ctx.fillText('Drag back and release to shoot!', W / 2, H * 0.32);

 const bw = 90, bh = 36, gap = Math.min(50, H * 0.08);
 const startY = H * 0.38;
 const sx = W / 2 - (bw * 3 + 20) / 2;
 ['Easy', 'Medium', 'Hard'].forEach((d, i) => {
 const x = sx + i * (bw + 10);
 const sel = d.toLowerCase() === difficulty;
 ctx.fillStyle = sel? (i === 0? '#00ff88': i === 1? '#00d4ff': '#ff4444'): '#333';
 ctx.beginPath(); ctx.roundRect(x, startY, bw, bh, 8); ctx.fill();
 ctx.fillStyle = sel? '#000': '#aaa';
 ctx.font = (sel? 'bold ': '') + '16px Rajdhani, sans-serif';
 ctx.fillText(d, x + bw / 2, startY + 24);
 });

 const btnY = startY + gap + bh;
 ctx.fillStyle = '#00ff88';
 ctx.beginPath(); ctx.roundRect(W / 2 - 70, btnY, 140, 50, 12); ctx.fill();
 ctx.fillStyle = '#000';
 ctx.font = 'bold 22px Orbitron, sans-serif';
 ctx.fillText('SHOOT!', W / 2, btnY + 35);
 ctx.textAlign = 'left';

 canvas._menuData = { bw, bh, sx, startY, btnY, gap };
 }

 function drawGameOver() {
 ctx.fillStyle = 'rgba(0,0,0,0.8)';
 ctx.fillRect(0, 0, W, H);
 ctx.textAlign = 'center';
 ctx.font = 'bold 36px Orbitron, sans-serif';
 ctx.fillStyle = score >= 20? '#00ff88': score >= 10? '#ffaa00': '#ff4444';
 ctx.fillText(score >= 20? 'MVP!': score >= 10? 'Nice game!': 'Keep practicing!', W / 2, H * 0.25);
 ctx.fillStyle = '#fff';
 ctx.font = '24px Orbitron, sans-serif';
 ctx.fillText('Score: '+ score, W / 2, H * 0.38);
 ctx.font = '16px Rajdhani, sans-serif';
 ctx.fillStyle = '#aaa';
 ctx.fillText('Best streak: '+ bestStreak + 'x', W / 2, H * 0.46);
 if (score > 0 && score >= getHigh('basketball')) {
 ctx.fillStyle = '#ffdd00';
 ctx.fillText('NEW HIGH SCORE!', W / 2, H * 0.54);
 }

 ctx.fillStyle = '#00d4ff';
 ctx.beginPath(); ctx.roundRect(W / 2 - 70, H * 0.60, 140, 50, 12); ctx.fill();
 ctx.fillStyle = '#000';
 ctx.font = 'bold 20px Orbitron, sans-serif';
 ctx.fillText('RETRY', W / 2, H * 0.60 + 35);
 ctx.textAlign = 'left';
 }

 let wind = 0;
 function update() {
 if (!running) return;
 frameId = requestAnimationFrame(update);

 if (phase === 'menu') { drawMenu(); return; }
 if (phase === 'gameover') { drawGameOver(); return; }

 // Move hoop
 const s = DIFF[difficulty];
 if (s.hoopMove > 0 && hoop) {
 hoop.x += s.hoopMove * hoop.dir;
 if (hoop.x > W - 60) hoop.dir = -1;
 if (hoop.x < 60) hoop.dir = 1;
 }

 // Ball physics
 if (ball && ball.flying) {
 ball.trail.push({ x: ball.x, y: ball.y });
 if (ball.trail.length > 12) ball.trail.shift();
 ball.vy += 0.35; // gravity
 ball.vx += wind * 0.01;
 ball.x += ball.vx;
 ball.y += ball.vy;

 // Check hoop collision
 if (hoop) {
 const hoopTop = hoop.y + 15;
 const hoopLeft = hoop.x - hoop.w / 2;
 const hoopRight = hoop.x + hoop.w / 2;

 // Score: ball passes through hoop from above
 if (ball.vy > 0 && ball.y > hoopTop - 5 && ball.y < hoopTop + 20 &&
 ball.x > hoopLeft + 5 && ball.x < hoopRight - 5) {
 ball.flying = false;
 const points = streak >= 2? 3: 2;
 score += points;
 streak++;
 if (streak > bestStreak) bestStreak = streak;
 swishSound();
 showResult(points === 3? 'SWISH! +3': 'SCORE! +2');
 }
 // Rim bounce
 else if (ball.y > hoopTop - ball.r && ball.y < hoopTop + ball.r + 10) {
 const dLeft = Math.abs(ball.x - hoopLeft);
 const dRight = Math.abs(ball.x - hoopRight);
 if (dLeft < ball.r + 5 || dRight < ball.r + 5) {
 ball.vx = -ball.vx * 0.6;
 ball.vy = -ball.vy * 0.4;
 rimSound();
 }
 }
 }

 // Out of bounds
 if (ball.y > H + 50 || ball.x < -50 || ball.x > W + 50) {
 ball.flying = false;
 if (phase!== 'result') {
 streak = 0;
 bounceSound();
 showResult('MISS!');
 }
 }
 }

 drawCourt();
 drawHoop();
 drawBall();
 drawAimLine();
 drawHUD();
 drawResult();
 }

 function getPos(e) {
 const rect = canvas.getBoundingClientRect();
 const cx = (e.touches? e.touches[0].clientX: e.clientX);
 const cy = (e.touches? e.touches[0].clientY: e.clientY);
 return { x: (cx - rect.left) / rect.width * W, y: (cy - rect.top) / rect.height * H };
 }

 function onDown(e) {
 e.preventDefault();
 const pos = getPos(e);

 if (phase === 'menu') {
 const m = canvas._menuData;
 if (m) {
 ['easy', 'medium', 'hard'].forEach((d, i) => {
 const x = m.sx + i * (m.bw + 10);
 if (pos.x >= x && pos.x <= x + m.bw && pos.y >= m.startY && pos.y <= m.startY + m.bh) {
 difficulty = d;
 }
 });
 if (pos.x >= W / 2 - 70 && pos.x <= W / 2 + 70 && pos.y >= m.btnY && pos.y <= m.btnY + 50) {
 startGame();
 }
 }
 return;
 }
 if (phase === 'gameover') {
 if (pos.x >= W / 2 - 70 && pos.x <= W / 2 + 70 && pos.y >= H * 0.60 && pos.y <= H * 0.60 + 50) {
 phase = 'menu';
 }
 return;
 }
 if (phase === 'aiming'&& ball) {
 const dx = pos.x - ball.x;
 const dy = pos.y - ball.y;
 if (Math.sqrt(dx * dx + dy * dy) < 60) {
 dragging = true;
 dragStart = { x: ball.x, y: ball.y };
 dragEnd = pos;
 }
 }
 }

 function onMove(e) {
 e.preventDefault();
 if (!dragging) return;
 dragEnd = getPos(e);
 }

 function onUp(e) {
 e.preventDefault();
 if (!dragging ||!dragStart ||!dragEnd ||!ball) { dragging = false; return; }
 dragging = false;

 const dx = dragStart.x - dragEnd.x;
 const dy = dragStart.y - dragEnd.y;
 const power = Math.min(Math.sqrt(dx * dx + dy * dy), 200);

 if (power < 15) return; // too weak

 const s = DIFF[difficulty];
 wind = (Math.random() - 0.5) * s.wind * 2;
 ball.vx = dx * 0.08;
 ball.vy = dy * 0.08;
 ball.flying = true;
 ball.trail = [];
 shots++;
 phase = 'flying';
 }

 canvas.addEventListener('mousedown', onDown);
 canvas.addEventListener('mousemove', onMove);
 canvas.addEventListener('mouseup', onUp);
 canvas.addEventListener('touchstart', onDown, { passive: false });
 canvas.addEventListener('touchmove', onMove, { passive: false });
 canvas.addEventListener('touchend', onUp, { passive: false });

 running = true;
 phase = 'menu';
 update();

 gameCleanup = () => {
 running = false;
 cancelAnimationFrame(frameId);
 if (timerInterval) clearInterval(timerInterval);
 window.removeEventListener('resize', resize);
 };
}

// ==================== SOCCER (Penalty Kicks) ====================
function initSoccer() {
 gameTitle.textContent = 'Soccer';
 const best = getHigh('soccer');
 gameScoreDisplay.textContent = best? 'Best: '+ best: '';

 const AudioCtx = window.AudioContext || window.webkitAudioContext;
 const audioCtx = new AudioCtx();
 function playTone(freq, dur, type) {
 const osc = audioCtx.createOscillator();
 const gain = audioCtx.createGain();
 osc.type = type || 'sine';
 osc.frequency.value = freq;
 gain.gain.value = 0.12;
 osc.connect(gain); gain.connect(audioCtx.destination);
 osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
 osc.stop(audioCtx.currentTime + dur);
 }
 function goalSound() { [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f, 0.15, 'sine'), i*100)); }
 function saveSound() { playTone(200, 0.3, 'sawtooth'); }
 function kickSound() { playTone(150, 0.08, 'triangle'); setTimeout(() => playTone(250, 0.06, 'sine'), 50); }
 function postSound() { playTone(800, 0.2, 'triangle'); }
 function crowdSound() { playTone(300, 0.5, 'sawtooth'); }

 let canvas, ctx, W, H, frameId, running = false;
 let phase = 'menu';
 let score = 0, round = 0, maxRounds = 10;
 let difficulty = 'medium';
 let ball, goal, keeper, aiming = false, kicked = false;
 let dragStart = null, dragEnd = null, dragging = false;
 let resultText = '', resultTimer = 0, resultColor = '';

 const DIFF = {
 easy: { keeperSpeed: 1.5, keeperW: 50, rounds: 10, goalW: 280 },
 medium: { keeperSpeed: 2.5, keeperW: 60, rounds: 10, goalW: 260 },
 hard: { keeperSpeed: 4.0, keeperW: 75, rounds: 10, goalW: 240 }
 };

 gameArea.innerHTML = '<canvas id="sc-canvas"style="width:100%;height:100%;display:block;border-radius:12px;cursor:pointer;touch-action:none;"></canvas>';
 canvas = document.getElementById('sc-canvas');
 ctx = canvas.getContext('2d');

 function resize() {
 const rect = gameArea.getBoundingClientRect();
 W = canvas.width = rect.width;
 H = canvas.height = Math.max(rect.height, 480);
 canvas.style.height = H + 'px';
 }
 resize();
 window.addEventListener('resize', resize);

 function resetRound() {
 const s = DIFF[difficulty];
 ball = { x: W/2, y: H - 80, r: 14, vx: 0, vy: 0, flying: false, trail: [], scale: 1 };
 goal = { x: W/2, y: 80, w: s.goalW, h: 80 };
 keeper = { x: W/2, y: goal.y + goal.h - 30, w: s.keeperW, h: 40, dir: 1, speed: s.keeperSpeed };
 kicked = false;
 aiming = true;
 phase = 'aiming';
 }

 function startGame() {
 const s = DIFF[difficulty];
 score = 0; round = 0; maxRounds = s.rounds;
 resetRound();
 }

 function endGame() {
 phase = 'gameover';
 const isNew = setHigh('soccer', score);
 if (isNew) gameScoreDisplay.textContent = 'Best: '+ score;
 if (score >= 7) crowdSound();
 }

 function drawField() {
 // Grass
 const grad = ctx.createLinearGradient(0, 0, 0, H);
 grad.addColorStop(0, '#1a3a1a');
 grad.addColorStop(0.3, '#2a5a2a');
 grad.addColorStop(1, '#3a7a3a');
 ctx.fillStyle = grad;
 ctx.fillRect(0, 0, W, H);

 // Grass stripes
 for (let i = 0; i < H; i += 40) {
 ctx.fillStyle = i % 80 === 0? 'rgba(255,255,255,0.03)': 'rgba(0,0,0,0.03)';
 ctx.fillRect(0, i, W, 20);
 }

 // Center circle
 ctx.strokeStyle = 'rgba(255,255,255,0.15)';
 ctx.lineWidth = 2;
 ctx.beginPath();
 ctx.arc(W/2, H/2, 60, 0, Math.PI*2);
 ctx.stroke();

 // Penalty box
 ctx.strokeStyle = 'rgba(255,255,255,0.2)';
 ctx.strokeRect(W/2 - 150, 0, 300, 200);
 ctx.strokeRect(W/2 - 80, 0, 160, 100);
 }

 function drawGoal() {
 if (!goal) return;
 const gx = goal.x - goal.w/2;
 const gy = goal.y;

 // Goal posts
 ctx.fillStyle = '#fff';
 ctx.fillRect(gx - 6, gy, 6, goal.h);
 ctx.fillRect(gx + goal.w, gy, 6, goal.h);
 // Crossbar
 ctx.fillRect(gx - 6, gy - 6, goal.w + 12, 6);

 // Net
 ctx.strokeStyle = 'rgba(255,255,255,0.2)';
 ctx.lineWidth = 1;
 for (let nx = gx; nx <= gx + goal.w; nx += 15) {
 ctx.beginPath(); ctx.moveTo(nx, gy); ctx.lineTo(nx, gy + goal.h); ctx.stroke();
 }
 for (let ny = gy; ny <= gy + goal.h; ny += 15) {
 ctx.beginPath(); ctx.moveTo(gx, ny); ctx.lineTo(gx + goal.w, ny); ctx.stroke();
 }

 // Green behind net
 ctx.fillStyle = 'rgba(0,50,0,0.5)';
 ctx.fillRect(gx, gy, goal.w, goal.h);
 }

 function drawKeeper() {
 if (!keeper) return;
 // Body
 ctx.fillStyle = '#ffdd00';
 ctx.fillRect(keeper.x - keeper.w/2, keeper.y - keeper.h/2, keeper.w, keeper.h);
 // Shirt
 ctx.fillStyle = '#ff4444';
 ctx.fillRect(keeper.x - keeper.w/2 + 5, keeper.y - keeper.h/2 + 5, keeper.w - 10, keeper.h/2);
 // Head
 ctx.beginPath();
 ctx.arc(keeper.x, keeper.y - keeper.h/2 - 8, 10, 0, Math.PI*2);
 ctx.fillStyle = '#ffcc99';
 ctx.fill();
 // Gloves
 ctx.fillStyle = '#00cc00';
 ctx.fillRect(keeper.x - keeper.w/2 - 8, keeper.y - 10, 10, 15);
 ctx.fillRect(keeper.x + keeper.w/2 - 2, keeper.y - 10, 10, 15);
 }

 function drawBall() {
 if (!ball) return;
 // Trail
 for (let i = 0; i < ball.trail.length; i++) {
 const t = ball.trail[i];
 ctx.globalAlpha = i / ball.trail.length * 0.3;
 ctx.beginPath();
 ctx.arc(t.x, t.y, ball.r * t.s * 0.7, 0, Math.PI*2);
 ctx.fillStyle = '#fff';
 ctx.fill();
 }
 ctx.globalAlpha = 1;

 // Ball shadow
 ctx.beginPath();
 ctx.ellipse(ball.x + 3, ball.y + 3, ball.r * ball.scale, ball.r * ball.scale * 0.6, 0, 0, Math.PI*2);
 ctx.fillStyle = 'rgba(0,0,0,0.3)';
 ctx.fill();

 // Ball
 ctx.beginPath();
 ctx.arc(ball.x, ball.y, ball.r * ball.scale, 0, Math.PI*2);
 ctx.fillStyle = '#fff';
 ctx.fill();
 ctx.strokeStyle = '#333';
 ctx.lineWidth = 1.5;
 ctx.stroke();

 // Pentagon pattern
 ctx.fillStyle = '#333';
 ctx.beginPath();
 ctx.arc(ball.x - 3, ball.y - 2, ball.r * ball.scale * 0.25, 0, Math.PI*2);
 ctx.fill();
 ctx.beginPath();
 ctx.arc(ball.x + 4, ball.y + 3, ball.r * ball.scale * 0.2, 0, Math.PI*2);
 ctx.fill();
 }

 function drawAim() {
 if (phase!== 'aiming'||!dragging ||!dragStart ||!dragEnd) return;
 const dx = dragStart.x - dragEnd.x;
 const dy = dragStart.y - dragEnd.y;
 const power = Math.min(Math.sqrt(dx*dx + dy*dy), 200);
 ctx.strokeStyle = 'rgba(255,255,255,0.4)';
 ctx.lineWidth = 2;
 ctx.setLineDash([6,4]);
 ctx.beginPath();
 ctx.moveTo(ball.x, ball.y);
 ctx.lineTo(ball.x + dx * 2, ball.y + dy * 2);
 ctx.stroke();
 ctx.setLineDash([]);

 const pct = power / 200;
 ctx.fillStyle = pct < 0.4? '#00ff88': pct < 0.7? '#ffaa00': '#ff4444';
 ctx.font = 'bold 14px Orbitron, sans-serif';
 ctx.textAlign = 'center';
 ctx.fillText(Math.round(pct * 100) + '%', ball.x, ball.y + 30);
 ctx.textAlign = 'left';
 }

 function drawHUD() {
 ctx.fillStyle = '#fff';
 ctx.font = 'bold 18px Orbitron, sans-serif';
 ctx.textAlign = 'left';
 ctx.fillText('Goals: '+ score, 15, 30);
 ctx.textAlign = 'right';
 ctx.fillText('Round: '+ round + '/'+ maxRounds, W - 15, 30);
 ctx.textAlign = 'left';
 }

 function drawResultText() {
 if (resultTimer <= 0) return;
 resultTimer--;
 ctx.globalAlpha = Math.min(1, resultTimer / 20);
 ctx.textAlign = 'center';
 ctx.font = 'bold 36px Orbitron, sans-serif';
 ctx.fillStyle = resultColor;
 ctx.fillText(resultText, W/2, H/2);
 ctx.globalAlpha = 1;
 ctx.textAlign = 'left';
 if (resultTimer <= 0) {
 if (round >= maxRounds) endGame();
 else resetRound();
 }
 }

 function drawMenu() {
 ctx.fillStyle = '#1a3a1a';
 ctx.fillRect(0, 0, W, H);
 ctx.textAlign = 'center';
 ctx.fillStyle = '#fff';
 ctx.font = 'bold 32px Orbitron, sans-serif';
 ctx.fillText('Soccer', W/2, H*0.12);
 ctx.font = '50px serif';
 ctx.fillText('', W/2, H*0.22);
 ctx.font = '14px Rajdhani, sans-serif';
 ctx.fillStyle = '#aaa';
 ctx.fillText('Drag back and release to kick!', W/2, H*0.30);

 const bw = 90, bh = 36;
 const startY = H * 0.36;
 const sx = W/2 - (bw*3+20)/2;
 ['Easy', 'Medium', 'Hard'].forEach((d,i) => {
 const x = sx + i*(bw+10);
 const sel = d.toLowerCase() === difficulty;
 ctx.fillStyle = sel? (i===0?'#00ff88':i===1?'#00d4ff':'#ff4444'): '#333';
 ctx.beginPath(); ctx.roundRect(x, startY, bw, bh, 8); ctx.fill();
 ctx.fillStyle = sel? '#000': '#aaa';
 ctx.font = (sel?'bold ':'')+'16px Rajdhani, sans-serif';
 ctx.fillText(d, x+bw/2, startY+24);
 });

 const btnY = startY + bh + 25;
 ctx.fillStyle = '#00ff88';
 ctx.beginPath(); ctx.roundRect(W/2-70, btnY, 140, 50, 12); ctx.fill();
 ctx.fillStyle = '#000';
 ctx.font = 'bold 22px Orbitron, sans-serif';
 ctx.fillText('KICK OFF!', W/2, btnY+35);
 ctx.textAlign = 'left';
 canvas._menuData = { bw, bh, sx, startY, btnY };
 }

 function drawGameOver() {
 ctx.fillStyle = 'rgba(0,0,0,0.8)';
 ctx.fillRect(0, 0, W, H);
 ctx.textAlign = 'center';
 ctx.font = 'bold 36px Orbitron, sans-serif';
 ctx.fillStyle = score >= 7? '#00ff88': score >= 4? '#ffaa00': '#ff4444';
 ctx.fillText(score >= 7? 'CHAMPION!': score >= 4? 'Good game!': 'Keep trying!', W/2, H*0.25);
 ctx.fillStyle = '#fff';
 ctx.font = '24px Orbitron, sans-serif';
 ctx.fillText('Goals: '+ score + '/ '+ maxRounds, W/2, H*0.38);

 if (score >= getHigh('soccer')) {
 ctx.fillStyle = '#ffdd00'; ctx.font = '16px Rajdhani, sans-serif';
 ctx.fillText('NEW HIGH SCORE!', W/2, H*0.47);
 }

 ctx.fillStyle = '#00d4ff';
 ctx.beginPath(); ctx.roundRect(W/2-70, H*0.55, 140, 50, 12); ctx.fill();
 ctx.fillStyle = '#000';
 ctx.font = 'bold 20px Orbitron, sans-serif';
 ctx.fillText('RETRY', W/2, H*0.55+35);
 ctx.textAlign = 'left';
 }

 function update() {
 if (!running) return;
 frameId = requestAnimationFrame(update);

 if (phase === 'menu') { drawMenu(); return; }
 if (phase === 'gameover') { drawGameOver(); return; }

 // Move keeper
 if (keeper &&!kicked) {
 keeper.x += keeper.speed * keeper.dir;
 const gLeft = goal.x - goal.w/2 + keeper.w/2 + 10;
 const gRight = goal.x + goal.w/2 - keeper.w/2 - 10;
 if (keeper.x > gRight) keeper.dir = -1;
 if (keeper.x < gLeft) keeper.dir = 1;
 }

 // Ball physics
 if (ball && ball.flying) {
 ball.trail.push({ x: ball.x, y: ball.y, s: ball.scale });
 if (ball.trail.length > 10) ball.trail.shift();
 ball.x += ball.vx;
 ball.y += ball.vy;
 ball.scale = Math.max(0.5, ball.scale - 0.003); // shrink as it goes far

 // Keeper dive (after kick)
 if (kicked && keeper) {
 const kdx = ball.x - keeper.x;
 keeper.x += Math.sign(kdx) * keeper.speed * 1.5;
 }

 // Check goal
 if (ball.y <= goal.y + goal.h && ball.y >= goal.y) {
 const gLeft = goal.x - goal.w/2;
 const gRight = goal.x + goal.w/2;

 // Hit post?
 if (Math.abs(ball.x - gLeft) < 8 || Math.abs(ball.x - gRight) < 8 || ball.y <= goal.y + 5) {
 ball.flying = false;
 postSound();
 resultText = 'HIT THE POST!'; resultColor = '#ffaa00'; resultTimer = 50;
 phase = 'result';
 }
 // Saved by keeper?
 else if (keeper && Math.abs(ball.x - keeper.x) < keeper.w/2 + ball.r && Math.abs(ball.y - keeper.y) < keeper.h/2 + ball.r) {
 ball.flying = false;
 saveSound();
 resultText = 'SAVED!'; resultColor = '#ff4444'; resultTimer = 50;
 phase = 'result';
 }
 // GOAL!
 else if (ball.x > gLeft + 8 && ball.x < gRight - 8) {
 ball.flying = false;
 score++;
 goalSound();
 resultText = 'GOAL!!!'; resultColor = '#00ff88'; resultTimer = 60;
 phase = 'result';
 }
 }

 // Miss (over the bar or wide)
 if (ball.y < goal.y - 30 || ball.x < -50 || ball.x > W + 50) {
 ball.flying = false;
 saveSound();
 resultText = 'MISS!'; resultColor = '#ff4444'; resultTimer = 50;
 phase = 'result';
 }
 }

 drawField();
 drawGoal();
 drawKeeper();
 drawBall();
 drawAim();
 drawHUD();
 drawResultText();
 }

 function getPos(e) {
 const rect = canvas.getBoundingClientRect();
 const cx = (e.touches? e.touches[0].clientX: e.clientX);
 const cy = (e.touches? e.touches[0].clientY: e.clientY);
 return { x: (cx - rect.left)/rect.width*W, y: (cy - rect.top)/rect.height*H };
 }

 function onDown(e) {
 e.preventDefault();
 const pos = getPos(e);
 if (phase === 'menu') {
 const m = canvas._menuData;
 if (m) {
 ['easy', 'medium', 'hard'].forEach((d,i) => {
 const x = m.sx + i*(m.bw+10);
 if (pos.x>=x && pos.x<=x+m.bw && pos.y>=m.startY && pos.y<=m.startY+m.bh) difficulty = d;
 });
 if (pos.x>=W/2-70 && pos.x<=W/2+70 && pos.y>=m.btnY && pos.y<=m.btnY+50) startGame();
 }
 return;
 }
 if (phase === 'gameover') {
 if (pos.x>=W/2-70 && pos.x<=W/2+70 && pos.y>=H*0.55 && pos.y<=H*0.55+50) phase = 'menu';
 return;
 }
 if (phase === 'aiming'&& ball) {
 const dx = pos.x - ball.x, dy = pos.y - ball.y;
 if (Math.sqrt(dx*dx+dy*dy) < 60) {
 dragging = true;
 dragStart = { x: ball.x, y: ball.y };
 dragEnd = pos;
 }
 }
 }
 function onMove(e) { e.preventDefault(); if (dragging) dragEnd = getPos(e); }
 function onUp(e) {
 e.preventDefault();
 if (!dragging ||!dragStart ||!dragEnd ||!ball) { dragging = false; return; }
 dragging = false;
 const dx = dragStart.x - dragEnd.x, dy = dragStart.y - dragEnd.y;
 const power = Math.min(Math.sqrt(dx*dx+dy*dy), 200);
 if (power < 15) return;
 ball.vx = dx * 0.06;
 ball.vy = dy * 0.06;
 ball.flying = true;
 ball.trail = [];
 kicked = true;
 round++;
 kickSound();
 phase = 'flying';
 }

 canvas.addEventListener('mousedown', onDown);
 canvas.addEventListener('mousemove', onMove);
 canvas.addEventListener('mouseup', onUp);
 canvas.addEventListener('touchstart', onDown, {passive:false});
 canvas.addEventListener('touchmove', onMove, {passive:false});
 canvas.addEventListener('touchend', onUp, {passive:false});

 running = true; phase = 'menu'; update();

 gameCleanup = () => {
 running = false;
 cancelAnimationFrame(frameId);
 window.removeEventListener('resize', resize);
 };
}

// ==================== FOOTBALL (Quarterback Throw) ====================
function initFootball() {
 gameTitle.textContent = 'Football';
 const best = getHigh('football');
 gameScoreDisplay.textContent = best? 'Best: '+ best: '';

 const AudioCtx = window.AudioContext || window.webkitAudioContext;
 const audioCtx = new AudioCtx();
 function playTone(freq, dur, type) {
 const osc = audioCtx.createOscillator();
 const gain = audioCtx.createGain();
 osc.type = type || 'sine';
 osc.frequency.value = freq;
 gain.gain.value = 0.12;
 osc.connect(gain); gain.connect(audioCtx.destination);
 osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
 osc.stop(audioCtx.currentTime + dur);
 }
 function throwSound() { playTone(350, 0.1, 'triangle'); }
 function catchSound() { [600,800,1000].forEach((f,i) => setTimeout(() => playTone(f, 0.12, 'sine'), i*80)); }
 function missSound() { playTone(180, 0.25, 'sawtooth'); }
 function tdSound() { [523,659,784,1047,1319].forEach((f,i) => setTimeout(() => playTone(f, 0.15, 'sine'), i*100)); }
 function whistleSound() { playTone(900, 0.4, 'sine'); }

 let canvas, ctx, W, H, frameId, running = false;
 let phase = 'menu';
 let score = 0, round = 0, maxRounds = 10;
 let difficulty = 'medium';
 let ball, receiver, defenders, dragging = false, dragStart = null, dragEnd = null;
 let resultText = '', resultTimer = 0, resultColor = '';

 const DIFF = {
 easy: { defSpeed: 1.0, defCount: 1, recSpeed: 1.5, rounds: 10, catchRadius: 35 },
 medium: { defSpeed: 1.8, defCount: 2, recSpeed: 1.2, rounds: 10, catchRadius: 28 },
 hard: { defSpeed: 2.5, defCount: 3, recSpeed: 1.0, rounds: 10, catchRadius: 22 }
 };

 gameArea.innerHTML = '<canvas id="fb-canvas"style="width:100%;height:100%;display:block;border-radius:12px;cursor:pointer;touch-action:none;"></canvas>';
 canvas = document.getElementById('fb-canvas');
 ctx = canvas.getContext('2d');

 function resize() {
 const rect = gameArea.getBoundingClientRect();
 W = canvas.width = rect.width;
 H = canvas.height = Math.max(rect.height, 480);
 canvas.style.height = H + 'px';
 }
 resize();
 window.addEventListener('resize', resize);

 function resetRound() {
 const s = DIFF[difficulty];
 ball = { x: W/2, y: H - 70, r: 10, vx: 0, vy: 0, flying: false, trail: [], rot: 0 };
 // Receiver runs a route
 const side = Math.random() > 0.5? 1: -1;
 receiver = {
 x: W/2 + side * (60 + Math.random()*80),
 y: H - 120,
 targetX: W/2 + side * (Math.random()*150),
 targetY: 80 + Math.random()*100,
 w: 20, h: 30,
 speed: s.recSpeed,
 running: true,
 caught: false
 };
 defenders = [];
 for (let i = 0; i < s.defCount; i++) {
 defenders.push({
 x: W * 0.2 + Math.random() * W * 0.6,
 y: 100 + Math.random() * (H * 0.4),
 w: 22, h: 30,
 speed: s.defSpeed,
 dir: Math.random() > 0.5? 1: -1
 });
 }
 dragging = false;
 phase = 'aiming';
 }

 function startGame() {
 score = 0; round = 0; maxRounds = DIFF[difficulty].rounds;
 resetRound();
 }

 function endGame() {
 phase = 'gameover';
 const pts = score;
 const isNew = setHigh('football', pts);
 if (isNew) gameScoreDisplay.textContent = 'Best: '+ pts;
 if (pts >= 50) tdSound(); else whistleSound();
 }

 function drawField() {
 // Green field
 ctx.fillStyle = '#2d6a1e';
 ctx.fillRect(0, 0, W, H);
 // Yard lines
 for (let i = 0; i < 11; i++) {
 const y = i * (H / 10);
 ctx.strokeStyle = 'rgba(255,255,255,0.15)';
 ctx.lineWidth = 1;
 ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
 }
 // Hash marks
 for (let i = 0; i < 20; i++) {
 const y = i * (H / 20);
 ctx.fillStyle = 'rgba(255,255,255,0.1)';
 ctx.fillRect(W*0.3, y, 3, 8);
 ctx.fillRect(W*0.7, y, 3, 8);
 }
 // End zones
 ctx.fillStyle = 'rgba(0,80,200,0.25)';
 ctx.fillRect(0, 0, W, 60);
 ctx.fillStyle = 'rgba(200,0,0,0.25)';
 ctx.fillRect(0, H - 40, W, 40);
 // End zone text
 ctx.font = 'bold 20px Orbitron, sans-serif';
 ctx.fillStyle = 'rgba(255,255,255,0.2)';
 ctx.textAlign = 'center';
 ctx.fillText('TOUCHDOWN', W/2, 40);
 ctx.textAlign = 'left';
 // Sidelines
 ctx.strokeStyle = '#fff';
 ctx.lineWidth = 3;
 ctx.strokeRect(2, 2, W-4, H-4);
 }

 function drawReceiver() {
 if (!receiver) return;
 // Jersey (blue)
 ctx.fillStyle = receiver.caught? '#00ff88': '#2266ff';
 ctx.fillRect(receiver.x - receiver.w/2, receiver.y - receiver.h/2, receiver.w, receiver.h);
 // Number
 ctx.fillStyle = '#fff';
 ctx.font = 'bold 12px Arial';
 ctx.textAlign = 'center';
 ctx.fillText('88', receiver.x, receiver.y + 4);
 // Helmet
 ctx.beginPath();
 ctx.arc(receiver.x, receiver.y - receiver.h/2 - 6, 8, 0, Math.PI*2);
 ctx.fillStyle = '#2266ff';
 ctx.fill();
 ctx.strokeStyle = '#aaa'; ctx.lineWidth = 1.5; ctx.stroke();
 // Route line (dotted)
 if (receiver.running && phase === 'aiming') {
 ctx.setLineDash([4,4]);
 ctx.strokeStyle = 'rgba(34,102,255,0.3)';
 ctx.lineWidth = 2;
 ctx.beginPath();
 ctx.moveTo(receiver.x, receiver.y);
 ctx.lineTo(receiver.targetX, receiver.targetY);
 ctx.stroke();
 ctx.setLineDash([]);
 }
 ctx.textAlign = 'left';
 }

 function drawDefenders() {
 for (const d of defenders) {
 ctx.fillStyle = '#cc2222';
 ctx.fillRect(d.x - d.w/2, d.y - d.h/2, d.w, d.h);
 ctx.fillStyle = '#fff';
 ctx.font = 'bold 12px Arial';
 ctx.textAlign = 'center';
 ctx.fillText('55', d.x, d.y + 4);
 ctx.beginPath();
 ctx.arc(d.x, d.y - d.h/2 - 6, 8, 0, Math.PI*2);
 ctx.fillStyle = '#cc2222';
 ctx.fill();
 ctx.strokeStyle = '#aaa'; ctx.lineWidth = 1.5; ctx.stroke();
 }
 ctx.textAlign = 'left';
 }

 function drawBall() {
 if (!ball) return;
 for (let i = 0; i < ball.trail.length; i++) {
 const t = ball.trail[i];
 ctx.globalAlpha = i / ball.trail.length * 0.3;
 ctx.beginPath();
 ctx.ellipse(t.x, t.y, ball.r, ball.r * 0.6, t.rot, 0, Math.PI*2);
 ctx.fillStyle = '#8B4513';
 ctx.fill();
 }
 ctx.globalAlpha = 1;
 // Ball (football shape)
 ctx.save();
 ctx.translate(ball.x, ball.y);
 ctx.rotate(ball.rot);
 ctx.beginPath();
 ctx.ellipse(0, 0, ball.r * 1.4, ball.r * 0.8, 0, 0, Math.PI*2);
 ctx.fillStyle = '#8B4513';
 ctx.fill();
 ctx.strokeStyle = '#5a2d0c';
 ctx.lineWidth = 1.5;
 ctx.stroke();
 // Laces
 ctx.strokeStyle = '#fff';
 ctx.lineWidth = 1;
 ctx.beginPath(); ctx.moveTo(-4, -2); ctx.lineTo(4, -2); ctx.stroke();
 ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(3, 0); ctx.stroke();
 ctx.beginPath(); ctx.moveTo(-4, 2); ctx.lineTo(4, 2); ctx.stroke();
 ctx.restore();
 }

 function drawAim() {
 if (phase!== 'aiming'||!dragging ||!dragStart ||!dragEnd) return;
 const dx = dragStart.x - dragEnd.x;
 const dy = dragStart.y - dragEnd.y;
 const power = Math.min(Math.sqrt(dx*dx+dy*dy), 200);
 ctx.strokeStyle = 'rgba(255,255,100,0.5)';
 ctx.lineWidth = 3;
 ctx.setLineDash([6,4]);
 ctx.beginPath();
 ctx.moveTo(ball.x, ball.y);
 ctx.lineTo(ball.x + dx*2, ball.y + dy*2);
 ctx.stroke();
 ctx.setLineDash([]);
 const pct = power/200;
 ctx.fillStyle = pct < 0.4? '#00ff88': pct < 0.7? '#ffaa00': '#ff4444';
 ctx.font = 'bold 14px Orbitron, sans-serif';
 ctx.textAlign = 'center';
 ctx.fillText(Math.round(pct*100) + '%', ball.x, ball.y + 28);
 ctx.textAlign = 'left';
 }

 function drawHUD() {
 ctx.fillStyle = '#fff';
 ctx.font = 'bold 18px Orbitron, sans-serif';
 ctx.textAlign = 'left';
 ctx.fillText('Score: '+ score, 15, 85);
 ctx.textAlign = 'right';
 ctx.fillText('Play: '+ round + '/'+ maxRounds, W - 15, 85);
 ctx.textAlign = 'left';
 }

 function drawResultText() {
 if (resultTimer <= 0) return;
 resultTimer--;
 ctx.globalAlpha = Math.min(1, resultTimer / 20);
 ctx.textAlign = 'center';
 ctx.font = 'bold 36px Orbitron, sans-serif';
 ctx.fillStyle = resultColor;
 ctx.fillText(resultText, W/2, H/2);
 ctx.globalAlpha = 1;
 ctx.textAlign = 'left';
 if (resultTimer <= 0) {
 if (round >= maxRounds) endGame();
 else resetRound();
 }
 }

 function drawMenu() {
 ctx.fillStyle = '#1a2a1a';
 ctx.fillRect(0, 0, W, H);
 ctx.textAlign = 'center';
 ctx.fillStyle = '#fff';
 ctx.font = 'bold 32px Orbitron, sans-serif';
 ctx.fillText('Football', W/2, H*0.12);
 ctx.font = '50px serif';
 ctx.fillText('', W/2, H*0.22);
 ctx.font = '14px Rajdhani, sans-serif';
 ctx.fillStyle = '#aaa';
 ctx.fillText('Throw the ball to your receiver!', W/2, H*0.30);

 const bw = 90, bh = 36;
 const startY = H*0.36;
 const sx = W/2 - (bw*3+20)/2;
 ['Easy', 'Medium', 'Hard'].forEach((d,i) => {
 const x = sx + i*(bw+10);
 const sel = d.toLowerCase() === difficulty;
 ctx.fillStyle = sel? (i===0?'#00ff88':i===1?'#00d4ff':'#ff4444'): '#333';
 ctx.beginPath(); ctx.roundRect(x, startY, bw, bh, 8); ctx.fill();
 ctx.fillStyle = sel? '#000': '#aaa';
 ctx.font = (sel?'bold ':'')+'16px Rajdhani, sans-serif';
 ctx.fillText(d, x+bw/2, startY+24);
 });
 const btnY = startY + bh + 25;
 ctx.fillStyle = '#00ff88';
 ctx.beginPath(); ctx.roundRect(W/2-70, btnY, 140, 50, 12); ctx.fill();
 ctx.fillStyle = '#000';
 ctx.font = 'bold 22px Orbitron, sans-serif';
 ctx.fillText('HIKE!', W/2, btnY+35);
 ctx.textAlign = 'left';
 canvas._menuData = { bw, bh, sx, startY, btnY };
 }

 function drawGameOver() {
 ctx.fillStyle = 'rgba(0,0,0,0.8)';
 ctx.fillRect(0, 0, W, H);
 ctx.textAlign = 'center';
 ctx.font = 'bold 36px Orbitron, sans-serif';
 ctx.fillStyle = score >= 50? '#00ff88': score >= 28? '#ffaa00': '#ff4444';
 ctx.fillText(score >= 50? 'ALL-STAR QB!': score >= 28? 'Nice throws!': 'Keep practicing!', W/2, H*0.25);
 ctx.fillStyle = '#fff';
 ctx.font = '24px Orbitron, sans-serif';
 ctx.fillText('Score: '+ score, W/2, H*0.38);
 if (score > 0 && score >= getHigh('football')) {
 ctx.fillStyle = '#ffdd00'; ctx.font = '16px Rajdhani, sans-serif';
 ctx.fillText('NEW HIGH SCORE!', W/2, H*0.47);
 }
 ctx.fillStyle = '#00d4ff';
 ctx.beginPath(); ctx.roundRect(W/2-70, H*0.55, 140, 50, 12); ctx.fill();
 ctx.fillStyle = '#000';
 ctx.font = 'bold 20px Orbitron, sans-serif';
 ctx.fillText('RETRY', W/2, H*0.55+35);
 ctx.textAlign = 'left';
 }

 function update() {
 if (!running) return;
 frameId = requestAnimationFrame(update);

 if (phase === 'menu') { drawMenu(); return; }
 if (phase === 'gameover') { drawGameOver(); return; }

 // Move receiver toward target
 if (receiver && receiver.running) {
 const dx = receiver.targetX - receiver.x;
 const dy = receiver.targetY - receiver.y;
 const dist = Math.sqrt(dx*dx + dy*dy);
 if (dist > 3) {
 receiver.x += (dx/dist) * receiver.speed;
 receiver.y += (dy/dist) * receiver.speed;
 } else {
 // Reached target, pick new target (zig zag)
 const side = Math.random() > 0.5? 1: -1;
 receiver.targetX = Math.max(40, Math.min(W-40, receiver.x + side * (50 + Math.random()*100)));
 receiver.targetY = Math.max(70, receiver.y - 20 - Math.random()*40);
 }
 }

 // Move defenders
 for (const d of defenders) {
 // Patrol side to side and slowly drift toward receiver
 d.x += d.speed * d.dir;
 if (d.x > W - 30) d.dir = -1;
 if (d.x < 30) d.dir = 1;
 if (receiver) {
 const dy = receiver.y - d.y;
 d.y += Math.sign(dy) * 0.3;
 }
 }

 // Ball physics
 if (ball && ball.flying) {
 ball.trail.push({ x: ball.x, y: ball.y, rot: ball.rot });
 if (ball.trail.length > 10) ball.trail.shift();
 ball.x += ball.vx;
 ball.y += ball.vy;
 ball.rot += 0.15;

 const s = DIFF[difficulty];

 // Check catch by receiver
 if (receiver &&!receiver.caught) {
 const dx = ball.x - receiver.x;
 const dy = ball.y - receiver.y;
 if (Math.sqrt(dx*dx+dy*dy) < s.catchRadius) {
 ball.flying = false;
 receiver.caught = true;
 // Touchdown if in end zone
 if (receiver.y < 60) {
 score += 7;
 catchSound();
 resultText = 'TOUCHDOWN! +7'; resultColor = '#00ff88'; resultTimer = 60;
 } else {
 score += 3;
 catchSound();
 resultText = 'CATCH! +3'; resultColor = '#00d4ff'; resultTimer = 50;
 }
 phase = 'result';
 }
 }

 // Intercepted by defender
 for (const d of defenders) {
 const dx = ball.x - d.x;
 const dy = ball.y - d.y;
 if (Math.sqrt(dx*dx+dy*dy) < 25) {
 ball.flying = false;
 missSound();
 resultText = 'INTERCEPTED!'; resultColor = '#ff4444'; resultTimer = 50;
 phase = 'result';
 break;
 }
 }

 // Out of bounds or too far
 if (ball.y < -30 || ball.x < -30 || ball.x > W + 30 || ball.y > H + 30) {
 ball.flying = false;
 missSound();
 resultText = 'INCOMPLETE!'; resultColor = '#ff4444'; resultTimer = 50;
 phase = 'result';
 }
 }

 drawField();
 drawReceiver();
 drawDefenders();
 drawBall();
 drawAim();
 drawHUD();
 drawResultText();
 }

 function getPos(e) {
 const rect = canvas.getBoundingClientRect();
 const cx = (e.touches? e.touches[0].clientX: e.clientX);
 const cy = (e.touches? e.touches[0].clientY: e.clientY);
 return { x: (cx-rect.left)/rect.width*W, y: (cy-rect.top)/rect.height*H };
 }

 function onDown(e) {
 e.preventDefault();
 const pos = getPos(e);
 if (phase === 'menu') {
 const m = canvas._menuData;
 if (m) {
 ['easy', 'medium', 'hard'].forEach((d,i) => {
 const x = m.sx+i*(m.bw+10);
 if (pos.x>=x && pos.x<=x+m.bw && pos.y>=m.startY && pos.y<=m.startY+m.bh) difficulty = d;
 });
 if (pos.x>=W/2-70 && pos.x<=W/2+70 && pos.y>=m.btnY && pos.y<=m.btnY+50) startGame();
 }
 return;
 }
 if (phase === 'gameover') {
 if (pos.x>=W/2-70 && pos.x<=W/2+70 && pos.y>=H*0.55 && pos.y<=H*0.55+50) phase = 'menu';
 return;
 }
 if (phase === 'aiming'&& ball) {
 const dx = pos.x-ball.x, dy = pos.y-ball.y;
 if (Math.sqrt(dx*dx+dy*dy) < 60) {
 dragging = true;
 dragStart = { x: ball.x, y: ball.y };
 dragEnd = pos;
 }
 }
 }
 function onMove(e) { e.preventDefault(); if (dragging) dragEnd = getPos(e); }
 function onUp(e) {
 e.preventDefault();
 if (!dragging ||!dragStart ||!dragEnd ||!ball) { dragging = false; return; }
 dragging = false;
 const dx = dragStart.x-dragEnd.x, dy = dragStart.y-dragEnd.y;
 const power = Math.min(Math.sqrt(dx*dx+dy*dy), 200);
 if (power < 15) return;
 ball.vx = dx * 0.07;
 ball.vy = dy * 0.07;
 ball.flying = true;
 ball.trail = [];
 round++;
 throwSound();
 phase = 'flying';
 }

 canvas.addEventListener('mousedown', onDown);
 canvas.addEventListener('mousemove', onMove);
 canvas.addEventListener('mouseup', onUp);
 canvas.addEventListener('touchstart', onDown, {passive:false});
 canvas.addEventListener('touchmove', onMove, {passive:false});
 canvas.addEventListener('touchend', onUp, {passive:false});

 running = true; phase = 'menu'; update();

 gameCleanup = () => {
 running = false;
 cancelAnimationFrame(frameId);
 window.removeEventListener('resize', resize);
 };
}


// ==================== ESCAPE THE GRANNY ====================
function initGranny() {
 gameTitle.textContent = 'Escape the Granny';

 // Fullscreen support
 function goFullscreen() {
 const el = document.getElementById('game-container') || document.documentElement;
 if (el.requestFullscreen) el.requestFullscreen();
 else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
 else if (el.msRequestFullscreen) el.msRequestFullscreen();
 }
 
 const canvas = document.createElement('canvas');
 canvas.className = 'game-canvas';
 canvas.style.cssText = 'background:#000;touch-action:none;width:100%;height:100vh;';
 
 const info = document.createElement('div');
 info.className = 'game-info';
 info.innerHTML = '<span>Time: <b id="granny-time">0</b>s</span><span>Best: <b id="granny-high">'+ getHigh('granny') + '</b>s</span><span id="granny-keys-display">Keys: 0/3</span>';
 
 gameArea.appendChild(info);
 gameArea.appendChild(canvas);
 
 const ctx = canvas.getContext('2d');
 let running = true;
 let frameId = 0;
 let phase = 'menu'; // menu, playing, gameover, win
 let difficulty = 'medium';
 let startTime = 0;
 let elapsedTime = 0;
 
 // Audio context
 let audioCtx = null;
 function ensureAudio() {
 if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
 return audioCtx;
 }
 
 function playTone(freq, duration, type, vol) {
 try {
 const a = ensureAudio();
 const o = a.createOscillator();
 const g = a.createGain();
 o.type = type || 'sine';
 o.frequency.value = freq;
 g.gain.value = vol || 0.1;
 o.connect(g); g.connect(a.destination);
 o.start(); o.stop(a.currentTime + duration);
 } catch(e) {}
 }
 
 function playFootstep() { playTone(80 + Math.random()*40, 0.08, 'triangle', 0.05); }
 function playHeartbeat(rate) { 
 playTone(60, 0.1, 'sine', Math.min(rate * 0.15, 0.3)); 
 setTimeout(() => playTone(80, 0.08, 'sine', Math.min(rate * 0.12, 0.25)), 120);
 }
 function playKeyPickup() { playTone(523, 0.1, 'sine', 0.15); setTimeout(() => playTone(659, 0.1, 'sine', 0.15), 100); setTimeout(() => playTone(784, 0.15, 'sine', 0.15), 200); }
 function playDoorUnlock() { playTone(440, 0.05, 'square', 0.1); setTimeout(() => playTone(554, 0.05, 'square', 0.1), 60); setTimeout(() => playTone(659, 0.1, 'square', 0.1), 120); }
 function playCameraAlert() { playTone(1200, 0.05, 'square', 0.2); setTimeout(() => playTone(1500, 0.05, 'square', 0.2), 80); setTimeout(() => playTone(1200, 0.05, 'square', 0.2), 160); }
 function playJumpscare() { playTone(100, 0.5, 'sawtooth', 0.4); playTone(200, 0.5, 'square', 0.3); }
 function playVictory() { [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f, 0.2, 'sine', 0.15), i*150)); }
 function playAmbient() {
 if (!running || phase!== 'playing') return;
 try {
 const a = ensureAudio();
 const o = a.createOscillator();
 const g = a.createGain();
 o.type = 'sine';
 o.frequency.value = 55 + Math.random() * 10;
 g.gain.value = 0.02;
 o.connect(g); g.connect(a.destination);
 o.start(); o.stop(a.currentTime + 2);
 } catch(e) {}
 if (running && phase === 'playing') setTimeout(playAmbient, 3000);
 }
 
 // Map definitions
 // 0 = empty, 1-5 = different wall types, 6 = locked exit door, 7 = key spawn marker, 8 = camera wall
 // Wall colors: 1=hallway(dark gray), 2=kitchen(yellow), 3=bedroom(blue), 4=basement(gray), 5=bathroom(green)
 const MAP_W = 20;
 const MAP_H = 20;
 const MAP = [
 [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
 [1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
 [1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
 [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
 [1,1,1,0,1,1,2,2,0,1,1,1,0,1,1,1,1,0,1,1],
 [1,0,0,0,2,0,0,0,0,0,0,0,0,0,3,3,0,0,0,1],
 [1,0,0,0,2,0,0,0,0,0,0,0,0,0,3,0,0,0,0,1],
 [1,0,0,0,2,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
 [1,1,0,1,1,1,1,0,1,1,0,1,1,1,0,1,1,1,1,1],
 [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
 [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
 [1,0,0,0,1,1,4,4,4,1,1,0,0,0,0,0,0,0,0,1],
 [1,1,0,1,1,0,0,0,0,4,1,0,1,1,1,0,1,1,1,1],
 [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,1],
 [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,1],
 [1,0,0,0,1,0,0,0,0,4,1,1,0,1,1,0,5,5,0,1],
 [1,1,0,1,1,4,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
 [1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
 [1,0,0,0,4,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
 [1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1]
];
 
 // Wall colors
 const WALL_COLORS = {
 1: {r:80,g:80,b:90}, // hallway dark
 2: {r:180,g:160,b:60}, // kitchen yellow
 3: {r:60,g:80,b:160}, // bedroom blue
 4: {r:100,g:100,b:100}, // basement gray
 5: {r:60,g:140,b:80}, // bathroom green
 6: {r:160,g:40,b:40} // exit door red
 };
 
 // Player
 let player = { x: 1.5, y: 1.5, angle: 0, keys: [] };
 const MOVE_SPEED = 0.04;
 const ROT_SPEED = 0.04;
 const KEY_COLORS = ['#ff4444', '#44ff44', '#4488ff'];
 const KEY_NAMES = ['Red', 'Green', 'Blue'];
 
 // Keys positions
 let keys = [];
 function resetKeys() {
 keys = [
 { x: 6.5, y: 6.5, color: 0, collected: false }, // red key in kitchen
 { x: 15.5, y: 5.5, color: 1, collected: false }, // green key in bedroom
 { x: 7.5, y: 17.5, color: 2, collected: false } // blue key in basement
];
 }
 
 // Granny AI
 let granny = { x: 10.5, y: 10.5, angle: 0, speed: 0.02, alerted: false, alertTimer: 0, pathIndex: 0 };
 const GRANNY_PATROL = [
 {x:10.5,y:9.5},{x:10.5,y:5.5},{x:5.5,y:5.5},{x:5.5,y:9.5},
 {x:2.5,y:9.5},{x:2.5,y:13.5},{x:5.5,y:13.5},{x:5.5,y:17.5},
 {x:10.5,y:17.5},{x:10.5,y:13.5},{x:14.5,y:13.5},{x:14.5,y:9.5}
];
 
 // Security cameras
 let cameras = [];
 function resetCameras() {
 let camDefs = [
 { x: 4, y: 4, baseAngle: Math.PI * 0.25, wall: true },
 { x: 13, y: 8, baseAngle: Math.PI * 0.75, wall: true },
 { x: 8, y: 12, baseAngle: Math.PI * 1.5, wall: true },
 { x: 16, y: 4, baseAngle: Math.PI * 1.25, wall: true }
];
 if (difficulty === 'hard') {
 camDefs.push({ x: 3, y: 16, baseAngle: Math.PI * 0.5, wall: true });
 camDefs.push({ x: 15, y: 15, baseAngle: Math.PI, wall: true });
 }
 if (difficulty === 'easy') {
 camDefs = camDefs.slice(0, 2);
 }
 cameras = camDefs.map(c => ({
 x: c.x + 0.5, y: c.y + 0.5,
 baseAngle: c.baseAngle,
 angle: c.baseAngle,
 sweepRange: Math.PI * 0.6,
 sweepSpeed: 0.008,
 sweepDir: 1,
 coneLen: 4,
 coneAngle: Math.PI * 0.3,
 triggered: false, triggerTimer: 0
 }));
 }
 
 // Difficulty settings
 const DIFF_SETTINGS = {
 easy: { grannySpeed: 0.015, grannyAlertSpeed: 0.03, visibility: 8, ambientLight: 0.3 },
 medium: { grannySpeed: 0.02, grannyAlertSpeed: 0.045, visibility: 6, ambientLight: 0.15 },
 hard: { grannySpeed: 0.03, grannyAlertSpeed: 0.06, visibility: 4.5, ambientLight: 0.08 }
 };
 
 // Controls
 let keysDown = {};
 let touchMove = { x: 0, y: 0 };
 let touchLook = 0;
 let heartbeatTimer = 0;
 let stepTimer = 0;
 let warningAlpha = 0;
 let exitUnlocked = false;
 
 function resize() {
 const maxW = Math.min(window.innerWidth - 20, 800);
 const maxH = Math.min(window.innerHeight - 180, 500);
 canvas.width = maxW;
 canvas.height = maxH;
 }
 resize();
 window.addEventListener('resize', resize);
 
 function isWall(mx, my) {
 if (mx < 0 || my < 0 || mx >= MAP_W || my >= MAP_H) return true;
 const v = MAP[my][mx];
 if (v === 6 &&!exitUnlocked) return true;
 if (v === 6 && exitUnlocked) return false;
 return v > 0;
 }
 
 function castRay(ox, oy, angle) {
 const sin = Math.sin(angle);
 const cos = Math.cos(angle);
 let dist = 0;
 const step = 0.02;
 const maxDist = 20;
 while (dist < maxDist) {
 dist += step;
 const tx = ox + cos * dist;
 const ty = oy + sin * dist;
 const mx = Math.floor(tx);
 const my = Math.floor(ty);
 if (isWall(mx, my)) {
 return { dist: dist, mapX: mx, mapY: my, wallType: MAP[my][mx], hitX: tx, hitY: ty };
 }
 }
 return { dist: maxDist, mapX: -1, mapY: -1, wallType: 0, hitX: ox + cos * maxDist, hitY: oy + sin * maxDist };
 }
 
 function distBetween(ax, ay, bx, by) {
 return Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
 }
 
 // Simple pathfinding: granny moves toward target avoiding walls
 function moveGranny(dt) {
 let targetX, targetY;
 const settings = DIFF_SETTINGS[difficulty];
 
 if (granny.alerted) {
 targetX = player.x;
 targetY = player.y;
 granny.speed = settings.grannyAlertSpeed;
 granny.alertTimer -= dt;
 if (granny.alertTimer <= 0) {
 granny.alerted = false;
 granny.speed = settings.grannySpeed;
 }
 } else {
 const wp = GRANNY_PATROL[granny.pathIndex];
 targetX = wp.x;
 targetY = wp.y;
 granny.speed = settings.grannySpeed;
 if (distBetween(granny.x, granny.y, wp.x, wp.y) < 0.5) {
 granny.pathIndex = (granny.pathIndex + 1) % GRANNY_PATROL.length;
 }
 }
 
 const dx = targetX - granny.x;
 const dy = targetY - granny.y;
 const dist = Math.sqrt(dx * dx + dy * dy);
 if (dist > 0.1) {
 const nx = dx / dist;
 const ny = dy / dist;
 const newX = granny.x + nx * granny.speed;
 const newY = granny.y + ny * granny.speed;
 granny.angle = Math.atan2(dy, dx);
 if (!isWall(Math.floor(newX), Math.floor(granny.y))) granny.x = newX;
 if (!isWall(Math.floor(granny.x), Math.floor(newY))) granny.y = newY;
 }
 }
 
 function updateCameras() {
 cameras.forEach(cam => {
 cam.angle += cam.sweepSpeed * cam.sweepDir;
 const diff = cam.angle - cam.baseAngle;
 if (Math.abs(diff) > cam.sweepRange / 2) {
 cam.sweepDir *= -1;
 }
 
 // Check if player is in cone
 const dx = player.x - cam.x;
 const dy = player.y - cam.y;
 const dist = Math.sqrt(dx * dx + dy * dy);
 const angleToPlayer = Math.atan2(dy, dx);
 let angleDiff = angleToPlayer - cam.angle;
 while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
 while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
 
 if (dist < cam.coneLen && Math.abs(angleDiff) < cam.coneAngle / 2) {
 // Check line of sight
 let blocked = false;
 const steps = Math.ceil(dist / 0.2);
 for (let i = 1; i < steps; i++) {
 const cx = cam.x + (dx / dist) * (i * 0.2);
 const cy = cam.y + (dy / dist) * (i * 0.2);
 if (isWall(Math.floor(cx), Math.floor(cy))) { blocked = true; break; }
 }
 if (!blocked) {
 if (!cam.triggered) {
 playCameraAlert();
 cam.triggered = true;
 cam.triggerTimer = 60;
 granny.alerted = true;
 granny.alertTimer = 600; // 10 seconds at 60fps
 }
 }
 }
 
 if (cam.triggered) {
 cam.triggerTimer--;
 if (cam.triggerTimer <= 0) cam.triggered = false;
 }
 });
 }
 
 function render3D() {
 const W = canvas.width;
 const H = canvas.height;
 const settings = DIFF_SETTINGS[difficulty];
 
 // Clear
 ctx.fillStyle = '#000';
 ctx.fillRect(0, 0, W, H);
 
 // Ceiling
 const ceilGrad = ctx.createLinearGradient(0, 0, 0, H / 2);
 ceilGrad.addColorStop(0, '#111');
 ceilGrad.addColorStop(1, '#1a1a2e');
 ctx.fillStyle = ceilGrad;
 ctx.fillRect(0, 0, W, H / 2);
 
 // Floor
 const floorGrad = ctx.createLinearGradient(0, H / 2, 0, H);
 floorGrad.addColorStop(0, '#1a1a1a');
 floorGrad.addColorStop(1, '#333');
 ctx.fillStyle = floorGrad;
 ctx.fillRect(0, H / 2, W, H / 2);
 
 // Raycasting
 const FOV = Math.PI / 3;
 const numRays = Math.min(W, 400);
 const stripW = W / numRays;
 
 // Z-buffer for sprite rendering
 const zBuffer = new Array(numRays);
 
 for (let i = 0; i < numRays; i++) {
 const rayAngle = player.angle - FOV / 2 + (i / numRays) * FOV;
 const hit = castRay(player.x, player.y, rayAngle);
 const perpDist = hit.dist * Math.cos(rayAngle - player.angle);
 zBuffer[i] = perpDist;
 
 const wallH = Math.min(H * 1.2, (H * 0.8) / perpDist);
 const wallTop = (H - wallH) / 2;
 
 if (hit.wallType > 0) {
 const wc = WALL_COLORS[hit.wallType] || WALL_COLORS[1];
 // Shading based on distance and visibility
 const shade = Math.max(settings.ambientLight, 1 - (perpDist / settings.visibility));
 const fogR = Math.floor(wc.r * shade);
 const fogG = Math.floor(wc.g * shade);
 const fogB = Math.floor(wc.b * shade);
 
 // Side shading
 const hitFracX = hit.hitX - Math.floor(hit.hitX);
 const hitFracY = hit.hitY - Math.floor(hit.hitY);
 const isSide = (hitFracX < 0.02 || hitFracX > 0.98);
 const sideMul = isSide? 0.7: 1.0;
 
 ctx.fillStyle = 'rgb('+ Math.floor(fogR * sideMul) +', '+ Math.floor(fogG * sideMul) +', '+ Math.floor(fogB * sideMul) +')';
 ctx.fillRect(i * stripW, wallTop, stripW + 1, wallH);
 
 // Wall edge lines
 if (wallH > 20) {
 ctx.fillStyle = 'rgba(0,0,0,0.3)';
 ctx.fillRect(i * stripW, wallTop, 1, wallH);
 }
 
 // Exit door marking
 if (hit.wallType === 6) {
 const lockShade = exitUnlocked? 0.5: shade;
 if (exitUnlocked) {
 ctx.fillStyle = 'rgba(0,255,0, '+ (lockShade * 0.3) +')';
 } else {
 ctx.fillStyle = 'rgba(255,0,0, '+ (lockShade * 0.3) +')';
 }
 ctx.fillRect(i * stripW, wallTop + wallH * 0.3, stripW + 1, wallH * 0.4);
 }
 }
 }
 
 // Render sprites (keys and granny)
 let sprites = [];
 
 // Keys as sprites
 keys.forEach((k, idx) => {
 if (!k.collected) {
 sprites.push({ x: k.x, y: k.y, type: 'key', color: KEY_COLORS[k.color], idx: idx });
 }
 });
 
 // Granny as sprite
 sprites.push({ x: granny.x, y: granny.y, type: 'granny'});
 
 // Sort sprites far to near
 sprites.sort((a, b) => {
 const da = (a.x - player.x) ** 2 + (a.y - player.y) ** 2;
 const db = (b.x - player.x) ** 2 + (b.y - player.y) ** 2;
 return db - da;
 });
 
 sprites.forEach(sp => {
 const dx = sp.x - player.x;
 const dy = sp.y - player.y;
 const dist = Math.sqrt(dx * dx + dy * dy);
 
 // Check visibility
 if (dist > settings.visibility + 1) return;
 
 const spriteAngle = Math.atan2(dy, dx) - player.angle;
 let normAngle = spriteAngle;
 while (normAngle > Math.PI) normAngle -= 2 * Math.PI;
 while (normAngle < -Math.PI) normAngle += 2 * Math.PI;
 
 if (Math.abs(normAngle) > FOV / 2 + 0.2) return;
 
 const perpDist = dist * Math.cos(spriteAngle - (player.angle - player.angle)); // simplified
 const screenX = (0.5 + normAngle / FOV) * W;
 const spriteH = Math.min(H * 0.8, (H * 0.5) / dist);
 const spriteW = spriteH;
 const spriteTop = (H - spriteH) / 2;
 const spriteLeft = screenX - spriteW / 2;
 
 // Z-buffer check (simplified)
 const rayIdx = Math.floor(screenX / stripW);
 if (rayIdx >= 0 && rayIdx < numRays && zBuffer[rayIdx] < dist - 0.2) return;
 
 const shade = Math.max(settings.ambientLight, 1 - (dist / settings.visibility));
 
 if (sp.type === 'key') {
 // Floating key sprite
 const bob = Math.sin(Date.now() * 0.005 + sp.idx * 2) * spriteH * 0.05;
 ctx.save();
 ctx.globalAlpha = shade;
 ctx.fillStyle = sp.color;
 ctx.shadowColor = sp.color;
 ctx.shadowBlur = 15;
 // Key shape
 const kx = spriteLeft + spriteW * 0.3;
 const ky = spriteTop + spriteH * 0.2 + bob;
 const kw = spriteW * 0.4;
 const kh = spriteH * 0.6;
 // Key head (circle)
 ctx.beginPath();
 ctx.arc(kx + kw / 2, ky + kw / 2, kw / 2, 0, Math.PI * 2);
 ctx.fill();
 // Key shaft
 ctx.fillRect(kx + kw * 0.35, ky + kw, kw * 0.3, kh - kw);
 // Key teeth
 ctx.fillRect(kx + kw * 0.55, ky + kh * 0.6, kw * 0.25, kw * 0.15);
 ctx.fillRect(kx + kw * 0.55, ky + kh * 0.75, kw * 0.2, kw * 0.12);
 ctx.restore();
 } else if (sp.type === 'granny') {
 // Granny sprite
 ctx.save();
 ctx.globalAlpha = shade;
 const gx = spriteLeft;
 const gy = spriteTop;
 const gw = spriteW;
 const gh = spriteH;
 
 // Body (dark dress)
 ctx.fillStyle = granny.alerted? '#660022': '#333';
 ctx.beginPath();
 ctx.moveTo(gx + gw * 0.3, gy + gh * 0.35);
 ctx.lineTo(gx + gw * 0.15, gy + gh);
 ctx.lineTo(gx + gw * 0.85, gy + gh);
 ctx.lineTo(gx + gw * 0.7, gy + gh * 0.35);
 ctx.closePath();
 ctx.fill();
 
 // Head
 ctx.fillStyle = '#ddb89a';
 ctx.beginPath();
 ctx.arc(gx + gw / 2, gy + gh * 0.22, gw * 0.2, 0, Math.PI * 2);
 ctx.fill();
 
 // Hair (gray)
 ctx.fillStyle = '#888';
 ctx.beginPath();
 ctx.arc(gx + gw / 2, gy + gh * 0.17, gw * 0.22, Math.PI, 0);
 ctx.fill();
 
 // Eyes (menacing red when alerted)
 ctx.fillStyle = granny.alerted? '#f00': '#300';
 ctx.beginPath();
 ctx.arc(gx + gw * 0.42, gy + gh * 0.21, gw * 0.04, 0, Math.PI * 2);
 ctx.arc(gx + gw * 0.58, gy + gh * 0.21, gw * 0.04, 0, Math.PI * 2);
 ctx.fill();
 
 // Arms
 ctx.strokeStyle = '#ddb89a';
 ctx.lineWidth = gw * 0.06;
 ctx.beginPath();
 ctx.moveTo(gx + gw * 0.3, gy + gh * 0.4);
 ctx.lineTo(gx + gw * 0.15, gy + gh * 0.65);
 ctx.moveTo(gx + gw * 0.7, gy + gh * 0.4);
 ctx.lineTo(gx + gw * 0.85, gy + gh * 0.65);
 ctx.stroke();
 
 ctx.restore();
 }
 });
 
 // Flashlight cone effect (vignette)
 const vigGrad = ctx.createRadialGradient(W / 2, H / 2, W * 0.15, W / 2, H / 2, W * 0.6);
 vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
 vigGrad.addColorStop(0.5, 'rgba(0,0,0,0.2)');
 vigGrad.addColorStop(1, 'rgba(0,0,0,0.7)');
 ctx.fillStyle = vigGrad;
 ctx.fillRect(0, 0, W, H);
 
 // Warning flash when granny alerted
 if (granny.alerted) {
 warningAlpha = Math.min(warningAlpha + 0.02, 0.15);
 ctx.fillStyle = 'rgba(255,0,0, '+ (warningAlpha * (0.5 + 0.5 * Math.sin(Date.now() * 0.01))) +')';
 ctx.fillRect(0, 0, W, H);
 } else {
 warningAlpha = Math.max(warningAlpha - 0.02, 0);
 }
 }
 
 function renderMinimap() {
 const W = canvas.width;
 const H = canvas.height;
 const mmSize = Math.min(130, W * 0.22);
 const cellSize = mmSize / MAP_W;
 const mmX = W - mmSize - 8;
 const mmY = 8;
 
 ctx.save();
 ctx.globalAlpha = 0.7;
 ctx.fillStyle = '#000';
 ctx.fillRect(mmX - 2, mmY - 2, mmSize + 4, mmSize + 4);
 
 // Walls
 for (let y = 0; y < MAP_H; y++) {
 for (let x = 0; x < MAP_W; x++) {
 const v = MAP[y][x];
 if (v > 0) {
 const wc = WALL_COLORS[v] || WALL_COLORS[1];
 ctx.fillStyle = 'rgb('+ wc.r +', '+ wc.g +', '+ wc.b +')';
 ctx.fillRect(mmX + x * cellSize, mmY + y * cellSize, cellSize, cellSize);
 }
 }
 }
 
 // Camera cones
 cameras.forEach(cam => {
 ctx.fillStyle = cam.triggered? 'rgba(255,0,0,0.4)': 'rgba(255,255,0,0.2)';
 ctx.beginPath();
 ctx.moveTo(mmX + cam.x * cellSize, mmY + cam.y * cellSize);
 const a1 = cam.angle - cam.coneAngle / 2;
 const a2 = cam.angle + cam.coneAngle / 2;
 ctx.lineTo(mmX + (cam.x + Math.cos(a1) * cam.coneLen) * cellSize, mmY + (cam.y + Math.sin(a1) * cam.coneLen) * cellSize);
 ctx.lineTo(mmX + (cam.x + Math.cos(a2) * cam.coneLen) * cellSize, mmY + (cam.y + Math.sin(a2) * cam.coneLen) * cellSize);
 ctx.closePath();
 ctx.fill();
 
 // Camera dot
 ctx.fillStyle = cam.triggered? '#ff0': '#cc0';
 ctx.beginPath();
 ctx.arc(mmX + cam.x * cellSize, mmY + cam.y * cellSize, 2, 0, Math.PI * 2);
 ctx.fill();
 });
 
 // Keys on minimap
 keys.forEach(k => {
 if (!k.collected) {
 ctx.fillStyle = KEY_COLORS[k.color];
 ctx.beginPath();
 ctx.arc(mmX + k.x * cellSize, mmY + k.y * cellSize, 3, 0, Math.PI * 2);
 ctx.fill();
 }
 });
 
 // Exit
 ctx.fillStyle = exitUnlocked? '#0f0': '#f00';
 ctx.fillRect(mmX + 10 * cellSize, mmY + 19 * cellSize, cellSize * 1.5, cellSize);
 
 // Granny
 ctx.fillStyle = granny.alerted? '#f00': '#f88';
 ctx.beginPath();
 ctx.arc(mmX + granny.x * cellSize, mmY + granny.y * cellSize, 3, 0, Math.PI * 2);
 ctx.fill();
 
 // Player
 ctx.fillStyle = '#0f0';
 ctx.beginPath();
 ctx.arc(mmX + player.x * cellSize, mmY + player.y * cellSize, 3, 0, Math.PI * 2);
 ctx.fill();
 // Player direction
 ctx.strokeStyle = '#0f0';
 ctx.lineWidth = 1;
 ctx.beginPath();
 ctx.moveTo(mmX + player.x * cellSize, mmY + player.y * cellSize);
 ctx.lineTo(mmX + (player.x + Math.cos(player.angle) * 1.5) * cellSize, mmY + (player.y + Math.sin(player.angle) * 1.5) * cellSize);
 ctx.stroke();
 
 ctx.restore();
 }
 
 function renderHUD() {
 const W = canvas.width;
 const H = canvas.height;
 
 // Keys collected
 const keyY = H - 40;
 ctx.font = '14px monospace';
 ctx.fillStyle = '#fff';
 ctx.fillText('KEYS:', 10, keyY);
 for (let i = 0; i < 3; i++) {
 ctx.fillStyle = player.keys.includes(i)? KEY_COLORS[i]: '#333';
 ctx.beginPath();
 ctx.arc(70 + i * 25, keyY - 4, 8, 0, Math.PI * 2);
 ctx.fill();
 ctx.strokeStyle = '#fff';
 ctx.lineWidth = 1;
 ctx.stroke();
 }
 
 // Heart rate meter
 const grannyDist = distBetween(player.x, player.y, granny.x, granny.y);
 const heartRate = Math.max(0, 1 - grannyDist / 8);
 const heartX = 10;
 const heartY = H - 65;
 ctx.fillStyle = '#fff';
 ctx.font = '12px monospace';
 ctx.fillText('[heart]', heartX, heartY);
 // Heart bar
 ctx.fillStyle = '#333';
 ctx.fillRect(heartX + 18, heartY - 10, 80, 10);
 const barColor = heartRate > 0.7? '#f00': heartRate > 0.4? '#fa0': '#0c0';
 ctx.fillStyle = barColor;
 ctx.fillRect(heartX + 18, heartY - 10, 80 * heartRate, 10);
 // Pulsing border
 if (heartRate > 0.5) {
 ctx.strokeStyle = 'rgba(255,0,0, '+ (0.3 + 0.3 * Math.sin(Date.now() * 0.01 * (1 + heartRate * 3))) +')';
 ctx.lineWidth = 2;
 ctx.strokeRect(heartX + 17, heartY - 11, 82, 12);
 }
 
 // Warning text
 if (granny.alerted) {
 ctx.save();
 ctx.font = 'bold 18px monospace';
 ctx.fillStyle = 'rgba(255,50,50, '+ (0.5 + 0.5 * Math.sin(Date.now() * 0.008)) +')';
 ctx.textAlign = 'center';
 ctx.fillText('GRANNY IS COMING!', W / 2, 30);
 ctx.restore();
 }
 
 // Timer
 ctx.font = '14px monospace';
 ctx.fillStyle = '#fff';
 ctx.textAlign = 'left';
 ctx.fillText('Time: '+ Math.floor(elapsedTime / 60) + 's', 10, 20);
 
 // Exit hint
 if (player.keys.length === 3 &&!exitUnlocked) {
 ctx.save();
 ctx.font = 'bold 16px monospace';
 ctx.fillStyle = '#0f0';
 ctx.textAlign = 'center';
 ctx.fillText('All keys found! Find the EXIT (south wall)', W / 2, H - 10);
 ctx.restore();
 }
 }
 
 function handleInput() {
 let moveX = 0, moveY = 0, rot = 0;
 
 // Keyboard
 if (keysDown['ArrowLeft'] || keysDown['KeyA']) rot -= ROT_SPEED;
 if (keysDown['ArrowRight'] || keysDown['KeyD']) rot += ROT_SPEED;
 if (keysDown['ArrowUp'] || keysDown['KeyW']) { moveX += Math.cos(player.angle) * MOVE_SPEED; moveY += Math.sin(player.angle) * MOVE_SPEED; }
 if (keysDown['ArrowDown'] || keysDown['KeyS']) { moveX -= Math.cos(player.angle) * MOVE_SPEED; moveY -= Math.sin(player.angle) * MOVE_SPEED; }
 if (keysDown['KeyQ']) { moveX += Math.cos(player.angle - Math.PI/2) * MOVE_SPEED * 0.6; moveY += Math.sin(player.angle - Math.PI/2) * MOVE_SPEED * 0.6; }
 if (keysDown['KeyE']) { moveX += Math.cos(player.angle + Math.PI/2) * MOVE_SPEED * 0.6; moveY += Math.sin(player.angle + Math.PI/2) * MOVE_SPEED * 0.6; }
 
 // Touch
 moveX += Math.cos(player.angle) * touchMove.y * MOVE_SPEED + Math.cos(player.angle + Math.PI/2) * touchMove.x * MOVE_SPEED * 0.5;
 moveY += Math.sin(player.angle) * touchMove.y * MOVE_SPEED + Math.sin(player.angle + Math.PI/2) * touchMove.x * MOVE_SPEED * 0.5;
 rot += touchLook * ROT_SPEED * 1.5;
 
 player.angle += rot;
 
 // Collision
 const newX = player.x + moveX;
 const newY = player.y + moveY;
 const margin = 0.2;
 if (!isWall(Math.floor(newX + margin), Math.floor(player.y)) &&!isWall(Math.floor(newX - margin), Math.floor(player.y))) player.x = newX;
 if (!isWall(Math.floor(player.x), Math.floor(newY + margin)) &&!isWall(Math.floor(player.x), Math.floor(newY - margin))) player.y = newY;
 
 // Footstep sounds
 if (Math.abs(moveX) > 0.001 || Math.abs(moveY) > 0.001) {
 stepTimer++;
 if (stepTimer % 20 === 0) playFootstep();
 }
 }
 
 function checkCollisions() {
 // Key pickup
 keys.forEach((k, idx) => {
 if (!k.collected && distBetween(player.x, player.y, k.x, k.y) < 0.6) {
 k.collected = true;
 player.keys.push(k.color);
 playKeyPickup();
 const disp = document.getElementById('granny-keys-display');
 if (disp) disp.textContent = 'Keys: '+ player.keys.length + '/3';
 
 if (player.keys.length === 3) {
 exitUnlocked = true;
 playDoorUnlock();
 }
 }
 });
 
 // Exit check
 if (exitUnlocked && player.y >= MAP_H - 1.2 && Math.abs(player.x - 10.5) < 1.5) {
 phase = 'win';
 const timeScore = Math.floor(elapsedTime / 60);
 const disp = document.getElementById('granny-time');
 if (disp) disp.textContent = timeScore;
 playVictory();
 }
 
 // Granny catch
 if (distBetween(player.x, player.y, granny.x, granny.y) < 0.6) {
 phase = 'gameover';
 playJumpscare();
 }
 
 // Heartbeat sound based on proximity
 const grannyDist = distBetween(player.x, player.y, granny.x, granny.y);
 if (grannyDist < 6) {
 heartbeatTimer++;
 const interval = Math.max(15, Math.floor(grannyDist * 10));
 if (heartbeatTimer % interval === 0) {
 playHeartbeat(1 - grannyDist / 6);
 }
 }
 }
 
 function renderMenu() {
 const W = canvas.width;
 const H = canvas.height;
 ctx.fillStyle = '#0a0a0a';
 ctx.fillRect(0, 0, W, H);
 
 // Creepy atmosphere
 for (let i = 0; i < 50; i++) {
 ctx.fillStyle = 'rgba(255,0,0, '+ (Math.random() * 0.03) +')';
 ctx.fillRect(Math.random() * W, Math.random() * H, Math.random() * 3, Math.random() * 3);
 }
 
 ctx.textAlign = 'center';
 
 // Title
 ctx.font = 'bold 36px monospace';
 ctx.fillStyle = '#cc0000';
 ctx.shadowColor = '#f00';
 ctx.shadowBlur = 20;
 ctx.fillText('ESCAPE THE GRANNY', W / 2, H * 0.18);
 ctx.shadowBlur = 0;
 
 ctx.font = '14px monospace';
 ctx.fillStyle = '#888';
 ctx.fillText('Find 3 keys. Unlock the exit. Avoid Granny.', W / 2, H * 0.27);
 ctx.fillText('Cameras will alert her!', W / 2, H * 0.32);
 
 // Difficulty buttons
 const btnW = 130;
 const btnH = 40;
 const btnY = H * 0.42;
 const diffs = ['easy', 'medium', 'hard'];
 const diffLabels = ['EASY', 'MEDIUM', 'HARD'];
 const diffColors = ['#2a6', '#c80', '#c22'];
 
 diffs.forEach((d, i) => {
 const bx = W / 2 - (diffs.length * (btnW + 10)) / 2 + i * (btnW + 10) + 5;
 const selected = difficulty === d;
 ctx.fillStyle = selected? diffColors[i]: '#222';
 ctx.strokeStyle = diffColors[i];
 ctx.lineWidth = 2;
 ctx.fillRect(bx, btnY, btnW, btnH);
 ctx.strokeRect(bx, btnY, btnW, btnH);
 ctx.fillStyle = selected? '#fff': '#888';
 ctx.font = 'bold 16px monospace';
 ctx.fillText(diffLabels[i], bx + btnW / 2, btnY + btnH / 2 + 6);
 });
 
 // START button
 const startY = H * 0.6;
 const startW = 180;
 const startH = 50;
 const startX = W / 2 - startW / 2;
 ctx.fillStyle = '#a00';
 ctx.fillRect(startX, startY, startW, startH);
 ctx.strokeStyle = '#f44';
 ctx.lineWidth = 2;
 ctx.strokeRect(startX, startY, startW, startH);
 ctx.fillStyle = '#fff';
 ctx.font = 'bold 22px monospace';
 ctx.fillText('START', W / 2, startY + startH / 2 + 8);
 
 // Controls info
 ctx.font = '12px monospace';
 ctx.fillStyle = '#555';
 ctx.fillText('WASD/Arrows: Move | Q/E: Strafe | Touch: Joystick', W / 2, H * 0.8);
 ctx.fillText('Find keys, avoid cameras, escape Granny!', W / 2, H * 0.86);
 
 // Store button positions for click handling
 canvas._menuBtns = {
 diffs: diffs.map((d, i) => ({
 d: d,
 x: W / 2 - (diffs.length * (btnW + 10)) / 2 + i * (btnW + 10) + 5,
 y: btnY, w: btnW, h: btnH
 })),
 start: { x: startX, y: startY, w: startW, h: startH }
 };
 }
 
 function renderGameOver() {
 const W = canvas.width;
 const H = canvas.height;
 ctx.fillStyle = 'rgba(80,0,0,0.9)';
 ctx.fillRect(0, 0, W, H);
 
 // Jumpscare flash
 const flashAlpha = Math.max(0, 1 - (Date.now() % 3000) / 1500);
 ctx.fillStyle = 'rgba(255,0,0, '+ flashAlpha * 0.3 +')';
 ctx.fillRect(0, 0, W, H);
 
 ctx.textAlign = 'center';
 ctx.font = 'bold 48px monospace';
 ctx.fillStyle = '#ff0000';
 ctx.shadowColor = '#f00';
 ctx.shadowBlur = 30;
 ctx.fillText('CAUGHT!', W / 2, H * 0.3);
 ctx.shadowBlur = 0;
 
 ctx.font = '18px monospace';
 ctx.fillStyle = '#faa';
 ctx.fillText('Granny got you...', W / 2, H * 0.42);
 
 const timeScore = Math.floor(elapsedTime / 60);
 ctx.fillText('Survived: '+ timeScore + 's | Keys: '+ player.keys.length + '/3', W / 2, H * 0.52);
 
 // Retry button
 const btnW = 160;
 const btnH = 45;
 const btnX = W / 2 - btnW / 2;
 const btnY = H * 0.62;
 ctx.fillStyle = '#800';
 ctx.fillRect(btnX, btnY, btnW, btnH);
 ctx.strokeStyle = '#f44';
 ctx.lineWidth = 2;
 ctx.strokeRect(btnX, btnY, btnW, btnH);
 ctx.fillStyle = '#fff';
 ctx.font = 'bold 18px monospace';
 ctx.fillText('RETRY', W / 2, btnY + btnH / 2 + 7);
 
 // Menu button
 const m2Y = btnY + btnH + 15;
 ctx.fillStyle = '#444';
 ctx.fillRect(btnX, m2Y, btnW, btnH);
 ctx.strokeStyle = '#888';
 ctx.strokeRect(btnX, m2Y, btnW, btnH);
 ctx.fillStyle = '#fff';
 ctx.fillText('MENU', W / 2, m2Y + btnH / 2 + 7);
 
 canvas._gameoverBtns = {
 retry: { x: btnX, y: btnY, w: btnW, h: btnH },
 menu: { x: btnX, y: m2Y, w: btnW, h: btnH }
 };
 }
 
 function renderWin() {
 const W = canvas.width;
 const H = canvas.height;
 ctx.fillStyle = 'rgba(0,30,0,0.9)';
 ctx.fillRect(0, 0, W, H);
 
 ctx.textAlign = 'center';
 ctx.font = 'bold 40px monospace';
 ctx.fillStyle = '#00ff44';
 ctx.shadowColor = '#0f0';
 ctx.shadowBlur = 25;
 ctx.fillText('YOU ESCAPED!', W / 2, H * 0.25);
 ctx.shadowBlur = 0;
 
 ctx.font = '20px monospace';
 ctx.fillStyle = '#8f8';
 ctx.fillText('Freedom at last!', W / 2, H * 0.38);
 
 const timeScore = Math.floor(elapsedTime / 60);
 const best = getHigh('granny');
 const isNewBest = best === 0 || timeScore < best;
 if (isNewBest && timeScore > 0) setHigh('granny', timeScore);
 const currentBest = getHigh('granny');
 
 ctx.fillText('Escape Time: '+ timeScore + 's', W / 2, H * 0.48);
 ctx.fillStyle = isNewBest? '#ff0': '#8f8';
 ctx.fillText('Best: '+ currentBest + 's'+ (isNewBest? ' - NEW RECORD!': ''), W / 2, H * 0.55);
 
 const disp = document.getElementById('granny-time');
 if (disp) disp.textContent = timeScore;
 const hiDisp = document.getElementById('granny-high');
 if (hiDisp) hiDisp.textContent = currentBest;
 
 // Buttons
 const btnW = 160;
 const btnH = 45;
 const btnX = W / 2 - btnW / 2;
 const btnY = H * 0.65;
 ctx.fillStyle = '#060';
 ctx.fillRect(btnX, btnY, btnW, btnH);
 ctx.strokeStyle = '#0f0';
 ctx.lineWidth = 2;
 ctx.strokeRect(btnX, btnY, btnW, btnH);
 ctx.fillStyle = '#fff';
 ctx.font = 'bold 18px monospace';
 ctx.fillText('PLAY AGAIN', W / 2, btnY + btnH / 2 + 7);
 
 const m2Y = btnY + btnH + 15;
 ctx.fillStyle = '#444';
 ctx.fillRect(btnX, m2Y, btnW, btnH);
 ctx.strokeStyle = '#888';
 ctx.strokeRect(btnX, m2Y, btnW, btnH);
 ctx.fillStyle = '#fff';
 ctx.fillText('MENU', W / 2, m2Y + btnH / 2 + 7);
 
 canvas._winBtns = {
 retry: { x: btnX, y: btnY, w: btnW, h: btnH },
 menu: { x: btnX, y: m2Y, w: btnW, h: btnH }
 };
 }
 
 function startGame() {
 player = { x: 1.5, y: 1.5, angle: 0, keys: [] };
 granny = { x: 10.5, y: 10.5, angle: 0, speed: DIFF_SETTINGS[difficulty].grannySpeed, alerted: false, alertTimer: 0, pathIndex: 0 };
 resetKeys();
 resetCameras();
 exitUnlocked = false;
 elapsedTime = 0;
 heartbeatTimer = 0;
 stepTimer = 0;
 warningAlpha = 0;
 startTime = Date.now();
 phase = 'playing';
 const disp = document.getElementById('granny-keys-display');
 if (disp) disp.textContent = 'Keys: 0/3';
 playAmbient();
 goFullscreen();
 }
 
 function update() {
 if (!running) return;
 frameId = requestAnimationFrame(update);
 
 if (phase === 'menu') {
 renderMenu();
 return;
 }
 
 if (phase === 'gameover') {
 renderGameOver();
 return;
 }
 
 if (phase === 'win') {
 renderWin();
 return;
 }
 
 // Playing
 elapsedTime++;
 handleInput();
 moveGranny(1);
 updateCameras();
 checkCollisions();
 
 render3D();
 renderMinimap();
 renderHUD();
 
 // Update time display
 const disp = document.getElementById('granny-time');
 if (disp) disp.textContent = Math.floor(elapsedTime / 60);
 }
 
 // Click/touch handling for menus
 function getClickPos(e) {
 const rect = canvas.getBoundingClientRect();
 const scaleX = canvas.width / rect.width;
 const scaleY = canvas.height / rect.height;
 let cx, cy;
 if (e.touches) {
 cx = (e.touches[0].clientX - rect.left) * scaleX;
 cy = (e.touches[0].clientY - rect.top) * scaleY;
 } else {
 cx = (e.clientX - rect.left) * scaleX;
 cy = (e.clientY - rect.top) * scaleY;
 }
 return { x: cx, y: cy };
 }
 
 function inBtn(pos, btn) {
 return pos.x >= btn.x && pos.x <= btn.x + btn.w && pos.y >= btn.y && pos.y <= btn.y + btn.h;
 }
 
 function onCanvasClick(e) {
 const pos = getClickPos(e);
 
 if (phase === 'menu'&& canvas._menuBtns) {
 canvas._menuBtns.diffs.forEach(b => {
 if (inBtn(pos, b)) { difficulty = b.d; }
 });
 if (inBtn(pos, canvas._menuBtns.start)) {
 startGame();
 }
 }
 
 if (phase === 'gameover'&& canvas._gameoverBtns) {
 if (inBtn(pos, canvas._gameoverBtns.retry)) { startGame(); }
 if (inBtn(pos, canvas._gameoverBtns.menu)) { phase = 'menu'; }
 }
 
 if (phase === 'win'&& canvas._winBtns) {
 if (inBtn(pos, canvas._winBtns.retry)) { startGame(); }
 if (inBtn(pos, canvas._winBtns.menu)) { phase = 'menu'; }
 }
 }
 
 canvas.addEventListener('click', onCanvasClick);
 canvas.addEventListener('touchstart', function(e) {
 if (phase!== 'playing') {
 onCanvasClick(e);
 }
 }, { passive: true });
 
 // Keyboard controls
 function onKeyDown(e) {
 keysDown[e.code] = true;
 if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
 }
 function onKeyUp(e) { keysDown[e.code] = false; }
 window.addEventListener('keydown', onKeyDown);
 window.addEventListener('keyup', onKeyUp);
 
 // Touch controls for gameplay (mobile joystick)
 let leftTouch = null;
 let rightTouch = null;
 
 // Create mobile control overlays
 const controlsDiv = document.createElement('div');
 controlsDiv.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding:0 10px;';
 
 const leftPad = document.createElement('div');
 leftPad.style.cssText = 'width:110px;height:110px;border-radius:55px;background:rgba(255,255,255,0.08);border:2px solid rgba(255,255,255,0.15);position:relative;touch-action:none;';
 leftPad.innerHTML = '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:rgba(255,255,255,0.3);font-size:12px;pointer-events:none;">MOVE</div>';
 
 const centerInfo = document.createElement('div');
 centerInfo.style.cssText = 'color:#888;font-size:11px;text-align:center;';
 centerInfo.innerHTML = 'WASD: Move<br>Q/E: Strafe';
 
 const rightPad = document.createElement('div');
 rightPad.style.cssText = 'width:110px;height:110px;border-radius:55px;background:rgba(255,255,255,0.08);border:2px solid rgba(255,255,255,0.15);position:relative;touch-action:none;';
 rightPad.innerHTML = '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:rgba(255,255,255,0.3);font-size:12px;pointer-events:none;">LOOK</div>';
 
 controlsDiv.appendChild(leftPad);
 controlsDiv.appendChild(centerInfo);
 controlsDiv.appendChild(rightPad);
 gameArea.appendChild(controlsDiv);
 
 // Left pad: movement joystick
 leftPad.addEventListener('touchstart', function(e) {
 e.preventDefault();
 leftTouch = { id: e.touches[0].identifier, startX: e.touches[0].clientX, startY: e.touches[0].clientY };
 }, { passive: false });
 leftPad.addEventListener('touchmove', function(e) {
 e.preventDefault();
 if (!leftTouch) return;
 for (let t of e.touches) {
 if (t.identifier === leftTouch.id) {
 const dx = (t.clientX - leftTouch.startX) / 40;
 const dy = -(t.clientY - leftTouch.startY) / 40;
 touchMove.x = Math.max(-1, Math.min(1, dx));
 touchMove.y = Math.max(-1, Math.min(1, dy));
 }
 }
 }, { passive: false });
 leftPad.addEventListener('touchend', function(e) {
 leftTouch = null;
 touchMove.x = 0;
 touchMove.y = 0;
 });
 
 // Right pad: look/rotation
 rightPad.addEventListener('touchstart', function(e) {
 e.preventDefault();
 rightTouch = { id: e.touches[0].identifier, lastX: e.touches[0].clientX };
 }, { passive: false });
 rightPad.addEventListener('touchmove', function(e) {
 e.preventDefault();
 if (!rightTouch) return;
 for (let t of e.touches) {
 if (t.identifier === rightTouch.id) {
 touchLook = (t.clientX - rightTouch.lastX) / 30;
 rightTouch.lastX = t.clientX;
 }
 }
 }, { passive: false });
 rightPad.addEventListener('touchend', function(e) {
 rightTouch = null;
 touchLook = 0;
 });
 
 // Start the game loop
 running = true;
 phase = 'menu';
 update();
 
 gameCleanup = () => {
 running = false;
 cancelAnimationFrame(frameId);
 window.removeEventListener('resize', resize);
 window.removeEventListener('keydown', onKeyDown);
 window.removeEventListener('keyup', onKeyUp);
 if (audioCtx) { try { audioCtx.close(); } catch(e) {} }
 };
}

// ==================== BLOCK BLAST ====================
function initBlockBlast() {
 const area = document.getElementById('game-area');
 const scoreDisplay = document.getElementById('game-score-display');
 const GRID = 8;
 const CELL = Math.min(Math.floor((Math.min(window.innerWidth, 500) - 40) / GRID), 50);
 let board = [];
 let score = 0;
 let gameOver = false;
 let selectedPiece = null;
 let pieces = [];
 let highScore = parseInt(localStorage.getItem('bb_high') || '0');

 const COLORS = ['#ff4444','#44aaff','#44ff88','#ffaa00','#ff44ff','#00ddff','#ff6644'];

 const SHAPES = [
  [[1]],
  [[1,1]],
  [[1],[1]],
  [[1,1,1]],
  [[1],[1],[1]],
  [[1,1],[1,1]],
  [[1,1,1],[1,0,0]],
  [[1,1,1],[0,0,1]],
  [[1,0],[1,1]],
  [[0,1],[1,1]],
  [[1,1,1,1]],
  [[1],[1],[1],[1]],
  [[1,1],[0,1],[0,1]],
  [[1,1],[1,0],[1,0]],
  [[1,1,1],[0,1,0]],
  [[1,0],[1,1],[1,0]],
  [[1,1,0],[0,1,1]],
  [[0,1,1],[1,1,0]],
  [[1,1,1],[1,0,0],[1,0,0]],
  [[1,1,1],[0,0,1],[0,0,1]],
 ];

 area.innerHTML = '';
 area.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:10px;touch-action:none;user-select:none;';
 scoreDisplay.innerHTML = '<span style="color:#ffeb3b;font-weight:700;">Score: 0</span> | <span style="color:#aaa;">Best: ' + highScore + '</span>';

 // Build board
 for (let r = 0; r < GRID; r++) {
  board[r] = [];
  for (let c = 0; c < GRID; c++) board[r][c] = 0;
 }

 // Grid element
 const gridEl = document.createElement('div');
 gridEl.style.cssText = 'display:grid;grid-template-columns:repeat(' + GRID + ',' + CELL + 'px);grid-template-rows:repeat(' + GRID + ',' + CELL + 'px);gap:2px;margin-bottom:16px;background:rgba(255,255,255,0.05);padding:4px;border-radius:8px;';
 area.appendChild(gridEl);

 const cells = [];
 for (let r = 0; r < GRID; r++) {
  cells[r] = [];
  for (let c = 0; c < GRID; c++) {
   const cell = document.createElement('div');
   cell.style.cssText = 'width:' + CELL + 'px;height:' + CELL + 'px;background:rgba(255,255,255,0.08);border-radius:4px;transition:background 0.15s;';
   cell.dataset.r = r;
   cell.dataset.c = c;
   gridEl.appendChild(cell);
   cells[r][c] = cell;

   cell.addEventListener('click', () => placePiece(r, c));
   cell.addEventListener('mouseenter', () => previewPiece(r, c));
   cell.addEventListener('mouseleave', clearPreview);
  }
 }

 // Piece tray
 const tray = document.createElement('div');
 tray.id = 'bb-tray';
 tray.style.cssText = 'display:flex;gap:16px;justify-content:center;flex-wrap:wrap;min-height:80px;align-items:center;';
 area.appendChild(tray);

 function randomPiece() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return { shape, color };
 }

 function spawnPieces() {
  pieces = [randomPiece(), randomPiece(), randomPiece()];
  selectedPiece = null;
  renderTray();
 }

 function renderTray() {
  tray.innerHTML = '';
  pieces.forEach((p, i) => {
   if (!p) { tray.appendChild(document.createElement('div')); return; }
   const wrap = document.createElement('div');
   wrap.style.cssText = 'cursor:pointer;padding:6px;border-radius:8px;border:2px solid ' + (selectedPiece === i ? '#fff' : 'transparent') + ';background:rgba(255,255,255,0.05);';
   const rows = p.shape.length;
   const cols = p.shape[0].length;
   const mini = Math.min(14, Math.floor(60 / Math.max(rows, cols)));
   const g = document.createElement('div');
   g.style.cssText = 'display:grid;grid-template-columns:repeat(' + cols + ',' + mini + 'px);gap:1px;';
   for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
     const b = document.createElement('div');
     b.style.cssText = 'width:' + mini + 'px;height:' + mini + 'px;border-radius:2px;background:' + (p.shape[r][c] ? p.color : 'transparent') + ';';
     g.appendChild(b);
    }
   }
   wrap.appendChild(g);
   wrap.addEventListener('click', (e) => { e.stopPropagation(); selectedPiece = i; renderTray(); });
   tray.appendChild(wrap);
  });
 }

 function canPlace(shape, sr, sc) {
  for (let r = 0; r < shape.length; r++) {
   for (let c = 0; c < shape[0].length; c++) {
    if (!shape[r][c]) continue;
    const nr = sr + r, nc = sc + c;
    if (nr < 0 || nr >= GRID || nc < 0 || nc >= GRID || board[nr][nc]) return false;
   }
  }
  return true;
 }

 function previewPiece(sr, sc) {
  clearPreview();
  if (selectedPiece === null || !pieces[selectedPiece]) return;
  const p = pieces[selectedPiece];
  const ok = canPlace(p.shape, sr, sc);
  for (let r = 0; r < p.shape.length; r++) {
   for (let c = 0; c < p.shape[0].length; c++) {
    if (!p.shape[r][c]) continue;
    const nr = sr + r, nc = sc + c;
    if (nr >= 0 && nr < GRID && nc >= 0 && nc < GRID) {
     cells[nr][nc].style.background = ok ? (p.color + '88') : 'rgba(255,0,0,0.3)';
    }
   }
  }
 }

 function clearPreview() {
  for (let r = 0; r < GRID; r++)
   for (let c = 0; c < GRID; c++)
    cells[r][c].style.background = board[r][c] ? board[r][c] : 'rgba(255,255,255,0.08)';
 }

 function placePiece(sr, sc) {
  if (gameOver || selectedPiece === null || !pieces[selectedPiece]) return;
  const p = pieces[selectedPiece];
  if (!canPlace(p.shape, sr, sc)) return;

  for (let r = 0; r < p.shape.length; r++) {
   for (let c = 0; c < p.shape[0].length; c++) {
    if (!p.shape[r][c]) continue;
    board[sr + r][sc + c] = p.color;
   }
  }

  // Count blocks placed
  let blocksPlaced = 0;
  for (let r = 0; r < p.shape.length; r++)
   for (let c = 0; c < p.shape[0].length; c++)
    if (p.shape[r][c]) blocksPlaced++;
  score += blocksPlaced;

  pieces[selectedPiece] = null;
  selectedPiece = null;

  // Check for full rows and columns
  let cleared = 0;
  let fullRows = [];
  let fullCols = [];

  for (let r = 0; r < GRID; r++) {
   if (board[r].every(v => v !== 0)) fullRows.push(r);
  }
  for (let c = 0; c < GRID; c++) {
   let full = true;
   for (let r = 0; r < GRID; r++) { if (!board[r][c]) { full = false; break; } }
   if (full) fullCols.push(c);
  }

  // Flash and clear
  fullRows.forEach(r => { for (let c = 0; c < GRID; c++) board[r][c] = 0; cleared++; });
  fullCols.forEach(c => { for (let r = 0; r < GRID; r++) board[r][c] = 0; cleared++; });

  if (cleared > 0) {
   score += cleared * GRID * 2;
   // Bonus for combos
   if (cleared > 1) score += (cleared - 1) * 20;
  }

  if (score > highScore) {
   highScore = score;
   localStorage.setItem('bb_high', highScore);
  }

  scoreDisplay.innerHTML = '<span style="color:#ffeb3b;font-weight:700;">Score: ' + score + '</span> | <span style="color:#aaa;">Best: ' + highScore + '</span>';

  renderBoard();

  // Spawn new pieces if all 3 used
  if (pieces.every(p => p === null)) spawnPieces();

  // Check game over
  if (isGameOver()) {
   gameOver = true;
   const overlay = document.createElement('div');
   overlay.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10;';
   overlay.innerHTML = '<h2 style="color:#ff4444;font-size:2em;margin-bottom:8px;">Game Over!</h2>'
    + '<p style="color:#fff;font-size:1.3em;margin-bottom:4px;">Score: <b>' + score + '</b></p>'
    + '<p style="color:#aaa;margin-bottom:16px;">Best: ' + highScore + '</p>'
    + '<button id="bb-retry" style="padding:12px 32px;background:#00ff88;color:#000;border:none;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer;">Play Again</button>';
   area.style.position = 'relative';
   area.appendChild(overlay);
   document.getElementById('bb-retry').addEventListener('click', () => {
    board = [];
    for (let r = 0; r < GRID; r++) { board[r] = []; for (let c = 0; c < GRID; c++) board[r][c] = 0; }
    score = 0;
    gameOver = false;
    scoreDisplay.innerHTML = '<span style="color:#ffeb3b;font-weight:700;">Score: 0</span> | <span style="color:#aaa;">Best: ' + highScore + '</span>';
    overlay.remove();
    renderBoard();
    spawnPieces();
   });
  }

  renderTray();
 }

 function isGameOver() {
  for (let i = 0; i < pieces.length; i++) {
   if (!pieces[i]) continue;
   for (let r = 0; r < GRID; r++)
    for (let c = 0; c < GRID; c++)
     if (canPlace(pieces[i].shape, r, c)) return false;
  }
  return true;
 }

 function renderBoard() {
  for (let r = 0; r < GRID; r++)
   for (let c = 0; c < GRID; c++)
    cells[r][c].style.background = board[r][c] ? board[r][c] : 'rgba(255,255,255,0.08)';
 }

 spawnPieces();

 gameCleanup = () => {};
}

// ==================== TV HORROR ====================
function initTVHorror() {
 const area = document.getElementById('game-area');
 const scoreDisplay = document.getElementById('game-score-display');
 area.innerHTML = '';
 area.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:0;position:relative;overflow:hidden;background:#000;width:100%;height:100%;';

 let running = false;
 let frameId = 0;

 // Canvas
 const canvas = document.createElement('canvas');
 const W = Math.min(window.innerWidth, 600);
 const H = Math.min(window.innerHeight - 120, 400);
 canvas.width = W;
 canvas.height = H;
 canvas.style.cssText = 'display:block;background:#000;border-radius:4px;touch-action:none;';
 area.appendChild(canvas);
 const ctx = canvas.getContext('2d');

 // Mobile controls
 const controls = document.createElement('div');
 controls.style.cssText = 'display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:8px;';
 const btnStyle = 'padding:12px 18px;background:rgba(255,255,255,0.12);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:8px;font-size:18px;cursor:pointer;user-select:none;-webkit-user-select:none;';
 ['⬅','⬆','⬇','➡'].forEach(label => {
  const b = document.createElement('button');
  b.textContent = label;
  b.style.cssText = btnStyle;
  controls.appendChild(b);
 });
 area.appendChild(controls);
 const [btnL, btnU, btnD, btnR] = controls.children;

 // Map: 1=wall, 2=TV room, 3=exit door
 // Player starts in TV room watching horror, enemy stalks from behind
 const MAP_W = 16;
 const MAP_H = 16;
 const map = [
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,
  1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,
  1,0,0,2,2,0,1,0,0,0,1,1,0,0,0,1,
  1,0,0,2,2,0,0,0,0,0,1,0,0,0,0,1,
  1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,
  1,1,1,0,0,1,1,1,0,1,1,0,0,1,1,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,1,1,0,0,0,0,0,0,1,1,0,0,1,
  1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,
  1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,
  1,0,0,0,0,0,1,0,0,1,0,0,0,3,0,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
 ];

 function getMap(x, y) { return map[y * MAP_W + x] || 1; }

 // Player in TV room
 let px = 3.5, py = 4.5, pa = 0;
 let speed = 0.04;

 // Enemy
 let ex = 13, ey = 1, eAngle = 0;
 let enemySpeed = 0.018;
 let enemyAlive = true;

 // Game state
 let escaped = false;
 let jumpscared = false;
 let timer = 0;
 let startTime = Date.now();
 let tvFlicker = 0;

 // Jumpscare image
 const scareImg = new Image();
 scareImg.src = 'jumpscare.jpg';

 // Keys
 const keys = { up: false, down: false, left: false, right: false };
 function onKeyDown(e) {
  switch (e.key) {
   case 'ArrowUp': case 'w': case 'W': keys.up = true; break;
   case 'ArrowDown': case 's': case 'S': keys.down = true; break;
   case 'ArrowLeft': case 'a': case 'A': keys.left = true; break;
   case 'ArrowRight': case 'd': case 'D': keys.right = true; break;
  }
 }
 function onKeyUp(e) {
  switch (e.key) {
   case 'ArrowUp': case 'w': case 'W': keys.up = false; break;
   case 'ArrowDown': case 's': case 'S': keys.down = false; break;
   case 'ArrowLeft': case 'a': case 'A': keys.left = false; break;
   case 'ArrowRight': case 'd': case 'D': keys.right = false; break;
  }
 }
 window.addEventListener('keydown', onKeyDown);
 window.addEventListener('keyup', onKeyUp);

 // Mobile button events
 function addMobileBtn(btn, key) {
  btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[key] = true; });
  btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[key] = false; });
  btn.addEventListener('mousedown', () => keys[key] = true);
  btn.addEventListener('mouseup', () => keys[key] = false);
  btn.addEventListener('mouseleave', () => keys[key] = false);
 }
 addMobileBtn(btnL, 'left');
 addMobileBtn(btnU, 'up');
 addMobileBtn(btnD, 'down');
 addMobileBtn(btnR, 'right');

 // Audio context for creepy sounds
 let audioCtx = null;
 try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}

 function playCreepySound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = 60 + Math.random() * 40;
  gain.gain.value = 0.08;
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
 }

 function playJumpscareSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.value = 200;
  osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.3);
  gain.gain.value = 0.4;
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 1);
 }

 function movePlayer() {
  const moveSpeed = speed;
  const turnSpeed = 0.04;
  if (keys.left) pa -= turnSpeed;
  if (keys.right) pa += turnSpeed;
  let dx = 0, dy = 0;
  if (keys.up) { dx = Math.cos(pa) * moveSpeed; dy = Math.sin(pa) * moveSpeed; }
  if (keys.down) { dx = -Math.cos(pa) * moveSpeed * 0.6; dy = -Math.sin(pa) * moveSpeed * 0.6; }
  // Collision
  const nx = px + dx, ny = py + dy;
  const margin = 0.2;
  if (getMap(Math.floor(nx + margin * Math.sign(dx)), Math.floor(py)) === 0 ||
      getMap(Math.floor(nx + margin * Math.sign(dx)), Math.floor(py)) === 2 ||
      getMap(Math.floor(nx + margin * Math.sign(dx)), Math.floor(py)) === 3) px = nx;
  if (getMap(Math.floor(px), Math.floor(ny + margin * Math.sign(dy))) === 0 ||
      getMap(Math.floor(px), Math.floor(ny + margin * Math.sign(dy))) === 2 ||
      getMap(Math.floor(px), Math.floor(ny + margin * Math.sign(dy))) === 3) py = ny;

  // Check exit
  if (getMap(Math.floor(px), Math.floor(py)) === 3) {
   escaped = true;
  }
 }

 function moveEnemy() {
  if (!enemyAlive || escaped || jumpscared) return;
  // Simple chase AI
  const dx = px - ex;
  const dy = py - ey;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 0.5) {
   // CAUGHT - jumpscare!
   jumpscared = true;
   playJumpscareSound();
   return;
  }
  // Move toward player
  const ang = Math.atan2(dy, dx);
  const nx = ex + Math.cos(ang) * enemySpeed;
  const ny = ey + Math.sin(ang) * enemySpeed;
  if (getMap(Math.floor(nx), Math.floor(ey)) !== 1) ex = nx;
  if (getMap(Math.floor(ex), Math.floor(ny)) !== 1) ey = ny;
  eAngle = ang;

  // Speed up over time
  enemySpeed = 0.018 + (Date.now() - startTime) / 100000;
  if (enemySpeed > 0.038) enemySpeed = 0.038;

  // Random creepy sound
  if (dist < 4 && Math.random() < 0.01) playCreepySound();
 }

 function castRays() {
  const FOV = Math.PI / 3;
  const numRays = W;
  const halfH = H / 2;

  // Ceiling
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, W, halfH);
  // Floor
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, halfH, W, halfH);

  const depthBuf = [];

  for (let i = 0; i < numRays; i++) {
   const rayAngle = pa - FOV / 2 + (i / numRays) * FOV;
   const cos = Math.cos(rayAngle);
   const sin = Math.sin(rayAngle);
   let dist = 0;
   let hitType = 0;
   let side = 0;

   // DDA raycasting
   const stepSize = 0.02;
   for (let d = 0; d < 16; d += stepSize) {
    const rx = px + cos * d;
    const ry = py + sin * d;
    const mx = Math.floor(rx);
    const my = Math.floor(ry);
    const cell = getMap(mx, my);
    if (cell === 1) {
     dist = d * Math.cos(rayAngle - pa); // fisheye correction
     hitType = 1;
     side = Math.abs(rx - mx) < 0.05 || Math.abs(rx - mx) > 0.95 ? 0 : 1;
     break;
    }
    if (cell === 2) {
     dist = d * Math.cos(rayAngle - pa);
     hitType = 2;
     side = Math.abs(rx - mx) < 0.05 || Math.abs(rx - mx) > 0.95 ? 0 : 1;
     break;
    }
    if (cell === 3) {
     dist = d * Math.cos(rayAngle - pa);
     hitType = 3;
     side = Math.abs(rx - mx) < 0.05 || Math.abs(rx - mx) > 0.95 ? 0 : 1;
     break;
    }
   }

   depthBuf[i] = dist || 16;

   if (dist > 0) {
    const wallH = Math.min(H * 2, (H / dist) * 0.8);
    const top = halfH - wallH / 2;
    const shade = Math.max(0.1, 1 - dist / 8);

    if (hitType === 1) {
     // Regular wall
     const r = Math.floor(40 * shade);
     const g = Math.floor(30 * shade);
     const b = Math.floor(50 * shade);
     ctx.fillStyle = side === 0 ? 'rgb(' + r + ',' + g + ',' + b + ')' : 'rgb(' + Math.floor(r*0.7) + ',' + Math.floor(g*0.7) + ',' + Math.floor(b*0.7) + ')';
    } else if (hitType === 2) {
     // TV room walls - flickering blue/white
     tvFlicker = (tvFlicker + 1) % 30;
     const flk = tvFlicker < 15 ? 1.2 : 0.8;
     const r = Math.floor(20 * shade * flk);
     const g = Math.floor(40 * shade * flk);
     const b = Math.floor(80 * shade * flk);
     ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    } else if (hitType === 3) {
     // Exit door - green
     const r = Math.floor(20 * shade);
     const g = Math.floor(180 * shade);
     const b = Math.floor(40 * shade);
     ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    ctx.fillRect(i, top, 1, wallH);
   }
  }

  // Render enemy as sprite
  const edx = ex - px;
  const edy = ey - py;
  const eDist = Math.sqrt(edx * edx + edy * edy);
  const eAng = Math.atan2(edy, edx) - pa;
  // Normalize angle
  let normAng = eAng;
  while (normAng < -Math.PI) normAng += Math.PI * 2;
  while (normAng > Math.PI) normAng -= Math.PI * 2;

  if (Math.abs(normAng) < FOV / 2 && eDist > 0.3) {
   const screenX = W / 2 + (normAng / (FOV / 2)) * (W / 2);
   const spriteH = Math.min(H * 2, (H / eDist) * 0.7);
   const spriteW = spriteH * 0.5;
   const top = H / 2 - spriteH / 2;

   // Only draw if not behind wall
   const rayIdx = Math.floor(screenX);
   if (rayIdx >= 0 && rayIdx < W && eDist < depthBuf[rayIdx]) {
    const shade = Math.max(0.15, 1 - eDist / 6);
    // Draw creepy shadow figure
    ctx.fillStyle = 'rgba(0,0,0,' + (shade * 0.9) + ')';
    ctx.fillRect(screenX - spriteW / 2, top, spriteW, spriteH);
    // Red eyes
    const eyeY = top + spriteH * 0.2;
    const eyeSize = Math.max(2, spriteW * 0.12);
    ctx.fillStyle = 'rgba(255,0,0,' + shade + ')';
    ctx.beginPath();
    ctx.arc(screenX - spriteW * 0.15, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.arc(screenX + spriteW * 0.15, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
   }
  }

  // HUD
  timer = ((Date.now() - startTime) / 1000).toFixed(1);
  ctx.fillStyle = '#fff';
  ctx.font = '14px monospace';
  ctx.fillText('🚪 Find the GREEN exit door!', 10, 20);
  ctx.fillStyle = '#ff4444';
  ctx.fillText('⚠ Something is chasing you...', 10, 38);

  // Minimap
  const mmS = 3;
  const mmX = W - MAP_W * mmS - 8;
  const mmY = 8;
  ctx.globalAlpha = 0.5;
  for (let y = 0; y < MAP_H; y++) {
   for (let x = 0; x < MAP_W; x++) {
    const cell = getMap(x, y);
    ctx.fillStyle = cell === 1 ? '#444' : cell === 2 ? '#004' : cell === 3 ? '#0a0' : '#111';
    ctx.fillRect(mmX + x * mmS, mmY + y * mmS, mmS, mmS);
   }
  }
  // Player dot
  ctx.fillStyle = '#0f0';
  ctx.fillRect(mmX + px * mmS - 1, mmY + py * mmS - 1, 3, 3);
  // Enemy dot
  ctx.fillStyle = '#f00';
  ctx.fillRect(mmX + ex * mmS - 1, mmY + ey * mmS - 1, 3, 3);
  ctx.globalAlpha = 1;
 }

 function showJumpscare() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  if (scareImg.complete) {
   // Draw image filling the canvas
   const imgRatio = scareImg.width / scareImg.height;
   const canvasRatio = W / H;
   let dw, dh, dx, dy;
   if (imgRatio > canvasRatio) {
    dh = H; dw = H * imgRatio; dx = (W - dw) / 2; dy = 0;
   } else {
    dw = W; dh = W / imgRatio; dx = 0; dy = (H - dh) / 2;
   }
   // Shake effect
   const shake = Math.random() * 10 - 5;
   ctx.drawImage(scareImg, dx + shake, dy + shake, dw, dh);
  }
  ctx.fillStyle = 'rgba(255,0,0,0.3)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ff0000';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('IT GOT YOU!', W / 2, H - 40);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText('Press SPACE or tap to try again', W / 2, H - 16);
  ctx.textAlign = 'left';
 }

 function showEscape() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('YOU ESCAPED! 🎉', W / 2, H / 2 - 20);
  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText('Time: ' + timer + 's', W / 2, H / 2 + 20);
  ctx.fillText('Press SPACE or tap to play again', W / 2, H / 2 + 50);
  ctx.textAlign = 'left';
 }

 function resetGame() {
  px = 3.5; py = 4.5; pa = 0;
  ex = 13; ey = 1;
  enemySpeed = 0.018;
  escaped = false;
  jumpscared = false;
  startTime = Date.now();
 }

 function onRestart(e) {
  if (e.type === 'keydown' && e.key !== ' ') return;
  if (escaped || jumpscared) {
   resetGame();
  }
 }
 window.addEventListener('keydown', onRestart);
 canvas.addEventListener('click', () => {
  if (escaped || jumpscared) resetGame();
 });

 function update() {
  if (!running) return;
  if (!escaped && !jumpscared) {
   movePlayer();
   moveEnemy();
   castRays();
  } else if (jumpscared) {
   showJumpscare();
  } else if (escaped) {
   showEscape();
  }

  scoreDisplay.innerHTML = '<span style="color:#ff4444;">⏱ ' + timer + 's</span> | <span style="color:' + (escaped ? '#00ff88' : jumpscared ? '#ff0000' : '#ffeb3b') + ';">' + (escaped ? 'ESCAPED!' : jumpscared ? 'CAUGHT!' : 'RUN!') + '</span>';

  frameId = requestAnimationFrame(update);
 }

 running = true;
 update();

 gameCleanup = () => {
  running = false;
  cancelAnimationFrame(frameId);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  window.removeEventListener('keydown', onRestart);
  if (audioCtx) { try { audioCtx.close(); } catch(e) {} }
 };
}

// ==================== 30. EATING SIMULATOR ====================
function initEatingSimulator() {
 gameTitle.textContent = 'Eating Simulator';

 const canvas = document.createElement('canvas');
 canvas.className = 'game-canvas';
 canvas.width = 400;
 canvas.height = 400;
 const ctx = canvas.getContext('2d');

 const info = document.createElement('div');
 info.className = 'game-info';
 info.innerHTML = '<span>Score: <b id="eat-score">0</b></span><span>Time: <b id="eat-time">60</b></span><span>Best: <b id="eat-high">' + getHigh('eating') + '</b></span>';

 const powerupBar = document.createElement('div');
 powerupBar.style.cssText = 'text-align:center;color:#ffd700;font-weight:bold;font-size:0.9rem;min-height:1.4em;margin:4px 0;';
 powerupBar.id = 'eat-powerup';

 const startBtn = document.createElement('button');
 startBtn.className = 'game-btn';
 startBtn.textContent = '🍕 Start 🍕';

 const mobileControls = document.createElement('div');
 mobileControls.style.cssText = 'display:grid;grid-template-columns:repeat(3,60px);grid-template-rows:repeat(3,50px);gap:4px;margin-top:12px;justify-content:center;';
 const dpadLayout = [
  ['', 'UP', ''],
  ['LT', '', 'RT'],
  ['', 'DN', '']
 ];
 const dpadArrows = { UP: '⬆️', DN: '⬇️', LT: '⬅️', RT: '➡️' };
 const dpadDirMap = { UP: 'up', DN: 'down', LT: 'left', RT: 'right' };
 dpadLayout.forEach(row => {
  row.forEach(d => {
   const b = document.createElement('button');
   b.className = 'game-btn';
   b.style.cssText = 'padding:8px;font-size:1.2rem;margin:0;';
   if (d && dpadDirMap[d]) {
    b.textContent = dpadArrows[d];
    const dir = dpadDirMap[d];
    b.addEventListener('mousedown', () => { keys['dpad-' + dir] = true; });
    b.addEventListener('mouseup', () => { keys['dpad-' + dir] = false; });
    b.addEventListener('mouseleave', () => { keys['dpad-' + dir] = false; });
    b.addEventListener('touchstart', (e) => { e.preventDefault(); keys['dpad-' + dir] = true; });
    b.addEventListener('touchend', (e) => { e.preventDefault(); keys['dpad-' + dir] = false; });
    b.addEventListener('touchcancel', () => { keys['dpad-' + dir] = false; });
   } else {
    b.style.visibility = 'hidden';
   }
   mobileControls.appendChild(b);
  });
 });

 gameArea.append(info, powerupBar, canvas, startBtn, mobileControls);

 // Audio engine
 const AudioCtx = window.AudioContext || window.webkitAudioContext;
 let audioCtx;
 function ensureAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
  if (audioCtx.state === 'suspended') audioCtx.resume();
 }
 function playEatSound() {
  ensureAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(600, audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
  g.gain.setValueAtTime(0.3, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
  o.start(); o.stop(audioCtx.currentTime + 0.15);
 }
 function playPowerupSound() {
  ensureAudio();
  [0, 0.1, 0.2].forEach((delay, i) => {
   const o = audioCtx.createOscillator();
   const g = audioCtx.createGain();
   o.connect(g); g.connect(audioCtx.destination);
   o.type = 'sine';
   o.frequency.setValueAtTime(800 + i * 200, audioCtx.currentTime + delay);
   g.gain.setValueAtTime(0.25, audioCtx.currentTime + delay);
   g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + 0.12);
   o.start(audioCtx.currentTime + delay);
   o.stop(audioCtx.currentTime + delay + 0.12);
  });
 }
 function playPoisonSound() {
  ensureAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(400, audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.6);
  g.gain.setValueAtTime(0.3, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
  o.start(); o.stop(audioCtx.currentTime + 0.6);
 }
 function playGameOverSnd() {
  ensureAudio();
  [400, 350, 300, 200].forEach((freq, i) => {
   const o = audioCtx.createOscillator();
   const g = audioCtx.createGain();
   o.connect(g); g.connect(audioCtx.destination);
   o.type = 'square';
   const t = audioCtx.currentTime + i * 0.2;
   o.frequency.setValueAtTime(freq, t);
   g.gain.setValueAtTime(0.2, t);
   g.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
   o.start(t); o.stop(t + 0.18);
  });
 }
 function playTickSound() {
  ensureAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(1000, audioCtx.currentTime);
  g.gain.setValueAtTime(0.1, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
  o.start(); o.stop(audioCtx.currentTime + 0.05);
 }

 // Food types
 const FOODS = [
  { emoji: '🍔', points: 10, name: 'Burger' },
  { emoji: '🍕', points: 8, name: 'Pizza' },
  { emoji: '🍩', points: 12, name: 'Donut' },
  { emoji: '🍦', points: 7, name: 'Ice Cream' },
  { emoji: '🌮', points: 9, name: 'Taco' },
  { emoji: '🍟', points: 6, name: 'Fries' },
  { emoji: '🍪', points: 5, name: 'Cookie' },
  { emoji: '🍎', points: 15, name: 'Apple' },
  { emoji: '🍌', points: 13, name: 'Banana' },
  { emoji: '🍉', points: 20, name: 'Watermelon' }
 ];

 let player, foods, particles, score, timeLeft, gameRunning;
 let foodsEaten, bestCombo, currentCombo, comboTimer;
 let powerupActive, powerupTimer, keys, animFrame;
 let lastTime, spawnTimer, timerAccum;

 function createPlayer() {
  return {
   x: canvas.width / 2,
   y: canvas.height / 2,
   baseSize: 15,
   size: 15,
   speed: 140,
   mouthOpen: 0,
   mouthDir: 1,
   growthLevel: 0
  };
 }

 function spawnFood() {
  const padding = 25;
  const isSpecial = Math.random() < 0.08;
  const isPoison = !isSpecial && Math.random() < 0.05;
  let food;
  if (isSpecial) {
   food = { emoji: '⭐', points: 0, name: 'Star', special: true };
  } else if (isPoison) {
   food = { emoji: '💀', points: 0, name: 'Poison', poison: true };
  } else {
   food = { ...FOODS[Math.floor(Math.random() * FOODS.length)] };
  }
  const size = food.special ? 18 : (food.poison ? 15 : 10 + Math.random() * 5);
  return {
   x: padding + Math.random() * (canvas.width - padding * 2),
   y: padding + Math.random() * (canvas.height - padding * 2),
   size: size,
   ...food,
   bobOffset: Math.random() * Math.PI * 2,
   age: 0,
   alpha: 0
  };
 }

 function createParticle(x, y, emoji, color) {
  return {
   x, y,
   vx: (Math.random() - 0.5) * 200,
   vy: (Math.random() - 0.5) * 200 - 100,
   life: 1,
   decay: 1.5 + Math.random(),
   size: 6 + Math.random() * 5,
   emoji: emoji,
   color: color,
   rotation: Math.random() * Math.PI * 2
  };
 }

 function createScorePopup(x, y, points) {
  return {
   x, y,
   vy: -80,
   life: 1,
   decay: 1.2,
   text: '+' + points,
   size: 10 + Math.min(points, 20),
   isText: true
  };
 }

 function checkCollision(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist < (a.size + b.size) * 0.6;
 }

 function eatFood(food, index) {
  foods.splice(index, 1);
  if (food.poison) {
   for (let i = 0; i < 15; i++) particles.push(createParticle(food.x, food.y, '💀', '#00ff00'));
   endGame(true);
   return;
  }
  if (food.special) {
   playPowerupSound();
   powerupActive = true;
   powerupTimer = 5;
   document.getElementById('eat-powerup').textContent = '⭐ 2x POINTS! ⭐';
   for (let i = 0; i < 10; i++) particles.push(createParticle(food.x, food.y, '⭐', '#ffd700'));
   return;
  }
  playEatSound();
  let pts = food.points;
  if (powerupActive) pts *= 2;
  currentCombo++;
  comboTimer = 1.5;
  if (currentCombo > 1) pts = Math.floor(pts * (1 + currentCombo * 0.1));
  if (currentCombo > bestCombo) bestCombo = currentCombo;
  score += pts;
  foodsEaten++;
  player.growthLevel = Math.min(foodsEaten * 0.25, 12);
  player.size = player.baseSize + player.growthLevel;
  player.speed = Math.max(90, 140 - player.growthLevel);
  document.getElementById('eat-score').textContent = score;
  for (let i = 0; i < 5; i++) particles.push(createParticle(food.x, food.y, food.emoji, '#ffaa00'));
  particles.push(createScorePopup(food.x, food.y - 10, pts));
 }

 function endGame(poisoned) {
  gameRunning = false;
  if (animFrame) cancelAnimationFrame(animFrame);
  if (poisoned) playPoisonSound();
  playGameOverSnd();
  document.getElementById('eat-powerup').textContent = '';
  const title = poisoned ? '☠️ Poisoned!' : "⏰ Time's Up!";
  showGameOver(title + ' | Foods: ' + foodsEaten + ' | Best Combo: ' + bestCombo, score, 'eating', () => { reset(); beginGame(); });
 }

 function reset() {
  player = createPlayer();
  foods = [];
  particles = [];
  score = 0;
  timeLeft = 60;
  foodsEaten = 0;
  bestCombo = 0;
  currentCombo = 0;
  comboTimer = 0;
  powerupActive = false;
  powerupTimer = 0;
  keys = {};
  timerAccum = 0;
  spawnTimer = 0;
  for (let i = 0; i < 8; i++) foods.push(spawnFood());
  document.getElementById('eat-score').textContent = '0';
  document.getElementById('eat-time').textContent = '60';
  document.getElementById('eat-high').textContent = getHigh('eating');
  document.getElementById('eat-powerup').textContent = '';
 }

 function beginGame() {
  ensureAudio();
  gameRunning = true;
  lastTime = performance.now();
  if (animFrame) cancelAnimationFrame(animFrame);
  gameLoop();
 }

 function gameLoop() {
  if (!gameRunning) return;
  animFrame = requestAnimationFrame(gameLoop);
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  // Timer
  timerAccum += dt;
  if (timerAccum >= 1) {
   timerAccum -= 1;
   timeLeft--;
   document.getElementById('eat-time').textContent = Math.max(0, Math.ceil(timeLeft));
   if (timeLeft <= 5 && timeLeft > 0) playTickSound();
   if (timeLeft <= 0) { endGame(false); return; }
  }

  // Combo decay
  if (comboTimer > 0) {
   comboTimer -= dt;
   if (comboTimer <= 0) currentCombo = 0;
  }

  // Powerup timer
  if (powerupActive) {
   powerupTimer -= dt;
   if (powerupTimer <= 0) {
    powerupActive = false;
    document.getElementById('eat-powerup').textContent = '';
   }
  }

  // Spawn food
  spawnTimer += dt;
  const spawnRate = 1.2 - Math.min(score / 500, 0.7);
  if (spawnTimer >= spawnRate && foods.length < 15) {
   spawnTimer = 0;
   foods.push(spawnFood());
  }

  // Player movement
  let mx = 0, my = 0;
  if (keys['ArrowLeft'] || keys['a'] || keys['A'] || keys['dpad-left']) mx -= 1;
  if (keys['ArrowRight'] || keys['d'] || keys['D'] || keys['dpad-right']) mx += 1;
  if (keys['ArrowUp'] || keys['w'] || keys['W'] || keys['dpad-up']) my -= 1;
  if (keys['ArrowDown'] || keys['s'] || keys['S'] || keys['dpad-down']) my += 1;
  if (mx !== 0 && my !== 0) { mx *= 0.707; my *= 0.707; }

  player.x += mx * player.speed * dt;
  player.y += my * player.speed * dt;
  player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));

  // Mouth animation
  player.mouthOpen += player.mouthDir * dt * 5;
  if (player.mouthOpen > 1) { player.mouthOpen = 1; player.mouthDir = -1; }
  if (player.mouthOpen < 0) { player.mouthOpen = 0; player.mouthDir = 1; }

  // Collisions
  for (let i = foods.length - 1; i >= 0; i--) {
   if (checkCollision(player, foods[i])) {
    eatFood(foods[i], i);
    if (!gameRunning) return;
   }
  }

  // Update food
  foods.forEach(f => { f.age += dt; f.alpha = Math.min(1, f.age * 3); });

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
   const p = particles[i];
   p.life -= p.decay * dt;
   if (p.isText) { p.y += p.vy * dt; }
   else { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; }
   if (p.life <= 0) particles.splice(i, 1);
  }

  // ============ RENDER ============
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = '#0d0d20';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  const gridSize = 30;
  for (let x = 0; x < canvas.width; x += gridSize) {
   ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
   ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  // Draw foods
  foods.forEach(f => {
   ctx.save();
   ctx.globalAlpha = f.alpha;
   const bob = Math.sin(f.bobOffset + performance.now() / 500) * 2;
   const scale = f.special ? 1 + Math.sin(performance.now() / 200) * 0.15 : 1;
   ctx.font = (f.size * 2 * scale) + 'px serif';
   ctx.textAlign = 'center';
   ctx.textBaseline = 'middle';
   if (f.special) { ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 20; }
   else if (f.poison) { ctx.shadowColor = '#00ff00'; ctx.shadowBlur = 15; }
   ctx.fillText(f.emoji, f.x, f.y + bob);
   ctx.restore();
  });

  // Draw player
  ctx.save();
  const playerScale = 1 + Math.sin(performance.now() / 300) * 0.03;
  ctx.font = (player.size * 2 * playerScale) + 'px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (powerupActive) {
   ctx.shadowColor = '#ffd700';
   ctx.shadowBlur = 30 + Math.sin(performance.now() / 150) * 10;
  } else {
   ctx.shadowColor = 'rgba(255,200,0,0.4)';
   ctx.shadowBlur = 10;
  }
  let face = '😋';
  if (mx !== 0 || my !== 0) face = '😮';
  if (powerupActive) face = '🤩';
  if (currentCombo >= 3) face = '😤';
  if (timeLeft <= 10) face = '😰';
  ctx.fillText(face, player.x, player.y);
  ctx.restore();

  // Combo indicator
  if (currentCombo >= 2) {
   ctx.save();
   ctx.font = 'bold ' + (8 + currentCombo * 2) + 'px sans-serif';
   ctx.textAlign = 'center';
   ctx.fillStyle = 'rgba(255,' + Math.max(100, 255 - currentCombo * 30) + ',0,' + Math.min(1, comboTimer) + ')';
   ctx.shadowColor = '#ff6600';
   ctx.shadowBlur = 10;
   ctx.fillText(currentCombo + 'x COMBO!', player.x, player.y - player.size - 8);
   ctx.restore();
  }

  // Particles
  particles.forEach(p => {
   ctx.save();
   ctx.globalAlpha = Math.max(0, p.life);
   if (p.isText) {
    ctx.font = 'bold ' + p.size + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = powerupActive ? '#ffd700' : '#fff';
    ctx.shadowColor = powerupActive ? '#ffd700' : '#ff6600';
    ctx.shadowBlur = 8;
    ctx.fillText(p.text, p.x, p.y);
   } else {
    ctx.font = p.size + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillText(p.emoji, 0, 0);
   }
   ctx.restore();
  });

  // Timer warning flash
  if (timeLeft <= 10 && timeLeft > 0) {
   ctx.save();
   ctx.fillStyle = 'rgba(255,0,0,' + (0.1 * Math.abs(Math.sin(performance.now() / 200))) + ')';
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   ctx.restore();
  }
 }

 // Keyboard input
 function onKeyDown(e) {
  keys[e.key] = true;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
 }
 function onKeyUp(e) {
  keys[e.key] = false;
 }
 window.addEventListener('keydown', onKeyDown);
 window.addEventListener('keyup', onKeyUp);

 reset();

 startBtn.onclick = () => {
  startBtn.style.display = 'none';
  reset();
  beginGame();
 };

 gameCleanup = () => {
  gameRunning = false;
  if (animFrame) cancelAnimationFrame(animFrame);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  if (audioCtx) { try { audioCtx.close(); } catch(e) {} }
 };
}
