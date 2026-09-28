/* ═══════════════════════════════════════════════════════════════
   CyberSec Portal — Main JavaScript
   Modules: Matrix Rain, Typewriter, Terminal Emulator,
            Navbar scroll, Counter animation, Scroll reveal
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ───────────────────────────
     1. MATRIX RAIN (Background Canvas)
     ─────────────────────────── */
  const matrixCanvas = document.getElementById('matrix-rain');
  const ctx = matrixCanvas.getContext('2d');

  /** Resize canvas to fill viewport */
  function resizeMatrix() {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
  }
  resizeMatrix();
  window.addEventListener('resize', resizeMatrix);

  const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
  const fontSize = 14;
  let columns = Math.floor(matrixCanvas.width / fontSize);
  let drops = Array.from({ length: columns }, () => Math.random() * -100);

  function drawMatrix() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.06)';
    ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    ctx.fillStyle = '#00ff41';
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillText(char, x, y);

      if (y > matrixCanvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(drawMatrix, 50);

  // Recalculate columns on resize
  window.addEventListener('resize', () => {
    columns = Math.floor(matrixCanvas.width / fontSize);
    drops = Array.from({ length: columns }, () => Math.random() * -100);
  });


  /* ───────────────────────────
     2. NAVBAR SCROLL EFFECT
     ─────────────────────────── */
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('navbar--scrolled', window.scrollY > 60);
  }, { passive: true });


  /* ───────────────────────────
     3. MOBILE NAV TOGGLE
     ─────────────────────────── */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('navbar__toggle--active');
    navLinks.classList.toggle('navbar__links--open');
  });

  // Close mobile nav when a link is clicked
  navLinks.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('navbar__toggle--active');
      navLinks.classList.remove('navbar__links--open');
    });
  });


  /* ───────────────────────────
     4. TYPEWRITER EFFECT
     ─────────────────────────── */
  const typewriterEl = document.getElementById('typewriter-text');
  const phrases = [
    'Initializing security protocols...',
    'Welcome to the CyberSec Portal.',
    'Scanning for vulnerabilities...',
    'All systems operational.',
    'Knowledge is the ultimate exploit.',
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const TYPING_SPEED = 55;
  const DELETING_SPEED = 30;
  const PAUSE_AFTER_TYPING = 2200;
  const PAUSE_AFTER_DELETING = 500;

  function typewrite() {
    const current = phrases[phraseIndex];

    if (!isDeleting) {
      // Typing forward
      typewriterEl.textContent = current.slice(0, charIndex + 1);
      charIndex++;

      if (charIndex === current.length) {
        // Pause at end of phrase
        isDeleting = true;
        setTimeout(typewrite, PAUSE_AFTER_TYPING);
        return;
      }
      setTimeout(typewrite, TYPING_SPEED);
    } else {
      // Deleting backward
      typewriterEl.textContent = current.slice(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(typewrite, PAUSE_AFTER_DELETING);
        return;
      }
      setTimeout(typewrite, DELETING_SPEED);
    }
  }

  typewrite();


  /* ───────────────────────────
     5. COUNTER ANIMATION (Stats)
     ─────────────────────────── */
  const statValues = document.querySelectorAll('.hero__stat-value');
  let statsAnimated = false;

  function animateCounters() {
    if (statsAnimated) return;
    statsAnimated = true;

    statValues.forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      const duration = 2000;
      const start = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString();
      }
      requestAnimationFrame(step);
    });
  }


  /* ───────────────────────────
     6. SCROLL REVEAL (Intersection Observer)
     ─────────────────────────── */
  // Add fade-in class to elements we want to animate
  document.querySelectorAll('.card, .terminal, .hero__stats').forEach(el => {
    el.classList.add('fade-in');
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in--visible');
        revealObserver.unobserve(entry.target);

        // Trigger counter animation when stats section is visible
        if (entry.target.classList.contains('hero__stats')) {
          animateCounters();
        }
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-in').forEach(el => revealObserver.observe(el));


  /* ───────────────────────────
     7. INTERACTIVE TERMINAL EMULATOR
     ─────────────────────────── */
  const terminalOutput = document.getElementById('terminal-output');
  const terminalInput = document.getElementById('terminal-input');
  const terminalBody = document.getElementById('terminal-body');

  /** Utility: Create an output line element */
  function createLine(text, colorClass = '', bold = false) {
    const line = document.createElement('div');
    line.classList.add('terminal__output-line');
    if (colorClass) line.classList.add(`terminal__output-line--${colorClass}`);
    if (bold) line.classList.add('terminal__output-line--bold');
    line.textContent = text;
    return line;
  }

  /** Utility: Append multiple lines */
  function appendLines(lines) {
    const fragment = document.createDocumentFragment();
    lines.forEach(({ text, color, bold }) => {
      fragment.appendChild(createLine(text, color, bold));
    });
    terminalOutput.appendChild(fragment);
    scrollTerminal();
  }

  /** Auto-scroll to bottom */
  function scrollTerminal() {
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  /** Show the welcome banner on load */
  function showBanner() {
    const banner = [
      { text: '╔══════════════════════════════════════════════════╗', color: 'green' },
      { text: '║       ██████╗██╗   ██╗██████╗ ███████╗██████╗   ║', color: 'green' },
      { text: '║      ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗  ║', color: 'green' },
      { text: '║      ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝  ║', color: 'green' },
      { text: '║      ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗  ║', color: 'green' },
      { text: '║      ╚██████╗   ██║   ██████╔╝███████╗██║  ██║  ║', color: 'green' },
      { text: '║       ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝  ║', color: 'green' },
      { text: '╚══════════════════════════════════════════════════╝', color: 'green' },
      { text: '' },
      { text: '  CyberSec Interactive Terminal v2.4.1', color: 'cyan', bold: true },
      { text: '  Type "help" for a list of available commands.', color: 'dim' },
      { text: '' },
    ];
    appendLines(banner);
  }

  showBanner();

  /** Command history */
  const commandHistory = [];
  let historyIndex = -1;

  /** Command definitions */
  const commands = {
    help: () => [
      { text: '' },
      { text: '  Available Commands:', color: 'cyan', bold: true },
      { text: '  ─────────────────────────────────────────' , color: 'dim' },
      { text: '  help        Show this help menu', color: 'green' },
      { text: '  clear       Clear the terminal screen', color: 'green' },
      { text: '  whoami      Display current user info', color: 'green' },
      { text: '  ifconfig    Show network interfaces', color: 'green' },
      { text: '  nmap        Simulate a network scan', color: 'green' },
      { text: '  exploit     Run a simulated exploit', color: 'green' },
      { text: '  status      System status overview', color: 'green' },
      { text: '  date        Show current date and time', color: 'green' },
      { text: '  uname       Display system information', color: 'green' },
      { text: '  history     Show command history', color: 'green' },
      { text: '  banner      Re-display the welcome banner', color: 'green' },
      { text: '' },
    ],

    clear: () => {
      terminalOutput.innerHTML = '';
      return null; // Signal: no lines to append
    },

    whoami: () => [
      { text: '' },
      { text: '  User : root', color: 'green' },
      { text: '  UID  : 0', color: 'dim' },
      { text: '  Home : /root', color: 'dim' },
      { text: '  Shell: /bin/zsh', color: 'dim' },
      { text: '' },
    ],

    ifconfig: () => [
      { text: '' },
      { text: '  eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>', color: 'cyan' },
      { text: '        inet 192.168.1.105  netmask 255.255.255.0', color: 'dim' },
      { text: '        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64', color: 'dim' },
      { text: '        ether 08:00:27:4e:66:a1  txqueuelen 1000', color: 'dim' },
      { text: '' },
      { text: '  wlan0: flags=4099<UP,BROADCAST,MULTICAST>', color: 'cyan' },
      { text: '        inet 10.0.0.47  netmask 255.255.255.0', color: 'dim' },
      { text: '        ether 00:1a:2b:3c:4d:5e  txqueuelen 1000', color: 'dim' },
      { text: '' },
    ],

    nmap: () => [
      { text: '' },
      { text: '  Starting Nmap 7.94 ( https://nmap.org )', color: 'cyan', bold: true },
      { text: '  Scanning 192.168.1.0/24 ...', color: 'dim' },
      { text: '' },
      { text: '  PORT     STATE  SERVICE       VERSION', color: 'green' },
      { text: '  22/tcp   open   ssh           OpenSSH 8.9p1', color: 'dim' },
      { text: '  80/tcp   open   http          Apache httpd 2.4.54', color: 'dim' },
      { text: '  443/tcp  open   ssl/http      nginx 1.24.0', color: 'dim' },
      { text: '  3306/tcp open   mysql         MySQL 8.0.33', color: 'yellow' },
      { text: '  8080/tcp open   http-proxy    Squid 5.7', color: 'dim' },
      { text: '' },
      { text: '  Nmap done: 256 IP addresses (5 hosts up)', color: 'green' },
      { text: '' },
    ],

    exploit: () => [
      { text: '' },
      { text: '  [*] Loading Metasploit Framework v6.3.27...', color: 'cyan' },
      { text: '  [*] Payload: linux/x64/meterpreter/reverse_tcp', color: 'dim' },
      { text: '  [*] Target : 192.168.1.105:443', color: 'dim' },
      { text: '  [*] Sending exploit...', color: 'yellow' },
      { text: '  [+] SESSION OPENED — Meterpreter session 1', color: 'green', bold: true },
      { text: '' },
      { text: '  ⚠  This is a simulation for educational purposes only.', color: 'red' },
      { text: '' },
    ],

    status: () => [
      { text: '' },
      { text: '  ┌─ System Status ─────────────────────────┐', color: 'cyan' },
      { text: '  │  CPU Usage   :  ██████░░░░  62%          │', color: 'green' },
      { text: '  │  Memory      :  ████████░░  84%          │', color: 'yellow' },
      { text: '  │  Disk        :  ███░░░░░░░  31%          │', color: 'green' },
      { text: '  │  Network     :  ▲ 12.4 MB/s  ▼ 3.1 MB/s │', color: 'dim' },
      { text: '  │  Uptime      :  14d 6h 42m               │', color: 'dim' },
      { text: '  │  Firewall    :  ACTIVE                   │', color: 'green' },
      { text: '  └────────────────────────────────────────  ┘', color: 'cyan' },
      { text: '' },
    ],

    date: () => {
      const now = new Date();
      return [
        { text: '' },
        { text: `  ${now.toString()}`, color: 'cyan' },
        { text: '' },
      ];
    },

    uname: () => [
      { text: '' },
      { text: '  Linux kali 6.1.0-kali9-amd64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux', color: 'dim' },
      { text: '' },
    ],

    history: () => {
      const lines = [
        { text: '' },
        { text: '  Command History:', color: 'cyan', bold: true },
        { text: '  ─────────────────────────────────', color: 'dim' },
      ];
      if (commandHistory.length === 0) {
        lines.push({ text: '  (empty)', color: 'dim' });
      } else {
        commandHistory.forEach((cmd, i) => {
          lines.push({ text: `  ${String(i + 1).padStart(4)}  ${cmd}`, color: 'dim' });
        });
      }
      lines.push({ text: '' });
      return lines;
    },

    banner: () => {
      showBanner();
      return null;
    },
  };

  /** Process a command string */
  function processCommand(raw) {
    const input = raw.trim().toLowerCase();

    // Echo the command with prompt
    const echoLine = document.createElement('div');
    echoLine.classList.add('terminal__output-line');
    echoLine.innerHTML = `<span style="color:var(--green);font-weight:600">root</span>@<span style="color:var(--cyan)">kali</span>:<span style="color:var(--cyan-dim)">~</span># ${escapeHtml(raw.trim())}`;
    terminalOutput.appendChild(echoLine);

    if (input === '') {
      scrollTerminal();
      return;
    }

    // Push to history
    commandHistory.push(raw.trim());
    historyIndex = commandHistory.length;

    if (commands[input]) {
      const result = commands[input]();
      if (result) appendLines(result);
    } else {
      appendLines([
        { text: `  bash: ${input}: command not found. Type "help" for commands.`, color: 'red' },
        { text: '' },
      ]);
    }
  }

  /** Escape HTML entities */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /** Handle Enter key & history navigation */
  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      processCommand(terminalInput.value);
      terminalInput.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        terminalInput.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        terminalInput.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        terminalInput.value = '';
      }
    }
  });

  // Focus terminal input when clicking inside the terminal body
  terminalBody.addEventListener('click', () => terminalInput.focus());


  /* ───────────────────────────
     8. SMOOTH SCROLL for anchor links
     ─────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
