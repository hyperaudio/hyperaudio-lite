/*! (C) The Hyperaudio Project. MIT @license: en.wikipedia.org/wiki/MIT_License. */
/*! Version 1.0.0 */

'use strict';

var hyperaudiolite = (function () {

  var hashArray = window.location.hash.substr(3).split(',');

  var hal = {},
    transcript,
    player,
    paraIndex,
    wordIndex,
    textShot,
    paras,
    start,
    end,
    timer,
    minimizedMode,
    wordArr = [],
    playerType,
    currentTime;

  function init(mediaElementId, m) {

    window.addEventListener('mouseup', function() {

      var mediaFragment = getSelectionMediaFragment();

      if ( mediaFragment !== "") {
        document.location.hash = mediaFragment;
      }
    }, false);

    minimizedMode = m;
    textShot = "";
    wordIndex = 0;

    //Create the array of timed elements (wordArr)

    var words = document.querySelectorAll('[data-m]');
    for (var i = 0; i < words.length; ++i) {
      var m = parseInt(words[i].getAttribute('data-m'));
      var p = words[i].parentNode;
      while (p !== document) {
        if (p.tagName.toLowerCase() === 'p' || p.tagName.toLowerCase() === 'figure' || p.tagName.toLowerCase() === 'ul') {
          break;
        }
        p = p.parentNode;
      }
      wordArr[i] = { 'n': words[i], 'm': m, 'p': p }
    }

    for (var i = 0; i < wordArr.length; ++i) {
      wordArr[i].n.classList.add("unread");
    }

    paras = transcript.getElementsByTagName('p');

    player = document.getElementById(mediaElementId);
    console.log(player.tagName);
    if (player.tagName == "VIDEO" || player.tagName == "AUDIO") { //native HTML media elements
      playerType = "native";
    } else { //assume it is a SoundCloud or YouTube iframe 
      playerType = player.getAttribute("data-player-type");
    }

    if (playerType == "native") {
      player.addEventListener('pause', clearTimer, false);
      player.addEventListener('play', checkPlayHead, false);
    } else if (playerType == "soundcloud"){  // SoundCloud
      player = SC.Widget(mediaElementId);
      player.bind(SC.Widget.Events.PAUSE, clearTimer);
      player.bind(SC.Widget.Events.PLAY, checkPlayHead);
    } else { // assume YouTube
      var tag = document.createElement('script');
      tag.id = 'iframe-demo';
      tag.src = 'https://www.youtube.com/iframe_api';
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player(mediaElementId, {
          events: {
            'onStateChange': onPlayerStateChange
          }
        });
      }

      function onPlayerStateChange(event) {
        if (event.data == 1) { // playing 
          checkPlayHead();
        } else if (event.data == 2) { // paused 
          clearTimer();
        }   
      }
    }
 
    paraIndex = 0;
    words[0].classList.add("active");
    paras[0].classList.add("active");
    transcript.addEventListener('click', setPlayHead, false);
    transcript.addEventListener('click', checkPlayHead, false);

    start = hashArray[0];

    if (!isNaN(parseFloat(start))) {

      if (playerType == "native") {
        player.currentTime = start;
        //autoplay
        var promise = player.play();
        if (promise !== undefined) {
          promise.catch(error => {
            console.log("Auto-play prevented");
          }).then(() => {
              // Auto-play started
          });
        }
      } else if (playerType == "soundcloud"){ // SoundCloud
        player.seekTo(start * 1000);
      } else { // Assume YouTube
        window.onYouTubeIframeAPIReady = function() {
          player = new YT.Player(mediaElementId, {
            playerVars: { 'autoplay': 1 },
            events: {
              'onReady': function() {
                player.seekTo(start, true);
                player.playVideo();
              }
            }
          });
        }
      }
    }

    end = hashArray[1];

    //TODO convert to binary search for below for quicker startup

    if (start && end) {
      for (var i = 1; i < words.length; i++) {
        var wordStart = parseInt(words[i].getAttribute("data-m"))/1000;
        if ( wordStart > start && end > wordStart ) {
          words[i].classList.add("share-match");
        }
      }
    }
  }

  function getSelectionMediaFragment() {

    var fragment = "";
    var selection = null;

    if (window.getSelection) {
       selection = window.getSelection();
    } else if (document.selection) {
       selection = document.selection.createRange();
    }

    if (selection.toString() !== '') {

      var fNode = selection.focusNode.parentNode;
      var aNode = selection.anchorNode.parentNode;

      if (aNode.getAttribute('data-m') == null || aNode.className == "speaker") {
         aNode = aNode.nextElementSibling;
      }

      if (fNode.getAttribute('data-m') == null || fNode.className == "speaker") {
         fNode = fNode.previousElementSibling;
      }

      var aNodeTime = parseInt(aNode.getAttribute('data-m'), 10);
      var aNodeDuration = parseInt(aNode.getAttribute('data-d'), 10);
      var fNodeTime;
      var fNodeDuration;

      if (fNode != null && fNode.getAttribute('data-m') != null) {
        fNodeTime = parseInt(fNode.getAttribute('data-m'), 10);
        fNodeDuration = parseInt(fNode.getAttribute('data-d'), 10);
      }

      // 1 decimal place will do

      aNodeTime = Math.round(aNodeTime / 100) / 10;
      aNodeDuration = Math.round(aNodeDuration / 100) / 10;
      fNodeTime = Math.round(fNodeTime / 100) / 10;
      fNodeDuration = Math.round(fNodeDuration / 100) / 10;

      var nodeStart = aNodeTime;
      var nodeDuration = Math.round((fNodeTime + fNodeDuration - aNodeTime) * 10) / 10;

      if (aNodeTime >= fNodeTime) {
        nodeStart = fNodeTime;
        nodeDuration = Math.round((aNodeTime + aNodeDuration - fNodeTime) * 10) / 10;
      }

      if (nodeDuration == 0 || nodeDuration == null || isNaN(nodeDuration)) {
        nodeDuration = 10; // arbitary for now
      }

      fragment = "#t=" + nodeStart + "," + (Math.round((nodeStart + nodeDuration) * 10) / 10);
    }

    return (fragment);
  }

  function setPlayHead(e) {

    var target = (e.target) ? e.target : e.srcElement;
    target.setAttribute("class", "active");
    var timeSecs = parseInt(target.getAttribute("data-m")) / 1000;

    if(!isNaN(parseFloat(timeSecs))) {
      end = null;
      if (playerType == "native"){
        player.currentTime = timeSecs;
        player.play();
      } else if (playerType == "soundcloud"){ 
        player.seekTo(timeSecs * 1000);
        player.play();
      } else { //assume YouTube
        player.seekTo(timeSecs, true);
        player.playVideo();
      }
    }
  }

  function clearTimer() {
    if (timer) clearTimeout(timer);
  }

  function checkPlayHead() {

    clearTimer();

    if (playerType == "native"){
      currentTime = player.currentTime;
    } else if (playerType == "soundcloud"){ 
      player.getPosition(function(ms) {
        currentTime = ms / 1000;
      });
    } else { // assume YouTube
      currentTime = player.getCurrentTime();
    }

    //check for end time of shared piece

    if (end && (end < currentTime)) {
      console.log("end of piece");
      player.pause();
      end = null;
    } else {
      var newPara = false;
      var interval; // used to establish next checkPlayHead
      var index = 0;
      var words = wordArr.length - 1;

      // Binary search https://en.wikipedia.org/wiki/Binary_search_algorithm
      while (index <= words) {
        var guessIndex = index + ((words - index) >> 1); // >> 1 has the effect of halving and rounding down
        var difference = wordArr[guessIndex].m / 1000 - currentTime; // wordArr[guessIndex].m represents start time of word

        if (difference < 0) { // comes before the element
          index = guessIndex + 1;
        }
        else if (difference > 0) { // comes after the element
          words = guessIndex - 1;
        }
        else { // equals the element
          index = guessIndex;
          break;
        }
      }

      for (var i = 0; i < index; ++i) {
        wordArr[i].n.classList.add("read");
        wordArr[i].n.classList.remove("unread");
      }

      for (var i = index; i < wordArr.length; ++i) {
        wordArr[i].n.classList.add("unread");
        wordArr[i].n.classList.remove("read");
      }

      for (var i = 0; i < index; ++i) {
        wordArr[i].n.classList.remove("active");
      }

      paras = transcript.getElementsByTagName('p');

      //remove active class from all paras

      for (var a = 0; a < paras.length; a++) {
        if (paras[a].classList.contains("active")) {
          paras[a].classList.remove("active");
        }
      }

      // set current word and para to active

      if (index > 0) {
        wordArr[index - 1].n.classList.add("active");
        wordArr[index - 1].n.parentNode.classList.add("active");
      }

      if (wordArr[index]) {
        interval = parseInt(wordArr[index].n.getAttribute('data-m') - currentTime * 1000);
      } else {
        interval = 0;
      }

      // Establish current paragraph index

      var currentParaIndex;

      for (var a = 0; a < paras.length; a++) {
        if (paras[a].classList.contains("active")) {
          currentParaIndex = a;
          break;
        }
      }

      var scrollNode = null;

      if (index > 0) {
        scrollNode = wordArr[index-1].n.parentNode;

        if (scrollNode.tagName != "P") { // it's not inside a para so just use the element
          scrollNode = wordArr[index-1].n;
        }

        if (currentParaIndex != paraIndex) {
          Velocity(scrollNode, "scroll", {
            container: hypertranscript,
            duration: 800,
            delay: 0
          });

          newPara = true;

          paraIndex = currentParaIndex;
        }
      }

      //minimizedMode is still experimental - it changes document.title upon every new word

      if (minimizedMode) {

        var elements = document.querySelectorAll('[data-m]');
        var currentWord = "";
        var lastWordIndex = wordIndex;

        for (var i = 0; i < elements.length; i++) {
          if((' ' + elements[i].className + ' ').indexOf(' active ') > -1) {
            currentWord = elements[i].innerHTML;
            wordIndex = i;
          }
        }

        if (wordIndex != lastWordIndex) {
          textShot = textShot + currentWord;
        }

        if (textShot.length > 16 || newPara == true) {
          document.title = textShot;
          textShot = "";
          newPara = false;
        }
      }

      timer = setTimeout(function() {
        checkPlayHead();
      }, interval+1); // +1 to avoid rounding issues (better to be over than under)
    }

  }

  hal.init = function(transcriptId, mediaElementId, minimizedMode) {
    transcript = document.getElementById(transcriptId);
    init(mediaElementId, minimizedMode);
    //set minimizedMode is an experimental feature
  }

  return hal;

})();
