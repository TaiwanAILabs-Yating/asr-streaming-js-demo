export interface Device {
  deviceId: string;
  groupId: string;
  label: string;
}

export interface AsrSentenceFinalEvent {
  asr_begin_time: number;
  asr_confidence: number;
  asr_end_time: number;
  asr_final: true;
  asr_sentence: string;
  asr_word_time_stamp: {
    word: string;
    begin_time: number;
    end_time: number;
  }[];
  text_segmented: string;
}

export interface AsrSentenceEvent {
  asr_sentence: string;
}

export interface AsrMetaEvent {
  asr_state: "first_chunk_received" | "utterance_begin" | "utterance_end";
}

export type AsrEvent = AsrMetaEvent | AsrSentenceEvent | AsrSentenceFinalEvent;
