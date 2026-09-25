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

The files here are the site's early static prototype (August 2026), kept as a record of where the design started. They are not published anywhere: the live, production site is **[www.digiblu.com](https://www.digiblu.com)**.
