class Pcm16Processor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.targetRate = 16000;
    this.chunkSamples = 640;
  }

  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel) return true;

    const ratio = sampleRate / this.targetRate;
    for (let i = 0; i < channel.length; i += 1) {
      const sample = Math.max(-1, Math.min(1, channel[i]));
      this.buffer.push(sample);
    }

    while (this.buffer.length >= this.chunkSamples * ratio) {
      const output = new Int16Array(this.chunkSamples);
      for (let i = 0; i < this.chunkSamples; i += 1) {
        const sourceIndex = Math.floor(i * ratio);
        const sample = this.buffer[sourceIndex] ?? 0;
        output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      }
      this.buffer.splice(0, Math.floor(this.chunkSamples * ratio));
      this.port.postMessage(output.buffer, [output.buffer]);
    }

    return true;
  }
}

registerProcessor("famile-pcm16-processor", Pcm16Processor);
