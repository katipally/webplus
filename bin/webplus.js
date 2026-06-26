#!/usr/bin/env node
'use strict';

// webplus (web+) — install one Agent Skill that makes any agent fetch the latest, official,
// verified info from the web (its own web tools) instead of answering from memory.
// Writes a SKILL.md folder into each tool's native skills directory. Vendor-neutral,
// npx-only, zero dependencies. SKILL.md is an open standard read by many tools.

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');

const ROOT = path.join(__dirname, '..');
const VERSION = require(path.join(ROOT, 'package.json')).version;
const SKILL_SRC = path.join(ROOT, 'src', 'skill', 'webplus', 'SKILL.md');
const SKILL_NAME = 'webplus';   // the installed skill folder name
const SKILL_ID = 'webplus';     // frontmatter name — used to verify a folder is ours

const home = (...p) => path.join(os.homedir(), ...p);

// Catalog of skills-compatible tools (verified discovery paths, Jun 2026). Each `dir` is the
// PARENT skills directory; we write `<dir>/webplus/SKILL.md`. `pre` = pre-checked in the
// wizard. `detect` flips it on when the tool's footprint is present. `.agents/skills` is the
// cross-tool open standard read by Codex, Goose, OpenHands and others, so the `agents` entry
// covers all three; Amp also reads it at project scope but has its own global path.
const TARGETS = [
  { id: 'agents',   label: '.agents/skills — universal standard', project: '.agents/skills', global: home('.agents', 'skills'),
    pre: true, keywords: 'codex openai goose block openhands universal standard agents', detect: () => exists('.agents') },
  { id: 'claude',   label: 'Claude Code', project: '.claude/skills', global: home('.claude', 'skills'),
    pre: true, keywords: 'anthropic claude', detect: () => exists('.claude') },
  { id: 'gemini',   label: 'Gemini CLI', project: '.gemini/skills', global: home('.gemini', 'skills'),
    keywords: 'google gemini', detect: () => exists('.gemini') },
  { id: 'copilot',  label: 'GitHub Copilot / VS Code', project: '.github/skills', global: home('.copilot', 'skills'),
    keywords: 'github copilot vscode visual studio microsoft', detect: () => exists('.github') },
  { id: 'cursor',   label: 'Cursor', project: '.cursor/skills', global: home('.cursor', 'skills'),
    keywords: 'cursor', detect: () => exists('.cursor') },
  { id: 'windsurf', label: 'Windsurf', project: '.windsurf/skills', global: home('.codeium', 'windsurf', 'skills'),
    keywords: 'windsurf codeium cascade', detect: () => exists('.windsurf') },
  { id: 'opencode', label: 'OpenCode', project: '.opencode/skills', global: home('.config', 'opencode', 'skills'),
    keywords: 'opencode sst', detect: () => exists('.opencode') },
  { id: 'cline',    label: 'Cline', project: '.cline/skills', global: home('.cline', 'skills'),
    keywords: 'cline', detect: () => exists('.cline') || exists('.clinerules') },
  { id: 'roo',      label: 'Roo Code', project: '.roo/skills', global: home('.roo', 'skills'),
    keywords: 'roo roocode', detect: () => exists('.roo') },
  { id: 'junie',    label: 'JetBrains Junie', project: '.junie/skills', global: home('.junie', 'skills'),
    keywords: 'junie jetbrains intellij', detect: () => exists('.junie') },
  { id: 'amp',      label: 'Amp (Sourcegraph)', project: '.agents/skills', global: home('.config', 'agents', 'skills'),
    keywords: 'amp sourcegraph', detect: () => exists('.agents') },
  { id: 'kiro',     label: 'Kiro (AWS)', project: '.kiro/skills', global: home('.kiro', 'skills'),
    keywords: 'kiro aws amazon', detect: () => exists('.kiro') },
  { id: 'trae',     label: 'TRAE (ByteDance)', project: '.trae/skills', global: null,
    keywords: 'trae bytedance', tag: 'project only', detect: () => exists('.trae') },
  { id: 'tabnine',  label: 'Tabnine', project: '.tabnine/agent/skills', global: home('.tabnine', 'agent', 'skills'),
    keywords: 'tabnine', detect: () => exists('.tabnine') },
  { id: 'factory',  label: 'Factory (Droid)', project: '.factory/skills', global: home('.factory', 'skills'),
    keywords: 'factory droid', detect: () => exists('.factory') },
];

