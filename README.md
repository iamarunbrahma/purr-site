<div align="center">

<img src="assets/purr-icon-256.png" alt="Purr" width="96" height="96">

# Purr website

The site for [Purr](https://github.com/iamarunbrahma/purr), a free, MIT-licensed Mac app for dictation, meeting notes and voice editing that runs entirely on your Mac.

[![Netlify Status](https://api.netlify.com/api/v1/badges/9d9bced2-b72e-4930-a389-48616212ee14/deploy-status)](https://app.netlify.com/sites/sauron-purr/deploys)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fpurr.arunbrahma.com&label=purr.arunbrahma.com)](https://purr.arunbrahma.com)
[![Purr release](https://img.shields.io/github/v/release/iamarunbrahma/purr?label=Purr)](https://github.com/iamarunbrahma/purr/releases/latest)

</div>

## Run locally

Plain HTML, CSS and JavaScript, with no build step.

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

Netlify deploys `main` to https://purr.arunbrahma.com, and every pull request gets a preview link.

- Files in `assets/` are cached for a year, so give a changed image a new filename.
- `6271cf5ebad631dc68ee2ceffb3fe3ee.txt` is the IndexNow key. Keep it at the root.
