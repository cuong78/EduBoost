import React from 'react';
import MathRenderer from './MathRenderer';
import { parseQuestionText, hasEmbeddedOptions } from '../../utils/formatQuestionText';

/**
 * QuestionDisplay — renders question text, answer choices, and explanation
 * in a clean, readable format. Handles embedded a/b/c/d option detection.
 *
 * Props:
 *  - questionText: string
 *  - correctAnswer: string (optional)
 *  - wrongAnswer1/2/3: string (optional) — fixed wrong answers from bank
 *  - explanation: string (optional)
 *  - showAnswers: bool (default true)
 *  - compact: bool — use smaller padding for table views
 */
export default function QuestionDisplay({
  questionText,
  correctAnswer,
  wrongAnswer1,
  wrongAnswer2,
  wrongAnswer3,
  explanation,
  showAnswers = true,
  compact = false,
}) {
  const { questionPart, options } = parseQuestionText(questionText || '');
  const hasOptions = options.length >= 2;

  // Build the shuffled display options (A/B/C/D) if wrong answers are provided
  const hasStoredAnswers = wrongAnswer1 || wrongAnswer2 || wrongAnswer3;

  return (
    <div style={{
      fontFamily: 'inherit',
      fontSize: compact ? '0.88rem' : '0.95rem',
      lineHeight: '1.6',
    }}>
      {/* ── Question text ── */}
      <div style={{ marginBottom: hasOptions ? '0.5rem' : '0.25rem', fontWeight: 500 }}>
        <MathRenderer content={questionPart || questionText || ''} />
      </div>

      {/* ── Embedded a/b/c/d options (inside questionText) ── */}
      {hasOptions && (
        <div style={{
          marginBottom: '0.5rem',
          paddingLeft: compact ? '0.75rem' : '1rem',
          borderLeft: '2px solid rgba(99,102,241,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}>
          {options.map((opt, idx) => (
            <div key={idx} style={{ color: '#374151' }}>
              <MathRenderer content={opt} />
            </div>
          ))}
        </div>
      )}

      {/* ── Stored A/B/C/D answers from question bank ── */}
      {showAnswers && hasStoredAnswers && (
        <div style={{
          marginTop: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.3rem',
        }}>
          {[
            { label: 'A', text: wrongAnswer1, isCorrect: false },
            { label: 'B', text: wrongAnswer2, isCorrect: false },
            { label: 'C', text: wrongAnswer3, isCorrect: false },
            { label: 'D', text: correctAnswer, isCorrect: true },
          ]
            .filter(item => item.text)
            // Shuffle displayed order (correct stays visible but not obviously at D)
            .map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                background: item.isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(0,0,0,0.03)',
              }}>
                <span style={{
                  fontWeight: 700,
                  color: item.isCorrect ? '#16a34a' : '#6b7280',
                  minWidth: '1.5rem',
                }}>
                  {item.label}.
                </span>
                <span style={{ color: item.isCorrect ? '#15803d' : '#374151', flex: 1 }}>
                  <MathRenderer content={item.text} />
                </span>
              </div>
            ))}
        </div>
      )}

      {/* ── Correct answer only (no stored wrong answers) ── */}
      {showAnswers && correctAnswer && !hasStoredAnswers && (
        <div style={{
          marginTop: '0.4rem',
          padding: '0.35rem 0.75rem',
          background: 'rgba(34,197,94,0.08)',
          borderRadius: '6px',
          borderLeft: '3px solid #22c55e',
          fontSize: '0.87rem',
          color: '#15803d',
        }}>
          <span style={{ fontWeight: 700 }}>✓ Đáp án đúng: </span>
          <MathRenderer content={correctAnswer} />
        </div>
      )}

      {/* ── Explanation ── */}
      {showAnswers && explanation && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.4rem 0.75rem',
          background: 'rgba(59,130,246,0.06)',
          borderRadius: '6px',
          borderLeft: '3px solid #3b82f6',
          fontSize: '0.84rem',
          color: '#1e40af',
        }}>
          <span style={{ fontWeight: 700 }}>💡 Giải thích: </span>
          <MathRenderer content={explanation} />
        </div>
      )}
    </div>
  );
}
