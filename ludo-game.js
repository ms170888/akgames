
// ==================== LUDO BOARD GAME ====================
function initLudo() {
    gameTitle.textContent = '🎲 Ludo';
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
                ctx.fillText('★', x+CELL/2, y+CELL/2);
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
                    message = '🎉 YOU WIN!';
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
            '<h2>' + (winnerPlayer === 0 ? '🎉 You Win!' : COLORS[winnerPlayer].name + ' Wins!') + '</h2>' +
            '<div class="final-score">' + (winnerPlayer === 0 ? 'Congratulations!' : 'Better luck next time!') + '</div>' +
            '<div class="high-score">🏆 Total Wins: ' + getHigh('ludo') + '</div>';
        const btn = document.createElement('button');
        btn.className = 'game-btn';
        btn.textContent = '🔄 Play Again';
        btn.onclick = () => { overlay.remove(); resetGame(); };
        overlay.appendChild(btn);
        const menuBtn = document.createElement('button');
        menuBtn.className = 'game-btn';
        menuBtn.textContent = '🏠 Menu';
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
