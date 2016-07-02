# Hyperaudio Lite - a Hypertranscript Viewer
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]

A lightweight no-dependency viewer for viewing Hypertranscripts

As demonstrated [here](http://hyperaud.io/lab/halite/)

## Installation

```
$ npm install --save hyperaudio-lite
```

## Usage
```js
var hyperaudioLite = require('hyperaudio-lite');
```

## API

### `hyperaudioLite(data, [options])`
Description

#### Parameters
- **Array** `data`: An array of data
- **Object** `options`: An object containing the following fields:

#### Return
- **Array** - Result

## Development
- `npm run build` - Build task that generates both minified and non-minified scripts;
- `npm run test-server` - Run Mocha tests once;
- `npm run test-browser` - Run Mocha tests in the browser using Karma once;
- `npm run test` - Shortcut for `npm run test-server && npm run test-browser`;
- `npm run tdd` - Run Mocha tests & watch files for changes;
- `npm run tdd-browser` - Run Karma (w/ Mocha) tests & watch files for changes;
- `npm run coverage` - Run Isparta, a code coverage tool;

## License
MIT © [Hyperaud.io](http://github.com/hyperaudio)

[travis-url]: https://travis-ci.org/hyperaudio/hyperaudio-lite
[travis-image]: https://img.shields.io/travis/hyperaudio/hyperaudio-lite.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/hyperaudio/hyperaudio-lite
[coveralls-image]: https://img.shields.io/coveralls/hyperaudio/hyperaudio-lite.svg?style=flat-square

[depstat-url]: https://david-dm.org/hyperaudio/hyperaudio-lite
[depstat-image]: https://david-dm.org/hyperaudio/hyperaudio-lite.svg?style=flat-square
