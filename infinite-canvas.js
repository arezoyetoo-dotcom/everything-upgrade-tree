// Everything Upgrade Tree - Infinite 2D Canvas & Constellation Renderer
class InfiniteCanvas {
  constructor(containerEl, engine) {
    this.container = containerEl;
    this.engine = engine;

    // Viewport & Camera
    this.camera = { x: 0, y: 0, zoom: 1.0 };
    this.targetZoom = 1.0;
    this.minZoom = 0.35;
    this.maxZoom = 2.2;

    // Canvas & Contexts
    this.bgCanvas = document.getElementById('bgCanvas');
    this.bgCtx = this.bgCanvas.getContext('2d');

    this.wireCanvas = document.getElementById('wireCanvas');
    this.wireCtx = this.wireCanvas.getContext('2d');

    this.nodeLayer = document.getElementById('nodeLayer');
    this.floatingLayer = document.getElementById('floatingLayer');
    this.minimapCanvas = document.getElementById('minimapCanvas');
    this.minimapCtx = this.minimapCanvas.getContext('2d');

    // Pan interaction state
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.cameraStart = { x: 0, y: 0 };
    this.hasDragged = false;

    // Parallax background stars
    this.stars = [];
    this.initStars();

    // Floating text particles
    this.particles = [];

    // Animated energy packet pulses along connection lines
    this.linePulseTime = 0;

    // Keyboard state
    this.keys = {};

    this.setupEvents();
    this.resize();
  }

