(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["HyperaudioLite"] = factory();
	else
		root["HyperaudioLite"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _utils = __webpack_require__(1);

	var defaults = {
	  scroll: true
	};

	var HyperaudioLite = function HyperaudioLite(player, transcript) {
	  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	  options = Object.assign({}, defaults, options);

	  var words = transcript.getElementsByTagName('a');
	  var paras = transcript.getElementsByTagName('p');

	  var paraIndex = 0;

	  words[0].classList.add('active');
	  paras[0].classList.add('active');

	  var start = (0, _utils.getParameter)('s');
	  var end = parseFloat((0, _utils.getParameter)('d')) + parseFloat(start);

	  transcript.addEventListener('click', function (e) {
	    var target = e.target ? e.target : e.srcElement;
	    target.setAttribute('class', 'active');
	    var timeSecs = parseInt(target.getAttribute('data-m'), 10) / 1000;

	    if (!isNaN(parseFloat(timeSecs))) {
	      end = null;
	      player.currentTime = timeSecs;
	      player.play();
	    }
	  }, false);

	  player.addEventListener('timeupdate', function (e) {
	    // check for end time of shared piece
	    if (end && end / 10 < player.currentTime) {
	      player.pause();
	      end = null;
	    }

	    var activeitems = transcript.getElementsByClassName('active');
	    var activeitemsLength = activeitems.length;

	    for (var a = 0; a < activeitemsLength; a++) {
	      if (activeitems[a]) {
	        // TODO: look into why we need this
	        activeitems[a].classList.remove('active');
	      }
	    }

	    // Establish current paragraph index
	    var currentParaIndex = void 0;

	    for (var i = 1; i < words.length; i++) {
	      if (parseInt(words[i].getAttribute('data-m')) / 1000 > player.currentTime) {
	        // TODO: look for a better way of doing this
	        var strayActive = transcript.getElementsByClassName('active')[0];
	        strayActive.classList.remove('active');

	        // word time is in the future - set the previous word as active.
	        words[i - 1].classList.add('active');
	        words[i - 1].parentNode.classList.add('active');

	        for (var _a = 0; _a < paras.length; _a++) {
	          if (paras[_a].classList.contains('active')) {
	            currentParaIndex = _a;
	            break;
	          }
	        }

	        if (options.scroll && typeof Velocity !== 'undefined' && currentParaIndex !== paraIndex) {
	          try {
	            Velocity(words[i].parentNode, 'scroll', {
	              container: transcript,
	              duration: 800,
	              delay: 0
	            });
	          } catch (ignored) {}
	          paraIndex = currentParaIndex;
	        }

	        break;
	      }
	    }
	  }, false);

	  if (!isNaN(parseFloat(start))) {
	    player.currentTime = start / 10;
	    player.play();
	  }
	};

	exports.default = function (playerId, transcriptId, options) {
	  var player = document.getElementById(playerId);
	  var transcript = document.getElementById(transcriptId);

	  return new HyperaudioLite(player, transcript, options);
	};

	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var getParameter = exports.getParameter = function getParameter(name) {
	  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	  var results = regex.exec(location.search);
	  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

/***/ }
/******/ ])
});
;