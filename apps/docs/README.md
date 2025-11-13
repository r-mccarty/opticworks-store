# OpticWorks Documentation Site

Hugo-based documentation site using the Geekdocs theme, deployed to Cloudflare Pages.

## Overview

This workspace contains the OpticWorks documentation, built with Hugo static site generator and the Geekdocs theme. It provides comprehensive documentation for developers, API reference, and user guides.

## Features

- **Hugo Static Site Generator**: Fast, modern static site generator
- **Geekdocs Theme**: Clean, documentation-focused theme
- **Search Functionality**: Built-in search with Lunr.js
- **Markdown-based Content**: Easy to write and maintain
- **Cloudflare Pages Deployment**: Automatic deployments on push
- **Version Control**: All docs in Git for complete history

## Directory Structure

```
apps/docs/
├── config/
│   └── config.toml          # Hugo configuration
├── content/
│   ├── _index.md           # Homepage
│   ├── getting-started/    # Getting started guides
│   ├── api/                # API documentation
│   ├── guides/             # How-to guides
│   ├── reference/          # Technical reference
│   └── migration/          # Migration guides
├── static/
│   ├── images/             # Static images
│   └── assets/             # Other static assets
├── themes/
│   └── geekdocs/           # Geekdocs theme (git submodule)
└── README.md
```

## Installation

### Prerequisites

- Hugo Extended (v0.110.0 or later)
- Git

### Setup

```bash
# Install Hugo (macOS)
brew install hugo

# Install Hugo (Linux)
sudo apt-get install hugo

# Clone Geekdocs theme
git submodule add https://github.com/thegeeklab/hugo-geekdoc themes/geekdocs
git submodule update --init --recursive
```

## Development

```bash
# Start dev server (from repository root)
cd apps/docs
hugo server -D

# Or use the monorepo script
pnpm run dev:docs
```

Visit http://localhost:1313 to view the documentation.

## Content Organization

### Content Types

1. **Getting Started** (`content/getting-started/`)
   - Installation guides
   - Quick start tutorials
   - Environment setup

2. **API Documentation** (`content/api/`)
   - REST API reference
   - MedusaJS API endpoints
   - Authentication flows
   - Webhook documentation

3. **Guides** (`content/guides/`)
   - Feature implementation guides
   - Best practices
   - Troubleshooting

4. **Reference** (`content/reference/`)
   - Design system tokens
   - Component library
   - Configuration options
   - Environment variables

5. **Migration** (`content/migration/`)
   - Migration plan
   - Upgrade guides
   - Breaking changes

## Writing Documentation

### Page Front Matter

```markdown
---
title: "Page Title"
description: "Brief description for SEO"
date: 2025-11-13
weight: 10
draft: false
---

# Page Title

Content goes here...
```

### Code Blocks

```markdown
\`\`\`typescript
// TypeScript example
const example = "hello"
\`\`\`

\`\`\`bash
# Bash example
pnpm install
\`\`\`
```

### Admonitions (Callouts)

```markdown
{{< hint type=tip >}}
This is a helpful tip!
{{< /hint >}}

{{< hint type=warning >}}
This is a warning!
{{< /hint >}}

{{< hint type=danger >}}
This is dangerous!
{{< /hint >}}
```

## Configuration

### Hugo Config (`config/config.toml`)

```toml
baseURL = "https://docs.opticworks.com/"
languageCode = "en-us"
title = "OpticWorks Documentation"
theme = "geekdocs"

[params]
  description = "OpticWorks E-commerce Platform Documentation"
  logo = "/images/opticworks-logo.svg"
  author = "OpticWorks Team"

  # Geekdocs theme settings
  geekdocRepo = "https://github.com/opticworks/opticworks"
  geekdocEditPath = "edit/main/apps/docs/content"
  geekdocSearch = true
  geekdocMenuBundle = true
  geekdocToC = 3
  geekdocTagsToMenu = false

[markup]
  [markup.goldmark]
    [markup.goldmark.renderer]
      unsafe = true
  [markup.tableOfContents]
    startLevel = 1
    endLevel = 6
```

## Deployment

### Cloudflare Pages Configuration

**Project Name**: `opticworks-docs`

**Build Settings**:
- Build command: `hugo --minify`
- Build output directory: `public`
- Root directory: `apps/docs`

**Environment Variables**:
```bash
HUGO_VERSION=0.110.0
HUGO_ENV=production
```

### Automatic Deployments

Deployments are triggered automatically via GitHub Actions when changes are pushed to:
- `main` branch → Production deployment
- `develop` branch → Preview deployment

### Manual Deployment

```bash
# Build for production
cd apps/docs
hugo --minify

# Output will be in apps/docs/public/
```

## Search Configuration

The Geekdocs theme includes built-in search powered by Lunr.js. No additional configuration needed.

## TODO: Implementation Checklist

### Phase 1: Hugo Setup
- [ ] Install Hugo and verify version
- [ ] Add Geekdocs theme as git submodule
- [ ] Create `config/config.toml` with OpticWorks branding
- [ ] Test local development server

### Phase 2: Content Migration
- [ ] Migrate `/docs/MIGRATION_PLAN.md` to `content/migration/`
- [ ] Migrate `/docs/CODEBASE_EXPLANATION.md` to `content/reference/`
- [ ] Migrate `/docs/STATE_MANAGEMENT.md` to `content/guides/`
- [ ] Migrate `/docs/API_STUBS.md` to `content/api/`
- [ ] Migrate `/docs/STRIPE_INTEGRATION.md` to `content/guides/`
- [ ] Create Getting Started section with quick start guide

### Phase 3: New Documentation
- [ ] Write MedusaJS integration guide
- [ ] Write Ory Hydra authentication guide
- [ ] Document design system tokens
- [ ] Create component library reference
- [ ] Write deployment guides
- [ ] Create troubleshooting section

### Phase 4: Design Customization
- [ ] Customize Geekdocs theme with OpticWorks branding
- [ ] Add lime green accent colors
- [ ] Update logo and favicon
- [ ] Add custom CSS for brand consistency
- [ ] Test responsive design

### Phase 5: Cloudflare Pages Setup
- [ ] Create Cloudflare Pages project
- [ ] Configure build settings
- [ ] Set up custom domain (docs.opticworks.com)
- [ ] Configure SSL/TLS
- [ ] Test deployment pipeline

### Phase 6: GitHub Actions
- [ ] Create workflow for production deployment
- [ ] Create workflow for preview deployments
- [ ] Add build status badge to README
- [ ] Set up deployment notifications

## Content to Migrate

From the existing `/docs` folder:
1. ✅ `MIGRATION_PLAN.md` → Already created
2. ⬜ `CODEBASE_EXPLANATION.md` → `content/reference/architecture.md`
3. ⬜ `STATE_MANAGEMENT.md` → `content/guides/state-management.md`
4. ⬜ `API_STUBS.md` → `content/api/endpoints.md`
5. ⬜ `STRIPE_INTEGRATION.md` → `content/guides/payment-integration.md`

## Resources

- [Hugo Documentation](https://gohugo.io/documentation/)
- [Geekdocs Theme](https://geekdocs.de/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Markdown Guide](https://www.markdownguide.org/)

## Support

For questions about documentation:
1. Check the Hugo documentation
2. Review Geekdocs theme examples
3. See migration plan at `/docs/MIGRATION_PLAN.md`
