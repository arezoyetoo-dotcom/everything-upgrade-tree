// Everything Upgrade Tree - Infinite 2D Canvas & Constellation Renderer (Canon EUT Edition)

function getNodeDefs() {
  if (typeof window !== 'undefined' && window.NODE_DEFS) return window.NODE_DEFS;
  if (typeof NODE_DEFS !== 'undefined') return NODE_DEFS;
  if (typeof global !== 'undefined' && global.NODE_DEFS) return global.NODE_DEFS;
  return {};
}

class InfiniteCanvas {
  constructor(containerEl, engine) {
    this.container = containerEl;
    this.engine = engine;

    // Viewport & Camera — centered directly on node_1 (0, 0)
    this.camera = { x: 0, y: 0, zoom: 1.0 };
    this.minZoom = 0.25;
    this.maxZoom = 2.4;

    // Canvas & Contexts
    this.bgCanvas = document.getElementById('bgCanvas');
    this.bgCtx = this.bgCanvas ? this.bgCanvas.getContext('2d') : null;

    this.wireCanvas = document.getElementById('wireCanvas');
    this.wireCtx = this.wireCanvas ? this.wireCanvas.getContext('2d') : null;

    this.nodeLayer = document.getElementById('nodeLayer');
    this.floatingLayer = document.getElementById('floatingLayer');
    this.minimapCanvas = document.getElementById('minimapCanvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

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
    const count = 350;
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * 7000,
        y: Math.random() * 3000 - 600,
        size: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        color: ['#00f0ff', '#ffffff', '#ffb703', '#7209b7', '#38bdf8', '#f72585'][Math.floor(Math.random() * 6)]
      });
    }
  }

  resize() {
    const w = this.container.clientWidth || window.innerWidth || 1200;
    const h = this.container.clientHeight || (window.innerHeight - 64) || 800;

    if (this.bgCanvas) {
      this.bgCanvas.width = Math.max(300, w);
      this.bgCanvas.height = Math.max(300, h);
    }

    if (this.wireCanvas) {
      this.wireCanvas.width = Math.max(300, w);
      this.wireCanvas.height = Math.max(300, h);
    }

    this.render();
  }

  setupEvents() {
    window.addEventListener('resize', () => this.resize());

    // Mouse Drag Pan
    this.container.addEventListener('mousedown', (e) => {
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

      const worldBefore = this.screenToWorld(mouseX, mouseY);
      const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.camera.zoom * zoomFactor));
      this.camera.zoom = newZoom;

      const worldAfter = this.screenToWorld(mouseX, mouseY);
      this.camera.x -= (worldAfter.x - worldBefore.x);
      this.camera.y -= (worldAfter.y - worldBefore.y);

      this.render();
    }, { passive: false });

    // Touch Support
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
    if (this.minimapCanvas) {
      this.minimapCanvas.addEventListener('click', (e) => {
        const rect = this.minimapCanvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const mapW = 1600;
        const mapH = 2200;
        const targetWorldX = (mx / this.minimapCanvas.width - 0.5) * mapW;
        const targetWorldY = (my / this.minimapCanvas.height) * mapH - 200;

        this.camera.x = targetWorldX;
        this.camera.y = targetWorldY;
        this.render();
      });
    }
  }

  screenToWorld(sx, sy) {
    const w = this.container.clientWidth || window.innerWidth || 1200;
    const h = this.container.clientHeight || (window.innerHeight - 64) || 800;
    const cx = isNaN(this.camera.x) ? 0 : this.camera.x;
    const cy = isNaN(this.camera.y) ? 0 : this.camera.y;
    const zoom = (isNaN(this.camera.zoom) || !this.camera.zoom) ? 1.0 : this.camera.zoom;
    return {
      x: (sx - w / 2) / zoom + cx,
      y: (sy - h / 2) / zoom + cy
    };
  }

  worldToScreen(wx, wy) {
    const w = this.container.clientWidth || window.innerWidth || 1200;
    const h = this.container.clientHeight || (window.innerHeight - 64) || 800;
    const cx = isNaN(this.camera.x) ? 0 : this.camera.x;
    const cy = isNaN(this.camera.y) ? 0 : this.camera.y;
    const zoom = (isNaN(this.camera.zoom) || !this.camera.zoom) ? 1.0 : this.camera.zoom;
    return {
      x: (wx - cx) * zoom + w / 2,
      y: (wy - cy) * zoom + h / 2
    };
  }

  centerCamera() {
    this.camera.x = 0;
    this.camera.y = 0;
    this.camera.zoom = 1.0;
    this.render();
  }

  getCurrencySymbol(currency) {
    switch (currency) {
      case 'matter': return '₽';
      case 'research': return 'λ';
      case 'prestige': return '₹';
      case 'transcend': return 'τ';
      case 'bits': return '฿';
      case 'pointX': return '₽X';
      case 'qubits': return 'Ψ';
      case 'starMass': return '☉';
      case 'euros': return '€';
      default: return '₽';
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
    const defs = getNodeDefs();
    const sDef = defs['node_1'] || { x: 0, y: 0 };
    const sPos = this.worldToScreen(sDef.x, sDef.y);

    // If node_1 is not owned, auto-unlock it on click!
    if (!this.engine.upgrades['node_1']) {
      this.engine.buyNode('node_1');
    }

    const res = this.engine.clickSingularity();

    if (window.soundEngine) {
      window.soundEngine.playClick(res.comboMult, res.isCrit);
    }

    const txt = `+${res.amount.format(1)} ₽` + (res.isCrit ? ' ⚡ CRIT!' : '') + (res.xp > 1 ? ` (+${res.xp} XP)` : '');
    this.spawnFloatingText(txt, sPos.x, sPos.y, res.isCrit);

    // Depress node physically
    const singEl = document.querySelector('.node-element[data-node="node_1"]');
    if (singEl) {
      singEl.classList.add('node-depressed');
      setTimeout(() => singEl.classList.remove('node-depressed'), 80);
    }

    this.render();
  }

  // -------------------------------------------------------------
  // Node Discovery / Visibility Filter
  // -------------------------------------------------------------
  isNodeDiscovered(nodeId) {
    if (this.engine.isNodeUnlocked(nodeId)) return true;
    const defs = getNodeDefs();
    const def = defs[nodeId];
    if (!def) return false;
    const req = def.requires || def.prerequisites;
    if (!req) return true;
    const parentIds = Array.isArray(req) ? req : Object.keys(req);
    if (parentIds.length === 0) return true;
    // Discovered if ANY prerequisite parent is unlocked or purchased
    return parentIds.some(pId => (this.engine.upgrades[pId] || 0) > 0 || this.engine.isNodeUnlocked(pId));
  }

  // -------------------------------------------------------------
  // Update Loop
  // -------------------------------------------------------------
  update(dt) {
    if (isNaN(dt) || dt <= 0) dt = 0.016;
    if (isNaN(this.camera.x)) this.camera.x = 0;
    if (isNaN(this.camera.y)) this.camera.y = 0;
    if (!this.camera.zoom || isNaN(this.camera.zoom)) this.camera.zoom = 1.0;

    // Keyboard camera panning
    const panSpeed = (360 / this.camera.zoom) * dt;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.camera.x -= panSpeed;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) this.camera.x += panSpeed;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) this.camera.y -= panSpeed;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) this.camera.y += panSpeed;

    // Particle updates
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= dt * 1.2;
      p.scale = Math.max(0.6, p.scale - dt * 0.4);
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

  // 1. Cosmic Parallax Background
  renderBackground() {
    if (!this.bgCanvas || !this.bgCtx) return;
    const w = this.bgCanvas.width || 1200;
    const h = this.bgCanvas.height || 800;
    const ctx = this.bgCtx;

    ctx.clearRect(0, 0, w, h);

    // Deep void space gradient with safe radius
    const maxDim = Math.max(100, Math.max(w, h));
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, maxDim);
    bgGrad.addColorStop(0, '#0a0812');
    bgGrad.addColorStop(0.6, '#060509');
    bgGrad.addColorStop(1, '#020204');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Parallax Starfield
    ctx.save();
    for (const star of this.stars) {
      const sx = (star.x - this.camera.x * 0.35) * this.camera.zoom + w / 2;
      const sy = (star.y - this.camera.y * 0.35) * this.camera.zoom + h / 2;

      const modX = ((sx % w) + w) % w;
      const modY = ((sy % h) + h) % h;

      ctx.fillStyle = star.color;
      ctx.globalAlpha = star.alpha;
      ctx.beginPath();
      ctx.arc(modX, modY, star.size * Math.max(0.7, this.camera.zoom * 0.8), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Cosmic Grid lines with safe step
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.035)';
    ctx.lineWidth = 1;
    const gridSize = Math.max(20, 100 * (this.camera.zoom || 1));
    const offsetX = ((w / 2 - this.camera.x * this.camera.zoom) % gridSize + gridSize) % gridSize;
    const offsetY = ((h / 2 - this.camera.y * this.camera.zoom) % gridSize + gridSize) % gridSize;

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

    // Origin crosshair (#1 Generic beginning)
    const origin = this.worldToScreen(0, 0);
    ctx.strokeStyle = 'rgba(255, 183, 3, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 45 * this.camera.zoom, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // 2. Constellation Connecting Lines & Pulses
  renderConnections() {
    if (!this.wireCanvas || !this.wireCtx) return;
    const w = this.wireCanvas.width || 1200;
    const h = this.wireCanvas.height || 800;
    const ctx = this.wireCtx;
    const defs = getNodeDefs();

    ctx.clearRect(0, 0, w, h);

    const visibleNodeIds = Object.keys(defs).filter(id => this.isNodeDiscovered(id));

    visibleNodeIds.forEach(childId => {
      const childDef = defs[childId];
      if (!childDef || !childDef.requires) return;

      Object.keys(childDef.requires).forEach(parentId => {
        const parentDef = defs[parentId];
        if (!parentDef) return;

        const p1 = this.worldToScreen(parentDef.x, parentDef.y);
        const p2 = this.worldToScreen(childDef.x, childDef.y);

        const childLevel = this.engine.upgrades[childId] || 0;
        const isChildActive = childLevel > 0;
        const isChildUnlocked = this.engine.isNodeUnlocked(childId);

        ctx.save();
        if (isChildActive) {
          // Fully active wire
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = Math.max(2.5, 3.5 * this.camera.zoom);
          ctx.shadowColor = 'rgba(0, 240, 255, 0.75)';
          ctx.shadowBlur = 10 * this.camera.zoom;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Animated energy pulse particle
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
        } else if (isChildUnlocked) {
          // Unlocked wire
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
          ctx.lineWidth = Math.max(1.5, 2.2 * this.camera.zoom);
          ctx.setLineDash([6 * this.camera.zoom, 4 * this.camera.zoom]);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        } else {
          // Discovered but locked wire
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = Math.max(1.0, 1.5 * this.camera.zoom);
          ctx.setLineDash([4 * this.camera.zoom, 6 * this.camera.zoom]);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.restore();
      });
    });
  }

  // 3. Physical DOM Nodes
  renderNodes() {
    if (!this.nodeLayer) return;
    const existingNodeEls = this.nodeLayer.querySelectorAll('.node-element');
    const existingMap = new Map();
    existingNodeEls.forEach(el => existingMap.set(el.dataset.node, el));
    const defs = getNodeDefs();

    Object.keys(defs).forEach(nodeId => {
      const def = defs[nodeId];
      const isVisible = this.isNodeDiscovered(nodeId);

      if (!isVisible) {
        if (existingMap.has(nodeId)) {
          existingMap.get(nodeId).remove();
        }
        return;
      }

      const sPos = this.worldToScreen(def.x, def.y);
      const level = this.engine.upgrades[nodeId] || 0;
      const maxLvl = this.engine.getNodeMaxLevel(nodeId);
      const isMaxed = maxLvl > 0 && level >= maxLvl;
      const isUnlocked = this.engine.isNodeUnlocked(nodeId);
      const canAfford = isUnlocked && this.engine.canAffordNode(nodeId);

      let el = existingMap.get(nodeId);
      if (!el) {
        el = this.createNodeElement(nodeId, def);
        this.nodeLayer.appendChild(el);
      }

      el.style.transform = `translate3d(${sPos.x}px, ${sPos.y}px, 0) translate(-50%, -50%) scale(${this.camera.zoom})`;

      el.classList.toggle('node-affordable', canAfford && !isMaxed);
      el.classList.toggle('node-maxed', isMaxed);
      el.classList.toggle('node-locked', !canAfford && !isMaxed);
      el.classList.toggle('node-discovered-locked', !isUnlocked);
      el.classList.toggle('node-singularity', !!def.isManualClicker);

      // Update Level Display
      const lvlBadge = el.querySelector('.node-lvl-text');
      if (lvlBadge) {
        if (def.isManualClicker) {
          lvlBadge.textContent = 'CORE';
        } else if (isMaxed) {
          lvlBadge.textContent = 'MAX';
        } else if (maxLvl > 1) {
          lvlBadge.textContent = `${level}/${maxLvl}`;
        } else if (level > 0) {
          lvlBadge.textContent = 'ACTIVE';
        } else if (isUnlocked) {
          lvlBadge.textContent = 'UNLOCKED';
        } else {
          lvlBadge.textContent = 'LOCKED';
        }
      }

      // Update Cost Display
      const costBadge = el.querySelector('.node-cost-text');
      if (costBadge) {
        if (isMaxed) {
          costBadge.textContent = 'OWNED';
        } else if (def.isManualClicker) {
          costBadge.textContent = 'FREE';
        } else {
          const cost = this.engine.getNodeCost(nodeId);
          const symbol = this.getCurrencySymbol(def.currency);
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

    const currencySymbol = this.getCurrencySymbol(def.currency);

    el.innerHTML = `
      <div class="node-halo"></div>
      <div class="node-shell">
        <div class="node-icon">${def.icon}</div>
        <div class="node-body">
          <div class="node-num-tag">${def.num}</div>
          <div class="node-title">${def.name}</div>
          <div class="node-meta">
            <span class="node-lvl-badge node-lvl-text">LVL 0</span>
            <span class="node-cost-badge node-cost-text">0 ${currencySymbol}</span>
          </div>
        </div>
      </div>
      <div class="node-tooltip">
        <div class="tt-tag">${def.num} • ${def.tag || 'UPGRADE'}</div>
        <div class="tt-title">${def.name}</div>
        <div class="tt-lore">${def.lore}</div>
        <div class="tt-divider"></div>
        <div class="tt-effect" id="tt-effect-${nodeId}">Effect: ${typeof def.effectDescription === 'function' ? def.effectDescription(this.engine.upgrades[nodeId] || 0, this.engine) : def.effectDescription}</div>
      </div>
    `;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const curLvl = this.engine.upgrades[nodeId] || 0;
      const maxLvl = this.engine.getNodeMaxLevel(nodeId);

      // Core singularity clicker (#1 Generic beginning)
      if (def.isManualClicker) {
        if (!curLvl && this.engine.canAffordNode(nodeId)) {
          this.engine.buyNode(nodeId);
        }
        this.triggerSingularityClick();
        return;
      }

      // If already purchased / maxed, clicking opens interactive center
      if (maxLvl > 0 && curLvl >= maxLvl) {
        if (nodeId === 'node_0d' && window.openDonationModal) return window.openDonationModal();
        if (nodeId === 'node_8' && window.openResearchModal) return window.openResearchModal();
        if (nodeId === 'node_9' && window.openBoomboxModal) return window.openBoomboxModal();
        if (nodeId === 'node_16' && window.openLevelingModal) return window.openLevelingModal();
        if (nodeId === 'node_18' && window.openBonusModal) return window.openBonusModal();
        if (nodeId === 'node_20' && window.openLeaderboardModal) return window.openLeaderboardModal();
        if (nodeId === 'node_40' && window.openHardcoreModal) return window.openHardcoreModal();
      }

      const bought = this.engine.buyNode(nodeId);
      if (bought) {
        if (window.soundEngine) {
          const newLvl = this.engine.upgrades[nodeId] || 0;
          const isNowMaxed = maxLvl > 0 && newLvl >= maxLvl;
          if (isNowMaxed) window.soundEngine.playMaxed();
          else window.soundEngine.playBuy();
        }

        el.classList.add('node-purchased-pulse');
        setTimeout(() => el.classList.remove('node-purchased-pulse'), 250);

        const sPos = this.worldToScreen(def.x, def.y);
        this.spawnFloatingText('UNLOCKED! ✦', sPos.x, sPos.y, false);

        this.render();

        // Auto-launch interactive modal upon purchase
        if (nodeId === 'node_0d' && window.openDonationModal) setTimeout(window.openDonationModal, 300);
        if (nodeId === 'node_9' && window.openBoomboxModal) setTimeout(window.openBoomboxModal, 300);
        if (nodeId === 'node_16' && window.openLevelingModal) setTimeout(window.openLevelingModal, 300);
        if (nodeId === 'node_18' && window.openBonusModal) setTimeout(window.openBonusModal, 300);
        if (nodeId === 'node_20' && window.openLeaderboardModal) setTimeout(window.openLeaderboardModal, 300);
        if (nodeId === 'node_40' && window.openHardcoreModal) setTimeout(window.openHardcoreModal, 300);
      }
    });

    el.addEventListener('mouseenter', () => {
      const effectEl = el.querySelector('#tt-effect-' + nodeId);
      if (effectEl) {
        const lvl = this.engine.upgrades[nodeId] || 0;
        effectEl.textContent = 'Effect: ' + (typeof def.effectDescription === 'function' ? def.effectDescription(lvl, this.engine) : def.effectDescription);
      }
    });

    return el;
  }

  // 4. Floating Text Numbers
  renderFloatingText() {
    if (!this.floatingLayer) return;
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
    if (!this.minimapCanvas || !this.minimapCtx) return;
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    const defs = getNodeDefs();

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#08070d';
    ctx.fillRect(0, 0, w, h);

    const mapW = 1600;
    const mapH = 2200;
    const scaleX = w / mapW;
    const scaleY = h / mapH;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.stroke();

    Object.keys(defs).forEach(id => {
      if (!this.isNodeDiscovered(id)) return;
      const def = defs[id];

      const mx = (def.x / mapW + 0.5) * w;
      const my = ((def.y + 200) / mapH) * h;

      ctx.fillStyle = def.isManualClicker ? '#ffb703' : (def.currency === 'matter' ? '#00f0ff' : (def.currency === 'research' ? '#f72585' : '#7209b7'));
      ctx.beginPath();
      ctx.arc(mx, my, def.isManualClicker ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Viewport camera frustum box
    const cw = ((this.container.clientWidth || 1200) / this.camera.zoom) * scaleX;
    const ch = ((this.container.clientHeight || 800) / this.camera.zoom) * scaleY;
    const cx = (this.camera.x / mapW + 0.5) * w - cw / 2;
    const cy = ((this.camera.y + 200) / mapH) * h - ch / 2;

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
