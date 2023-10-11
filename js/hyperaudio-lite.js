/*! (C) The Hyperaudio Project. MIT @license: en.wikipedia.org/wiki/MIT_License. */
/*! Version 2.1.3 */

'use strict';

function nativePlayer(instance) {
  this.player = instance.player;
  this.player.addEventListener('pause', instance.pausePlayHead, false);
  this.player.addEventListener('play', instance.preparePlayHead, false);
  this.paused = true;

  this.getTime = () => {
    return new Promise((resolve) => {
      resolve(this.player.currentTime);
    });
  }

  this.setTime = (seconds) => {
    this.player.currentTime = seconds;
  }

  this.play = () => {
    this.player.play();
    this.paused = false;
  }

  this.pause = () => {
    this.player.pause();
    this.paused = true;
  }
}

function soundcloudPlayer(instance) {
  this.player = SC.Widget(instance.player.id);
  this.player.bind(SC.Widget.Events.PAUSE, instance.pausePlayHead);
  this.player.bind(SC.Widget.Events.PLAY, instance.preparePlayHead);
  this.paused = true;

  this.getTime = () => {
    return new Promise((resolve) => {
      this.player.getPosition(ms => {
        resolve(ms / 1000);
      });
    });
  }

  this.setTime = (seconds) => {
    this.player.seekTo(seconds * 1000);
  }

  this.play = () => {
    this.player.play();
    this.paused = false;
  }

  this.pause = () => {
    this.player.pause();
    this.paused = true;
  }
}

function videojsPlayer(instance) {
  this.player = videojs.getPlayer(instance.player.id);
  this.player.addEventListener('pause', instance.pausePlayHead, false);
  this.player.addEventListener('play', instance.preparePlayHead, false);
  this.paused = true;

  this.getTime = () => {
    return new Promise((resolve) => {
      resolve(this.player.currentTime());
    });
  }

  this.setTime = (seconds) => {
    this.player.currentTime(seconds);
  }

  this.play = () => {
    this.player.play();
    this.paused = false;
  }

  this.pause = () => {
    this.player.pause();
    this.paused = true;
  }
}

function vimeoPlayer(instance) {
  const iframe = document.querySelector('iframe');
  this.player = new Vimeo.Player(iframe);
  this.player.setCurrentTime(0);
  this.paused = true;
  this.player.ready().then(instance.checkPlayHead);
  this.player.on('play',instance.preparePlayHead);
  this.player.on('pause',instance.pausePlayHead);

  this.getTime = () => {
    return new Promise((resolve) => {
      resolve(this.player.getCurrentTime());
    });
  }

  this.setTime = (seconds) => {
    this.player.setCurrentTime(seconds);
  }

  this.play = () => {
    this.player.play();
    this.paused = false;
  }

  this.pause = () => {
    this.player.pause();
    this.paused = true;
  }
}

function youtubePlayer(instance) {
  const tag = document.createElement('script');
  tag.id = 'iframe-demo';
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  this.paused = true;

  const previousYTEvent = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    if (typeof previousYTEvent !== 'undefined') { // used for multiple YouTube players
      previousYTEvent();
    }

    this.player = new YT.Player(instance.player.id, {
      events: {
        onStateChange: onPlayerStateChange,
      },
    });
  };

  let onPlayerStateChange = event => {
    if (event.data === 1) {
      // playing
      instance.preparePlayHead();
      this.paused = false;
    } else if (event.data === 2) {
      // paused
      instance.pausePlayHead();
      this.paused = true;
    }
  };

  this.getTime = () => {
    return new Promise((resolve) => {
      resolve(this.player.getCurrentTime());
    });
  }

  this.setTime = (seconds) => {
    this.player.seekTo(seconds, true);
  }

  this.play = () => {
    this.player.playVideo();
  }

  this.pause = () => {
    this.player.pauseVideo();
  }
}

const hyperaudioPlayerOptions = {
  "native": nativePlayer,
  "soundcloud": soundcloudPlayer,
  "youtube": youtubePlayer,
  "videojs": videojsPlayer,
  "vimeo": vimeoPlayer
}

function hyperaudioPlayer(playerType, instance) {
  if (playerType !== null && playerType !== undefined) {
    return new playerType(instance);
  } else {
    alert("data-player-type attribute must be set on player if not native, eg SoundCloud, YouTube, Vimeo, VideoJS")
  }
}

