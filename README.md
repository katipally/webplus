# web+

Make any AI coding agent fetch the **latest, official, verified** information from the web instead of answering from stale training memory or random blog spam. It's one [Agent Skill](https://agentskills.io) (a `SKILL.md`) that rides on the web tools your agent already has, so it stays out of the way until a task actually needs current facts, then it spends searches smartly and cites sources with dates.

```bash
npx webplus
```

## What it does

When a task depends on current or external facts (software versions, releases, API/library docs, pricing, news, events, people, orgs, standards), the skill auto-triggers and makes the agent:

- **Get the real date first** — from the system clock or an authoritative timestamp, never its assumed "today," then judge recency against that.
- **Go to the primary source** — official docs, vendor sites, GitHub releases, standards bodies, the org's own announcement. Never content farms, SEO spam, or AI-generated filler.
- **Cross-verify** — confirm in two independent reputable sources before stating a fact; otherwise label it unconfirmed.
- **Be exact** — quote the precise version string or number, and distinguish stable from beta.
- **Never assume** — if access fails or sources conflict, say so and mark the gap unknown instead of guessing.
- **Stay unbiased and cite** — represent sources faithfully, surface disagreement, link every fresh claim with its date.
- **Spend searches wisely** — search only what the question needs, one precise query over many vague ones, fetch only the page that answers it, and stop once it's verified. No tangents, no off-topic detours.

No API key, no extra server. The skill is plain Markdown.

## Install

`SKILL.md` is an open standard, so web+ installs the same skill folder into each tool's own skills directory.

```bash
npx webplus               # wizard: pick project or global scope, then the agents
npx webplus init --all    # every supported tool, non-interactive
npx webplus init --only claude,agents,cursor
npx webplus init --global # machine-wide (~/.claude/skills, ~/.agents/skills, ...)
npx webplus list          # show the catalog and what's detected
npx webplus remove        # delete only web+'s skill folder, nothing else
```

Scope is asked per run; `--global` / `--local` set it for scripts. Re-running is idempotent. `remove` deletes only our own `webplus/` folder (verified by its frontmatter) and never touches your other skills.

## Supported tools (verified paths, Jun 2026)

The `.agents/skills` entry is the cross-tool open standard, read by Codex, Goose, OpenHands and others in one shot.

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
| TRAE | `.trae/skills/` | — (project only) |
| Tabnine | `.tabnine/agent/skills/` | `~/.tabnine/agent/skills/` |
| Factory (Droid) | `.factory/skills/` | `~/.factory/skills/` |

## Manual install (no npx)

Clone or download this repo and copy the skill folder into your agent's skills directory from the table above:

```bash
cp -r src/skill/webplus ~/.claude/skills/        # or any path above
```

That's the whole skill: `src/skill/webplus/SKILL.md`. Edit it freely.

## License

MIT
