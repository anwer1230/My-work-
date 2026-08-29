/**
 * MediaController.ts - org.telegram.messenger.MediaController
 * Replicated directly from MediaController.java in DrKLO/Telegram Android
 * Handles Voice message playback, Audio player state, Web Audio waveform rendering, and speed modulation.
 */

export interface AudioPlaybackState {
  currentMsgId: string | null;
  isPlaying: boolean;
  duration: number;
  currentProgress: number; // 0.0 to 1.0
  playbackSpeed: number; // 0.5, 1.0, 1.5, 2.0
}

export class MediaController {
  private static instance: MediaController;
  private currentAudio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private state: AudioPlaybackState = {
    currentMsgId: null,
    isPlaying: false,
    duration: 0,
    currentProgress: 0,
    playbackSpeed: 1.0,
  };
  private listeners = new Set<(state: AudioPlaybackState) => void>();

  public static getInstance(): MediaController {
    if (!MediaController.instance) {
      MediaController.instance = new MediaController();
    }
    return MediaController.instance;
  }

  private constructor() {}

  public subscribe(listener: (state: AudioPlaybackState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  public playAudio(msgId: string, url: string): void {
    if (this.state.currentMsgId === msgId && this.currentAudio) {
      if (this.state.isPlaying) {
        this.currentAudio.pause();
        this.state.isPlaying = false;
      } else {
        this.currentAudio.play().catch(console.warn);
        this.state.isPlaying = true;
      }
      this.notify();
      return;
    }

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    const audio = new Audio(url);
    audio.playbackRate = this.state.playbackSpeed;
    this.currentAudio = audio;
    this.state.currentMsgId = msgId;
    this.state.isPlaying = true;
    this.state.currentProgress = 0;
    this.notify();

    audio.ontimeupdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        this.state.duration = audio.duration;
        this.state.currentProgress = audio.currentTime / audio.duration;
        this.notify();
      }
    };

    audio.onended = () => {
      this.state.isPlaying = false;
      this.state.currentProgress = 0;
      this.state.currentMsgId = null;
      this.notify();
    };

    audio.play().catch((err) => {
      console.warn('[MediaController] Playback prevented:', err);
      this.state.isPlaying = false;
      this.notify();
    });
  }

  public stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.state.isPlaying = false;
    this.state.currentMsgId = null;
    this.notify();
  }

  public setPlaybackSpeed(speed: number): void {
    this.state.playbackSpeed = speed;
    if (this.currentAudio) {
      this.currentAudio.playbackRate = speed;
    }
    this.notify();
  }

  public seekTo(progress: number): void {
    if (this.currentAudio && this.currentAudio.duration) {
      this.currentAudio.currentTime = progress * this.currentAudio.duration;
      this.state.currentProgress = progress;
      this.notify();
    }
  }

  public getState(): AudioPlaybackState {
    return { ...this.state };
  }
}

export const mediaController = MediaController.getInstance();
