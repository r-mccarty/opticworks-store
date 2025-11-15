# OpticWorks Docs Site (Track T3)

Static Hugo site that renders the Markdown content in `/docs/` with the Geekdoc theme.

## Requirements

- [Hugo Extended](https://gohugo.io/installation/) v0.125+
- Git submodule for the Geekdoc theme:
  ```bash
  cd platform/docs-site
  git submodule add https://github.com/thegeeklab/hugo-geekdoc themes/geekdoc
  git submodule update --init --recursive
  ```

## Commands

```bash
# From repo root
pnpm docs:dev    # hugo server -s platform/docs-site -D
pnpm docs:build  # hugo -s platform/docs-site
```

`hugo.toml` mounts the root `/docs` folder into `content/docs`, so edits to the existing Markdown files automatically show up in the Hugo site with no copying required.

## Deployment

- Use Cloudflare Pages, Netlify, or Vercel static hosting.
- Example (Cloudflare Pages):
  - Build command: `pnpm docs:build`
  - Build directory: `platform/docs-site/public`
  - Set environment variable `HUGO_VERSION` to the installed version.

## TODO

- Add Geekdoc theme as a submodule.
- Configure search index + custom styling.
- Hook docs build into CI (Track T5).
