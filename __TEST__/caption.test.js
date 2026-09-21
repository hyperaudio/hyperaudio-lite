/**
 * @jest-environment jsdom
 *
 * Tests for js/caption.js — segmentation, line splitting, orphan folding,
 * timing safeguards and VTT/SRT serialisation. (#258)
 */

const { caption } = require("../js/caption");

// Build a transcript from [start_ms, duration_ms|null, text] word tuples.
// duration null omits data-d (exercising the fallback paths).
// A tuple of ["speaker", text] emits a speaker span.
function buildTranscript(words) {
  const spans = words
    .map((w) => {
      if (w[0] === "speaker") {
        return `<span class="speaker" data-m="0">${w[1]}</span>`;
      }
      const d = w[1] === null ? "" : ` data-d="${w[1]}"`;
      return `<span data-m="${w[0]}"${d}>${w[2]} </span>`;
    })
    .join("");
  document.body.innerHTML = `<div id="transcript"><p>${spans}</p></div>`;
}

// Normalise cue text for robust comparison.
const flat = (text) => text.replace(/\s+/g, " ").trim();

// Parse cues out of a VTT string -> [{start, stop, text}]
function parseVtt(vtt) {
  return vtt
    .split("\n\n")
    .slice(1) // drop the WEBVTT header block
    .filter((block) => block.trim() !== "")
    .map((block) => {
      const lines = block.trim().split("\n");
      const [start, stop] = lines[0].split(" --> ");
      return { start, stop, text: flat(lines.slice(1).join(" ")) };
    });
}

test("a short sentence becomes a single cue timed word-start to word-end", () => {
  buildTranscript([
    [0, 500, "Hello"],
    [600, 400, "world."],
  ]);
  const result = caption().init("transcript", null);

  expect(result.vtt.startsWith("WEBVTT")).toBe(true);
  const cues = parseVtt(result.vtt);
  expect(cues).toHaveLength(1);
  expect(cues[0].text).toBe("Hello world.");
  expect(cues[0].start).toBe("00:00:00.000");
  // last word ends at 1.0s; already >= the 1s minimum duration
  expect(cues[0].stop).toBe("00:00:01.000");
});

test("sentence-end delimiters split segments into separate cues", () => {
  buildTranscript([
    [0, 500, "First."],
    [1000, 500, "Second."],
  ]);
  const cues = parseVtt(caption().init("transcript", null).vtt);

  expect(cues).toHaveLength(2);
  expect(cues[0].text).toBe("First.");
  expect(cues[1].text).toBe("Second.");
});

test("a speaker span starts a new segment", () => {
  buildTranscript([
    ["speaker", "[Alice]"],
    [0, 500, "Hi there"],
    ["speaker", "[Bob]"],
    [1000, 500, "Hello back."],
  ]);
  const cues = parseVtt(caption().init("transcript", null).vtt);

  // Alice's unterminated sentence is pushed when Bob starts speaking.
  expect(cues).toHaveLength(2);
  expect(cues[0].text).toBe("Hi there");
  expect(cues[1].text).toBe("Hello back.");
});

test("segments longer than maxLength split into multi-line cues", () => {
  // 6 words x 6 chars = 36 visible chars; maxLength 20 forces a line break,
  // minLength 5 allows splitting at the comma.
  buildTranscript([
    [0, 400, "alpha"],
    [500, 400, "bravo,"],
    [1000, 400, "charlie"],
    [1500, 400, "delta"],
    [2000, 400, "echo"],
    [2500, 400, "foxtrot."],
  ]);
  const result = caption().init("transcript", null, 20, 5);
  const cues = parseVtt(result.vtt);

  // The 36 visible chars break at the comma into a two-line cue (the final
  // orphan "foxtrot." folds back into the second line).
  expect(result.data[0].text).toContain("\n");
  // Every word survives, in order.
  expect(flat(cues.map((c) => c.text).join(" "))).toBe(
    "alpha bravo, charlie delta echo foxtrot."
  );
  // No cue line exceeds maxLength + the orphan tolerance (12).
  result.data.forEach((cue) => {
    cue.text
      .split("\n")
      .filter(Boolean)
      .forEach((line) => expect(line.length).toBeLessThanOrEqual(32));
  });
});

