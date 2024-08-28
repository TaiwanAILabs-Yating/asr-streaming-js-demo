// @ts-check
import type { Device } from "./type";

const endpoints = {
  ws: "wss://asr.api.yating.tw/ws/v1",
  /** Token exchange endpoint */
  token: "https://asr.api.yating.tw/v1/token",
};

/**
 * Get ASR Pipeline auth token with given pipeline language
 * @param apiKey The key provided in dev-console, should be kept secretly without exposing to public
 * @param pipeline https://developer.yating.tw/zh-TW/doc/asr-ASR%20%E5%8D%B3%E6%99%82%E8%AA%9E%E9%9F%B3%E8%BD%89%E6%96%87%E5%AD%97#%E5%8F%96%E5%BE%97%E4%B8%80%E6%AC%A1%E6%80%A7%E5%AF%86%E7%A2%BC
 * @returns Auth token, attach this key to ws endpoint to connect to websocket
 */
export async function getAuthToken(apiKey: string, pipeline = "asr-zh-en-std") {
  const res = await fetch(endpoints.token, {
    method: "POST",
    headers: {
      key: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pipeline,
    }),
  });

  if (!res.ok) {
    throw "Get auth token fail, please provide the correct api key";
  }

  const authToken = (await res.json())?.["auth_token"];
  return authToken as string;
}

export type SentencesContent = {
  finals: string[];
  currentSentence: string;
};

export type ASRCoreState = {
  connected: boolean;
};

/**
 * Logic for ASR behavior
 */
export class ASRCore {
  private wsEndpoint: string = endpoints.ws;
  private socket: WebSocket | undefined;
  private onContentUpdate: (content: SentencesContent) => void;
  private onStateUpdate: (state: ASRCoreState) => void;

  public audioController: AudioController;
  public content: SentencesContent;
  public state: ASRCoreState;

  constructor(
    onContentUpdate?: typeof this.onContentUpdate,
    onStateUpdate?: typeof this.onStateUpdate,
  ) {
    this.audioController = new AudioController((data, volume) => {
      this.setVisualScale(volume);
      if (this.socket && this.socket.readyState === this.socket.OPEN) {
        this.socket.send(data);
      } else {
        console.warn("ASR Socket Not Ready!");
      }
    });

    this.content = {
      finals: [],
      currentSentence: "",
    };

    this.onContentUpdate = (content) => {
      this.content = content;
      onContentUpdate?.(content);
    };

    this.state = {
      connected: false,
    };

    this.onStateUpdate = (state) => {
      this.state = state;
      onStateUpdate?.(state);
    };
  }

  async connect(token: string) {
    if (this.socket) {
      this.socket.close(1000, "Close previous socket");
      this.socket = undefined;
    }

    const socket = new WebSocket(`${this.wsEndpoint}/?token=${token}`);
    this.socket = socket;
    socket.binaryType = "arraybuffer";

    const socketOpenedPromise = new Promise<WebSocket>((res) => {
      socket.addEventListener("open", () => {
        this.onStateUpdate({
          connected: true,
        });
        res(socket);
      });
    });

    socket.addEventListener("error", (e) => {
      console.warn(e);
    });

    socket.addEventListener("close", () => {
      this.onStateUpdate({
        connected: false,
      });
    });

    return socketOpenedPromise;
  }

  async start({
    authToken,
    deviceId = "default",
  }: {
    authToken: string;
    deviceId?: string | null;
  }) {
    await this.connect(authToken);

    const devices = await this.audioController.getAudioDevices();

    await this.audioController.openAudioIn(deviceId || devices[0]?.deviceId);

    const asrReady = new Promise<void>((res) => {
      this.socket?.addEventListener("message", (e) => {
        console.log("[ASR]: ", e.data);
        let data;
        try {
          data = JSON.parse(e.data);
        } catch (e) {
          console.warn(e);
        }

        if (data?.message_type === "session_started" && data?.status === "ok") {
          res();
        }

        if (data?.pipe?.asr_sentence) {
          if (data?.pipe?.asr_final) {
            // concat the finished sentences into finals stack
            this.onContentUpdate({
              finals: [...this.content.finals, data.pipe.asr_sentence],
              currentSentence: "",
            });
          } else {
            this.onContentUpdate({
              finals: this.content.finals,
              currentSentence: data.pipe.asr_sentence,
            });
          }
        }
      });
    });

    return asrReady;
  }

  async stop() {
    try {
      await this.audioController.closeAudioIn();
    } catch (e) {
      console.warn(e);
    }
    this.socket?.close();
    this.setVisualScale(0);
  }

  /** Not necessary visualization, you can customize your logic by modifying `AudioController(onAudioProcess)` constructor callback function */
  private setVisualScale(volume: number) {
    document.documentElement.style.setProperty(
      "--volume-scale",
      `${Math.max(0, Math.min(volume, 100))}%`,
    );
  }
}

/** Simple AudioContext recording class. Can be implemented different like using `AudioWorklet` or other streaming library. */
class AudioController {
  private onAudioProcess: (data: Int16Array, avgVolume: number) => void;
  private onUserMedia?: (stream: MediaStream) => void;
  private onUserMediaError?: (err: Error) => void;

