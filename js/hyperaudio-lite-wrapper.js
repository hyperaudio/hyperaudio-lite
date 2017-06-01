// Example wrapper for hyperaudio-lite with search and playbackRate included

var searchForm = document.getElementById("searchForm");

if (searchForm) {
  if(searchForm.addEventListener){ //Modern browsers
    searchForm.addEventListener("submit", function(event){
      searchPhrase(document.getElementById("search").value);
      event.preventDefault();
    }, false);
  }else if(searchForm.attachEvent){ //Old IE
    searchForm.attachEvent('onsubmit', function(event){
      searchPhrase(document.getElementById("search").value);
      event.preventDefault();
    });
  }
}

var htmlWords, htmlWordsLen;

htmlWords = document.querySelectorAll("[data-m]");
htmlWordsLen = htmlWords.length;

var searchPhrase = function (phrase) {

  var phraseWords = phrase.split(" ");
  var phraseWordsLen = phraseWords.length;
  var matchedTimes = [];

  // clear matched times

  var searchMatched = document.querySelectorAll(".search-match");
  var searchMatchedLen = searchMatched.length;

  for (var l = 0; l < searchMatchedLen; l++) {
    searchMatched[l].classList.remove("search-match");
  }

  for (var i = 0; i < htmlWordsLen; i++) {

    var numWordsMatched = 0;
    var potentiallyMatched = [];

    for (var j = 0; j < phraseWordsLen; j++) {

      var wordIndex = i + numWordsMatched;

      if (wordIndex >= htmlWordsLen) {
        break;
      }

      // regex removes punctuation - NB for htmlWords case we also remove the space

      if (phraseWords[j].toLowerCase() == htmlWords[wordIndex].innerHTML.toLowerCase().replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~() ]/g,"")) {
        potentiallyMatched.push(htmlWords[wordIndex].getAttribute("data-m"));
        numWordsMatched++;
      } else {
        break;
      }

      // if the num of words matched equal the search phrase we have a winner!

      if (numWordsMatched >= phraseWordsLen) {
        matchedTimes = matchedTimes.concat(potentiallyMatched);
      }
    }
  }

  // display
  var matchedTimesLen = matchedTimes.length;

  // only match the first word with that time (assuming times are unique)
  for (var k = 0; k < matchedTimesLen; k++) {
    document.querySelectorAll("[data-m='"+matchedTimes[k]+"']")[0].classList.add("search-match");
  }
}

window.onload = function() {

  // minimizedMode is still experimental
  var minimizedMode = true;

  hyperaudiolite.init("hypertranscript", "hyperplayer", minimizedMode);

  // playbackRate listener
	var p = document.getElementById("pbr");
	var cp = document.getElementById("currentPbr");

	p.addEventListener('input',function(){
		cp.innerHTML = p.value;
		hyperplayer.playbackRate = p.value;
	},false);
}
