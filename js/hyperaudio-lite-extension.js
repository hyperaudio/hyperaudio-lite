/*! (C) The Hyperaudio Project. MIT @license: en.wikipedia.org/wiki/MIT_License. */
/*! Version 2.0.22 */

'use strict';
// Example wrapper for hyperaudio-lite with search and playbackRate included

let searchForm = document.getElementById('searchForm');

if (searchForm) {
  searchForm.addEventListener('submit', function(event){
    searchPhrase(document.getElementById('search').value);
    event.preventDefault();
  }, false);
}

const htmlWords = document.querySelectorAll('[data-m]');
const htmlWordsLen = htmlWords.length;

let searchPhrase = function (phrase) {
  let phraseWords = phrase.split(" ");
  let phraseWordsLen = phraseWords.length;
  let matchedTimes = [];

  // clear matched times
  let searchMatched = document.querySelectorAll('.search-match');

  searchMatched.forEach((match) => {
    match.classList.remove('search-match');
  });

  for (let i = 0; i < htmlWordsLen; i++) {
    let numWordsMatched = 0;
    let potentiallyMatched = [];

    for (let j = 0; j < phraseWordsLen; j++) {
      let wordIndex = i + numWordsMatched;

      if (wordIndex >= htmlWordsLen) {
        break;
      }

      // regex removes punctuation - NB for htmlWords case we also remove the space

      if (phraseWords[j].toLowerCase() == htmlWords[wordIndex].innerHTML.toLowerCase().replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~() ]/g,"")) {
        potentiallyMatched.push(htmlWords[wordIndex].getAttribute('data-m'));
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
  matchedTimes.forEach(matchedTime => {
    document.querySelectorAll("[data-m='"+matchedTime+"']")[0].classList.add("search-match");
  });
}

window.onload = function() {
	const playbackRateCtrl = document.getElementById('pbr');
	const currentPlaybackRate = document.getElementById('currentPbr');

  if (playbackRateCtrl !== null) {
    playbackRateCtrl.addEventListener('input', function(){
      currentPlaybackRate.innerHTML = playbackRateCtrl.value;
      hyperplayer.playbackRate = playbackRateCtrl.value;
    },false);
  }
}