class CancelError extends Error {}

// ---------- core: write / remove the skill folder ----------

function exists(rel) {
  try { fs.accessSync(path.resolve(process.cwd(), rel)); return true; } catch { return false; }
}

function homeExists(file) {
  try { fs.accessSync(file); return true; } catch { return false; }
}

function loadSkill() {
  return fs.readFileSync(SKILL_SRC, 'utf8');
}

// The skills PARENT dir for a target at a scope, or null if none documented.
function dirOf(t, scope) {
  const d = scope === 'global' ? t.global : t.project;
  if (!d) return null;
  return path.isAbsolute(d) ? d : path.resolve(process.cwd(), d);
}

// The folder we actually write/remove: <parent>/webplus.
function skillDirOf(t, scope) {
  const parent = dirOf(t, scope);
  return parent ? path.join(parent, SKILL_NAME) : null;
}

// What writing would do, without writing. 'create' | 'update'.
function planAction(skillDir) {
  return fs.existsSync(path.join(skillDir, 'SKILL.md')) ? 'update' : 'create';
}

// A folder is ours iff it holds a SKILL.md declaring our frontmatter name.
function isOurs(skillDir) {
  try { return new RegExp(`name:\\s*${SKILL_ID}\\b`).test(fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8')); }
  catch { return false; }
}

// Write SKILL.md into <skillDir>. Returns 'created' | 'updated'.
function writeSkill(skillDir, body) {
  const existed = fs.existsSync(path.join(skillDir, 'SKILL.md'));
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), body);
  return existed ? 'updated' : 'created';
}

// Delete ONLY our skill folder, and only if it is ours. Never touch sibling skills.
function removeSkill(skillDir) {
  if (!fs.existsSync(skillDir) || !isOurs(skillDir)) return null;
  fs.rmSync(skillDir, { recursive: true, force: true });
  return 'removed';
}

// ---------- manifest (records exactly what we installed, for clean removal) ----------

function manifestPath(scope) {
  return scope === 'global'
    ? path.join(os.homedir(), '.config', 'webplus', 'manifest.json')
    : path.join(process.cwd(), '.webplus.json');
}

function readManifest(scope) {
  try { return JSON.parse(fs.readFileSync(manifestPath(scope), 'utf8')); } catch { return null; }
}

function writeManifest(scope, entries) {
  const mp = manifestPath(scope);
  const data = { version: VERSION, scope, skills: entries };
  fs.mkdirSync(path.dirname(mp), { recursive: true });
  fs.writeFileSync(mp, JSON.stringify(data, null, 2) + '\n');
}

function clearManifest(scope) {
  try { fs.unlinkSync(manifestPath(scope)); } catch {}
}

// ---------- target resolution ----------

function dedupeByDir(arr) {
  const seen = new Map();
  for (const x of arr) seen.set(x.dir, x);   // last wins; dir is absolute
  return [...seen.values()];
}

function displayPath(p) {
  return p.startsWith(os.homedir()) ? p.replace(os.homedir(), '~') : path.relative(process.cwd(), p) || p;
}

// Resolve selected catalog entries into concrete { id, label, dir } write targets for a scope,
// dropping any that have no documented path at that scope (e.g. TRAE global), and deduping by dir.
function resolveTargets(selected, scope) {
  const out = [];
  for (const t of selected) {
    const dir = skillDirOf(t, scope);
    if (dir) out.push({ id: t.id, label: t.label, dir });
  }
  return dedupeByDir(out);
}

