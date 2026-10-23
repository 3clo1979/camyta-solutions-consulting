# Camyta Solutions Consulting

A distinctive, static consulting website preview. The working brand focuses on discovery, requirements, solution architecture, project leadership, testing, and handoff.

## Status

- **Preview only; not a launched consulting business site.**
- The project brief is a **browser-local worksheet**, not a contact form. It sends no data, stores nothing in browser storage, and makes no API requests. Visitors can preview and download their own text brief, or open a draft in their email app addressed to carlos@camytaconsulting.com. They must review and send the email themselves. If the app fails to open or truncates a long draft, the downloadable brief can be attached manually.
- The approved contact email is carlos@camytaconsulting.com. No server-side intake endpoint, phone number, analytics, customer logos, testimonials, certifications, partner claims, or case studies are included.
- Search indexing is disabled through meta robots and robots.txt until launch review.
- Brand wording and service scope are subject to final owner review before launch.

## Run locally

Requires Node.js 22 or later. No npm dependencies or paid tools are needed.

```sh
npm test
npm run build
npm run dev
```

Open the localhost URL printed by the server. Do not open index.html directly from a file browser: module scripts are intended to run through the local HTTP server. Stop the server with Ctrl+C.

## What is included

- Responsive editorial layout and custom blueprint illustration.
- Exact approved raster logo concept, presented using a CSS viewport showing the primary lockup. The source sheet is preserved unchanged; this is not an editable vector master.
- Native expandable service descriptions.
- Accessible keyboard-operated five-phase approach explorer. Document previews are explicitly illustrative.
- Local project-brief preview and text download, without transmission.
- Reduced-motion handling, semantic markup, focus states, and mobile navigation.
- Build/test scripts and Cloudflare static-assets configuration.

## Cloudflare deployment

The build command is `npm run build`. Static output is `dist`. The configuration in `wrangler.jsonc` serves `dist` as static assets. The deployment command is `npx wrangler deploy`; this requires appropriate Cloudflare account authorization. The existing Worker is deployed at https://camytaconsulting.com and https://www.camytaconsulting.com; GitHub main triggers builds. No mail transport is configured. Server-side submissions would require an authorized mail service plus server validation, abuse controls, and delivery testing.

The `dist` directory is generated and ignored by Git. Do not store credentials in the repository. `_headers` provides a restrictive CSP, including no outbound connections or form submission.

## Before public launch

1. Confirm the business name, service scope, and final brand wording.
2. Verify mailbox sending and receiving in Google Workspace.
3. Implement and test a real intake backend, spam controls, validation, retention, and privacy notice, or use a verified contact link.
4. Complete desktop/mobile browser QA and accessibility review.
5. Replace preview notices and enable indexing only after launch approval.
6. Produce an approved production vector/logo asset as a separate design deliverable if needed.

## Files

`index.html`, `styles.css`, `app.js`, `content.js`, `assets/`: website source.
`scripts/`: local build and preview server.
`tests/`: Node test suite for content, behavior helpers, links, assets, and preview safeguards.
`wrangler.jsonc`: deployment configuration, not account credentials.
