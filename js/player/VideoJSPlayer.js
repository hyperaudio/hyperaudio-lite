import BasePlayer from './BasePlayer.js';

export default class VideoJSPlayer extends BasePlayer {
  constructor(instance) {
    super(instance);
    this.player = videojs.getPlayer(instance.player.id);
    this.player.addEventListener('pause', instance.pausePlayHead, false);
    this.player.addEventListener('play', instance.preparePlayHead, false);
  }

  getTime() {
    return Promise.resolve(this.player.currentTime());
  }

  setTime(seconds) {
    this.player.currentTime(seconds);
  }
}