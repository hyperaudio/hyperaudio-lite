/*! (C) The Hyperaudio Project. MIT @license: en.wikipedia.org/wiki/MIT_License. */
/*! Version 2.1.6 */
'use strict';

const caption = function () {
  const cap = {};

  function formatSeconds(seconds) {
    if (typeof seconds === 'number') {
      //console.log("seconds = "+seconds);
      return new Date(seconds.toFixed(3) * 1000).toISOString().substring(11, 23);
    } else {
      console.log(`warning - attempting to format the non number: ${seconds}`);
      return null;
    }
  }

  function convertTimecodeToSrt(timecode) {
    //the same as VTT format but milliseconds separated by a comma
    return timecode.substring(0, 8) + ',' + timecode.substring(9, 12);
  }

  // Inverse of formatSeconds: "HH:MM:SS.mmm" -> seconds (number).
  function timecodeToSeconds(timecode) {
    if (typeof timecode !== 'string') {
      return NaN;
    }
    const parts = timecode.split(':');
    if (parts.length !== 3) {
      return NaN;
    }
    return (parseInt(parts[0], 10) * 3600) + (parseInt(parts[1], 10) * 60) + parseFloat(parts[2]);
  }

  cap.init = function (transcriptId, playerId, maxLength, minLength, label, srclang, parent) {

    let transcript = document.getElementById(transcriptId);

    if (parent) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(parent.innerHTML, 'text/html');
      transcript = doc.getElementById(transcriptId);
    }

    const words = transcript.querySelectorAll('[data-m]');
    const data = {};
    data.segments = [];

    function segmentMeta(speaker, start, duration, chars) {
      this.speaker = speaker;
      this.start = start;
      this.duration = duration;
      this.chars = chars;
      this.words = [];
    }

    function wordMeta(start, duration, text) {
      this.start = start;
      this.duration = duration;
      this.text = text;
    }

    let thisWordMeta;
    let thisSegmentMeta = null;

    // defaults
    let maxLineLength = 37;
    let minLineLength = 21;
    const maxWordDuration = 2; //seconds

    // Timing safeguards (applied after segmentation, before serialisation).
    // These only ever EXTEND a cue that is too short to read comfortably,
    // using the silent gap before the next cue. They never alter the text,
    // the cue order/count, or the line splitting, and never create overlaps,
    // so the VTT/SRT format and the segmentation are unchanged.
    // To disable: set readingSpeedCps = Infinity and minCaptionDuration = 0.
    const readingSpeedCps = 17;    // max characters/second a viewer can read (Netflix/BBC ~ 15-17)
    const minCaptionDuration = 1;  // seconds - shortest time a cue should stay on screen
    const minCaptionGap = 0.04;    // seconds - gap preserved before the next cue when extending

    // Orphan handling: a short trailing fragment (e.g. a lone word like "cloud.")
    // left over at the end of a sentence is folded back into the previous caption
    // of the SAME sentence instead of being stranded on its own line/cue, as long
    // as the resulting line stays within orphanLineTolerance of maxLineLength.
    // To disable: set orphanMaxWords = 0 and orphanMaxChars = 0.
    const orphanMaxWords = 1;       // fold back leftovers of at most this many words...
    const orphanMaxChars = 14;      // ...or at most this many visible characters
    const orphanLineTolerance = 12; // chars the merged line may exceed maxLineLength by

    let captionsVtt = 'WEBVTT\n';
    let captionsSrt = '';

    const endSentenceDelimiter = /[\.。?؟!]/g;
    const midSentenceDelimiter = /[,、–，،و:，…‥]/g;

    if (!isNaN(maxLength) && maxLength != null) {
      maxLineLength = maxLength;
    }

    if (!isNaN(minLength) && minLength != null) {
      minLineLength = minLength;
    }

    words.forEach((word, i) => {
      if (thisSegmentMeta === null) {
        // create segment meta object
        thisSegmentMeta = new segmentMeta('', null, 0, 0, 0);
      }

      if (word.classList.contains('speaker')) {
        // checking that this is not a new segment AND a new empty segment wasn't already created
        if (thisSegmentMeta !== null && thisSegmentMeta.start !== null) {
          data.segments.push(thisSegmentMeta); // push the previous segment because it's a new speaker
          thisSegmentMeta = new segmentMeta('', null, 0, 0, 0);
        }

        thisSegmentMeta.speaker = word.innerText;
      } else {
        let thisStart = parseInt(word.getAttribute('data-m'), 10) / 1000;
        let thisDuration = parseInt(word.getAttribute('data-d'), 10) / 1000;

        if (isNaN(thisStart)) {
          thisStart = 0;
        }

        // data-d (duration) is an optional attribute, if it doesn't exist
        // use the start time of the next word (if it exists) or for the last word
        // pick a sensible duration.

        if (isNaN(thisDuration)) {
          if (i < (words.length - 1)) {
            thisDuration = (parseInt(words[i + 1].getAttribute('data-m') - 1, 10) / 1000) - thisStart;
            if (thisDuration > maxWordDuration) {
              thisDuration = maxWordDuration;
            }
          } else {
            thisDuration = 5; // sensible default for the last word
          }
        }

        const thisText = word.innerText;

        thisWordMeta = new wordMeta(thisStart, thisDuration, thisText);

        if (thisSegmentMeta.start === null) {
          thisSegmentMeta.start = thisStart;
          thisSegmentMeta.duration = 0;
          thisSegmentMeta.chars = 0;
        }

        thisSegmentMeta.duration += thisDuration;
        thisSegmentMeta.chars += thisText.length;

        thisSegmentMeta.words.push(thisWordMeta);

        // remove spaces first just in case
        const lastChar = thisText.replace(/\s/g, '').slice(-1);
        if (lastChar.match(endSentenceDelimiter)) {
          data.segments.push(thisSegmentMeta);
          thisSegmentMeta = null;
        }
      }
    });

    //console.log(data.segments);

    function captionMeta(start, stop, text) {
      this.start = start;
      this.stop = stop;
      this.text = text;
    }

    const captions = [];
    let thisCaption = null;

    data.segments.forEach((segment, i, arr) => {
      // Captions pushed from here on belong to this segment (one sentence,
      // one speaker) - used to fold a trailing orphan word back safely.
      const segmentStartCount = captions.length;

      // If the entire segment fits on a line, add it to the captions.
      if (segment.chars < maxLineLength) {

        // Prefer the last word's actual end time over the accumulated
        // duration, which only sums word durations and undercounts the
        // segment whenever there are silent gaps between words.
        const lastWord = segment.words[segment.words.length - 1];
        let segmentStop;
        if (lastWord !== undefined && !isNaN(lastWord.start + lastWord.duration)) {
          segmentStop = lastWord.start + lastWord.duration;
        } else if (segment.duration > 0) {
          segmentStop = segment.start + segment.duration;
        } else if (i + 1 < arr.length) {
          segmentStop = arr[i + 1].start;
        } else {
          segmentStop = segment.start + 5;
        }

        thisCaption = new captionMeta(
          formatSeconds(segment.start),
          formatSeconds(segmentStop),
          '',
        );

        segment.words.forEach((word) => {
          thisCaption.text += word.text;
        });

        thisCaption.text += '\n';
        //console.log("0. pushing because the whole segment fits on a line!");
        //console.log(thisCaption);
        captions.push(thisCaption);
        thisCaption = null;
      } else {
        // The number of chars in this segment is longer than our single line maximum

        let charCount = 0;
        let lineText = '';
        let firstLine = true;
        let lastOutTime;
        let lastInTime = null;

        segment.words.forEach((word, index) => {
          const lastChar = word.text.replace(/\s/g, '').slice(-1);

          if (lastInTime === null) {
            // if it doesn't exist yet set the caption start time to the word's start time.
            lastInTime = word.start;
          }

          // Are we over the minimum length of a line and hitting a good place to split mid-sentence?
          if (charCount + word.text.length > minLineLength && lastChar.match(midSentenceDelimiter)) {
            if (firstLine === true) {
              thisCaption = new captionMeta(
                formatSeconds(lastInTime),
                formatSeconds(word.start + word.duration),
                '',
              );
              thisCaption.text += lineText + word.text + '\n';

              //check for last word in segment, if it is we can push a one line caption, if not – move on to second line

              if (index + 1 >= segment.words.length) {
                //console.log("1. pushing because we're at a good place to split, we're on the first line but it's the last word of the segment.");
                //console.log(thisCaption);
                captions.push(thisCaption);
                thisCaption = null;
              } else {
                firstLine = false;
              }
            } else {
              // We're on the second line ... we're over the minimum chars and in a good place to split – let's push the caption

              thisCaption.stop = formatSeconds(word.start + word.duration);
              thisCaption.text += lineText + word.text;
              //console.log("2. pushing because we're on the second line and have a good place to split");
              //console.log(thisCaption);
              captions.push(thisCaption);
              thisCaption = null;
              firstLine = true;
            }

            // whether first line or not we should reset ready for a new caption
            charCount = 0;
            lineText = '';
            lastInTime = null;
          } else {
            // we're not over the minimum length with a suitable splitting point

            // If we add this word are we over the maximum?
            if (charCount + word.text.length > maxLineLength) {
              if (firstLine === true) {
                if (lastOutTime === undefined) {
                  lastOutTime = word.start + word.duration;
                }

                thisCaption = new captionMeta(formatSeconds(lastInTime), formatSeconds(lastOutTime), '');
                thisCaption.text += lineText + '\n';

                // It's just the first line so we should only push a new caption if it's the very last word!

                if (index >= segment.words.length) {
                  captions.push(thisCaption);
                  thisCaption = null;
                } else {
                  firstLine = false;
                }
              } else {
                // We're on the second line and since we're over the maximum with the next word we should push this caption!

                thisCaption.stop = formatSeconds(lastOutTime);
                thisCaption.text += lineText;

                captions.push(thisCaption);

                thisCaption = null;
                firstLine = true;
              }

              // do the stuff we need to do to start a new line
              charCount = word.text.length;
              lineText = word.text;
              lastInTime = word.start; // Why do we do this??????
            } else {
              // We're not over the maximum with this word, update the line length and add the word to the text

              charCount += word.text.length;
              lineText += word.text;
            }
          }

          // for every word update the lastOutTime
          lastOutTime = word.start + word.duration;
        });

        // we're out of words for this segment - decision time!
        if (thisCaption !== null) {
          // The caption had been started, time to add whatever text we have and add a stop point
          thisCaption.stop = formatSeconds(lastOutTime);
          thisCaption.text += lineText;
          //console.log("3. pushing at end of segment when new caption HAS BEEN created");
          //console.log(thisCaption);
          captions.push(thisCaption);
          thisCaption = null;
        } else {
          // caption hadn't been started yet - the loop pushed the last caption and
          // left a fragment behind. Rather than strand a lone word like "cloud." in
          // its own cue, fold it back into the previous caption of this same segment
          // when it is short enough and the merged line stays within tolerance.
          if (lastInTime !== null) {
            const orphanText = lineText.replace(/\s+/g, ' ').trim();
            const orphanWords = orphanText === '' ? 0 : orphanText.split(' ').length;
            const isOrphan = orphanWords > 0 &&
              (orphanWords <= orphanMaxWords || orphanText.length <= orphanMaxChars);
            const prev = captions[captions.length - 1];

            let merged = false;
            if (isOrphan && captions.length > segmentStartCount && prev !== undefined) {
              // append the fragment to the previous caption's last line
              const prevLines = prev.text.replace(/\n+$/, '').split('\n');
              const lastLine = prevLines[prevLines.length - 1].replace(/\s+$/, '');
              const candidate = `${lastLine} ${orphanText}`.trim();
              if (candidate.length <= maxLineLength + orphanLineTolerance) {
                prevLines[prevLines.length - 1] = candidate;
                prev.text = prevLines.join('\n');
                prev.stop = formatSeconds(lastOutTime); // extend timing to cover the folded word
                merged = true;
              }
            }

            if (!merged) {
              thisCaption = new captionMeta(formatSeconds(lastInTime), formatSeconds(lastOutTime), lineText);
              //console.log("4. pushing at end of segment when new caption has yet to be created");
              //console.log(thisCaption);
              captions.push(thisCaption);
              thisCaption = null;
            }
          }
        }
      }
    });

    // Enforce a comfortable minimum on-screen time for each cue. A cue is
    // extended (never shortened) so it lasts at least minCaptionDuration and
    // long enough to read its text at readingSpeedCps, but only as far as the
    // next cue's start (minus minCaptionGap) so cues never overlap. The final
    // cue can extend freely. Cues already long enough are left untouched.
    function applyTimingSafeguards(caps) {
      for (let c = 0; c < caps.length; c++) {
        const start = timecodeToSeconds(caps[c].start);
        const stop = timecodeToSeconds(caps[c].stop);
        if (isNaN(start) || isNaN(stop) || stop <= start) {
          continue; // skip malformed or zero-length cues
        }

        // visible characters, counting a single space per line break
        const chars = caps[c].text.replace(/\s+/g, ' ').trim().length;
        const needed = Math.max(minCaptionDuration, chars / readingSpeedCps);

        if (stop - start >= needed) {
          continue; // already comfortable
        }

        let desiredStop = start + needed;

        if (c + 1 < caps.length) {
          const nextStart = timecodeToSeconds(caps[c + 1].start);
          if (!isNaN(nextStart)) {
            const maxStop = nextStart - minCaptionGap;
            if (desiredStop > maxStop) {
              desiredStop = maxStop;
            }
          }
        }

        if (desiredStop > stop) {
          caps[c].stop = formatSeconds(desiredStop);
        }
      }
    }

    applyTimingSafeguards(captions);

    //console.log("start creating captions");

    captions.forEach((caption, i) => {
      captionsVtt += `\n${caption.start} --> ${caption.stop}\n${caption.text}\n`;
      //console.log(caption.start + ' --> ' + caption.stop + '\n' + caption.text);
      captionsSrt += `\n${i + 1}\n${convertTimecodeToSrt(caption.start)} --> ${convertTimecodeToSrt(caption.stop)}\n${caption.text}\n`;
    });

    const video = document.getElementById(playerId);

    if (video !== null) {
      const applyCaptions = function () {
        const track = document.getElementById(`${playerId}-vtt`);

        if (track !== null) {
          track.kind = 'captions';

          if (label !== undefined) {
            track.label = label;
          }

          if (srclang !== undefined) {
            track.srclang = srclang;
          }

          track.src = `data:text/vtt,${encodeURIComponent(captionsVtt)}`;
          if (video.textTracks[0] !== undefined) {
            video.textTracks[0].mode = 'showing';
          }
        }
      };

      // If the media's metadata has already loaded, 'loadedmetadata' will not
      // fire again, so apply the captions now; otherwise apply on a single-use
      // listener. This prevents a listener persisting with a stale captionsVtt
      // closure and re-applying it when a different media subsequently loads.
      if (video.readyState >= 1 /* HAVE_METADATA */) {
        applyCaptions();
      } else {
        video.addEventListener('loadedmetadata', function listener() {
          applyCaptions();
          video.removeEventListener('loadedmetadata', listener, true);
        }, true);
      }

      if (video.textTracks !== undefined && video.textTracks[0] !== undefined) {
        video.textTracks[0].mode = 'showing';
      }
    }

    function captionsObj(vtt, srt, data) {
      // clean up – remove any double blank lines
      // and blank line at the start of srt

      if (srt.charAt(0) !== '1') {
        srt = srt.slice(1);
      }

      this.vtt = vtt.replaceAll('\n\n\n', '\n\n');
      this.srt = srt.replaceAll('\n\n\n', '\n\n');
      this.data = captions;
    }

    return new captionsObj(captionsVtt, captionsSrt, captions);
  };

  return cap;
};
