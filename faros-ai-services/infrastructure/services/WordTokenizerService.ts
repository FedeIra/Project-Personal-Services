// Internal Dependencies:
import { IWordTokenizerService } from '../../application/interfaces/IWordTokenizerService';
import { STOP_WORDS } from '../../domain/StopWords';

const MIN_WORD_LENGTH = 3;

/**
 * Tokenizes text into a word frequency map.
 *
 * Pipeline:
 * 1. Convert to lowercase
 * 2. Remove punctuation and numbers
 * 3. Split by whitespace
 * 4. Filter stop words (English common words: a, the, is, etc.)
 * 5. Filter words shorter than MIN_WORD_LENGTH
 * 6. Count frequency of each remaining word
 */
export class WordTokenizerService implements IWordTokenizerService {
  tokenize(text: string): Map<string, number> {
    const wordCounts = new Map<string, number>();

    // Lowercase → remove non-alpha characters (keep spaces) → split
    const words: string[] = text
      .toLowerCase()
      .replace(/[^a-z\s-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length >= MIN_WORD_LENGTH)
      .filter((word) => !STOP_WORDS.has(word));

    for (const word of words) {
      const current = wordCounts.get(word) || 0;
      wordCounts.set(word, current + 1);
    }

    return wordCounts;
  }
}
