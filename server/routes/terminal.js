/* ═══════════════════════════════════════════════════════════════
   routes/terminal.js — Interactive Terminal Simulator API
   POST /api/terminal/execute  — Accept command, return mock output

   ⚠  SECURITY: NO real OS commands are executed.
   All responses are hardcoded/predefined for educational purposes.
   ═══════════════════════════════════════════════════════════════ */

const express = require('express');
const { validateCommand } = require('../middleware/validate');

/**
 * Create the terminal simulator router.
 * All command responses are pre-defined strings — zero RCE risk.
 */
function createTerminalRouter() {
  const router = express.Router();

  /* ─────────────────────────────────────────────────────────────
     PREDEFINED COMMAND RESPONSES
     Each key can be an exact match or a prefix (for flags).
     ───────────────────────────────────────────────────────────── */
  const commands = {
    /* ── General ── */
    help: {
      output: [
        '',
        '  Available Commands:',
        '  ─────────────────────────────────────────',
        '  help          Show this help menu',
        '  clear         Clear the terminal screen',
        '  whoami        Display current user info',
        '  id            Show user and group IDs',
        '  hostname      Display system hostname',
        '  uname         Display system information',
        '  uname -a      Full system information',
        '  uptime        System uptime',
        '  date          Current date and time',
        '  pwd           Print working directory',
        '  ls            List directory contents',
        '  cat           Display file contents',
        '  ifconfig      Show network interfaces',
        '  ip addr       Show IP addresses',
        '  ping          Ping a host',
        '  nmap          Basic network scan',
        '  nmap -sV      Service version detection',
        '  nmap -sS      SYN stealth scan',
        '  nmap -O       OS detection scan',
        '  exploit       Simulated Metasploit exploit',
        '  msfconsole    Launch Metasploit console',
        '  hydra         Password brute-force sim',
        '  sqlmap        SQL injection scanner sim',
        '  hashcat       Password hash cracker sim',
        '  tcpdump       Packet capture simulation',
        '  wireshark     Wireshark capture sim',
        '  netstat       Network connections',
        '  ss            Socket statistics',
        '  status        System status overview',
        '  history       Show command history',
        '',
      ].join('\n'),
      type: 'info',
    },

    whoami: {
      output: 'root',
      type: 'success',
    },

    id: {
      output: 'uid=0(root) gid=0(root) groups=0(root)',
      type: 'info',
    },

    hostname: {
      output: 'kali',
      type: 'info',
    },

    uname: {
      output: 'Linux kali 6.1.0-kali9-amd64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux',
      type: 'info',
    },

    'uname -a': {
      output: 'Linux kali 6.1.0-kali9-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.27-1kali1 (2024-05-30) x86_64 GNU/Linux',
      type: 'info',
    },

    uptime: {
      output: ' 14:32:07 up 14 days,  6:42,  2 users,  load average: 0.42, 0.38, 0.31',
      type: 'info',
    },

    date: {
      output: null, // Dynamically generated in handler
      type: 'info',
    },

    pwd: {
      output: '/root',
      type: 'info',
    },

    ls: {
      output: [
        'Desktop    Documents  Downloads  Music     Pictures',
        'Public     Templates  Videos     .bashrc   .zshrc',
        'exploit.py  payload.sh  targets.txt  notes.md',
      ].join('\n'),
      type: 'info',
    },

    'cat /etc/passwd': {
      output: [
        'root:x:0:0:root:/root:/bin/zsh',
        'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin',
        'bin:x:2:2:bin:/bin:/usr/sbin/nologin',
        'sys:x:3:3:sys:/dev:/usr/sbin/nologin',
        'www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin',
        'postgres:x:109:117:PostgreSQL administrator,,,:/var/lib/postgresql:/bin/bash',
      ].join('\n'),
      type: 'info',
    },

    cat: {
      output: 'cat: missing operand. Try: cat /etc/passwd',
      type: 'error',
    },

    /* ── Networking ── */
    ifconfig: {
      output: [
        '',
        'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500',
        '      inet 192.168.1.105  netmask 255.255.255.0  broadcast 192.168.1.255',
        '      inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>',
        '      ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)',
        '      RX packets 154832  bytes 98432617 (93.8 MiB)',
        '      TX packets 87621  bytes 12847392 (12.2 MiB)',
        '',
        'lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536',
        '      inet 127.0.0.1  netmask 255.0.0.0',
        '      inet6 ::1  prefixlen 128  scopeid 0x10<host>',
        '',
        'wlan0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500',
        '      inet 10.0.0.47  netmask 255.255.255.0  broadcast 10.0.0.255',
        '      ether 00:1a:2b:3c:4d:5e  txqueuelen 1000  (Ethernet)',
        '',
      ].join('\n'),
      type: 'info',
    },

    'ip addr': {
      output: [
        '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536',
        '    inet 127.0.0.1/8 scope host lo',
        '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500',
        '    inet 192.168.1.105/24 brd 192.168.1.255 scope global eth0',
        '3: wlan0: <BROADCAST,MULTICAST,UP> mtu 1500',
        '    inet 10.0.0.47/24 brd 10.0.0.255 scope global wlan0',
      ].join('\n'),
      type: 'info',
    },

    ping: {
      output: [
        'PING 192.168.1.1 (192.168.1.1) 56(84) bytes of data.',
        '64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=1.23 ms',
        '64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=0.98 ms',
        '64 bytes from 192.168.1.1: icmp_seq=3 ttl=64 time=1.05 ms',
        '',
        '--- 192.168.1.1 ping statistics ---',
        '3 packets transmitted, 3 received, 0% packet loss, time 2004ms',
        'rtt min/avg/max/mdev = 0.98/1.087/1.23/0.103 ms',
      ].join('\n'),
      type: 'info',
    },

    netstat: {
      output: [
        'Active Internet connections (servers and established)',
        'Proto  Recv-Q  Send-Q  Local Address       Foreign Address     State',
        'tcp         0       0  0.0.0.0:22          0.0.0.0:*           LISTEN',
        'tcp         0       0  0.0.0.0:80          0.0.0.0:*           LISTEN',
        'tcp         0       0  192.168.1.105:443   10.0.0.15:49832     ESTABLISHED',
        'tcp         0       0  192.168.1.105:22    10.0.0.22:52941     ESTABLISHED',
        'udp         0       0  0.0.0.0:68          0.0.0.0:*',
      ].join('\n'),
      type: 'info',
    },

    ss: {
      output: [
        'Netid  State   Recv-Q  Send-Q  Local Address:Port  Peer Address:Port',
        'tcp    LISTEN  0       128     0.0.0.0:22          0.0.0.0:*',
        'tcp    LISTEN  0       511     0.0.0.0:80          0.0.0.0:*',
        'tcp    ESTAB   0       0       192.168.1.105:443   10.0.0.15:49832',
        'tcp    ESTAB   0       36      192.168.1.105:22    10.0.0.22:52941',
      ].join('\n'),
      type: 'info',
    },

    /* ── Scanning & Exploitation ── */
    nmap: {
      output: [
        '',
        'Starting Nmap 7.94 ( https://nmap.org )',
        'Scanning 192.168.1.0/24 ...',
        '',
        'PORT     STATE  SERVICE       VERSION',
        '22/tcp   open   ssh           OpenSSH 8.9p1',
        '80/tcp   open   http          Apache httpd 2.4.54',
        '443/tcp  open   ssl/http      nginx 1.24.0',
        '3306/tcp open   mysql         MySQL 8.0.33',
        '8080/tcp open   http-proxy    Squid 5.7',
        '',
        'Nmap done: 256 IP addresses (5 hosts up) scanned in 12.48s',
        '',
      ].join('\n'),
      type: 'success',
    },

    'nmap -sv': {
      output: [
        '',
        'Starting Nmap 7.94 ( https://nmap.org )',
        'Service detection scan on 192.168.1.105 ...',
        '',
        'PORT     STATE  SERVICE  VERSION',
        '22/tcp   open   ssh      OpenSSH 8.9p1 Ubuntu 3ubuntu0.4 (Ubuntu Linux; protocol 2.0)',
        '80/tcp   open   http     Apache httpd 2.4.54 ((Debian))',
        '443/tcp  open   ssl/http nginx 1.24.0',
        '3306/tcp open   mysql    MySQL 8.0.33-0ubuntu0.22.04.2',
        '8080/tcp open   http     Apache Tomcat 10.1.13',
        '',
        'Service detection performed. Nmap done: 1 IP address scanned in 18.32s',
        '',
      ].join('\n'),
      type: 'success',
    },

    'nmap -ss': {
      output: [
        '',
        'Starting Nmap 7.94 ( https://nmap.org )',
        'SYN Stealth Scan on 192.168.1.0/24 ...',
        '',
        'PORT     STATE    SERVICE',
        '22/tcp   open     ssh',
        '80/tcp   open     http',
        '443/tcp  open     https',
        '3306/tcp filtered mysql',
        '8080/tcp open     http-proxy',
        '8443/tcp closed   https-alt',
        '',
        'SYN Stealth Scan completed: 256 hosts (5 up) in 8.74s',
        '',
      ].join('\n'),
      type: 'success',
    },

    'nmap -o': {
      output: [
        '',
        'Starting Nmap 7.94 ( https://nmap.org )',
        'OS detection scan on 192.168.1.105 ...',
        '',
        'OS details:',
        '  Host 192.168.1.105: Linux 5.15 - 6.1 (96% confidence)',
        '  Host 192.168.1.1 : Linux 4.15 - 5.8 (91% confidence)',
        '  Host 192.168.1.50: Windows 10 build 19041 (88% confidence)',
        '',
        'OS detection performed. Nmap done: 3 hosts scanned in 22.15s',
        '',
      ].join('\n'),
      type: 'success',
    },

    exploit: {
      output: [
        '',
        '[*] Loading Metasploit Framework v6.3.27 ...',
        '[*] Payload : linux/x64/meterpreter/reverse_tcp',
        '[*] Target  : 192.168.1.105:443',
        '[*] LHOST   : 192.168.1.200',
        '[*] LPORT   : 4444',
        '[*] Sending exploit ...',
        '[+] Exploit completed! Meterpreter session 1 opened (192.168.1.200:4444 -> 192.168.1.105:443)',
        '',
        '⚠  SIMULATION ONLY — No actual exploitation performed.',
        '   This output is for educational purposes only.',
        '',
      ].join('\n'),
      type: 'warning',
    },

    msfconsole: {
      output: [
        '',
        '       =[ metasploit v6.3.27-dev                          ]',
        '+ -- --=[ 2364 exploits - 1220 auxiliary - 413 post       ]',
        '+ -- --=[ 1391 payloads - 46 encoders - 11 nops          ]',
        '+ -- --=[ 9 evasion                                       ]',
        '',
        'msf6 > [*] Console ready. Type "help" for available commands.',
        '',
        '⚠  This is a simulated Metasploit console.',
        '',
      ].join('\n'),
      type: 'warning',
    },

    hydra: {
      output: [
        '',
        'Hydra v9.5 (c) 2023 by van Hauser / THC',
        '',
        '[DATA] attacking ssh://192.168.1.105:22/',
        '[22][ssh] host: 192.168.1.105   login: admin   password: ********',
        '[STATUS] 1 of 1 target successfully completed, 1 valid password found',
        '',
        '⚠  SIMULATION — No actual brute-force performed.',
        '',
      ].join('\n'),
      type: 'warning',
    },

    sqlmap: {
      output: [
        '',
        '        ___',
        '       __H__',
        ' ___ ___[.]_____ ___ ___  {1.7.12#stable}',
        '|_ -| . [(]     | .\'| . |',
        '|___|_  ["]_|_|_|__,|  _|',
        '      |_|V...       |_|',
        '',
        '[*] starting @ 14:32:07 /2024-06-15/',
        '[*] testing connection to the target URL',
        '[*] testing for SQL injection on parameter "id"',
        '[+] parameter "id" is vulnerable. Injection type: UNION query-based',
        '[*] retrieved: information_schema, cybersec_portal, mysql',
        '',
        '⚠  SIMULATION — No actual SQL injection performed.',
        '',
      ].join('\n'),
      type: 'warning',
    },

    hashcat: {
      output: [
        '',
        'hashcat (v6.2.6) starting ...',
        '',
        'Hash.Mode........: 0 (MD5)',
        'Hash.Target......: 5f4dcc3b5aa765d61d8327deb882cf99',
        'Time.Started.....: Mon Jun 15 14:32:07 2024',
        'Speed.#1.........: 12483.2 MH/s',
        '',
        '5f4dcc3b5aa765d61d8327deb882cf99:password',
        '',
        'Session.........: hashcat',
        'Status..........: Cracked',
        'Progress........: 14344385/14344385 (100.00%)',
        '',
        '⚠  SIMULATION — No actual hash cracking performed.',
        '',
      ].join('\n'),
      type: 'warning',
    },

    /* ── Packet Analysis ── */
    tcpdump: {
      output: [
        '',
        'tcpdump: listening on eth0, link-type EN10MB (Ethernet), snapshot length 262144 bytes',
        '14:32:07.123456 IP 192.168.1.105.443 > 10.0.0.15.49832: Flags [P.], seq 1:89, ack 1, win 502',
        '14:32:07.123789 IP 10.0.0.15.49832 > 192.168.1.105.443: Flags [.], ack 89, win 509',
        '14:32:07.234567 ARP, Request who-has 192.168.1.1 tell 192.168.1.105, length 28',
        '14:32:07.234890 ARP, Reply 192.168.1.1 is-at 08:00:27:ff:aa:bb, length 28',
        '14:32:08.456123 IP 192.168.1.105.22 > 10.0.0.22.52941: Flags [P.], seq 1:256, ack 1, win 502',
        '',
        '5 packets captured, 5 packets received by filter',
        '',
      ].join('\n'),
      type: 'info',
    },

    wireshark: {
      output: [
        '',
        'Wireshark 4.2.0 (v4.2.0-0-g54eedfc63953)',
        'Capturing on \'eth0\'',
        '',
        'No.  Time        Source          Destination     Protocol  Length  Info',
        '1    0.000000    192.168.1.105   10.0.0.15       TLSv1.3   89     Application Data',
        '2    0.000333    10.0.0.15       192.168.1.105   TCP       54     49832 → 443 [ACK]',
        '3    0.111234    192.168.1.105   192.168.1.1     ARP       42     Who has 192.168.1.1?',
        '4    0.111567    192.168.1.1     192.168.1.105   ARP       42     192.168.1.1 is at 08:00:27:ff:aa:bb',
        '5    1.332890    192.168.1.105   10.0.0.22       SSH       256    Encrypted packet',
        '',
        'Capture complete: 5 packets on interface eth0',
        '',
      ].join('\n'),
      type: 'info',
    },

    /* ── System ── */
    status: {
      output: [
        '',
        '┌─ System Status ─────────────────────────────┐',
        '│  CPU Usage   :  ██████░░░░  62%              │',
        '│  Memory      :  ████████░░  84%              │',
        '│  Disk        :  ███░░░░░░░  31%              │',
        '│  Network     :  ▲ 12.4 MB/s  ▼ 3.1 MB/s     │',
        '│  Uptime      :  14d 6h 42m                   │',
        '│  Firewall    :  ACTIVE                       │',
        '│  IDS/IPS     :  Snort v3.1 — Running         │',
        '└──────────────────────────────────────────────┘',
        '',
      ].join('\n'),
      type: 'success',
    },

    clear: {
      output: '',
      type: 'clear',
    },
  };

  /* ─── POST /api/terminal/execute ───────────────────────────── */
  router.post('/execute', (req, res) => {
    try {
      const rawCommand = req.body.command;
      const cleaned = validateCommand(rawCommand);

      if (!cleaned) {
        return res.status(400).json({
          success: false,
          error: 'Invalid command. Provide a non-empty string (max 200 chars).',
        });
      }

      // Normalize: lowercase, collapse whitespace
      const normalized = cleaned.toLowerCase().replace(/\s+/g, ' ');

      // Handle the `date` command dynamically
      if (normalized === 'date') {
        return res.json({
          success: true,
          data: {
            command: cleaned,
            output: new Date().toString(),
            type: 'info',
          },
        });
      }

      // Look up exact match first, then try prefix match
      let response = commands[normalized];

      if (!response) {
        // Try matching the first word (base command)
        const baseCmd = normalized.split(' ')[0];
        response = commands[baseCmd];
      }

      if (response) {
        return res.json({
          success: true,
          data: {
            command: cleaned,
            output: response.output,
            type: response.type,
          },
        });
      }

      // Unknown command
      return res.json({
        success: true,
        data: {
          command: cleaned,
          output: `bash: ${cleaned}: command not found. Type "help" for available commands.`,
          type: 'error',
        },
      });
    } catch (err) {
      console.error('[Terminal] Execute error:', err.message);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  return router;
}

module.exports = createTerminalRouter;
