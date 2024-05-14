/*! (C) The Hyperaudio Project. MIT @license: en.wikipedia.org/wiki/MIT_License. */
/*! Version 2.1.8 */

'use strict';

class BasePlayer {
  constructor(instance) {
    this.instance = instance;
    this.paused = true;
  }

  getTime() {
    return Promise.resolve(this.player.currentTime || 0);
  }

  setTime(seconds) {
    if (this.player.setCurrentTime) {
      this.player.setCurrentTime(seconds);
    } else {
      this.player.currentTime = seconds;
    }
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

class NativePlayer extends BasePlayer {
  constructor(instance) {
    super(instance);
    this.player = instance.player;
    this.player.addEventListener('pause', instance.pausePlayHead, false);
    this.player.addEventListener('play', instance.preparePlayHead, false);
  }
}

class SoundCloudPlayer extends BasePlayer {
  constructor(instance) {
    super(instance);
    this.player = SC.Widget(instance.player.id);
    this.player.bind(SC.Widget.Events.PAUSE, instance.pausePlayHead);
    this.player.bind(SC.Widget.Events.PLAY, instance.preparePlayHead);
  }

  getTime() {
    return new Promise((resolve) => {
      this.player.getPosition((ms) => {
        resolve(ms / 1000);
      });
    });
  }

  setTime(seconds) {
    this.player.seekTo(seconds * 1000);
  }
}

class VideoJSPlayer extends BasePlayer {
  constructor(instance) {
    super(instance);
    this.player = videojs.getPlayer(instance.player.id);
    this.player.addEventListener('pause', instance.pausePlayHead, false);
    this.player.addEventListener('play', instance.preparePlayHead, false);
  }

  getTime() {
    return Promise.resolve(this.player.currentTime());
  }

  setTime(seconds) {
    this.player.currentTime(seconds);
  }
}

class VimeoPlayer extends BasePlayer {
  constructor(instance) {
    super(instance);
    const iframe = document.querySelector('iframe');
    this.player = new Vimeo.Player(iframe);
    this.player.ready().then(instance.checkPlayHead);
    this.player.on('play', instance.preparePlayHead);
    this.player.on('pause', instance.pausePlayHead);
  }

  getTime() {
    return this.player.getCurrentTime();
  }
}

class YouTubePlayer extends BasePlayer {
  constructor(instance) {
    super(instance);
    const tag = document.createElement('script');
    tag.id = 'iframe-demo';
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      this.player = new YT.Player(instance.player.id, {
        events: {
          onStateChange: this.onPlayerStateChange.bind(this),
        },
      });
    };
  }

  onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      this.instance.preparePlayHead();
      this.paused = false;
    } else if (event.data === YT.PlayerState.PAUSED) {
      this.instance.pausePlayHead();
      this.paused = true;
    }
  }

  getTime() {
    return Promise.resolve(this.player.getCurrentTime());
  }

  setTime(seconds) {
    this.player.seekTo(seconds, true);
  }

  play() {
    this.player.playVideo();
    this.paused = false;
  }

  pause() {
    this.player.pauseVideo();
    this.paused = true;
  }
}

class SpotifyPlayer extends BasePlayer {
  constructor(instance) {
    super(instance);
    this.currentTime = 0;

    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      const element = document.getElementById(instance.player.id);
      const extractEpisodeID = (url) => {
        const match = url.match(/episode\/(.+)$/);
        return match ? match[1] : null;
      };
      const subSample = (sampleInterval) => {
        this.currentTime += sampleInterval;
      };
      const srcValue = element.getAttribute('src');
      const episodeID = extractEpisodeID(srcValue);
      const options = { uri: `spotify:episode:${episodeID}` };

      IFrameAPI.createController(element, options, (player) => {
        this.player = player;
        player.addListener('playback_update', (e) => {
          if (!e.data.isPaused) {
            this.currentTime = e.data.position / 1000;
            let currentSample = 0;
            let totalSample = 0;
            let sampleInterval = 0.25;

            while (totalSample < 1) {
              currentSample += sampleInterval;
              setTimeout(subSample, currentSample * 1000, sampleInterval);
              totalSample = currentSample + sampleInterval;
            }

            instance.preparePlayHead();
            this.paused = false;
          } else {
            instance.pausePlayHead();
            this.paused = true;
          }
        });

        player.addListener('ready', () => {
          player.togglePlay();
          instance.checkPlayHead();
        });
      });
    };
  }

  getTime() {
    return Promise.resolve(this.currentTime);
  }

  setTime(seconds) {
    this.player.seek(seconds);
  }

  play() {
    this.player.play();
    this.paused = false;
  }

  pause() {
    this.player.togglePlay();
    this.paused = true;
  }
}

