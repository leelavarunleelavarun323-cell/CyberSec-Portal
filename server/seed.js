/* ═══════════════════════════════════════════════════════════════
   seed.js — Populate the database with sample data
   Run:  npm run seed
   ═══════════════════════════════════════════════════════════════ */

const { initializeDatabase, saveDatabase, closeDatabase } = require('./database');

async function seed() {
  const db = await initializeDatabase();

  /* ─────────────────────────────────────────────────────────────
     SEED ARTICLES
     ───────────────────────────────────────────────────────────── */
  const articles = [
    {
      title: 'Nmap Basics: Scanning Your First Network',
      content: `Nmap ("Network Mapper") is a free, open-source tool for network discovery and security auditing.

## Quick Start
\`\`\`bash
# Scan a single host
nmap 192.168.1.1

# Scan an entire subnet
nmap 192.168.1.0/24

# Service version detection
nmap -sV 192.168.1.1

# OS detection
nmap -O 192.168.1.1

# Aggressive scan (OS detection, version, scripts, traceroute)
nmap -A 192.168.1.1
\`\`\`

## Common Scan Types
- **-sS** (SYN Stealth Scan) — Fast, stealthy, default for root
- **-sT** (TCP Connect Scan) — Full TCP handshake
- **-sU** (UDP Scan) — Scan UDP ports
- **-sP** (Ping Scan) — Host discovery only

## Port States
| State    | Meaning                        |
|----------|--------------------------------|
| open     | Service accepting connections  |
| closed   | No service listening           |
| filtered | Firewall blocking the probe    |

## Pro Tips
1. Always get written authorization before scanning.
2. Use \`-T4\` for faster scans on reliable networks.
3. Save output with \`-oN output.txt\` for later analysis.`,
      category: 'networking',
    },
    {
      title: 'Metasploit Framework: From Enumeration to Exploitation',
      content: `Metasploit is the world's most widely used penetration testing framework.

## Starting Metasploit
\`\`\`bash
# Launch the console
msfconsole

# Update the database
msfdb init
\`\`\`

## Core Workflow
1. **Search** for an exploit: \`search type:exploit platform:linux\`
2. **Use** the exploit: \`use exploit/multi/handler\`
3. **Set** options: \`set RHOSTS 192.168.1.105\`
4. **Run**: \`exploit\` or \`run\`

## Essential Modules
- **exploit/** — Code that takes advantage of a vulnerability
- **payload/** — Code that runs after successful exploitation
- **auxiliary/** — Scanners, fuzzers, and other tools
- **post/** — Post-exploitation modules

## Meterpreter Commands
\`\`\`
sysinfo       — System information
getuid        — Current user
hashdump      — Dump password hashes
upload/download — File transfer
shell         — Drop to system shell
\`\`\`

## Legal Warning
Only use Metasploit on systems you have explicit authorization to test.`,
      category: 'exploitation',
    },
    {
      title: 'Wireshark: Capturing and Analyzing Network Packets',
      content: `Wireshark is the world's foremost network protocol analyzer.

## Capture Filters vs Display Filters
- **Capture filters** limit what packets are captured (BPF syntax)
- **Display filters** filter the view of already-captured packets

## Useful Display Filters
\`\`\`
# HTTP traffic only
http

# DNS queries
dns

# Traffic from a specific IP
ip.addr == 192.168.1.105

# TCP SYN packets (connection attempts)
tcp.flags.syn == 1 && tcp.flags.ack == 0

# HTTP POST requests
http.request.method == "POST"

# TLS handshakes
tls.handshake.type == 1
\`\`\`

## Following a TCP Stream
Right-click a packet → Follow → TCP Stream. This reassembles the entire conversation.

## CLI Alternative: tshark
\`\`\`bash
tshark -i eth0 -f "port 80" -c 100
\`\`\``,
      category: 'forensics',
    },
    {
      title: 'SQL Injection: Understanding and Prevention',
      content: `SQL Injection (SQLi) remains one of the OWASP Top 10 vulnerabilities.

## How It Works
An attacker injects malicious SQL into input fields:
\`\`\`
Username: admin' OR '1'='1' --
Password: anything
\`\`\`

## Types of SQLi
1. **In-Band (Classic)** — Error-based or UNION-based
2. **Blind** — Boolean-based or time-based
3. **Out-of-Band** — Data exfiltration via DNS/HTTP

## Testing with sqlmap
\`\`\`bash
sqlmap -u "http://target.com/page?id=1" --dbs
sqlmap -u "http://target.com/page?id=1" -D dbname --tables
sqlmap -u "http://target.com/page?id=1" -D dbname -T users --dump
\`\`\`

## Prevention
1. **Parameterized queries** (prepared statements)
2. **Input validation** and sanitization
3. **Least privilege** database accounts
4. **WAF** (Web Application Firewall)

\`\`\`javascript
// Vulnerable
db.query("SELECT * FROM users WHERE id = " + userInput);

// Safe (parameterized)
db.query("SELECT * FROM users WHERE id = ?", [userInput]);
\`\`\``,
      category: 'web-security',
    },
    {
      title: 'Cryptography Fundamentals for Security Professionals',
      content: `Understanding cryptography is essential for any cybersecurity professional.

## Symmetric vs Asymmetric
| Property    | Symmetric       | Asymmetric         |
|-------------|-----------------|---------------------|
| Keys        | Same key        | Public + Private    |
| Speed       | Fast            | Slower              |
| Examples    | AES, ChaCha20   | RSA, ECC            |
| Use Case    | Bulk encryption | Key exchange, certs |

## Hashing Algorithms
- **MD5** — Broken, do NOT use for security
- **SHA-1** — Deprecated, collision attacks exist
- **SHA-256** — Current standard, part of SHA-2 family
- **bcrypt/scrypt/Argon2** — Password hashing (use these!)

## OpenSSL Quick Reference
\`\`\`bash
# Generate an AES-256 encrypted file
openssl enc -aes-256-cbc -salt -in plain.txt -out encrypted.bin

# Generate RSA key pair
openssl genrsa -out private.pem 4096
openssl rsa -in private.pem -pubout -out public.pem

# Create a SHA-256 hash
echo -n "password" | openssl dgst -sha256
\`\`\`

## Key Takeaways
- Never roll your own crypto
- Use established libraries (OpenSSL, libsodium)
- Rotate keys regularly`,
      category: 'cryptography',
    },
  ];

  /* ─────────────────────────────────────────────────────────────
     SEED CHEAT SHEETS
     ───────────────────────────────────────────────────────────── */
  const cheatSheets = [
    { title: 'Nmap Cheat Sheet', file_url: '/downloads/nmap-cheatsheet.pdf', downloads_count: 1247 },
    { title: 'Metasploit Quick Reference', file_url: '/downloads/metasploit-quickref.pdf', downloads_count: 893 },
    { title: 'Wireshark Display Filters', file_url: '/downloads/wireshark-filters.pdf', downloads_count: 1056 },
    { title: 'Linux Privilege Escalation', file_url: '/downloads/linux-privesc.pdf', downloads_count: 672 },
    { title: 'OWASP Top 10 Summary', file_url: '/downloads/owasp-top10.pdf', downloads_count: 2104 },
    { title: 'Reverse Shell Cheat Sheet', file_url: '/downloads/reverse-shells.pdf', downloads_count: 1538 },
    { title: 'SQLmap Commands Reference', file_url: '/downloads/sqlmap-reference.pdf', downloads_count: 784 },
    { title: 'Hashcat Rule Writing Guide', file_url: '/downloads/hashcat-rules.pdf', downloads_count: 421 },
  ];

  /* ─────────────────────────────────────────────────────────────
     INSERT DATA (using parameterized queries)
     ───────────────────────────────────────────────────────────── */

  // Clear existing data for a clean seed
  db.run('DELETE FROM articles');
  db.run('DELETE FROM cheat_sheets');

  // Insert articles
  for (const article of articles) {
    db.run(
      'INSERT INTO articles (title, content, category) VALUES ($title, $content, $category)',
      { $title: article.title, $content: article.content, $category: article.category }
    );
  }

  // Insert cheat sheets
  for (const sheet of cheatSheets) {
    db.run(
      'INSERT INTO cheat_sheets (title, file_url, downloads_count) VALUES ($title, $file_url, $downloads_count)',
      { $title: sheet.title, $file_url: sheet.file_url, $downloads_count: sheet.downloads_count }
    );
  }

  // Persist everything to disk
  saveDatabase();

  // Verify counts
  const articleCount = db.exec('SELECT COUNT(*) AS count FROM articles')[0].values[0][0];
  const sheetCount = db.exec('SELECT COUNT(*) AS count FROM cheat_sheets')[0].values[0][0];

  console.log(`[Seed] Done! ${articleCount} articles, ${sheetCount} cheat sheets.`);

  closeDatabase();
}

seed().catch(err => {
  console.error('[Seed] Error:', err);
  process.exit(1);
});