// ---------- apply / undo ----------

function applyInstall(scope, targets, styled = false) {
  const body = loadSkill();
  const results = [];
  for (const t of targets) results.push({ action: writeSkill(t.dir, body), dir: t.dir });

  const prev = readManifest(scope);
  const merged = dedupeByDir([...(prev ? prev.skills : []), ...targets.map(t => ({ id: t.id, dir: t.dir }))]);
  writeManifest(scope, merged.map(m => ({ id: m.id, dir: m.dir })));

  if (styled) {
    for (const r of results) gline(`${c.green(S.tick)} ${c.gray(r.action.padEnd(8))} ${displayPath(r.dir)}/SKILL.md`);
    return;
  }
  console.log(`webplus v${VERSION} — installed the skill into:`);
  for (const r of results) console.log(`  ${r.action.padEnd(8)} ${displayPath(r.dir)}/SKILL.md`);
  console.log('\nDone. Open a new agent session to pick up the skill.');
  console.log('Undo anytime with: npx webplus remove');
}

// Every place a webplus skill lives for a scope: catalog + manifest, that is ours right now.
function findInstalled(scope) {
  const fromCatalog = TARGETS.map(t => ({ id: t.id, dir: skillDirOf(t, scope) })).filter(x => x.dir);
  const man = readManifest(scope);
  const candidates = dedupeByDir([...fromCatalog, ...(man ? man.skills : [])]);
  return candidates.filter(c2 => isOurs(c2.dir));
}

function applyRemove(scope, targets, styled = false) {
  const removed = [];
  for (const t of targets) if (removeSkill(t.dir)) removed.push(displayPath(t.dir));

  if (findInstalled(scope).length === 0) clearManifest(scope);
  else {
    const man = readManifest(scope);
    if (man) {
      const gone = new Set(targets.map(t => t.dir));
      writeManifest(scope, man.skills.filter(s => !gone.has(s.dir)));
    }
  }
  if (styled) {
    for (const d of removed) gline(`${c.green(S.tick)} ${c.gray('removed')} ${d}`);
    return;
  }
  if (removed.length) {
    console.log('webplus — removed the skill from:');
    for (const d of removed) console.log('  ' + d);
  } else {
    console.log('webplus — nothing to remove (no managed skill found).');
  }
}

// ---------- zero-dep clack-style UI (TTY arrow-keys, numbered fallback) ----------

const useColor = out => (out || process.stdout).isTTY && !process.env.NO_COLOR;
const paint = (s, code, out) => useColor(out) ? `\x1b[${code}m${s}\x1b[0m` : s;
const c = {
  gray:  (s, o) => paint(s, 90, o),
  cyan:  (s, o) => paint(s, 36, o),
  green: (s, o) => paint(s, 32, o),
  red:   (s, o) => paint(s, 31, o),
  yellow:(s, o) => paint(s, 33, o),
  bold:  (s, o) => paint(s, 1, o),
  dim:   (s, o) => paint(s, 2, o),
};
const S = { top: '┌', bar: '│', end: '└', step: '◇', on: '◉', off: '◯', radioOn: '●', radioOff: '○', ptr: '❯', tick: '✓' };

function intro(title, output = process.stdout) { output.write(`${c.gray(S.top, output)}  ${c.bold(title, output)}\n${c.gray(S.bar, output)}\n`); }
function outro(text, output = process.stdout) { output.write(`${c.gray(S.bar, output)}\n${c.gray(S.end, output)}  ${text}\n`); }
function gline(text = '', output = process.stdout) { output.write(c.gray(S.bar, output) + (text ? '  ' + text : '') + '\n'); }

function rawOn(input) { readline.emitKeypressEvents(input); if (input.isTTY && input.setRawMode) input.setRawMode(true); }
function rawOff(input, onKey) { input.removeListener('keypress', onKey); if (input.isTTY && input.setRawMode) input.setRawMode(false); }

