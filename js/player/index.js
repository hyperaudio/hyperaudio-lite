import NativePlayer from './NativePlayer.js';
import SoundCloudPlayer from './SoundCloudPlayer.js';
import YouTubePlayer from './YouTubePlayer.js';
import VideoJSPlayer from './VideoJSPlayer.js';
import VimeoPlayer from './VimeoPlayer.js';
import SpotifyPlayer from './SpotifyPlayer.js';

const hyperaudioPlayerOptions = {
  native: NativePlayer,
  soundcloud: SoundCloudPlayer,
  youtube: YouTubePlayer,
  videojs: VideoJSPlayer,
  vimeo: VimeoPlayer,
  spotify: SpotifyPlayer,
};

export function createPlayer(playerType, instance) {
  const PlayerClass = hyperaudioPlayerOptions[playerType];
  if (PlayerClass) {
    return new PlayerClass(instance);
  } else {
    console.warn(
      'HYPERAUDIO LITE WARNING: data-player-type attribute should be set on player if not native, eg SoundCloud, YouTube, Vimeo, VideoJS'
    );
  }
}
