var hyperaudiolite = (function () {
  
  var hal = {}, 
    transcript, 
    words, 
    player;

  function init() {
    words = transcript.getElementsByTagName('a');
    player = document.getElementById("hyperplayer");
    words[0].className = "active";
    transcript.addEventListener("click", setPlayHead, false);
    player.addEventListener("timeupdate", checkPlayHead, false);
  }

  function setPlayHead(e) {
    var target = (e.target) ? e.target : e.srcElement;
    target.setAttribute("class", "active");
    var timeSecs = parseInt(target.getAttribute("data-m"))/1000;
    player.currentTime = timeSecs;
    player.play();
  }

  function checkPlayHead(e) {
    var activewords = transcript.getElementsByClassName('active');

    if (activewords) {
      for (a = 0; a < activewords.length; a++) {
        activewords[a].className = "";
      }
    }

    for (i = 0; i < words.length; i++) {
      if (parseInt(words[i].getAttribute("data-m"))/1000 >= player.currentTime) {
        words[i].setAttribute("class", "active");
        break;
      }
    }
  }

  hal.loadTranscript = function(url) {
    var xmlhttp;

    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 ) {
        if(xmlhttp.status == 200){
          transcript = document.getElementById("hypertranscript");
          transcript.innerHTML = xmlhttp.responseText;
          init();
        }
        else if(xmlhttp.status == 400) {
          alert('There was an error 400')
        }
        else {
          alert('something else other than 200 was returned')
        }
      }
    }

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }
 
  return hal;
 
})();