class HyperaudioLite {
  constructor(transcriptId, mediaElementId, minimizedMode, autoscroll, doubleClick, webMonetization, playOnClick) {
    this.transcript = document.getElementById(transcriptId);
    this.init(mediaElementId, minimizedMode, autoscroll, doubleClick, webMonetization, playOnClick);
  }

  init = (mediaElementId, minimizedMode, autoscroll, doubleClick, webMonetization, playOnClick) => {

    const windowHash = window.location.hash;
    const hashVar = windowHash.substring(1, windowHash.indexOf('='));
    

    if (hashVar === this.transcript.id) {
      this.hashArray = windowHash.substring(this.transcript.id.length + 2).split(',');
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
      false,
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

    if (this.autoscroll === true) {
      this.scroller = window.Velocity || window.jQuery.Velocity;
    }

    //Create the array of timed elements (wordArr)

    const words = this.transcript.querySelectorAll('[data-m]');
    this.wordArr = this.createWordArray(words);
    this.parentTag = words[0].parentElement.tagName;
    this.parentElements = this.transcript.getElementsByTagName(this.parentTag);
    this.player = document.getElementById(mediaElementId);

    // Grab the media source and type from the first section if it exists
    // and add it to the media element.

    const mediaSrc = this.transcript.querySelector('[data-media-src]');

    if (mediaSrc !== null &&  mediaSrc !== undefined) {
      this.player.src = mediaSrc.getAttribute('data-media-src');
    }

    if (this.player.tagName == 'VIDEO' || this.player.tagName == 'AUDIO') {
      //native HTML media elements
      this.playerType = 'native';
    } else {
      //assume it is a SoundCloud or YouTube iframe
      this.playerType = this.player.getAttribute('data-player-type');
    }

    this.myPlayer = hyperaudioPlayer(hyperaudioPlayerOptions[this.playerType], this);
    this.parentElementIndex = 0;
    words[0].classList.add('active');
    //this.parentElements[0].classList.add('active');
    let playHeadEvent = 'click';

    if (this.doubleClick === true) {
      playHeadEvent = 'dblclick';
    }

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

    //TODO convert to binary search for below for quicker startup
    if (this.start && this.end) {
      for (let i = 1; i < words.length; i++) {
        const wordStart = parseInt(words[i].getAttribute('data-m')) / 1000;
        if (wordStart > parseFloat(this.start) && parseFloat(this.end) > wordStart) {
          words[i].classList.add('share-match');
        }
      }
    }
  }; // end init

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
    let fragment = null;
    let selection = null;

    if (window.getSelection) {
      selection = window.getSelection();
    } else if (document.selection) {
      selection = document.selection.createRange();
    }

    // check to see if selection is actually inside the transcript
    let insideTranscript = false;
    let parentElement = selection.focusNode;
    while (parentElement !== null) {
      if (parentElement.id === this.transcript.id) {
        insideTranscript = true;
        break;
      }
      parentElement = parentElement.parentElement;
    }

    if (selection.toString() !== '' && insideTranscript === true && selection.focusNode !== null && selection.anchorNode !== null) {
      
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

      // if the selection starts with a space we want the next element
      if(selection.toString().charAt(0) == " " && aNode !== null) {
        aNode = aNode.nextElementSibling;
      }

      if (aNode !== null) {
        let aNodeTime = parseInt(aNode.getAttribute('data-m'), 10);
        let aNodeDuration = parseInt(aNode.getAttribute('data-d'), 10);
        let fNodeTime;
        let fNodeDuration;

        if (fNode !== null && fNode.getAttribute('data-m') !== null) {
          // if the selection ends in a space we want the previous element if it exists
          if(selection.toString().slice(-1) == " " && fNode.previousElementSibling !== null) {
            fNode = fNode.previousElementSibling;
          }

          fNodeTime = parseInt(fNode.getAttribute('data-m'), 10);
          fNodeDuration = parseInt(fNode.getAttribute('data-d'), 10);

          // if the selection starts with a space we want the next element

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

        if (isNaN(parseFloat(nodeStart))) {
          fragment = null;
        } else {
          fragment = this.transcript.id + '=' + nodeStart + ',' + Math.round((nodeStart + nodeDuration) * 10) / 10;
        }
      }
    }

    return fragment;
  };

  setPlayHead = e => {
    const target = e.target ? e.target : e.srcElement;

    // cancel highlight playback
    this.highlightedText = false;

    // clear elements with class='active'
    let activeElements = Array.from(this.transcript.getElementsByClassName('active'));

    activeElements.forEach(e => {
      e.classList.remove('active');
    });

    if (this.myPlayer.paused === true && target.getAttribute('data-m') !== null) {
      target.classList.add('active');
      target.parentNode.classList.add('active');
    }

    const timeSecs = parseInt(target.getAttribute('data-m')) / 1000;
    this.updateTranscriptVisualState(timeSecs);

    if (!isNaN(parseFloat(timeSecs))) {
      this.end = null;
      this.myPlayer.setTime(timeSecs);
      if (this.playOnClick === true) {
        this.myPlayer.play();
      }
    }
  };

  clearTimer = () => {
    if (this.timer) clearTimeout(this.timer);
  };

  preparePlayHead = () => {
    this.myPlayer.paused = false;
    this.checkPlayHead();
  }

  pausePlayHead = () => {
    this.clearTimer();
    this.myPlayer.paused = true;
  }

  checkPlayHead = () => {

    this.clearTimer();

    (async (instance) => {
      instance.currentTime = await instance.myPlayer.getTime();

      if (instance.highlightedText === true) {
        instance.currentTime = instance.start;
        instance.myPlayer.setTime(instance.currentTime);
        instance.highlightedText = false;
      }
      // no need to check status if the currentTime hasn't changed
      
      instance.checkStatus();

    })(this);
  }

  scrollToParagraph = (currentParentElementIndex, index) => {
    let newPara = false;
    let scrollNode = this.wordArr[index - 1].n.parentNode;

    if (scrollNode !== null && scrollNode.tagName != 'P') {
      // it's not inside a para so just use the element
      scrollNode = this.wordArr[index - 1].n;
    }

    if (currentParentElementIndex != this.parentElementIndex) {

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
          this.parentElements = this.transcript.getElementsByTagName(this.parentTag);
        }
      }

      newPara = true;
      this.parentElementIndex = currentParentElementIndex;
    }
    return(newPara);
  }

  checkStatus = () => {
    //check for end time of shared piece

    let interval = 0;

    if (this.myPlayer.paused === false) {
    
      if (this.end && parseInt(this.end) < parseInt(this.currentTime)) {
        this.myPlayer.pause();
        this.end = null;
      } else {
        let newPara = false;
        //interval = 0; // used to establish next checkPlayHead

        let indices = this.updateTranscriptVisualState(this.currentTime);
        let index = indices.currentWordIndex;

        if (index > 0) {
          newPara = this.scrollToParagraph(indices.currentParentElementIndex, index);
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
      this.timer = setTimeout(() => {
        this.checkPlayHead();
      }, interval + 1); // +1 to avoid rounding issues (better to be over than under)
    } else {
      this.clearTimer();
    }
  };

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
  };

  updateTranscriptVisualState = (currentTime) => {
    
    let index = 0;
    let words = this.wordArr.length - 1;

    // Binary search https://en.wikipedia.org/wiki/Binary_search_algorithm
    while (index <= words) {
      const guessIndex = index + ((words - index) >> 1); // >> 1 has the effect of halving and rounding down
      const difference = this.wordArr[guessIndex].m / 1000 - currentTime; // wordArr[guessIndex].m represents start time of word

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
      let parentClassList = word.n.parentNode.classList;

      if (i < index) {
        classList.add('read');
        classList.remove('unread');
        classList.remove('active');
        parentClassList.remove('active');
      } else {
        classList.add('unread');
        classList.remove('read');
      }
    });


    this.parentElements = this.transcript.getElementsByTagName(this.parentTag);

    //remove active class from all paras
    Array.from(this.parentElements).forEach(el => {
      if (el.classList.contains('active')) {
        el.classList.remove('active');
      }
    });

    // set current word and para to active

    if (index > 0) {
      if (this.myPlayer.paused === false) {
        this.wordArr[index - 1].n.classList.add('active');
      }

      if (this.wordArr[index - 1].n.parentNode !== null) {
        this.wordArr[index - 1].n.parentNode.classList.add('active');
      }
    } 

    // Establish current paragraph index
    let currentParentElementIndex;

    Array.from(this.parentElements).every((el, i) => {
      if (el.classList.contains('active')) {
        currentParentElementIndex = i;
        return false;
      }
      return true;
    });

    let indices = {
      currentWordIndex: index,
      currentParentElementIndex: currentParentElementIndex,
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
