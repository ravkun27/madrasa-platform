import videojs, { VideoJsPlayer } from "video.js";

declare global {
  interface Window {
    videojs: typeof videojs;
  }
}
