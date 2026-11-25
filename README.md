# Quran Translation Dashboard

A Persian, right-to-left Quran dashboard for reading Uthmani Arabic with Persian translations, browsing surahs and topics, exploring curated repetition references, and reading Quran analysis articles. It is a static React/TypeScript site: there is no backend, database, or runtime service.

## Requirements

- Node.js 22 or newer
- npm
- The `B Nazanin` font installed locally to use that typeface; other Persian-capable system fonts are fallbacks

## Run locally

```bash
cd frontend
npm ci
npm run dev
```

The development server generates and serves Quran data locally. For a production build:

```bash
npm run lint
npm run build
npm run preview
```

The build is written to `frontend/dist/`.

## Static data

The source data is kept in `quran_surahs/`, `quran_uthmani.json`, and `translations/fa.*.txt`. `npm run prepare:data` validates these sources and generates static JSON assets under `frontend/public/quran-data/`; that generated directory is ignored by Git and included in the site build. The browser fetches only the selected translation and caches loaded data. No secrets or environment configuration are required.

## Deploy to GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds and deploys the site when changes are pushed to `master`. Before its first run, enable Pages once in repository settings: choose **Settings → Pages → Build and deployment → GitHub Actions**, then re-run the failed workflow. `configure-pages` cannot create the Pages site using the default `GITHUB_TOKEN`; enabling it in settings avoids requiring a separate personal access token. If the repository's default branch is not `master`, update the workflow branch.

The build automatically uses the correct base path for a project site (`https://<owner>.github.io/<repository>/`) or an owner site (`https://<owner>.github.io/`). For a custom domain or another deployment path, set the GitHub Actions repository variable `VITE_BASE_PATH` to `/` or to the required path ending in `/`. The workflow copies `index.html` to `404.html` so direct links and refreshed pages continue to work on GitHub Pages.

Navigation remains path-based; pages can be bookmarked or opened in another tab. Examples include `/surahs`, `/surahs/2`, `/repetitions/<word>`, `/topics/animals/ant`, `/topics/prophets/moses`, `/wonders`, and `/wonders/gravity`. When hosted as a project site, these paths are under the repository base path.

## Features and limitations

Surah pages support all available Persian translations, Arabic text, and the translator selector. Topic references and wonders articles are stored in the frontend source and included at build time. The repetition view currently does not have a complete Quran-wide word-count dataset.
