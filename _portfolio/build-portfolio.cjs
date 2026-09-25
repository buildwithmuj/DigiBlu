#!/usr/bin/env node
// Builds the buildwithmuj portfolio copy of the DigiBlu website: a static
// export for GitHub Pages at https://buildwithmuj.github.io/DigiBlu/.
//
// The official site is https://www.digiblu.com (source: the DigiBluUK
// repository). This copy is a showcase, built from a released version of
// that source with these differences:
//   - the hero title is "Consulting judgment. Real technical depth.";
//   - there is no contact page or form (GitHub Pages has no server): every
//     "Get in touch" and "Contact Us" opens https://www.digiblu.com/contact;
//   - every page carries a noindex robots tag, and its canonical still points
//     at the www.digiblu.com original, so search engines never list the copy;
//   - no Google Analytics (built without a measurement id);
//   - every root-relative address is rewritten under /DigiBlu/, the project
//     site's path on GitHub Pages.
//
// Usage: node build-portfolio.cjs <official-repo> <tag> <work-dir> <publish-dir>
// It never writes to the official repository: it reads the tagged files with
// `git archive`, then builds in <work-dir>, then copies the site into
// <publish-dir> (a clone of buildwithmuj/DigiBlu), replacing its contents.

const fs = require("node:fs");
const path = require("node:path");
const { execSync, execFileSync } = require("node:child_process");

const [OFFICIAL, TAG, WORK, PUBLISH] = process.argv.slice(2);
if (!OFFICIAL || !TAG || !WORK || !PUBLISH) {
  console.error("usage: node build-portfolio.cjs <official-repo> <tag> <work-dir> <publish-dir>");
  process.exit(1);
}
const BASE = "/DigiBlu";
const CONTACT = "https://www.digiblu.com/contact";
const SRC = path.join(WORK, "src");
const run = (cmd, cwd, env) => execSync(cmd, { cwd, stdio: "inherit", env: { ...process.env, ...env } });

// 1. The tagged source, fresh.
fs.rmSync(SRC, { recursive: true, force: true });
fs.mkdirSync(SRC, { recursive: true });
execSync(`git -C "${OFFICIAL}" archive ${TAG} | tar -x -C "${SRC.replace(/\\/g, "/")}"`, { stdio: "inherit", shell: "bash" });

// 2. The portfolio's differences, as exact edits: if the source has moved
// on, the build stops rather than guessing.
function edit(rel, pairs) {
  const p = path.join(SRC, rel);
  let s = fs.readFileSync(p, "utf8");
  const nl = s.includes("\r\n") ? "\r\n" : "\n"; // git may check out CRLF
  for (const [a0, b0, count = 1] of pairs) {
    const a = a0.split("\n").join(nl), b = b0.split("\n").join(nl);
    const n = s.split(a).length - 1;
    if (n !== count) throw new Error(`${rel}: expected ${count} of ${JSON.stringify(a0.slice(0, 60))}, found ${n}`);
    s = s.split(a).join(b);
  }
  fs.writeFileSync(p, s);
}
edit("components/sections/Hero.tsx", [
  ["<h1><span>Applied AI,</span> <span>real ROI</span></h1>", "<h1>Consulting judgment.<br />Real technical depth.</h1>"],
  ['href="/contact"', `href="${CONTACT}"`, 2],
]);
edit("components/PageHeader.tsx", [['href="/contact"', `href="${CONTACT}"`]]);
edit("components/Footer.tsx", [['href="/contact"', `href="${CONTACT}"`]]);
edit("app/services/page.tsx", [['href="/contact"', `href="${CONTACT}"`]]);
edit("app/layout.tsx", [
  ["  metadataBase: new URL(SITE),\n", "  metadataBase: new URL(SITE),\n  // Portfolio copy: never indexed; each page's canonical names www.digiblu.com.\n  robots: { index: false, follow: false },\n"],
]);
edit("next.config.ts", [
  ["  images: { unoptimized: true },\n", `  images: { unoptimized: true },\n  // Portfolio copy: a static export for GitHub Pages under ${BASE}/.\n  output: "export",\n  basePath: "${BASE}",\n  trailingSlash: true,\n`],
  // A static host sends no headers; the export does not support them.
  ['  async headers() {\n    const headers = NOINDEX ? [...securityHeaders, { key: "X-Robots-Tag", value: "noindex, nofollow" }] : securityHeaders;\n    return [{ source: "/(.*)", headers }];\n  },\n', ""],
]);
// Routes a static host cannot serve, or that only make sense on the real site.
for (const rel of ["app/api", "app/contact", "app/sitemap.ts", "app/robots.ts"]) fs.rmSync(path.join(SRC, rel), { recursive: true, force: true });

