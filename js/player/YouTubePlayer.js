import BasePlayer from './BasePlayer.js';

export default class YouTubePlayer extends BasePlayer {
  constructor(instance) {
    super(instance);
    const tag = document.createElement('script');
    tag.id = 'iframe-demo';
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      this.player = new YT.Player(instance.player.id, {
        events: { onStateChange: this.onPlayerStateChange.bind(this) },
      });
    };
  }

  onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      this.instance.preparePlayHead();
      this.paused = false;
    } else if (event.data === YT.PlayerState.PAUSED) {
      this.instance.pausePlayHead();
      this.paused = true;
    }
  }

  getTime() {
    return Promise.resolve(this.player.getCurrentTime());
  }

  setTime(seconds) {
    this.player.seekTo(seconds, true);
  }

  play() {
    this.player.playVideo();
    this.paused = false;
  }

  pause() {
    this.player.pauseVideo();
    this.paused = true;
  }
}
