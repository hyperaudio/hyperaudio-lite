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
