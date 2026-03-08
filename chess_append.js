

function initChess() {
    gameTitle.textContent = '♟️ Chess';
    const best = getHigh('chess');
    gameScoreDisplay.textContent = best ? 'Wins: ' + best : '';

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
        0,  0,  0,  0,  0,  0,  0,  0,
        50, 50, 50, 50, 50, 50, 50, 50,
        10, 10, 20, 30, 30, 20, 10, 10,
        5,  5, 10, 25, 25, 10,  5,  5,
        0,  0,  0, 20, 20,  0,  0,  0,
        5, -5,-10,  0,  0,-10, -5,  5,
        5, 10, 10,-20,-20, 10, 10,  5,
        0,  0,  0,  0,  0,  0,  0,  0
    ];
    var pstKnight = [
        -50,-40,-30,-30,-30,-30,-40,-50,
        -40,-20,  0,  0,  0,  0,-20,-40,
        -30,  0, 10, 15, 15, 10,  0,-30,
        -30,  5, 15, 20, 20, 15,  5,-30,
        -30,  0, 15, 20, 20, 15,  0,-30,
        -30,  5, 10, 15, 15, 10,  5,-30,
        -40,-20,  0,  5,  5,  0,-20,-40,
        -50,-40,-30,-30,-30,-30,-40,-50
    ];
    var pstBishop = [
        -20,-10,-10,-10,-10,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0, 10, 10, 10, 10,  0,-10,
        -10,  5,  5, 10, 10,  5,  5,-10,
        -10,  0, 10, 10, 10, 10,  0,-10,
        -10, 10, 10, 10, 10, 10, 10,-10,
        -10,  5,  0,  0,  0,  0,  5,-10,
        -20,-10,-10,-10,-10,-10,-10,-20
    ];
    var pstRook = [
        0,  0,  0,  0,  0,  0,  0,  0,
        5, 10, 10, 10, 10, 10, 10,  5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        0,  0,  0,  5,  5,  0,  0,  0
    ];
    var pstQueen = [
        -20,-10,-10, -5, -5,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5,  5,  5,  5,  0,-10,
        -5,  0,  5,  5,  5,  5,  0, -5,
        0,  0,  5,  5,  5,  5,  0, -5,
        -10,  5,  5,  5,  5,  5,  0,-10,
        -10,  0,  5,  0,  0,  0,  0,-10,
        -20,-10,-10, -5, -5,-10,-10,-20
    ];
    var pstKing = [
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -20,-30,-30,-40,-40,-30,-30,-20,
        -10,-20,-20,-20,-20,-20,-20,-10,
        20, 20,  0,  0,  0,  0, 20, 20,
        20, 30, 10,  0,  0, 10, 30, 20
    ];

    function getPST(piece, row, col) {
        var table;
        var baseP = isWhite(piece) ? piece : piece - 6;
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
    var turn = 'w'; // 'w' or 'b'
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

    gameArea.innerHTML = '<canvas id="chess-canvas" style="width:100%;height:100%;display:block;border-radius:12px;cursor:pointer;"></canvas>';
    canvas = document.getElementById('chess-canvas');
    ctx = canvas.getContext('2d');

    function resize() {
        var rect = gameArea.getBoundingClientRect();
        W = canvas.width = rect.width;
        H = canvas.height = rect.height;
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
            [0,  0,  0,  0,  0,  0,  0,  0],
            [0,  0,  0,  0,  0,  0,  0,  0],
            [0,  0,  0,  0,  0,  0,  0,  0],
            [0,  0,  0,  0,  0,  0,  0,  0],
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
        var king = color === 'w' ? WK : BK;
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
        var kn = byColor === 'w' ? WN : BN;
        for (var i = 0; i < knightMoves.length; i++) {
            r = row + knightMoves[i][0]; c = col + knightMoves[i][1];
            if (r >= 0 && r < 8 && c >= 0 && c < 8 && b[r][c] === kn) return true;
        }

        // King attacks
        var kg = byColor === 'w' ? WK : BK;
        for (var dr = -1; dr <= 1; dr++) {
            for (var dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                r = row + dr; c = col + dc;
                if (r >= 0 && r < 8 && c >= 0 && c < 8 && b[r][c] === kg) return true;
            }
        }

        // Rook/Queen (straight lines)
        var rq1 = byColor === 'w' ? WR : BR;
        var rq2 = byColor === 'w' ? WQ : BQ;
        var dirs = [[0,1],[0,-1],[1,0],[-1,0]];
        for (var d = 0; d < dirs.length; d++) {
            r = row + dirs[d][0]; c = col + dirs[d][1];
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                if (b[r][c] !== EMPTY) {
                    if (b[r][c] === rq1 || b[r][c] === rq2) return true;
                    break;
                }
                r += dirs[d][0]; c += dirs[d][1];
            }
        }

        // Bishop/Queen (diagonals)
        var bq1 = byColor === 'w' ? WB : BB;
        var bq2 = byColor === 'w' ? WQ : BQ;
        var diags = [[1,1],[1,-1],[-1,1],[-1,-1]];
        for (var d = 0; d < diags.length; d++) {
            r = row + diags[d][0]; c = col + diags[d][1];
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                if (b[r][c] !== EMPTY) {
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
        var enemy = color === 'w' ? 'b' : 'w';
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

        var base = isWhite(piece) ? piece : piece - 6;

        if (base === 1) { // Pawn
            var dir = color === 'w' ? -1 : 1;
            var startRow = color === 'w' ? 6 : 1;
            var promoRow = color === 'w' ? 0 : 7;

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
                    if (target !== EMPTY && colorOf(target) !== color) {
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
                    if (b[r][c] === EMPTY || colorOf(b[r][c]) !== color) addMove(r, c);
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
                        if (colorOf(b[r][c]) !== color) addMove(r, c);
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
                        if (b[r][c] === EMPTY || colorOf(b[r][c]) !== color) addMove(r, c);
                    }
                }
            }
            // Castling
            var enemy = color === 'w' ? 'b' : 'w';
            var kRow = color === 'w' ? 7 : 0;
            if (row === kRow && col === 4) {
                // Kingside
                var ksKey = color === 'w' ? 'wK' : 'bK';
                if (cr[ksKey] && b[kRow][5] === EMPTY && b[kRow][6] === EMPTY && b[kRow][7] === (color === 'w' ? WR : BR)) {
                    if (!isAttacked(b, kRow, 4, enemy) && !isAttacked(b, kRow, 5, enemy) && !isAttacked(b, kRow, 6, enemy)) {
                        addMove(kRow, 6, 'castle_k');
                    }
                }
                // Queenside
                var qsKey = color === 'w' ? 'wQ' : 'bQ';
                if (cr[qsKey] && b[kRow][3] === EMPTY && b[kRow][2] === EMPTY && b[kRow][1] === EMPTY && b[kRow][0] === (color === 'w' ? WR : BR)) {
                    if (!isAttacked(b, kRow, 4, enemy) && !isAttacked(b, kRow, 3, enemy) && !isAttacked(b, kRow, 2, enemy)) {
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
                if (b[r][c] !== EMPTY && colorOf(b[r][c]) === color) {
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
            b[move.tr][move.tc] = isWhite(piece) ? WQ : BQ;
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
        var wasCapture = captured !== EMPTY;
        var color = colorOf(piece);

        // Handle en passant capture
        if (move.special === 'enpassant') {
            captured = board[move.fr][move.tc];
            wasCapture = true;
        }

        // Record captured piece
        if (wasCapture && captured !== EMPTY) {
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
        if (pn !== 'P') notation += pn;
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
        turn = turn === 'w' ? 'b' : 'w';

        // Check for check/checkmate/stalemate
        inCheck = isInCheck(board, turn);
        var legalMoves = generateLegalMoves(board, turn, castleRights, enPassantTarget);

        if (inCheck) notation += '+';

        if (legalMoves.length === 0) {
            if (inCheck) {
                gameOverState = 'checkmate';
                winner = turn === 'w' ? 'b' : 'w';
                notation = notation.replace('+', '#');
                if (winner === 'w') {
                    checkmateSound();
                    var wins = getHigh('chess') + 1;
                    setHigh('chess', wins);
                    gameScoreDisplay.textContent = 'Wins: ' + wins;
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

        moveHistory.push((color === 'w' ? 'W: ' : 'B: ') + notation);
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

        var color = isMaximizing ? 'b' : 'w';
        var moves = generateLegalMoves(b, color, cr, ep);

        if (moves.length === 0) {
            if (isInCheck(b, color)) {
                return isMaximizing ? -99999 + (3 - depth) : 99999 - (3 - depth);
            }
            return 0; // stalemate
        }

        // Move ordering: captures first
        moves.sort(function(a, bb2) {
            var scoreA = b[a.tr][a.tc] !== EMPTY ? pieceValues[b[a.tr][a.tc]] : 0;
            var scoreB = b[bb2.tr][bb2.tc] !== EMPTY ? pieceValues[b[bb2.tr][bb2.tc]] : 0;
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
        if (gameOverState || turn !== 'b') return;
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
        ctx.font = 'bold ' + Math.max(28, W * 0.06) + 'px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('♟️ Chess', W / 2, H * 0.15);

        // Subtitle
        ctx.font = Math.max(14, W * 0.03) + 'px Arial';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Play as White vs AI', W / 2, H * 0.22);

        // Difficulty buttons
        var btnW = Math.min(180, W * 0.4);
        var btnH = 45;
        var btnX = W / 2 - btnW / 2;
        var startY = H * 0.32;
        var gap = 60;
        var diffs = ['easy', 'medium', 'hard'];
        var diffLabels = ['Easy', 'Medium', 'Hard'];
        var diffColors = ['#4CAF50', '#FF9800', '#f44336'];

        for (var i = 0; i < 3; i++) {
            var y = startY + i * gap;
            var isSelected = difficulty === diffs[i];
            ctx.fillStyle = isSelected ? diffColors[i] : '#333';
            ctx.strokeStyle = diffColors[i];
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(btnX, y, btnW, btnH, 8);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = isSelected ? '#fff' : '#ccc';
            ctx.font = 'bold ' + Math.max(16, W * 0.035) + 'px Arial';
            ctx.fillText(diffLabels[i], W / 2, y + btnH / 2 + 6);
        }

        // START button
        var startBtnY = startY + 3 * gap + 10;
        ctx.fillStyle = '#4a90d9';
        ctx.beginPath();
        ctx.roundRect(btnX, startBtnY, btnW, 50, 10);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold ' + Math.max(18, W * 0.04) + 'px Arial';
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
                ctx.fillStyle = (r + c) % 2 === 0 ? lightColor : darkColor;
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
            if (board[mv.tr][mv.tc] !== EMPTY) {
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
        ctx.font = 'bold ' + Math.max(20, cellSize * 0.7) + 'px Arial';

        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                var p = board[r][c];
                if (p === EMPTY) continue;
                var px = boardX + c * cellSize + cellSize / 2;
                var py = boardY + r * cellSize + cellSize / 2;

                // Draw piece with shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillText(pieceChars[p], px + 1, py + 2);
                ctx.fillStyle = isWhite(p) ? '#fff' : '#111';
                ctx.fillText(pieceChars[p], px, py);
            }
        }
        ctx.textBaseline = 'alphabetic';
    }

    function drawUI() {
        // Turn indicator
        ctx.fillStyle = '#e0e0e0';
        ctx.font = 'bold ' + Math.max(14, W * 0.03) + 'px Arial';
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
            ctx.fillText('Captured: ', boardX, capY);
            var cxOffset = boardX + 70;
            for (var i = 0; i < capturedWhite.length; i++) {
                ctx.fillStyle = '#111';
                ctx.fillText(pieceChars[capturedWhite[i]], cxOffset + i * 18, capY);
            }
        }

        // Pieces captured by black (white pieces)
        if (capturedBlack.length > 0) {
            ctx.fillStyle = '#aaa';
            ctx.fillText('Lost: ', boardX, capY + 20);
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
        ctx.fillText('Difficulty: ' + diffLabel, boardX + boardSize, boardY - 15);
    }

    function drawGameOver() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold ' + Math.max(24, W * 0.05) + 'px Arial';
        ctx.textAlign = 'center';

        if (gameOverState === 'checkmate') {
            if (winner === 'w') {
                ctx.fillText('Checkmate! You Win! 🎉', W / 2, H / 2 - 40);
            } else {
                ctx.fillText('Checkmate! AI Wins 💀', W / 2, H / 2 - 40);
            }
        } else {
            ctx.fillText('Stalemate! Draw 🤝', W / 2, H / 2 - 40);
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
        ctx.font = 'bold ' + Math.max(16, W * 0.035) + 'px Arial';
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

        if (phase === 'playing' && gameOverState) {
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

        if (phase === 'playing' && !gameOverState && turn === 'w' && !aiThinking) {
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
            if (piece !== EMPTY && isWhite(piece)) {
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