const hyperaudioPlayerOptions = {
  native: NativePlayer,
  soundcloud: SoundCloudPlayer,
  youtube: YouTubePlayer,
  videojs: VideoJSPlayer,
  vimeo: VimeoPlayer,
  spotify: SpotifyPlayer,
};

function hyperaudioPlayer(playerType, instance) {
  if (playerType) {
    return new playerType(instance);
  } else {
    console.warn(
      'HYPERAUDIO LITE WARNING: data-player-type attribute should be set on player if not native, eg SoundCloud, YouTube, Vimeo, VideoJS'
    );
  }
}

class HyperaudioLite {
  constructor(
    transcriptId,
    mediaElementId,
    minimizedMode,
    autoscroll,
    doubleClick,
    webMonetization,
    playOnClick
  ) {
    this.transcript = document.getElementById(transcriptId);
    this.init(
      mediaElementId,
      minimizedMode,
      autoscroll,
      doubleClick,
      webMonetization,
      playOnClick
    );
  }

  init(
    mediaElementId,
    minimizedMode,
    autoscroll,
    doubleClick,
    webMonetization,
    playOnClick
  ) {
    const windowHash = window.location.hash;
    const hashVar = windowHash.substring(1, windowHash.indexOf('='));
    if (hashVar === this.transcript.id) {
      this.hashArray = windowHash
        .substring(this.transcript.id.length + 2)
        .split(',');
    } else {
      this.hashArray = [];
    }

    document.addEventListener(
      'selectionchange',
      () => {
        const mediaFragment = this.getSelectionMediaFragment();
        if (mediaFragment !== null) {
          document.location.hash = mediaFragment;
        }
      },
      false
    );

    this.minimizedMode = minimizedMode;
    this.textShot = '';
    this.wordIndex = 0;
    this.autoscroll = autoscroll;
    this.scrollerContainer = this.transcript;
    this.scrollerOffset = 0;
    this.scrollerDuration = 800;
    this.scrollerDelay = 0;
    this.doubleClick = doubleClick;
    this.webMonetization = webMonetization;
    this.playOnClick = playOnClick;
    this.highlightedText = false;
    this.start = null;
    this.myPlayer = null;
    this.playerPaused = true;

    if (this.autoscroll) {
      this.scroller = window.Velocity || window.jQuery.Velocity;
    }

    const words = this.transcript.querySelectorAll('[data-m]');
    this.wordArr = this.createWordArray(words);
    this.parentTag = words[0].parentElement.tagName;
    this.parentElements = this.transcript.getElementsByTagName(this.parentTag);
    this.player = document.getElementById(mediaElementId);

    const mediaSrc = this.transcript.querySelector('[data-media-src]');
    if (mediaSrc) {
      this.player.src = mediaSrc.getAttribute('data-media-src');
    }

    this.playerType =
      this.player.tagName.toLowerCase() === 'video' ||
      this.player.tagName.toLowerCase() === 'audio'
        ? 'native'
        : this.player.getAttribute('data-player-type');

    this.myPlayer = hyperaudioPlayer(
      hyperaudioPlayerOptions[this.playerType],
      this
    );
    this.parentElementIndex = 0;
    words[0].classList.add('active');
    let playHeadEvent = this.doubleClick ? 'dblclick' : 'click';
    this.transcript.addEventListener(playHeadEvent, this.setPlayHead, false);
    this.transcript.addEventListener(playHeadEvent, this.checkPlayHead, false);

    this.start = this.hashArray[0];

    if (!isNaN(parseFloat(this.start))) {
      this.highlightedText = true;
      let indices = this.updateTranscriptVisualState(this.start);
      let index = indices.currentWordIndex;
      if (index > 0) {
        this.scrollToParagraph(indices.currentParentElementIndex, index);
      }
    }

    this.end = this.hashArray[1];

    if (this.start && this.end) {
      for (let i = 1; i < words.length; i++) {
        const wordStart = parseInt(words[i].getAttribute('data-m')) / 1000;
        if (wordStart > parseFloat(this.start) && parseFloat(this.end) > wordStart) {
          words[i].classList.add('share-match');
        }
      }
    }
  }

