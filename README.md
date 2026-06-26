# web+

Make any AI coding agent fetch the **latest, official, verified** information from the web instead of answering from stale training memory or random blog spam. It's one [Agent Skill](https://agentskills.io) (a `SKILL.md`) that rides on the web tools your agent already has, so it stays out of the way until a task actually needs current facts, then it spends searches smartly and cites sources with dates.

```bash
npx @katipally/webplus
```

## What it does

When a task depends on current or external facts (software versions, releases, API and library docs, pricing, news, events, people, orgs, standards), the skill triggers and makes the agent:

- Get the real date first, from the system clock or an authoritative timestamp, never an assumed "today," then judge recency against it.
- Go to the primary source: official docs, vendor sites, GitHub releases, standards bodies, the org's own announcement, not content farms or SEO spam.
- Cross-verify a fact in two independent reputable sources before stating it, otherwise label it unconfirmed.
- Quote the exact version string or number, and tell stable apart from beta.
- Never assume. If access fails or sources conflict, say so and mark the gap unknown instead of guessing.
- Represent each source faithfully, surface disagreement, and link every fresh claim with its date.
- Spend searches on the question: one precise query over many vague ones, fetch only the page that answers it, stop once it's verified.

No API key, no extra server. The skill is plain Markdown.

## Install

`SKILL.md` is an open standard, so web+ installs the same skill folder into each tool's own skills directory.

```bash
npx @katipally/webplus               # wizard: pick project or global scope, then the agents
npx @katipally/webplus init --all    # every supported tool, non-interactive
npx @katipally/webplus init --only claude,agents,cursor
npx @katipally/webplus init --global # machine-wide (~/.claude/skills, ~/.agents/skills, ...)
npx @katipally/webplus list          # show the catalog and what's detected
npx @katipally/webplus remove        # delete only web+'s skill folder, nothing else
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
| TRAE | `.trae/skills/` | (project only) |
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
