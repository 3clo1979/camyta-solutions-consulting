# Camyta Solutions Consulting

A distinctive, static consulting website preview. The working brand focuses on discovery, requirements, solution architecture, project leadership, testing, and handoff.

## Status

- **Preview only; not a launched consulting business site.**
- The project brief preview stays local. Send inquiry posts name, reply email and project details to the same-origin Worker, which sends plain-text email through Resend to carlos@camytaconsulting.com only. The visitor receives no automatic email.
- The approved contact email is carlos@camytaconsulting.com. No analytics, customer logos, testimonials, certifications, partner claims, or case studies are included.
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
- Local project-brief preview and editing, with direct inquiry submission.
- Reduced-motion handling, semantic markup, focus states, and mobile navigation.
- Build/test scripts and Cloudflare static-assets configuration.

## Cloudflare deployment

The build command is `npm run build`. Static output is `dist`. The configuration in `wrangler.jsonc` serves `dist` as static assets. The deployment command is `npx wrangler deploy`; this requires appropriate Cloudflare account authorization. The existing Worker is deployed at https://camytaconsulting.com and https://www.camytaconsulting.com; GitHub main triggers builds. Resend is the email transport. Set RESEND_API_KEY only as a Worker secret, using a sending-only key scoped to notify.camytaconsulting.com. Never put it in source, client code, build variables, or logs. Without this secret or rate-limit bindings, submissions fail closed.

The `dist` directory is generated and ignored by Git. Do not store credentials in the repository. `_headers` provides a restrictive CSP, allowing only same-origin browser connections and no native form submission.

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

## Contact protection and limits

The Worker validates and bounds fields and request bytes, checks allowed origins, uses a honeypot, and sends only to the fixed owner address. Provider idempotency protects repeated attempts for the same inquiry for up to 24 hours; the UI disables duplicate sends and preserves the key on uncertain retries. Expired inquiries are rejected. Rate limits are 3 attempts per minute per hashed IP and reply address, plus 10 per minute globally per Cloudflare location. These limits are approximate and do not prevent distributed abuse; shared networks may hit limits. No application database or content logging is used. Cloudflare and Resend process submission data for delivery; Resend provider history and the owner inbox may retain it. Free-tier quotas can stop delivery, and errors remain visible with the direct-email fallback.
