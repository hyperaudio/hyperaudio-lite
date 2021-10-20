/*! (C) The Hyperaudio Project. MIT @license: en.wikipedia.org/wiki/MIT_License. */
/*! Version 2.0.7 */

'use strict';

class HyperaudioLite {
  constructor(transcriptId, mediaElementId, minimizedMode, autoscroll, doubleClick, webMonetization) {
    this.transcript = document.getElementById(transcriptId);
    this.init(mediaElementId, minimizedMode, autoscroll, doubleClick, webMonetization);
  }

  init = (mediaElementId, m, a, d, w) => {
    const windowHash = window.location.hash;
    const hashVar = windowHash.substring(1, windowHash.indexOf('='));

    if (hashVar === this.transcript.id) {
      this.hashArray = windowHash.substr(this.transcript.id.length + 2).split(',');
    } else {
      this.hashArray = [];
    }

    document.addEventListener(
      'selectionchange',
      () => {
        const mediaFragment = this.getSelectionMediaFragment();

        if (mediaFragment !== '') {
          document.location.hash = mediaFragment;
        }
      },
      false,
    );

    this.minimizedMode = m;
    this.textShot = '';
    this.wordIndex = 0;

    this.autoscroll = a;
    this.scrollerContainer = this.transcript;
    this.scrollerOffset = 0;
    this.scrollerDuration = 800;
    this.scrollerDelay = 0;

    this.doubleClick = d;
    this.webMonetization = w;

    //Create the array of timed elements (wordArr)

    const words = this.transcript.querySelectorAll('[data-m]');

    this.wordArr = this.createWordArray(words);

    this.paras = this.transcript.getElementsByTagName('p');

    this.player = document.getElementById(mediaElementId);

    if (this.player.tagName == 'VIDEO' || this.player.tagName == 'AUDIO') {
      //native HTML media elements
      this.playerType = 'native';
    } else {
      //assume it is a SoundCloud or YouTube iframe
      this.playerType = this.player.getAttribute('data-player-type');
    }

    if (this.playerType === 'native') {
      this.player.addEventListener('pause', this.clearTimer, false);
      this.player.addEventListener('play', this.checkPlayHead, false);
    } else if (this.playerType === 'soundcloud') {
      // SoundCloud
      this.player = SC.Widget(mediaElementId);
      this.player.bind(SC.Widget.Events.PAUSE, this.clearTimer);
      this.player.bind(SC.Widget.Events.PLAY, this.checkPlayHead);
    } else {
      // assume YouTube
      const tag = document.createElement('script');
      tag.id = 'iframe-demo';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        this.player = new YT.Player(mediaElementId, {
          events: {
            onStateChange: onPlayerStateChange,
          },
        });
      };

      let onPlayerStateChange = event => {
        if (event.data === 1) {
          // playing
          this.checkPlayHead();
        } else if (event.data === 2) {
          // paused
          this.clearTimer();
        }
      };
    }

    this.paraIndex = 0;

    words[0].classList.add('active');
    this.paras[0].classList.add('active');

    let playHeadEvent = 'click';

    if (this.doubleClick === true) {
      playHeadEvent = 'dblclick';
    }

    this.transcript.addEventListener(playHeadEvent, this.setPlayHead, false);
    this.transcript.addEventListener(playHeadEvent, this.checkPlayHead, false);

    const start = this.hashArray[0];

    if (!isNaN(parseFloat(start))) {
      if (this.playerType === 'native') {
        this.player.addEventListener('loadeddata', function(){
          this.currentTime = start;
        })    
        //autoplay
        const promise = this.player.play();
        if (promise !== undefined) {
          promise
            .catch(error => {
              console.log('Auto-play prevented');
            })
            .then(() => {
              // Auto-play started
            });
        }
      } else if (this.playerType === 'soundcloud') {
        // SoundCloud
        this.player.seekTo(start * 1000);
      } else {
        // Assume YouTube

        window.onYouTubeIframeAPIReady = () => {
          this.player = new YT.Player(mediaElementId, {
            playerVars: { autoplay: 1 },
            events: {
              onReady: function () {
                this.player.seekTo(start, true);
                this.player.playVideo();
              },
            },
          });
        };
      }
    }

    this.end = this.hashArray[1];

    //TODO convert to binary search for below for quicker startup

    if (start && this.end) {
      for (let i = 1; i < words.length; i++) {
        const wordStart = parseInt(words[i].getAttribute('data-m')) / 1000;
        if (wordStart > start && this.end > wordStart) {
          words[i].classList.add('share-match');
        }
      }
    }