// 3. Install and build: no analytics id, no Turnstile key.
run("npx -y pnpm@latest install --frozen-lockfile", SRC);
run("npx -y pnpm@latest build", SRC, { NEXT_PUBLIC_GA_MEASUREMENT_ID: "", NEXT_PUBLIC_TURNSTILE_SITE_KEY: "", NEXT_PUBLIC_ROBOTS: "noindex", SITE_ORIGIN: "" });
const OUT = path.join(SRC, "out");

// 4. Root-relative addresses under /DigiBlu/. Next prefixes its own files
// (_next/...) through basePath; the site's own links, assets and the paths
// in its scripts are written as /x and need the prefix here.
const ROUTE = "(?:assets\\/|services(?=[\"'\\\\/#?])|case-studies(?=[\"'\\\\/#?])|team(?=[\"'\\\\/#?])|accreditations(?=[\"'\\\\/#?])|legal\\/|favicon\\.ico|#)";
const rules = {
  // HTML and the RSC payloads: attributes, and quoted strings in the payload
  // (including escaped quotes inside script strings), plus the bare "/" home link.
  doc: [
    // trailingSlash makes Next write canonical and og:url addresses with a
    // closing "/"; the official site's pages have none (it 308-redirects the
    // slashed form), so the pointer names the exact official address.
    [/(https:\/\/www\.digiblu\.com\/[^"'\s<>\\\/][^"'\s<>\\]*?)\/(?=["'\\])/g, "$1"],
    [new RegExp(`((?:href|src)=")\\/(?!\\/|DigiBlu[\\/"])`, "g"), `$1${BASE}/`],
    [new RegExp(`((?:\\\\)?["'])\\/${ROUTE}`, "g"), (m, q) => m.replace(q + "/", q + BASE + "/")],
    [new RegExp(`((?:\\\\)?"href(?:\\\\)?":(?:\\\\)?")\\/((?:\\\\)?")`, "g"), `$1${BASE}/$2`],
  ],
  // Stylesheets: only /assets/ addresses exist there.
  css: [[/([("'\s,])\/assets\//g, `$1${BASE}/assets/`]],
  // Script chunks: only the site's own route and asset strings; never a bare "/"
  // (the framework's own code uses it).
  js: [[new RegExp(`(["'])\\/${ROUTE}`, "g"), (m, q) => m.replace(q + "/", q + BASE + "/")]],
};
let changed = 0;
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { walk(p); continue; }
    const kind = /\.(html|txt)$/.test(f) ? "doc" : /\.css$/.test(f) ? "css" : /\.js$/.test(f) ? "js" : null;
    if (!kind) continue;
    const before = fs.readFileSync(p, "utf8");
    let s = before;
    for (const [re, to] of rules[kind]) s = s.replace(re, to);
    if (s !== before) { fs.writeFileSync(p, s); changed++; }
  }
})(OUT);
console.log(`prefixed ${BASE} in ${changed} files`);

// 5. Nothing may still point at the host root.
const leftovers = [];
(function scan(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { scan(p); continue; }
    if (!/\.(html|css)$/.test(f)) continue;
    const s = fs.readFileSync(p, "utf8");
    const bad = s.match(/(?:href|src)="\/(?!\/|DigiBlu[\/"])[^"]*"|url\(["']?\/(?!\/|DigiBlu\/)[^)]*\)/g);
    if (bad) leftovers.push(`${path.relative(OUT, p)}: ${[...new Set(bad)].slice(0, 5).join(" ")}`);
  }
})(OUT);
if (leftovers.length) { console.error("root-relative addresses left:\n" + leftovers.join("\n")); process.exit(1); }

// 6. Publish folder: everything but .git replaced by the site.
for (const f of fs.readdirSync(PUBLISH)) if (f !== ".git") fs.rmSync(path.join(PUBLISH, f), { recursive: true, force: true });
fs.cpSync(OUT, PUBLISH, { recursive: true });
fs.writeFileSync(path.join(PUBLISH, ".nojekyll"), ""); // serve _next/ as-is
fs.mkdirSync(path.join(PUBLISH, "_portfolio"), { recursive: true });
fs.copyFileSync(__filename, path.join(PUBLISH, "_portfolio", "build-portfolio.cjs"));
const version = execFileSync("git", ["-C", OFFICIAL, "describe", "--tags", TAG], { encoding: "utf8" }).trim();
fs.writeFileSync(path.join(PUBLISH, "README.md"), `# DigiBlu website: GitHub Pages build

This branch is the built site served at https://buildwithmuj.github.io/DigiBlu/, a portfolio copy.
The source code is on the \`main\` branch. The official site is **https://www.digiblu.com**.

Built from the ${version} release with \`_portfolio/build-portfolio.cjs\`. It differs from the official
site in a few ways: the hero title reads "Consulting judgment. Real technical depth.", "Get in touch"
opens the official contact page, every page asks search engines not to index it and names its
www.digiblu.com original as the canonical address, and it runs no analytics.
`);
console.log(`published ${version} into ${PUBLISH}`);
