/*
 * example-nav.js — shared chrome for the Hyperaudio Lite demo pages.
 *
 * This builds the header bar, demo navigation and footer that tie the example
 * pages together and link back to the repository. It is demo scaffolding only,
 * not part of the Hyperaudio Lite library — you don't need it in your own pages.
 * Each demo opts in with `<body data-demo="KEY">` plus a single
 * `<script src="js/example-nav.js"></script>` tag near the end of the body.
 *
 * (C) The Hyperaudio Project. MIT licensed.
 */
(function () {
  var REPO = 'https://github.com/hyperaudio/hyperaudio-lite';

  // Single source of truth for the demo list. `key` matches data-demo / filename.
  var DEMOS = [
    { key: 'index',               file: 'index.html',               name: 'Native video',        blurb: 'An HTML5 <video> element synced to a clickable, searchable transcript.' },
    { key: 'active',              file: 'active.html',              name: 'Active word',         blurb: 'Native video with active word and paragraph highlighting enabled.' },
    { key: 'youtube',             file: 'youtube.html',             name: 'YouTube',             blurb: 'A YouTube iframe driven by the transcript.' },
    { key: 'youtube-multiplayer', file: 'youtube-multiplayer.html', name: 'YouTube multiplayer', blurb: 'Several YouTube players on a single page.' },
    { key: 'vimeo',               file: 'vimeo.html',               name: 'Vimeo',               blurb: 'A Vimeo player driven by the transcript.' },
    { key: 'vidstack',            file: 'vidstack.html',            name: 'Vidstack',            blurb: 'The Vidstack player driven by the transcript.' },
    { key: 'videojs',             file: 'videojs.html',             name: 'Video.js',            blurb: 'A Video.js player driven by the transcript.' },
    { key: 'soundcloud',          file: 'soundcloud.html',          name: 'SoundCloud',          blurb: 'A SoundCloud embed driven by the transcript.' },
    { key: 'spotify',             file: 'spotify.html',             name: 'Spotify',             blurb: 'A Spotify embed driven by the transcript.' },
    { key: 'multiplayer',         file: 'multiplayer.html',         name: 'Multiplayer',         blurb: 'Multiple native players sharing one page.' }
  ];

  function el(tag, attrs, kids) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'class') { node.className = attrs[k]; }
        else if (k === 'text') { node.textContent = attrs[k]; }
        else { node.setAttribute(k, attrs[k]); }
      });
    }
    (kids || []).forEach(function (kid) {
      node.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
    });
    return node;
  }

  // Which demo is this? Prefer the explicit attribute, else infer from the URL.
  function currentKey() {
    var attr = document.body.getAttribute('data-demo');
    if (attr) { return attr; }
    var path = (location.pathname.split('/').pop() || 'index.html');
    if (path === '' ) { path = 'index.html'; }
    for (var i = 0; i < DEMOS.length; i++) {
      if (DEMOS[i].file === path) { return DEMOS[i].key; }
    }
    return 'index';
  }

  function build() {
    var key = currentKey();
    var current = DEMOS.filter(function (d) { return d.key === key; })[0];

    // ---- header: brand · current demo name · repo link ----
    var inner = el('div', { class: 'hl-chrome-inner' }, [
      el('a', { class: 'hl-brand', href: 'index.html', text: 'Hyperaudio Lite' }),
      el('span', { class: 'hl-demo-name', text: current ? current.name : 'Demo' }),
      el('a', { class: 'hl-repo', href: REPO, text: 'View on GitHub →' })
    ]);

    // ---- demo nav ----
    var nav = el('nav', { class: 'hl-demo-nav', 'aria-label': 'Demos' });
    DEMOS.forEach(function (d) {
      var link = el('a', { href: d.file, text: d.name });
      if (d.key === key) {
        link.className = 'is-current';
        link.setAttribute('aria-current', 'page');
      }
      nav.appendChild(link);
    });

    var header = el('header', { class: 'hl-chrome', role: 'banner' }, [inner, nav]);
    document.body.insertBefore(header, document.body.firstChild);

    // ---- optional demo grid (index/home page) ----
    var grid = document.getElementById('hl-demo-grid');
    if (grid) {
      DEMOS.forEach(function (d) {
        grid.appendChild(el('a', { class: 'hl-demo-card' + (d.key === key ? ' is-current' : ''), href: d.file }, [
          el('span', { class: 'hl-demo-card-name', text: d.name }),
          el('span', { class: 'hl-demo-card-blurb', text: d.blurb })
        ]));
      });
    }

    // ---- footer ----
    var footer = el('footer', { class: 'hl-footer' }, [
      el('p', {}, [
        'A no-framework, zero-build transcript player. ',
        el('a', { href: REPO, text: 'Source on GitHub' }),
        ' · MIT licensed · The Hyperaudio Project'
      ])
    ]);
    document.body.appendChild(footer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
