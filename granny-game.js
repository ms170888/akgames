

// ==================== ESCAPE THE GRANNY ====================
function initGranny() {
    gameTitle.textContent = '👻 Escape the Granny';
    
    const canvas = document.createElement('canvas');
    canvas.className = 'game-canvas';
    canvas.style.cssText = 'background:#000;touch-action:none;max-width:100%;';
    
    const info = document.createElement('div');
    info.className = 'game-info';
    info.innerHTML = '<span>Time: <b id="granny-time">0</b>s</span><span>Best: <b id="granny-high">' + getHigh('granny') + '</b>s</span><span id="granny-keys-display">Keys: 0/3</span>';
    
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
        if (!running || phase !== 'playing') return;
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
        1: {r:80,g:80,b:90},     // hallway dark
        2: {r:180,g:160,b:60},   // kitchen yellow
        3: {r:60,g:80,b:160},    // bedroom blue
        4: {r:100,g:100,b:100},  // basement gray
        5: {r:60,g:140,b:80},    // bathroom green
        6: {r:160,g:40,b:40}     // exit door red
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
            { x: 6.5, y: 6.5, color: 0, collected: false },  // red key in kitchen
            { x: 15.5, y: 5.5, color: 1, collected: false },  // green key in bedroom
            { x: 7.5, y: 17.5, color: 2, collected: false }   // blue key in basement
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
        easy:   { grannySpeed: 0.015, grannyAlertSpeed: 0.03, visibility: 8, ambientLight: 0.3 },
        medium: { grannySpeed: 0.02,  grannyAlertSpeed: 0.045, visibility: 6, ambientLight: 0.15 },
        hard:   { grannySpeed: 0.03,  grannyAlertSpeed: 0.06,  visibility: 4.5, ambientLight: 0.08 }
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
        if (v === 6 && !exitUnlocked) return true;
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
                const sideMul = isSide ? 0.7 : 1.0;
                
                ctx.fillStyle = 'rgb(' + Math.floor(fogR * sideMul) + ',' + Math.floor(fogG * sideMul) + ',' + Math.floor(fogB * sideMul) + ')';
                ctx.fillRect(i * stripW, wallTop, stripW + 1, wallH);
                
                // Wall edge lines
                if (wallH > 20) {
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.fillRect(i * stripW, wallTop, 1, wallH);
                }
                
                // Exit door marking
                if (hit.wallType === 6) {
                    const lockShade = exitUnlocked ? 0.5 : shade;
                    if (exitUnlocked) {
                        ctx.fillStyle = 'rgba(0,255,0,' + (lockShade * 0.3) + ')';
                    } else {
                        ctx.fillStyle = 'rgba(255,0,0,' + (lockShade * 0.3) + ')';
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
        sprites.push({ x: granny.x, y: granny.y, type: 'granny' });
        
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
                ctx.fillStyle = granny.alerted ? '#660022' : '#333';
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
                ctx.fillStyle = granny.alerted ? '#f00' : '#300';
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
            ctx.fillStyle = 'rgba(255,0,0,' + (warningAlpha * (0.5 + 0.5 * Math.sin(Date.now() * 0.01))) + ')';
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
                    ctx.fillStyle = 'rgb(' + wc.r + ',' + wc.g + ',' + wc.b + ')';
                    ctx.fillRect(mmX + x * cellSize, mmY + y * cellSize, cellSize, cellSize);
                }
            }
        }
        
        // Camera cones
        cameras.forEach(cam => {
            ctx.fillStyle = cam.triggered ? 'rgba(255,0,0,0.4)' : 'rgba(255,255,0,0.2)';
            ctx.beginPath();
            ctx.moveTo(mmX + cam.x * cellSize, mmY + cam.y * cellSize);
            const a1 = cam.angle - cam.coneAngle / 2;
            const a2 = cam.angle + cam.coneAngle / 2;
            ctx.lineTo(mmX + (cam.x + Math.cos(a1) * cam.coneLen) * cellSize, mmY + (cam.y + Math.sin(a1) * cam.coneLen) * cellSize);
            ctx.lineTo(mmX + (cam.x + Math.cos(a2) * cam.coneLen) * cellSize, mmY + (cam.y + Math.sin(a2) * cam.coneLen) * cellSize);
            ctx.closePath();
            ctx.fill();
            
            // Camera dot
            ctx.fillStyle = cam.triggered ? '#ff0' : '#cc0';
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
        ctx.fillStyle = exitUnlocked ? '#0f0' : '#f00';
        ctx.fillRect(mmX + 10 * cellSize, mmY + 19 * cellSize, cellSize * 1.5, cellSize);
        
        // Granny
        ctx.fillStyle = granny.alerted ? '#f00' : '#f88';
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
            ctx.fillStyle = player.keys.includes(i) ? KEY_COLORS[i] : '#333';
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
        ctx.fillText('❤', heartX, heartY);
        // Heart bar
        ctx.fillStyle = '#333';
        ctx.fillRect(heartX + 18, heartY - 10, 80, 10);
        const barColor = heartRate > 0.7 ? '#f00' : heartRate > 0.4 ? '#fa0' : '#0c0';
        ctx.fillStyle = barColor;
        ctx.fillRect(heartX + 18, heartY - 10, 80 * heartRate, 10);
        // Pulsing border
        if (heartRate > 0.5) {
            ctx.strokeStyle = 'rgba(255,0,0,' + (0.3 + 0.3 * Math.sin(Date.now() * 0.01 * (1 + heartRate * 3))) + ')';
            ctx.lineWidth = 2;
            ctx.strokeRect(heartX + 17, heartY - 11, 82, 12);
        }
        
        // Warning text
        if (granny.alerted) {
            ctx.save();
            ctx.font = 'bold 18px monospace';
            ctx.fillStyle = 'rgba(255,50,50,' + (0.5 + 0.5 * Math.sin(Date.now() * 0.008)) + ')';
            ctx.textAlign = 'center';
            ctx.fillText('⚠ GRANNY IS COMING! ⚠', W / 2, 30);
            ctx.restore();
        }
        
        // Timer
        ctx.font = '14px monospace';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.fillText('Time: ' + Math.floor(elapsedTime / 60) + 's', 10, 20);
        
        // Exit hint
        if (player.keys.length === 3 && !exitUnlocked) {
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
        if (!isWall(Math.floor(newX + margin), Math.floor(player.y)) && !isWall(Math.floor(newX - margin), Math.floor(player.y))) player.x = newX;
        if (!isWall(Math.floor(player.x), Math.floor(newY + margin)) && !isWall(Math.floor(player.x), Math.floor(newY - margin))) player.y = newY;
        
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
                if (disp) disp.textContent = 'Keys: ' + player.keys.length + '/3';
                
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
            ctx.fillStyle = 'rgba(255,0,0,' + (Math.random() * 0.03) + ')';
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
            ctx.fillStyle = selected ? diffColors[i] : '#222';
            ctx.strokeStyle = diffColors[i];
            ctx.lineWidth = 2;
            ctx.fillRect(bx, btnY, btnW, btnH);
            ctx.strokeRect(bx, btnY, btnW, btnH);
            ctx.fillStyle = selected ? '#fff' : '#888';
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
        ctx.fillText('▶ START', W / 2, startY + startH / 2 + 8);
        
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
        ctx.fillStyle = 'rgba(255,0,0,' + flashAlpha * 0.3 + ')';
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
        ctx.fillText('Survived: ' + timeScore + 's | Keys: ' + player.keys.length + '/3', W / 2, H * 0.52);
        
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
        ctx.fillText('🔄 RETRY', W / 2, btnY + btnH / 2 + 7);
        
        // Menu button
        const m2Y = btnY + btnH + 15;
        ctx.fillStyle = '#444';
        ctx.fillRect(btnX, m2Y, btnW, btnH);
        ctx.strokeStyle = '#888';
        ctx.strokeRect(btnX, m2Y, btnW, btnH);
        ctx.fillStyle = '#fff';
        ctx.fillText('🏠 MENU', W / 2, m2Y + btnH / 2 + 7);
        
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
        ctx.fillText('🎉 Freedom at last! 🎉', W / 2, H * 0.38);
        
        const timeScore = Math.floor(elapsedTime / 60);
        const best = getHigh('granny');
        const isNewBest = best === 0 || timeScore < best;
        if (isNewBest && timeScore > 0) setHigh('granny', timeScore);
        const currentBest = getHigh('granny');
        
        ctx.fillText('Escape Time: ' + timeScore + 's', W / 2, H * 0.48);
        ctx.fillStyle = isNewBest ? '#ff0' : '#8f8';
        ctx.fillText('🏆 Best: ' + currentBest + 's' + (isNewBest ? ' — NEW RECORD!' : ''), W / 2, H * 0.55);
        
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
        ctx.fillText('🔄 PLAY AGAIN', W / 2, btnY + btnH / 2 + 7);
        
        const m2Y = btnY + btnH + 15;
        ctx.fillStyle = '#444';
        ctx.fillRect(btnX, m2Y, btnW, btnH);
        ctx.strokeStyle = '#888';
        ctx.strokeRect(btnX, m2Y, btnW, btnH);
        ctx.fillStyle = '#fff';
        ctx.fillText('🏠 MENU', W / 2, m2Y + btnH / 2 + 7);
        
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
        
        if (phase === 'menu' && canvas._menuBtns) {
            canvas._menuBtns.diffs.forEach(b => {
                if (inBtn(pos, b)) { difficulty = b.d; }
            });
            if (inBtn(pos, canvas._menuBtns.start)) {
                startGame();
            }
        }
        
        if (phase === 'gameover' && canvas._gameoverBtns) {
            if (inBtn(pos, canvas._gameoverBtns.retry)) { startGame(); }
            if (inBtn(pos, canvas._gameoverBtns.menu)) { phase = 'menu'; }
        }
        
        if (phase === 'win' && canvas._winBtns) {
            if (inBtn(pos, canvas._winBtns.retry)) { startGame(); }
            if (inBtn(pos, canvas._winBtns.menu)) { phase = 'menu'; }
        }
    }
    
    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('touchstart', function(e) {
        if (phase !== 'playing') {
            onCanvasClick(e);
        }
    }, { passive: true });
    
    // Keyboard controls
    function onKeyDown(e) {
        keysDown[e.code] = true;
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
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
