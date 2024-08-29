import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "@/src/index.css";

function TTSDemo() {
  const host = "https://tts.api.yating.tw";
  const url = "/v3/speeches/synchronize";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const apiKey = formData.get("apiKey") as string;

    const requestBody = {
      input: {
        text: formData.get("inputText") as string,
        type: "text",
      },
      voice: {
        model: formData.get("model") as string,
        lang: formData.get("language") as string,
      },
      audioConfig: {
        encoding: "LINEAR16",
        maxLength: 600000,
        uploadFile: true,
      },
    };
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl">Welcome to TTS Page</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-start gap-4 p-4"
      >
        <label className="flex flex-col items-start">
          API Key
          <input
            type="text"
            name="apiKey"
            className="rounded-xl border px-4 py-2"
            placeholder="Enter the api key here"
          />
        </label>
        <label className="flex flex-col items-start">
          Input Text
          <input
            type="text"
            name="inputText"
            className="rounded-xl border px-4 py-2"
            placeholder="Enter the text here"
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
    </div>
  );
}

const root = document.getElementById("root");

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <TTSDemo />
    </React.StrictMode>,
  );
}
