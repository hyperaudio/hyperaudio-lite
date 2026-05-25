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
