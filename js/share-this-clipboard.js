!function(e,r){
  "object"==typeof exports&&"undefined"!=typeof module?r(exports):"function"==typeof define&&define.amd?define(["exports"],r):r((e=e||self).ShareThisViaClipboard={})
}
(this,(
function(e){
  "use strict";
  e.getShareUrl = function(text,refUrl){
    const saneText = text.replaceAll("'", "`");
    const cbText = "&quot;" + saneText + "&quot; " + refUrl;
    return `onclick="navigator.clipboard.writeText('${cbText}');alert('copied the following text to the clipboard – ${cbText}')"`;
  },
  e.name="clipboard",
  e.render = function(text, rawText, refUrl){
    return"<a "+this.getShareUrl(text,refUrl)+' rel="noopener nofollow noreferrer"><svg xmlns="http://www.w3.org/2000/svg" viewBox="-9 -9 600 600"><path d="m161,152.9h190c0.1,0 0.1,0 0.2,0 10.8,0 19.6-7.1 19.6-16 0-1.5-14.1-82.7-14.1-82.7-1.3-7.9-9.6-13.8-19.4-13.8l-61.7,.1v-13.5c0-8.8-8.8-16-19.6-16-10.8,0-19.6,7.1-19.6,16v13.6l-61.8,.1c-9.8,0-18,5.9-19.4,13.8l-13.7,80.3c-1.2,14.3 13.5,18.1 19.5,18.1z" fill="currentcolor"/><path d="m427.5,78.9h-26.8c0,0 9.3,53.5 9.3,58 0,30.4-26.4,55.2-58.8,55.2h-190.2c-19.6,0.4-63.3-14.7-58.1-63.9l8.4-49.2h-26.8c-10.8,0-19.6,8.8-19.6,19.6v382.9c0,10.8 8.8,19.6 19.6,19.6h343c10.8,0 19.6-8.8 19.6-19.6v-383c0-10.8-8.8-19.6-19.6-19.6zm-76.5,320.1h-190c-10.8,0-19.6-8.8-19.6-19.6 0-10.8 8.8-19.6 19.6-19.6h190c10.8,0 19.6,8.8 19.6,19.6 0,10.8-8.7,19.6-19.6,19.6zm0-110.3h-190c-10.8,0-19.6-8.8-19.6-19.6 0-10.8 8.8-19.6 19.6-19.6h190c10.8,0 19.6,8.8 19.6,19.6 0,10.8-8.7,19.6-19.6,19.6z" fill="currentcolor"/></svg></a>'
  },
  Object.defineProperty(e,"__esModule",{value:!0})
}));