    if (this.autoscroll === true) {
      this.scroller = window.Velocity || window.jQuery.Velocity;
    }
  };

  createWordArray = words => {
    let wordArr = [];

    words.forEach((word, i) => {
      const m = parseInt(word.getAttribute('data-m'));
      let p = word.parentNode;
      while (p !== document) {
        if (
          p.tagName.toLowerCase() === 'p' ||
          p.tagName.toLowerCase() === 'figure' ||
          p.tagName.toLowerCase() === 'ul'
        ) {
          break;
        }
        p = p.parentNode;
      }
      wordArr[i] = { n: words[i], m: m, p: p };
      wordArr[i].n.classList.add('unread');
    });

    return wordArr;
  };

  getSelectionMediaFragment = () => {
    let fragment = '';
    let selection = null;

    if (window.getSelection) {
      selection = window.getSelection();
    } else if (document.selection) {
      selection = document.selection.createRange();
    }

    if (selection.toString() !== '') {
      let fNode = selection.focusNode.parentNode;
      let aNode = selection.anchorNode.parentNode;
      
      if (aNode.tagName === "P") {
        aNode = selection.anchorNode.nextElementSibling;
      }

      if (fNode.tagName === "P") {
        fNode = selection.focusNode.nextElementSibling;
      }

      if (aNode.getAttribute('data-m') === null || aNode.className === 'speaker') {
        aNode = aNode.nextElementSibling;
      }

      if (fNode.getAttribute('data-m') === null || fNode.className === 'speaker') {
        fNode = fNode.previousElementSibling;
      }

      let aNodeTime = parseInt(aNode.getAttribute('data-m'), 10);
      let aNodeDuration = parseInt(aNode.getAttribute('data-d'), 10);
      let fNodeTime;
      let fNodeDuration;

      if (fNode != null && fNode.getAttribute('data-m') != null) {
        fNodeTime = parseInt(fNode.getAttribute('data-m'), 10);
        fNodeDuration = parseInt(fNode.getAttribute('data-d'), 10);
      }

      // 1 decimal place will do

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

      if (nodeDuration === 0 || nodeDuration === null || isNaN(nodeDuration)) {
        nodeDuration = 10; // arbitary for now
      }

      fragment = this.transcript.id + '=' + nodeStart + ',' + Math.round((nodeStart + nodeDuration) * 10) / 10;
    }

    return fragment;
  };

  setPlayHead = e => {
    const target = e.target ? e.target : e.srcElement;

    // clear elements with class='active'

    let activeElements = Array.from(this.transcript.getElementsByClassName('active'));

    activeElements.forEach(e => {
      e.classList.remove('active');
    });

    target.classList.add('active');

    const timeSecs = parseInt(target.getAttribute('data-m')) / 1000;

    if (!isNaN(parseFloat(timeSecs))) {
      this.end = null;

      if (this.playerType === 'native') {
        this.player.currentTime = timeSecs;
        this.player.play();
      } else if (this.playerType === 'soundcloud') {
        this.player.seekTo(timeSecs * 1000);
        this.player.play();
      } else {
        //assume YouTube

        this.player.seekTo(timeSecs, true);
        this.player.playVideo();
      }
    }
  };

  clearTimer = () => {
    if (this.timer) clearTimeout(this.timer);
  };

  checkPlayHead = () => {
    this.clearTimer();

    if (this.playerType === 'native') {
      this.currentTime = this.player.currentTime;
      this.checkStatus();
    } else if (this.playerType === 'soundcloud') {
      this.player.getPosition(ms => {
        this.currentTime = ms / 1000;
        this.checkStatus();
      });
    } else {
      // assume YouTube
      this.currentTime = this.player.getCurrentTime();
      this.checkStatus();
    }
  }

  checkStatus = () => {
    //check for end time of shared piece

    if (this.end && this.end < this.currentTime) {
      this.player.pause();
      this.end = null;
    } else {
      let newPara = false;
      let interval = 0; // used to establish next checkPlayHead

      let indices = this.updateTranscriptVisualState();

      let scrollNode = null;

      let index = indices.currentWordIndex;
      let currentParaIndex = indices.currentParaIndex;

      if (index > 0) {
        scrollNode = this.wordArr[index - 1].n.parentNode;

        if (scrollNode !== null && scrollNode.tagName != 'P') {
          // it's not inside a para so just use the element
          scrollNode = this.wordArr[index - 1].n;
        }

        if (currentParaIndex != this.paraIndex) {
          if (typeof this.scroller !== 'undefined' && this.autoscroll === true) {
            if (scrollNode !== null) {
              if (typeof this.scrollerContainer !== 'undefined' && this.scrollerContainer !== null) {
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
              // the wordlst needs refreshing
              let words = this.transcript.querySelectorAll('[data-m]');
              this.wordArr = this.createWordArray(words);
              this.paras = this.transcript.getElementsByTagName('p');
            }
          }

          newPara = true;

          this.paraIndex = currentParaIndex;
        }
      }

      //minimizedMode is still experimental - it changes document.title upon every new word

      if (this.minimizedMode) {
        const elements = transcript.querySelectorAll('[data-m]');
        let currentWord = '';
        let lastWordIndex = this.wordIndex;

        for (let i = 0; i < elements.length; i++) {
          if ((' ' + elements[i].className + ' ').indexOf(' active ') > -1) {
            currentWord = elements[i].innerHTML;
            this.wordIndex = i;
          }
        }

        let textShot = '';

        if (this.wordIndex != lastWordIndex) {
          textShot = textShot + currentWord;
        }

        if (textShot.length > 16 || newPara === true) {
          document.title = textShot;
          textShot = '';
          newPara = false;
        }
      }

      if (this.wordArr[index]) {
        interval = parseInt(this.wordArr[index].n.getAttribute('data-m') - this.currentTime * 1000);
      }

      this.timer = setTimeout(() => {
        this.checkPlayHead();
      }, interval + 1); // +1 to avoid rounding issues (better to be over than under)
    }

    if (this.webMonetization === true) {
      //check for payment pointer

      let activeElements = this.transcript.getElementsByClassName('active');

      let paymentPointer = this.checkPaymentPointer(activeElements[activeElements.length - 1]);

      if (paymentPointer !== null) {
        let metaElements = document.getElementsByTagName('meta');
        let wmMeta = document.querySelector("meta[name='monetization']");
        if (wmMeta === null) {
          wmMeta = document.createElement('meta');
          wmMeta.name = 'monetization';
          wmMeta.content = paymentPointer;
          document.getElementsByTagName('head')[0].appendChild(wmMeta);
        } else {
          wmMeta.name = 'monetization';
          wmMeta.content = paymentPointer;
        }
      }
    }
  };

  checkPaymentPointer = element => {
    let paymentPointer = element.getAttribute('data-wm');

    if (paymentPointer !== null) {
      return paymentPointer;
    } else {
      let parent = element.parentElement;

      if (parent === null) {
        return null;
      } else {
        return this.checkPaymentPointer(parent);
      }
    }
  };

  updateTranscriptVisualState = () => {
    let index = 0;
    let words = this.wordArr.length - 1;

    // Binary search https://en.wikipedia.org/wiki/Binary_search_algorithm
    while (index <= words) {
      const guessIndex = index + ((words - index) >> 1); // >> 1 has the effect of halving and rounding down
      const difference = this.wordArr[guessIndex].m / 1000 - this.currentTime; // wordArr[guessIndex].m represents start time of word

      if (difference < 0) {
        // comes before the element
        index = guessIndex + 1;
      } else if (difference > 0) {
        // comes after the element
        words = guessIndex - 1;
      } else {
        // equals the element
        index = guessIndex;
        break;
      }
    }

    this.wordArr.forEach((word, i) => {
      let classList = word.n.classList;
      if (i < index) {
        classList.add('read');
        classList.remove('unread');
        classList.remove('active');
      } else {
        classList.add('unread');
        classList.remove('read');
      }
    });

    this.paras = this.transcript.getElementsByTagName('p');

    //remove active class from all paras

    Array.from(this.paras).forEach(para => {
      if (para.classList.contains('active')) {
        para.classList.remove('active');
      }
    });

    // set current word and para to active

    if (index > 0) {
      this.wordArr[index - 1].n.classList.add('active');
      if (this.wordArr[index - 1].n.parentNode !== null) {
        this.wordArr[index - 1].n.parentNode.classList.add('active');
      }
    }

    // Establish current paragraph index

    let currentParaIndex;

    Array.from(this.paras).every((para, i) => {
      if (para.classList.contains('active')) {
        currentParaIndex = i;
        return false;
      }
      return true;
    });

    let indices = {
      currentWordIndex: index,
      currentParaIndex: currentParaIndex,
    };

    return indices;
  };

  setScrollParameters = (duration, delay, offset, container) => {
    this.scrollerContainer = container;
    this.scrollerDuration = duration;
    this.scrollerDelay = delay;
    this.scrollerOffset = offset;
  };

  toggleAutoScroll = () => {
    this.autoscroll = !this.autoscroll;
  };

  setAutoScroll = state => {
    this.autoscroll = state;
  };
}

// required for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HyperaudioLite };
}

//export default HyperaudioLite;
