'use strict';

export default class BasePlayer {
  constructor(instance) {
    this.instance = instance;
    this.paused = true;
  }

  getTime() {
    return Promise.resolve(this.player.currentTime || 0);
  }

  setTime(seconds) {
    if (this.player.setCurrentTime) {
      this.player.setCurrentTime(seconds);
    } else {
      this.player.currentTime = seconds;
    }
  }

  play() {
    this.player.play();
    this.paused = false;
  }

  pause() {
    this.player.pause();
    this.paused = true;
  }
}