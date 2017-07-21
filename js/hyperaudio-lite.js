var hyperaudiolite = (function () {

  var hashArray = window.location.hash.substr(3).split(',');

  var hal = {},
    transcript,
    words,
    player,
    paraIndex,
    wordIndex,
    start,
    end,
    timer,
    minimizedMode,
    wordArr = [];

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
    };

    //words = transcript.getElementsByTagName('span');

    paras = transcript.getElementsByTagName('p');
    player = document.getElementById(mediaElementId);
    paraIndex = 0;
    words[0].classList.add("active");
    paras[0].classList.add("active");
    transcript.addEventListener("click", setPlayHead, false);
    transcript.addEventListener("click", checkPlayHead, false);
    //player.addEventListener("timeupdate", checkPlayHead, false);
    player.addEventListener("pause", clearTimer, false);
    player.addEventListener("play", checkPlayHead, false);

    start = hashArray[0];

    if (!isNaN(parseFloat(start))) {
      player.currentTime = start;
      player.play();
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

    if (window.getSelection) {
       selection = window.getSelection();
    } else if (document.selection) {
       selection = document.selection.createRange();
    }

    if (selection.toString() !== '') {

      fNode = selection.focusNode.parentNode;
      aNode = selection.anchorNode.parentNode;

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
    var timeSecs = parseInt(target.getAttribute("data-m"))/1000;

    if(!isNaN(parseFloat(timeSecs))) {
      end = null;
      player.currentTime = timeSecs;
      player.play();
    }
  }

  function clearTimer() {
    if (timer) clearTimeout(timer);
  }

  function checkPlayHead(e) {

    clearTimer();

    //check for end time of shared piece

    if (end && (end < player.currentTime)) {
      player.pause();
      end = null;
      paused = true;
    } else {
      var newPara = false;

      var interval; // used to establish next checkPlayHead

      var l = 0, r = wordArr.length - 1;
      while (l <= r) {
        var m = l + ((r - l) >> 1);
        var comp = wordArr[m].m / 1000 - player.currentTime;
        if (comp < 0) { // arr[m] comes before the element
          l = m + 1;
        }
        else if (comp > 0) { // arr[m] comes after the element
          r = m - 1;
        }
        else { // this[m] equals the element
          l = m;
          break;
        }
      }

      for (var i = 0; i < l; ++i) {
        wordArr[i].n.classList.add("read");
        wordArr[i].n.classList.remove("unread");
      }

      for (var i = l; i < wordArr.length; ++i) {
        wordArr[i].n.classList.add("unread");
        wordArr[i].n.classList.remove("read");
      }

      for (var i = 0; i < l; ++i) {
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

      if (l > 0) {
        wordArr[l-1].n.classList.add("active");
        wordArr[l-1].n.parentNode.classList.add("active");
      }

      if (wordArr[l]) {
        interval = parseInt(wordArr[l].n.getAttribute("data-m") - player.currentTime*1000);
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

      if (l > 0) {
        scrollNode = wordArr[l-1].n.parentNode;

        if (scrollNode.tagName != "P") { // it's not inside a para so just use the element
          scrollNode = wordArr[l-1].n;
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

        var elements = document.getElementsByTagName('span');
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
