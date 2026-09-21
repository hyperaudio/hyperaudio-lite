// Type definitions for hyperaudio-lite/caption
// Project: https://github.com/hyperaudio/hyperaudio-lite

export interface CaptionCue {
  /** "HH:MM:SS.mmm" */
  start: string;
  /** "HH:MM:SS.mmm" */
  stop: string;
  text: string;
  /** The speaker of each line of `text`, '' where the transcript names none. */
  speakers: string[];
}

export interface CaptionsResult {
  /** WebVTT serialisation of the cues */
  vtt: string;
  /** SRT serialisation of the cues */
  srt: string;
  /** The cue objects the serialisations were built from */
  data: CaptionCue[];
}

export interface CaptionOptions {
  /**
   * Dotted abbreviations ("e.g.", "U.S.", "p.m.") end a sentence only when
   * the next word starts with a capital; a lone initial ("J.") never does.
   */
  detectAbbreviations?: boolean;
  /**
   * Words that never end a sentence, e.g. titles such as "Dr." or "Prof.".
   * Case and the trailing full stop are ignored. Language-specific.
   */
  abbreviations?: Iterable<string>;
  /**
   * A short sentence shares the caption before it when the whole sentence
   * fits there. Never across a speaker label or a pause over maxJoinGap.
   */
  joinSentences?: boolean;
  /** Seconds of silence that still allow a join (default 1). */
  maxJoinGap?: number;
  /** A new paragraph always starts a new caption. */
  paragraphBreaks?: boolean;
  /**
   * Two short sentences from different speakers may share a caption: two
   * speakers at most, one per line, each line opening with a hyphen. A
   * caption with one speaker never has a hyphen. `paragraphBreaks` wins.
   */
  dualSpeakers?: boolean;
  /**
   * A short sentence that could not join the caption before it leads the long
   * sentence after it, when both are one speaker's and within maxJoinGap.
   */
  leadSentences?: boolean;
}

export interface CaptionInstance {
  /**
   * Generate captions from a hypertranscript's [data-m] word spans.
   *
   * @param transcriptId id of the transcript element
   * @param playerId     id of a <video> with a `<track id="<playerId>-vtt">`
   *                     to attach the VTT to, or null to only get the result
   * @param maxLength    maximum characters per caption line (default 37)
   * @param minLength    minimum characters before a mid-sentence split (default 21)
   * @param label        value for the text track's label attribute
   * @param srclang      value for the text track's srclang attribute
   * @param parent       optional element whose innerHTML is parsed instead of
   *                     the live document (e.g. a detached editor state)
   * @param options      sentence and paragraph rules; with none given the
   *                     output is unchanged from earlier versions
   */
  init(
    transcriptId: string,
    playerId: string | null,
    maxLength?: number,
    minLength?: number,
    label?: string,
    srclang?: string,
    parent?: HTMLElement | null,
    options?: CaptionOptions
  ): CaptionsResult;
}

export declare function caption(): CaptionInstance;
