/**
 * @jest-environment jsdom
 * 
 * Tests updated for version 2.1
 */

const { test } = require("@jest/globals");
const { HyperaudioLite, hyperaudioPlayerOptions } = require("../js/hyperaudio-lite");
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

test("initialization with options object — all flags explicit", () => {
  const customHt = new HyperaudioLite({
    transcript: "hypertranscript",
    player: "hyperplayer",
    minimizedMode: true,
    autoScroll: true,
    doubleClick: true,
    webMonetization: true,
    playOnClick: true,
  });

  expect(customHt.minimizedMode).toBe(true);
  expect(customHt.autoscroll).toBe(true);
  expect(customHt.doubleClick).toBe(true);
  expect(customHt.webMonetization).toBe(true);
  expect(customHt.playOnClick).toBe(true);
});

test("initialization with options object — defaults applied for omitted flags", () => {
  const customHt = new HyperaudioLite({
    transcript: "hypertranscript",
    player: "hyperplayer",
  });

  // Defaults from the constructor: minimizedMode=false, autoScroll=true,
  // doubleClick=false, webMonetization=false, playOnClick=true.
  expect(customHt.minimizedMode).toBe(false);
  expect(customHt.autoscroll).toBe(true);
  expect(customHt.doubleClick).toBe(false);
  expect(customHt.webMonetization).toBe(false);
  expect(customHt.playOnClick).toBe(true);
});

test("positional constructor emits a deprecation warning (once)", () => {
  // Reset the throttle flag so the warning will fire for this test, regardless
  // of test order.
  HyperaudioLite._positionalWarned = false;
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  new HyperaudioLite("hypertranscript", "hyperplayer", false, true, false, false, true);
  new HyperaudioLite("hypertranscript", "hyperplayer", false, true, false, false, true);

  // Throttled to once per page load, regardless of how many positional calls happen.
  expect(warnSpy).toHaveBeenCalledTimes(1);
  expect(warnSpy.mock.calls[0][0]).toMatch(/positional-argument constructor is deprecated/);

  warnSpy.mockRestore();
});