  private stream?: MediaStream;
  private mediaAudioSource?: MediaStreamAudioSourceNode;
  private scriptNode?: ScriptProcessorNode;
  private audioContext?: AudioContext;

  private voiceChunks16: Int16Array[] = [];
  private recordingLength: number = 0;

  private sampleRate: number = 16000;
  private audioType: string = "audio/wave";
  private pause: boolean = false;
  private isAudioIn: boolean = false;

  public constructor(
    onAudioProcess: (data: Int16Array, avgVolume: number) => void,
    onUserMedia?: (stream: MediaStream) => void,
    onUserMediaError?: (err: Error) => void,
  ) {
    this.onAudioProcess = onAudioProcess;
    this.onUserMedia = onUserMedia;
    this.onUserMediaError = onUserMediaError;
    this.handleUserMedia = this.handleUserMedia.bind(this);
    this.handleUserMediaError = this.handleUserMediaError.bind(this);
  }

  public async getAudioDevices(): Promise<Device[]> {
    if (typeof (navigator.mediaDevices || {}).enumerateDevices !== "function") {
      return [];
    }

    // Acquired user permission first for some browser (Safari) that doesn't allow returning devices list from calling `enumerateDevices`
    await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const deviceList: Device[] = [];
    const devices = await navigator.mediaDevices.enumerateDevices();
    devices.forEach((device) => {
      if (device.kind === "audioinput") {
        deviceList.push({
          deviceId: device.deviceId,
          groupId: device.groupId,
          label: device.label,
        });
      }
    });
    return deviceList;
  }

  async setAudioDeviceId(deviceId: string) {
    this.pause = true;
    await this.openAudioIn(deviceId);
    this.pause = false;
    return deviceId;
  }

  public async openAudioIn(deviceId = ""): Promise<void> {
    try {
      if (this.stream) {
        return;
      }

      if (deviceId) {
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: deviceId },
        });
      } else {
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      }

      this.pause = false;
      this.isAudioIn = true;
      this.handleUserMedia();
    } catch (err) {
      console.error(`audio controller user media error ${err}`);
      this.handleUserMediaError(err as Error);
    }
  }

  public checkAudioIn(): boolean {
    return this.isAudioIn;
  }

  public pauseAudio(): void {
    this.pause = true;
  }

  public resumeAudio(): void {
    this.pause = false;
  }

  public async closeAudioIn(): Promise<void> {
    if (this.stream) {
      this.stream.getTracks().map((track) => track.stop());
      this.stream = undefined;
    }
    if (this.scriptNode) {
      this.scriptNode.onaudioprocess = () => {};
      this.scriptNode.disconnect();
      this.scriptNode = undefined;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = undefined;
    }
    this.pause = false;
    this.isAudioIn = false;

    return new Promise<void>((res) => {
      setTimeout(() => {
        this.onAudioProcess(new Int16Array(0), 0);
        res();
      }, 100);
    });
  }

  async changeDevice(deviceId: string) {
    await this.closeAudioIn();
    await this.openAudioIn(deviceId);
    return deviceId;
  }

  private handleUserMedia(): void {
    const bufferSize = 2048;
    this.voiceChunks16 = [];
    this.recordingLength = 0;
    this.audioContext = new AudioContext({ sampleRate: this.sampleRate });
    this.mediaAudioSource = this.audioContext!.createMediaStreamSource(
      this.stream!,
    );
    this.scriptNode = this.audioContext!.createScriptProcessor(
      bufferSize,
      1,
      1,
    );
    this.scriptNode.onaudioprocess = (e) => {
      if (!this.pause) {
        const data = e.inputBuffer.getChannelData(0);

        const buffer = this.toPCM16Buffer(data, this.audioContext!.sampleRate);
        const avgVolume = this.getAmplitude(data);

        this.voiceChunks16.push(buffer);
        this.recordingLength += bufferSize;

        this.onAudioProcess(buffer, avgVolume);
      }
    };
    this.mediaAudioSource.connect(this.scriptNode);
    this.scriptNode.connect(this.audioContext!.destination);

    this.onUserMedia?.(this.stream!);
  }

  private handleUserMediaError(err: Error): void {
    this.onUserMediaError?.(err);
  }

  private toPCM16Buffer(buffer: Float32Array, sampleRate: number): Int16Array {
    const sampleRateRatio = sampleRate / 16000;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Int16Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let total = 0,
        count = 0;
      for (
        let i = offsetBuffer;
        i < nextOffsetBuffer && i < buffer.length;
        i++
      ) {
        total += buffer[i];
        count++;
      }

      const sample = total / count;

      // sample is float, convert to PCM value
      const s = Math.max(-1, Math.min(1, sample));
      result[offsetResult] = s < 0 ? s * 0x8000 : s * 0x7fff;

      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }

  private getAmplitude(buffer: Float32Array): number {
    const basePower = 0.0001;
    let totalPower = 0;
    for (let i = 0; i < buffer.length; i++) {
      totalPower += buffer[i] * buffer[i];
    }
    const avgPower = totalPower / buffer.length;
    let rms = 20.0 * Math.log10(avgPower / basePower);
    rms = rms > 0 ? rms : 0;
    return rms;
  }
}
