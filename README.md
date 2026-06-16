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
- Empty Dashboard and CollectionList states are supported.
- Settings includes local data controls for clearing all data and manually loading demo data.

## TODO

- Import flows for bookmarks or structured files.
- More complete cleanup planning and review workflows.
- Better statistics and reporting views.
- More focused component and browser-level tests.
