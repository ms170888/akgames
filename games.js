/* ========================================================
   AK GAMES — 7 Browser Games for Maaz
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
        case 'talkingtom': initTalkingCat(); break;
    }
}

function backToMenu() {
    if (gameCleanup) { gameCleanup(); gameCleanup = null; }
    currentGame = null;
    gameContainer.classList.add('hidden');
    mainMenu.classList.remove('hidden');
}

function getHigh(key) { return parseInt(localStorage.getItem('ak_' + key) || '0'); }
function setHigh(key, val) {
    const prev = getHigh(key);
    if (val > prev) { localStorage.setItem('ak_' + key, val); return true; }
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
        <div class="high-score">🏆 Best: ${hi}${isNew ? ' — NEW RECORD!' : ''}</div>
    `;
    const btn = document.createElement('button');
    btn.className = 'game-btn';
    btn.textContent = '🔄 Play Again';
    btn.onclick = () => { overlay.remove(); onRestart(); };
    overlay.appendChild(btn);

    const menuBtn = document.createElement('button');
    menuBtn.className = 'game-btn';
    menuBtn.textContent = '🏠 Menu';
    menuBtn.onclick = () => { overlay.remove(); backToMenu(); };
    overlay.appendChild(menuBtn);

    document.body.appendChild(overlay);
}


// ==================== 1. SNAKE ====================
function initSnake() {
    gameTitle.textContent = '🐍 Snake';
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
    startBtn.textContent = '▶ Start';

    // Mobile controls
    const mobileControls = document.createElement('div');
    mobileControls.style.cssText = 'display:grid;grid-template-columns:repeat(3,60px);grid-template-rows:repeat(2,50px);gap:4px;margin-top:12px;justify-content:center;';
    const dirs = [
        ['', '⬆️', ''],
        ['⬅️', '⬇️', '➡️']
    ];
    const dirMap = {'⬆️':'up','⬇️':'down','⬅️':'left','➡️':'right'};
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
        if (d !== opp[dir]) nextDir = d;
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
        startBtn.textContent = '▶ Start';
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
            ctx.fillStyle = i === 0 ? '#00ff88' : `rgba(0,255,136,${brightness})`;
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = i === 0 ? 8 : 3;
            ctx.fillRect(s.x*SIZE+1, s.y*SIZE+1, SIZE-2, SIZE-2);
        });
        ctx.shadowBlur = 0;
    }

    function onKey(e) {
        if (currentGame !== 'snake') return;
        const map = {ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
        if (map[e.key]) { e.preventDefault(); changeDir(map[e.key]); }
    }

    document.addEventListener('keydown', onKey);

    startBtn.onclick = () => {
        if (running) { running = false; clearInterval(interval); startBtn.textContent = '▶ Start'; return; }
        reset();
        running = true;
        startBtn.textContent = '⏸ Pause';
        interval = setInterval(step, 120);
    };

    reset();
    gameCleanup = () => { running = false; clearInterval(interval); document.removeEventListener('keydown', onKey); };
}


// ==================== 2. TIC TAC TOE ====================
function initTicTacToe() {
    gameTitle.textContent = '❌⭕ Tic Tac Toe';

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
    restartBtn.textContent = '🔄 New Game';

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
            cell.className = 'ttt-cell' + (board[i] === 'X' ? ' x' : board[i] === 'O' ? ' o' : '');
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
        return b.every(c => c) ? 'draw' : null;
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
            const empty = board.map((v,i) => v === '' ? i : -1).filter(i => i>=0);
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
        if (gameOver || board[i] || turn !== 'X') return;
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
            status.textContent = '🎉 You win!';
            wins++; localStorage.setItem('ak_ttt_wins', wins);
        } else if (result === 'O') {
            status.textContent = '😢 CPU wins!';
            losses++; localStorage.setItem('ak_ttt_losses', losses);
        } else {
            status.textContent = '🤝 Draw!';
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
    gameTitle.textContent = '🧠 Memory Match';

    const emojis = ['🚀','🎸','🦊','⚡','🌈','🎯','🍕','💎'];
    let cards, flipped, matched, moves, timerStart, timerInterval, locked;

    const info = document.createElement('div');
    info.className = 'game-info';
    info.innerHTML = `<span>Moves: <b id="mem-moves">0</b></span><span>Time: <b id="mem-time">0s</b></span><span>Best: <b id="mem-high">${getHigh('memory') || '—'}</b> moves</span>`;

    const grid = document.createElement('div');
    grid.className = 'memory-grid';

    const restartBtn = document.createElement('button');
    restartBtn.className = 'game-btn';
    restartBtn.textContent = '🔄 New Game';

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
        cards = shuffle([...emojis, ...emojis]);
        flipped = []; matched = new Set(); moves = 0; locked = false;
        timerStart = null;
        document.getElementById('mem-moves').textContent = '0';
        document.getElementById('mem-time').textContent = '0s';
        document.getElementById('mem-high').textContent = getHigh('memory') || '—';
        render();
    }

    function render() {
        grid.innerHTML = '';
        cards.forEach((emoji, i) => {
            const card = document.createElement('div');
            card.className = 'memory-card' +
                (flipped.includes(i) ? ' flipped' : '') +
                (matched.has(i) ? ' matched' : '');
            card.textContent = (flipped.includes(i) || matched.has(i)) ? emoji : '?';
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
                    showGameOver('🎉 You Win!', moves + ' moves in ' + time + 's', 'memory_dummy', reset);
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
    gameTitle.textContent = '🏃 Endless Runner';

    const canvas = document.createElement('canvas');
    canvas.className = 'game-canvas';
    canvas.width = 600; canvas.height = 250;
    const ctx = canvas.getContext('2d');

    const info = document.createElement('div');
    info.className = 'game-info';
    info.innerHTML = `<span>Score: <b id="run-score">0</b></span><span>Best: <b id="run-high">${getHigh('runner')}</b></span>`;

    const startBtn = document.createElement('button');
    startBtn.className = 'game-btn';
    startBtn.textContent = '▶ Start (Space/Tap to Jump)';

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
        startBtn.textContent = '▶ Start';
        const finalScore = Math.floor(score / 5);
        showGameOver('Crashed! 💥', finalScore, 'runner', () => { reset(); });
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
        if (currentGame !== 'runner') return;
        if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); jump(); }
    }

    document.addEventListener('keydown', onKey);
    canvas.addEventListener('click', jump);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });

    startBtn.onclick = () => {
        if (running) return;
        reset();
        running = true;
        startBtn.textContent = '🏃 Running...';
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
    gameTitle.textContent = '🧩 Slide Puzzle';

    let tiles, emptyIdx, moves, solved;

    const info = document.createElement('div');
    info.className = 'game-info';
    info.innerHTML = `<span>Moves: <b id="puz-moves">0</b></span><span>Best: <b id="puz-high">${getHigh('puzzle') || '—'}</b></span>`;

    const grid = document.createElement('div');
    grid.className = 'puzzle-grid';

    const shuffleBtn = document.createElement('button');
    shuffleBtn.className = 'game-btn';
    shuffleBtn.textContent = '🔀 Shuffle';

    gameArea.append(info, grid, shuffleBtn);

    function isSolvable(arr) {
        let inv = 0;
        const flat = arr.filter(v => v !== 0);
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
            tile.className = 'puzzle-tile' + (val === 0 ? ' empty' : '');
            tile.textContent = val === 0 ? '' : val;
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
        const win = tiles.every((v, idx) => idx === 15 ? v === 0 : v === idx + 1);
        if (win) {
            solved = true;
            const prev = getHigh('puzzle');
            if (!prev || moves < prev) localStorage.setItem('ak_puzzle', moves);
            document.getElementById('puz-high').textContent = localStorage.getItem('ak_puzzle') || moves;
            showGameOver('🧩 Solved!', moves + ' moves', 'puzzle_dummy', shuffle);
        }
    }

    shuffleBtn.onclick = shuffle;
    shuffle();
    gameCleanup = () => {};
}


// ==================== 6. TARGET SHOOTER ====================
function initShooter() {
    gameTitle.textContent = '🎯 Target Shooter';

    let score, timeLeft, running, spawnInterval, timerInterval;

    const info = document.createElement('div');
    info.className = 'game-info';
    info.innerHTML = `<span>Score: <b id="shoot-score">0</b></span><span>Time: <b id="shoot-time">60</b>s</span><span>Best: <b id="shoot-high">${getHigh('shooter')}</b></span>`;

    const arena = document.createElement('div');
    arena.className = 'shooter-arena';

    const startBtn = document.createElement('button');
    startBtn.className = 'game-btn';
    startBtn.textContent = '▶ Start (60 seconds)';

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
        startBtn.textContent = '🔫 Shooting...';

        timerInterval = setInterval(() => {
            timeLeft--;
            document.getElementById('shoot-time').textContent = timeLeft;
            if (timeLeft <= 0) {
                running = false;
                clearInterval(timerInterval);
                clearInterval(spawnInterval);
                startBtn.textContent = '▶ Start';
                showGameOver('⏰ Time Up!', score, 'shooter', start);
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
    gameTitle.textContent = '🏓 Pong';

    const canvas = document.createElement('canvas');
    canvas.className = 'game-canvas';
    canvas.width = 600; canvas.height = 400;
    const ctx = canvas.getContext('2d');

    const info = document.createElement('div');
    info.className = 'game-info';
    info.innerHTML = `<span>You: <b id="pong-player">0</b></span><span>CPU: <b id="pong-cpu">0</b></span><span>First to 5 wins!</span>`;

    const startBtn = document.createElement('button');
    startBtn.className = 'game-btn';
    startBtn.textContent = '▶ Start';

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
        if (mouseY !== null) {
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
            ball.y = ball.y - BALL_R <= 0 ? BALL_R : canvas.height - BALL_R;
        }

        // Paddle collision — player (left)
        if (ball.vx < 0 && ball.x - BALL_R <= PAD_W + 15 && ball.y >= playerY && ball.y <= playerY + PAD_H) {
            ball.vx = Math.abs(ball.vx) * 1.05;
            ball.vy += (ball.y - (playerY + PAD_H / 2)) * 0.15;
            ball.x = PAD_W + 15 + BALL_R;
        }

        // Paddle collision — CPU (right)
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
        startBtn.textContent = '▶ Start';
        const won = winner === 'Player';
        if (won) {
            const w = getHigh('pong_wins') + 1;
            localStorage.setItem('ak_pong_wins', w);
        }
        showGameOver(won ? '🎉 You Win!' : '😢 CPU Wins!', playerScore + ' — ' + cpuScore, 'pong_dummy', () => { reset(); });
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
        if (currentGame !== 'pong' || !running) return;
        if (e.key === 'ArrowUp') { e.preventDefault(); playerY -= 20; }
        if (e.key === 'ArrowDown') { e.preventDefault(); playerY += 20; }
    }

    function onMouseMove(e) {
        if (currentGame !== 'pong' || !running) return;
        const rect = canvas.getBoundingClientRect();
        mouseY = e.clientY - rect.top;
    }

    function onTouchMove(e) {
        if (currentGame !== 'pong' || !running) return;
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
        startBtn.textContent = '🏓 Playing...';
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
    gameTitle.textContent = '🎱 Bingo';

    // Generate a random bingo card (5x5) with FREE center
    function generateCard() {
        const cols = {
            B: [], I: [], N: [], G: [], O: []
        };
        const letters = ['B','I','N','G','O'];
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
        const letters = ['B','I','N','G','O'];
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
                    <div style="font-size:3rem;margin-bottom:10px;">🎉</div>
                    <div style="font-size:2rem;font-weight:bold;color:#00ff88;font-family:Orbitron,sans-serif;">BINGO!</div>
                    <div style="color:#ccc;margin:10px 0;">Wins: ${wins}${isNew ? ' ⭐ New Record!' : ''}</div>
                    <div style="color:#888;margin-bottom:15px;">High Score: ${getHigh('bingo')}</div>
                    <button style="padding:12px 30px;font-size:1.1rem;background:linear-gradient(135deg,#00ff88,#00d4ff);border:none;border-radius:8px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;" onclick="this.parentElement.remove()">New Game</button>
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
        const letters = ['B','I','N','G','O'];
        const ballDisplay = currentBall ? `<div style="font-size:2.5rem;font-weight:bold;color:#00ff88;font-family:Orbitron,sans-serif;text-shadow:0 0 20px #00ff88;">${currentBall.display}</div>` : `<div style="font-size:1.2rem;color:#888;">Press Start to play!</div>`;
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
                const isCalled = val !== 'FREE' && calledNumbers.has(val);
                let bg = '#1a1a2e';
                let color = '#fff';
                let border = '2px solid #333';
                let cursor = 'default';
                let glow = '';

                if (isMarked) {
                    bg = isFree ? '#b44aff' : '#00ff88';
                    color = '#000';
                    glow = isMarked && !isFree ? 'box-shadow:0 0 15px #00ff88;' : 'box-shadow:0 0 10px #b44aff;';
                } else if (isCalled) {
                    bg = '#1a3a2e';
                    border = '2px solid #00ff88';
                    cursor = 'pointer';
                    glow = 'box-shadow:0 0 8px rgba(0,255,136,0.3);';
                }

                const display = isFree ? '⭐' : val;
                gridHTML += `<td onclick="window._bingoMark(${r},${c})" style="width:55px;height:55px;text-align:center;font-size:${isFree ? '1.5rem' : '1.1rem'};font-weight:bold;background:${bg};color:${color};border:${border};border-radius:8px;cursor:${cursor};font-family:Rajdhani,sans-serif;transition:all 0.2s;${glow}">${display}</td>`;
            }
            gridHTML += '</tr>';
        }
        gridHTML += '</table>';

        // Recent calls (last 5)
        const recent = [];
        for (let i = Math.max(0, ballIndex - 5); i < ballIndex; i++) {
            recent.push(balls[i].display);
        }
        const recentHTML = recent.length > 0 ? `<div style="margin-top:12px;color:#888;font-size:0.9rem;">Recent: ${recent.map(r => `<span style="color:#00d4ff;margin:0 4px;">${r}</span>`).join(' ')}</div>` : '';

        gameArea.innerHTML = `
            <div style="text-align:center;padding:10px;">
                <div style="margin-bottom:15px;">
                    <div style="color:#888;font-size:0.8rem;margin-bottom:5px;">CALLED NUMBER</div>
                    ${ballDisplay}
                    <div style="color:#666;font-size:0.8rem;margin-top:5px;">${calledCount} / 75 balls called</div>
                </div>
                ${gridHTML}
                ${recentHTML}
                ${!gameActive ? `<button id="bingo-start" style="margin-top:15px;padding:12px 35px;font-size:1.1rem;background:linear-gradient(135deg,#00ff88,#00d4ff);border:none;border-radius:8px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">${ballIndex > 0 ? '🔄 New Game' : '▶ Start'}</button>` : `<div style="margin-top:12px;color:#b44aff;font-size:0.9rem;">Click numbers on your card when they're called!</div>`}
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
    gameTitle.textContent = '🐱 Talking Cat';

    let happiness = 70;
    let hunger = 50;
    let energy = 80;
    let coins = 0;
    let mood = 'happy';
    let catExpression = '😺';
    let speechBubble = 'Hi! I\'m Tom the Cat! 🐱';
    let animating = false;
    let statInterval = null;
    let outfitIndex = 0;

    const outfits = ['none', '🎩', '👑', '🎀', '🕶️', '🧢', '🪖'];
    const outfitNames = ['None', 'Top Hat', 'Crown', 'Bow', 'Sunglasses', 'Cap', 'Helmet'];
    const catSayings = [
        'Meow meow! 😸', 'Pet me more! 🐾', 'I love you! ❤️', 'Got any fish? 🐟',
        'I\'m the best cat! 😼', 'Purrrrrr... 😻', 'Play with me! 🧶',
        'That tickles! 😹', 'Hehe! 🐱', 'You\'re my best friend! 💕',
        'I want treats! 🍪', 'Let\'s have fun! 🎉', 'Woooo! 🎊',
        'Nap time? 😴', '*stretches* 🐈', 'More pets please! 🥰'
    ];

    function updateMood() {
        if (happiness > 80 && hunger < 30 && energy > 50) {
            mood = 'happy'; catExpression = '😺';
        } else if (happiness > 60) {
            mood = 'content'; catExpression = '🐱';
        } else if (hunger > 70) {
            mood = 'hungry'; catExpression = '😿';
            speechBubble = 'I\'m sooo hungry! Feed me! 🍕';
        } else if (energy < 20) {
            mood = 'sleepy'; catExpression = '😴';
            speechBubble = 'So tired... need sleep... 💤';
        } else if (happiness < 30) {
            mood = 'sad'; catExpression = '😿';
            speechBubble = 'I\'m sad... pet me please! 😢';
        } else {
            mood = 'normal'; catExpression = '🐱';
        }
    }

    function clamp(v) { return Math.max(0, Math.min(100, v)); }

    function petCat() {
        if (animating) return;
        animating = true;
        happiness = clamp(happiness + 10);
        energy = clamp(energy - 3);
        coins += 1;
        catExpression = '😻';
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
        catExpression = '😸';
        speechBubble = 'Yummy! That was delicious! 🐟😋';
        render();
        setTimeout(() => { animating = false; updateMood(); render(); }, 1200);
    }

    function playCat() {
        if (animating) return;
        if (energy < 10) {
            speechBubble = 'Too tired to play... let me sleep first! 😴';
            render();
            return;
        }
        animating = true;
        happiness = clamp(happiness + 15);
        energy = clamp(energy - 15);
        hunger = clamp(hunger + 10);
        coins += 3;
        catExpression = '🙀';
        speechBubble = 'Wheeeee! So fun! 🎉🧶';
        render();
        setTimeout(() => {
            catExpression = '😸';
            speechBubble = 'That was awesome! Again! 🎊';
            render();
            setTimeout(() => { animating = false; updateMood(); render(); }, 800);
        }, 800);
    }

    function sleepCat() {
        if (animating) return;
        animating = true;
        energy = clamp(energy + 30);
        hunger = clamp(hunger + 10);
        catExpression = '😴';
        speechBubble = 'Zzzzz... 💤💤💤';
        render();
        setTimeout(() => {
            catExpression = '😺';
            speechBubble = 'Ahh! I feel great now! ⚡';
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
        catExpression = '😹';
        speechBubble = 'HAHAHA stop it!! That tickles!! 😂🤣';
        render();
        setTimeout(() => {
            catExpression = '😸';
            speechBubble = 'Hehe... do it again! 😜';
            render();
            setTimeout(() => { animating = false; updateMood(); render(); }, 600);
        }, 1000);
    }

    function changeOutfit() {
        outfitIndex = (outfitIndex + 1) % outfits.length;
        const name = outfitNames[outfitIndex];
        speechBubble = outfits[outfitIndex] === 'none' ? 'Au naturel! 🐱' : `How do I look with my ${name}? ${outfits[outfitIndex]}✨`;
        render();
    }

    function statBar(label, value, color) {
        return `
            <div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
                <span style="width:70px;font-size:0.8rem;color:#aaa;text-align:right;">${label}</span>
                <div style="flex:1;height:14px;background:#1a1a2e;border-radius:7px;overflow:hidden;border:1px solid #333;">
                    <div style="width:${value}%;height:100%;background:${color};border-radius:7px;transition:width 0.5s;${value < 25 ? 'animation:pulse 1s infinite;' : ''}"></div>
                </div>
                <span style="width:35px;font-size:0.8rem;color:${color};font-weight:bold;">${Math.round(value)}%</span>
            </div>
        `;
    }

    function render() {
        const outfit = outfits[outfitIndex];
        const outfitDisplay = outfit === 'none' ? '' : `<div style="font-size:2.5rem;position:absolute;top:-10px;left:50%;transform:translateX(-50%);">${outfit}</div>`;

        const bgColor = mood === 'happy' ? '#0a2a1a' : mood === 'sad' ? '#2a0a1a' : mood === 'hungry' ? '#2a2a0a' : mood === 'sleepy' ? '#0a0a2a' : '#1a1a2e';

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
                <div style="position:relative;display:inline-block;animation:${animating ? 'bounce 0.6s' : 'float 3s infinite'};margin:15px 0;">
                    ${outfitDisplay}
                    <div style="font-size:8rem;cursor:pointer;user-select:none;filter:drop-shadow(0 0 20px rgba(0,255,136,0.3));" onclick="window._talkingCatPet()">${catExpression}</div>
                    <div style="font-size:0.7rem;color:#666;margin-top:-5px;">tap the cat to pet!</div>
                </div>

                <!-- Stats -->
                <div style="background:${bgColor};border-radius:12px;padding:12px;margin:10px 0;border:1px solid #333;">
                    ${statBar('😊 Happy', happiness, '#00ff88')}
                    ${statBar('🍕 Hunger', 100 - hunger, hunger > 70 ? '#ff4444' : '#ffaa00')}
                    ${statBar('⚡ Energy', energy, '#00d4ff')}
                    <div style="text-align:center;margin-top:8px;color:#ffaa00;font-family:Orbitron,sans-serif;font-size:0.9rem;">🪙 ${coins} coins</div>
                </div>

                <!-- Action Buttons -->
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px;">
                    <button class="cat-btn" onclick="window._talkingCatFeed()">🐟<br><span style="font-size:0.7rem;color:#aaa;">Feed</span></button>
                    <button class="cat-btn" onclick="window._talkingCatPlay()">🧶<br><span style="font-size:0.7rem;color:#aaa;">Play</span></button>
                    <button class="cat-btn" onclick="window._talkingCatSleep()">💤<br><span style="font-size:0.7rem;color:#aaa;">Sleep</span></button>
                    <button class="cat-btn" onclick="window._talkingCatTickle()">🤣<br><span style="font-size:0.7rem;color:#aaa;">Tickle</span></button>
                    <button class="cat-btn" onclick="window._talkingCatOutfit()">👔<br><span style="font-size:0.7rem;color:#aaa;">Outfit</span></button>
                    <button class="cat-btn" onclick="window._talkingCatPet()">🐾<br><span style="font-size:0.7rem;color:#aaa;">Pet</span></button>
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
