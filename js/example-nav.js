/*
 * example-nav.js — builds the shell chrome around each demo iframe.
 *
 * Demo scaffolding only — not part of the Hyperaudio Lite library. Each shell
 * page opts in with `<body class="demo-<key>" data-demo="<key>">` and a single
 * `<script src="js/example-nav.js"></script>` near the end of the body.
 *
 * On the iframed demo pages (demos/*.html) this script is NOT loaded; those
 * pages just set their own theme class on <body>.
 *
 * (C) The Hyperaudio Project. MIT licensed.
 */
(function () {
  var REPO = 'https://github.com/hyperaudio/hyperaudio-lite';
  var BLOB = REPO + '/blob/main';

  // Single source of truth for the demo list.
  // `key` matches body class suffix and data-demo and file basename.
  var DEMOS = [
    { key: 'index',               name: 'Native video',        blurb: 'An HTML5 <video> element synced to a clickable, searchable transcript.' },
    { key: 'active',              name: 'Active word',         blurb: 'Native video with active word and paragraph highlighting enabled.' },
    { key: 'youtube',             name: 'YouTube',             blurb: 'A YouTube iframe driven by the transcript.' },
    { key: 'youtube-multiplayer', name: 'YouTube multiplayer', blurb: 'Several YouTube players on a single page.' },
    { key: 'vimeo',               name: 'Vimeo',               blurb: 'A Vimeo player driven by the transcript.' },
    { key: 'vidstack',            name: 'Vidstack',            blurb: 'The Vidstack player driven by the transcript.' },
    { key: 'videojs',             name: 'Video.js',            blurb: 'A Video.js player driven by the transcript.' },
    { key: 'soundcloud',          name: 'SoundCloud',          blurb: 'A SoundCloud embed driven by the transcript.' },
    { key: 'spotify',             name: 'Spotify',             blurb: 'A Spotify embed driven by the transcript.' },
    { key: 'multiplayer',         name: 'Multiplayer',         blurb: 'Multiple native players sharing one page.' }
  ];

  function el(tag, attrs, kids) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'class') { node.className = attrs[k]; }
        else if (k === 'text') { node.textContent = attrs[k]; }
        else if (k === 'html') { node.innerHTML = attrs[k]; }
        else { node.setAttribute(k, attrs[k]); }
      });
    }
    (kids || []).forEach(function (kid) {
      if (kid == null) { return; }
      node.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
    });
    return node;
  }

  function currentKey() {
    var attr = document.body.getAttribute('data-demo');
    if (attr) { return attr; }
    var path = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
    for (var i = 0; i < DEMOS.length; i++) {
      if (DEMOS[i].key === path) { return DEMOS[i].key; }
    }
    return 'index';
  }

  function indexOfKey(key) {
    for (var i = 0; i < DEMOS.length; i++) {
      if (DEMOS[i].key === key) { return i; }
    }
    return 0;
  }

  function padNum(n) { return n < 10 ? '0' + n : '' + n; }

  function buildHeader(current) {
    var inner = el('div', { class: 'hl-chrome-inner' }, [
      el('a', { class: 'hl-brand', href: 'index.html', text: 'Hyperaudio Lite' }),
      el('span', { class: 'hl-demo-name', text: current ? current.name : 'Demo' }),
      el('a', { class: 'hl-repo', href: REPO, text: 'View on GitHub →' })
    ]);
    return el('header', { class: 'hl-chrome', role: 'banner' }, [inner]);
  }

  function buildNav(currentKey) {
    var nav = el('nav', { class: 'hl-demo-nav', 'aria-label': 'Demos' });
    DEMOS.forEach(function (d) {
      var link = el('a', { href: d.key === 'index' ? 'index.html' : (d.key + '.html'), text: d.name });
      if (d.key === currentKey) {
        link.className = 'is-current';
        link.setAttribute('aria-current', 'page');
      }
      nav.appendChild(link);
    });
    return nav;
  }

  function buildPage(key, current, idx) {
    var page = el('main', { class: 'hl-page', role: 'main' });

    if (key === 'index') {
      // Homepage: intro + grid, no iframe at the top.
      page.appendChild(el('section', { class: 'hl-intro' }, [
        el('h1', { text: 'Hyperaudio Lite' }),
        el('p', { text: 'A lightweight, dependency-free library that ties a transcript to its audio or video: words highlight as the media plays, and clicking a word jumps the player to that moment. No frameworks, no build step.' }),
        el('p', { text: 'Pick a demo to see the library wired up to a particular player.' })
      ]));
      var grid = el('div', { id: 'hl-demo-grid' });
      DEMOS.forEach(function (d, i) {
        grid.appendChild(el('a', { class: 'hl-demo-card', href: d.key === 'index' ? 'index.html' : (d.key + '.html') }, [
          el('span', { class: 'hl-demo-card-name', text: d.name }),
          el('span', { class: 'hl-demo-card-blurb', text: d.blurb })
        ]));
      });
      page.appendChild(grid);
    }

    // Eyebrow + title + blurb + iframe + source bar for every demo (including index).
    page.appendChild(el('div', { class: 'hl-eyebrow' }, [
      el('span', {}, ['Demo ', el('strong', { text: padNum(idx + 1) }), ' / ' + padNum(DEMOS.length)]),
      el('span', { class: 'hl-eyebrow-sig' })
    ]));
    // Title: wrap the last word in a span so a theme can highlight it as the
    // signature (the active-word demo uses this).
    var titleParts = current.name.split(' ');
    var titleTail = titleParts.pop();
    var titleHead = titleParts.join(' ');
    page.appendChild(el('h1', { class: 'hl-title' }, [
      titleHead ? titleHead + ' ' : '',
      el('span', { class: 'hl-title-mark', text: titleTail })
    ]));
    page.appendChild(el('p', { class: 'hl-blurb', text: current.blurb }));

    var iframeSrc = 'demos/' + current.key + '.html';
    var blobUrl = BLOB + '/' + iframeSrc;

    var iframe = el('iframe', {
      src: iframeSrc,
      title: current.name + ' demo',
      loading: 'lazy',
      allow: 'autoplay; encrypted-media; clipboard-read; clipboard-write'
    });
    page.appendChild(el('div', { class: 'hl-frame' }, [iframe]));

    // source bar
    var sourceBtn = el('button', {
      class: 'hl-source-btn',
      type: 'button',
      'aria-expanded': 'false',
      'aria-controls': 'hl-source-panel'
    }, [
      el('span', { class: 'hl-source-icon', html: '&lt;/&gt;' }),
      'View source'
    ]);
    var openBtn = el('a', {
      class: 'hl-source-btn',
      href: iframeSrc,
      target: '_blank',
      rel: 'noopener'
    }, ['Open standalone ↗']);
    var ghBtn = el('a', {
      class: 'hl-source-btn',
      href: blobUrl,
      target: '_blank',
      rel: 'noopener'
    }, ['On GitHub ↗']);
    page.appendChild(el('div', { class: 'hl-source-bar' }, [sourceBtn, openBtn, ghBtn]));

    var panel = el('div', { class: 'hl-source-panel', id: 'hl-source-panel' }, [
      el('pre', {}, [el('code', { text: '' })])
    ]);
    page.appendChild(panel);

    sourceBtn.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('is-open');
      sourceBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen && !panel.dataset.loaded) {
        var code = panel.querySelector('code');
        code.textContent = 'Loading…';
        fetch(iframeSrc)
          .then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); })
          .then(function (txt) {
            code.textContent = txt;
            panel.dataset.loaded = '1';
          })
          .catch(function () {
            code.textContent = '// Could not load source. Try the GitHub link →';
          });
      }
    });

    return page;
  }

  function buildFooter() {
    var inner = el('div', { class: 'hl-footer-inner' }, [
      el('span', { text: 'A no-framework, zero-build transcript player' }),
      el('span', {}, [
        el('a', { href: REPO, text: 'Source on GitHub' }),
        '  ·  MIT licensed'
      ])
    ]);
    return el('footer', { class: 'hl-footer' }, [inner]);
  }

  function build() {
    var key = currentKey();
    var idx = indexOfKey(key);
    var current = DEMOS[idx];

    // Ensure the body theme class is present (allows shell HTML to omit it).
    if (!document.body.classList.contains('demo-' + key)) {
      document.body.classList.add('demo-' + key);
    }

    var header = buildHeader(current);
    var nav = buildNav(key);
    var page = buildPage(key, current, idx);
    var footer = buildFooter();

    document.body.insertBefore(header, document.body.firstChild);
    document.body.insertBefore(nav, header.nextSibling);
    document.body.insertBefore(page, nav.nextSibling);
    document.body.appendChild(footer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