function checklist({ message, items, input = process.stdin, output = process.stdout, interactive = input.isTTY, pageSize = 12 }) {
  if (!interactive) return numberedChecklist({ message, items, input, output });
  return new Promise((resolve, reject) => {
    const selected = new Set(items.filter(it => it.checked));
    let query = '';
    let idx = 0;
    let lines = 0;
    rawOn(input);

    const filtered = () => {
      if (!query) return items;
      const q = query.toLowerCase();
      return items.filter(it => it.label.toLowerCase().includes(q) || (it.keywords || '').toLowerCase().includes(q));
    };

    const render = () => {
      if (lines && output.isTTY) { readline.moveCursor(output, 0, -lines); readline.clearScreenDown(output); }
      const list = filtered();
      if (idx >= list.length) idx = Math.max(0, list.length - 1);
      let start = 0;
      if (list.length > pageSize) start = Math.min(Math.max(0, idx - Math.floor(pageSize / 2)), list.length - pageSize);
      const end = Math.min(list.length, start + pageSize);

      const search = query ? c.cyan(query, output) + c.cyan('▏', output) : c.gray('type to filter…', output);
      let out = `${c.cyan(S.step, output)}  ${c.bold(message, output)}  ${c.gray('(' + selected.size + ' selected)', output)}\n`;
      out += `${c.gray(S.bar, output)}  ${c.gray('search', output)} ${search}\n`;
      if (!list.length) {
        out += `${c.gray(S.bar, output)}  ${c.yellow('no matches — keep typing or ⌫ to clear', output)}\n`;
      } else {
        if (start > 0) out += `${c.gray(S.bar, output)}  ${c.gray('↑ ' + start + ' more', output)}\n`;
        for (let i = start; i < end; i++) {
          const it = list[i];
          const active = i === idx;
          const ptr = active ? c.cyan(S.ptr, output) : ' ';
          const box = selected.has(it) ? c.green(S.on, output) : c.gray(S.off, output);
          const hint = it.hint ? '  ' + c.gray('·' + it.hint + '·', output) : '';
          const label = active ? it.label : (selected.has(it) ? it.label : c.dim(it.label, output));
          out += `${c.gray(S.bar, output)}  ${ptr} ${box} ${label}${hint}\n`;
        }
        if (end < list.length) out += `${c.gray(S.bar, output)}  ${c.gray('↓ ' + (list.length - end) + ' more', output)}\n`;
      }
      out += `${c.gray(S.bar, output)}  ${c.gray('↑↓ move · space pick · type to search · enter ok · esc cancel', output)}\n`;
      output.write(out);
      lines = out.split('\n').length - 1;
    };
    const done = () => {
      rawOff(input, onKey);
      if (lines && output.isTTY) { readline.moveCursor(output, 0, -lines); readline.clearScreenDown(output); }
      const chosen = items.filter(it => selected.has(it));
      const names = chosen.length === 0 ? 'none' : chosen.length <= 4 ? chosen.map(x => x.shortLabel || x.label).join(', ') : chosen.length + ' selected';
      output.write(`${c.green(S.step, output)}  ${c.bold(message, output)}  ${c.gray('· ' + names, output)}\n`);
      resolve(chosen);
    };
    const onKey = (str, key) => {
      key = key || {};
      const list = filtered();
      if (key.name === 'return' || key.name === 'enter') return done();
      else if (key.name === 'escape' || (key.ctrl && key.name === 'c')) { rawOff(input, onKey); return reject(new CancelError()); }
      else if (key.name === 'up') idx = list.length ? (idx - 1 + list.length) % list.length : 0;
      else if (key.name === 'down') idx = list.length ? (idx + 1) % list.length : 0;
      else if (key.name === 'space') { const it = list[idx]; if (it) selected.has(it) ? selected.delete(it) : selected.add(it); }
      else if (key.name === 'backspace') { query = query.slice(0, -1); idx = 0; }
      else if (str && str.length === 1 && str >= ' ' && !key.ctrl && !key.meta) { query += str; idx = 0; }
      else return;
      render();
    };
    render();
    input.on('keypress', onKey);
  });
}

