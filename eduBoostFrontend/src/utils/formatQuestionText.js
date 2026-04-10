/**
 * formatQuestionText.js
 *
 * Parses a question text that may contain embedded options like:
 *   "Hiện tượng hóa học là a. Xay tiêu b. Hiện tượng ma trơi c. Mưa axit"
 * into:
 *   { questionPart: "Hiện tượng hóa học là", options: ["a. Xay tiêu", "b. Hiện tượng ma trơi", "c. Mưa axit"] }
 *
 * Returns the original text as questionPart with empty options[] if no pattern is detected.
 */

/**
 * Detect if text contains embedded a. b. c. d. e. style options
 * @param {string} text
 * @returns {boolean}
 */
export function hasEmbeddedOptions(text) {
  if (!text) return false;
  // Look for at least 2 options like " a. " or " b. " or " a) " pattern
  const optionPattern = /\b[a-eA-E][.)]\s/g;
  const matches = text.match(optionPattern);
  return matches !== null && matches.length >= 2;
}

/**
 * Parse a question text into { questionPart, options }
 * @param {string} text - raw question text
 * @returns {{ questionPart: string, options: string[] }}
 */
export function parseQuestionText(text) {
  if (!text) return { questionPart: '', options: [] };

  if (!hasEmbeddedOptions(text)) {
    return { questionPart: text, options: [] };
  }

  // Find the position of the first option marker (a. or a) at word boundary)
  const firstOptionMatch = text.match(/\b[a-eA-E][.)]\s/);
  if (!firstOptionMatch) {
    return { questionPart: text, options: [] };
  }

  const firstOptionIndex = text.indexOf(firstOptionMatch[0]);
  const questionPart = text.substring(0, firstOptionIndex).trim();
  const optionsText = text.substring(firstOptionIndex);

  // Split into individual options using lookahead on option markers
  // Handles: a. b. c. d. e. / a) b) c) d) e)
  const optionSplitRegex = /(?=\b[a-eA-E][.)]\s)/g;
  const rawOptions = optionsText.split(optionSplitRegex)
    .map(s => s.trim())
    .filter(s => s.length > 0 && /^[a-eA-E][.)]\s/.test(s));

  return { questionPart, options: rawOptions };
}
