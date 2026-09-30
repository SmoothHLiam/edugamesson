# Ossa

A quiet, fast game for learning the bones of the human body. Name, choose or locate
bones on an anatomical plate. No build step and no dependencies: plain HTML, CSS and
ES modules, so it deploys to Vercel as a static site.

## Play

| Mode   | What you do                                                                                     |
| ------ | ----------------------------------------------------------------------------------------------- |
| Type   | A bone is highlighted. Type its anatomical name. Everyday names (kneecap, shin bone) are not accepted: a wrong first answer gets one more try and a small `hint:` popup with the everyday name. |
| Choose | A bone is highlighted. Pick the name from four options (keys 1 to 4).                            |
| Locate | You are given a name. Click the bone; a second try scores less.                                  |
| Legacy | The classic PurposeGames format. Pins sit on the figure; click the pin that matches each name. One click per bone, no retries, no points. |

**Legacy scoring** follows PurposeGames' ranking rather than a points formula: accuracy (percent
right) decides first, time breaks ties, and if both are equal the earlier result keeps the record.
A run only counts once every bone has been answered; quitting is unranked. The HUD shows
Remaining, Correct, Wrong, Accuracy and a stopwatch with tenths of a second.

The other modes use points: 100 per correct answer (60 on a second try), plus a streak bonus,
minus 25 per letter hint.

Three sets share one drawing: **Core** (17 bones), **Extended** (25) and **Complete** (48,
down to individual carpals, tarsals and cranial bones). Filter by region, add a 2 or 5 minute
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
- `js/data.js`: names, notes and the bone hierarchy. `syn` holds accepted anatomical synonyms (cranium, zygoma);
  `everyday` holds folk names that are never accepted and feed the Type-mode hint. `level`, `splitAt` and `parent`
  fold fine bones (say, the scaphoid) into their parent (carpals) at lower difficulties, which is how
  one drawing serves all three sets. Also holds the typed-answer matcher (synonyms, plurals, typo tolerance).
- `js/app.js`: camera (pan, zoom, framing), pins, modes, scoring, timer and results.
- `styles.css`: the glass surfaces. Blur, hairline borders and directional inner highlights only:
  no gradients.
