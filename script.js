/* ============================================================
   OBSIDIAN STUDIO DESIGNS — interactions
   ============================================================ */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav ---------- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', function () {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });

  /* ---------- Gold particle field ---------- */
  var canvas = document.getElementById('particles');
  var ctx = canvas.getContext('2d');
  var particles = [];
  var W, H;

  function resizeCanvas() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function makeParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -(Math.random() * 0.28 + 0.06),
      a: Math.random() * 0.55 + 0.1,
      tw: Math.random() * Math.PI * 2,
      tws: Math.random() * 0.02 + 0.005
    };
  }

  var COUNT = Math.min(90, Math.floor(window.innerWidth / 16));
  for (var i = 0; i < COUNT; i++) particles.push(makeParticle());

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.tw += p.tws;
      if (p.y < -10 || p.x < -10 || p.x > W + 10) {
        particles[i] = makeParticle();
        particles[i].y = H + 10;
        continue;
      }
      var alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(232, 190, 92, ' + alpha.toFixed(3) + ')';
      ctx.shadowColor = 'rgba(212, 165, 63, 0.9)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    if (!reducedMotion) requestAnimationFrame(drawParticles);
  }
  if (!reducedMotion) requestAnimationFrame(drawParticles);

  /* ---------- Cursor glow ---------- */
  var glow = document.getElementById('cursorGlow');
  document.addEventListener('mousemove', function (e) {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });

  /* ---------- Letter-split 3D title reveal ---------- */
  function splitLetters(el) {
    var letterIndex = 0;
    function walk(node) {
      var children = Array.prototype.slice.call(node.childNodes);
      children.forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          // split into words so lines can only break between words
          var parts = child.textContent.split(/(\s+)/);
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(' '));
              return;
            }
            var word = document.createElement('span');
            word.className = 'word';
            for (var i = 0; i < part.length; i++) {
              var span = document.createElement('span');
              span.className = 'ltr';
              span.textContent = part[i];
              span.style.transitionDelay = (letterIndex * 38) + 'ms';
              word.appendChild(span);
              letterIndex++;
            }
            frag.appendChild(word);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    }
    walk(el);
  }

  var splitTitles = document.querySelectorAll('.section-title.split');
  if (!reducedMotion) {
    splitTitles.forEach(splitLetters);
    var titleObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('letters-in');
            titleObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    splitTitles.forEach(function (el) { titleObserver.observe(el); });
  } else {
    splitTitles.forEach(function (el) { el.classList.add('letters-in'); });
  }

  /* ---------- Scroll state ---------- */
  var heroVideoWrap = document.getElementById('heroVideoWrap');
  var heroContent = document.getElementById('heroContent');
  var progressBar = document.getElementById('scrollProgress');
  var spinEls = document.querySelectorAll('.spin3d');
  var ticking = false;

  function onScroll() {
    // Runs directly (not via rAF) so content still reveals if frames are throttled.
    revealVisible();
    if (!ticking) {
      requestAnimationFrame(applyScroll);
      ticking = true;
    }
  }

  function applyScroll() {
    ticking = false;
    var y = window.scrollY;
    var vh = window.innerHeight;

    nav.classList.toggle('scrolled', y > 40);

    var docH = document.documentElement.scrollHeight - vh;
    progressBar.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';

    if (reducedMotion) return;

    if (y < vh * 1.2) {
      var t = y / vh;
      heroVideoWrap.style.transform =
        'scale(' + (1 + t * 0.18) + ') translateY(' + y * 0.28 + 'px)';
      heroContent.style.transform =
        'translateY(' + y * -0.22 + 'px) rotateX(' + t * 14 + 'deg) scale(' + (1 - t * 0.12) + ')';
      heroContent.style.opacity = String(Math.max(0, 1 - t * 1.35));
    }

    for (var i = 0; i < spinEls.length; i++) {
      var el = spinEls[i];
      var rect = el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) continue;
      var progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      progress = Math.max(-0.75, Math.min(0.75, progress));
      var spin = parseFloat(el.getAttribute('data-spin') || '30');
      el.style.setProperty('--sry', (progress * spin).toFixed(2) + 'deg');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  applyScroll();

  /* ---------- Scroll reveal (3D tilt-in) ----------
     These elements start at opacity:0, so anything that stops the reveal from
     firing hides real content (contact details, the enquiry form). Two
     independent mechanisms run so a failure in either still shows the content:
       1. IntersectionObserver, threshold 0 — fire on ANY overlap. A ratio-based
          threshold is unusable here: the 3D reveal projects a box far bigger
          than the element, so a tall section's ratio can never reach a
          percentage on a narrow screen and it would stay invisible forever.
       2. A direct geometry check on scroll, in case the observer never fires. */
  var revealTargets = Array.prototype.slice.call(document.querySelectorAll('.tilt-in'));

  function revealVisible() {
    if (!revealTargets || !revealTargets.length) return;
    var vh = window.innerHeight;
    revealTargets = revealTargets.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh - 40 && r.bottom > 0) {
        el.classList.add('in-view');
        return false;
      }
      return true;
    });
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
          var i = revealTargets.indexOf(entry.target);
          if (i > -1) revealTargets.splice(i, 1);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px -60px 0px' }
  );
  revealTargets.forEach(function (el) { observer.observe(el); });
  revealVisible();

  /* ---------- Smooth scroll helper ---------- */
  function smoothTo(sel) {
    var target = document.querySelector(sel);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.scrollY - 68;
    window.scrollTo({ top: top, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  /* ---------- DEVICE BOOT SEQUENCES ---------- */
  var HTML_CODE =
    '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '  <title>Your Website</title>\n' +
    '  <link rel="stylesheet"\n' +
    '        href="gold.css">\n' +
    '</head>\n' +
    '<body>\n' +
    '  <h1>Built by Obsidian</h1>\n' +
    '  <p>Dark. Bold. Golden.</p>\n' +
    '  <script src="launch.js">\n' +
    '  <' + '/script>\n' +
    '</body>\n' +
    '</html>';

  function typeCode(pre, code, duration) {
    pre.textContent = '';
    var start = performance.now();
    function tick(now) {
      var t = Math.min(1, (now - start) / duration);
      pre.textContent = code.slice(0, Math.round(code.length * t));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function binaryBoot(device, duration) {
    var rain = device.querySelector('.bin-rain');
    var pct = device.querySelector('.boot-status i');
    var bar = device.querySelector('.boot-bar span');
    rain.innerHTML = '';
    for (var c = 0; c < 7; c++) {
      var col = document.createElement('div');
      col.className = 'bin-col';
      var bits = [];
      for (var r = 0; r < 60; r++) bits.push(Math.round(Math.random()));
      col.textContent = bits.join('\n');
      col.style.left = (4 + c * 13.2) + '%';
      col.style.animationDuration = (0.8 + Math.random() * 0.9) + 's';
      col.style.animationDelay = (-Math.random() * 1.2) + 's';
      col.style.opacity = String(0.45 + Math.random() * 0.55);
      rain.appendChild(col);
    }
    var start = performance.now();
    function tick(now) {
      var t = Math.min(1, (now - start) / duration);
      var v = Math.round(t * 100);
      pct.textContent = v + '%';
      bar.style.width = v + '%';
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var BOOT_MS = 1600;

  function bootDevice(anchor, kind) {
    if (anchor.classList.contains('booting')) return;
    var targetSel = anchor.getAttribute('href');

    if (reducedMotion) {
      smoothTo(targetSel);
      return;
    }

    anchor.classList.add('booting');
    if (kind === 'laptop') {
      typeCode(anchor.querySelector('.scr-code'), HTML_CODE, BOOT_MS - 200);
    } else {
      binaryBoot(anchor, BOOT_MS - 100);
    }
    setTimeout(function () { smoothTo(targetSel); }, BOOT_MS);
    setTimeout(function () { anchor.classList.remove('booting'); }, BOOT_MS + 1800);
  }

  var deviceLaptop = document.getElementById('deviceLaptop');
  var devicePhone = document.getElementById('devicePhone');
  deviceLaptop.addEventListener('click', function (e) {
    e.preventDefault();
    bootDevice(deviceLaptop, 'laptop');
  });
  devicePhone.addEventListener('click', function (e) {
    e.preventDefault();
    bootDevice(devicePhone, 'phone');
  });

  /* ---------- 3D device tilt via CSS vars ---------- */
  function attachVarTilt(zone, maxDeg) {
    zone.addEventListener('mousemove', function (e) {
      if (reducedMotion) return;
      var rect = zone.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      zone.style.setProperty('--mry', (px * maxDeg).toFixed(2) + 'deg');
      zone.style.setProperty('--mrx', (-py * maxDeg).toFixed(2) + 'deg');
    });
    zone.addEventListener('mouseleave', function () {
      zone.style.setProperty('--mry', '0deg');
      zone.style.setProperty('--mrx', '0deg');
    });
  }

  document.querySelectorAll('.device, .feature-media').forEach(function (zone) {
    attachVarTilt(zone, 16);
  });

  /* ---------- inline tilt for flat cards ---------- */
  function attachTilt(el, maxDeg) {
    var rafId = null;

    el.addEventListener('mousemove', function (e) {
      if (reducedMotion) return;
      var rect = el.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;

      el.style.setProperty('--mx', ((px + 0.5) * 100).toFixed(1) + '%');
      el.style.setProperty('--my', ((py + 0.5) * 100).toFixed(1) + '%');

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(function () {
        el.style.transform =
          'rotateY(' + (px * maxDeg).toFixed(2) + 'deg)' +
          ' rotateX(' + (-py * maxDeg).toFixed(2) + 'deg)' +
          ' translateZ(10px)';
      });
    });

    el.addEventListener('mouseleave', function () {
      if (rafId) cancelAnimationFrame(rafId);
      el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
      el.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0)';
      setTimeout(function () {
        el.style.transition = '';
      }, 600);
    });
  }

  document.querySelectorAll('.service-card, .contact-method').forEach(function (card) {
    attachTilt(card, 7);
  });

  /* ---------- Smooth anchor offset for fixed nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    if (link.classList.contains('device')) return; // devices boot instead
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      if (!document.querySelector(id)) return;
      e.preventDefault();
      smoothTo(id);
    });
  });

  /* ---------- Enquiry form ---------- */
  var form = document.getElementById('contactForm');
  var submitBtn = document.getElementById('formSubmitBtn');
  if (form && submitBtn) {
    form.addEventListener('submit', function () {
      submitBtn.textContent = 'Sending…';
      submitBtn.style.opacity = '.7';
      submitBtn.disabled = true;
      // FormSubmit handles delivery + shows its confirmation page
      setTimeout(function () { submitBtn.disabled = false; }, 4000);
    });
  }
})();
