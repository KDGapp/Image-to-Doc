
export enum AppState {
  IDLE,
  TASK_SELECTION,
  PROCESSING,
  SUCCESS,
  ERROR,
  API_KEY_NEEDED,
}

export enum Task {
  EXTRACT_TEXT = 'Extract Text',
  DESCRIBE_IMAGE = 'Describe Image',
  TRANSLATE = 'Translate Text in Image',
}

export type ProcessedResult = {
  id: string; // Menggunakan imageUrl sebagai ID unik
  imageUrl: string;
  text: string;
};