  initStars() {
    this.stars = [];
    const count = 300;
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * 6000,
        y: (Math.random() - 0.5) * 6000,
        size: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        color: ['#00f0ff', '#ffffff', '#ffb703', '#7209b7', '#38bdf8'][Math.floor(Math.random() * 5)]
      });
    }
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    this.bgCanvas.width = w;
    this.bgCanvas.height = h;

    this.wireCanvas.width = w;
    this.wireCanvas.height = h;

    this.render();
  }

  setupEvents() {
    window.addEventListener('resize', () => this.resize());

    // Mouse Drag Pan
    this.container.addEventListener('mousedown', (e) => {
      // Don't drag if clicking directly on an active interactive button inside a node
      if (e.target.closest('.node-element') && !e.target.classList.contains('node-drag-handle')) {
        return;
      }
      this.isDragging = true;
      this.hasDragged = false;
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.cameraStart = { x: this.camera.x, y: this.camera.y };
      this.container.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = (e.clientX - this.dragStart.x) / this.camera.zoom;
      const dy = (e.clientY - this.dragStart.y) / this.camera.zoom;

      if (Math.hypot(dx, dy) > 4) {
        this.hasDragged = true;
      }

      this.camera.x = this.cameraStart.x - dx;
      this.camera.y = this.cameraStart.y - dy;
      this.render();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.container.style.cursor = 'default';
      }
    });

    // Mouse Wheel Zoom
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      const mouseX = e.clientX - this.container.offsetLeft;
      const mouseY = e.clientY - this.container.offsetTop;

      // World point under cursor before zoom
      const worldBefore = this.screenToWorld(mouseX, mouseY);

      // Apply zoom limits
      const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.camera.zoom * zoomFactor));
      this.camera.zoom = newZoom;

      // Adjust camera so mouse cursor stays on the same world coordinate
      const worldAfter = this.screenToWorld(mouseX, mouseY);
      this.camera.x -= (worldAfter.x - worldBefore.x);
      this.camera.y -= (worldAfter.y - worldBefore.y);

      this.render();
    }, { passive: false });

    // Touch Support (Single touch pan, pinch zoom)
    let touchDist = 0;
    this.container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this.cameraStart = { x: this.camera.x, y: this.camera.y };
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        touchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });

    this.container.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        const dx = (e.touches[0].clientX - this.dragStart.x) / this.camera.zoom;
        const dy = (e.touches[0].clientY - this.dragStart.y) / this.camera.zoom;
        this.camera.x = this.cameraStart.x - dx;
        this.camera.y = this.cameraStart.y - dy;
        this.render();
      } else if (e.touches.length === 2) {
        const newDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = newDist / (touchDist || 1);
        this.camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.camera.zoom * factor));
        touchDist = newDist;
        this.render();
      }
    });

    this.container.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Keyboard Pan Controls
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      this.keys[e.code] = true;

      if (e.code === 'KeyC') {
        this.centerCamera();
      }
      if (e.code === 'Space') {
        e.preventDefault();
        this.triggerSingularityClick();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Minimap click to pan
    this.minimapCanvas.addEventListener('click', (e) => {
      const rect = this.minimapCanvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // Minimap spans -1200 to +1200
      const mapRange = 2400;
      const targetWorldX = (mx / this.minimapCanvas.width - 0.5) * mapRange;
      const targetWorldY = (my / this.minimapCanvas.height - 0.5) * mapRange;

      this.camera.x = targetWorldX;
      this.camera.y = targetWorldY;
      this.render();
    });
  }

  screenToWorld(sx, sy) {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    return {
      x: (sx - w / 2) / this.camera.zoom + this.camera.x,
      y: (sy - h / 2) / this.camera.zoom + this.camera.y
    };
  }

  worldToScreen(wx, wy) {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    return {
      x: (wx - this.camera.x) * this.camera.zoom + w / 2,
      y: (wy - this.camera.y) * this.camera.zoom + h / 2
    };
  }

  centerCamera() {
    this.camera.x = 0;
    this.camera.y = 0;
    this.camera.zoom = 1.0;
    this.render();
  }

  focusNode(nodeId) {
    const def = NODE_DEFS[nodeId];
    if (def) {
      this.camera.x = def.x;
      this.camera.y = def.y;
      this.render();
    }
  }

  // -------------------------------------------------------------
  // Particle Numbers
  // -------------------------------------------------------------
  spawnFloatingText(text, screenX, screenY, isCrit = false) {
    this.particles.push({
      text,
      x: screenX + (Math.random() - 0.5) * 20,
      y: screenY - 20,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(Math.random() * 2 + 2.5),
      alpha: 1.0,
      scale: isCrit ? 1.4 : 1.0,
      color: isCrit ? '#ffb703' : '#00f0ff',
      isCrit
    });
  }

  triggerSingularityClick() {
    const singDef = NODE_DEFS['singularity'];
    const sPos = this.worldToScreen(singDef.x, singDef.y);
    const res = this.engine.clickSingularity();

    if (window.soundEngine) {
      window.soundEngine.playClick();
    }

    const txt = res.isCrit ? `CRIT! +${res.amount.format(1)}` : `+${res.amount.format(1)}`;
    this.spawnFloatingText(txt, sPos.x, sPos.y, res.isCrit);

    // Depress node physically
    const singEl = document.querySelector('.node-element[data-node="singularity"]');
    if (singEl) {
      singEl.classList.add('node-depressed');
      setTimeout(() => singEl.classList.remove('node-depressed'), 80);
    }

    this.render();
  }

  // -------------------------------------------------------------
  // Main Rendering Loop
  // -------------------------------------------------------------
  update(dt) {
    // Keyboard Pan smooth inertia
    const panSpeed = 600 * dt / this.camera.zoom;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.camera.x -= panSpeed;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) this.camera.x += panSpeed;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) this.camera.y -= panSpeed;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) this.camera.y += panSpeed;

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= dt * 1.2;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    this.linePulseTime += dt * 2.5;
  }

  render() {
    this.renderBackground();
    this.renderConnections();
    this.renderNodes();
    this.renderFloatingText();
    this.renderMinimap();
  }

  // 1. Parallax Cosmic Background
  renderBackground() {
    const w = this.bgCanvas.width;
    const h = this.bgCanvas.height;
    const ctx = this.bgCtx;

    ctx.clearRect(0, 0, w, h);

    // Deep void space gradient
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, Math.max(w, h));
    bgGrad.addColorStop(0, '#0a0812');
    bgGrad.addColorStop(0.6, '#060509');
    bgGrad.addColorStop(1, '#020204');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Parallax Starfield
    ctx.save();
    for (const star of this.stars) {
      // Parallax offset based on camera
      const sx = (star.x - this.camera.x * 0.4) * this.camera.zoom + w / 2;
      const sy = (star.y - this.camera.y * 0.4) * this.camera.zoom + h / 2;

      // Wrap around screen boundaries for infinite feel
      const modX = ((sx % w) + w) % w;
      const modY = ((sy % h) + h) % h;

      ctx.fillStyle = star.color;
      ctx.globalAlpha = star.alpha;
      ctx.beginPath();
      ctx.arc(modX, modY, star.size * Math.max(0.7, this.camera.zoom * 0.8), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Cosmic Grid lines
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.035)';
    ctx.lineWidth = 1;
    const gridSize = 100 * this.camera.zoom;
    const offsetX = (w / 2 - this.camera.x * this.camera.zoom) % gridSize;
    const offsetY = (h / 2 - this.camera.y * this.camera.zoom) % gridSize;

    for (let x = offsetX; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = offsetY; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Origin crosshair
    const origin = this.worldToScreen(0, 0);
    ctx.strokeStyle = 'rgba(255, 183, 3, 0.2)';
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 14 * this.camera.zoom, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 2. Thick Glowing Energy Connection Wires
  renderConnections() {
    const w = this.wireCanvas.width;
    const h = this.wireCanvas.height;
    const ctx = this.wireCtx;

    ctx.clearRect(0, 0, w, h);

    const unlockedNodes = Object.keys(NODE_DEFS).filter(id => this.engine.isNodeUnlocked(id));

    unlockedNodes.forEach(childId => {
      const childDef = NODE_DEFS[childId];
      if (!childDef.requires) return;

      Object.keys(childDef.requires).forEach(parentId => {
        const parentDef = NODE_DEFS[parentId];
        if (!parentDef) return;

        const p1 = this.worldToScreen(parentDef.x, parentDef.y);
        const p2 = this.worldToScreen(childDef.x, childDef.y);

        const childLevel = this.engine.upgrades[childId] || 0;
        const isChildActive = childLevel > 0;

        ctx.save();
        if (isChildActive) {
          // Solid, thick glowing neon energy line
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = Math.max(2.5, 3.5 * this.camera.zoom);
          ctx.shadowColor = 'rgba(0, 240, 255, 0.7)';
          ctx.shadowBlur = 10 * this.camera.zoom;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Animated energy pulse particle flowing from parent to child
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          if (dist > 10) {
            const progress = (this.linePulseTime % 1.0);
            const px = p1.x + (p2.x - p1.x) * progress;
            const py = p1.y + (p2.y - p1.y) * progress;

            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(px, py, 3.5 * this.camera.zoom, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Unpurchased line: dashed, dim, anticipation
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
          ctx.lineWidth = Math.max(1.5, 2 * this.camera.zoom);
          ctx.setLineDash([8 * this.camera.zoom, 6 * this.camera.zoom]);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.restore();
      });
    });
  }

  // 3. Physical DOM / Canvas Nodes
  renderNodes() {
    const existingNodeEls = this.nodeLayer.querySelectorAll('.node-element');
    const existingMap = new Map();
    existingNodeEls.forEach(el => existingMap.set(el.dataset.node, el));

    Object.keys(NODE_DEFS).forEach(nodeId => {
      const def = NODE_DEFS[nodeId];
      const isUnlocked = this.engine.isNodeUnlocked(nodeId);

      if (!isUnlocked) {
        // Remove from DOM if hidden
        if (existingMap.has(nodeId)) {
          existingMap.get(nodeId).remove();
        }
        return;
      }

      const sPos = this.worldToScreen(def.x, def.y);
      const level = this.engine.upgrades[nodeId] || 0;
      const isMaxed = def.maxLevel > 0 && level >= def.maxLevel;
      const canAfford = this.engine.canAffordNode(nodeId);

      let el = existingMap.get(nodeId);
      if (!el) {
        el = this.createNodeElement(nodeId, def);
        this.nodeLayer.appendChild(el);
      }

      // Position and Scale
      el.style.transform = `translate3d(${sPos.x}px, ${sPos.y}px, 0) translate(-50%, -50%) scale(${this.camera.zoom})`;

      // Update State Classes
      el.classList.toggle('node-affordable', canAfford && !isMaxed);
      el.classList.toggle('node-maxed', isMaxed);
      el.classList.toggle('node-locked', !canAfford && !isMaxed);
      el.classList.toggle('node-singularity', !!def.isManualClicker);

      // Update Level Display
      const lvlBadge = el.querySelector('.node-lvl-text');
      if (lvlBadge) {
        if (def.isManualClicker) {
          lvlBadge.textContent = 'CORE';
        } else if (isMaxed) {
          lvlBadge.textContent = 'MAX';
        } else if (def.maxLevel > 0) {
          lvlBadge.textContent = `${level}/${def.maxLevel}`;
        } else {
          lvlBadge.textContent = `LVL ${level}`;
        }
      }

      // Update Cost Display
      const costBadge = el.querySelector('.node-cost-text');
      if (costBadge) {
        if (isMaxed || def.isManualClicker) {
          costBadge.textContent = isMaxed ? 'COMPLETED' : 'CLICK ME';
        } else {
          const cost = this.engine.getNodeCost(nodeId);
          const symbol = def.currency === 'matter' ? '₽' : (def.currency === 'research' ? 'λ' : (def.currency === 'prestige' ? '₹' : 'τ'));
          costBadge.textContent = `${cost.format(1)} ${symbol}`;
        }
      }
    });
  }

  createNodeElement(nodeId, def) {
    const el = document.createElement('div');
    el.className = 'node-element';
    el.dataset.node = nodeId;
    el.dataset.category = def.category;

    const currencySymbol = def.currency === 'matter' ? '₽' : (def.currency === 'research' ? 'λ' : (def.currency === 'prestige' ? '₹' : 'τ'));

    el.innerHTML = `
      <div class="node-halo"></div>
      <div class="node-shell">
        <div class="node-icon">${def.icon}</div>
        <div class="node-body">
          <div class="node-title">${def.name}</div>
          <div class="node-meta">
            <span class="node-lvl-badge node-lvl-text">LVL 0</span>
            <span class="node-cost-badge node-cost-text">0 ${currencySymbol}</span>
          </div>
        </div>
      </div>
      <div class="node-tooltip">
        <div class="tt-tag">${def.tag || 'UPGRADE'}</div>
        <div class="tt-title">${def.name}</div>
        <div class="tt-lore">${def.lore}</div>
        <div class="tt-divider"></div>
        <div class="tt-effect" id="tt-effect-${nodeId}">Effect: ${typeof def.effectDescription === 'function' ? def.effectDescription(this.engine.upgrades[nodeId] || 0) : def.effectDescription}</div>
      </div>
    `;

    // Click behavior
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (def.isManualClicker) {
        this.triggerSingularityClick();
      } else {
        const bought = this.engine.buyNode(nodeId);
        if (bought) {
          if (window.soundEngine) {
            const isNowMaxed = def.maxLevel > 0 && this.engine.upgrades[nodeId] >= def.maxLevel;
            if (isNowMaxed) window.soundEngine.playMaxed();
            else window.soundEngine.playBuy();
          }

          // Node bounce animation
          el.classList.add('node-purchased-pulse');
          setTimeout(() => el.classList.remove('node-purchased-pulse'), 250);

          const sPos = this.worldToScreen(def.x, def.y);
          this.spawnFloatingText('UPGRADED! ✦', sPos.x, sPos.y, false);

          this.render();
        }
      }
    });

    // Dynamic Tooltip update on mouseenter
    el.addEventListener('mouseenter', () => {
      const effectEl = el.querySelector('#tt-effect-' + nodeId);
      if (effectEl) {
        const lvl = this.engine.upgrades[nodeId] || 0;
        effectEl.textContent = 'Effect: ' + (typeof def.effectDescription === 'function' ? def.effectDescription(lvl) : def.effectDescription);
      }
    });

    return el;
  }

  // 4. Floating Text Numbers
  renderFloatingText() {
    this.floatingLayer.innerHTML = '';
    this.particles.forEach(p => {
      const span = document.createElement('div');
      span.className = 'floating-number' + (p.isCrit ? ' crit-number' : '');
      span.textContent = p.text;
      span.style.left = `${p.x}px`;
      span.style.top = `${p.y}px`;
      span.style.opacity = p.alpha;
      span.style.transform = `translate(-50%, -50%) scale(${p.scale})`;
      this.floatingLayer.appendChild(span);
    });
  }

  // 5. Constellation Radar Minimap
  renderMinimap() {
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Minimap background
    ctx.fillStyle = '#08070d';
    ctx.fillRect(0, 0, w, h);

    // Map range is -1200 to +1200
    const mapRange = 2400;
    const scale = w / mapRange;

    // Center crosshair
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Render unlocked nodes
    Object.keys(NODE_DEFS).forEach(id => {
      if (!this.engine.isNodeUnlocked(id)) return;
      const def = NODE_DEFS[id];

      const mx = (def.x / mapRange + 0.5) * w;
      const my = (def.y / mapRange + 0.5) * h;

      ctx.fillStyle = def.isManualClicker ? '#ffb703' : (def.currency === 'matter' ? '#00f0ff' : (def.currency === 'research' ? '#f72585' : '#7209b7'));
      ctx.beginPath();
      ctx.arc(mx, my, def.isManualClicker ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Viewport camera frustum box
    const cw = (this.container.clientWidth / this.camera.zoom) * scale;
    const ch = (this.container.clientHeight / this.camera.zoom) * scale;
    const cx = (this.camera.x / mapRange + 0.5) * w - cw / 2;
    const cy = (this.camera.y / mapRange + 0.5) * h - ch / 2;

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx, cy, cw, ch);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { InfiniteCanvas };
} else {
  window.InfiniteCanvas = InfiniteCanvas;
}
