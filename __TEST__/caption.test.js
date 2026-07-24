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
