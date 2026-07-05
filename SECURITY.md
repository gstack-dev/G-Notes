# Security Policy

## Reporting a Vulnerability

G-Notes stores your notes **100% locally** with no network requests, so most security issues are limited to the Electron runtime itself.

If you discover a security vulnerability in G-Notes:

1. **Do not** open a public GitHub issue.
2. Email the maintainer at **george.gstack@gmail.com** with details of the issue.
3. Include steps to reproduce, affected versions, and any potential impact.

You should receive a response within **72 hours**. If you don't, please follow up.

## What to Expect

- I will acknowledge receipt within 3 business days.
- I will investigate and provide an estimated timeline for a fix.
- Once fixed, I will publish a security advisory via GitHub and credit the reporter (if desired).

## Scope

- The Electron app itself (src/, main process, preload scripts)
- Dependencies with known CVEs affecting the runtime behavior

## Out of Scope

- Vulnerabilities in development-only dependencies
- Social engineering attacks against the maintainer

## Preferred Languages

English or Spanish.
