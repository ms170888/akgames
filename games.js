/* ========================================================
   AK GAMES â€” 7 Browser Games for Maaz
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
        <div class="high-score">ðŸ† Best: ${hi}${isNew ? ' â€” NEW RECORD!' : ''}</div>
    `;
    const btn = document.createElement('button');
    btn.className = 'game-btn';
    btn.textContent = 'ðŸ”„ Play Again';
    btn.onclick = () => { overlay.remove(); onRestart(); };
    overlay.appendChild(btn);

    const menuBtn = document.createElement('button');
    menuBtn.className = 'game-btn';
    menuBtn.textContent = 'ðŸ  Menu';
    menuBtn.onclick = () => { overlay.remove(); backToMenu(); };
    overlay.appendChild(menuBtn);

    document.body.appendChild(overlay);
}


// ==================== 1. SNAKE ====================
function initSnake() {
    gameTitle.textContent = 'ðŸ Snake';
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
    startBtn.textContent = 'â–¶ Start';

    // Mobile controls
    const mobileControls = document.createElement('div');
    mobileControls.style.cssText = 'display:grid;grid-template-columns:repeat(3,60px);grid-template-rows:repeat(2,50px);gap:4px;margin-top:12px;justify-content:center;';
    const dirs = [
        ['', 'â¬†ï¸', ''],
        ['â¬…ï¸', 'â¬‡ï¸', 'âž¡ï¸']
    ];
    const dirMap = {'â¬†ï¸':'up','â¬‡ï¸':'down','â¬…ï¸':'left','âž¡ï¸':'right'};
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
        startBtn.textContent = 'â–¶ Start';
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
        if (running) { running = false; clearInterval(interval); startBtn.textContent = 'â–¶ Start'; return; }
        reset();
        running = true;
        startBtn.textContent = 'â¸ Pause';
        interval = setInterval(step, 120);
    };

    reset();
    gameCleanup = () => { running = false; clearInterval(interval); document.removeEventListener('keydown', onKey); };
}


// ==================== 2. TIC TAC TOE ====================
function initTicTacToe() {
    gameTitle.textContent = 'âŒâ­• Tic Tac Toe';

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
    restartBtn.textContent = 'ðŸ”„ New Game';

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
            status.textContent = 'ðŸŽ‰ You win!';
            wins++; localStorage.setItem('ak_ttt_wins', wins);
        } else if (result === 'O') {
            status.textContent = 'ðŸ˜¢ CPU wins!';
            losses++; localStorage.setItem('ak_ttt_losses', losses);
        } else {
            status.textContent = 'ðŸ¤ Draw!';
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
    gameTitle.textContent = 'ðŸ§  Memory Match';

    const emojis = ['ðŸš€','ðŸŽ¸','ðŸ¦Š','âš¡','ðŸŒˆ','ðŸŽ¯','ðŸ•','ðŸ’Ž'];
    let cards, flipped, matched, moves, timerStart, timerInterval, locked;

    const info = document.createElement('div');
    info.className = 'game-info';
    info.innerHTML = `<span>Moves: <b id="mem-moves">0</b></span><span>Time: <b id="mem-time">0s</b></span><span>Best: <b id="mem-high">${getHigh('memory') || 'â€”'}</b> moves</span>`;

    const grid = document.createElement('div');
    grid.className = 'memory-grid';

    const restartBtn = document.createElement('button');
    restartBtn.className = 'game-btn';
    restartBtn.textContent = 'ðŸ”„ New Game';

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
        document.getElementById('mem-high').textContent = getHigh('memory') || 'â€”';
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
                    showGameOver('ðŸŽ‰ You Win!', moves + ' moves in ' + time + 's', 'memory_dummy', reset);
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
    gameTitle.textContent = 'ðŸƒ Endless Runner';

    const canvas = document.createElement('canvas');
    canvas.className = 'game-canvas';
    canvas.width = 600; canvas.height = 250;
    const ctx = canvas.getContext('2d');

    const info = document.createElement('div');
    info.className = 'game-info';
    info.innerHTML = `<span>Score: <b id="run-score">0</b></span><span>Best: <b id="run-high">${getHigh('runner')}</b></span>`;

    const startBtn = document.createElement('button');
    startBtn.className = 'game-btn';
    startBtn.textContent = 'â–¶ Start (Space/Tap to Jump)';

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
        startBtn.textContent = 'â–¶ Start';
        const finalScore = Math.floor(score / 5);
        showGameOver('Crashed! ðŸ’¥', finalScore, 'runner', () => { reset(); });
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
        startBtn.textContent = 'ðŸƒ Running...';
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
    gameTitle.textContent = 'ðŸ§© Slide Puzzle';

    let tiles, emptyIdx, moves, solved;

    const info = document.createElement('div');
    info.className = 'game-info';
    info.innerHTML = `<span>Moves: <b id="puz-moves">0</b></span><span>Best: <b id="puz-high">${getHigh('puzzle') || 'â€”'}</b></span>`;

    const grid = document.createElement('div');
    grid.className = 'puzzle-grid';

    const shuffleBtn = document.createElement('button');
    shuffleBtn.className = 'game-btn';
    shuffleBtn.textContent = 'ðŸ”€ Shuffle';

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
            showGameOver('ðŸ§© Solved!', moves + ' moves', 'puzzle_dummy', shuffle);
        }
    }

    shuffleBtn.onclick = shuffle;
    shuffle();
    gameCleanup = () => {};
}


// ==================== 6. TARGET SHOOTER ====================
function initShooter() {
    gameTitle.textContent = 'ðŸŽ¯ Target Shooter';

    let score, timeLeft, running, spawnInterval, timerInterval;

    const info = document.createElement('div');
    info.className = 'game-info';
    info.innerHTML = `<span>Score: <b id="shoot-score">0</b></span><span>Time: <b id="shoot-time">60</b>s</span><span>Best: <b id="shoot-high">${getHigh('shooter')}</b></span>`;

    const arena = document.createElement('div');
    arena.className = 'shooter-arena';

    const startBtn = document.createElement('button');
    startBtn.className = 'game-btn';
    startBtn.textContent = 'â–¶ Start (60 seconds)';

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
        startBtn.textContent = 'ðŸ”« Shooting...';

        timerInterval = setInterval(() => {
            timeLeft--;
            document.getElementById('shoot-time').textContent = timeLeft;
            if (timeLeft <= 0) {
                running = false;
                clearInterval(timerInterval);
                clearInterval(spawnInterval);
                startBtn.textContent = 'â–¶ Start';
                showGameOver('â° Time Up!', score, 'shooter', start);
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
    gameTitle.textContent = 'ðŸ“ Pong';

    const canvas = document.createElement('canvas');
    canvas.className = 'game-canvas';
    canvas.width = 600; canvas.height = 400;
    const ctx = canvas.getContext('2d');

    const info = document.createElement('div');
    info.className = 'game-info';
    info.innerHTML = `<span>You: <b id="pong-player">0</b></span><span>CPU: <b id="pong-cpu">0</b></span><span>First to 5 wins!</span>`;

    const startBtn = document.createElement('button');
    startBtn.className = 'game-btn';
    startBtn.textContent = 'â–¶ Start';

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

        // Paddle collision â€” player (left)
        if (ball.vx < 0 && ball.x - BALL_R <= PAD_W + 15 && ball.y >= playerY && ball.y <= playerY + PAD_H) {
            ball.vx = Math.abs(ball.vx) * 1.05;
            ball.vy += (ball.y - (playerY + PAD_H / 2)) * 0.15;
            ball.x = PAD_W + 15 + BALL_R;
        }

        // Paddle collision â€” CPU (right)
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
        startBtn.textContent = 'â–¶ Start';
        const won = winner === 'Player';
        if (won) {
            const w = getHigh('pong_wins') + 1;
            localStorage.setItem('ak_pong_wins', w);
        }
        showGameOver(won ? 'ðŸŽ‰ You Win!' : 'ðŸ˜¢ CPU Wins!', playerScore + ' â€” ' + cpuScore, 'pong_dummy', () => { reset(); });
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
        startBtn.textContent = 'ðŸ“ Playing...';
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
    gameTitle.textContent = 'ðŸŽ± Bingo';

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
                    <div style="font-size:3rem;margin-bottom:10px;">ðŸŽ‰</div>
                    <div style="font-size:2rem;font-weight:bold;color:#00ff88;font-family:Orbitron,sans-serif;">BINGO!</div>
                    <div style="color:#ccc;margin:10px 0;">Wins: ${wins}${isNew ? ' â­ New Record!' : ''}</div>
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

                const display = isFree ? 'â­' : val;
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
                ${!gameActive ? `<button id="bingo-start" style="margin-top:15px;padding:12px 35px;font-size:1.1rem;background:linear-gradient(135deg,#00ff88,#00d4ff);border:none;border-radius:8px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">${ballIndex > 0 ? 'ðŸ”„ New Game' : 'â–¶ Start'}</button>` : `<div style="margin-top:12px;color:#b44aff;font-size:0.9rem;">Click numbers on your card when they're called!</div>`}
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
    gameTitle.textContent = 'ðŸ± Talking Cat';

    let happiness = 70;
    let hunger = 50;
    let energy = 80;
    let coins = 0;
    let mood = 'happy';
    let catExpression = 'ðŸ˜º';
    let speechBubble = 'Hi! I\'m Tom the Cat! ðŸ±';
    let animating = false;
    let statInterval = null;
    let outfitIndex = 0;

    const outfits = ['none', 'ðŸŽ©', 'ðŸ‘‘', 'ðŸŽ€', 'ðŸ•¶ï¸', 'ðŸ§¢', 'ðŸª–'];
    const outfitNames = ['None', 'Top Hat', 'Crown', 'Bow', 'Sunglasses', 'Cap', 'Helmet'];
    const catSayings = [
        'Meow meow! ðŸ˜¸', 'Pet me more! ðŸ¾', 'I love you! â¤ï¸', 'Got any fish? ðŸŸ',
        'I\'m the best cat! ðŸ˜¼', 'Purrrrrr... ðŸ˜»', 'Play with me! ðŸ§¶',
        'That tickles! ðŸ˜¹', 'Hehe! ðŸ±', 'You\'re my best friend! ðŸ’•',
        'I want treats! ðŸª', 'Let\'s have fun! ðŸŽ‰', 'Woooo! ðŸŽŠ',
        'Nap time? ðŸ˜´', '*stretches* ðŸˆ', 'More pets please! ðŸ¥°'
    ];

    function updateMood() {
        if (happiness > 80 && hunger < 30 && energy > 50) {
            mood = 'happy'; catExpression = 'ðŸ˜º';
        } else if (happiness > 60) {
            mood = 'content'; catExpression = 'ðŸ±';
        } else if (hunger > 70) {
            mood = 'hungry'; catExpression = 'ðŸ˜¿';
            speechBubble = 'I\'m sooo hungry! Feed me! ðŸ•';
        } else if (energy < 20) {
            mood = 'sleepy'; catExpression = 'ðŸ˜´';
            speechBubble = 'So tired... need sleep... ðŸ’¤';
        } else if (happiness < 30) {
            mood = 'sad'; catExpression = 'ðŸ˜¿';
            speechBubble = 'I\'m sad... pet me please! ðŸ˜¢';
        } else {
            mood = 'normal'; catExpression = 'ðŸ±';
        }
    }

    function clamp(v) { return Math.max(0, Math.min(100, v)); }

    function petCat() {
        if (animating) return;
        animating = true;
        happiness = clamp(happiness + 10);
        energy = clamp(energy - 3);
        coins += 1;
        catExpression = 'ðŸ˜»';
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
        catExpression = 'ðŸ˜¸';
        speechBubble = 'Yummy! That was delicious! ðŸŸðŸ˜‹';
        render();
        setTimeout(() => { animating = false; updateMood(); render(); }, 1200);
    }

    function playCat() {
        if (animating) return;
        if (energy < 10) {
            speechBubble = 'Too tired to play... let me sleep first! ðŸ˜´';
            render();
            return;
        }
        animating = true;
        happiness = clamp(happiness + 15);
        energy = clamp(energy - 15);
        hunger = clamp(hunger + 10);
        coins += 3;
        catExpression = 'ðŸ™€';
        speechBubble = 'Wheeeee! So fun! ðŸŽ‰ðŸ§¶';
        render();
        setTimeout(() => {
            catExpression = 'ðŸ˜¸';
            speechBubble = 'That was awesome! Again! ðŸŽŠ';
            render();
            setTimeout(() => { animating = false; updateMood(); render(); }, 800);
        }, 800);
    }

    function sleepCat() {
        if (animating) return;
        animating = true;
        energy = clamp(energy + 30);
        hunger = clamp(hunger + 10);
        catExpression = 'ðŸ˜´';
        speechBubble = 'Zzzzz... ðŸ’¤ðŸ’¤ðŸ’¤';
        render();
        setTimeout(() => {
            catExpression = 'ðŸ˜º';
            speechBubble = 'Ahh! I feel great now! âš¡';
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
        catExpression = 'ðŸ˜¹';
        speechBubble = 'HAHAHA stop it!! That tickles!! ðŸ˜‚ðŸ¤£';
        render();
        setTimeout(() => {
            catExpression = 'ðŸ˜¸';
            speechBubble = 'Hehe... do it again! ðŸ˜œ';
            render();
            setTimeout(() => { animating = false; updateMood(); render(); }, 600);
        }, 1000);
    }

    function changeOutfit() {
        outfitIndex = (outfitIndex + 1) % outfits.length;
        const name = outfitNames[outfitIndex];
        speechBubble = outfits[outfitIndex] === 'none' ? 'Au naturel! ðŸ±' : `How do I look with my ${name}? ${outfits[outfitIndex]}âœ¨`;
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
                    ${statBar('ðŸ˜Š Happy', happiness, '#00ff88')}
                    ${statBar('ðŸ• Hunger', 100 - hunger, hunger > 70 ? '#ff4444' : '#ffaa00')}
                    ${statBar('âš¡ Energy', energy, '#00d4ff')}
                    <div style="text-align:center;margin-top:8px;color:#ffaa00;font-family:Orbitron,sans-serif;font-size:0.9rem;">ðŸª™ ${coins} coins</div>
                </div>

                <!-- Action Buttons -->
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px;">
                    <button class="cat-btn" onclick="window._talkingCatFeed()">ðŸŸ<br><span style="font-size:0.7rem;color:#aaa;">Feed</span></button>
                    <button class="cat-btn" onclick="window._talkingCatPlay()">ðŸ§¶<br><span style="font-size:0.7rem;color:#aaa;">Play</span></button>
                    <button class="cat-btn" onclick="window._talkingCatSleep()">ðŸ’¤<br><span style="font-size:0.7rem;color:#aaa;">Sleep</span></button>
                    <button class="cat-btn" onclick="window._talkingCatTickle()">ðŸ¤£<br><span style="font-size:0.7rem;color:#aaa;">Tickle</span></button>
                    <button class="cat-btn" onclick="window._talkingCatOutfit()">ðŸ‘”<br><span style="font-size:0.7rem;color:#aaa;">Outfit</span></button>
                    <button class="cat-btn" onclick="window._talkingCatPet()">ðŸ¾<br><span style="font-size:0.7rem;color:#aaa;">Pet</span></button>
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
    gameTitle.textContent = 'ðŸ‘€ Hide & Seek';

    const characters = ['ðŸ¸','ðŸ»','ðŸ±','ðŸ¶','ðŸ°','ðŸ¦Š','ðŸ¼','ðŸ¨','ðŸ¦','ðŸ¯','ðŸ®','ðŸ·','ðŸµ','ðŸ¦„','ðŸ²','ðŸ™','ðŸ¦€','ðŸ¢','ðŸ¦‹','ðŸ'];
    const hidingSpots = ['ðŸŒ³','ðŸª¨','ðŸ ','ðŸ“¦','ðŸ—‘ï¸','ðŸš—','â›º','ðŸ”ï¸','ðŸŒ»','ðŸŽª','ðŸ§±','ðŸª£','ðŸ›–','ðŸ—ï¸','ðŸŽ','ðŸ—„ï¸','ðŸšª','ðŸª´','ðŸŽ­','ðŸº'];

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
                content = 'âŒ';
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

            gridHTML += `<div onclick="window._hideSeekCheck(${i})" style="width:${cellSize}px;height:${cellSize}px;display:flex;align-items:center;justify-content:center;font-size:${cellSize * 0.55}px;background:${bg};border:${border};border-radius:10px;cursor:${cursor};transition:all 0.2s;user-select:none;${glow}">${content}</div>`;
        }
        gridHTML += '</div>';

        const progressDots = [];
        for (let i = 0; i < toFind; i++) {
            progressDots.push(i < found ? 'ðŸŸ¢' : 'âš«');
        }

        gameArea.innerHTML = `
            <div style="text-align:center;padding:10px;">
                <div style="display:flex;justify-content:space-between;align-items:center;max-width:350px;margin:0 auto 10px;">
                    <div style="color:#b44aff;font-family:Orbitron,sans-serif;font-size:0.9rem;">Level ${level}</div>
                    <div style="color:${timer <= 10 ? '#ff4444' : '#00d4ff'};font-family:Orbitron,sans-serif;font-size:1.2rem;${timer <= 10 ? 'animation:pulse 0.5s infinite;' : ''}">â±ï¸ ${timer}s</div>
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
    gameTitle.textContent = 'ðŸŽï¸ Racing';

    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 480;
    canvas.style.cssText = 'display:block;margin:0 auto;border:2px solid #00ff88;border-radius:12px;background:#333;touch-action:none;';
    const startBtn = document.createElement('button');
    startBtn.textContent = 'â–¶ Start Race!';
    startBtn.style.cssText = 'display:block;margin:10px auto;padding:12px 30px;font-size:1.1rem;background:linear-gradient(135deg,#00ff88,#00d4ff);border:none;border-radius:8px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;';
    const info = document.createElement('div');
    info.style.cssText = 'text-align:center;color:#666;font-size:0.75rem;margin-top:8px;';
    info.textContent = 'Arrow keys or tilt phone to steer. Dodge traffic!';

    // Mobile buttons
    const mobileControls = document.createElement('div');
    mobileControls.style.cssText = 'display:flex;justify-content:center;gap:20px;margin-top:10px;';
    mobileControls.innerHTML = `
        <button id="race-left" style="padding:15px 25px;font-size:1.5rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:12px;color:#00d4ff;cursor:pointer;">â¬…</button>
        <button id="race-right" style="padding:15px 25px;font-size:1.5rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:12px;color:#00d4ff;cursor:pointer;">âž¡</button>
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

    const carColors = ['#ff4444','#4444ff','#ffaa00','#ff44ff','#44ffaa','#ff8800'];
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
        ctx.fillStyle = isPlayer ? '#005533' : '#222';
        ctx.fillRect(x - w/2 + 4, y - h/2 + (isPlayer ? 6 : h - 18), w - 8, 12);

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
        ctx.fillText('Score: ' + score, 10, 24);
        ctx.fillStyle = '#00d4ff';
        ctx.textAlign = 'right';
        ctx.fillText('Speed: ' + Math.floor(speed * 10), W - 10, 24);
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
                startBtn.textContent = 'ðŸ”„ Race Again!';
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
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            playerLane = Math.max(0, playerLane - 1);
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            playerLane = Math.min(2, playerLane + 1);
        }
    }

    // Touch controls
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, {passive: true});

    canvas.addEventListener('touchmove', (e) => {
        if (!touchStartX || !running) return;
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
        startBtn.textContent = 'ðŸŽï¸ Racing...';
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
    ctx.fillText('ðŸŽï¸ Ready to Race?', W/2, H/2);

    gameScoreDisplay.textContent = 'High: ' + getHigh('racing');

    gameCleanup = () => {
        running = false;
        cancelAnimationFrame(frameId);
        document.removeEventListener('keydown', onKey);
    };
}

// ==================== SPOT THE DIFFERENCE ====================
function initSpotDiff() {
    gameTitle.textContent = 'ðŸ” Spot the Difference';

    // Scenes are emoji grids. We generate a grid then change some emojis for the "different" version.
    const emojiSets = [
        ['ðŸŒ³','ðŸ ','ðŸŒ¸','â˜€ï¸','ðŸ¦','â›…','ðŸŒˆ','ðŸ¦‹','ðŸŒº','ðŸ„','ðŸ¿ï¸','ðŸªº','ðŸŒ»','ðŸ','ðŸª»','ðŸŒ¾'],
        ['ðŸŸ','ðŸ ','ðŸ¦€','ðŸ™','ðŸª¸','ðŸš','ðŸ¦ˆ','ðŸ³','ðŸ«§','ðŸŒŠ','âš“','ðŸ¦ž','ðŸ¡','ðŸ¦‘','ðŸ¬','ðŸª¼'],
        ['ðŸ•','ðŸ”','ðŸŒ®','ðŸ¦','ðŸŽ‚','ðŸ§','ðŸ©','ðŸª','ðŸ¥¤','ðŸ¿','ðŸŒ­','ðŸŸ','ðŸ¥¨','ðŸ§‡','ðŸ«','ðŸ¥ž'],
        ['ðŸš€','ðŸŒ™','â­','ðŸª','ðŸ‘½','ðŸ›¸','â˜„ï¸','ðŸŒŒ','ðŸ”­','ðŸ›°ï¸','ðŸŒ ','ðŸ’«','ðŸ§‘â€ðŸš€','ðŸŒ‘','ðŸŒ•','âœ¨'],
        ['ðŸŽ¸','ðŸ¥','ðŸŽ¹','ðŸŽº','ðŸŽ»','ðŸª˜','ðŸŽ¤','ðŸŽµ','ðŸŽ¶','ðŸŽ·','ðŸª—','ðŸ“¯','ðŸŽ™ï¸','ðŸ””','ðŸŽ¼','ðŸªˆ'],
        ['ðŸ€','âš½','ðŸˆ','ðŸŽ¾','ðŸ“','ðŸŽ¯','ðŸ','ðŸ¥Š','â›³','ðŸ‹ï¸','ðŸ¤¸','ðŸŠ','ðŸš´','â›·ï¸','ðŸ„','ðŸ¤¾']
    ];

    const swapEmojis = {
        'ðŸŒ³':'ðŸŒ´','ðŸ ':'ðŸ¡','ðŸŒ¸':'ðŸŒº','â˜€ï¸':'ðŸŒ™','ðŸ¦':'ðŸ¦…','â›…':'â˜ï¸','ðŸŒˆ':'ðŸŒ¤ï¸','ðŸ¦‹':'ðŸ›',
        'ðŸŸ':'ðŸ¡','ðŸ ':'ðŸ¬','ðŸ¦€':'ðŸ¦ž','ðŸ™':'ðŸ¦‘','ðŸª¸':'ðŸŒŠ','ðŸš':'ðŸª¸','ðŸ¦ˆ':'ðŸ³','ðŸ³':'ðŸ‹',
        'ðŸ•':'ðŸŒ®','ðŸ”':'ðŸŒ¯','ðŸŒ®':'ðŸ¥™','ðŸ¦':'ðŸ§','ðŸŽ‚':'ðŸ°','ðŸ§':'ðŸ¦','ðŸ©':'ðŸ¥¯','ðŸª':'ðŸ«',
        'ðŸš€':'ðŸ›¸','ðŸŒ™':'ðŸŒ•','â­':'ðŸ’«','ðŸª':'ðŸŒ','ðŸ‘½':'ðŸ¤–','ðŸ›¸':'ðŸš€','â˜„ï¸':'ðŸŒ ','ðŸŒŒ':'ðŸŒƒ',
        'ðŸŽ¸':'ðŸŽ»','ðŸ¥':'ðŸª˜','ðŸŽ¹':'ðŸª—','ðŸŽº':'ðŸ“¯','ðŸŽ»':'ðŸŽ¸','ðŸª˜':'ðŸ¥','ðŸŽ¤':'ðŸŽ™ï¸','ðŸŽµ':'ðŸŽ¶',
        'ðŸ€':'âš½','âš½':'ðŸ€','ðŸˆ':'ðŸ‰','ðŸŽ¾':'ðŸ¸','ðŸ“':'ðŸ¸','ðŸŽ¯':'ðŸ¥…','ðŸ':'ðŸ€','ðŸ¥Š':'ðŸ¤¼',
        'ðŸŒº':'ðŸŒ¸','ðŸ„':'ðŸŒ°','ðŸ¿ï¸':'ðŸ‡','ðŸªº':'ðŸ£','ðŸŒ»':'ðŸŒ¼','ðŸ':'ðŸž','ðŸª»':'ðŸ’','ðŸŒ¾':'ðŸŒ¿',
        'ðŸ«§':'ðŸ’§','ðŸŒŠ':'ðŸ«§','âš“':'ðŸª','ðŸ¦ž':'ðŸ¦','ðŸ¡':'ðŸ ','ðŸ¦‘':'ðŸ™','ðŸ¬':'ðŸŸ','ðŸª¼':'ðŸŽ',
        'ðŸ¥¤':'ðŸ§ƒ','ðŸ¿':'ðŸ¥œ','ðŸŒ­':'ðŸ¥“','ðŸŸ':'ðŸ§†','ðŸ¥¨':'ðŸ¥–','ðŸ§‡':'ðŸ¥ž','ðŸ«':'ðŸ¬','ðŸ¥ž':'ðŸ§‡'
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
            modifiedGrid[pos] = swapEmojis[orig] || 'â“';
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
                const isFound = !diffPositions.has(i) && modifiedGrid[i] !== originalGrid[i];
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

                const onclick = clickable ? `onclick="window._spotDiffCheck(${i})"` : '';
                html += `<div ${onclick} style="width:${cellSize}px;height:${cellSize}px;display:flex;align-items:center;justify-content:center;font-size:${cellSize * 0.6}px;background:${bg};border:${border};border-radius:8px;cursor:${clickable ? 'pointer' : 'default'};transition:all 0.2s;user-select:none;${glow}">${gridData[i]}</div>`;
            }
            html += '</div></div>';
            return html;
        }

        const remaining = differences - found;

        gameArea.innerHTML = `
            <div style="text-align:center;padding:10px;">
                <div style="display:flex;justify-content:space-between;align-items:center;max-width:350px;margin:0 auto 10px;">
                    <div style="color:#b44aff;font-family:Orbitron,sans-serif;font-size:0.9rem;">Level ${level}</div>
                    <div style="color:${timer <= 10 ? '#ff4444' : '#00d4ff'};font-family:Orbitron,sans-serif;font-size:1.1rem;${timer <= 10 ? 'animation:blink 0.5s infinite;' : ''}">â±ï¸ ${timer}s</div>
                    <div style="color:#00ff88;font-family:Orbitron,sans-serif;font-size:0.9rem;">Score: ${score}</div>
                </div>
                <div style="margin-bottom:10px;color:#ffaa00;font-size:0.9rem;">Find ${remaining} difference${remaining !== 1 ? 's' : ''}! Tap on the RIGHT image.</div>
                <div style="display:flex;justify-content:center;gap:15px;flex-wrap:wrap;">
                    ${buildGrid(originalGrid, false, 'âœ… Original')}
                    ${buildGrid(modifiedGrid, true, 'ðŸ” Changed')}
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
    gameTitle.textContent = 'ðŸƒ Tag';

    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 400;
    canvas.style.cssText = 'display:block;margin:0 auto;border:2px solid #00ff88;border-radius:12px;background:#1a1a2e;touch-action:none;';
    const startBtn = document.createElement('button');
    startBtn.textContent = 'â–¶ Start!';
    startBtn.style.cssText = 'display:block;margin:10px auto;padding:12px 30px;font-size:1.1rem;background:linear-gradient(135deg,#00ff88,#00d4ff);border:none;border-radius:8px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;';
    const info = document.createElement('div');
    info.style.cssText = 'text-align:center;color:#666;font-size:0.75rem;margin-top:8px;';
    info.textContent = 'Arrow keys / WASD / tap to move. Tag everyone before time runs out!';

    // Mobile D-pad
    const dpad = document.createElement('div');
    dpad.style.cssText = 'display:grid;grid-template-columns:50px 50px 50px;grid-template-rows:50px 50px 50px;justify-content:center;gap:4px;margin-top:10px;';
    dpad.innerHTML = `
        <div></div>
        <button id="tag-up" style="font-size:1.3rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:10px;color:#00d4ff;cursor:pointer;">â¬†</button>
        <div></div>
        <button id="tag-left" style="font-size:1.3rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:10px;color:#00d4ff;cursor:pointer;">â¬…</button>
        <div></div>
        <button id="tag-right" style="font-size:1.3rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:10px;color:#00d4ff;cursor:pointer;">âž¡</button>
        <div></div>
        <button id="tag-down" style="font-size:1.3rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:10px;color:#00d4ff;cursor:pointer;">â¬‡</button>
        <div></div>
    `;

    gameArea.appendChild(canvas);
    gameArea.appendChild(startBtn);
    gameArea.appendChild(dpad);
    gameArea.appendChild(info);

    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const runnerEmojis = ['ðŸ˜€','ðŸ˜Ž','ðŸ¤ª','ðŸ˜œ','ðŸ¤“','ðŸ˜‚','ðŸ¥³','ðŸ˜','ðŸ¤¡','ðŸ‘»','ðŸ‘¾','ðŸ¤–'];

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
                startBtn.textContent = 'ðŸ”„ Try Again';
                showGameOver('Time\'s Up!', score, 'tag', () => { reset(); });
            }
        }, 1000);

        running = true;
        startBtn.textContent = 'ðŸƒ Playing...';
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
        if (dx !== 0 && dy !== 0) {
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
            ctx.fillText('âœ…', r.x, r.y - r.size - 5);
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
                ctx.fillText('â—', r.x, r.y - r.size - 8);
            }
        }

        // Draw player (YOU)
        ctx.font = `${player.size * 2}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ðŸ«µ', player.x, player.y);

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
        ctx.fillText('Lvl ' + level, 8, 9);
        ctx.fillStyle = timer <= 5 ? '#ff4444' : '#00d4ff';
        ctx.textAlign = 'center';
        ctx.fillText('â± ' + timer + 's', W / 2, 9);
        ctx.fillStyle = '#00ff88';
        ctx.textAlign = 'right';
        ctx.fillText(tagged + '/' + runners.length + ' tagged', W - 8, 9);

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
    ctx.fillText('ðŸƒ Ready to Tag?', W / 2, H / 2);

    gameScoreDisplay.textContent = 'High: ' + getHigh('tag');

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
    gameTitle.textContent = 'ðŸ”º Geometry Dash';

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    canvas.style.cssText = 'display:block;margin:0 auto;border:2px solid #b44aff;border-radius:12px;background:#0a0a1a;touch-action:none;cursor:pointer;';
    const startBtn = document.createElement('button');
    startBtn.textContent = 'â–¶ Start!';
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
    const bgColors = ['#0a0a2e','#1a0a2e','#2e0a1a','#0a1a2e','#0a2e1a','#2e1a0a'];
    const playerColors = ['#00ff88','#00d4ff','#ff44aa','#ffaa00','#b44aff','#ff4444'];
    const obstacleColors = ['#ff4444','#ff44aa','#b44aff','#00d4ff','#00ff88','#ffaa00'];

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
        const lastObs = obstacles.length > 0 ? obstacles[obstacles.length - 1] : null;
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
                    startBtn.textContent = 'ðŸ”„ Retry (Attempt ' + attempts + ')';
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
        ctx.fillText('Score: ' + score, 8, 7);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#888';
        ctx.fillText('Attempt ' + attempts, W / 2, 7);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffaa00';
        ctx.fillText('Best: ' + getHigh('geodash'), W - 8, 7);

        if (dead) {
            ctx.fillStyle = 'rgba(255,0,0,0.3)';
            ctx.fillRect(0, 0, W, H);
        }
    }

    function onKey(e) {
        if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w') {
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
        startBtn.textContent = 'ðŸ”º Running...';
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
    ctx.fillText('ðŸ”º Geometry Dash', W / 2, H / 2 - 30);
    ctx.font = '12px Rajdhani, sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText('Tap or press SPACE to jump!', W / 2, H / 2);

    gameScoreDisplay.textContent = 'High: ' + getHigh('geodash');

    gameCleanup = () => {
        running = false;
        cancelAnimationFrame(frameId);
        document.removeEventListener('keydown', onKey);
    };
}

// ==================== KING SHOT ====================
function initKingShot() {
    gameTitle.textContent = 'ðŸ‘‘ King Shot';

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
                targets.push({ x: baseX + c * 50 + blockW / 2, y: groundY - blockH - 15, r: 12, hit: false, emoji: 'ðŸ˜ˆ' });
            }
        } else if (lvl <= 4) {
            // Two rows
            for (let c = 0; c < 2; c++) {
                blocks.push({ x: baseX + c * 60, y: groundY - blockH, w: blockW, h: blockH, vy: 0, vx: 0, fallen: false });
                // Plank on top
            }
            blocks.push({ x: baseX - 5, y: groundY - blockH - 10, w: 80, h: 10, vy: 0, vx: 0, fallen: false });
            targets.push({ x: baseX + 30, y: groundY - blockH - 35, r: 12, hit: false, emoji: 'ðŸ‘‘' });
            targets.push({ x: baseX - 10, y: groundY - 15, r: 10, hit: false, emoji: 'ðŸ˜ˆ' });
            targets.push({ x: baseX + 70, y: groundY - 15, r: 10, hit: false, emoji: 'ðŸ˜ˆ' });
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
                    emoji: c === 1 ? 'ðŸ‘‘' : 'ðŸ˜ˆ'
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
                    // Hit block â€” knock it
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
                            life: 25, color: t.emoji === 'ðŸ‘‘' ? '#ffaa00' : '#ff4444'
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
        } else if (!activeBall && shotsLeft <= 0 && !allHit) {
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
            ctx.fillStyle = power > 100 ? '#ff4444' : power > 60 ? '#ffaa00' : '#00ff88';
            ctx.font = '11px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Power: ' + Math.round(power), cannonX + 20, cannonY - 45);
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
        ctx.fillText('Level ' + level, 8, 8);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffaa00';
        ctx.fillText('ðŸ”µ'.repeat(shotsLeft), W / 2, 6);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#00ff88';
        ctx.fillText('Score: ' + score, W - 8, 8);
    }

    // Input handling
    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
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
        if (!dragStart || !dragEnd) return;

        const dx = dragStart.x - dragEnd.x;
        const dy = dragStart.y - dragEnd.y;
        const power = Math.min(Math.sqrt(dx * dx + dy * dy), 150);

        if (power > 10) {
            const angle = Math.atan2(dy, dx);
            const vx = Math.cos(angle) * power * 0.08;
            const vy = Math.sin(angle) * power * 0.08;
            shoot(vx, vy);
            if (!frameId || !running) {
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

    gameScoreDisplay.textContent = 'High: ' + getHigh('kingshot');

    resetGame();
    running = false; // wait for first shot to start physics

    // Draw initial
    draw();
    ctx.font = 'bold 16px Orbitron, sans-serif';
    ctx.fillStyle = '#ffaa00';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ðŸ‘‘ Drag to Aim & Shoot!', W / 2, H / 2 - 40);

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
    gameTitle.textContent = 'â›ï¸ MiniCraft';

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
            <button id="mc-up" style="font-size:1.2rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:8px;color:#00d4ff;cursor:pointer;">â¬†</button>
            <div></div>
            <button id="mc-left" style="font-size:1.2rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:8px;color:#00d4ff;cursor:pointer;">â¬…</button>
            <button id="mc-down" style="font-size:1.2rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:8px;color:#00d4ff;cursor:pointer;">â¬‡</button>
            <button id="mc-right" style="font-size:1.2rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:8px;color:#00d4ff;cursor:pointer;">âž¡</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px;margin-left:20px;">
            <button id="mc-mine" style="padding:8px 16px;font-size:0.9rem;background:#1a1a2e;border:2px solid #ff4444;border-radius:8px;color:#ff4444;cursor:pointer;">â› Mine</button>
            <button id="mc-place" style="padding:8px 16px;font-size:0.9rem;background:#1a1a2e;border:2px solid #00ff88;border-radius:8px;color:#00ff88;cursor:pointer;">ðŸ§± Place</button>
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
        1: { name: 'Dirt', color: '#8B5E3C', dark: '#6B4226', detail: '#7A5230' },
        2: { name: 'Grass', color: '#4CAF50', dark: '#388E3C', top: '#66BB6A' },
        3: { name: 'Stone', color: '#9E9E9E', dark: '#757575', detail: '#BDBDBD' },
        4: { name: 'Wood', color: '#A1887F', dark: '#795548', detail: '#8D6E63' },
        5: { name: 'Leaves', color: '#2E7D32', dark: '#1B5E20', detail: '#43A047' },
        6: { name: 'Water', color: '#1565C0', dark: '#0D47A1', detail: '#1976D2' },
        7: { name: 'Sand', color: '#FDD835', dark: '#F9A825', detail: '#FFEE58' },
        8: { name: 'Coal', color: '#424242', dark: '#212121', detail: '#616161' },
        9: { name: 'Gold', color: '#FFD700', dark: '#FFA000', detail: '#FFE082' },
        10: { name: 'Diamond', color: '#4DD0E1', dark: '#00ACC1', detail: '#80DEEA' },
        11: { name: 'Bedrock', color: '#333', dark: '#111', detail: '#444' }
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
            if (Math.random() < 0.15 && world[groundLevel - 1] !== undefined) {
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
            if (world[y][mid] !== 0 && y > 0 && world[y - 1][mid] === 0) {
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
            btn.style.cssText = `width:36px;height:36px;background:${b.color};border:${selectedBlock === id ? '3px solid #00ff88' : '2px solid #555'};border-radius:6px;cursor:pointer;font-size:0.6rem;color:#fff;font-family:Rajdhani,sans-serif;${selectedBlock === id ? 'box-shadow:0 0 10px #00ff88;' : ''}`;
            btn.textContent = b.name.slice(0, 4);
            btn.title = b.name + ' (' + (i + 1) + ')';
            btn.onclick = () => { selectedBlock = id; buildSelector(); };
            selector.appendChild(btn);
        });
        // Inventory display
        const invDiv = document.createElement('div');
        invDiv.style.cssText = 'width:100%;text-align:center;margin-top:4px;font-size:0.7rem;color:#aaa;font-family:Rajdhani,sans-serif;';
        let invText = '';
        for (const [id, count] of Object.entries(inventory)) {
            if (count > 0) invText += `${BLOCKS[id].name}: ${count}  `;
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
        const cx = facing === 'left' ? playerPos.x - 1 : playerPos.x + 1;
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
        if (world[ny][nx] !== 0 && world[ny][nx] !== 6) return; // can walk through water

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
        const tx = facing === 'left' ? playerPos.x - 1 : playerPos.x + 1;
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
        const tx = facing === 'left' ? playerPos.x - 1 : playerPos.x + 1;
        const ty = playerPos.y;

        if (tx < 0 || tx >= COLS || ty < 0 || ty >= ROWS) return;
        if (world[ty][tx] !== 0) return; // spot taken

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
            if (world[my][mx] !== 0 && world[my][mx] !== 11) {
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
    gameTitle.textContent = 'ðŸŒ² 99 Nights';

    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 360;
    canvas.style.cssText = 'display:block;margin:0 auto;border:2px solid #1B5E20;border-radius:12px;background:#0a0a0a;touch-action:none;';

    const startBtn = document.createElement('button');
    startBtn.textContent = 'â–¶ Enter the Forest';
    startBtn.style.cssText = 'display:block;margin:10px auto;padding:12px 30px;font-size:1.1rem;background:linear-gradient(135deg,#1B5E20,#004D40);border:none;border-radius:8px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;color:#A5D6A7;';

    const dpad = document.createElement('div');
    dpad.style.cssText = 'display:grid;grid-template-columns:45px 45px 45px;grid-template-rows:45px 45px;gap:3px;justify-content:center;margin-top:8px;';
    dpad.innerHTML = `
        <div></div>
        <button id="f99-up" style="font-size:1.2rem;background:#0a1a0a;border:2px solid #2E7D32;border-radius:8px;color:#4CAF50;cursor:pointer;">â¬†</button>
        <div></div>
        <button id="f99-left" style="font-size:1.2rem;background:#0a1a0a;border:2px solid #2E7D32;border-radius:8px;color:#4CAF50;cursor:pointer;">â¬…</button>
        <button id="f99-action" style="font-size:0.8rem;background:#0a1a0a;border:2px solid #FF6F00;border-radius:8px;color:#FFA726;cursor:pointer;">ðŸ”¦</button>
        <button id="f99-right" style="font-size:1.2rem;background:#0a1a0a;border:2px solid #2E7D32;border-radius:8px;color:#4CAF50;cursor:pointer;">âž¡</button>
        <div></div>
        <button id="f99-down" style="font-size:1.2rem;background:#0a1a0a;border:2px solid #2E7D32;border-radius:8px;color:#4CAF50;cursor:pointer;">â¬‡</button>
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
            if (world[y][x] === 0) world[y][x] = Math.random() < 0.7 ? TREE : (Math.random() < 0.5 ? BUSH : ROCK);
        }

        // Place items
        items = [];
        const numItems = 2 + Math.floor(night / 3);
        for (let i = 0; i < numItems; i++) {
            let x, y;
            do { x = 1 + Math.floor(Math.random() * (COLS - 2)); y = 1 + Math.floor(Math.random() * (ROWS - 2)); }
            while (world[y][x] !== 0);
            const type = Math.random() < 0.4 ? ITEM_KEY : (Math.random() < 0.5 ? ITEM_BATTERY : ITEM_MEDKIT);
            items.push({x, y, type, collected: false});
        }
        totalItems = items.filter(i => i.type === ITEM_KEY).length;

        // Place exit
        let ex, ey;
        do { ex = 1 + Math.floor(Math.random() * (COLS - 2)); ey = 1 + Math.floor(Math.random() * (ROWS - 2)); }
        while (world[ey][ex] !== 0);
        world[ey][ex] = EXIT;

        // Player spawn
        do {
            player.x = 1 + Math.floor(Math.random() * (COLS - 2));
            player.y = 1 + Math.floor(Math.random() * (ROWS - 2));
        } while (world[player.y][player.x] !== 0);

        // Ghosts
        ghosts = [];
        const numGhosts = Math.min(2 + Math.floor(night / 2), 8);
        for (let i = 0; i < numGhosts; i++) {
            let gx, gy;
            do { gx = 1 + Math.floor(Math.random() * (COLS - 2)); gy = 1 + Math.floor(Math.random() * (ROWS - 2)); }
            while (world[gy][gx] !== 0 || (Math.abs(gx - player.x) < 4 && Math.abs(gy - player.y) < 4));
            ghosts.push({x: gx, y: gy, moveTimer: 0, emoji: ['ðŸ‘»','ðŸ’€','ðŸ§Ÿ','ðŸ˜ˆ','ðŸ‘¹','ðŸ¦‡','ðŸ•·ï¸','ðŸŽƒ'][i % 8]});
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
                showMsg('â˜€ï¸ Night ' + (night - 1) + ' survived! Entering night ' + night + '...');
                generateForest();
                return;
            } else {
                showMsg('ðŸ”‘ Need ' + (keysNeeded - keysHave) + ' more key(s)!');
                return;
            }
        }

        player.x = nx;
        player.y = ny;

        // Check item pickup
        for (const item of items) {
            if (!item.collected && item.x === nx && item.y === ny) {
                item.collected = true;
                if (item.type === ITEM_KEY) { collected++; showMsg('ðŸ”‘ Got a key! (' + collected + '/' + totalItems + ')'); }
                if (item.type === ITEM_BATTERY) { flashlight = Math.min(100, flashlight + 30); showMsg('ðŸ”‹ Flashlight recharged!'); }
                if (item.type === ITEM_MEDKIT) { health = Math.min(100, health + 25); showMsg('ðŸ’Š Health restored!'); }
            }
        }

        // Check ghost collision
        for (const g of ghosts) {
            if (g.x === nx && g.y === ny) {
                health -= 20;
                showMsg('ðŸ‘» A ghost got you! -20 HP');
                // Push ghost away
                g.x = Math.max(1, Math.min(COLS - 2, g.x + (Math.random() < 0.5 ? 3 : -3)));
                g.y = Math.max(1, Math.min(ROWS - 2, g.y + (Math.random() < 0.5 ? 3 : -3)));
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
                dx = distX > 0 ? -1 : 1;
                dy = distY > 0 ? -1 : 1;
            } else if (dist < 8) {
                if (Math.random() < 0.6) {
                    dx = distX > 0 ? 1 : (distX < 0 ? -1 : 0);
                    dy = distY > 0 ? 1 : (distY < 0 ? -1 : 0);
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
            if (nx > 0 && nx < COLS - 1 && ny > 0 && ny < ROWS - 1 && world[ny][nx] !== TREE && world[ny][nx] !== ROCK) {
                g.x = nx;
                g.y = ny;
            }

            // Ghost hits player
            if (g.x === player.x && g.y === player.y) {
                health -= 15;
                showMsg(g.emoji + ' attacked you! -15 HP');
                g.x = Math.max(1, Math.min(COLS - 2, g.x + (Math.random() < 0.5 ? 3 : -3)));
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

        const viewDist = flashlightOn ? 6 : 3;

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
                    ctx.fillText('ðŸŒ²', px + TILE / 2, py + TILE / 2);
                } else if (tile === BUSH) {
                    ctx.font = `${TILE - 6}px serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('ðŸŒ¿', px + TILE / 2, py + TILE / 2);
                } else if (tile === ROCK) {
                    ctx.font = `${TILE - 4}px serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('ðŸª¨', px + TILE / 2, py + TILE / 2);
                } else if (tile === EXIT) {
                    ctx.font = `${TILE - 4}px serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('ðŸšª', px + TILE / 2, py + TILE / 2);
                }
            }
        }

        // Items
        for (const item of items) {
            if (item.collected) continue;
            const dist = Math.sqrt((item.x - player.x) ** 2 + (item.y - player.y) ** 2);
            if (dist > viewDist + 1) continue;
            ctx.globalAlpha = Math.max(0, 1 - dist / (viewDist + 1));
            const emoji = item.type === ITEM_KEY ? 'ðŸ”‘' : (item.type === ITEM_BATTERY ? 'ðŸ”‹' : 'ðŸ’Š');
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
        ctx.fillText('ðŸ§‘', player.x * TILE + TILE / 2, player.y * TILE + TILE / 2);

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
        ctx.fillText('Night ' + night, 6, 7);

        // Health bar
        ctx.fillStyle = '#333';
        ctx.fillRect(90, 8, 60, 12);
        ctx.fillStyle = health > 50 ? '#4CAF50' : (health > 25 ? '#FF9800' : '#f44336');
        ctx.fillRect(90, 8, 60 * (health / 100), 12);
        ctx.strokeStyle = '#555';
        ctx.strokeRect(90, 8, 60, 12);
        ctx.fillStyle = '#fff';
        ctx.font = '9px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('â¤ï¸' + health, 120, 9);

        // Flashlight bar
        ctx.fillStyle = '#333';
        ctx.fillRect(165, 8, 50, 12);
        ctx.fillStyle = flashlight > 30 ? '#FFC107' : '#FF5722';
        ctx.fillRect(165, 8, 50 * (flashlight / 100), 12);
        ctx.strokeStyle = '#555';
        ctx.strokeRect(165, 8, 50, 12);
        ctx.fillStyle = '#fff';
        ctx.font = '9px Orbitron';
        ctx.fillText('ðŸ”¦' + Math.round(flashlight), 190, 9);

        // Keys
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 11px Orbitron';
        ctx.fillText('ðŸ”‘' + collected + '/' + totalItems, W - 6, 7);

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
                showMsg('ðŸ”¦ Flashlight died!');
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
        showMsg('ðŸŒ™ Night 1... Find the keys and reach the door!');
        frameId = requestAnimationFrame(gameLoop);
    }

    function onKey(e) {
        switch (e.key) {
            case 'ArrowUp': case 'w': case 'W': movePlayer(0, -1); break;
            case 'ArrowDown': case 's': case 'S': movePlayer(0, 1); break;
            case 'ArrowLeft': case 'a': case 'A': movePlayer(-1, 0); break;
            case 'ArrowRight': case 'd': case 'D': movePlayer(1, 0); break;
            case 'f': case 'F':
                if (flashlight > 0) { flashlightOn = !flashlightOn; showMsg(flashlightOn ? 'ðŸ”¦ Light ON' : 'ðŸ”¦ Light OFF'); }
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
        if (flashlight > 0) { flashlightOn = !flashlightOn; showMsg(flashlightOn ? 'ðŸ”¦ Light ON' : 'ðŸ”¦ Light OFF'); }
    });

    startBtn.onclick = () => {
        resetGame();
        startBtn.style.display = 'none';
    };

    gameScoreDisplay.textContent = 'Best: Night ' + getHigh('forest99');

    // Initial draw
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, W, H);
    ctx.font = 'bold 16px Orbitron, sans-serif';
    ctx.fillStyle = '#2E7D32';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ðŸŒ² 99 Nights ðŸŒ²', W / 2, H / 2 - 30);
    ctx.font = '11px Rajdhani, sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('Survive the haunted forest...', W / 2, H / 2);
    ctx.fillText('Find keys ðŸ”‘ Avoid ghosts ðŸ‘» Reach the exit ðŸšª', W / 2, H / 2 + 20);

    gameCleanup = () => {
        running = false;
        cancelAnimationFrame(frameId);
        document.removeEventListener('keydown', onKey);
    };
}

// ==================== BROOKHAVEN ====================
function initBrookhaven() {
    gameTitle.textContent = 'ðŸ˜ï¸ Brookhaven';

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
        <button id="bh-up" style="font-size:1.1rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:8px;color:#00d4ff;cursor:pointer;">â¬†</button>
        <div></div>
        <button id="bh-left" style="font-size:1.1rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:8px;color:#00d4ff;cursor:pointer;">â¬…</button>
        <button id="bh-action" style="font-size:0.7rem;background:#1a1a2e;border:2px solid #ffaa00;border-radius:8px;color:#ffaa00;cursor:pointer;">Enter</button>
        <button id="bh-right" style="font-size:1.1rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:8px;color:#00d4ff;cursor:pointer;">âž¡</button>
        <div></div>
        <button id="bh-down" style="font-size:1.1rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:8px;color:#00d4ff;cursor:pointer;">â¬‡</button>
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
            [7,10,17,20].forEach(r => { if (map[r][x] !== ROAD) map[r][x] = SIDE; });
        }
        for (let y = 0; y < MAP_H; y++) {
            [11,14,25,28].forEach(c => { if (map[y][c] !== ROAD && map[y][c] !== SIDE) map[y][c] = SIDE; });
        }

        function placeB(x,y,type,style) {
            for (let dy=0;dy<2;dy++) for (let dx=0;dx<3;dx++) if(y+dy<MAP_H&&x+dx<MAP_W) map[y+dy][x+dx]=type;
            const names = {[BH1]:'House',[BH2]:'House',[BH3]:'House',[BSHOP]:'Shop',[BPOLICE]:'Police Station',[BHOSPITAL]:'Hospital',[BSCHOOL]:'School'};
            buildings.push({x,y,w:3,h:2,type,style,name:(names[type]||'Building')});
        }

        placeB(2,2,BH1,'blue'); placeB(6,2,BH2,'red'); placeB(2,5,BH3,'yellow'); placeB(6,5,BH1,'green');
        placeB(15,2,BSHOP,'shop'); placeB(19,2,BSHOP,'shop'); placeB(15,5,BPOLICE,'police'); placeB(19,5,BHOSPITAL,'hospital');
        placeB(2,12,BSCHOOL,'school'); placeB(6,12,BSCHOOL,'school');
        placeB(29,2,BH1,'purple'); placeB(33,2,BH2,'orange'); placeB(29,12,BH3,'pink'); placeB(33,12,BH1,'cyan');
        placeB(29,22,BH2,'white'); placeB(33,22,BH3,'lime');

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
        {emoji:'ðŸ‘©',name:'Sarah',x:4,y:7,sayings:['Hi! Welcome to Brookhaven!','Nice weather!','Visit the park!'],moveTimer:0},
        {emoji:'ðŸ‘®',name:'Officer Dan',x:16,y:7,sayings:['Stay safe, citizen!','No running!','Peaceful day.'],moveTimer:0},
        {emoji:'ðŸ§‘â€âš•ï¸',name:'Dr. Kim',x:20,y:7,sayings:['Stay healthy!','Drink water!','An apple a day!'],moveTimer:0},
        {emoji:'ðŸ‘¨â€ðŸ«',name:'Mr. Lee',x:3,y:14,sayings:['School at 8 AM!','Homework done?','Reading is fun!'],moveTimer:0},
        {emoji:'ðŸ§‘â€ðŸ³',name:'Chef Marco',x:16,y:4,sayings:['Special: pizza! ðŸ•','Want a cookie? ðŸª','Come eat!'],moveTimer:0},
        {emoji:'ðŸ‘§',name:'Emma',x:30,y:7,sayings:['Wanna play? ðŸ˜Š','I love this town!','Be friends!'],moveTimer:0},
        {emoji:'ðŸ‘´',name:'Grandpa Joe',x:6,y:24,sayings:['Lake is beautiful...','All fields once.','Catch fish?'],moveTimer:0},
        {emoji:'ðŸ•',name:'Buddy',x:18,y:25,sayings:['Woof! ðŸ¾','*wags tail*','Woof woof! ðŸ¦´'],moveTimer:0},
    ];

    let player, money, currentLocation, msgText, msgTimer, timeOfDay, dayTimer, bhInventory;

    function resetGame() {
        buildTown();
        player={x:10,y:10,emoji:'ðŸ§‘'}; money=100; currentLocation='Outside';
        msgText=''; msgTimer=0; timeOfDay=0; dayTimer=0;
        bhInventory=['ðŸ”‘ House Key'];
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
            if(b) showMsg('ðŸ  '+b.name+' â€” Press E to enter!');
            return;
        }
        player.x=nx; player.y=ny;
        currentLocation=tile===ROAD?'Road':(tile===SIDE?'Sidewalk':'Outside');
        for(const npc of npcs){
            if(Math.abs(npc.x-player.x)<=1&&Math.abs(npc.y-player.y)<=1)
                showMsg(npc.emoji+' '+npc.name+': "'+npc.sayings[Math.floor(Math.random()*npc.sayings.length)]+'"');
        }
        draw();
    }

    function interact(){
        for(const b of buildings){
            if(Math.abs(player.x-(b.x+1))+Math.abs(player.y-(b.y+2))<=2){enterBuilding(b);return;}
        }
        for(const npc of npcs){
            if(Math.abs(npc.x-player.x)<=1&&Math.abs(npc.y-player.y)<=1){
                showMsg(npc.emoji+' '+npc.name+': "'+npc.sayings[Math.floor(Math.random()*npc.sayings.length)]+'"');return;
            }
        }
        if(map[player.y][player.x]===BCAR){showMsg('ðŸš— Vroom vroom! ðŸ“¯');return;}
        showMsg('Nothing here.');
    }

    function enterBuilding(b){
        if(b.type===BSHOP){
            if(money>=10){money-=10;const items=['ðŸ• Pizza','ðŸ¦ Ice Cream','ðŸ§¸ Teddy Bear','ðŸ“± Toy Phone','ðŸŽ® Gameboy','ðŸ‘Ÿ Sneakers'];
                const item=items[Math.floor(Math.random()*items.length)];bhInventory.push(item);
                showMsg('ðŸ›’ Bought '+item+' for $10! ($'+money+' left)',150);
            }else showMsg('ðŸ’¸ Not enough! You have $'+money);
        }else if(b.type===BPOLICE){money+=20;showMsg('ðŸ‘® "Thanks for visiting! Here\'s $20!" ðŸ’°');}
        else if(b.type===BHOSPITAL){showMsg('ðŸ¥ "Have a lollipop! ðŸ­"');bhInventory.push('ðŸ­ Lollipop');}
        else if(b.type===BSCHOOL){
            const facts=['The sun is a star! â­','Octopuses have 3 hearts! ðŸ™','Honey never spoils! ðŸ¯','Bananas are berries! ðŸŒ','Lightning is 5x hotter than the sun! âš¡'];
            showMsg('ðŸ“š Learned: '+facts[Math.floor(Math.random()*facts.length)],150);
        }else showMsg('ðŸ  Visited '+b.name+'! Cozy inside. ðŸ›‹ï¸');
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
        const timeNames=['ðŸŒ… Morning','â˜€ï¸ Afternoon','ðŸŒ‡ Evening','ðŸŒ™ Night'];
        const skyColors=['#87CEEB','#64B5F6','#FF8A65','#1a1a3e'];
        ctx.fillStyle=skyColors[timeOfDay]; ctx.fillRect(0,0,W,HH);

        for(let vy=0;vy<VIEW_H;vy++) for(let vx=0;vx<VIEW_W;vx++){
            const mx=camX+vx,my=camY+vy; if(mx>=MAP_W||my>=MAP_H) continue;
            const px=vx*TILE,py=vy*TILE,tile=map[my][mx];
            const tColors={[GRASS]:'#4CAF50',[ROAD]:'#616161',[SIDE]:'#9E9E9E',[WATER]:'#1565C0',[TTREE]:'#4CAF50',[BFLOWER]:'#4CAF50',[BENCH]:'#795548',[BCAR]:'#616161'};
            ctx.fillStyle=tColors[tile]||'#4CAF50';
            if(tile>=10&&tile<=16){const b=buildings.find(b=>mx>=b.x&&mx<b.x+b.w&&my>=b.y&&my<b.y+b.h);ctx.fillStyle=b?(bldColors[b.style]||'#888'):'#888';}
            ctx.fillRect(px,py,TILE,TILE);

            if(tile===TTREE){ctx.fillStyle='#1B5E20';ctx.beginPath();ctx.moveTo(px+TILE/2,py+2);ctx.lineTo(px+2,py+TILE-2);ctx.lineTo(px+TILE-2,py+TILE-2);ctx.fill();ctx.fillStyle='#5D4037';ctx.fillRect(px+TILE/2-2,py+TILE-5,4,5);}
            else if(tile===BFLOWER){ctx.fillStyle=['#E91E63','#FF9800','#9C27B0','#FFEB3B'][(mx+my*7)%4];ctx.beginPath();ctx.arc(px+TILE/2,py+TILE/2,4,0,Math.PI*2);ctx.fill();}
            else if(tile===WATER){ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fillRect(px+2,py+TILE/2,TILE-4,2);}
            else if(tile===ROAD){ctx.fillStyle='#FFD54F';if(my===8||my===18) ctx.fillRect(px+TILE/2-1,py,2,TILE);if(mx===12||mx===26) ctx.fillRect(px,py+TILE/2-1,TILE,2);}
            else if(tile===BCAR){ctx.fillStyle='#F44336';ctx.fillRect(px+2,py+4,TILE-4,TILE-8);ctx.fillStyle='#90CAF9';ctx.fillRect(px+4,py+5,TILE-8,5);}
            else if(tile>=10&&tile<=16){ctx.fillStyle=timeOfDay===3?'#FFEB3B':'#90CAF9';ctx.fillRect(px+5,py+6,5,5);ctx.fillRect(px+TILE-10,py+6,5,5);
                const b=buildings.find(b=>mx===b.x+1&&my===b.y+1);if(b){ctx.fillStyle='#5D4037';ctx.fillRect(px+TILE/2-3,py+TILE-8,6,8);}}
        }

        for(const npc of npcs){const sx=(npc.x-camX)*TILE,sy=(npc.y-camY)*TILE;if(sx<-TILE||sx>W||sy<-TILE||sy>HH) continue;ctx.font=`${TILE-2}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(npc.emoji,sx+TILE/2,sy+TILE/2);}
        const ppx=(player.x-camX)*TILE,ppy=(player.y-camY)*TILE;
        ctx.font=`${TILE}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(player.emoji,ppx+TILE/2,ppy+TILE/2);

        if(timeOfDay===3){ctx.fillStyle='rgba(0,0,20,0.4)';ctx.fillRect(0,0,W,HH);}
        else if(timeOfDay===2){ctx.fillStyle='rgba(255,100,0,0.1)';ctx.fillRect(0,0,W,HH);}

        ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,W,22);
        ctx.font='bold 10px Orbitron, sans-serif';ctx.textBaseline='top';
        ctx.textAlign='left';ctx.fillStyle='#4CAF50';ctx.fillText(timeNames[timeOfDay],4,5);
        ctx.textAlign='center';ctx.fillStyle='#ffaa00';ctx.fillText('ðŸ’°$'+money,W/2,5);
        ctx.textAlign='right';ctx.fillStyle='#00d4ff';ctx.fillText('ðŸŽ’'+bhInventory.length,W-4,5);

        if(msgTimer>0){msgTimer--;ctx.globalAlpha=Math.min(1,msgTimer/30);ctx.fillStyle='rgba(0,0,0,0.85)';ctx.fillRect(10,HH-45,W-20,32);ctx.fillStyle='#fff';ctx.font='11px Rajdhani, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(msgText,W/2,HH-29);ctx.globalAlpha=1;}

        const st=document.getElementById('bh-status');
        if(st) st.textContent='ðŸ“ '+currentLocation+' | ðŸŽ’ '+bhInventory.join(', ');
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

    resetGame();showMsg('ðŸ˜ï¸ Welcome to Brookhaven! Explore the town!',150);
    frameId=requestAnimationFrame(gameLoop);
    gameScoreDisplay.textContent='';

    gameCleanup=()=>{cancelAnimationFrame(frameId);document.removeEventListener('keydown',onKey);};
}

// ==================== GORILLA TAG ====================
function initGorillaTag() {
    gameTitle.textContent = 'ðŸ¦ Gorilla Tag';

    const canvas = document.createElement('canvas');
    canvas.width = 380;
    canvas.height = 380;
    canvas.style.cssText = 'display:block;margin:0 auto;border:2px solid #4CAF50;border-radius:12px;background:#1a2e1a;touch-action:none;';

    const startBtn = document.createElement('button');
    startBtn.textContent = 'â–¶ Start!';
    startBtn.style.cssText = 'display:block;margin:10px auto;padding:12px 30px;font-size:1.1rem;background:linear-gradient(135deg,#4CAF50,#8BC34A);border:none;border-radius:8px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;color:#fff;';

    const dpad = document.createElement('div');
    dpad.style.cssText = 'display:grid;grid-template-columns:45px 45px 45px;grid-template-rows:45px 45px;gap:3px;justify-content:center;margin-top:8px;';
    dpad.innerHTML = `
        <div></div>
        <button id="gt-up" style="font-size:1.2rem;background:#1a2e1a;border:2px solid #4CAF50;border-radius:8px;color:#4CAF50;cursor:pointer;">â¬†</button>
        <div></div>
        <button id="gt-left" style="font-size:1.2rem;background:#1a2e1a;border:2px solid #4CAF50;border-radius:8px;color:#4CAF50;cursor:pointer;">â¬…</button>
        <button id="gt-jump" style="font-size:0.8rem;background:#1a2e1a;border:2px solid #FF9800;border-radius:8px;color:#FF9800;cursor:pointer;">Jump</button>
        <button id="gt-right" style="font-size:1.2rem;background:#1a2e1a;border:2px solid #4CAF50;border-radius:8px;color:#4CAF50;cursor:pointer;">âž¡</button>
        <div></div>
        <button id="gt-down" style="font-size:1.2rem;background:#1a2e1a;border:2px solid #4CAF50;border-radius:8px;color:#4CAF50;cursor:pointer;">â¬‡</button>
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
    let isIT = true; // player is "it" first
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
        const colors = ['#FF5722','#E91E63','#9C27B0','#3F51B5','#00BCD4','#FFEB3B','#FF9800','#795548'];
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

        startBtn.textContent = isIT ? 'ðŸ¦ You\'re IT! Tag them!' : 'ðŸƒ RUN! Don\'t get tagged!';
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
                    g.vx = dx > 0 ? -3 : 3;
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
                    g.vx = dx > 0 ? 2.5 : -2.5;
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

            g.climbIntent = isIT ? (dist<100) : true;
            resolveCollisions(g);

            // Tag check
            if (Math.abs(player.x-g.x)<(player.w+g.w)/2+5 && Math.abs(player.y-g.y)<(player.h+g.h)/2+5) {
                if (isIT && !g.tagged) {
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
        grad.addColorStop(0,'#1a3a1a');
        grad.addColorStop(1,'#0a1a0a');
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
            ctx.fillStyle = g.tagged ? '#666' : '#fff';
            ctx.fillRect(g.x+7, g.y+13, g.w-14, 3);
            // Arms
            ctx.fillStyle = g.color;
            ctx.fillRect(g.x-5, g.y+5, 6, 12);
            ctx.fillRect(g.x+g.w-1, g.y+5, 6, 12);

            if (g.tagged) {
                ctx.globalAlpha = 1;
                ctx.font = '12px serif';
                ctx.textAlign = 'center';
                ctx.fillText('âœ…', g.x+g.w/2, g.y-5);
            }

            // Exclamation when close
            if (!g.tagged) {
                const dist = Math.sqrt((player.x-g.x)**2+(player.y-g.y)**2);
                if (dist < 60) {
                    ctx.font = '14px serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(isIT?'ðŸ˜±':'ðŸ˜¤', g.x+g.w/2, g.y-10);
                }
            }
        }

        // Player gorilla
        ctx.fillStyle = isIT ? '#f44336' : '#4CAF50';
        ctx.beginPath();
        ctx.ellipse(player.x+player.w/2, player.y+player.h/2, player.w/2+2, player.h/2+2, 0, 0, Math.PI*2);
        ctx.fill();
        // Glow
        ctx.shadowColor = isIT ? '#f44336' : '#4CAF50';
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
        ctx.fillStyle = isIT ? '#d32f2f' : '#388E3C';
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
        ctx.fillText('â± '+timer+'s', W/2, 7);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#4CAF50';
        if(isIT) ctx.fillText('Tagged: '+tagged+'/'+gorillas.length, W-6, 7);
        else ctx.fillText('Score: '+score, W-6, 7);

        // Mode indicator
        ctx.fillStyle = isIT ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)';
        ctx.fillRect(0, H-20, W, 20);
        ctx.font = 'bold 10px Orbitron';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isIT ? '#f44336' : '#4CAF50';
        ctx.fillText(isIT ? 'ðŸ¦ YOU\'RE IT! Tag them all!' : 'ðŸƒ ESCAPE! Don\'t get tagged!', W/2, H-10);
    }

    function onKey(e) {
        const down = e.type === 'keydown';
        switch(e.key) {
            case 'ArrowLeft':case 'a':case 'A': keys.left=down; break;
            case 'ArrowRight':case 'd':case 'D': keys.right=down; break;
            case 'ArrowUp':case 'w':case 'W': keys.up=down; break;
            case 'ArrowDown':case 's':case 'S': keys.down=down; break;
            case ' ': e.preventDefault(); keys.jump=down; break;
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
    holdBtn('gt-left','left'); holdBtn('gt-right','right');
    holdBtn('gt-up','up'); holdBtn('gt-down','down');
    holdBtn('gt-jump','jump');

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
    ctx.fillText('ðŸ¦ Gorilla Tag', W/2, H/2-30);
    ctx.font = '12px Rajdhani, sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText('Swing through trees, tag gorillas!', W/2, H/2);
    ctx.fillText('SPACE to jump | Climb trees!', W/2, H/2+20);

    gameScoreDisplay.textContent = 'Best: ' + getHigh('gorillatag');

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
    gameTitle.textContent = 'ðŸ» Freddy\'s Pizzeria';

    gameArea.innerHTML = `
        <div id="fnaf-game" style="max-width:380px;margin:0 auto;text-align:center;font-family:Rajdhani,sans-serif;">
            <div id="fnaf-screen" style="background:#0a0a0a;border:2px solid #333;border-radius:12px;min-height:280px;position:relative;overflow:hidden;padding:10px;">
            </div>
            <div id="fnaf-controls" style="display:flex;justify-content:center;gap:8px;margin-top:10px;flex-wrap:wrap;">
                <button id="fnaf-cam" style="padding:10px 16px;font-size:0.9rem;background:#1a1a2e;border:2px solid #00d4ff;border-radius:8px;color:#00d4ff;cursor:pointer;">ðŸ“¹ Cameras</button>
                <button id="fnaf-ldoor" style="padding:10px 16px;font-size:0.9rem;background:#1a1a2e;border:2px solid #ff4444;border-radius:8px;color:#ff4444;cursor:pointer;">ðŸšª Left Door</button>
                <button id="fnaf-rdoor" style="padding:10px 16px;font-size:0.9rem;background:#1a1a2e;border:2px solid #ff4444;border-radius:8px;color:#ff4444;cursor:pointer;">ðŸšª Right Door</button>
                <button id="fnaf-light" style="padding:10px 16px;font-size:0.9rem;background:#1a1a2e;border:2px solid #ffaa00;border-radius:8px;color:#ffaa00;cursor:pointer;">ðŸ’¡ Light</button>
            </div>
            <div style="color:#555;font-size:0.7rem;margin-top:6px;">Check cameras, close doors when animatronics are near, survive until 6 AM!</div>
        </div>
    `;

    const screen = document.getElementById('fnaf-screen');

    const animatronics = [
        {name:'Freddy', emoji:'ðŸ»', room:0, aggressiveness:1, color:'#8B4513'},
        {name:'Bonnie', emoji:'ðŸ°', room:0, aggressiveness:2, color:'#6A1B9A'},
        {name:'Chica', emoji:'ðŸ¥', room:0, aggressiveness:2, color:'#F9A825'},
        {name:'Foxy', emoji:'ðŸ¦Š', room:0, aggressiveness:3, color:'#D84315'}
    ];

    // Rooms: 0=Show Stage, 1=Dining Area, 2=Backstage, 3=West Hall, 4=East Hall,
    // 5=Left Door, 6=Right Door, 7=Kitchen, 8=Supply Closet, 9=Pirate Cove (Foxy)
    const roomNames = ['Show Stage','Dining Area','Backstage','West Hall','East Hall','Left Door','Right Door','Kitchen','Supply Closet','Pirate Cove'];
    const roomEmojis = ['ðŸŽ¤','ðŸ½ï¸','ðŸ“¦','ðŸš¶â€â™‚ï¸','ðŸš¶','ðŸšª','ðŸšª','ðŸ•','ðŸ§¹','ðŸ´â€â˜ ï¸'];

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
        hour = 0; // 12 AM = 0, 1 AM = 1, ... 6 AM = 6
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
                        <div style="font-size:4rem;">â˜€ï¸</div>
                        <div style="font-size:2rem;color:#ffaa00;font-family:Orbitron,sans-serif;margin:10px 0;">6 AM</div>
                        <div style="color:#4CAF50;font-size:1.3rem;">You survived Night ${night}! ðŸŽ‰</div>
                        ${isNew ? '<div style="color:#ffaa00;margin:5px 0;">â­ New Record!</div>' : ''}
                        <button id="fnaf-next" style="margin-top:15px;padding:10px 25px;font-size:1rem;background:linear-gradient(135deg,#ff4444,#b44aff);border:none;border-radius:8px;cursor:pointer;color:#fff;font-family:Orbitron,sans-serif;">Night ${night+1} â†’</button>
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
                // Power out â€” Freddy comes
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
        if (atLeft.length > 0 && !leftDoor) {
            jumpscare(atLeft[0]);
            return;
        }

        // Check right door
        const atRight = animatronics.filter(a => a.room === 6);
        if (atRight.length > 0 && !rightDoor) {
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
                <div style="color:#ff4444;font-size:1.1rem;">â˜ ï¸ Game Over â€” Night ${night}</div>
                <div style="color:#888;margin:5px 0;">Best: Night ${getHigh('fnaf')}</div>
                <button id="fnaf-retry" style="margin-top:15px;padding:10px 25px;font-size:1rem;background:#ff4444;border:none;border-radius:8px;cursor:pointer;color:#fff;font-family:Orbitron,sans-serif;">ðŸ”„ Try Again</button>
            </div>
            <style>@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}</style>
        `;
        document.getElementById('fnaf-retry').onclick = resetGame;
    }

    function render() {
        if (jumpscareActive) return;

        const hourStr = hour === 0 ? '12 AM' : hour + ' AM';

        if (viewingCams) {
            // Camera view
            const camRoom = selectedCam;
            const inRoom = animatronics.filter(a => a.room === camRoom);
            const static1 = Math.random() > 0.7 ? 'filter:brightness(0.5);' : '';

            let camContent = `<div style="font-size:3rem;margin:15px 0;">${roomEmojis[camRoom]}</div>`;
            if (inRoom.length > 0) {
                camContent += `<div style="font-size:2.5rem;margin:10px 0;${static1}">${inRoom.map(a=>a.emoji).join(' ')}</div>`;
                camContent += `<div style="color:#ff4444;font-size:0.9rem;">${inRoom.map(a=>a.name).join(', ')} spotted!</div>`;
            } else {
                camContent += `<div style="color:#4CAF50;font-size:0.9rem;margin:10px 0;">Room is clear âœ…</div>`;
            }

            let camButtons = '';
            roomNames.forEach((name, i) => {
                if (i === 5 || i === 6) return; // skip door rooms from cam list
                const hasAnim = animatronics.some(a => a.room === i);
                const sel = selectedCam === i;
                camButtons += `<button onclick="window._fnafCam(${i})" style="padding:4px 8px;font-size:0.7rem;background:${sel?'#333':'#111'};border:1px solid ${hasAnim?'#ff4444':'#333'};border-radius:4px;color:${hasAnim?'#ff4444':'#888'};cursor:pointer;margin:2px;">${name}</button>`;
            });

            screen.innerHTML = `
                <div style="position:relative;">
                    <div style="background:#0a0a0a;padding:10px;border-bottom:1px solid #333;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <span style="color:#00d4ff;font-family:Orbitron;font-size:0.8rem;">ðŸ“¹ CAM ${String(camRoom+1).padStart(2,'0')}</span>
                            <span style="color:#ffaa00;font-family:Orbitron;font-size:0.9rem;">${hourStr}</span>
                            <span style="color:${power<20?'#ff4444':'#4CAF50'};font-family:Orbitron;font-size:0.8rem;">âš¡${Math.round(power)}%</span>
                        </div>
                    </div>
                    <div style="padding:15px;min-height:140px;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.02) 2px,rgba(255,255,255,0.02) 4px);">
                        <div style="color:#aaa;font-size:0.8rem;">${roomNames[camRoom]}</div>
                        ${camContent}
                    </div>
                    <div style="padding:8px;display:flex;flex-wrap:wrap;justify-content:center;gap:2px;background:#111;">
                        ${camButtons}
                    </div>
                    <div style="color:#666;font-size:0.7rem;margin-top:5px;">Night ${night} | ðŸšªL:${leftDoor?'ðŸ”´SHUT':'ðŸŸ¢OPEN'} R:${rightDoor?'ðŸ”´SHUT':'ðŸŸ¢OPEN'}</div>
                </div>
            `;
        } else {
            // Office view
            const leftCheck = animatronics.filter(a => a.room === 5);
            const rightCheck = animatronics.filter(a => a.room === 6);
            const leftHallCheck = animatronics.filter(a => a.room === 3);
            const rightHallCheck = animatronics.filter(a => a.room === 4);

            let leftStatus = leftDoor ? 'ðŸ”´ CLOSED' : 'ðŸŸ¢ OPEN';
            let rightStatus = rightDoor ? 'ðŸ”´ CLOSED' : 'ðŸŸ¢ OPEN';

            let officeView = '<div style="font-size:2rem;margin:10px 0;">ðŸ–¥ï¸ Your Office ðŸª‘</div>';

            if (lightOn) {
                if (leftCheck.length > 0) {
                    officeView += `<div style="color:#ff4444;font-size:1.2rem;animation:shake 0.2s infinite;">âš ï¸ ${leftCheck[0].emoji} ${leftCheck[0].name} AT LEFT DOOR! âš ï¸</div>`;
                }
                if (rightCheck.length > 0) {
                    officeView += `<div style="color:#ff4444;font-size:1.2rem;animation:shake 0.2s infinite;">âš ï¸ ${rightCheck[0].emoji} ${rightCheck[0].name} AT RIGHT DOOR! âš ï¸</div>`;
                }
                if (leftHallCheck.length > 0) {
                    officeView += `<div style="color:#ffaa00;font-size:0.9rem;">ðŸ‘€ ${leftHallCheck.map(a=>a.emoji+' '+a.name).join(', ')} in West Hall</div>`;
                }
                if (rightHallCheck.length > 0) {
                    officeView += `<div style="color:#ffaa00;font-size:0.9rem;">ðŸ‘€ ${rightHallCheck.map(a=>a.emoji+' '+a.name).join(', ')} in East Hall</div>`;
                }
                if (leftCheck.length===0 && rightCheck.length===0 && leftHallCheck.length===0 && rightHallCheck.length===0) {
                    officeView += `<div style="color:#4CAF50;font-size:0.9rem;">All clear... for now ðŸ˜°</div>`;
                }
            } else {
                officeView += `<div style="color:#555;font-size:0.9rem;margin:10px 0;">ðŸ’¡ Turn on the light to check the halls...</div>`;
            }

            screen.innerHTML = `
                <div>
                    <div style="background:#0a0a0a;padding:10px;border-bottom:1px solid #333;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <span style="color:#888;font-family:Orbitron;font-size:0.8rem;">Night ${night}</span>
                            <span style="color:#ffaa00;font-family:Orbitron;font-size:1rem;">${hourStr}</span>
                            <span style="color:${power<20?'#ff4444':'#4CAF50'};font-family:Orbitron;font-size:0.8rem;">âš¡${Math.round(power)}%</span>
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
                        <div style="font-size:2rem;">${lightOn?'ðŸ’¡':'ðŸŒ‘'}</div>
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
        viewingCams = !viewingCams;
        document.getElementById('fnaf-cam').textContent = viewingCams ? 'ðŸ–¥ï¸ Office' : 'ðŸ“¹ Cameras';
        render();
    };
    document.getElementById('fnaf-ldoor').onclick = () => {
        if (!gameActive) return;
        leftDoor = !leftDoor;
        checkAttack();
        render();
    };
    document.getElementById('fnaf-rdoor').onclick = () => {
        if (!gameActive) return;
        rightDoor = !rightDoor;
        checkAttack();
        render();
    };
    document.getElementById('fnaf-light').onclick = () => {
        if (!gameActive) return;
        lightOn = !lightOn;
        render();
    };

    gameScoreDisplay.textContent = 'Best: Night ' + getHigh('fnaf');
    resetGame();

    gameCleanup = () => {
        gameActive = false;
        clearIntervals();
        delete window._fnafCam;
    };
}

// ==================== SCARY SHAWARMA ====================
function initScaryShawarma() {
    gameTitle.textContent = 'ðŸŒ¯ Scary Shawarma';

    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 400;
    canvas.style.cssText = 'display:block;margin:0 auto;border:2px solid #FF6F00;border-radius:12px;background:#1a0a0a;touch-action:none;cursor:pointer;';

    const startBtn = document.createElement('button');
    startBtn.textContent = 'â–¶ Open the Kitchen!';
    startBtn.style.cssText = 'display:block;margin:10px auto;padding:12px 30px;font-size:1.1rem;background:linear-gradient(135deg,#FF6F00,#f44336);border:none;border-radius:8px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;color:#fff;';

    const dpad = document.createElement('div');
    dpad.style.cssText = 'display:grid;grid-template-columns:45px 45px 45px;grid-template-rows:45px 45px;gap:3px;justify-content:center;margin-top:8px;';
    dpad.innerHTML = `
        <div></div>
        <button id="ss-up" style="font-size:1.2rem;background:#1a0a0a;border:2px solid #FF6F00;border-radius:8px;color:#FF6F00;cursor:pointer;">â¬†</button>
        <div></div>
        <button id="ss-left" style="font-size:1.2rem;background:#1a0a0a;border:2px solid #FF6F00;border-radius:8px;color:#FF6F00;cursor:pointer;">â¬…</button>
        <button id="ss-grab" style="font-size:0.7rem;background:#1a0a0a;border:2px solid #4CAF50;border-radius:8px;color:#4CAF50;cursor:pointer;">Grab</button>
        <button id="ss-right" style="font-size:1.2rem;background:#1a0a0a;border:2px solid #FF6F00;border-radius:8px;color:#FF6F00;cursor:pointer;">âž¡</button>
        <div></div>
        <button id="ss-down" style="font-size:1.2rem;background:#1a0a0a;border:2px solid #FF6F00;border-radius:8px;color:#FF6F00;cursor:pointer;">â¬‡</button>
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
        {name:'Meat', emoji:'ðŸ¥©', color:'#C62828'},
        {name:'Bread', emoji:'ðŸ«“', color:'#D7CCC8'},
        {name:'Lettuce', emoji:'ðŸ¥¬', color:'#4CAF50'},
        {name:'Tomato', emoji:'ðŸ…', color:'#f44336'},
        {name:'Onion', emoji:'ðŸ§…', color:'#E1BEE7'},
        {name:'Sauce', emoji:'ðŸ«™', color:'#FF8F00'},
        {name:'Cheese', emoji:'ðŸ§€', color:'#FFC107'},
        {name:'Pepper', emoji:'ðŸŒ¶ï¸', color:'#D32F2F'}
    ];

    const HAUNTED = [
        {name:'Ghost Pepper', emoji:'ðŸ‘»ðŸŒ¶ï¸', speed:2, damage:15},
        {name:'Zombie Meat', emoji:'ðŸ§ŸðŸ¥©', speed:1.5, damage:20},
        {name:'Evil Tomato', emoji:'ðŸ˜ˆðŸ…', speed:2.5, damage:10},
        {name:'Cursed Onion', emoji:'ðŸ’€ðŸ§…', speed:1.8, damage:25},
        {name:'Demon Cheese', emoji:'ðŸ”¥ðŸ§€', speed:3, damage:12},
        {name:'Witch Sauce', emoji:'ðŸ§™â€â™€ï¸ðŸ«™', speed:2.2, damage:18}
    ];

    const SCARY_MSGS = [
        'THE SHAWARMA DEMANDS A SACRIFICE! ðŸŒ¯ðŸ’€',
        'WHO TURNED OFF THE LIGHTS?! ðŸ˜±',
        'The meat... it MOVED! ðŸ¥©ðŸ‘€',
        'Something is watching from the fridge... ðŸ§ŠðŸ‘ï¸',
        'The sauce is ALIVE! ðŸ«™ðŸ˜ˆ',
        'DO NOT OPEN THE OVEN! ðŸ”¥ðŸ’€',
        'The lettuce whispers your name... ðŸ¥¬ðŸ«£',
        'BEHIND YOU! ...just kidding ðŸ˜‚'
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
                x: Math.random() < 0.5 ? -20 : W + 20,
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
                showGameOver('Time\'s up! Kitchen closed! ðŸŒ¯ðŸ’€', score, 'scaryshawarma', ()=>{reset();});
            }
        }, 1000);

        running = true;
        showMsg('ðŸŒ¯ Night ' + level + ': Make a shawarma! Collect: ' + recipe.map(r=>r.emoji).join(' '));
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
                showMsg('Got ' + ing.emoji + ' ' + ing.name + '!');

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
                    showMsg('ðŸŒ¯ SHAWARMA COMPLETE! +' + (100 + level*20) + ' points! ðŸŽ‰');

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
        if (!running) { if (running !== false) frameId = requestAnimationFrame(step); return; }

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
            showGameOver('The haunted food got you! ðŸ‘»ðŸŒ¯', score, 'scaryshawarma', ()=>{reset();});
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
        ctx.fillStyle = isSpooky ? '#1a0000' : '#1a1a0a';
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
        ctx.fillText('ðŸ§‘â€ðŸ³', player.x, player.y);
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
                ctx.fillText('ðŸŒ¯', W/2, H/2);
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
        ctx.fillText('Night ' + level, 6, 4);
        ctx.fillStyle = '#ffaa00';
        ctx.fillText('ðŸŒ¯x' + shawarmasMade, 6, 18);

        ctx.textAlign = 'center';
        ctx.fillStyle = timer <= 10 ? '#ff4444' : '#00d4ff';
        ctx.fillText('â± ' + timer + 's', W/2, 4);

        // Health bar
        ctx.fillStyle = '#333';
        ctx.fillRect(W/2-30, 19, 60, 10);
        ctx.fillStyle = health > 50 ? '#4CAF50' : (health > 25 ? '#FF9800' : '#f44336');
        ctx.fillRect(W/2-30, 19, 60*(health/100), 10);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#00ff88';
        ctx.fillText('Score: ' + score, W-6, 4);

        // Recipe display
        ctx.fillStyle = '#888';
        ctx.font = '9px Rajdhani';
        ctx.textAlign = 'right';
        const recipeStr = 'Need: ' + recipe.map(r => {
            const have = collectedIngredients.some(c => c.name === r.name);
            return (have ? 'âœ…' : 'â¬œ') + r.emoji;
        }).join(' ');
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
            case 'e':case 'E':case ' ': grab(); break;
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
    ctx.fillText('ðŸŒ¯ Scary Shawarma', W/2, H/2-40);
    ctx.font = '40px serif';
    ctx.fillText('ðŸ§‘â€ðŸ³ðŸ‘»ðŸŒ¯', W/2, H/2+10);
    ctx.font = '11px Rajdhani';
    ctx.fillStyle = '#888';
    ctx.fillText('Cook shawarmas in a haunted kitchen!', W/2, H/2+50);
    ctx.fillText('Avoid the cursed ingredients! ðŸ˜±', W/2, H/2+65);

    gameScoreDisplay.textContent = 'Best: ' + getHigh('scaryshawarma');

    gameCleanup = () => {
        running = false;
        cancelAnimationFrame(frameId);
        if (timerInterval) clearInterval(timerInterval);
        document.removeEventListener('keydown', onKey);
    };
}


// ==================== 21. RED LIGHT GREEN LIGHT ====================
function initRedGreenLight() {
    gameTitle.textContent = 'ðŸš¦ Red Light Green Light';

    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 500;
    canvas.style.cssText = 'display:block;margin:0 auto;border:2px solid #00ff88;border-radius:12px;background:#1a1a2e;touch-action:none;';

    const diffDiv = document.createElement('div');
    diffDiv.style.cssText = 'text-align:center;margin:10px 0;';
    diffDiv.innerHTML = `
        <span style="color:#aaa;font-family:Rajdhani;font-size:0.9rem;">Difficulty: </span>
        <button id="rgl-easy" class="game-btn" style="padding:6px 14px;font-size:0.8rem;margin:0 3px;">Easy</button>
        <button id="rgl-med" class="game-btn" style="padding:6px 14px;font-size:0.8rem;margin:0 3px;">Medium</button>
        <button id="rgl-hard" class="game-btn" style="padding:6px 14px;font-size:0.8rem;margin:0 3px;">Hard</button>
    `;

    const startBtn = document.createElement('button');
    startBtn.textContent = 'â–¶ Start Running!';
    startBtn.style.cssText = 'display:block;margin:10px auto;padding:12px 30px;font-size:1.1rem;background:linear-gradient(135deg,#00ff88,#00d4ff);border:none;border-radius:8px;cursor:pointer;font-family:Orbitron,sans-serif;font-weight:bold;color:#000;';

    const runBtn = document.createElement('button');
    runBtn.textContent = 'ðŸƒ TAP TO RUN!';
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
        easy:   { greenMin: 3000, greenMax: 5000, redMin: 2000, redMax: 3000, graceMs: 400, timer: 60, label: 'Easy' },
        medium: { greenMin: 2000, greenMax: 4000, redMin: 1500, redMax: 3000, graceMs: 200, timer: 45, label: 'Medium' },
        hard:   { greenMin: 1500, greenMax: 3000, redMin: 1000, redMax: 2500, graceMs: 80,  timer: 35, label: 'Hard' }
    };
    let difficulty = 'medium';

    // Game state
    let playerY, progress, isGreen, running, caught, won, timer, frameId;
    let lightSwitchTimeout, timerInterval;
    let isRunning; // whether the player is currently running (holding button)
    let dollFacing; // 'away' (green) or 'watching' (red)
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
        runBtn.textContent = 'â³ Get Ready...';

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
                    showGameOver('â± Time\'s up!', 0, 'redgreenlight', () => { reset(); drawInitial(); });
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
        runBtn.textContent = 'ðŸƒ TAP TO RUN!';

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
        runBtn.textContent = 'ðŸ›‘ STOP!';

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
                        color: ['#00ff88','#00d4ff','#ff44aa','#ffaa00','#b44aff','#ff6600'][Math.floor(Math.random()*6)],
                        size: Math.random() * 6 + 2,
                        rotation: Math.random() * 360,
                        rotSpeed: (Math.random() - 0.5) * 10
                    });
                }

                const score = Math.max(0, timer);
                setTimeout(() => {
                    showGameOver('ðŸŽ‰ YOU CROSSED THE LINE!', score, 'redgreenlight', () => { reset(); drawInitial(); });
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
                    showGameOver('ðŸ”´ CAUGHT! You moved during red light!', 0, 'redgreenlight', () => { reset(); drawInitial(); });
                }, 1200);
            }
        }
    }

    function gameLoop() {
        if (!running && !won && !caught) return;
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
            ctx.fillStyle = isGreen ? `rgba(0,255,100,${tintAlpha})` : `rgba(255,0,0,${tintAlpha})`;
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
                ctx.fillStyle = isWhite ? '#fff' : '#000';
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
        if (dollFacing === 'watching' || dollRotation > 90) {
            // Facing player (red light) â€” angry face
            ctx.font = '35px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('ðŸ¤–', 0, 0);

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
            ctx.fillText('ðŸ¤–', 0, 0);

            // Green glow
            ctx.beginPath();
            ctx.arc(0, 0, 28, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0,255,136,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.restore();

        // "TURNED AWAY" / "WATCHING" text near doll
        ctx.font = 'bold 9px Orbitron';
        ctx.textAlign = 'center';
        if (dollFacing === 'away') {
            ctx.fillStyle = '#00ff88';
            ctx.fillText('â† TURNED AWAY â†’', dollX, dollY + 28);
        } else {
            ctx.fillStyle = '#ff4444';
            ctx.fillText('ðŸ‘ WATCHING YOU ðŸ‘', dollX, dollY + 28);
        }

        // Player character
        const pX = W / 2;
        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (caught) {
            // Caught animation â€” X eyes
            ctx.fillText('ðŸ˜µ', pX, playerY);
            // Red flash
            ctx.fillStyle = 'rgba(255,0,0,0.3)';
            ctx.fillRect(0, 0, W, H);
            // "CAUGHT" text
            ctx.font = 'bold 28px Orbitron';
            ctx.fillStyle = '#ff4444';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('CAUGHT!', W/2, H/2);
        } else if (won) {
            ctx.fillText('ðŸ†', pX, playerY);
        } else {
            // Running or standing animation
            const bobble = (isRunning && isGreen) ? Math.sin(stepCount * 0.5) * 3 : 0;
            ctx.fillText('ðŸƒ', pX, playerY + bobble);
        }

        // Other "NPC runners" for ambiance (static positions)
        const npcs = [
            { x: W * 0.2, progress: 0.3, emoji: 'ðŸ§‘' },
            { x: W * 0.35, progress: 0.55, emoji: 'ðŸ‘¦' },
            { x: W * 0.65, progress: 0.15, emoji: 'ðŸ‘§' },
            { x: W * 0.8, progress: 0.45, emoji: 'ðŸ§’' }
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
        ctx.fillStyle = isGreen ? '#440000' : '#ff0000';
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
        ctx.fillStyle = isGreen ? '#00ff88' : '#003300';
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
        ctx.fillStyle = timer <= 10 ? '#ff4444' : '#00d4ff';
        ctx.fillText('â± ' + timer + 's', W/2, 4);

        // Light text
        ctx.font = 'bold 11px Orbitron';
        ctx.textAlign = 'center';
        if (isGreen) {
            ctx.fillStyle = '#00ff88';
            ctx.fillText('GREEN LIGHT ðŸŸ¢', W/2, 17);
        } else {
            ctx.fillStyle = '#ff4444';
            ctx.fillText('RED LIGHT ðŸ”´', W/2, 17);
        }

        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 10px Orbitron';
        ctx.fillText('ðŸ† ' + getHigh('redgreenlight'), W - 8, 4);

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
        ctx.fillText('ðŸš¦ Red Light', W/2, H/2 - 50);
        ctx.fillText('Green Light', W/2, H/2 - 25);
        ctx.font = '50px serif';
        ctx.fillText('ðŸ¤–   ðŸƒ', W/2, H/2 + 25);
        ctx.font = '11px Rajdhani';
        ctx.fillStyle = '#888';
        ctx.fillText('Run when green! Stop when red!', W/2, H/2 + 65);
        ctx.fillText('Reach the finish line before time runs out!', W/2, H/2 + 82);
    }

    // Event handlers
    function onKey(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            playerRun();
        }
    }
    document.addEventListener('keydown', onKey);

    // Run button â€” tap/click
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
                document.getElementById('rgl-easy').style.opacity = diff === 'easy' ? '1' : '0.5';
                document.getElementById('rgl-med').style.opacity = diff === 'medium' ? '1' : '0.5';
                document.getElementById('rgl-hard').style.opacity = diff === 'hard' ? '1' : '0.5';
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

    gameScoreDisplay.textContent = 'Best: ' + getHigh('redgreenlight');

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
    gameTitle.textContent = '🏹 Hit the Target';
    const best = getHigh('hittarget');
    gameScoreDisplay.textContent = best ? 'Best: ' + best : '';

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
        easy:   { targetR: 50, speed: 0.5, arrows: 12, wind: 0 },
        medium: { targetR: 40, speed: 1.0, arrows: 10, wind: 1 },
        hard:   { targetR: 30, speed: 1.8, arrows: 8, wind: 2 }
    };

    gameArea.innerHTML = '<canvas id="ht-canvas" style="width:100%;height:100%;display:block;border-radius:12px;cursor:crosshair;"></canvas>';
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
        const colors = ['#ff0000','#ffffff','#ff0000','#ffffff','#ff4444'];
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
        const pullBack = phase === 'power' ? power / 100 * 15 : 0;
        ctx.lineTo(bowX - pullBack, bowY);
        ctx.lineTo(bowX + 40 * Math.cos(Math.PI*0.4), bowY + 40 * Math.sin(Math.PI*0.4));
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Arrow on bow
        if (phase === 'aim' || phase === 'power') {
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
        ctx.fillText('🧑', bowX - 30, bowY + 10);
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
        ctx.fillText('Score: ' + score, 15, 30);
        ctx.fillText('Arrows: ' + arrows, 15, 55);
        ctx.textAlign = 'right';
        ctx.fillText('Round: ' + round + '/' + totalRounds, W - 15, 30);
        if (wind !== 0) {
            const windTxt = wind > 0 ? 'Wind: → ' + wind.toFixed(1) : 'Wind: ← ' + Math.abs(wind).toFixed(1);
            ctx.fillText(windTxt, W - 15, 55);
        }
        ctx.textAlign = 'left';

        // Power bar
        if (phase === 'power') {
            ctx.fillStyle = '#333';
            ctx.fillRect(W * 0.08, H * 0.88, W * 0.2, 16);
            const pColor = power < 40 ? '#00ff88' : power < 75 ? '#ffaa00' : '#ff4444';
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
            ctx.fillStyle = hitResult >= 8 ? '#ffdd00' : hitResult >= 4 ? '#00ff88' : '#fff';
            ctx.fillText('+' + hitResult, W / 2, H / 2 - 20);
            if (hitResult >= 8) {
                ctx.font = '20px Orbitron, sans-serif';
                ctx.fillText(hitResult === 10 ? 'BULLSEYE!!' : 'GREAT SHOT!', W / 2, H / 2 + 20);
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
        ctx.fillText('🏹 Hit the Target', W/2, H*0.25);
        ctx.font = '16px Rajdhani, sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Click/tap to aim, then set power!', W/2, H*0.33);

        // Difficulty buttons
        const bw = 90, bh = 36, gap = 15;
        const startX = W/2 - (bw*3 + gap*2)/2;
        ['Easy','Medium','Hard'].forEach((d, i) => {
            const x = startX + i * (bw + gap);
            const y = H * 0.42;
            const sel = d.toLowerCase() === difficulty;
            ctx.fillStyle = sel ? (i===0?'#00ff88':i===1?'#00d4ff':'#ff4444') : '#333';
            ctx.beginPath();
            ctx.roundRect(x, y, bw, bh, 8);
            ctx.fill();
            ctx.fillStyle = sel ? '#000' : '#aaa';
            ctx.font = (sel ? 'bold ' : '') + '16px Rajdhani, sans-serif';
            ctx.fillText(d, x + bw/2, y + 24);
        });

        // Start button
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.roundRect(W/2 - 70, H*0.55, 140, 50, 12);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 22px Orbitron, sans-serif';
        ctx.fillText('▶ START', W/2, H*0.55 + 35);

        ctx.textAlign = 'left';
    }

    function drawGameOver() {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.font = 'bold 36px Orbitron, sans-serif';
        const isNew = setHigh('hittarget', score);
        ctx.fillStyle = score >= 60 ? '#00ff88' : score >= 30 ? '#ffaa00' : '#ff4444';
        ctx.fillText(score >= 60 ? '🏆 AMAZING!' : score >= 30 ? '👏 NICE!' : '😅 TRY AGAIN!', W/2, H*0.3);
        ctx.fillStyle = '#fff';
        ctx.font = '24px Orbitron, sans-serif';
        ctx.fillText('Score: ' + score, W/2, H*0.42);
        if (isNew) {
            ctx.fillStyle = '#ffdd00';
            ctx.font = '18px Rajdhani, sans-serif';
            ctx.fillText('⭐ NEW HIGH SCORE! ⭐', W/2, H*0.50);
        }
        gameScoreDisplay.textContent = 'Best: ' + getHigh('hittarget');

        ctx.fillStyle = '#00d4ff';
        ctx.beginPath();
        ctx.roundRect(W/2 - 70, H*0.58, 140, 50, 12);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px Orbitron, sans-serif';
        ctx.fillText('🔄 RETRY', W/2, H*0.58 + 35);
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
            ['easy','medium','hard'].forEach((d, i) => {
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
    gameTitle.textContent = 'ðŸŽ² Ludo';
    gameScoreDisplay.textContent = 'Wins: ' + getHigh('ludo');

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
    function diceSound() { for(let i=0;i<3;i++) setTimeout(()=>playSound(200+i*100,0.08,'triangle'),i*60); }
    function moveSound() { playSound(440,0.1,'sine'); }
    function captureSound() { playSound(800,0.15,'square'); playSound(600,0.15,'square'); }
    function winSound() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>playSound(f,0.3,'sine'),i*150)); }

    // Colors
    const COLORS = {
        0: { main: '#e74c3c', light: '#ff6b6b', dark: '#c0392b', name: 'Red' },
        1: { main: '#3498db', light: '#5dade2', dark: '#2980b9', name: 'Blue' },
        2: { main: '#f1c40f', light: '#f9e154', dark: '#d4ac0f', name: 'Yellow' },
        3: { main: '#2ecc71', light: '#58d68d', dark: '#27ae60', name: 'Green' }
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
        3: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]]  // Green: col 7, row 13-8
    };

    // Start positions on main path for each player
    const startIndex = { 0: 0, 1: 13, 2: 26, 3: 39 };
    // Entry to home stretch: the cell BEFORE entering home stretch
    const homeEntry = { 0: 50, 1: 11, 2: 24, 3: 37 };

    // Base positions (where pieces sit before entering the board)
    const basePositions = {
        0: [[2,2],[2,4],[4,2],[4,4]],         // Red: top-left
        1: [[2,10],[2,12],[4,10],[4,12]],      // Blue: top-right
        2: [[10,10],[10,12],[12,10],[12,12]],   // Yellow: bottom-right
        3: [[10,2],[10,4],[12,2],[12,4]]        // Green: bottom-left
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
        if (p.state !== 'active' || p.homePos >= 0) return;
        const absPos = getAbsoluteMainPos(player, p.pathPos);

        // Check if on safe spot
        if (safeSpots.includes(absPos)) return;

        for (let op = 0; op < 4; op++) {
            if (op === player) continue;
            for (let oi = 0; oi < 4; oi++) {
                const other = pieces[op][oi];
                if (other.state !== 'active' || other.homePos >= 0) continue;
                const otherAbs = getAbsoluteMainPos(op, other.pathPos);
                if (otherAbs === absPos) {
                    // Capture!
                    other.state = 'base';
                    other.pathPos = -1;
                    other.homePos = -1;
                    captureSound();
                    message = COLORS[player].name + ' captured ' + COLORS[op].name + '!';
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
                        if (other.state === 'active' && other.homePos < 0) {
                            if (getAbsoluteMainPos(op, other.pathPos) === newAbs && !safeSpots.includes(newAbs)) {
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
                ctx.fillText('â˜…', x+CELL/2, y+CELL/2);
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
        const offset = isStacked ? -3 : 0;

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

        const v = rolling ? Math.floor(Math.random()*6)+1 : value;
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
                const key = Math.round(pos.x) + ',' + Math.round(pos.y);
                if (!posMap[key]) posMap[key] = [];
                posMap[key].push({player: p, piece: i});
            }
        }

        for (let p = 0; p < 4; p++) {
            for (let i = 0; i < 4; i++) {
                if (pieces[p][i].state === 'home') continue;
                const pos = getPiecePos(p, i);
                const key = Math.round(pos.x) + ',' + Math.round(pos.y);
                const isHighlighted = phase === 'select' && p === currentPlayer && movablePieces.includes(i);
                const stack = posMap[key];
                const stackIdx = stack ? stack.findIndex(s => s.player === p && s.piece === i) : 0;
                const isStacked = stack && stack.length > 1;
                const offsetX = isStacked ? (stackIdx - (stack.length-1)/2) * 6 : 0;
                drawPiece(pos.x + offsetX, pos.y, p, isHighlighted, isStacked);
            }
        }
    }

    // Draw UI
    function drawUI() {
        const uiY = BOARD_SIZE + 5;

        // Current player indicator
        ctx.fillStyle = COLORS[currentPlayer].main;
        ctx.font = 'bold ' + (CELL*0.55) + 'px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const turnText = COLORS[currentPlayer].name + "'s turn" + (currentPlayer === 0 ? ' (You)' : ' (AI)');
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
            ctx.fillText(COLORS[p].name + ': ' + homeCount + '/4', hx, uiY + CELL*2);
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
            message = COLORS[currentPlayer].name + ' rolled ' + diceValue + ' - no moves!';
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
                message = 'Tap a highlighted piece to move (rolled ' + diceValue + ')';
                phase = 'select';
            }
        } else {
            // AI player
            message = COLORS[currentPlayer].name + ' rolled ' + diceValue;
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
                    gameScoreDisplay.textContent = 'Wins: ' + wins;
                    message = 'ðŸŽ‰ YOU WIN!';
                } else {
                    message = COLORS[player].name + ' wins!';
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
                message = COLORS[currentPlayer].name + ' rolled 6, roll again!';
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
            '<h2>' + (winnerPlayer === 0 ? 'ðŸŽ‰ You Win!' : COLORS[winnerPlayer].name + ' Wins!') + '</h2>' +
            '<div class="final-score">' + (winnerPlayer === 0 ? 'Congratulations!' : 'Better luck next time!') + '</div>' +
            '<div class="high-score">ðŸ† Total Wins: ' + getHigh('ludo') + '</div>';
        const btn = document.createElement('button');
        btn.className = 'game-btn';
        btn.textContent = 'ðŸ”„ Play Again';
        btn.onclick = () => { overlay.remove(); resetGame(); };
        overlay.appendChild(btn);
        const menuBtn = document.createElement('button');
        menuBtn.className = 'game-btn';
        menuBtn.textContent = 'ðŸ  Menu';
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
        const touch = e.touches ? e.touches[0] : e;
        const mx = (touch.clientX - rect.left) * scaleX;
        const my = (touch.clientY - rect.top) * scaleY;

        if (phase === 'roll' && currentPlayer === 0) {
            rollDice();
            return;
        }

        if (phase === 'select' && currentPlayer === 0) {
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