function numberedChecklist({ message, items, input, output }) {
  const pre = items.map((it, i) => it.checked ? i + 1 : null).filter(Boolean).join(',');
  gline(c.bold(message, output), output);
  items.forEach((it, i) => gline(`${i + 1}) ${it.label}${it.checked ? '  ' + c.gray('·detected·', output) : ''}`, output));
  return question(`${c.gray(S.bar, output)}  numbers (comma-separated, enter = ${pre || 'none'}): `, input, output)
    .then(ans => {
      const picked = ans.trim() ? ans.split(/[\s,]+/).map(n => parseInt(n, 10) - 1) : items.map((it, i) => it.checked ? i : -1);
      return items.filter((_, i) => picked.includes(i));
    });
}

function select({ message, items, input = process.stdin, output = process.stdout }) {
  if (!input.isTTY) {
    gline(c.bold(message, output), output);
    items.forEach((it, i) => gline(`${i + 1}) ${it.label}`, output));
    return question(`${c.gray(S.bar, output)}  choose (enter = 1): `, input, output).then(a => items[(parseInt(a, 10) || 1) - 1]);
  }
  return new Promise((resolve, reject) => {
    let idx = 0, lines = 0;
    rawOn(input);
    const render = () => {
      if (lines && output.isTTY) { readline.moveCursor(output, 0, -lines); readline.clearScreenDown(output); }
      let out = `${c.cyan(S.step, output)}  ${c.bold(message, output)}  ${c.gray('↑↓ move · enter select', output)}\n`;
      items.forEach((it, i) => {
        const active = i === idx;
        const dot = active ? c.green(S.radioOn, output) : c.gray(S.radioOff, output);
        const label = active ? it.label : c.dim(it.label, output);
        out += `${c.gray(S.bar, output)}  ${active ? c.cyan(S.ptr, output) : ' '} ${dot} ${label}\n`;
      });
      output.write(out); lines = out.split('\n').length - 1;
    };
    const onKey = (s, key) => {
      key = key || {};
      if (key.name === 'up' || key.name === 'k') idx = (idx - 1 + items.length) % items.length;
      else if (key.name === 'down' || key.name === 'j') idx = (idx + 1) % items.length;
      else if (key.name === 'return' || key.name === 'enter') {
        rawOff(input, onKey);
        if (lines && output.isTTY) { readline.moveCursor(output, 0, -lines); readline.clearScreenDown(output); }
        output.write(`${c.green(S.step, output)}  ${c.bold(message, output)}  ${c.gray('· ' + items[idx].label, output)}\n`);
        return resolve(items[idx]);
      }
      else if (key.name === 'escape' || (key.ctrl && key.name === 'c')) { rawOff(input, onKey); return reject(new CancelError()); }
      else return;
      render();
    };
    render(); input.on('keypress', onKey);
  });
}

function confirm({ message, def = true, input = process.stdin, output = process.stdout }) {
  if (!input.isTTY) return Promise.resolve(def);
  return new Promise(resolve => {
    rawOn(input);
    output.write(`${c.cyan(S.step, output)}  ${c.bold(message, output)} ${c.gray(def ? '(Y/n)' : '(y/N)', output)} `);
    const onKey = (s, key) => {
      key = key || {};
      let v;
      if (key.name === 'y') v = true;
      else if (key.name === 'n') v = false;
      else if (key.name === 'return' || key.name === 'enter') v = def;
      else if (key.name === 'escape' || (key.ctrl && key.name === 'c')) { rawOff(input, onKey); output.write('\n'); return resolve(def); }
      else return;
      rawOff(input, onKey);
      output.write(c.gray(v ? 'yes' : 'no', output) + '\n');
      resolve(v);
    };
    input.on('keypress', onKey);
  });
}

