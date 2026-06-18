# AGENTS.md

## Project

collection-cleaner is a local-first React app for reviewing saved links and identifying content that has been idle too long.
This repository is currently an early frontend skeleton; keep changes small and avoid expanding product scope without an explicit user request.

## Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Production preview: `npm run preview`
- Test: `npm run test`
- Lint: `npm run lint`

## Repository layout

- `src/main.tsx`: React entrypoint and router provider.
- `src/App.tsx`: top-level route definitions.
- `src/layout/`: app shell, header, and navigation layout.
- `src/pages/`: route-level pages.
- `src/data/`: temporary mock data.
- `src/db/`: Dexie reservation point; do not add full persistence unless requested.
- `src/types/`: shared TypeScript domain types.
- `src/utils/`: small pure utilities and their tests.
- `src/styles/`: global Tailwind CSS entry.
- `public/`: favicon and PWA icon assets copied into static builds.

## Working rules

- Keep each task narrowly scoped to the requested change.
- Do not implement unrelated product features in the same task.
- After code changes, run the relevant checks from `package.json`.
- Do not add backend services, login, cloud sync, browser extensions, or AI APIs unless the user explicitly asks.
- Prefer existing project patterns over new abstractions.
- Update README or nearby documentation when behavior or commands change.

## Git workflow

- Keep `main` runnable.
- If currently on `main`, create a focused branch before starting new feature work.
- Use `feat/<short-name>` for features.
- Use `fix/<short-name>` for fixes.
- Use `refactor/<short-name>` for refactors.
- Each branch should handle one clear topic.
- Commit at logical, verified checkpoints.
- Do not mix unrelated features in one commit.
- Before committing, inspect `git diff` and avoid temporary files, logs, build output, or unrelated formatting.
- Prefer running `npm run build`, `npm run test`, and `npm run lint` before commits.
- Do not push unless the user explicitly asks.
- Do not rewrite history with rebase, `reset --hard`, or `commit --amend` unless the user explicitly asks.
- If user-owned uncommitted changes exist, report them and avoid overwriting them.

## Done criteria

- The project builds when relevant.
- Tests pass when relevant.
- Lint passes when relevant.
- Documentation is updated when behavior, setup, or commands change.

## Commit style

Use concise Conventional Commit messages, for example:

- `chore: bootstrap project`
- `feat: add collection list filters`
- `fix: correct dust score calculation`
- `refactor: split collection components`
