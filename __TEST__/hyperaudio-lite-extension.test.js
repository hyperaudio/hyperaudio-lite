/**
 * @jest-environment jsdom
 *
 * Tests for the search half of js/hyperaudio-lite-extension.js — needle
 * normalisation, phrase matching across spans, and mark placement on words
 * containing internal punctuation (#260).
 */

const {
  searchPhrase,
  findRawRange,
  clearPreviousSearch,
} = require("../js/hyperaudio-lite-extension");

// Build a transcript of [data-m] word spans; a ["speaker", text] tuple emits
// a speaker span (data-d 0), mirroring transcripts produced by the editor.
function buildTranscript(words) {
  const spans = words
    .map((w, i) => {
      if (w[0] === "speaker") {
        return `<span class="speaker" data-m="${i * 1000}" data-d="0">${w[1]} </span>`;
      }
      return `<span data-m="${i * 1000}" data-d="500">${w[0]} </span>`;
    })
    .join("");
  document.body.innerHTML = `<div id="hypertranscript"><p>${spans}</p></div>`;
}

const marks = () =>
  Array.from(document.querySelectorAll("mark.search-mark")).map(
    (m) => m.textContent
  );

const matchedSpans = () =>
  Array.from(document.querySelectorAll(".search-match")).map((s) =>
    s.textContent.trim()
  );

describe("findRawRange", () => {
  test("plain substring", () => {
    expect(findRawRange("Lorem ", "lorem")).toEqual([0, 5]);
  });

  test("skips punctuation inside the match", () => {
    expect(findRawRange("[SPEAKER-2] ", "[speaker2]")).toEqual([0, 11]);
  });

  test("leaves trailing punctuation outside the range", () => {
    // the trailing "." is not consumed once the needle is exhausted
    expect(findRawRange("U.S. ", "us")).toEqual([0, 3]);
  });

  test("leaves leading punctuation outside the range", () => {
    expect(findRawRange("-well ", "well")).toEqual([1, 5]);
  });

  test("returns null when the needle is absent", () => {
    expect(findRawRange("Lorem ", "ipsum")).toBeNull();
  });
});

describe("searchPhrase", () => {
  test("marks a plain word, punctuation outside the mark", () => {
    buildTranscript([["Lorem,"], ["ipsum"]]);
    searchPhrase("lorem");
    expect(marks()).toEqual(["Lorem"]);
    expect(matchedSpans()).toEqual(["Lorem,"]);
  });

  test("marks a speaker label containing a dash (#260)", () => {
    buildTranscript([["speaker", "[SPEAKER-2]"], ["Hello"]]);
    searchPhrase("[speaker-2]");
    expect(marks()).toEqual(["[SPEAKER-2]"]);
    expect(matchedSpans()).toEqual(["[SPEAKER-2]"]);
  });

  test("marks a hyphenated word", () => {
    buildTranscript([["a"], ["well-known"], ["fact"]]);
    searchPhrase("well-known");
    expect(marks()).toEqual(["well-known"]);
  });

  test("marks dotted abbreviations", () => {
    buildTranscript([["the"], ["U.S."], ["economy"]]);
    searchPhrase("U.S.");
    // the final "." follows the last needle character, so it stays outside
    expect(marks()).toEqual(["U.S"]);
  });

  test("multi-word phrases still mark consecutive spans", () => {
    buildTranscript([["one"], ["two"], ["three"]]);
    searchPhrase("two three");
    expect(marks()).toEqual(["two", "three"]);
    expect(matchedSpans()).toEqual(["two", "three"]);
  });

  test("a new search clears previous marks", () => {
    buildTranscript([["alpha"], ["beta"]]);
    searchPhrase("alpha");
    searchPhrase("beta");
    expect(marks()).toEqual(["beta"]);
    expect(matchedSpans()).toEqual(["beta"]);
  });

  test("an empty or punctuation-only query marks nothing", () => {
    buildTranscript([["alpha"], ["beta"]]);
    searchPhrase("alpha");
    searchPhrase("---");
    expect(marks()).toEqual([]);
  });
});

describe("clearPreviousSearch", () => {
  test("unwraps marks and merges the text nodes back", () => {
    buildTranscript([["Lorem,"]]);
    searchPhrase("lorem");
    clearPreviousSearch();
    const span = document.querySelector("[data-m]");
    expect(document.querySelectorAll("mark").length).toBe(0);
    expect(span.childNodes.length).toBe(1);
    expect(span.textContent).toBe("Lorem, ");
  });
});
