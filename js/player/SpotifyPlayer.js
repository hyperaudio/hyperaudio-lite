import BasePlayer from './BasePlayer.js';

export default class SpotifyPlayer extends BasePlayer {
  constructor(instance) {
    super(instance);
    this.currentTime = 0;

    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      const element = document.getElementById(instance.player.id);
      const srcValue = element.getAttribute('src');
      const episodeID = this.extractEpisodeID(srcValue);

      const options = { uri: `spotify:episode:${episodeID}` };

      IFrameAPI.createController(element, options, (player) => {
        this.player = player;
        player.addListener('playback_update', this.onPlaybackUpdate.bind(this));
        player.addListener('ready', this.onPlayerReady.bind(this));
      });
    };
  }

  extractEpisodeID(url) {
    const match = url.match(/episode\/(.+)$/);
    return match ? match[1] : null;
  }

  onPlaybackUpdate(e) {
    if (!e.data.isPaused) {
      this.currentTime = e.data.position / 1000;
      this.subSample();
      this.instance.preparePlayHead();
      this.paused = false;
    } else {
      this.instance.pausePlayHead();
      this.paused = true;
    }
  }

  onPlayerReady() {
    this.player.togglePlay();
    this.instance.checkPlayHead();
  }

  subSample() {
    let currentSample = 0;
    let totalSample = 0;
    const sampleInterval = 0.25;
    while (totalSample < 1) {
      currentSample += sampleInterval;
      setTimeout(() => { this.currentTime += sampleInterval; }, currentSample * 1000);
      totalSample = currentSample + sampleInterval;
    }
  }

  getTime() {
    return Promise.resolve(this.currentTime);
  }

  setTime(seconds) {
    this.player.seek(seconds);
  }

  play() {
    this.player.play();
    this.paused = false;
  }

  pause() {
    this.player.togglePlay();
    this.paused = true;
  }
}
