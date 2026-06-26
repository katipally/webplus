---
name: webplus
description: >
  Fetches the latest, official, verified information from the web instead of answering from
  memory. Use whenever a task depends on current or external facts: software versions, releases,
  API or library docs, pricing, news, events, people, organizations, standards, or anything about
  the current state of the world. Establishes the real current date, then cross-checks primary
  sources and cites them with dates.
license: MIT
---

# web+: get the latest, official, verified facts

Use the web tools this agent already has: web search, fetch, or native browse.

## First, get the real date
Before judging what is "current" or "latest," establish today's actual date. Run the system clock
if you can (e.g. a `date` command), otherwise read it off a timestamp on an authoritative page.
Don't assume today's date from training, your internal sense of "now" can be wrong. Anchor every
recency judgment to the real date you obtained.

## When this applies
Any claim about the current state of the world: software versions and releases, API or library
docs, prices, news, events, people, organizations, standards, "what is newest." Don't answer such
things from training memory, verify on the web first. If a fact is stable and timeless (basic math,
settled history, language syntax that hasn't changed), answer directly, no search needed.

## How to source
- **Go to the primary source.** Rank: official docs / vendor site / GitHub releases / standards
  body / regulator or government / the org's own announcement > reputable secondary reporting >
  forums and blogs. Never treat content farms, SEO spam, or AI-generated filler as authority.
- **Cross-verify.** Confirm a fact in at least two independent reputable sources before stating it.
  A single source means you label it single-source / unconfirmed.
- **Date discipline.** Check each page's publish or update date against the real current date.
  Prefer the most recent authoritative version. Prefer canonical URLs (the official `/latest/`
  docs, the real changelog) over old mirrors. State the as-of date in your answer. Watch for stale
  caches and outdated tutorials.
- **Be exact.** Quote the precise version string, number, or date from the source rather than
  paraphrasing. Distinguish stable from beta / pre-release and say which one you mean.
- **Resolve conflicts by authority and recency, not popularity.** When credible sources disagree,
  prefer the more authoritative and more recent, and report the disagreement.

## Honesty
- **Never assume.** If web access is unavailable, or sources conflict and can't be reconciled, say
  so plainly. Give what's verified and mark the rest unknown. Don't fill gaps with confident guesses.
- **Stay unbiased.** Gather before concluding. Represent each source faithfully, don't cherry-pick
  to fit a prior, and surface credible disagreement instead of hiding it.
- **Cite.** Every fresh claim gets the exact source URL and its date.

## Spend searches wisely
Every search and fetch costs tokens, so spend them on the question, not around it.
- Search only what the task actually needs. Skip tangents, background trivia, and off-topic detours.
- Write one precise query (exact product, version, and the real date) instead of many vague ones.
  Refine a weak query rather than firing the same idea repeatedly.
- Fetch only the one or two pages that answer the question, then extract the answer. Don't pull
  whole pages or chase every link.
- Stop once the claim is verified. More searching after a confident, cross-checked answer is waste.
