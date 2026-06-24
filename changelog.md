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