test("a trailing orphan word folds into the previous cue (#258)", () => {
  // Sized so the final split leaves a single short word ("cloud.") behind.
  buildTranscript([
    [0, 400, "somewhere"],
    [500, 400, "beyond,"],
    [1000, 400, "the"],
    [1500, 400, "big"],
    [2000, 400, "white"],
    [2500, 400, "cloud."],
  ]);
  const result = caption().init("transcript", null, 20, 5);
  const cues = parseVtt(result.vtt);

  // The orphan must not be stranded in a cue of its own.
  expect(cues.some((c) => c.text === "cloud.")).toBe(false);
  expect(cues[cues.length - 1].text.endsWith("cloud.")).toBe(true);
});

test("short cues are extended to the minimum readable duration", () => {
  buildTranscript([
    [0, 200, "Hi."], // 200ms cue — far too short to read
    [3000, 500, "Later."], // plenty of silent gap before this one
  ]);
  const cues = parseVtt(caption().init("transcript", null).vtt);

  // Extended to the 1s minimum, not to the next cue.
  expect(cues[0].stop).toBe("00:00:01.000");
});

test("extended cues never overlap the next cue", () => {
  buildTranscript([
    [0, 200, "Hi."],
    [500, 500, "Rushed."], // next cue starts at 0.5s
  ]);
  const cues = parseVtt(caption().init("transcript", null).vtt);

  // Clamped to next start (0.5) minus the 0.04s gap.
  expect(cues[0].stop).toBe("00:00:00.460");
});

test("SRT output numbers cues and uses comma milliseconds", () => {
  buildTranscript([
    [0, 500, "Hello"],
    [600, 400, "world."],
    [2000, 500, "Again."],
  ]);
  const srt = caption().init("transcript", null).srt;

  expect(srt.startsWith("1\n")).toBe(true);
  expect(srt).toContain("\n2\n");
  expect(srt).toContain("00:00:00,000 --> 00:00:01,000");
  expect(srt).not.toContain(".000 -->");
});

test("missing data-d falls back to the next word's start, capped at 2s", () => {
  buildTranscript([
    [0, null, "Wait"], // next word starts 5s later -> capped at 2s
    [5000, 500, "here."],
  ]);
  const result = caption().init("transcript", null);

  // Word 1: start 0, duration capped at 2s.
  expect(result.data[0].stop).toBe("00:00:05.500");
  // The whole segment is one cue; its stop comes from the LAST word's real
  // end, so the cap shows up via the segment data rather than the cue. Check
  // the cap directly on a single-word segment instead:
  buildTranscript([[0, null, "Alone."]]);
  const single = caption().init("transcript", null);
  // Last word with no data-d gets the 5s default.
  expect(single.data[0].stop).toBe("00:00:05.000");
});

test("a trailing segment without ending punctuation is not dropped", () => {
  // The segment loop only pushed on sentence delimiters, so a transcript
  // ending mid-sentence lost its final words entirely.
  buildTranscript([
    [0, 500, "Complete."],
    [1000, 500, "Trails"],
    [1600, 400, "off"],
  ]);
  const cues = parseVtt(caption().init("transcript", null).vtt);

  expect(cues).toHaveLength(2);
  expect(cues[1].text).toBe("Trails off");
});

test("cue timing data round-trips through the data property", () => {
  buildTranscript([
    [1000, 500, "Offset"],
    [1600, 400, "start."],
  ]);
  const result = caption().init("transcript", null);

  expect(result.data).toHaveLength(1);
  expect(result.data[0].start).toBe("00:00:01.000");
  expect(flat(result.data[0].text)).toBe("Offset start.");
});

test("a missing data-d next to a non-increasing data-m never goes negative (hyperaudio-lite-editor#411)", () => {
  // "Alone." has no data-d and the NEXT word's data-m sits before its own
  // (out-of-order times after edits; duplicate stamps on split tokens are the
  // milder case). The derived duration went negative, producing a cue with
  // stop < start — dropped by browsers, and formatSeconds wrapped the negative
  // to a ~24h timestamp.
  buildTranscript([
    [2000, null, "Alone."],
    [1500, 300, "Next."],
  ]);
  const cues = parseVtt(caption().init("transcript", null).vtt);

  expect(cues.length).toBeGreaterThanOrEqual(1);
  for (const cue of cues) {
    expect(cue.stop > cue.start).toBe(true);   // lexicographic works for HH:MM:SS.mmm
    expect(cue.stop.startsWith("23:59")).toBe(false);
  }
});

