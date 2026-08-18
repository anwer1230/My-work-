export interface VoiceRecordResult {
  audioUrl: string;
  duration: number;
  waveform: number[];
}

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private waveformSamples: number[] = [];
  private sampleInterval: number | null = null;

  async start(): Promise<boolean> {
    try {
      this.audioChunks = [];
      this.waveformSamples = [];
      this.startTime = Date.now();

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);

      // Audio analysis for real-time waveform
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.sampleInterval = window.setInterval(() => {
          if (this.analyser) {
            this.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = Math.min(100, Math.max(10, Math.round((sum / dataArray.length) * 0.8)));
            this.waveformSamples.push(avg);
          }
        }, 100);
      } catch {
        // Fallback for audio analysis
      }

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);
      return true;
    } catch (err) {
      console.warn('Microphone permission or support issue, fallback to synthetic voice:', err);
      return false;
    }
  }

  async stop(): Promise<VoiceRecordResult> {
    return new Promise((resolve) => {
      const durationSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

      if (this.sampleInterval) {
        clearInterval(this.sampleInterval);
        this.sampleInterval = null;
      }

      if (this.audioContext) {
        this.audioContext.close().catch(() => {});
        this.audioContext = null;
      }

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' });
          const audioUrl = URL.createObjectURL(audioBlob);

          // Stop all audio tracks
          if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
          }

          // Format waveform samples to around 28 bars
          const finalWaveform = this.waveformSamples.length > 0
            ? this.sampleWaveform(this.waveformSamples, 28)
            : this.generateRandomWaveform(28);

          resolve({
            audioUrl,
            duration: durationSeconds,
            waveform: finalWaveform,
          });
        };

        this.mediaRecorder.stop();
      } else {
        // Fallback if no recorder active
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }

        resolve({
          audioUrl: '',
          duration: durationSeconds,
          waveform: this.generateRandomWaveform(28),
        });
      }
    });
  }

  cancel() {
    if (this.sampleInterval) {
      clearInterval(this.sampleInterval);
      this.sampleInterval = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }
  }

  private sampleWaveform(samples: number[], targetCount: number): number[] {
    if (samples.length <= targetCount) return samples;
    const step = samples.length / targetCount;
    const result: number[] = [];
    for (let i = 0; i < targetCount; i++) {
      const idx = Math.floor(i * step);
      result.push(samples[idx] || 30);
    }
    return result;
  }

  private generateRandomWaveform(count: number): number[] {
    return Array.from({ length: count }, () => Math.floor(Math.random() * 70) + 20);
  }
}
