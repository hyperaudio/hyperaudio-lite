const { test } = require('@jest/globals');
const {HyperaudioLite} = require('../js/hyperaudio-lite');
//import * as HyperaudioLite from '../js/hyperaudio-lite';


let wordArr = [];

function createWordArrayMock(words) {
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

document.body.innerHTML =
  '<audio id="hyperplayer" class="hyperaudio-player" src="test.mp3" type="audio/mp3" />' +
  '<div id="hypertranscript" class="hyperaudio-transcript">' +
    '<article>' +
      '<section>' +
        '<p id="p1"><span data-m="880" data-d="539">test </span><span data-m="2560" data-d="459">one </span><span data-m="3240" data-d="370">two </span><span data-m="3950" data-d="410">three </span><span data-m="4750" data-d="459">four </span></p>' +
        '<p><span data-m="6580" data-d="530">test </span><span data-m="8099" data-d="439">five </span><span data-m="8740" data-d="509">six </span><span data-m="9469" data-d="540">seven </span><span data-m="10280" data-d="330">eight </span></p>' +
      '</section>' +
    '</article>' +
  '<div>';

test('createWordArray', () => {

    const words = document.querySelectorAll('[data-m]');

    const expectedResult = createWordArrayMock(words);

    let ht = new HyperaudioLite("hypertranscript", "hyperplayer", false, false);

    expect(ht.createWordArray(words)).toStrictEqual(expectedResult);
    
});

test('getSelectionMediaFragment', () => {

  const words = document.querySelectorAll('[data-m]');

  const expectedResult = createWordArrayMock(words);

  let ht = new HyperaudioLite("hypertranscript", "hyperplayer", false, false);

  document.getSelection().setBaseAndExtent(document.getElementById('p1').firstChild.lastChild, 0, document.getElementById('p1').lastChild.lastChild, 3);
  expect(ht.getSelectionMediaFragment()).toStrictEqual("hypertranscript=0.9,5.3");

});