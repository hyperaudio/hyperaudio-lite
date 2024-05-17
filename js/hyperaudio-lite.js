import { createPlayer } from './player/index.js';

export default class HyperaudioLite {
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
    this.setupHashArray();
    this.setupEventListeners();
    this.setupInitialStates(
      minimizedMode,
      autoscroll,
      doubleClick,
      webMonetization,
      playOnClick
    );

    this.words = this.transcript.querySelectorAll('[data-m]');
    this.wordArr = this.createWordArray(this.words);
    this.parentTag = this.words[0].parentElement.tagName;
    this.parentElements = this.transcript.getElementsByTagName(this.parentTag);
    this.player = document.getElementById(mediaElementId);
    this.setupPlayer();
    this.highlightedText = false;
    this.parentElementIndex = 0;

    if (!isNaN(parseFloat(this.start))) {
      this.highlightedText = true;
      const indices = this.updateTranscriptVisualState(this.start);
      const index = indices.currentWordIndex;
      if (index > 0) {
        this.scrollToParagraph(indices.currentParentElementIndex, index);
      }
    }

    if (this.start && this.end) {
      this.highlightShareMatch();
    }
  }

  setupHashArray() {
    const windowHash = window.location.hash;
    const hashVar = windowHash.substring(1, windowHash.indexOf('='));
    if (hashVar === this.transcript.id) {
      this.hashArray = windowHash
        .substring(this.transcript.id.length + 2)
        .split(',');
    } else {
      this.hashArray = [];
    }
  }

  setupEventListeners() {
    document.addEventListener('selectionchange', this.updateHash.bind(this), false);
  }

  updateHash() {
    const mediaFragment = this.getSelectionMediaFragment();
    if (mediaFragment !== null) {
      document.location.hash = mediaFragment;
    }
  }

  setupInitialStates(minimizedMode, autoscroll, doubleClick, webMonetization, playOnClick) {
    this.minimizedMode = minimizedMode;
    this.autoscroll = autoscroll;
    this.doubleClick = doubleClick;
    this.webMonetization = webMonetization;
    this.playOnClick = playOnClick;
    this.scrollerContainer = this.transcript;
    this.scrollerOffset = 0;
    this.scrollerDuration = 800;
    this.scrollerDelay = 0;
    this.textShot = '';
    this.wordIndex = 0;
    this.myPlayer = null;
    this.playerPaused = true;

    if (this.autoscroll) {
      this.scroller = window.Velocity || window.jQuery.Velocity;
    }
  }

  setupPlayer() {
    const mediaSrc = this.transcript.querySelector('[data-media-src]');
    if (mediaSrc) {
      this.player.src = mediaSrc.getAttribute('data-media-src');
    }

    this.playerType =
      this.player.tagName.toLowerCase() === 'video' ||
      this.player.tagName.toLowerCase() === 'audio'
        ? 'native'
        : this.player.getAttribute('data-player-type');

    this.myPlayer = createPlayer(this.playerType, this);
    this.words[0].classList.add('active');
    const playHeadEvent = this.doubleClick ? 'dblclick' : 'click';
    this.transcript.addEventListener(playHeadEvent, this.setPlayHead.bind(this), false);
    this.transcript.addEventListener(playHeadEvent, this.checkPlayHead.bind(this), false);
    this.start = this.hashArray[0];
  }

  createWordArray(words) {
    return Array.from(words).map((word) => {
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
    const selection = window.getSelection();
    const insideTranscript = this.isSelectionInsideTranscript(selection);

    if (selection.toString() && insideTranscript && selection.focusNode && selection.anchorNode) {
      let fNode = selection.focusNode.parentNode;
      let aNode = selection.anchorNode.parentNode;
      aNode = this.normalizeNode(aNode, selection, 'nextElementSibling');
      fNode = this.normalizeNode(fNode, selection, 'previousElementSibling');

      if (aNode) {
        const { aNodeTime, aNodeDuration } = this.getNodeTimes(aNode);
        const { fNodeTime, fNodeDuration } = this.getNodeTimes(fNode);
        const { nodeStart, nodeDuration } = this.calculateFragmentTimes(aNodeTime, aNodeDuration, fNodeTime, fNodeDuration);

        fragment = this.buildMediaFragment(nodeStart, nodeDuration);
      }
    }

    return fragment;
  }

  isSelectionInsideTranscript(selection) {
    let insideTranscript = false;
    let parentElement = selection.focusNode;
    while (parentElement !== null) {
      if (parentElement.id === this.transcript.id) {
        insideTranscript = true;
        break;
      }
      parentElement = parentElement.parentElement;
    }
    return insideTranscript;
  }

  normalizeNode(node, selection, siblingType) {
    if (node.tagName === 'P') node = selection.anchorNode[siblingType];
    if (!node.getAttribute('data-m') || node.className === 'speaker') node = node[siblingType];
    if (selection.toString().charAt(0) === ' ' && node) node = node[siblingType];
    return node;
  }

  getNodeTimes(node) {
    let nodeTime = parseInt(node?.getAttribute('data-m'), 10);
    let nodeDuration = parseInt(node?.getAttribute('data-d'), 10);
    nodeTime = Math.round(nodeTime / 100) / 10;
    nodeDuration = Math.round(nodeDuration / 100) / 10;
    return { nodeTime, nodeDuration };
  }

  calculateFragmentTimes(aNodeTime, aNodeDuration, fNodeTime, fNodeDuration) {
    let nodeStart = aNodeTime;
    let nodeDuration = Math.round((fNodeTime + fNodeDuration - aNodeTime) * 10) / 10;

    if (aNodeTime >= fNodeTime) {
      nodeStart = fNodeTime;
      nodeDuration = Math.round((aNodeTime + aNodeDuration - fNodeTime) * 10) / 10;
    }

    if (!nodeDuration || isNaN(nodeDuration)) nodeDuration = 10;
    return { nodeStart, nodeDuration };
  }

  buildMediaFragment(nodeStart, nodeDuration) {
    if (isNaN(parseFloat(nodeStart))) {
      return null;
    } else {
      return `${this.transcript.id}=${nodeStart},${Math.round((nodeStart + nodeDuration) * 10) / 10}`;
    }
  }

  setPlayHead(e) {
    const target = e.target || e.srcElement;
    this.highlightedText = false;
    this.clearActiveElements();
    if (this.myPlayer.paused && target.getAttribute('data-m')) {
      target.classList.add('active');
      target.parentNode.classList.add('active');
    }
    const timeSecs = parseInt(target.getAttribute('data-m')) / 1000;
    this.updateTranscriptVisualState(timeSecs);
    if (!isNaN(timeSecs)) {
      this.end = null;
      this.myPlayer.setTime(timeSecs);
      if (this.playOnClick) this.myPlayer.play();
    }
  }

  clearActiveElements() {
    const activeElements = Array.from(this.transcript.getElementsByClassName('active'));
    activeElements.forEach((el) => el.classList.remove('active'));
  }

  clearTimer() {
    if (this.timer) clearTimeout(this.timer);
  }

  preparePlayHead() {
    this.myPlayer.paused = false;
    this.checkPlayHead();
  }

  pausePlayHead() {
    this.clearTimer();
    this.myPlayer.paused = true;
  }

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
        this.scrollToNode(scrollNode);
      }
      this.parentElementIndex = currentParentElementIndex;
      return true;
    }
    return false;
  }

  scrollToNode(scrollNode) {
    if (scrollNode) {
      const options = {
        duration: this.scrollerDuration,
        delay: this.scrollerDelay,
        offset: this.scrollerOffset,
      };
      if (this.scrollerContainer) options.container = this.scrollerContainer;
      this.scroller(scrollNode, 'scroll', options);
    } else {
      const words = this.transcript.querySelectorAll('[data-m]');
      this.wordArr = this.createWordArray(words);
      this.parentElements = this.transcript.getElementsByTagName(this.parentTag);
    }
  }

  checkStatus() {
    let interval = 0;
    if (!this.myPlayer.paused) {
      if (this.end && parseInt(this.end) < parseInt(this.currentTime)) {
        this.myPlayer.pause();
        this.end = null;
      } else {
        const newPara = this.checkAndScrollTranscript();
        if (this.minimizedMode) {
          this.updateMinimizedMode(newPara);
        }
        if (this.wordArr[index]) {
          interval = this.wordArr[index].n.getAttribute('data-m') - this.currentTime * 1000;
        }
      }
      if (this.webMonetization) {
        this.updateWebMonetization();
      }
      this.timer = setTimeout(() => {
        this.checkPlayHead();
      }, interval + 1);
    } else {
      this.clearTimer();
    }
  }

  checkAndScrollTranscript() {
    const indices = this.updateTranscriptVisualState(this.currentTime);
    const index = indices.currentWordIndex;
    if (index > 0) {
      return this.scrollToParagraph(indices.currentParentElementIndex, index);
    }
    return false;
  }

  updateMinimizedMode(newPara) {
    const elements = this.transcript.querySelectorAll('[data-m]');
    let currentWord = '';
    const lastWordIndex = this.wordIndex;
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
    }
  }

  updateWebMonetization() {
    const activeElements = this.transcript.getElementsByClassName('active');
    const paymentPointer = this.checkPaymentPointer(activeElements[activeElements.length - 1]);
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

  checkPaymentPointer(element) {
    if (!element) return null;
    const paymentPointer = element.getAttribute('data-wm');
    if (paymentPointer) return paymentPointer;
    return this.checkPaymentPointer(element.parentElement);
  }

  updateTranscriptVisualState(currentTime) {
    const index = this.binarySearch(currentTime);

    this.wordArr.forEach((word, i) => {
      const classList = word.n.classList;
      const parentClassList = word.n.parentNode.classList;
      if (i < index) {
        classList.add('read');
        classList.remove('unread', 'active');
        parentClassList.remove('active');
      } else {
        classList.add('unread');
        classList.remove('read');
      }
    });

    this.clearActiveParentElements();
    this.setActiveElements(index);

    const currentParentElementIndex = this.getCurrentParentElementIndex();
    return { currentWordIndex: index, currentParentElementIndex };
  }

  binarySearch(currentTime) {
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
    return index;
  }

  clearActiveParentElements() {
    Array.from(this.parentElements).forEach((el) => el.classList.remove('active'));
  }

  setActiveElements(index) {
    if (index > 0 && !this.myPlayer.paused) {
      const word = this.wordArr[index - 1];
      word.n.classList.add('active');
      word.n.parentNode?.classList.add('active');
    }
  }

  getCurrentParentElementIndex() {
    return Array.from(this.parentElements).findIndex((el) => el.classList.contains('active'));
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
