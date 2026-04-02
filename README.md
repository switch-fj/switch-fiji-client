# Switch Fiji Client Monorepo

This repo is a pnpm workspace with multiple Next.js apps and shared packages.

## Structure

- apps/client
- apps/engineer
- apps/finance
- packages/ui
- packages/auth

## Getting started

Install from the repo root:

```bash
pnpm install
```

Run an app from the root:

```bash
pnpm dev
pnpm dev:engineer
pnpm dev:finance
```

## Shared packages

- `@switch-fiji/ui` for reusable UI components.
- `@switch-fiji/auth` for auth flows.

## Conventions

- Run installs only at the repo root.
- Prefer workspace deps (`workspace:*`) for internal packages.