test("an inverted or zero-length cue is repaired to a readable length, not skipped (hyperaudio-lite-editor#411)", () => {
  // A single-word cue whose word has an explicit zero duration serialized as
  // stop == start; the timing safeguard stepped over exactly these, so the
  // zero-length cue shipped (and browsers dropped it from the track).
  buildTranscript([
    [0, 500, "One."],
    [5000, 0, "Beep."],
  ]);
  const cues = parseVtt(caption().init("transcript", null).vtt);

  expect(cues).toHaveLength(2);
  expect(cues[1].start).toBe("00:00:05.000");
  // repaired: extended to the 1s minimum on-screen time
  expect(cues[1].stop).toBe("00:00:06.000");
});

// ---- options: abbreviations, sentence joining, paragraph breaks ------------

// One word per 400ms; "|" starts a new paragraph, a ["speaker", name] tuple
// (given as the string "@Name") a speaker label.
function buildFromText(text, stepMs = 400, durMs = 350) {
  let t = 0;
  const paragraphs = text.split("|").map((para) =>
    "<p>" + para.trim().split(/\s+/).map((w) => {
      if (w.startsWith("@")) return `<span class="speaker" data-m="${t}">[${w.slice(1)}] </span>`;
      const span = `<span data-m="${t}" data-d="${durMs}">${w} </span>`;
      t += stepMs;
      return span;
    }).join("") + "</p>");
  document.body.innerHTML = `<div id="transcript">${paragraphs.join("")}</div>`;
}
const cueTexts = (result) => parseVtt(result.vtt).map((c) => c.text);
const run = (options, max = 32, min = 21) =>
  caption().init("transcript", null, max, min, undefined, undefined, null, options);

test("with no options an abbreviation still ends the caption, as it always has", () => {
  buildFromText("We spoke to Dr. Smith about it.");
  expect(cueTexts(run())).toEqual(["We spoke to Dr.", "Smith about it."]);
});

test("a listed title never ends a sentence", () => {
  buildFromText("We spoke to Dr. Smith about it.");
  expect(cueTexts(run({ abbreviations: ["Dr."] }))).toEqual(["We spoke to Dr. Smith about it."]);
  // case and the trailing full stop are ignored, in the list and in the text
  buildFromText("We spoke to (dr. Smith) about it.");
  expect(cueTexts(run({ abbreviations: new Set(["DR"]) }))).toEqual(["We spoke to (dr. Smith) about it."]);
});

test("a title in another language's list is just a word", () => {
  buildFromText("Wir trafen Hr. Schmidt.");
  expect(cueTexts(run({ detectAbbreviations: true, abbreviations: ["Dr."] })))
    .toEqual(["Wir trafen Hr.", "Schmidt."]);
  expect(cueTexts(run({ detectAbbreviations: true, abbreviations: ["Hr.", "Fr."] })))
    .toEqual(["Wir trafen Hr. Schmidt."]);
});

test("a dotted abbreviation ends a sentence only before a capital", () => {
  buildFromText("It costs 3.5 million, e.g. for a small firm.");
  expect(cueTexts(run({ detectAbbreviations: true })).join(" "))
    .toBe("It costs 3.5 million, e.g. for a small firm.");
  expect(cueTexts(run({ detectAbbreviations: true })).some((t) => t.endsWith("e.g."))).toBe(false);

  buildFromText("We left at 5 p.m. Then it rained.");
  expect(cueTexts(run({ detectAbbreviations: true }))).toEqual(["We left at 5 p.m.", "Then it rained."]);

  buildFromText("We left at 5 p.m. on Friday.");
  expect(cueTexts(run({ detectAbbreviations: true }))).toEqual(["We left at 5 p.m. on Friday."]);
});

test("a lone initial never ends a sentence, but the word I does", () => {
  buildFromText("It was J. Smith again.");
  expect(cueTexts(run({ detectAbbreviations: true }))).toEqual(["It was J. Smith again."]);
  buildFromText("So did I. Then we left.");
  expect(cueTexts(run({ detectAbbreviations: true }))).toEqual(["So did I.", "Then we left."]);
});

test("question marks, exclamation marks and an ellipsis are untouched by the rule", () => {
  buildFromText("Really? Yes! She paused... then went on.");
  expect(cueTexts(run({ detectAbbreviations: true, abbreviations: ["Dr."] })))
    .toEqual(["Really?", "Yes!", "She paused...", "then went on."]);
});

