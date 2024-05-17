import BasePlayer from './BasePlayer.js';

export default class VimeoPlayer extends BasePlayer {
  constructor(instance) {
    super(instance);
    const iframe = document.querySelector('iframe');
    this.player = new Vimeo.Player(iframe);
    this.player.ready().then(instance.checkPlayHead);
    this.player.on('play', instance.preparePlayHead);
    this.player.on('pause', instance.pausePlayHead);
  }

  getTime() {
    return this.player.getCurrentTime();
  }
}