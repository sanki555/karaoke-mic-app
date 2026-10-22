import {
  AnalyserNode,
  AudioContext,
  AudioManager,
  AudioRecorder,
  BiquadFilterNode,
  ConvolverNode,
  DelayNode,
  GainNode,
  OscillatorNode,
  RecorderAdapterNode,
} from 'react-native-audio-api';

export interface FxParams {
  volume: number; // 0..1
  muted: boolean;
  reverbMix: number; // 0..1
  reverbSize: number; // seconds of tail
  reverbDamping: number; // 0..1, high-frequency absorption
  flangerOn: boolean;
  flangerIntensity: number; // 0..1, scales depth + mix
  flangerRate: number; // Hz
  flangerFeedback: number; // 0..0.9
}

export const DEFAULT_PARAMS: FxParams = {
  volume: 0.8,
  muted: false,
  reverbMix: 0.4,
  reverbSize: 1.8,
  reverbDamping: 0.4,
  flangerOn: false,
  flangerIntensity: 0.5,
  flangerRate: 0.4,
  flangerFeedback: 0.5,
};

const FLANGER_BASE_DELAY = 0.003; // seconds
const FLANGER_MAX_DEPTH = 0.0025;

/**
 * Live mic -> [dry | flanger | reverb] -> master -> output.
 * Output follows the OS route, so a paired Bluetooth speaker is used automatically.
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private recorder: AudioRecorder | null = null;
  private analyser: AnalyserNode | null = null;
  private nodes: {
    input: GainNode;
    master: GainNode;
    dry: GainNode;
    flangerDelay: DelayNode;
    flangerFeedback: GainNode;
    flangerDepth: GainNode;
    flangerWet: GainNode;
    lfo: OscillatorNode;
    convolver: ConvolverNode;
    reverbDamp: BiquadFilterNode;
    reverbWet: GainNode;
  } | null = null;
  private params: FxParams = { ...DEFAULT_PARAMS };
  private irKey = '';
  private buf = new Float32Array(256);

  get running() {
    return this.ctx !== null;
  }

  async start(initial: FxParams): Promise<void> {
    if (this.ctx) return;
    this.params = { ...initial };

    let perm = await AudioManager.checkRecordingPermissions();
    if (perm !== 'Granted') perm = await AudioManager.requestRecordingPermissions();
    if (perm !== 'Granted') throw new Error('Microphone permission denied');

    // playAndRecord + A2DP keeps stereo Bluetooth output while the phone mic is the input.
    AudioManager.setAudioSessionOptions({
      iosCategory: 'playAndRecord',
      iosMode: 'default',
      iosOptions: ['allowBluetoothA2DP', 'allowAirPlay', 'mixWithOthers'],
    });
    await AudioManager.setAudioSessionActivity(true);

    const ctx = new AudioContext({ sampleRate: AudioManager.getDevicePreferredSampleRate() });
    const recorder = new AudioRecorder();
    const adapter: RecorderAdapterNode = ctx.createRecorderAdapter();

    const input = ctx.createGain();
    const master = ctx.createGain();
    const dry = ctx.createGain();

    const flangerDelay = ctx.createDelay(0.02);
    flangerDelay.delayTime.value = FLANGER_BASE_DELAY;
    const flangerFeedback = ctx.createGain();
    const flangerDepth = ctx.createGain();
    const flangerWet = ctx.createGain();
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';

    const convolver = ctx.createConvolver();
    const reverbDamp = ctx.createBiquadFilter();
    reverbDamp.type = 'lowpass';
    const reverbWet = ctx.createGain();

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;

    recorder.connect(adapter);
    adapter.connect(input);
    input.connect(analyser);
    input.connect(dry);
    dry.connect(master);

    input.connect(flangerDelay);
    flangerDelay.connect(flangerFeedback);
    flangerFeedback.connect(flangerDelay);
    flangerDelay.connect(flangerWet);
    flangerWet.connect(master);
    lfo.connect(flangerDepth);
    flangerDepth.connect(flangerDelay.delayTime);

    input.connect(convolver);
    convolver.connect(reverbDamp);
    reverbDamp.connect(reverbWet);
    reverbWet.connect(master);

    master.connect(ctx.destination);
    lfo.start();

    this.ctx = ctx;
    this.recorder = recorder;
    this.analyser = analyser;
    this.nodes = {
      input, master, dry, flangerDelay, flangerFeedback, flangerDepth, flangerWet,
      lfo, convolver, reverbDamp, reverbWet,
    };
    this.apply(this.params, true);

    const res = await recorder.start();
    if (res.status === 'error') {
      await this.stop();
      throw new Error(res.message ?? 'Could not start the microphone');
    }
  }

  async stop(): Promise<void> {
    try {
      await this.recorder?.stop();
      this.recorder?.disconnect();
      this.nodes?.lfo.stop();
      await this.ctx?.close();
      await AudioManager.setAudioSessionActivity(false);
    } catch {
      // already torn down
    }
    this.ctx = null;
    this.recorder = null;
    this.analyser = null;
    this.nodes = null;
    this.irKey = '';
  }

  update(patch: Partial<FxParams>) {
    this.params = { ...this.params, ...patch };
    this.apply(this.params, false);
  }

  /** Input level 0..1 (peak of the latest block). */
  level(): number {
    if (!this.analyser) return 0;
    this.analyser.getFloatTimeDomainData(this.buf);
    let peak = 0;
    for (let i = 0; i < this.buf.length; i++) peak = Math.max(peak, Math.abs(this.buf[i]));
    return Math.min(1, peak);
  }

  get sampleRate() {
    return this.ctx?.sampleRate ?? 0;
  }

  private apply(p: FxParams, force: boolean) {
    const n = this.nodes;
    const ctx = this.ctx;
    if (!n || !ctx) return;
    const t = ctx.currentTime;
    const smooth = (param: { setTargetAtTime(v: number, t: number, tc: number): unknown }, v: number) =>
      param.setTargetAtTime(v, t, 0.02);

    smooth(n.input.gain, p.muted ? 0 : p.volume);
    smooth(n.dry.gain, 1);
    smooth(n.reverbWet.gain, p.reverbMix * 1.4);
    n.reverbDamp.frequency.value = 18000 - p.reverbDamping * 15000;

    const fOn = p.flangerOn ? 1 : 0;
    smooth(n.flangerWet.gain, fOn * p.flangerIntensity * 0.9);
    smooth(n.flangerDepth.gain, FLANGER_MAX_DEPTH * (0.3 + 0.7 * p.flangerIntensity));
    smooth(n.flangerFeedback.gain, p.flangerFeedback);
    n.lfo.frequency.value = p.flangerRate;

    const key = p.reverbSize.toFixed(1);
    if (force || key !== this.irKey) {
      this.irKey = key;
      n.convolver.buffer = this.makeImpulse(ctx, p.reverbSize);
    }
  }

  /** Synthetic room: decaying stereo noise. */
  private makeImpulse(ctx: AudioContext, seconds: number) {
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const buffer = ctx.createBuffer(2, length, rate);
    for (let c = 0; c < 2; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    return buffer;
  }
}

export const engine = new AudioEngine();
