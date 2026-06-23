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
