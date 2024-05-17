import BasePlayer from './BasePlayer.js';

export default class SoundCloudPlayer extends BasePlayer {
  constructor(instance) {
    super(instance);
    this.player = SC.Widget(instance.player.id);
    this.player.bind(SC.Widget.Events.PAUSE, instance.pausePlayHead);
    this.player.bind(SC.Widget.Events.PLAY, instance.preparePlayHead);
  }

  getTime() {
    return new Promise((resolve) => {
      this.player.getPosition((ms) => resolve(ms / 1000));
    });
  }

  setTime(seconds) {
    this.player.seekTo(seconds * 1000);
  }
}