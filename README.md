# Ossa

A quiet, fast game for learning the bones of the human body. Name, choose or locate
bones on an anatomical plate. No build step and no dependencies: plain HTML, CSS and
ES modules, so it deploys to Vercel as a static site.

## Play

| Mode   | What you do                                                        |
| ------ | ------------------------------------------------------------------ |
| Type   | A bone is highlighted. Type its name. Common names are accepted.   |
| Choose | A bone is highlighted. Pick the name from four options (keys 1 to 4). |
| Locate | You are given a name. Click the bone; a second try scores less.    |

Three sets share one drawing: **Core** (15 bones), **Extended** (25) and **Complete** (48,
down to individual carpals, tarsals and skull bones). Filter by region, add a 2 or 5 minute
clock, and study first by hovering or clicking the figure. Scroll or pinch to zoom, drag to pan.
Bests are stored in `localStorage`.

## Run locally

```sh
npx serve .
# or
python3 -m http.server 8000
```

## Deploy

Import the repository into Vercel with the **Other** framework preset, no build command and no
output directory. `vercel.json` only adds caching and security headers.

## How it is put together

- `js/geom.js`: spline, tapered-tube and blob helpers used to author the skeleton.
- `js/skeleton.js`: the anterior-view skeleton as vector geometry. Paired bones are defined once
  and mirrored. Each drawn bone is a group tagged `data-bone`.
- `js/data.js`: names, aliases, notes and the bone hierarchy. `level`, `splitAt` and `parent`
  fold fine bones (say, the scaphoid) into their parent (carpals) at lower difficulties, which is how
  one drawing serves all three sets. Also holds the typed-answer matcher (aliases, plurals, typo tolerance).
- `js/app.js`: camera (pan, zoom, framing), pins, modes, scoring, timer and results.
- `styles.css`: the glass surfaces. Blur, hairline borders and directional inner highlights only:
  no gradients.
