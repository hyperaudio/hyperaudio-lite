/*! (C) The Hyperaudio Project. MIT @license: en.wikipedia.org/wiki/MIT_License. */
/*! Version 2.6.2 */

'use strict';

// Base player class to handle common player functionality
class BasePlayer {
  constructor(instance) {
    this.player = this.initPlayer(instance); // Initialize the player
    this.paused = true; // Set initial paused state
    if (this.player) {
      this.attachEventListeners(instance); // Attach event listeners for play and pause
    }
  }

  // Method to initialize the player - to be implemented by subclasses
  initPlayer(instance) {
    throw new Error('initPlayer method should be implemented by subclasses');
  }

  // Method to attach common event listeners
  attachEventListeners(instance) {
    const opts = { signal: instance.listenerController.signal };
    this.player.addEventListener('pause', instance.pausePlayHead.bind(instance), opts);
    this.player.addEventListener('play', instance.preparePlayHead.bind(instance), opts);
    this.player.addEventListener('seeked', instance.handleSeeked.bind(instance), opts);
  }

  // Contract methods — subclasses must implement these for their player's API.
  // BasePlayer is intentionally abstract; previous HTML5 defaults now live in
  // NativePlayer so non-native subclasses can't silently inherit wrong behaviour.
  getTime() {
    throw new Error('getTime must be implemented by subclasses');
  }

  setTime(seconds) {
    throw new Error('setTime must be implemented by subclasses');
  }

  play() {
    throw new Error('play must be implemented by subclasses');
  }

  pause() {
    throw new Error('pause must be implemented by subclasses');
  }
}

// Class for native HTML5 player
class NativePlayer extends BasePlayer {
  // Initialize the native HTML5 player
  initPlayer(instance) {
    return instance.player;
  }

  getTime() {
    return Promise.resolve(this.player.currentTime);
  }

  setTime(seconds) {
    this.player.currentTime = seconds;
  }

  play() {
    this.player.play();
    this.paused = false;
  }

  pause() {
    this.player.pause();
    this.paused = true;
  }
}

// Class for SoundCloud player
class SoundCloudPlayer extends BasePlayer {
  // Initialize the SoundCloud player
  initPlayer(instance) {
    return SC.Widget(instance.player.id);
  }

  // Attach event listeners specific to SoundCloud player
  attachEventListeners(instance) {
    this.player.bind(SC.Widget.Events.PAUSE, instance.pausePlayHead.bind(instance));
    this.player.bind(SC.Widget.Events.PLAY, instance.preparePlayHead.bind(instance));
  }

  // Get the current time of the SoundCloud player
  getTime() {
    return new Promise(resolve => {
      this.player.getPosition(ms => resolve(ms / 1000));
    });
  }

  // Set the current time of the SoundCloud player
  setTime(seconds) {
    this.player.seekTo(seconds * 1000);
  }

  // Play the SoundCloud track
  play() {
    this.player.play();
    this.paused = false;
  }

  // Pause the SoundCloud track
  pause() {
    this.player.pause();
    this.paused = true;
  }
}

// Class for VideoJS player
class VideoJSPlayer extends BasePlayer {
  // Initialize the VideoJS player
  initPlayer(instance) {
    return videojs.getPlayer(instance.player.id);
  }

  // Get the current time of the VideoJS player
  getTime() {
    return Promise.resolve(this.player.currentTime());
  }

  // Set the current time of the VideoJS player
  setTime(seconds) {
    this.player.currentTime(seconds);
  }

  // Play the VideoJS player
  play() {
    this.player.play();
    this.paused = false;
  }

  // Pause the VideoJS player
  pause() {
    this.player.pause();
    this.paused = true;
  }
}

// Class for Vimeo player
class VimeoPlayer extends BasePlayer {
  // Initialize the Vimeo player
  initPlayer(instance) {
    // Use the instance's own iframe — document.querySelector('iframe') bound
    // to the first iframe anywhere on the page (#247).
    return new Vimeo.Player(instance.player);
  }

  // Attach event listeners specific to Vimeo player
  attachEventListeners(instance) {
    this.player.ready().then(instance.checkPlayHead.bind(instance));
    this.player.on('play', instance.preparePlayHead.bind(instance));
    this.player.on('pause', instance.pausePlayHead.bind(instance));
  }

