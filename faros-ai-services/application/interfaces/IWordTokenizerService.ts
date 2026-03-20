export interface IWordTokenizerService {
  /**
   * Tokenizes text into words and returns a frequency map.
   * Applies: lowercase, punctuation removal, stop word filtering, min length filter.
   */
  tokenize(text: string): Map<string, number>;
}
