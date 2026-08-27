// ============ Nav scroll state + mobile toggle ============
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');
navToggle?.addEventListener('click', () => {
  navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============ Reveal on scroll (staggered) ============
const revealGroups = [
  document.querySelectorAll('.project-card'),
  document.querySelectorAll('.timeline-item'),
  document.querySelectorAll('.focus-item'),
  document.querySelectorAll('.skill-group')
];

revealGroups.forEach(group => {
  group.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = `opacity .6s ease ${i * 0.06}s, transform .6s ease ${i * 0.06}s`;
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealGroups.forEach(group => group.forEach(el => revealObserver.observe(el)));

// ============ Typed hero eyebrow ============
const typedEl = document.getElementById('typed-eyebrow');
const typedText = "SELECT * FROM engineers WHERE curiosity = 'unlimited';";
if (typedEl) {
  if (prefersReducedMotion) {
    typedEl.textContent = typedText;
  } else {
    let ti = 0;
    (function typeChar() {
      typedEl.textContent = typedText.slice(0, ti);
      ti++;
      if (ti <= typedText.length) setTimeout(typeChar, 22);
    })();
  }
}

// ============ Count up stats ============
const statNums = document.querySelectorAll('.stat-num');
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    if (prefersReducedMotion) {
      el.textContent = target + (target === 7 ? '+' : '');
      countObserver.unobserve(el);
      return;
    }
    let cur = 0;
    const step = Math.max(1, Math.round(target / 30));
    const tick = () => {
      cur += step;
      if (cur >= target) {
        el.textContent = target + (target === 7 ? '+' : '');
      } else {
        el.textContent = cur;
        requestAnimationFrame(tick);
      }
    };
    tick();
    countObserver.unobserve(el);
  });
}, { threshold: 0.6 });
statNums.forEach(el => countObserver.observe(el));

// ============ Magnetic buttons ============
if (!prefersReducedMotion) {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

// ============ Project card tilt ============
if (!prefersReducedMotion) {
  document.querySelectorAll('.project-card.tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${-py * 6}deg) rotateY(${px * 6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}

// ============ Ambient background: drifting node network ============
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas.getContext('2d');
let bgW, bgH, bgNodes = [];

function resizeBg() {
  bgW = bgCanvas.width = window.innerWidth;
  bgH = bgCanvas.height = window.innerHeight;
}
function initBgNodes() {
  const count = Math.min(70, Math.floor((bgW * bgH) / 22000));
  bgNodes = Array.from({ length: count }, () => ({
    x: Math.random() * bgW,
    y: Math.random() * bgH,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    r: Math.random() * 1.6 + 0.6
  }));
}
function drawBg() {
  bgCtx.clearRect(0, 0, bgW, bgH);
  const maxDist = 140;

  for (let i = 0; i < bgNodes.length; i++) {
    const n = bgNodes[i];
    n.x += n.vx; n.y += n.vy;
    if (n.x < 0 || n.x > bgW) n.vx *= -1;
    if (n.y < 0 || n.y > bgH) n.vy *= -1;
  }

  for (let i = 0; i < bgNodes.length; i++) {
    for (let j = i + 1; j < bgNodes.length; j++) {
      const a = bgNodes[i], b = bgNodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        bgCtx.strokeStyle = `rgba(51,224,196,${0.12 * (1 - dist / maxDist)})`;
        bgCtx.lineWidth = 1;
        bgCtx.beginPath();
        bgCtx.moveTo(a.x, a.y);
        bgCtx.lineTo(b.x, b.y);
        bgCtx.stroke();
      }
    }
  }

  bgNodes.forEach(n => {
    bgCtx.beginPath();
    bgCtx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    bgCtx.fillStyle = 'rgba(140,200,255,0.55)';
    bgCtx.fill();
  });

  if (!prefersReducedMotion) requestAnimationFrame(drawBg);
}

resizeBg();
initBgNodes();
drawBg();
window.addEventListener('resize', () => { resizeBg(); initBgNodes(); });

// ============ Node card mini pipeline animation ============
const nodeCanvas = document.getElementById('node-canvas');
const nCtx = nodeCanvas.getContext('2d');
let nW, nH;
const pipelineStages = ['ingest', 'clean', 'embed', 'retrieve', 'reason', 'respond'];
let pulseT = 0;

function resizeNodeCanvas() {
  const rect = nodeCanvas.getBoundingClientRect();
  nW = nodeCanvas.width = rect.width * devicePixelRatio;
  nH = nodeCanvas.height = rect.height * devicePixelRatio;
  nCtx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function drawPipeline() {
  const w = nodeCanvas.clientWidth, h = nodeCanvas.clientHeight;
  nCtx.clearRect(0, 0, w, h);

  const n = pipelineStages.length;
  const marginX = 36;
  const usable = w - marginX * 2;
  const points = pipelineStages.map((label, i) => ({
    x: marginX + (usable * i) / (n - 1),
    y: h / 2 + Math.sin(i * 1.3) * 26,
    label
  }));

  // connecting line
  nCtx.strokeStyle = 'rgba(255,255,255,0.12)';
  nCtx.lineWidth = 1.5;
  nCtx.beginPath();
  points.forEach((p, i) => i === 0 ? nCtx.moveTo(p.x, p.y) : nCtx.lineTo(p.x, p.y));
  nCtx.stroke();

  // traveling pulse
  const segT = (pulseT % (n - 1));
  const segIdx = Math.floor(segT);
  const localT = segT - segIdx;
  if (points[segIdx + 1]) {
    const px = points[segIdx].x + (points[segIdx + 1].x - points[segIdx].x) * localT;
    const py = points[segIdx].y + (points[segIdx + 1].y - points[segIdx].y) * localT;
    const grad = nCtx.createRadialGradient(px, py, 0, px, py, 14);
    grad.addColorStop(0, 'rgba(245,166,35,0.9)');
    grad.addColorStop(1, 'rgba(245,166,35,0)');
    nCtx.fillStyle = grad;
    nCtx.beginPath();
    nCtx.arc(px, py, 14, 0, Math.PI * 2);
    nCtx.fill();
  }

  // nodes
  points.forEach((p, i) => {
    const active = i <= segIdx;
    nCtx.beginPath();
    nCtx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    nCtx.fillStyle = active ? '#33e0c4' : 'rgba(255,255,255,0.25)';
    nCtx.fill();

    nCtx.font = '10px JetBrains Mono, monospace';
    nCtx.fillStyle = active ? 'rgba(231,237,243,0.85)' : 'rgba(139,152,166,0.6)';
    nCtx.textAlign = 'center';
    nCtx.fillText(p.label, p.x, p.y + 22);
  });

  pulseT += 0.012;
  if (!prefersReducedMotion) requestAnimationFrame(drawPipeline);
}

resizeNodeCanvas();
drawPipeline();
window.addEventListener('resize', resizeNodeCanvas);
