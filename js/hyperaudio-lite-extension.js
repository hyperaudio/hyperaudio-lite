/*! (C) The Hyperaudio Project. MIT @license: en.wikipedia.org/wiki/MIT_License. */
/*! Version 2.5.1 */

'use strict';

// Example wrapper for hyperaudio-lite with search and playback-rate controls.
// Walks consecutive [data-m] spans for multi-word phrases; for each matching
// span wraps just the matched substring in a <mark class="search-mark"> so the
// highlight covers the query, not the whole word.

const SEARCH_PUNCT = /[.,\-\/#!$%\^&\*;:{}=_`~()\?\s]/g;
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

// Wrap the first occurrence of `needle` (case-insensitive) inside `span`'s
// text with <mark class="search-mark">. Punctuation stays outside the mark.
const highlightSubstring = (span, needle) => {
  const original = span.textContent;
  const idx = original.toLowerCase().indexOf(needle);
  if (idx < 0) return;
  const before = original.slice(0, idx);
  const hit = original.slice(idx, idx + needle.length);
  const after = original.slice(idx + needle.length);
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