  createWordArray(words) {
    return Array.from(words).map((word, i) => {
      const m = parseInt(word.getAttribute('data-m'));
      let p = word.parentNode;
      while (p !== document) {
        if (['p', 'figure', 'ul'].includes(p.tagName.toLowerCase())) {
          break;
        }
        p = p.parentNode;
      }
      word.classList.add('unread');
      return { n: word, m: m, p: p };
    });
  }

  getSelectionMediaFragment() {
    let fragment = null;
    let selection = window.getSelection ? window.getSelection() : document.selection.createRange();

    let insideTranscript = false;
    let parentElement = selection.focusNode;
    while (parentElement !== null) {
      if (parentElement.id === this.transcript.id) {
        insideTranscript = true;
        break;
      }
      parentElement = parentElement.parentElement;
    }

    if (selection.toString() !== '' && insideTranscript && selection.focusNode && selection.anchorNode) {
      let fNode = selection.focusNode.parentNode;
      let aNode = selection.anchorNode.parentNode;
      if (aNode.tagName === 'P') aNode = selection.anchorNode.nextElementSibling;
      if (fNode.tagName === 'P') fNode = selection.focusNode.nextElementSibling;
      if (!aNode.getAttribute('data-m') || aNode.className === 'speaker') aNode = aNode.nextElementSibling;
      if (!fNode.getAttribute('data-m') || fNode.className === 'speaker') fNode = fNode.previousElementSibling;
      if (selection.toString().charAt(0) == ' ' && aNode) aNode = aNode.nextElementSibling;
      if (aNode) {
        let aNodeTime = parseInt(aNode.getAttribute('data-m'), 10);
        let aNodeDuration = parseInt(aNode.getAttribute('data-d'), 10);
        let fNodeTime, fNodeDuration;
        if (fNode && fNode.getAttribute('data-m')) {
          if (selection.toString().slice(-1) == ' ' && fNode.previousElementSibling) fNode = fNode.previousElementSibling;
          fNodeTime = parseInt(fNode.getAttribute('data-m'), 10);
          fNodeDuration = parseInt(fNode.getAttribute('data-d'), 10);
        }
        aNodeTime = Math.round(aNodeTime / 100) / 10;
        aNodeDuration = Math.round(aNodeDuration / 100) / 10;
        fNodeTime = Math.round(fNodeTime / 100) / 10;
        fNodeDuration = Math.round(fNodeDuration / 100) / 10;
        let nodeStart = aNodeTime;
        let nodeDuration = Math.round((fNodeTime + fNodeDuration - aNodeTime) * 10) / 10;
        if (aNodeTime >= fNodeTime) {
          nodeStart = fNodeTime;
          nodeDuration = Math.round((aNodeTime + aNodeDuration - fNodeTime) * 10) / 10;
        }
        if (!nodeDuration || isNaN(nodeDuration)) nodeDuration = 10;
        if (isNaN(parseFloat(nodeStart))) {
          fragment = null;
        } else {
          fragment = `${this.transcript.id}=${nodeStart},${Math.round((nodeStart + nodeDuration) * 10) / 10}`;
        }
      }
    }

    return fragment;
  }

  setPlayHead = (e) => {
    const target = e.target || e.srcElement;
    this.highlightedText = false;
    const activeElements = Array.from(this.transcript.getElementsByClassName('active'));
    activeElements.forEach((el) => el.classList.remove('active'));
    if (this.myPlayer.paused && target.getAttribute('data-m')) {
      target.classList.add('active');
      target.parentNode.classList.add('active');
    }
    const timeSecs = parseInt(target.getAttribute('data-m')) / 1000;
    this.updateTranscriptVisualState(timeSecs);
    if (!isNaN(timeSecs)) {
      this.end = null;
      this.myPlayer.setTime(timeSecs);
      if (this.playOnClick) {
        this.myPlayer.play();
      }
    }
  };

  clearTimer() {
    if (this.timer) clearTimeout(this.timer);
  }

  preparePlayHead = () => {
    this.myPlayer.paused = false;
    this.checkPlayHead();
  };

  pausePlayHead = () => {
    this.clearTimer();
    this.myPlayer.paused = true;
  };

  async checkPlayHead() {
    this.clearTimer();
    this.currentTime = await this.myPlayer.getTime();
    if (this.highlightedText) {
      this.currentTime = this.start;
      this.myPlayer.setTime(this.currentTime);
      this.highlightedText = false;
    }
    this.checkStatus();
  }

