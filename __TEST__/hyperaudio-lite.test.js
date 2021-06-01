const { test } = require('@jest/globals');
const {HyperaudioLite} = require('../js/hyperaudio-lite');
//import * as HyperaudioLite from '../js/hyperaudio-lite';


let wordArr = [];

let ht = null;

function createWordArrayResult(words) {
  for (let i = 0; i < words.length; ++i) {
    const m = parseInt(words[i].getAttribute('data-m'));
    let p = words[i].parentNode;
    while (p !== document) {
      if (p.tagName.toLowerCase() === 'p' || p.tagName.toLowerCase() === 'figure' || p.tagName.toLowerCase() === 'ul') {
        break;
      }
      p = p.parentNode;
    }
    wordArr[i] = { 'n': words[i], 'm': m, 'p': p }
  }

  for (let i = 0; i < wordArr.length; ++i) {
    wordArr[i].n.classList.add("unread");
  }

  return wordArr;
}


function simulateClick (elem) {
	// Create our event (with options)
	var evt = new MouseEvent('click', {
		bubbles: true,
		cancelable: true,
		view: window
	});
	// If cancelled, don't dispatch our event
	var canceled = !elem.dispatchEvent(evt);
};

document.body.innerHTML =
  '<audio id="hyperplayer" class="hyperaudio-player" src="test.mp3" type="audio/mp3"></audio>' +
  '<div id="hypertranscript" class="hyperaudio-transcript">' +
    '<article>' +
      '<section>' +
        '<p class="" id="p1"><span class="read" data-m="880" data-d="539">test </span><span class="read" data-m="2560" data-d="459">one </span><span class="read" data-m="3240" data-d="370">two </span><span class="read" data-m="3950" data-d="410">three </span><span class="read" data-m="4750" data-d="459">four </span></p>' +
        '<p class="active"><span class="read" data-m="6580" data-d="530">test </span><span class="read active" data-m="8099" data-d="439">five </span><span class="unread" data-m="8740" data-d="509">six </span><span class="unread" data-m="9469" data-d="540">seven </span><span class="unread" data-m="10280" data-d="330">eight </span></p>' +
      '</section>' +
    '</article>' +
  '<div>';

window.HTMLMediaElement.prototype.play = () => { return true };


test('instantiation', () => {

  ht = new HyperaudioLite("hypertranscript", "hyperplayer", false, false);
  
});

test('createWordArray', () => {

  const words = document.querySelectorAll('[data-m]');
  const expectedResult = createWordArrayResult(words);

  expect(ht.createWordArray(words)).toStrictEqual(expectedResult);
    
});

test('getSelectionMediaFragment', () => {

  document.getSelection().setBaseAndExtent(document.getElementById('p1').firstChild.lastChild, 0, document.getElementById('p1').lastChild.lastChild, 3);
  expect(ht.getSelectionMediaFragment()).toStrictEqual("hypertranscript=0.9,5.3");

});

test('updateTranscriptVisualState', () => {

  //simulateClick(document.getElementsByTagName("span")[3]);
  const expectedResult = {
    currentWordIndex : 7,
    currentParaIndex: 1
  };

  ht.currentTime = 8.106641;

  expect(ht.updateTranscriptVisualState()).toStrictEqual(expectedResult);

});

test('media playback - click on word', () => {

  simulateClick(document.getElementsByTagName("span")[3]);
  expect(ht.player.currentTime).toStrictEqual(3.95);
  
});