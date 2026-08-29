export interface AudioRecordResult {
  blob: Blob;
  url: string;
  duration: number;
  waveform: number[];
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private waveformSamples: number[] = [];
  private sampleInterval: number | null = null;

  async start(): Promise<boolean> {
    try {
      this.audioChunks = [];
      this.waveformSamples = [];
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.startTime = Date.now();

      // Setup audio analyzer for real waveform
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      this.sampleInterval = window.setInterval(() => {
        if (this.analyser) {
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const avg = Math.min(100, Math.max(15, Math.round((sum / bufferLength / 255) * 100)));
          this.waveformSamples.push(avg);
        }
      }, 100);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);
      return true;
    } catch (err) {
      console.warn('Microphone access not granted or unavailable, fallback mode ready.', err);
      // Fallback synthetic recording
      this.startTime = Date.now();
      return false;
    }
  }

  cancel(): void {
    if (this.sampleInterval) {
      clearInterval(this.sampleInterval);
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
    }
    this.audioChunks = [];
    this.waveformSamples = [];
  }

  stop(): Promise<AudioRecordResult> {
    return new Promise((resolve) => {
      const duration = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

      if (this.sampleInterval) {
        clearInterval(this.sampleInterval);
      }

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);

          // normalize waveform to 25-35 bars
          const finalWaveform = this.normalizeWaveform(this.waveformSamples);

          if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
          }
          if (this.audioContext) {
            this.audioContext.close();
          }

          resolve({
            blob: audioBlob,
            url: audioUrl,
            duration,
            waveform: finalWaveform,
          });
        };
        this.mediaRecorder.stop();
      } else {
        // Fallback synthetic voice message
        const syntheticWaveform = Array.from({ length: 28 }, () => Math.floor(Math.random() * 70) + 20);
        resolve({
          blob: new Blob([], { type: 'audio/webm' }),
          url: '',
          duration,
          waveform: syntheticWaveform,
        });
      }
    });
  }

  private normalizeWaveform(samples: number[], targetLength = 30): number[] {
    if (!samples || samples.length === 0) {
      return Array.from({ length: targetLength }, () => Math.floor(Math.random() * 60) + 25);
    }
    if (samples.length <= targetLength) {
      return samples;
    }
    const step = samples.length / targetLength;
    const result: number[] = [];
    for (let i = 0; i < targetLength; i++) {
      const index = Math.floor(i * step);
      result.push(samples[index] || 30);
    }
    return result;
  }
}
