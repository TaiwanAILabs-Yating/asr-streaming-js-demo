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
export async function ttsApi(
  requestBody: ttsRequestBodyType,
  {
    endpoint = "https://tts.api.yating.tw/v3/speeches/synchronize",
    apiKey,
  }: {
    endpoint?: string;
    apiKey: string;
  },
) {
  const now = Date.now();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      key: apiKey,
    },
    body: JSON.stringify(requestBody),
  });
  console.log(`Spent: ${Date.now() - now} ms`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
