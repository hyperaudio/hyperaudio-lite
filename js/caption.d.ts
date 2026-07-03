// Type definitions for hyperaudio-lite/caption
// Project: https://github.com/hyperaudio/hyperaudio-lite

export interface CaptionCue {
  /** "HH:MM:SS.mmm" */
  start: string;
  /** "HH:MM:SS.mmm" */
  stop: string;
  text: string;
}

export interface CaptionsResult {
  /** WebVTT serialisation of the cues */
  vtt: string;
  /** SRT serialisation of the cues */
  srt: string;
  /** The cue objects the serialisations were built from */
  data: CaptionCue[];
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
   */
  init(
    transcriptId: string,
    playerId: string | null,
    maxLength?: number,
    minLength?: number,
    label?: string,
    srclang?: string,
    parent?: HTMLElement
  ): CaptionsResult;
}

export declare function caption(): CaptionInstance;
