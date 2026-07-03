# Version 2.6.1

Patch release: the npm package now includes `caption.js`.

## New

- **`hyperaudio-lite/caption` subpath export.** The caption generator ships in the npm tarball with its own type declarations:
  ```javascript
  import { caption } from 'hyperaudio-lite/caption'; // or require()
  const result = caption().init("hypertranscript", "hyperplayer", 37, 21);
  // result.vtt, result.srt, result.data
  ```
  The classic `<script src="js/caption.js">` form is unchanged.

# Version 2.6.0

Bug-fix and API release. Six shipped bugs fixed — including a 2.5.0 regression that broke click-to-play on three players — plus teardown, extensibility and accessibility APIs, a per-tick performance rework, CI, and test coverage for `caption.js`.

## Fixed

- **Play/pause restored on SoundCloud, Video.js and Vimeo** (#245). The abstract-`BasePlayer` change in 2.5.0 removed the HTML5-default `play()`/`pause()` without giving these three subclasses their own, so clicking a word (with the default `playOnClick: true`) threw `play must be implemented by subclasses`. A contract test now verifies every registered player class overrides both.
- **Share-link autoscroll fires on load** (#246). `setupInitialPlayHead()` ran while `autoscroll` was still `false` (the real option value was applied afterwards), so opening a `#transcript=start,end` link highlighted the selection but never scrolled to it.
- **Vimeo binds to its own iframe** (#247). `VimeoPlayer` used `document.querySelector('iframe')` — the first iframe anywhere on the page — instead of the instance's own element.
- **Popover copy button no longer stacks listeners** (#248). Every text selection added another click listener, so one click copied to the clipboard and reopened the dialog once per prior selection.
- **Selections stop at fractional end times** (#249). `checkStatus()` compared `parseInt`-truncated seconds, overshooting a shared selection's end by up to a second.
- **Spotify: no NaN before first update; real pause** (#250). `getTime()` resolved `undefined` until the first `playback_update`; `pause()` used `togglePlay()`, which starts playback when state is out of sync.
- **caption.js: trailing segment no longer dropped** (#258). A transcript ending mid-sentence silently lost its final words — the segment loop only pushed on sentence delimiters.

## New

- **`destroy()`** (#252). Removes every DOM listener the instance added (via an internal `AbortController`), stops the playback polling loop and cancels any in-flight scroll animation. For SPAs that mount/unmount transcripts.
- **`HyperaudioLite.registerPlayer(type, class)`** (#253). Register custom player adapters for a `data-player-type` value without forking; `BasePlayer` is exported to extend. Unknown player types now warn with the list of valid types instead of throwing a raw `TypeError`.
- **`scrollContainer` option** (#254). The element that scrolls to follow playback — an element or element id, defaulting to the transcript as before. Pass `document.scrollingElement` for page-scroll layouts.
- **Keyboard playhead control** (#259). <kbd>Enter</kbd>/<kbd>Space</kbd> on a focused word behaves like a click (add `tabindex` to word elements to make them focusable). Autoscroll respects `prefers-reduced-motion: reduce` by jumping instead of animating.

## Performance

- **Delta class updates** (#251). `updateTranscriptVisualState` no longer rewrites every word's classes and clears every paragraph on each playback tick — only the words that crossed the read/unread boundary are touched (with a self-healing full resync if outside code rewrites the classes), the active word/paragraph are tracked as element references, and `minimizedMode` reuses the already-computed word index. O(words moved) instead of O(transcript length).

## Internal

- **`js/hyperaudio-lite.mjs` is now generated** from `js/hyperaudio-lite.js` via `npm run build` (#256) so the two distributions can't drift; CI verifies it.
- **package.json fixed for npm** (#256): lowercase name, `description`/`repository`/`keywords`, `files` (tarballs no longer ship demos/media), and hand-written TypeScript declarations (`js/hyperaudio-lite.d.ts`) wired into `exports`.
- **CI** (#257): GitHub Actions runs jest and the generated-build check on pushes and PRs.
- **caption.js test coverage** (#258): 11 tests over segmentation, line splitting, orphan fold-back, timing safeguards, VTT/SRT serialisation and `data-d` fallbacks. `caption.js` also moved from `innerText` to `textContent` (identical for plain transcript spans, no layout pass) and gained a CommonJS export guard. This closes long-standing #114.
- **Hygiene** (#255): removed a leftover debug `console.log` and dead code; the clipboard dialog uses `textContent` so selected text can't parse as HTML.

## Migration

- **No required changes.** All new options and methods are additive; defaults are unchanged.
- If you maintain a custom player adapter, note that unknown `data-player-type` values now return `null` (with a console warning) instead of throwing — register your adapter with `HyperaudioLite.registerPlayer()`.

# Version 2.5.2

Patch release: `caption.js` no longer lets a `loadedmetadata` listener persist with a stale caption set (#244).

# Version 2.5.1

Patch release. Focused on the demo wrapper's search behaviour plus a polish pass on the example pages.

## Fixed

- **Search now finds partial words** (#241). `searchPhrase()` in `js/hyperaudio-lite-extension.js` previously required exact equality between a query word and a transcript span; searching `fri` against a transcript containing `Friday` matched nothing. The matcher now uses `.includes()` against the normalised span text, so substrings are surfaced. Multi-word phrases still walk consecutive spans — each phrase word must be contained by the matching span.
- **Search highlight is scoped to the matched run.** The pink (default) / accent-coloured (in the demo pages) highlight now wraps just the matched substring in a `<mark class="search-mark">` rather than the whole word.
- **Search highlight no longer reflows text.** Dropped the 1–2px horizontal padding from `.search-mark` so wrapping a substring doesn't shift surrounding words.

## Changed

- **`js/hyperaudio-lite-extension.js` modernised.** `const`/`let`, arrow functions, optional chaining, `textContent` over `innerHTML` for inserted nodes, and a single source of truth for the punctuation regex. No public API change.
- **CSS class for the search highlight renamed** from `.search-match` to `.search-mark` in `css/hyperaudio-lite-player.css`. The span still gets `.search-match` for any consumer that targets it, but the visual highlight rule now applies to the inner `<mark>`. If you were styling `.search-match` for visual highlight purposes, retarget at `.search-mark`.

## Demos

The example pages have been rebuilt around an iframe-and-shell pattern. Each top-level demo page (`index.html`, `youtube.html`, …) is now a tiny shell that loads the actual demo from `demos/<key>.html`. The shell adds a **View source** panel that fetches and displays the iframed file's HTML inline, plus **Open standalone** and **On GitHub** links. Each demo also gets its own theme — palette, type direction and a single signature element — while the chrome stays consistent. None of this affects the library; it's all under `demos/`, `css/examples.css` and `js/example-nav.js`.

# Version 2.5.0

Refactor release. Four focused improvements; no breaking changes (the positional constructor keeps working — see "Migration" below).

## New

- **Options-object constructor** (#217). `HyperaudioLite` now accepts a self-documenting options object:
  ```javascript
  new HyperaudioLite({
    transcript: "hypertranscript",
    player: "hyperplayer",
    autoScroll: true,
    playOnClick: true,
  });
  ```
  Defaults: `autoScroll: true`, `playOnClick: true`, others `false`. The positional form (`new HyperaudioLite("t", "p", false, true, ...)`) keeps working indefinitely across the 2.x line and emits a throttled console deprecation notice (once per page load). See README for the full options table.
- **ESM and CommonJS distribution** (#218). The library now ships `js/hyperaudio-lite.mjs` alongside the existing classic-script `hyperaudio-lite.js`. `package.json` declares `main`, `module`, and `exports` so bundlers and Node consumers resolve the right file automatically:
  ```javascript
  import { HyperaudioLite } from 'hyperaudio-lite';        // ESM
  const { HyperaudioLite } = require('hyperaudio-lite');   // CJS
  ```
  The classic `<script>` form is unchanged.
- **`scrollOffset` option** (#230). Pixels to subtract from the autoscroll landing point, for layouts whose sticky/overlapping header would otherwise cover the active paragraph. Default `0`. Settable on the instance after construction too.

## Internal

- **`BasePlayer` is now properly abstract** (#214). Its `getTime`/`setTime`/`play`/`pause` methods throw `"must be implemented by subclasses"`; the HTML5 defaults moved into `NativePlayer`. No runtime behaviour change for existing players, but new player adapters can no longer silently inherit broken HTML5 behaviour.

## Migration

- **No required changes.** Existing positional-constructor callers continue to work as before. The deprecation warning is informational only.
- **Recommended migration** to the new options-object form is documented in the README. All 10 bundled demo HTML files have been migrated; they're a good reference.

## Inherited fixes (shipped in 2.4.x, included here)

- Stale `.active` class cleared on rewind/scrub-backward (#231, originally in 2.4.8)
- Off-by-one in `updateTranscriptVisualState`: clicking a word no longer highlights the previous word (#235, originally in 2.4.9)
- Multi-instance YouTube wiring fix (#226, originally in 2.4.7)

# Version 2.4.9

- Fixed a long-standing off-by-one in the transcript visual-state binary search: at exact word boundaries (which is what every word-click produces, since the click sets `currentTime` to the word's exact start), the search returned the matched index and downstream code marked `wordArr[index - 1]` (the **previous** word) as active. Visible as the wrong word lighting up on every word-click with the default `playOnClick: true` setting. Resolves #235.

# Version 2.4.8

- Fixed a stale `.active` class on rewind/scrub-backward: `updateTranscriptVisualState` only removed `active` from words *before* the playhead, so seeking backward left a trail of contradictory `active unread` words ahead of the new position. The else-branch now clears `active` too, and `setPlayHead` was reordered to mark its clicked word after the visual-state update (so the click-while-paused active-mark survives the new sweep). Resolves #231. Bug introduced in v2.4.3 (seek-follow work).

# Version 2.4.7

- Fixed multi-instance YouTube wiring: when more than one HAL instance backed by a YouTube iframe was created on the same page, `window.onYouTubeIframeAPIReady` was overwritten by each new instance, so only the last instance's `YT.Player` actually got set up — leaving earlier instances unable to seek, play, pause, or follow playback. Each instance now chains onto any existing callback (and wires up immediately if the API is already loaded). Resolves #226.

# Version 2.4.6

- `multiplayer.html` demo now coordinates its two players so only one plays at a time — pressing play on either pauses the other. The library itself is unchanged; consumers running multiple instances on a page can apply the same pattern. (See `youtube-multiplayer.html` for a known remaining case of the same UX issue.)

# Version 2.4.5

- Documented the `forceActiveWord` parameter on `updateTranscriptVisualState` in the README, with an example of driving the transcript from a custom seek bar.

# Version 2.4.4

- Word-level `.active` class now updates on scrub-while-paused, so the default `.active > .active` CSS no longer goes blank during a paused scrub. Resolves #220.
- `updateTranscriptVisualState` accepts an optional second argument (`forceActiveWord`) that lets callers opt into adding the word-level `.active` even when paused; `handleSeeked` passes `true`. Other call paths (playback loop, click handler) keep their existing behaviour, so this fixes the seek path without double-highlighting on click-while-paused.

# Version 2.4.3

- Transcript now follows media seeks, including scrub-while-paused — the read/unread visual state and scroll position re-align to the new playhead even when paused. Resolves #222.
- New `pauseAutoscroll()` / `resumeAutoscroll()` methods for temporarily disabling autoscroll (e.g. while a user edits an editable transcript).

# Version 2.4.2

- Modernized Web Monetization integration to use `<link rel="monetization">` per the current Interledger Foundation spec (the previous `<meta name="monetization">` form is no longer supported). Resolves #215, #194.
- README updates clarifying the no-frameworks / no-build-step nature of the library.

# Version 2.4.1

- Bumped transitive dependencies to address 9 Dependabot security alerts.

# Version 2.4.0

- Removed `velocity.js` dependency
- Autoscroll now uses a native `requestAnimationFrame` animation with `easeInOutCubic` easing
- Active paragraph scrolls to the top of the transcript viewport

# Version 2.0.0

- Object based approach to prevent scope leak
- Modern Javascript
- Internet Explorer support dropped (use version 1 for IE support)
- Addition of `doubleClick` variable to specify word click behaviour
- Accomodates live changes to transcript
- Added test setup (Jest) and first tests
