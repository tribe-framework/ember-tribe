import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { Howl } from 'howler';

export default class AudioPlayerService extends Service {
  sound = null;
  src = null;
  rafId = null;

  @tracked currentTime = 0;
  @tracked duration = 0;
  @tracked isPlaying = false;

  load(src) {
    if (this.src === src) return;
    this.unload();
    this.src = src;
    this.sound = new Howl({
      src: [src],
      html5: true,
      onload: () => {
        this.duration = this.sound.duration();
      },
      onplay: () => {
        this.isPlaying = true;
        this.tick();
      },
      onpause: () => {
        this.isPlaying = false;
      },
      onstop: () => {
        this.isPlaying = false;
        this.currentTime = 0;
      },
      onend: () => {
        this.isPlaying = false;
        this.currentTime = 0;
      },
      onseek: () => {
        this.currentTime = this.sound.seek() || 0;
      },
    });
  }

  tick = () => {
    if (!this.sound) return;
    this.currentTime = this.sound.seek() || 0;
    if (this.sound.playing()) this.rafId = requestAnimationFrame(this.tick);
  };

  between = (start, end) => this.currentTime >= start && this.currentTime < end;

  @action
  toggle() {
    if (!this.sound) return;
    if (this.sound.playing()) {
      this.sound.pause();
    } else {
      this.sound.play();
    }
  }

  @action
  seek(seconds) {
    this.sound?.seek(seconds);
  }

  unload() {
    cancelAnimationFrame(this.rafId);
    this.sound?.unload();
    this.sound = null;
    this.src = null;
    this.currentTime = 0;
    this.duration = 0;
    this.isPlaying = false;
  }

  willDestroy() {
    this.unload();
    super.willDestroy(...arguments);
  }
}