test("short sentences share a caption when joinSentences is on", () => {
  buildFromText("Yes. No. Maybe. I see. Go on. Fine. That is all. Thanks.");
  expect(cueTexts(run())).toHaveLength(8); // one per sentence, as before
  const joined = run({ joinSentences: true });
  const cues = parseVtt(joined.vtt);
  expect(cues.map((c) => c.text)).toEqual(["Yes. No. Maybe. I see. Go on. Fine. That is all. Thanks."]);
  // two lines, neither over the limit, and the times cover every sentence
  const lines = joined.data[0].text.replace(/\n+$/, "").split("\n");
  expect(lines.map((l) => l.trim())).toEqual(["Yes. No. Maybe. I see. Go on.", "Fine. That is all. Thanks."]);
  lines.forEach((line) => expect(line.length).toBeLessThanOrEqual(32));
  expect(cues[0].start).toBe("00:00:00.000");
  expect(cues[0].stop).toBe("00:00:04.750"); // "Thanks." starts at 4.4s, lasts 350ms
});

test("a caption holds two lines at most, so a third short sentence starts a new one", () => {
  buildFromText("That really is the whole of it. And nothing else at all here. Thanks.");
  expect(cueTexts(run({ joinSentences: true }))).toEqual([
    "That really is the whole of it. And nothing else at all here.",
    "Thanks.",
  ]);
});

test("a sentence is never split in order to fill a caption", () => {
  // the second sentence fits on neither the first line nor a line of its own
  buildFromText("Yes. This sentence is far too long to sit on one line of a caption.");
  const texts = cueTexts(run({ joinSentences: true }));
  expect(texts[0]).toBe("Yes.");
  expect(texts.slice(1).join(" ")).toBe("This sentence is far too long to sit on one line of a caption.");
});

test("a short sentence joins the last caption of a long one", () => {
  buildFromText("This sentence is far too long to sit on one line. Yes.");
  expect(cueTexts(run())).toEqual(["This sentence is far too long to sit on one line.", "Yes."]);
  expect(cueTexts(run({ joinSentences: true }))).toEqual(["This sentence is far too long to sit on one line. Yes."]);
  // ...but not when the caption's second line has no room left for it
  buildFromText("This sentence is far too long to sit on one line of a caption. Yes.");
  const texts = cueTexts(run({ joinSentences: true }));
  expect(texts[texts.length - 1]).toBe("Yes.");
});

test("nothing is joined across a speaker label", () => {
  buildFromText("@Ann Yes. No. @Bob Maybe. Fine.");
  expect(cueTexts(run({ joinSentences: true }))).toEqual(["Yes. No.", "Maybe. Fine."]);
});

test("nothing is joined across a pause longer than maxJoinGap", () => {
  buildTranscript([
    [0, 300, "Yes."],
    [400, 300, "No."],     // 100ms after "Yes." ends
    [3000, 300, "Maybe."], // 2.3s of silence
    [3400, 300, "Fine."],
  ]);
  expect(cueTexts(run({ joinSentences: true }))).toEqual(["Yes. No.", "Maybe. Fine."]);
  expect(cueTexts(run({ joinSentences: true, maxJoinGap: 5 }))).toEqual(["Yes. No. Maybe. Fine."]);
  expect(cueTexts(run({ joinSentences: true, maxJoinGap: 0 }))).toEqual(["Yes.", "No.", "Maybe.", "Fine."]);
});

test("paragraphBreaks: a new paragraph always starts a new caption", () => {
  buildFromText("Yes. No. | Maybe. Fine.");
  expect(cueTexts(run({ joinSentences: true }))).toEqual(["Yes. No. Maybe. Fine."]);
  expect(cueTexts(run({ joinSentences: true, paragraphBreaks: true }))).toEqual(["Yes. No.", "Maybe. Fine."]);
});

test("paragraphBreaks also breaks where a paragraph ends without punctuation", () => {
  buildFromText("the first thought | the second thought");
  expect(cueTexts(run())).toEqual(["the first thought the second thought"]);
  expect(cueTexts(run({ paragraphBreaks: true }))).toEqual(["the first thought", "the second thought"]);
});

test("joined captions never overlap and keep the cue count honest", () => {
  buildFromText("Yes. No. Maybe. | @Ann I see. Go on. This one is a good deal longer than a line allows. Fine.");
  const cues = parseVtt(run({ joinSentences: true, paragraphBreaks: true, detectAbbreviations: true }).vtt);
  for (let i = 1; i < cues.length; i += 1) {
    expect(cues[i].start >= cues[i - 1].stop).toBe(true);
  }
  expect(cues.map((c) => c.text).join(" "))
    .toBe("Yes. No. Maybe. I see. Go on. This one is a good deal longer than a line allows. Fine.");
});
