import BasePlayer from './BasePlayer.js';

export default class NativePlayer extends BasePlayer {
  constructor(instance) {
    super(instance);
    this.player = instance.player;
    this.player.addEventListener('pause', instance.pausePlayHead, false);
    this.player.addEventListener('play', instance.preparePlayHead, false);
  }
}