  // Get the current time of the Vimeo player
  getTime() {
    return this.player.getCurrentTime();
  }

  // Set the current time of the Vimeo player
  setTime(seconds) {
    this.player.setCurrentTime(seconds);
  }

  // Play the Vimeo video
  play() {
    this.player.play();
    this.paused = false;
  }

  // Pause the Vimeo video
  pause() {
    this.player.pause();
    this.paused = true;
  }
}

// Class for YouTube player
class YouTubePlayer extends BasePlayer {
  // Initialize the YouTube player by loading YouTube IFrame API
  initPlayer(instance) {
    // Defer attaching event listeners until the player is ready
    this.isReady = false;

    // Load the YouTube IFrame API script
    if (!document.getElementById('iframe-demo')) {
      const tag = document.createElement('script');
      tag.id = 'iframe-demo';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // If the API has already loaded (e.g. another instance was created first
    // and the script has finished loading), wire up immediately. Otherwise
    // chain onto any existing onYouTubeIframeAPIReady so multiple instances on
    // the same page don't clobber each other's setup.
    if (window.YT && window.YT.Player) {
      this.onYouTubeIframeAPIReady(instance);
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === 'function') prev();
        this.onYouTubeIframeAPIReady(instance);
      };
    }
  }

  // Callback when YouTube IFrame API is ready
  onYouTubeIframeAPIReady(instance) {
    this.player = new YT.Player(instance.player.id, {
      events: {
        onStateChange: this.onPlayerStateChange.bind(this, instance),
        onReady: this.onPlayerReady.bind(this)
      }
    });
  }

  // Event handler when the YouTube player is ready
  onPlayerReady() {
    this.isReady = true;
  }

  // Handle YouTube player state changes (play, pause)
  onPlayerStateChange(instance, event) {
    if (event.data === YT.PlayerState.PLAYING) { // Playing
      instance.preparePlayHead();
      this.paused = false;
    } else if (event.data === YT.PlayerState.PAUSED) { // Paused
      instance.pausePlayHead();
      this.paused = true;
    }
  }

  // Get the current time of the YouTube player
  getTime() {
    if (this.isReady) {
      return Promise.resolve(this.player.getCurrentTime());
    } else {
      return Promise.resolve(0); // Return 0 if the player is not ready
    }
  }

  // Set the current time of the YouTube player
  setTime(seconds) {
    if (this.isReady) {
      this.player.seekTo(seconds, true);
    }
  }

  // Play the YouTube video
  play() {
    if (this.isReady) {
      this.player.playVideo();
    }
  }

  // Pause the YouTube video
  pause() {
    if (this.isReady) {
      this.player.pauseVideo();
    }
  }
}

// Class for Spotify player
class SpotifyPlayer extends BasePlayer {
  // Initialize the Spotify player by setting up the Spotify IFrame API
  initPlayer(instance) {
    // Known position before the first playback_update arrives — getTime()
    // used to resolve undefined and propagate NaN downstream (#250).
    this.currentTime = 0;

    window.onSpotifyIframeApiReady = IFrameAPI => {
      const element = document.getElementById(instance.player.id);
      const srcValue = element.getAttribute('src');
      const episodeID = this.extractEpisodeID(srcValue);

      const options = { uri: `spotify:episode:${episodeID}` };
      const callback = player => {
        this.player = player;
        player.addListener('playback_update', e => {
          if (e.data.isPaused !== true) {
            this.currentTime = e.data.position / 1000;
            instance.preparePlayHead();
            this.paused = false;
          } else {
            instance.pausePlayHead();
            this.paused = true;
          }
        });

        player.addListener('ready', () => {
          player.togglePlay(); // Priming the playhead
          instance.checkPlayHead();
        });
      };

      IFrameAPI.createController(element, options, callback);
    };
  }

  // Extract episode ID from the Spotify URL
  extractEpisodeID(url) {
    const match = url.match(/episode\/(.+)$/);
    return match ? match[1] : null;
  }

  // Get the current time of the Spotify player
  getTime() {
    return Promise.resolve(this.currentTime);
  }