function question(q, input, output) {
  const rl = readline.createInterface({ input, output });
  return new Promise(res => rl.question(q, ans => { rl.close(); res(ans); }));
}

// ---------- wizards ----------

async function runInstallWizard(opts) {
  intro(`web+  ${c.gray('v' + VERSION)}`);
  let scope = opts.global ? 'global' : opts.local ? 'project' : null;
  if (!scope) {
    const pick = await select({ message: 'Install webplus for', items: [
      { id: 'project', label: 'This project (current folder)' },
      { id: 'global', label: 'Globally (your whole machine)' },
    ] });
    scope = pick.id;
  }

  const items = TARGETS.map(t => {
    const detected = scope === 'global' ? homeExists(dirOf(t, 'global') || '\0') : t.detect();
    const noPath = !dirOf(t, scope);
    return {
      ...t,
      checked: !noPath && (t.pre || detected),
      hint: noPath ? 'no path at this scope' : ((detected && !t.pre) ? 'detected' : (t.tag || null)),
    };
  });
  const selected = await checklist({ message: `Select agents (${scope}) — type to search`, items });
  const targets = resolveTargets(selected, scope);
  if (!targets.length) { outro(c.yellow('Nothing to install (none selected, or no path at this scope).')); return; }

  gline(c.bold('Planned changes'));
  for (const t of targets) {
    const a = planAction(t.dir);
    const tag = a === 'create' ? c.green('create ') : c.cyan('update ');
    gline(`${tag} ${displayPath(t.dir)}/SKILL.md`);
  }
  gline();
  if (!(await confirm({ message: 'Proceed?', def: true }))) { outro(c.yellow('Cancelled. Nothing changed.')); return; }

  applyInstall(scope, targets, true);
  outro(`${c.green('Done.')} Open a new agent session to pick up the skill. Undo: ${c.cyan('npx webplus remove')}`);
}

async function runRemoveWizard(opts) {
  intro(`web+ remove  ${c.gray('v' + VERSION)}`);
  const scopes = opts.global ? ['global'] : opts.local ? ['project'] : ['project', 'global'];
  let found = [];
  for (const s of scopes) found.push(...findInstalled(s).map(t => ({ ...t, scope: s })));
  if (!found.length) { outro('Nothing installed to remove.'); return; }

  const items = found.map(t => ({ ...t, checked: true, label: `${displayPath(t.dir)}  ${c.gray('(' + t.scope + ')')}`, shortLabel: displayPath(t.dir) }));
  const chosen = await checklist({ message: 'Remove webplus from', items });
  if (!chosen.length) { outro(c.yellow('Nothing selected. Nothing changed.')); return; }
  if (!(await confirm({ message: `Remove from ${chosen.length} location(s)? (only our skill folder)`, def: true }))) { outro(c.yellow('Cancelled. Nothing changed.')); return; }

  for (const s of scopes) {
    const forScope = chosen.filter(c2 => c2.scope === s);
    if (forScope.length) applyRemove(s, forScope, true);
  }
  outro(`${c.green('Removed.')} Only webplus's skill folder was deleted; other skills are intact.`);
}

// ---------- commands ----------

function nonInteractiveTargets(opts) {
  const scope = opts.global ? 'global' : 'project';
  let selected;
  if (opts.only) selected = TARGETS.filter(t => opts.only.includes(t.id));
  else if (opts.all) selected = TARGETS.slice();
  else selected = TARGETS.filter(t => (scope === 'global' ? (t.pre || homeExists(dirOf(t, 'global') || '\0')) : (t.pre || t.detect())));
  return { scope, targets: resolveTargets(selected, scope) };
}

