<div align="center">

# web+

**Make any AI agent fetch the latest, official, verified facts from the web instead of answering from stale memory.**

One [Agent Skill](https://agentskills.io) that rides on the web tools your agent already has. It stays out of the way until a task needs current facts, then spends searches smartly and cites sources with dates.

[![npm version](https://img.shields.io/npm/v/@katipally/webplus?color=cb3837&logo=npm)](https://www.npmjs.com/package/@katipally/webplus)
[![npm downloads](https://img.shields.io/npm/dm/@katipally/webplus?color=cb3837&logo=npm)](https://www.npmjs.com/package/@katipally/webplus)
[![license](https://img.shields.io/npm/l/@katipally/webplus?color=blue)](LICENSE)
[![node](https://img.shields.io/node/v/@katipally/webplus?color=339933&logo=node.js)](package.json)

```bash
npx @katipally/webplus
```

</div>

---

## The problem

An AI agent answers from training data, and training data goes stale. Ask it for the current version of a library, today's pricing, or a fresh API signature, and it will answer with confidence from a snapshot that's months out of date. Even when it does search, it grabs the first SEO blog instead of the official source and never checks the date.

`web+` fixes the habit. It makes the agent treat "what's true right now" as a question to be verified, not recalled.

## What it does

When a task depends on current or external facts (software versions, releases, API and library docs, pricing, news, events, people, orgs, standards), the skill triggers and makes the agent:

- **Anchor the date.** Get the real date first, from the system clock or an authoritative timestamp, never an assumed "today," then judge recency against it.
- **Go to the source.** Official docs, vendor sites, GitHub releases, standards bodies, the org's own announcement. Not content farms or SEO spam.
- **Cross-verify.** Confirm a fact in two independent reputable sources before stating it, otherwise label it unconfirmed.
- **Quote exactly.** The precise version string or number, with stable told apart from beta.
- **Never assume.** If access fails or sources conflict, say so and mark the gap unknown instead of guessing.
- **Cite faithfully.** Represent each source honestly, surface disagreement, and link every fresh claim with its date.
- **Spend searches well.** One precise query over many vague ones, fetch only the page that answers it, stop once it's verified.

No API key, no extra server. The skill is plain Markdown that rides on the web tools the agent already has.

## Quick start

```bash
npx @katipally/webplus
```

A short wizard: pick scope (this project or your whole machine), pick agents from the catalog (detected ones are pre-checked), preview, confirm.

## How it works

`SKILL.md` is an open standard read by Claude Code, Codex, Cursor, Goose, OpenHands, and more. The agent surfaces the skill by name and pulls the full ruleset into focus the moment a task needs current facts. One file installs the same way into every tool's own skills directory.

## Usage

```bash
npx @katipally/webplus               # wizard: pick project or global scope, then the agents
npx @katipally/webplus init --all    # every supported tool, non-interactive
npx @katipally/webplus init --only claude,agents,cursor
npx @katipally/webplus init --global # machine-wide (~/.claude/skills, ~/.agents/skills, ...)
npx @katipally/webplus list          # show the catalog and what's detected
npx @katipally/webplus remove        # delete only web+'s skill folder, nothing else
```

Scope is asked per run; `--global` / `--local` set it for scripts. Re-running is idempotent. `remove` deletes only our own `webplus/` folder (verified by its frontmatter) and never touches your other skills.

## Supported tools

Verified paths, June 2026. The `.agents/skills` entry is the cross-tool open standard, read by Codex, Goose, OpenHands and others in one shot.

| Tool | Project | Global |
|------|---------|--------|
| `.agents/skills` (Codex, Goose, OpenHands, standard) | `.agents/skills/` | `~/.agents/skills/` |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Gemini CLI | `.gemini/skills/` | `~/.gemini/skills/` |
| GitHub Copilot / VS Code | `.github/skills/` | `~/.copilot/skills/` |
| Cursor | `.cursor/skills/` | `~/.cursor/skills/` |
| Windsurf | `.windsurf/skills/` | `~/.codeium/windsurf/skills/` |
| OpenCode | `.opencode/skills/` | `~/.config/opencode/skills/` |
| Cline | `.cline/skills/` | `~/.cline/skills/` |
| Roo Code | `.roo/skills/` | `~/.roo/skills/` |
| JetBrains Junie | `.junie/skills/` | `~/.junie/skills/` |
| Amp | `.agents/skills/` | `~/.config/agents/skills/` |
| Kiro | `.kiro/skills/` | `~/.kiro/skills/` |
| TRAE | `.trae/skills/` | n/a (project only) |
| Tabnine | `.tabnine/agent/skills/` | `~/.tabnine/agent/skills/` |
| Factory (Droid) | `.factory/skills/` | `~/.factory/skills/` |

### Manual install (no npx)

Clone or download this repo and copy the skill folder into any directory from the table:

```bash
cp -r src/skill/webplus ~/.claude/skills/        # or any path above
```

That's the whole skill: `src/skill/webplus/SKILL.md`. Edit it freely.

## Develop

```bash
npm test
```

## License

[MIT](LICENSE)
