/* eslint-disable @typescript-eslint/no-explicit-any */
import "@/src/index.css";
import React, { useState } from "react";
import { ttsApi, ttsRequestBodyType } from "./tts-lib";

export function TTSDemo() {
  const [responseData, setResponseData] = useState<string | null>(null);
  const [prevTime, setPrevTime] = useState(0);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const requestBody: ttsRequestBodyType = {
      input: {
        text: formData.get("inputText") as string,
        type: "text",
      },
      voice: {
        model: formData.get("model") as any,
        lang: formData.get("language") as any,
      },
      audioConfig: {
        encoding: "LINEAR16",
        maxLength: 600000,
        uploadFile: true,
      },
    };
    console.log(requestBody);

    const prev = Date.now();
    try {
      const data = await ttsApi(requestBody, {
        apiKey: formData.get("apiKey") as string,
        endpoint: formData.get("endpoint") as string,
      });
      setResponseData(data);
      try {
        if (data?.audioFile?.audioContent) {
          play(data.audioFile.audioContent, data.audioEncoding);
        }
      } catch (_) {
        //ignore playback error
      }
    } catch (error: any) {
      console.error(error);
      setResponseData(JSON.stringify(error.message, null, 2));
    }
    setPrevTime(Date.now() - prev);
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl">TTS Sample Code</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-start gap-4 p-4"
      >
        <label className="flex w-full flex-col items-start">
          Endpoint
          <input
            type="text"
            name="endpoint"
            className="w-full rounded-xl border px-4 py-2"
            placeholder="Endpoint"
            defaultValue="https://tts.api.yating.tw/v3/speeches/synchronize"
          />
        </label>
        <label className="flex w-full flex-col items-start">
          API Key
          <input
            type="text"
            name="apiKey"
            className="w-full rounded-xl border px-4 py-2"
            placeholder="Enter the api key here"
          />
        </label>
        <label className="flex w-full flex-col items-start">
          Input Text
          <textarea
            name="inputText"
            className="w-full rounded-xl border px-4 py-2"
            placeholder="Enter the text here"
            maxLength={600}
            rows={4}
          />
        </label>
        <label className="flex flex-col items-start">
          Model
          <select className="rounded-xl border px-4 py-2" name="model">
            <option value="female_1">YATING</option>
            <option value="female_2">YIRU</option>
            <option value="male_1">JARVIS</option>
            <option value="male_2">BARRET</option>
          </select>
        </label>
        <label className="flex flex-col items-start">
          Language
          <select className="rounded-xl border px-4 py-2" name="language">
            <option value="en_us">英文</option>
            <option value="ja_jp">日文</option>
            <option value="fr_fr">法文</option>
            <option value="de_de">德文</option>
            <option value="ko_kr">韓文</option>
            <option value="pl_pl">波蘭文</option>
            <option value="pt_br">葡萄牙文</option>
            <option value="ru_ru">俄文</option>
            <option value="es_es">西班牙文</option>
            <option value="id_id">印尼文</option>
            <option value="sv_se">瑞典文</option>
            <option value="th_th">泰文</option>
            <option value="tr_tr">土耳其文</option>
            <option value="vi_vn">越南文</option>
            <option value="hu_hu">匈牙利文</option>
            <option value="it_it">義大利文</option>
            <option value="zh_tw">中文</option>
          </select>
        </label>
        <button
          type="submit"
          className="mt-4 rounded-xl bg-blue-500 px-4 py-2 text-white"
        >
          提交
        </button>
      </form>
      <p>Response Data</p>
      <pre className="overflow-auto whitespace-pre-wrap rounded-xl border bg-neutral-50 p-4">
        {JSON.stringify(responseData, null, 2)}
      </pre>
      Elapsed: {prevTime} ms.
    </div>
  );
}

function play(b64: string, type: string) {
  const a = new Audio(`data:audio/${type};base64, ${b64}`);
  a.play();
  a.onended = () => {
    a.remove();
  };
}
