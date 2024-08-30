export type ttsRequestBodyType = {
  input: {
    text: string;
    type: "text" | "ssml";
  };
  voice: {
    model: "female_1" | "female_2" | "male_1" | "male_2";
    lang:
      | "en_us"
      | "ja_jp"
      | "fr_fr"
      | "de_de"
      | "ko_kr"
      | "pl_pl"
      | "pt_br"
      | "ru_ru"
      | "es_es"
      | "id_id"
      | "sv_se"
      | "th_th"
      | "tr_tr"
      | "vi_vn"
      | "hu_hu"
      | "it_it"
      | "zh_tw";
  };
  audioConfig: {
    encoding: "LINEAR16" | "MP3";
    maxLength: number;
    uploadFile: boolean;
  };
};
export async function ttsApi(apiKey: string, requestBody: ttsRequestBodyType) {
  const host = "https://tts.api.yating.tw";
  const url = "/v3/speeches/synchronize";

  const response = await fetch(host + url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      key: apiKey,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
