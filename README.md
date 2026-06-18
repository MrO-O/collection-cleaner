# collection-cleaner

collection-cleaner is a local-first React app for reviewing saved links, articles, videos, products, courses, papers, repositories, images, and notes. It tracks how long collection items have been idle and helps users decide whether to process, archive, delete, abandon, or convert them.

The app stores data locally in browser IndexedDB through Dexie. It does not use a backend, login, cloud sync, AI API, or browser extension.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

## Use from browser / 在浏览器中使用

### Local development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Development data belongs to that exact browser origin, including the protocol, host, and port.

### Production preview

```bash
npm run build
npm run preview
```

The production build is written to `dist/`. By default, production assets use the `/collection-cleaner/` base path. Override it for another static hosting path when needed:

```bash
VITE_BASE_PATH=/your-repository-name/ npm run build
```

The app uses `HashRouter`, so static hosting does not need a fallback rule for client-side routes and refreshing a detail URL will not produce a route 404.

### Browser bookmark

1. Deploy or open the app at a stable URL.
2. Add that URL to the browser bookmark bar.
3. Open the bookmark later like a normal web tool.

Keep using the same stable URL for real data. Different domains, subdomains, protocols, and ports can have separate browser storage.

### Install as a PWA

On a supported browser, open the app and use the browser's **Install app** or equivalent menu entry. The installed PWA opens in a standalone window and uses the same local browser storage as its installed origin.

### Local data and migration

- Collection items and timeline history are stored in IndexedDB in the current browser.
- Storage is tied to the app's browser origin.
- Switching browsers, devices, profiles, domains, protocols, or ports does not migrate data automatically.
- A future JSON export/import flow will provide explicit backup and migration.

## Deploy to GitHub Pages / 部署到 GitHub Pages

1. Create a GitHub repository and push this project to it. The included workflow runs whenever `main` is pushed.
2. On GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push or merge the deployment commit into `main`. In the **Actions** tab, wait for the **Deploy to GitHub Pages** workflow to finish.
4. Open `https://<username>.github.io/<repository-name>/`. For this repository, the expected path is `https://<username>.github.io/collection-cleaner/`.
5. Add the deployed URL to the browser bookmark bar and use that stable URL every day. You do not need to run `npm run dev`, keep `npm run preview` running, or leave a terminal open.

The workflow sets `VITE_BASE_PATH` from the GitHub repository name, so project Pages assets load from `/<repository-name>/`. Local development continues to use `/`. For a manual build or a different host path, set `VITE_BASE_PATH` to a path with leading and trailing slashes, such as `/my-repo/`. If this repository is instead named `<username>.github.io` and is deployed at the domain root, set `VITE_BASE_PATH=/` in the workflow build step.

Application data remains in IndexedDB for the current browser origin. Changing the URL (including domain, protocol, or port), browser, browser profile, or computer does not migrate that data automatically. Continue using the same Pages URL for real data. A later JSON import/export feature should be used for explicit backup and migration; it is not implemented in this increment.

## Build

```bash
npm run build
```

## Test

```bash
npm run test
```

## Lint

```bash
npm run lint
```

## Demo Data

Demo data is no longer loaded automatically on startup. A new local database starts empty.

Mock data is still kept in `src/data/mockItems.ts` for tests and manual demos. To load it, open Settings and choose **Load demo data**. This replaces current local data after confirmation when data already exists.

## Current Stage

- React, TypeScript, Vite, Tailwind CSS, React Router, Dexie, Vitest, ESLint, and Prettier are configured.
- Collection list, detail, create, edit, status actions, and timeline are implemented.
- Collection data and history persist in local IndexedDB.
- Dashboard recommends up to three deterministic cleanup candidates and supports direct actions.
- Empty Dashboard and CollectionList states are supported.
- Settings includes local data controls for clearing all data and manually loading demo data.

## TODO

- Import flows for bookmarks or structured files.
- More complete cleanup planning and review workflows.
- Better statistics and reporting views.
- More focused component and browser-level tests.