test("options-object constructor does NOT emit a deprecation warning", () => {
  HyperaudioLite._positionalWarned = false;
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  new HyperaudioLite({ transcript: "hypertranscript", player: "hyperplayer" });

  expect(warnSpy).not.toHaveBeenCalled();
  warnSpy.mockRestore();
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

test("createWordArray ignores malformed data-m values", () => {
  const container = document.createElement("p");
  container.innerHTML =
    '<span data-m="100">valid</span>' +
    '<span class="read active" data-m="">invalid</span>' +
    '<span data-m="300">valid</span>';

  const result = ht.createWordArray(container.querySelectorAll("[data-m]"));
  const invalidWord = container.children[1];

  expect(result.map(({ m }) => m)).toEqual([100, 300]);
  expect(invalidWord.classList.contains("unread")).toBe(true);
  expect(invalidWord.classList.contains("read")).toBe(false);
  expect(invalidWord.classList.contains("active")).toBe(false);
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

test("scrollOffset defaults to 0", () => {
  const customHt = new HyperaudioLite({ transcript: "hypertranscript", player: "hyperplayer" });
  expect(customHt.scrollOffset).toBe(0);
});

test("scrollOffset can be set via options object", () => {
  const customHt = new HyperaudioLite({
    transcript: "hypertranscript",
    player: "hyperplayer",
    scrollOffset: 80,
  });
  expect(customHt.scrollOffset).toBe(80);
});

test("scrollOffset is subtracted from scrollToParagraph target", () => {
  // Set up an instance with a non-zero offset, then capture what
  // smoothScrollTo would be called with. The offset should be subtracted
  // from targetTop, clamped to >= 0.
  const customHt = new HyperaudioLite({
    transcript: "hypertranscript",
    player: "hyperplayer",
    scrollOffset: 30,
  });
  customHt.autoscroll = true;
  customHt.parentElementIndex = 0;
  let captured = null;
  customHt.smoothScrollTo = (container, targetTop, duration) => {
    captured = targetTop;
  };
  // Compute what an offset-of-zero call would produce, then verify the
  // offset-aware call lands 30 lower (or 0 if clamping kicks in).
  const containerRect = customHt.scrollContainer.getBoundingClientRect();
  const paragraph = customHt.parentElements[1];
  const paragraphRect = paragraph.getBoundingClientRect();
  const expectedWithoutOffset = customHt.scrollContainer.scrollTop + (paragraphRect.top - containerRect.top);
  const expected = Math.max(0, expectedWithoutOffset - 30);
  customHt.scrollToParagraph(1, 6);
  expect(captured).toBe(expected);
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

test("updateTranscriptVisualState marks the matched word as active at exact word boundaries", () => {
  // Regression for #235: clicking a word sets currentTime to the word's exact
  // start time. The binary search used to return index = matchedIndex (treating
  // the matched word as "not yet started") so wordArr[index - 1] — the previous
  // word — was marked active. Visible as the wrong word lighting up on every click.
  ht.myPlayer = { paused: false };
  const word = document.getElementsByTagName('span')[4];
  const exactStart = parseInt(word.dataset.m) / 1000;
  ht.updateTranscriptVisualState(exactStart);
  expect(word.classList.contains('active')).toBe(true);
  expect(document.getElementsByTagName('span')[3].classList.contains('active')).toBe(false);
});

test("updateTranscriptVisualState clears stale .active on rewind", () => {
  // Play forward past the 5th word — that word ends up active.
  ht.myPlayer = { paused: false };
  ht.updateTranscriptVisualState(5);
  // Then rewind to time 0. Words that were ahead of the playhead used to keep
  // their .active class because the else-branch only removed 'read', not
  // 'active' — leaving contradictory `active unread` words behind the new
  // playhead. (regression for #231)
  ht.updateTranscriptVisualState(0, true);
  const spans = document.querySelectorAll('span');
  const staleActives = Array.from(spans).filter(
    s => s.classList.contains('active') && s.classList.contains('unread')
  );
  expect(staleActives).toHaveLength(0);
});

test("updateTranscriptVisualState self-heals after external class rewrites (#251)", () => {
  // The delta optimisation only touches words whose state changed since the
  // last call. If outside code (or another instance sharing the DOM) rewrites
  // the classes, the boundary check must detect it and resync everything.
  ht.myPlayer = { paused: false };
  ht.updateTranscriptVisualState(5); // establish cached delta state

  const spans = document.querySelectorAll("span[data-m]");
  spans.forEach(s => (s.className = "")); // external rewrite

  ht.updateTranscriptVisualState(5); // same index — a pure delta would no-op

  expect(spans[0].classList.contains("read")).toBe(true);
  expect(spans[4].classList.contains("read")).toBe(true);
  expect(spans[4].classList.contains("active")).toBe(true);
  expect(spans[5].classList.contains("unread")).toBe(true);
});

test("setPlayHead updates currentTime and plays if playOnClick is true", () => {
  ht.playOnClick = true;
  ht.myPlayer = { setTime: jest.fn(), play: jest.fn(), paused: true };
  
  const event = { target: document.querySelector('span[data-m="3950"]') };
  ht.setPlayHead(event);

  expect(ht.myPlayer.setTime).toHaveBeenCalledWith(3.95);
  expect(ht.myPlayer.play).toHaveBeenCalled();
});

test("setPlayHead ignores targets without a numeric data-m", () => {
  ht.playOnClick = true;
  ht.highlightedText = true;
  ht.myPlayer = { setTime: jest.fn(), play: jest.fn(), paused: true };
  const updateSpy = jest.spyOn(ht, "updateTranscriptVisualState");
  const activeWord = document.querySelector('span[data-m="3950"]');
  activeWord.classList.add("active");

  ht.setPlayHead({ target: activeWord.parentNode });

  expect(updateSpy).not.toHaveBeenCalled();
  expect(ht.myPlayer.setTime).not.toHaveBeenCalled();
  expect(ht.myPlayer.play).not.toHaveBeenCalled();
  expect(ht.highlightedText).toBe(true);
  expect(activeWord.classList.contains("active")).toBe(true);

  updateSpy.mockRestore();
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

test("handleSeeked reschedules polling while playback continues (regression for #264)", async () => {
  const inst = new HyperaudioLite({
    transcript: "hypertranscript",
    player: "hyperplayer",
    autoScroll: false,
  });
  inst.myPlayer = {
    paused: false,
    getTime: jest.fn().mockResolvedValue(3.95),
  };
  const clearTimerSpy = jest.spyOn(inst, "clearTimer");
  const checkStatusSpy = jest.spyOn(inst, "checkStatus").mockImplementation(() => {});

  inst.handleSeeked();
  await Promise.resolve();

  expect(clearTimerSpy).toHaveBeenCalledTimes(1);
  expect(checkStatusSpy).toHaveBeenCalledTimes(1);
  expect(clearTimerSpy.mock.invocationCallOrder[0]).toBeLessThan(
    checkStatusSpy.mock.invocationCallOrder[0]
  );

  inst.destroy();
});

test("share-link hash triggers initial autoscroll (regression for #246)", () => {
  // init() used to run setupInitialPlayHead() while this.autoscroll was still
  // false (setupEventListeners reset it; the real value was applied later by
  // setupAutoScroll), so opening a share link never scrolled the selection
  // into view.
  const scrollSpy = jest
    .spyOn(HyperaudioLite.prototype, "scrollToParagraph")
    .mockImplementation(() => {});
  window.location.hash = "#hypertranscript=6.58,8.63";

  new HyperaudioLite({
    transcript: "hypertranscript",
    player: "hyperplayer",
    autoScroll: true,
  });

  expect(scrollSpy).toHaveBeenCalled();

  scrollSpy.mockRestore();
  window.location.hash = "";
});

test("every player class implements play() and pause() (regression for #245)", () => {
  // BasePlayer.play/pause throw "must be implemented by subclasses" since 2.5.0.
  // SoundCloud, Video.js and Vimeo relied on the old HTML5 defaults and were
  // left without implementations, so click-to-play threw on those players.
  // Call each class's play/pause against a stub of its underlying player API
  // to prove the abstract methods are overridden everywhere.
  const stubPlayer = {
    play: () => {},        // native, SoundCloud, Video.js, Vimeo, Spotify
    pause: () => {},       // native, SoundCloud, Video.js, Vimeo
    playVideo: () => {},   // YouTube
    pauseVideo: () => {},  // YouTube
    togglePlay: () => {},  // Spotify
  };

  Object.entries(hyperaudioPlayerOptions).forEach(([type, PlayerClass]) => {
    const instance = Object.create(PlayerClass.prototype);
    instance.player = stubPlayer;
    instance.isReady = true; // YouTube gates play/pause on readiness

    expect(() => instance.play()).not.toThrow();
    expect(() => instance.pause()).not.toThrow();
  });
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

test("selection playback stops at fractional end times (regression for #249)", () => {
  // end/currentTime are fractional seconds. parseInt truncated both, so with
  // end=5.25 and currentTime=5.5 the comparison saw 5 < 5 and kept playing —
  // overshooting a shared selection by up to a second.
  ht.myPlayer = { paused: false, pause: jest.fn() };
  ht.end = "5.25";
  ht.currentTime = 5.5;

  ht.checkStatus();

  expect(ht.myPlayer.pause).toHaveBeenCalled();
  expect(ht.end).toBeNull();
});

test("popover copy button copies once per click (regression for #248)", () => {
  // Popover/dialog markup is provided by the host page.
  document.body.insertAdjacentHTML(
    "beforeend",
    '<div id="popover" style="display:none"><button id="popover-btn">Copy</button></div>' +
      '<dialog id="clipboard-dialog"><p id="clipboard-text"></p><button id="clipboard-confirm">OK</button></dialog>'
  );
  // The library guards on a global `popover` binding (browsers create one for
  // elements with ids); make that explicit for jsdom.
  global.popover = document.getElementById("popover");

  // jsdom implements neither the async clipboard API nor <dialog> methods.
  const writeText = jest.fn();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  const dialog = document.getElementById("clipboard-dialog");
  dialog.showModal = jest.fn();
  dialog.close = jest.fn();

  // jsdom's Range doesn't implement getBoundingClientRect either.
  const hadRangeRect = "getBoundingClientRect" in Range.prototype;
  if (!hadRangeRect) {
    Range.prototype.getBoundingClientRect = () => ({
      left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0,
    });
  }

  const inst = new HyperaudioLite({
    transcript: "hypertranscript",
    player: "hyperplayer",
  });

  // Make several selections — each fires a mouseup on the transcript. The bug
  // was that every mouseup stacked another click listener on the copy button.
  const textNode = document.getElementById("p1").firstChild.lastChild;
  for (let i = 0; i < 3; i++) {
    document.getSelection().setBaseAndExtent(textNode, 0, textNode, 3);
    inst.transcript.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  }

  document.getElementById("popover-btn").click();
  expect(writeText).toHaveBeenCalledTimes(1);
  expect(dialog.showModal).toHaveBeenCalledTimes(1);

  // Confirm button closes the dialog (attached once, still works).
  document.getElementById("clipboard-confirm").click();
  expect(dialog.close).toHaveBeenCalledTimes(1);

  // Clean up shared test DOM/state.
  document.getSelection().removeAllRanges();
  document.getElementById("popover").remove();
  dialog.remove();
  delete global.popover;
  if (!hadRangeRect) {
    delete Range.prototype.getBoundingClientRect;
  }
  window.location.hash = "";
});

test("destroy() detaches listeners and stops the polling loop (#252)", () => {
  // Re-parsing the body drops every listener added by instances from earlier
  // tests, so only the instance under test is attached to the transcript.
  document.body.innerHTML = document.body.innerHTML;

  const inst = new HyperaudioLite({
    transcript: "hypertranscript",
    player: "hyperplayer",
  });
  const player = document.getElementById("hyperplayer");

  // Sanity: listeners are live before destroy.
  simulateClick(document.getElementsByTagName("span")[3], "click");
  expect(player.currentTime).toBe(3.95);

  inst.destroy();

  expect(inst.timer).toBeFalsy(); // polling loop stopped

  player.currentTime = 0;
  simulateClick(document.getElementsByTagName("span")[4], "click");
  expect(player.currentTime).toBe(0); // click listener removed — no seek
});

test("scrollContainer defaults to the transcript element (#254)", () => {
  const inst = new HyperaudioLite({
    transcript: "hypertranscript",
    player: "hyperplayer",
  });
  expect(inst.scrollContainer).toBe(inst.transcript);
});

test("scrollContainer accepts an element id (#254)", () => {
  document.body.insertAdjacentHTML("beforeend", '<div id="scroller"></div>');
  const inst = new HyperaudioLite({
    transcript: "hypertranscript",
    player: "hyperplayer",
    scrollContainer: "scroller",
  });
  expect(inst.scrollContainer).toBe(document.getElementById("scroller"));
  document.getElementById("scroller").remove();
});

test("scrollContainer accepts an element (#254)", () => {
  const el = document.createElement("div");
  const inst = new HyperaudioLite({
    transcript: "hypertranscript",
    player: "hyperplayer",
    scrollContainer: el,
  });
  expect(inst.scrollContainer).toBe(el);
});

test("unknown data-player-type warns instead of throwing (#253)", () => {
  const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  document.body.insertAdjacentHTML(
    "beforeend",
    '<div id="bogusplayer" data-player-type="bogus"></div>'
  );

  // Used to blow up with "hyperaudioPlayerOptions[playerType] is not a
  // constructor" — now it warns and names the valid types.
  let inst;
  expect(() => {
    inst = new HyperaudioLite({
      transcript: "hypertranscript",
      player: "bogusplayer",
    });
  }).not.toThrow();
  expect(
    warnSpy.mock.calls.some((c) => /unknown data-player-type "bogus"/.test(c[0]))
  ).toBe(true);

  // Clicks and keys on the shared transcript must not crash the player-less
  // instance either.
  expect(() =>
    simulateClick(document.getElementsByTagName("span")[1], "click")
  ).not.toThrow();

  inst.destroy(); // don't leave its listeners on the shared transcript
  warnSpy.mockRestore();
  document.getElementById("bogusplayer").remove();
});

test("Enter on a focused word sets the playhead like a click (#259)", () => {
  const inst = new HyperaudioLite({
    transcript: "hypertranscript",
    player: "hyperplayer",
  });
  const word = document.getElementsByTagName("span")[2]; // data-m="3240"
  const player = document.getElementById("hyperplayer");
  player.currentTime = 0;

  word.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
  );

  expect(player.currentTime).toBe(3.24);
});

test("smoothScrollTo jumps directly under prefers-reduced-motion (#259)", () => {
  const inst = new HyperaudioLite({
    transcript: "hypertranscript",
    player: "hyperplayer",
  });
  // jsdom has no matchMedia — install one reporting reduced motion.
  window.matchMedia = jest.fn(() => ({ matches: true }));

  const container = { scrollTop: 0 };
  inst.smoothScrollTo(container, 500, 800);

  expect(container.scrollTop).toBe(500); // immediate, no animation frames
  expect(inst.scrollAnimationId).toBeNull();
  expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");

  delete window.matchMedia;
});

test("registerPlayer() adds a custom player type (#253)", () => {
  class FakePlayer {
    constructor(instance) {
      this.instance = instance;
      this.paused = true;
    }
    getTime() {
      return Promise.resolve(0);
    }
    setTime() {}
    play() {}
    pause() {}
  }

  HyperaudioLite.registerPlayer("fake", FakePlayer);
  document.body.insertAdjacentHTML(
    "beforeend",
    '<div id="fakeplayer" data-player-type="fake"></div>'
  );

  const inst = new HyperaudioLite({
    transcript: "hypertranscript",
    player: "fakeplayer",
  });
  expect(inst.myPlayer).toBeInstanceOf(FakePlayer);

  document.getElementById("fakeplayer").remove();
  delete hyperaudioPlayerOptions.fake;
});