  scrollToParagraph(currentParentElementIndex, index) {
    let scrollNode = this.wordArr[index - 1].n.parentNode;
    if (scrollNode && scrollNode.tagName !== 'P') {
      scrollNode = this.wordArr[index - 1].n;
    }
    if (currentParentElementIndex !== this.parentElementIndex) {
      if (this.scroller && this.autoscroll) {
        if (scrollNode) {
          if (this.scrollerContainer) {
            this.scroller(scrollNode, 'scroll', {
              container: this.scrollerContainer,
              duration: this.scrollerDuration,
              delay: this.scrollerDelay,
              offset: this.scrollerOffset,
            });
          } else {
            this.scroller(scrollNode, 'scroll', {
              duration: this.scrollerDuration,
              delay: this.scrollerDelay,
              offset: this.scrollerOffset,
            });
          }
        } else {
          const words = this.transcript.querySelectorAll('[data-m]');
          this.wordArr = this.createWordArray(words);
          this.parentElements = this.transcript.getElementsByTagName(this.parentTag);
        }
      }
      this.parentElementIndex = currentParentElementIndex;
      return true;
    }
    return false;
  }

  checkStatus() {
    let interval = 0;
    if (!this.myPlayer.paused) {
      if (this.end && parseInt(this.end) < parseInt(this.currentTime)) {
        this.myPlayer.pause();
        this.end = null;
      } else {
        let newPara = false;
        let indices = this.updateTranscriptVisualState(this.currentTime);
        let index = indices.currentWordIndex;
        if (index > 0) {
          newPara = this.scrollToParagraph(indices.currentParentElementIndex, index);
        }
        if (this.minimizedMode) {
          const elements = transcript.querySelectorAll('[data-m]');
          let currentWord = '';
          let lastWordIndex = this.wordIndex;
          elements.forEach((element, i) => {
            if (element.classList.contains('active')) {
              currentWord = element.innerHTML;
              this.wordIndex = i;
            }
          });
          let textShot = '';
          if (this.wordIndex !== lastWordIndex) {
            textShot += currentWord;
          }
          if (textShot.length > 16 || newPara) {
            document.title = textShot;
            textShot = '';
            newPara = false;
          }
        }
        if (this.wordArr[index]) {
          interval = this.wordArr[index].n.getAttribute('data-m') - this.currentTime * 1000;
        }
      }
      if (this.webMonetization) {
        let activeElements = this.transcript.getElementsByClassName('active');
        let paymentPointer = this.checkPaymentPointer(activeElements[activeElements.length - 1]);
        if (paymentPointer) {
          let wmMeta = document.querySelector("meta[name='monetization']");
          if (!wmMeta) {
            wmMeta = document.createElement('meta');
            wmMeta.name = 'monetization';
            wmMeta.content = paymentPointer;
            document.head.appendChild(wmMeta);
          } else {
            wmMeta.content = paymentPointer;
          }
        }
      }
      this.timer = setTimeout(() => {
        this.checkPlayHead();
      }, interval + 1);
    } else {
      this.clearTimer();
    }
  }

  checkPaymentPointer(element) {
    if (!element) return null;
    let paymentPointer = element.getAttribute('data-wm');
    if (paymentPointer) return paymentPointer;
    return this.checkPaymentPointer(element.parentElement);
  }

  updateTranscriptVisualState(currentTime) {
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
        index = guessIndex;
        break;
      }
    }

    this.wordArr.forEach((word, i) => {
      let classList = word.n.classList;
      let parentClassList = word.n.parentNode.classList;
      if (i < index) {
        classList.add('read');
        classList.remove('unread', 'active');
        parentClassList.remove('active');
      } else {
        classList.add('unread');
        classList.remove('read');
      }
    });

    Array.from(this.parentElements).forEach((el) => el.classList.remove('active'));
    if (index > 0) {
      if (!this.myPlayer.paused) this.wordArr[index - 1].n.classList.add('active');
      this.wordArr[index - 1].n.parentNode?.classList.add('active');
    }

    let currentParentElementIndex;
    Array.from(this.parentElements).every((el, i) => {
      if (el.classList.contains('active')) {
        currentParentElementIndex = i;
        return false;
      }
      return true;
    });

    return { currentWordIndex: index, currentParentElementIndex };
  }

  setScrollParameters(duration, delay, offset, container) {
    this.scrollerContainer = container;
    this.scrollerDuration = duration;
    this.scrollerDelay = delay;
    this.scrollerOffset = offset;
  }

  toggleAutoScroll() {
    this.autoscroll = !this.autoscroll;
  }

  setAutoScroll(state) {
    this.autoscroll = state;
  }
}

// required for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HyperaudioLite };
}
