/**
 * @jest-environment jsdom
 * 
 * Tests updated for version 2.0.21
 */

const { test } = require("@jest/globals");
const { HyperaudioLite } = require("../js/hyperaudio-lite");
//import * as HyperaudioLite from '../js/hyperaudio-lite';

let wordArr = [];
let ht = null;

function createWordArrayResult(words) {
  for (let i = 0; i < words.length; ++i) {
    const m = parseInt(words[i].getAttribute("data-m"));
    let p = words[i].parentNode;
    while (p !== document) {
      if (
        p.tagName.toLowerCase() === "p" ||
        p.tagName.toLowerCase() === "figure" ||
        p.tagName.toLowerCase() === "ul"
      ) {
        break;
      }
      p = p.parentNode;
    }
    wordArr[i] = { n: words[i], m: m, p: p };
  }

  for (let i = 0; i < wordArr.length; ++i) {
    wordArr[i].n.classList.add("unread");
  }

  return wordArr;
}

function simulateClick(elem, clickType) {
  // Create our event (with options)
  let evt = new MouseEvent(clickType, {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  // If cancelled, don't dispatch our event
  let cancelled = !elem.dispatchEvent(evt);
}

document.body.innerHTML =
  '<audio id="hyperplayer" class="hyperaudio-player" src="" type=""></audio>' +
  '<div id="hypertranscript" class="hyperaudio-transcript">' +
  "<article>" +
  '<section data-media-src="test.mp3">' +
  '<p id="p1" data-wm="payment-pointer"><span class="read" data-m="880" data-d="539">test </span><span class="read" data-m="2560" data-d="459">one </span><span class="read" data-m="3240" data-d="370">two </span><span class="read" data-m="3950" data-d="410">three </span><span class="read" data-m="4750" data-d="459">four </span></p>' +
  '<p><span class="read" data-m="6580" data-d="530">test </span><span class="read" data-m="8099" data-d="439">five </span><span class="unread" data-m="8740" data-d="509">six </span><span class="unread" data-m="9469" data-d="540">seven </span><span class="unread" data-m="10280" data-d="330">eight </span></p>' +
  "</section>" +
  "</article>" +
  "<div>";

window.HTMLMediaElement.prototype.play = () => {
  /* does nothing */
};

test("instantiation - options false", () => {
  let minimizedMode = false;
  let autoScroll = false;
  let doubleClick = false;
  let webMonetization = false;

  ht = new HyperaudioLite(
    "hypertranscript",
    "hyperplayer",
    minimizedMode,
    autoScroll,
    doubleClick,
    webMonetization
  );
});

test("createWordArray", () => {
  const words = document.querySelectorAll("[data-m]");
  const expectedResult = createWordArrayResult(words);

  expect(ht.createWordArray(words)).toStrictEqual(expectedResult);
});

test("getSelectionMediaFragment", () => {
  document
    .getSelection()
    .setBaseAndExtent(
      document.getElementById("p1").firstChild.lastChild,
      0,
      document.getElementById("p1").lastChild.lastChild,
      3
    );
  expect(ht.getSelectionMediaFragment()).toStrictEqual(
    "hypertranscript=0.9,5.3"
  );
});

test("updateTranscriptVisualState", () => {
  const expectedResult = {
    currentWordIndex: 7,
    currentParentElementIndex: 1,
  };

  ht.myPlayer.paused = false;
  ht.currentTime = 8.106641;

  expect(ht.updateTranscriptVisualState(ht.currentTime)).toStrictEqual(expectedResult);
});

test("transcript - click on word", () => {
  simulateClick(document.getElementsByTagName("span")[3], "click");
  expect(ht.player.currentTime).toStrictEqual(3.95);
});

test("instantiation - doubleClick true", () => {
  let minimizedMode = false;
  let autoScroll = false;
  let doubleClick = true;
  let webMonetization = false;

  ht = new HyperaudioLite(
    "hypertranscript",
    "hyperplayer",
    minimizedMode,
    autoScroll,
    doubleClick,
    webMonetization
  );
});

test("transcript - doubleClick on word", () => {
  simulateClick(document.getElementsByTagName("span")[4], "dblclick");
  expect(ht.player.currentTime).toStrictEqual(4.75);
});

test("instantiation - webMonetization true", () => {
  let minimizedMode = false;
  let autoScroll = false;
  let doubleClick = false;
  let webMonetization = true;

  ht = new HyperaudioLite(
    "hypertranscript",
    "hyperplayer",
    minimizedMode,
    autoScroll,
    doubleClick,
    webMonetization
  );
});

// This test always passes - fix it
/*test("transcript - payment pointer inserted", () => {
  simulateClick(document.getElementsByTagName("span")[4], "click");

  jest.setTimeout(() => {
    const paymentPointer = document.querySelector('[name="monetization"]');
    expect(paymentPointer.content).toStrictEqual("payment-pointer");
  }, 0)

});*/

test("transcript - media source insertion from section", () => {
  const src = document.querySelector('#hyperplayer').src;
  expect(src).toMatch(/test.mp3$/);
});

test("transcript - check that active is set on word", () => {
  simulateClick(document.getElementsByTagName("span")[4], "dblclick");
  expect(document.querySelector('span.active')).toBe(document.getElementsByTagName("span")[4]);
});

test("transcript - check that active is set on paragraph", () => {
  simulateClick(document.getElementsByTagName("span")[4], "dblclick");
  expect(document.querySelector('p.active')).toBe(document.getElementsByTagName('p')[0]);
});