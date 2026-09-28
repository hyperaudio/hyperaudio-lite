// Type definitions for hyperaudio-lite
// Project: https://github.com/hyperaudio/hyperaudio-lite

export interface HyperaudioLiteOptions {
  /** id of the transcript element containing [data-m] word spans */
  transcript: string;
  /** id of the media element (or embed iframe/container) */
  player: string;
  /** mirror the active word into document.title (default false) */
  minimizedMode?: boolean;
  /** scroll the transcript to follow playback (default true) */
  autoScroll?: boolean;
  /** require double-click instead of click to set the playhead (default false) */
  doubleClick?: boolean;
  /** insert Web Monetization payment pointers from data-wm (default false) */
  webMonetization?: boolean;
  /** start playback when a word is clicked (default true) */
  playOnClick?: boolean;
  /** pixels to offset the autoscroll target by, e.g. a sticky header (default 0) */
  scrollOffset?: number;
  /**
   * The element that scrolls to follow playback — an element or an element
   * id. Defaults to the transcript element; pass document.scrollingElement
   * for layouts where the page itself scrolls.
   */
  scrollContainer?: string | HTMLElement | null;
}

export declare class BasePlayer {
  constructor(instance: HyperaudioLite);
  player: unknown;
  paused: boolean;
  initPlayer(instance: HyperaudioLite): unknown;
  attachEventListeners(instance: HyperaudioLite): void;
  getTime(): Promise<number>;
  setTime(seconds: number): void;
  play(): void;
  pause(): void;
}

export declare class HyperaudioLite {
  constructor(options: HyperaudioLiteOptions);
  /** @deprecated Use the options-object constructor instead. */
  constructor(
    transcriptId: string,
    mediaElementId: string,
    minimizedMode?: boolean,
    autoScroll?: boolean,
    doubleClick?: boolean,
    webMonetization?: boolean,
    playOnClick?: boolean
  );

  /**
   * Register a custom player class for a data-player-type value. The class
   * should extend BasePlayer, or at minimum accept the HyperaudioLite
   * instance in its constructor and implement getTime/setTime/play/pause.
   */
  static registerPlayer(
    type: string,
    playerClass: new (instance: HyperaudioLite) => unknown
  ): void;

  transcript: HTMLElement;
  player: HTMLElement;
  myPlayer: BasePlayer;
  autoscroll: boolean;
  playOnClick: boolean;
  scrollOffset: number;
  scrollContainer: HTMLElement;

  /** Temporarily disable autoscroll (e.g. while the user edits the transcript). */
  pauseAutoscroll(): void;
  /** Re-enable autoscroll after pauseAutoscroll(). */
  resumeAutoscroll(): void;
  /** Rebuild cached word and parent references after transcript DOM edits. */
  refreshWords(): Array<{ n: HTMLElement; m: number; p: Node }>;
  /** Remove all listeners added by this instance and stop the polling loop. */
  destroy(): void;
}

export declare const hyperaudioPlayerOptions: Record<
  string,
  new (instance: HyperaudioLite) => BasePlayer
>;
