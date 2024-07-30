/**
 * @jest-environment jsdom
 * 
 * Tests updated for version 2.1
 */

const { test } = require("@jest/globals");
const { HyperaudioLite } = require("../js/hyperaudio-lite");
//import * as HyperaudioLite from '../js/hyperaudio-lite';

let wordArr = [];
let ht = null;



test("initialization with parameters", () => {
  const customHt = new HyperaudioLite("hypertranscript", "hyperplayer", true, true, true, true, true);

  expect(customHt.minimizedMode).toBe(true);
  expect(customHt.autoscroll).toBe(true);
  expect(customHt.doubleClick).toBe(true);
  expect(customHt.webMonetization).toBe(true);
  expect(customHt.playOnClick).toBe(true);
});

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
}


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
    "hypertranscript=0.88,5.21"
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

test("transcript - doubleClick on word", () => {
  simulateClick(document.getElementsByTagName("span")[4], "dblclick");
  expect(ht.player.currentTime).toStrictEqual(4.75);
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

test("setupTranscriptHash with no hash", () => {
  window.location.hash = "";
  ht.setupTranscriptHash();
  expect(ht.hashArray).toEqual([]);
});

test("setupTranscriptHash with valid hash", () => {
  window.location.hash = "#hypertranscript=10,20";
  ht.setupTranscriptHash();
  expect(ht.hashArray).toEqual(["10", "20"]);
});

test("getSelectionRange with no selection", () => {
  window.getSelection().removeAllRanges();
  expect(ht.getSelectionRange()).toBeNull();
});

test("getSelectionRange with valid selection", () => {
  const firstSpan = document.querySelector('span[data-m="880"]');
  const lastSpan = document.querySelector('span[data-m="4750"]');
  const range = document.createRange();
  range.setStartBefore(firstSpan);
  range.setEndAfter(lastSpan);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);

  expect(ht.getSelectionRange()).toBe("0.88,5.21");
});

test("clearActiveClasses removes all active classes", () => {
  const spans = document.querySelectorAll('span');
  spans.forEach(span => span.classList.add('active'));
  
  ht.clearActiveClasses();
  
  spans.forEach(span => {
    expect(span.classList.contains('active')).toBe(false);
  });
});

test("scrollToParagraph updates parentElementIndex", () => {
  ht.parentElementIndex = 0;
  ht.scrollToParagraph(1, 6);
  expect(ht.parentElementIndex).toBe(1);
});

test("checkPaymentPointer returns correct payment pointer", () => {
  const p1 = document.getElementById('p1');
  expect(ht.checkPaymentPointer(p1)).toBe("payment-pointer");
});

test("checkPaymentPointer returns null for element without payment pointer", () => {
  const p2 = document.querySelectorAll('p')[1];
  expect(ht.checkPaymentPointer(p2)).toBeNull();
});

test("updateTranscriptVisualState marks words as read", () => {
  ht.updateTranscriptVisualState(5);
  const spans = document.querySelectorAll('span');
  expect(spans[0].classList.contains('read')).toBe(true);
  expect(spans[4].classList.contains('read')).toBe(true);
  expect(spans[5].classList.contains('unread')).toBe(true);
});

test("setPlayHead updates currentTime and plays if playOnClick is true", () => {
  ht.playOnClick = true;
  ht.myPlayer = { setTime: jest.fn(), play: jest.fn(), paused: true };
  
  const event = { target: document.querySelector('span[data-m="3950"]') };
  ht.setPlayHead(event);

  expect(ht.myPlayer.setTime).toHaveBeenCalledWith(3.95);
  expect(ht.myPlayer.play).toHaveBeenCalled();
});

test("preparePlayHead sets paused to false and calls checkPlayHead", () => {
  ht.checkPlayHead = jest.fn();
  ht.preparePlayHead();
  
  expect(ht.myPlayer.paused).toBe(false);
  expect(ht.checkPlayHead).toHaveBeenCalled();
});

test("pausePlayHead clears timer and sets paused to true", () => {
  jest.useFakeTimers();
  ht.timer = setTimeout(() => {}, 1000);
  ht.pausePlayHead();
  
  expect(ht.myPlayer.paused).toBe(true);
  expect(ht.timer).toBeFalsy();
  jest.useRealTimers();
});

// This test requires jest.useFakeTimers() to work properly
test("checkStatus schedules next check", () => {
  jest.useFakeTimers();
  ht.myPlayer = { 
    paused: false, 
    getTime: jest.fn().mockResolvedValue(5)
  };
  ht.updateTranscriptVisualState = jest.fn().mockReturnValue({ currentWordIndex: 4, currentParentElementIndex: 0 });
  ht.scrollToParagraph = jest.fn();
  ht.checkPlayHead = jest.fn();

  ht.checkStatus();
  
  jest.runAllTimers();
  
  expect(ht.checkPlayHead).toHaveBeenCalled();
  
  jest.useRealTimers();
});