  // Set the current time of the Spotify player
  setTime(seconds) {
    this.player.seek(seconds);
  }

  // Play the Spotify track
  play() {
    this.player.play();
    this.paused = false;
  }

  // Pause the Spotify track
  pause() {
    // Prefer the controller's real pause — togglePlay() STARTED playback
    // whenever internal state was out of sync with the widget (#250).
    if (typeof this.player.pause === 'function') {
      this.player.pause();
    } else {
      this.player.togglePlay();
    }
    this.paused = true;
  }
}

// Mapping player types to their respective classes
const hyperaudioPlayerOptions = {
  "native": NativePlayer,
  "soundcloud": SoundCloudPlayer,
  "youtube": YouTubePlayer,
  "videojs": VideoJSPlayer,
  "vimeo": VimeoPlayer,
  "spotify": SpotifyPlayer
};

// Factory function to create player instances
function hyperaudioPlayer(playerType, instance) {
  if (!playerType) {
    console.warn("HYPERAUDIO LITE WARNING: data-player-type attribute should be set on player if not native, e.g., SoundCloud, YouTube, Vimeo, VideoJS");
    return null;
  }

  const PlayerClass = hyperaudioPlayerOptions[playerType];
  if (!PlayerClass) {
    // A typo used to surface as a raw TypeError ("not a constructor") with
    // no hint of the cause (#253).
    console.warn(
      `HYPERAUDIO LITE WARNING: unknown data-player-type "${playerType}" — ` +
      `valid types are: ${Object.keys(hyperaudioPlayerOptions).join(', ')}`
    );
    return null;
  }

  return new PlayerClass(instance);
}

// Main class for HyperaudioLite functionality
class HyperaudioLite {
  // Constructor accepts EITHER form:
  //   new HyperaudioLite({ transcript, player, autoScroll, ... })   -- recommended
  //   new HyperaudioLite(transcriptId, mediaElementId, ...flags)    -- deprecated, kept for BC
  // The positional form continues to work indefinitely across the 2.x line.
  constructor(...args) {
    let opts;
    if (typeof args[0] === 'object' && args[0] !== null) {
      // Options-object form. Apply sensible defaults so common cases stay short.
      opts = {
        minimizedMode: false,
        autoScroll: true,
        doubleClick: false,
        webMonetization: false,
        playOnClick: true,
        scrollOffset: 0,
        scrollContainer: null,
        ...args[0],
      };
    } else {
      // Legacy positional form. Pass values through without applying defaults
      // so existing callers get identical behaviour (undefined stays undefined).
      HyperaudioLite._warnPositionalOnce();
      const [transcript, player, minimizedMode, autoScroll, doubleClick, webMonetization, playOnClick] = args;
      opts = { transcript, player, minimizedMode, autoScroll, doubleClick, webMonetization, playOnClick };
    }

    this.transcript = document.getElementById(opts.transcript);
    // Every DOM listener this instance adds is registered against this
    // signal, so destroy() can remove them all in one call.
    this.listenerController = new AbortController();
    this.init(opts.player, opts.minimizedMode, opts.autoScroll, opts.doubleClick, opts.webMonetization, opts.playOnClick, opts.scrollContainer);
    // scrollOffset is read directly by scrollToParagraph; consumers can also
    // set/change it on the instance after construction (e.g. for layouts that
    // resize their sticky header).
    this.scrollOffset = opts.scrollOffset || 0;

    // Ensure correct binding for class methods
    this.preparePlayHead = this.preparePlayHead.bind(this);
    this.pausePlayHead = this.pausePlayHead.bind(this);
    this.setPlayHead = this.setPlayHead.bind(this);
    this.checkPlayHead = this.checkPlayHead.bind(this);
    this.clearTimer = this.clearTimer.bind(this);
    this.handleSeeked = this.handleSeeked.bind(this);
  }

  // Register a custom player class for a data-player-type value (#253).
  // The class should extend BasePlayer — or at minimum accept the
  // HyperaudioLite instance in its constructor and implement
  // getTime/setTime/play/pause.
  static registerPlayer(type, playerClass) {
    hyperaudioPlayerOptions[type] = playerClass;
  }

