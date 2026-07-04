/*! (C) The Hyperaudio Project. MIT @license: en.wikipedia.org/wiki/MIT_License. */
/*! Version 2.6.2 */

'use strict';

// Example wrapper for hyperaudio-lite with search and playback-rate controls.
// Walks consecutive [data-m] spans for multi-word phrases; for each matching
// span wraps just the matched substring in a <mark class="search-mark"> so the
// highlight covers the query, not the whole word.

const SEARCH_PUNCT = /[.,\-\/#!$%\^&\*;:{}=_`~()\?\s]/g;
// Non-global copy for single-character tests (a /g regex is stateful in .test()).
const SEARCH_PUNCT_CHAR = new RegExp(SEARCH_PUNCT.source);
const normalise = (text) => text.toLowerCase().replace(SEARCH_PUNCT, '');

const clearPreviousSearch = () => {
  document.querySelectorAll('mark.search-mark').forEach((mark) => {
    mark.replaceWith(document.createTextNode(mark.textContent));
  });
  document.querySelectorAll('.search-match').forEach((el) => {
    el.classList.remove('search-match');
    el.normalize(); // merge adjacent text nodes left behind by the unwrap
  });
};

// Find the range of `original` whose normalised form matches `needle` (already
// lowercased and punctuation-stripped): walk the raw text consuming needle
// characters and skipping punctuation inside the match (#260). Returns
// [start, end) indices into `original`, or null when the needle isn't present.
const findRawRange = (original, needle) => {
  const lower = original.toLowerCase();
  for (let start = 0; start < lower.length; start++) {
    if (lower[start] !== needle[0]) continue;
    let oi = start;
    let ni = 0;
    while (oi < lower.length && ni < needle.length) {
      if (lower[oi] === needle[ni]) {
        oi++;
        ni++;
      } else if (SEARCH_PUNCT_CHAR.test(lower[oi])) {
        oi++;
      } else {
        break;
      }
    }
    if (ni === needle.length) return [start, oi];
  }
  return null;
};

// Wrap the first occurrence of `needle` (case-insensitive) inside `span`'s
// text with <mark class="search-mark">. Leading and trailing punctuation stay
// outside the mark; punctuation inside the match (the dash in "SPEAKER-2" for
// the needle "speaker2") is included, so the visible word is highlighted
// whole even though matching compares punctuation-stripped text (#260).
const highlightSubstring = (span, needle) => {
  const original = span.textContent;
  const range = findRawRange(original, needle);
  if (range === null) return;
  const before = original.slice(0, range[0]);
  const hit = original.slice(range[0], range[1]);
  const after = original.slice(range[1]);
  span.textContent = '';
  if (before) span.append(before);
  const mark = document.createElement('mark');
  mark.className = 'search-mark';
  mark.textContent = hit;
  span.append(mark);
  if (after) span.append(after);
};

const searchPhrase = (phrase) => {
  const spans = document.querySelectorAll('[data-m]');
  if (!spans.length) return;

  clearPreviousSearch();

  const needles = phrase
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(SEARCH_PUNCT, ''))
    .filter(Boolean);
  if (!needles.length) return;

  const lastStart = spans.length - needles.length;
  for (let i = 0; i <= lastStart; i++) {
    const hit = needles.every((needle, j) =>
      normalise(spans[i + j].textContent).includes(needle)
    );
    if (!hit) continue;
    needles.forEach((needle, j) => {
      const span = spans[i + j];
      span.classList.add('search-match');
      highlightSubstring(span, needle);
    });
  }
};

document.getElementById('searchForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  searchPhrase(document.getElementById('search').value);
});

window.addEventListener('load', () => {
  const pbr = document.getElementById('pbr');
  const display = document.getElementById('currentPbr');
  if (!pbr) return;

  pbr.addEventListener('input', () => {
    if (display) display.textContent = pbr.value;
    if (typeof hyperplayer !== 'undefined') {
      hyperplayer.playbackRate = pbr.value;
    }
  });
});

// Export for testing or module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { searchPhrase, highlightSubstring, findRawRange, normalise, clearPreviousSearch };
}
