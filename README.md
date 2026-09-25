# DigiBlu: website redesign and rebuild

**Live at [www.digiblu.com](https://www.digiblu.com)** · September 2026

A new website for a UK AI and digital transformation consultancy: redesigned and rebuilt from scratch, fast, accessible, and live.

**Next.js · Cloudflare Workers · Accessibility · SEO**

---

DigiBlu is a UK consultancy that helps organisations put AI and automation to work. Its old website ran on Wix and didn't reflect the business. I designed and built its replacement, from the first prototype through to launch, working with DigiBlu's leadership on content and with their developer on hosting and deployment.

## What I delivered

- **Design:** a dark and light theme, a brand system documented as a style guide, and signature touches such as an animated dot pattern that forms the DigiBlu mark.
- **A site that's easy to find and share:** its own page for every service, case study, team profile and accreditation, each with its own search description, share image and structured data. Every address on the old site redirects to its new home, so no links broke at launch.
- **Accessibility:** built to WCAG 2.2 AA. Text contrast was checked in both themes, and the site works by keyboard alone, respects reduced-motion settings and fits screens from 320px wide.
- **Privacy-first analytics:** Google Analytics loads only after a visitor agrees, and enquiries are counted without recording anything the visitor typed.
- **A working contact form:** spam protection with Cloudflare Turnstile, and enquiries delivered by email.
- **Speed and security:** pages served from Cloudflare's global network, with strict security headers. In pre-launch testing it scored 100 on desktop performance and 100 for accessibility, best practices and SEO.

## Built with

Next.js 16, React, Cloudflare Workers, Markdown content, Google Analytics 4 with Consent Mode, Cloudflare Turnstile, Azure Communication Services, GitHub Actions.

## About this repository

This is the site's source code as released in v2.6.2 (September 2026), shared as part of my portfolio. The live, production site is **[www.digiblu.com](https://www.digiblu.com)**, deployed from DigiBlu's own repository, so this copy is not updated automatically. DigiBlu's deployment pipeline and internal working notes are not included.

| Folder | Holds |
|---|---|
| `app/` | The pages and the contact form's API; `globals.css` is the stylesheet |
| `components/` | The page sections, and the scripts behind the animations and interactions |
| `content/` | All the copy, as Markdown: case studies, services, team, accreditations, legal documents |
| `lib/` | Content loading, the contact form's checks and email, cookie consent and analytics |
| `public/assets/` | Images, logos, the font and the share cards |
| `scripts/` | The content build and the tests |
| `BRAND.md` | The brand and design-system guide |

## Running it locally

Needs Node 24 and pnpm.

```bash
pnpm install
pnpm dev     # http://localhost:3000
pnpm test    # content and contact-form tests
```

The contact form needs its keys to send (see `.env.example`); everything else runs without them.
