/*! (C) The Hyperaudio Project. MIT @license: en.wikipedia.org/wiki/MIT_License. */
/*! Version 2.5.1 */

'use strict';

// Example wrapper for hyperaudio-lite with search and playback-rate controls.
// Highlights every transcript span whose normalised text contains the search
// phrase. Multi-word phrases walk consecutive spans — each phrase word must be
// contained by the matching span.

const SEARCH_PUNCT = /[.,\-\/#!$%\^&\*;:{}=_`~()\?\s]/g;
const normalise = (text) => text.toLowerCase().replace(SEARCH_PUNCT, '');

const searchPhrase = (phrase) => {
  const spans = document.querySelectorAll('[data-m]');
  if (!spans.length) return;

  document.querySelectorAll('.search-match')
    .forEach((el) => el.classList.remove('search-match'));

  const needles = phrase
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(SEARCH_PUNCT, ''))
    .filter(Boolean);
  if (!needles.length) return;

  const lastStart = spans.length - needles.length;
  for (let i = 0; i <= lastStart; i++) {
    const hit = needles.every((needle, j) =>
      normalise(spans[i + j].innerHTML).includes(needle)
    );
    if (hit) {
      for (let j = 0; j < needles.length; j++) {
        spans[i + j].classList.add('search-match');
      }
    }
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