async function cmdInit(opts) {
  const wizard = process.stdin.isTTY && !opts.all && !opts.only && !opts.yes;
  if (wizard) {
    try { await runInstallWizard(opts); }
    catch (e) { if (e instanceof CancelError) console.log('\nCancelled. Nothing changed.'); else throw e; }
    return;
  }
  const { scope, targets } = nonInteractiveTargets(opts);
  if (!process.stdin.isTTY && !opts.all && !opts.only)
    console.log('(no interactive terminal — installing detected defaults; use --all/--only to choose)');
  if (!targets.length) { console.log('webplus — nothing to install (no detected agents; try --all or --only).'); return; }
  applyInstall(scope, targets);
}

async function cmdRemove(opts) {
  const wizard = process.stdin.isTTY && !opts.all && !opts.only && !opts.yes;
  if (wizard) {
    try { await runRemoveWizard(opts); }
    catch (e) { if (e instanceof CancelError) console.log('\nCancelled. Nothing changed.'); else throw e; }
    return;
  }
  const scope = opts.global ? 'global' : 'project';
  let targets = findInstalled(scope);
  if (opts.only) targets = targets.filter(t => opts.only.includes(t.id));
  applyRemove(scope, targets);
}

function cmdList() {
  console.log(`webplus v${VERSION} — skills-compatible agent catalog:`);
  for (const t of TARGETS) {
    const on = t.pre || t.detect();
    const g = t.global ? displayPath(skillDirOf(t, 'global')) : '—';
    console.log(`  [${on ? 'x' : ' '}] ${t.id.padEnd(9)} project: ${(t.project + '/webplus').padEnd(30)} global: ${g}${t.detect() && !t.pre ? '  (detected)' : ''}`);
  }
  console.log('\n[x] = pre-selected/detected on a bare `init`. `npx webplus` for the wizard,');
  console.log('`init --all` for every tool, `init --global` for machine-wide. The `agents` entry');
  console.log('(.agents/skills) is the cross-tool standard read by Codex, Goose, OpenHands and more.');
}

function parse(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--all') opts.all = true;
    else if (a === '--global' || a === '-g') opts.global = true;
    else if (a === '--local' || a === '-l') opts.local = true;
    else if (a === '--yes' || a === '-y') opts.yes = true;
    else if (a === '--only') opts.only = (argv[++i] || '').split(',').map(s => s.trim()).filter(Boolean);
    else if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--version' || a === '-v') opts.version = true;
    else opts._.push(a);
  }
  return opts;
}

const HELP = `webplus v${VERSION} — make any agent fetch the latest, official, verified info.

  npx webplus                 Interactive wizard: pick scope + agents, then install
  npx webplus init            Same wizard (auto-detects your agents)
  npx webplus init --all      Non-interactive: install into every catalog tool
  npx webplus init --only ids Install into specific ones (e.g. --only claude,agents,cursor)
  npx webplus init --global   Machine-wide skills dirs (~/.claude/skills, ~/.agents/skills, ...)
  npx webplus init --local    Force project scope (current folder)
  npx webplus remove          Interactive: pick which installs to remove
  npx webplus remove --all    Remove every webplus skill it can find
  npx webplus list            Show the agent catalog and what's detected

Installs a SKILL.md folder into each tool's native skills directory. SKILL.md is an open
standard; the .agents/skills entry covers Codex, Goose, OpenHands and other cross-tool readers.
Remove deletes only webplus's own skill folder, never your other skills.`;

async function main() {
  const opts = parse(process.argv.slice(2));
  if (opts.version) return console.log(VERSION);
  if (opts.help) return console.log(HELP);
  const cmd = opts._[0];
  if (!cmd) return cmdInit(opts);
  switch (cmd) {
    case 'init': return cmdInit(opts);
    case 'remove': case 'uninstall': return cmdRemove(opts);
    case 'list': return cmdList(opts);
    case 'help': return console.log(HELP);
    default:
      console.error(`Unknown command: ${cmd}\n`);
      console.log(HELP);
      process.exit(1);
  }
}

module.exports = { writeSkill, removeSkill, planAction, isOurs, findInstalled, nonInteractiveTargets, resolveTargets, checklist, skillDirOf, manifestPath, TARGETS };

if (require.main === module) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}
