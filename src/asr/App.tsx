import {
  ASRCore,
  ASRCoreState,
  getAuthToken,
  SentencesContent,
} from "../ASR-core";

import { useEffect, useState } from "react";

interface Device {
  deviceId: string;
  groupId: string;
  label: string;
}

export default function VoiceChatContent() {
  const [apiKey, setApiKey] = useState("");
  const [content, setContent] = useState<SentencesContent>({
    finals: [],
    currentSentence: "",
  });
  const [state, setState] = useState<ASRCoreState>({ connected: false });
  const [asrCore] = useState(() => new ASRCore(setContent, setState));
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceId, setDeviceId] = useState("default");

  useEffect(() => {
    const desireId = localStorage.getItem("audio-in-device-id");
    if (desireId) {
      setDeviceId(desireId);
    }
    asrCore.audioController.getAudioDevices().then((list) => {
      setDevices(list);
    });
  }, [asrCore]);

  return (
    <>
      <div className="flex w-full items-center gap-5 p-4">
        <div className="flex min-w-0 flex-1 flex-col items-start justify-start gap-2">
          <label className="flex flex-col items-start">
            API Key
            <input
              type="text"
              className="rounded-xl border px-4 py-2"
              value={apiKey}
              onChange={(e) => setApiKey(e.currentTarget.value)}
              placeholder="Enter the api key here"
            />
          </label>
          <label className="flex flex-col items-start">
            Microphone
            <select
              className="rounded-xl border px-4 py-2"
              value={deviceId}
              onChange={async (e) => {
                const id = e.currentTarget.value;
                if (state.connected) {
                  await asrCore.audioController.changeDevice(id);
                }
                setDeviceId(id);
                localStorage.setItem("audio-in-device-id", id);
              }}
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </select>
          </label>
          <MicVolumeLevel />
          <div className="flex items-center gap-4">
            <button
              className="rounded-full bg-neutral-100 px-4 py-2 hover:bg-neutral-200 active:bg-neutral-300 disabled:bg-transparent disabled:text-neutral-500"
              onClick={async () => {
                try {
                  const authToken = await getAuthToken(apiKey);
                  await asrCore.start({
                    deviceId,
                    authToken,
                  });
                } catch (e) {
                  alert(e);
                }
              }}
              disabled={state.connected}
            >
              Start
            </button>
            <button
              className="rounded-full bg-neutral-100 px-4 py-2 hover:bg-neutral-200 active:bg-neutral-300 disabled:bg-transparent disabled:text-neutral-500"
              onClick={async () => {
                try {
                  await asrCore.stop();
                } catch (e) {
                  alert(e);
                }
              }}
              disabled={!state.connected}
            >
              Stop
            </button>
          </div>
          State
          <pre className="overflow-auto whitespace-pre-wrap rounded-xl border bg-neutral-50 p-4">
            {JSON.stringify(state)}
          </pre>
          Content
          <pre className="overflow-auto whitespace-pre-wrap rounded-xl border bg-neutral-50 p-4">
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      </div>
    </>
  );
}

/** Visualize volume using document's css variable set by asr core */
function MicVolumeLevel() {
  return (
    <div className="relative h-4 w-[256px] overflow-hidden rounded-xl border bg-neutral-400">
      <div
        className="h-full w-full bg-blue-400"
        style={{
          translate: "calc(var(--volume-scale, 0%) - 100%)",
        }}
      />
    </div>
  );
}