  // Throttled deprecation warning — fires at most once per page load
  // regardless of how many positional-form constructions happen.
  static _warnPositionalOnce() {
    if (HyperaudioLite._positionalWarned) return;
    HyperaudioLite._positionalWarned = true;
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(
        'HyperaudioLite: the positional-argument constructor is deprecated. ' +
        'Pass an options object instead — see the README. The positional form ' +
        'continues to work across the 2.x line.'
      );
    }
  }

  // Initialize the HyperaudioLite instance
  init(mediaElementId, minimizedMode, autoscroll, doubleClick, webMonetization, playOnClick, scrollContainer) {
    this.setupTranscriptHash();
    this.setupPopover();
    this.setupPlayer(mediaElementId);
    this.setupTranscriptWords();
    this.setupEventListeners(doubleClick, playOnClick);
    this.setupAutoScroll(autoscroll, scrollContainer);
    this.minimizedMode = minimizedMode;
    this.webMonetization = webMonetization;
    // Must run AFTER setupAutoScroll: a share-link hash scrolls the selection
    // into view only when the autoscroll setting is already in place (#246).
    this.setupInitialPlayHead();
  }

  // Setup hash for transcript selection
  setupTranscriptHash() {
    const windowHash = window.location.hash;
    const hashVar = windowHash.substring(1, windowHash.indexOf('='));

    if (hashVar === this.transcript.id) {
      this.hashArray = windowHash.substring(this.transcript.id.length + 2).split(',');
    } else {
      this.hashArray = [];
    }
  }

  // Setup the popover for text selection
  setupPopover() {
    if (typeof popover !== 'undefined') {
      // Current selection, shared with the one-time button listener below.
      this.selectionText = '';
      const listenerOpts = { signal: this.listenerController.signal };

      this.transcript.addEventListener('mouseup', () => {
        const selection = window.getSelection();
        const popover = document.getElementById('popover');

        if (selection.toString().length > 0) {
          this.selectionText = selection.toString().replaceAll("'", "`");
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          popover.style.left = `${rect.left + window.scrollX}px`;
          popover.style.top = `${rect.bottom + window.scrollY}px`;
          popover.style.display = 'block';

          const mediaFragment = this.getSelectionMediaFragment();

          if (mediaFragment) {
            document.location.hash = mediaFragment;
          }
        } else {
          popover.style.display = 'none';
        }
      }, listenerOpts);

      // Attach the copy/confirm listeners ONCE. Adding them inside the
      // mouseup handler stacked a new listener per selection, so a single
      // click copied to the clipboard N times and reopened the dialog N
      // times (#248).
      const popoverBtn = document.getElementById('popover-btn');
      popoverBtn.addEventListener('click', (e) => {
        document.getElementById('popover').style.display = 'none';
        let cbText = `${this.selectionText} ${document.location}`;
        navigator.clipboard.writeText(cbText);

        const dialog = document.getElementById("clipboard-dialog");
        // textContent: cbText contains arbitrary selected text — don't let it
        // parse as HTML.
        document.getElementById("clipboard-text").textContent = cbText;
        dialog.showModal();

        e.preventDefault();
        return false;
      }, listenerOpts);

      const confirmButton = document.getElementById("clipboard-confirm");
      confirmButton.addEventListener("click", () => {
        document.getElementById("clipboard-dialog").close();
      }, listenerOpts);
    }
  }

  // Setup the media player
  setupPlayer(mediaElementId) {
    this.player = document.getElementById(mediaElementId);
    const mediaSrc = this.transcript.querySelector('[data-media-src]');
    if (mediaSrc) {
      this.player.src = mediaSrc.getAttribute('data-media-src');
    }

    if (this.player.tagName === 'VIDEO' || this.player.tagName === 'AUDIO') {
      this.playerType = 'native';
    } else {
      this.playerType = this.player.getAttribute('data-player-type');
    }

    this.myPlayer = hyperaudioPlayer(this.playerType, this);
  }

  // Setup the transcript words
  setupTranscriptWords() {
    const words = this.transcript.querySelectorAll('[data-m]');
    this.wordArr = this.createWordArray(words);

    // check for elements with data-m attributes that are not directly below <section>
    // these will contain <p> or similar that we can scroll to

    for (const word of words) {
      let parentTagName = word.parentElement.tagName;
      if (parentTagName !== "SECTION") {
        this.parentTag = parentTagName;
        break;
      }
    }

    this.parentElements = this.transcript.getElementsByTagName(this.parentTag);
  }

  setupAutoScroll(autoscroll, scrollContainer) {
    this.autoscroll = autoscroll;
    // scrollContainer option: an element or an element id (#254). Defaults to
    // the transcript element itself. For layouts where the page scrolls
    // rather than the transcript, pass document.scrollingElement.
    if (typeof scrollContainer === 'string') {
      this.scrollContainer = document.getElementById(scrollContainer) || this.transcript;
    } else if (scrollContainer) {
      this.scrollContainer = scrollContainer;
    } else {
      this.scrollContainer = this.transcript;
    }
  }

  // Setup event listeners for interactions
  setupEventListeners(doubleClick, playOnClick) {
    // NOTE: minimizedMode / autoscroll / webMonetization are set by init() —
    // resetting them here clobbered the real option values for any setup step
    // that ran in between (#246).
    this.doubleClick = doubleClick;
    this.playOnClick = playOnClick;
    this.highlightedText = false;
    this.start = null;

    const playHeadEvent = doubleClick ? 'dblclick' : 'click';
    const opts = { signal: this.listenerController.signal };
    this.transcript.addEventListener(playHeadEvent, this.setPlayHead.bind(this), opts);
    this.transcript.addEventListener(playHeadEvent, this.checkPlayHead.bind(this), opts);

    // Keyboard support (#259): Enter or Space on a focused word behaves like
    // a click. Words are spans, so they aren't focusable by default — give
    // them tabindex="0" in your transcript markup to enable this.
    this.transcript.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') {
        return;
      }
      if (!e.target.dataset || e.target.dataset.m === undefined) {
        return;
      }
      e.preventDefault(); // stop Space scrolling the page
      this.setPlayHead(e);
      this.checkPlayHead(e);
    }, opts);
  }

  // Setup initial playhead position based on URL hash
  setupInitialPlayHead() {
    this.start = this.hashArray[0];
    if (!isNaN(parseFloat(this.start))) {
      this.highlightedText = true;
      let indices = this.updateTranscriptVisualState(this.start);
      if (indices.currentWordIndex > 0 && this.autoscroll) {
        this.scrollToParagraph(indices.currentParentElementIndex, indices.currentWordIndex);
      }
    }

    this.end = this.hashArray[1];
    //TODO convert to binary search for below for quicker startup
    if (this.start && this.end) {
      const words = this.transcript.querySelectorAll('[data-m]');
      for (let i = 1; i < words.length; i++) {
        let startTime = parseInt(words[i].getAttribute('data-m')) / 1000;
        let wordStart = (Math.round(startTime * 100) / 100).toFixed(2);
        if (wordStart >= parseFloat(this.start) && parseFloat(this.end) > wordStart) {
          words[i].classList.add('share-match');
        }
      }
    }
  }

  // Create an array of words with metadata from the transcript
  createWordArray(words) {
    return Array.from(words).map(word => {
      const m = parseInt(word.getAttribute('data-m'));
      let p = word.parentNode;
      while (p !== document) {
        if (['p', 'figure', 'ul'].includes(p.tagName.toLowerCase())) {
          break;
        }
        p = p.parentNode;
      }
      // Reset to a clean baseline — stale read/active classes from a previous
      // instance on the same DOM would survive the delta updates in
      // updateTranscriptVisualState (#251).
      word.classList.remove('read', 'active');
      word.classList.add('unread');
      return { n: word, m, p };
    });
  }

  getSelectionRange = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);

    // Get all relevant spans
    const allSpans = Array.from(this.transcript.querySelectorAll('[data-m]'));

    // Find the first and last span that contain selected text
    let startSpan = null;
    let endSpan = null;
    let selectedText = range.toString();
    let trimmedSelectedText = selectedText.trim();

    for (let span of allSpans) {
      if (range.intersectsNode(span) && span.textContent.trim() !== '') {
        if (!startSpan) startSpan = span;
        endSpan = span;
      }
    }

    if (!startSpan || !endSpan) return null;

    // Adjust start span if selection starts with a space
    let startIndex = allSpans.indexOf(startSpan);
    while (selectedText.startsWith(' ') && startIndex < allSpans.length - 1) {
      startIndex++;
      startSpan = allSpans[startIndex];
      selectedText = selectedText.slice(1);
    }

    // Calculate start time
    let startTime = parseInt(startSpan.dataset.m) / 1000;

    // Calculate end time

    let duration = 0;
    if (endSpan.dataset.d) {
      duration = parseInt(endSpan.dataset.d);
    } else {
      // when no duration exists default to 1 second
      duration = 1000; 
    }

    let endTime = (parseInt(endSpan.dataset.m) + duration) / 1000;

    // Format to seconds at 2 decimal place precision
    let startTimeFormatted = (Math.round(startTime * 100) / 100).toFixed(2);
    let endTimeFormatted = (Math.round(endTime * 100) / 100).toFixed(2);

    // Only return a range if there's actually selected text (excluding only spaces)
    return trimmedSelectedText ? `${startTimeFormatted},${endTimeFormatted}` : null;
  }

  getSelectionMediaFragment = () => {
    let range = this.getSelectionRange();
    if (range === null) {
      return null;
    }
    return (this.transcript.id + '=' + range);
  }

  // Set the playhead position in the media player based on the transcript
  setPlayHead(e) {
    // The player factory returns null for a missing/unknown player type —
    // the warning has already fired; don't crash on every click (#253).
    if (!this.myPlayer) {
      return;
    }

    const target = e.target || e.srcElement;
    this.highlightedText = false;
    this.clearActiveClasses();

    const timeSecs = parseInt(target.dataset.m) / 1000;
    this.updateTranscriptVisualState(timeSecs);

    // Mark the clicked word as active AFTER updateTranscriptVisualState (which
    // now wipes stale .active in its else-branch to fix #231). When playing,
    // the playback loop owns the active word; when paused, we explicitly mark
    // the clicked word so the user sees what they clicked.
    if (this.myPlayer.paused && target.dataset.m) {
      target.classList.add('active');
      target.parentNode.classList.add('active');
    }

    if (!isNaN(timeSecs)) {
      this.end = null;
      this.myPlayer.setTime(timeSecs);
      if (this.playOnClick) {
        this.myPlayer.play();
      }
    }
  }

  // Clear the active classes from the transcript
  clearActiveClasses() {
    const activeElements = Array.from(this.transcript.getElementsByClassName('active'));
    activeElements.forEach(e => e.classList.remove('active'));
  }

  // Prepare the playhead for playback
  preparePlayHead() {
    this.myPlayer.paused = false;
    this.checkPlayHead();
  }

  // Pause the playhead
  pausePlayHead() {
    this.clearTimer();
    this.myPlayer.paused = true;
  }

  // Update transcript visual state + scroll position to match a seek (works while paused).
  // Forces the word-level `.active` class — without this, the default
  // `.active > .active` CSS shows nothing on scrub-while-paused.
  handleSeeked() {
    (async () => {
      this.currentTime = await this.myPlayer.getTime();
      const indices = this.updateTranscriptVisualState(this.currentTime, true);
      if (indices.currentWordIndex > 0 && this.autoscroll) {
        this.scrollToParagraph(indices.currentParentElementIndex, indices.currentWordIndex);
      }
    })();
  }

  // Temporarily disable autoscroll (e.g. while a user is editing the transcript).
  pauseAutoscroll() {
    this.autoscroll = false;
  }

  // Re-enable autoscroll after a pauseAutoscroll() call.
  resumeAutoscroll() {
    this.autoscroll = true;
  }

  // Tear down the instance: stop the polling loop, cancel any in-flight
  // scroll animation and remove every DOM listener this instance added
  // (transcript, native player, popover). Embed players (YouTube, Vimeo,
  // SoundCloud, Spotify) keep their own internal API listeners — discard
  // the instance after calling destroy().
  destroy() {
    this.destroyed = true;
    this.clearTimer();
    if (this.scrollAnimationId) {
      cancelAnimationFrame(this.scrollAnimationId);
      this.scrollAnimationId = null;
    }
    this.listenerController.abort();
  }

  // Check the playhead position and update the transcript
  checkPlayHead() {
    if (!this.myPlayer) {
      return;
    }

    this.clearTimer();

    (async () => {
      this.currentTime = await this.myPlayer.getTime();
      if (this.highlightedText) {
        this.currentTime = this.start;
        this.myPlayer.setTime(this.currentTime);
        this.highlightedText = false;
      }
      this.checkStatus();
    })();
  }

  // Clear the timer for the playhead
  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  scrollToParagraph(currentParentElementIndex, index) {
    if (currentParentElementIndex !== this.parentElementIndex) {
      if (this.autoscroll) {
        const currentParagraph = this.parentElements[currentParentElementIndex];
        if (currentParagraph) {
          const containerRect = this.scrollContainer.getBoundingClientRect();
          const paragraphRect = currentParagraph.getBoundingClientRect();
          const targetTop = this.scrollContainer.scrollTop + (paragraphRect.top - containerRect.top) - (this.scrollOffset || 0);
          this.smoothScrollTo(this.scrollContainer, Math.max(0, targetTop), 800);
        }
      }
      this.parentElementIndex = currentParentElementIndex;
    }
  }

  smoothScrollTo(container, targetTop, duration) {
    if (this.scrollAnimationId) {
      cancelAnimationFrame(this.scrollAnimationId);
    }
    // Respect prefers-reduced-motion: jump straight to the target instead of
    // animating (#259).
    if (typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      container.scrollTop = targetTop;
      this.scrollAnimationId = null;
      return;
    }
    const startTop = container.scrollTop;
    const distance = targetTop - startTop;
    if (distance === 0) return;
    const startTime = performance.now();
    const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = now => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      container.scrollTop = startTop + distance * easeInOutCubic(progress);
      if (progress < 1) {
        this.scrollAnimationId = requestAnimationFrame(step);
      } else {
        this.scrollAnimationId = null;
      }
    };
    this.scrollAnimationId = requestAnimationFrame(step);
  }


  // Check the status of the playhead and update the transcript
  checkStatus() {
    // An in-flight async checkPlayHead can land after destroy() — don't
    // re-arm the polling loop on a torn-down instance.
    if (this.destroyed) {
      return;
    }

    if (!this.myPlayer.paused) {
      // parseFloat: end and currentTime are fractional seconds — truncating
      // them let playback overshoot a shared selection by up to 1s (#249).
      if (this.end && parseFloat(this.end) < parseFloat(this.currentTime)) {
        this.myPlayer.pause();
        this.end = null;
      } else {
        const indices = this.updateTranscriptVisualState(this.currentTime);
        const index = indices.currentWordIndex;

        if (index > 0 && this.autoscroll) {
          this.scrollToParagraph(indices.currentParentElementIndex, index);
        }

        if (this.minimizedMode) {
          // The active word index is already known from the visual-state
          // update — no need to rescan every span (#251).
          const lastWordIndex = this.wordIndex;
          this.wordIndex = index - 1;

          if (this.wordIndex !== lastWordIndex && this.wordIndex >= 0) {
            document.title = this.wordArr[this.wordIndex].n.innerHTML;
          }
        }

        if (this.webMonetization === true) {
          let activeElements = this.transcript.getElementsByClassName('active');
          let paymentPointer = this.checkPaymentPointer(activeElements[activeElements.length - 1]);

          if (paymentPointer !== null) {
            let wmLink = document.querySelector("link[rel='monetization']");
            if (wmLink === null) {
              wmLink = document.createElement('link');
              wmLink.rel = 'monetization';
              wmLink.href = paymentPointer;
              document.getElementsByTagName('head')[0].appendChild(wmLink);
            } else {
              wmLink.href = paymentPointer;
            }
          }
        }

        let interval = 0;
        if (this.wordArr[index]) {
          interval = this.wordArr[index].n.getAttribute('data-m') - this.currentTime * 1000;
        }

        this.timer = setTimeout(() => this.checkPlayHead(), interval + 1);
      }
    } else {
      this.clearTimer();
    }
  }

  checkPaymentPointer = element => {
    let paymentPointer = null;

    if (typeof(element) != "undefined") {
      paymentPointer = element.getAttribute('data-wm');
    }

    if (paymentPointer !== null) {
      return paymentPointer;
    } else {
      let parent = null;

      if (typeof element !== 'undefined') {
        parent = element.parentElement;
      }

      if (parent === null) {
        return null;
      } else {
        return this.checkPaymentPointer(parent);
      }
    }
  }

  // Update the visual state of the transcript based on the current time
  updateTranscriptVisualState(currentTime, forceActiveWord = false) {
    let index = 0;
    let words = this.wordArr.length - 1;

    while (index <= words) {
      const guessIndex = index + ((words - index) >> 1);
      const difference = this.wordArr[guessIndex].m / 1000 - currentTime;

      if (difference < 0) {
        index = guessIndex + 1;
      } else if (difference > 0) {
        words = guessIndex - 1;
      } else {
        // Exact match: treat the matched word as having just started, so
        // wordArr[index - 1] (used downstream as the active word) points to
        // this word, not the previous one. Without the +1 we'd land an
        // off-by-one at every word boundary — visible on every click,
        // since clicks set currentTime to a word's exact start time.
        index = guessIndex + 1;
        break;
      }
    }

    // Delta update (#251): only touch the words whose read/unread state
    // changed since the last call, instead of sweeping every word on every
    // tick — O(words moved past) rather than O(transcript length).
    const wordCount = this.wordArr.length;
    let prevIndex = this.prevWordIndex ?? 0;
    if (prevIndex > wordCount) {
      prevIndex = wordCount;
    }

    // Self-heal: if outside code (or another instance sharing this DOM) has
    // rewritten the word classes, the read/unread boundary we last applied
    // won't match the DOM any more — resync every word this one time.
    const boundaryIntact =
      (prevIndex === 0 || this.wordArr[prevIndex - 1].n.classList.contains('read')) &&
      (prevIndex === wordCount || this.wordArr[prevIndex].n.classList.contains('unread'));

    if (!boundaryIntact) {
      this.wordArr.forEach((word, i) => {
        const classList = word.n.classList;
        if (i < index) {
          classList.add('read');
          classList.remove('unread', 'active');
        } else {
          classList.add('unread');
          classList.remove('read', 'active');
        }
      });
    } else {
      for (let i = prevIndex; i < index; i++) {
        // moved forward — words now behind the playhead become read
        const classList = this.wordArr[i].n.classList;
        classList.add('read');
        classList.remove('unread', 'active');
      }

      for (let i = index; i < prevIndex; i++) {
        // moved backward — words now ahead of the playhead become unread
        const classList = this.wordArr[i].n.classList;
        classList.add('unread');
        classList.remove('read', 'active');
      }
    }

    this.prevWordIndex = index;

    // Track the active word/paragraph elements directly rather than clearing
    // 'active' from every parent element each tick. parentElements is a live
    // HTMLCollection set up once in setupTranscriptWords.
    const activeWord = index > 0 ? this.wordArr[index - 1].n : null;
    const activeParent = activeWord ? activeWord.parentNode : null;

    if (this.activeWordElement && this.activeWordElement !== activeWord) {
      this.activeWordElement.classList.remove('active');
    }
    if (this.activeParentElement && this.activeParentElement !== activeParent) {
      this.activeParentElement.classList.remove('active');
    }

    if (activeWord) {
      if (!this.myPlayer.paused || forceActiveWord) {
        activeWord.classList.add('active');
      }
      activeParent.classList.add('active');
    }

    this.activeWordElement = activeWord;
    this.activeParentElement = activeParent;

    const currentParentElementIndex = activeParent
      ? Array.prototype.indexOf.call(this.parentElements, activeParent)
      : -1;

    return {
      currentWordIndex: index,
      currentParentElementIndex
    };
  }
}

// Export for testing or module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HyperaudioLite, hyperaudioPlayerOptions, BasePlayer };
}

// ESM export (this file is generated from hyperaudio-lite.js — edit that file, then `npm run build`)
export { HyperaudioLite, hyperaudioPlayerOptions, BasePlayer };
