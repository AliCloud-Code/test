import { useState, useCallback, useRef, useEffect } from 'react';
import portfolio from '../../data/portfolio';
import { sounds } from '../../utils/sound';

export default function Terminal() {
  const [lines, setLines] = useState([]);
  const history = useRef([]);
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  const executeCommand = useCallback((cmd) => {
    const parts = cmd.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    if (!command) return;

    history.current.push(cmd);
    setHistIdx(history.current.length);
    try { sounds.type(); } catch {}

    if (command === 'clear') { setLines([]); return; }

    const cmds = {
      help: 'Available: help whoami skills projects contact social clear matrix theme neofetch date uptime ls pwd echo sudo rm',
      whoami: `developer@${portfolio.name}\n${portfolio.name}\n${portfolio.years}+ years experience\n${portfolio.title}\nLocation: ${portfolio.location}`,
      skills: 'Skills: JavaScript TypeScript React Next.js Node.js Express HTML CSS Linux SQLite Docker Figma',
      projects: 'Featured Projects: Coming soon! Type "navigate projects" to go to projects section.',
      contact: `Email: ${portfolio.email}\nGitHub: github.com/AliCloud-Code\nTelegram: @A0L0I0X\nDiscord: alicloud1`,
      social: 'GitHub: @AliCloud-Code\nDiscord: alicloud1\nTelegram: @A0L0I0X\nX/Twitter: @AliCloudCode',
      neofetch: `OS: Arch Linux x86_64\nHost: Portfolio v4.0\nKernel: 6.8.0-generic\nUptime: ${portfolio.years}+ years\nCPU: Intel Core i5 @ 3GHz\nGPU: NVIDIA GTX 1050Ti\nShell: bash 5.2`,
      date: new Date().toLocaleString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' }),
      uptime: `Up ${Math.floor(performance.now() / 1000)}s | Load: 0.42, 0.38, 0.35`,
      ls: 'about/\nprojects/\nblog/\ncontact/\n.config/',
      pwd: '/home/developer/portfolio',
      echo: args.join(' '),
      matrix: { out: 'Entering the Matrix...', action: () => { try { window.__setTheme?.('matrix'); } catch {} } },
      sudo: { out: 'Nice try! Permission denied.', cls: 'error' },
      rm: { out: 'rm: cannot remove: Nice try!', cls: 'error' },
    };

    if (command === 'theme' && args[0]) { try { window.__setTheme?.(args[0]); } catch {} }
    if (command === 'navigate' && args[0]) {
      document.getElementById(args[0])?.scrollIntoView({ behavior: 'smooth' });
    }

    const def = cmds[command];
    if (def) {
      const out = typeof def === 'object' ? def.out : def;
      const cls = typeof def === 'object' ? (def.cls || '') : '';
      setLines(prev => [...prev, { id: Date.now(), prompt: 'guest@portfolio:~$', cmd, output: out, cls }]);
      if (typeof def === 'object' && def.action) setTimeout(def.action, 100);
    } else {
      setLines(prev => [...prev, { id: Date.now(), prompt: 'guest@portfolio:~$', cmd, output: `bash: ${command}: command not found. Type 'help'.`, cls: 'error' }]);
      try { sounds.error(); } catch {}
    }
  }, []);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  // Demo commands on mount
  useEffect(() => {
    const t = setTimeout(() => {
      executeCommand('whoami');
      setTimeout(() => executeCommand('skills'), 1200);
      setTimeout(() => executeCommand('neofetch'), 2400);
    }, 2200);
    return () => clearTimeout(t);
  }, [executeCommand]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      executeCommand(e.target.value);
      e.target.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx > 0) { const ni = histIdx - 1; setHistIdx(ni); e.target.value = history.current[ni] || ''; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx < history.current.length - 1) { const ni = histIdx + 1; setHistIdx(ni); e.target.value = history.current[ni] || ''; }
      else { setHistIdx(history.current.length); e.target.value = ''; }
    }
  };

  return (
    <div className="liquid-glass terminal-wrapper">
      <div className="terminal-header">
        <span className="terminal-dot terminal-dot-red" />
        <span className="terminal-dot terminal-dot-yellow" />
        <span className="terminal-dot terminal-dot-green" />
        <span className="terminal-title">
          <i className="fas fa-terminal" style={{ marginRight: 6 }} />guest@portfolio — bash — 80x24
        </span>
      </div>
      <div ref={bodyRef} className="terminal-body">
        {lines.map(l => (
          <div key={l.id}>
            <div>
              <span className="terminal-prompt"><i className="fas fa-terminal" style={{ marginRight: 4 }} /> {l.prompt}</span>
              <span className="terminal-cmd">{l.cmd}</span>
            </div>
            {l.output && <div className={`terminal-output ${l.cls}`}>{l.output}</div>}
          </div>
        ))}
      </div>
      <div className="terminal-input-line">
        <span className="terminal-input-prompt">
          <i className="fas fa-terminal" style={{ marginRight: 4 }} />guest@portfolio:~$
        </span>
        <input ref={inputRef} type="text" onKeyDown={handleKeyDown} placeholder="Type 'help'..." className="terminal-input" />
      </div>
    </div>
  );
}