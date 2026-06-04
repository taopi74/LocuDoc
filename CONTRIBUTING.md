# Contributing to LocuDoc

Thanks for helping improve LocuDoc.

## Before you open a PR

1. `npm install`
2. `npm run typecheck`
3. For UI/routing changes: `npm run web`, then `npm run smoke:web` (with the dev server running)

## Scope

- Keep processing **on-device** — no backend, uploads, or API keys in the app.
- Match existing patterns: `useTheme()`, `ThemedText` / `ThemedView`, platform splits as `foo.ts` + `foo.web.ts`.
- See [AGENTS.md](./AGENTS.md) for architecture notes.

## Issues

- Bug: steps to reproduce, platform (web / Android / iOS), expected vs actual
- Feature: describe the user problem, not only the solution

Questions and ideas: [GitHub Issues](https://github.com/taopi74/LocuDoc/issues).
