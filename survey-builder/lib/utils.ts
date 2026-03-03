import { SurveyDefinition, Question, ValidationError, QuestionStatus } from '@/types/survey';

const STORAGE_KEY = 'survey_builder_data';

export const storage = {
  save(survey: SurveyDefinition): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(survey));
  },

  load(): SurveyDefinition | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },
};

export function generateQid(questions: Question[]): string {
  const maxNum = questions.reduce((max, q) => {
    const match = q.qid.match(/^S(\d+)$/);
    if (match) {
      return Math.max(max, parseInt(match[1], 10));
    }
    return max;
  }, 0);
  return `S${maxNum + 1}`;
}

export function validateSurvey(survey: SurveyDefinition): ValidationError[] {
  const errors: ValidationError[] = [];
  const qids = new Set(survey.questions.map(q => q.qid));

  survey.questions.forEach(question => {
    // Check if question is incomplete
    if (!question.text.trim()) {
      errors.push({
        qid: question.qid,
        type: 'incomplete',
        message: '質問文が入力されていません',
      });
    }

    if ((question.type === 'SA' || question.type === 'MA') && (!question.options || question.options.length === 0)) {
      errors.push({
        qid: question.qid,
        type: 'incomplete',
        message: '選択肢が設定されていません',
      });
    }

    if (question.type === 'MATRIX') {
      if (!question.matrix || question.matrix.rows.length === 0 || question.matrix.cols.length === 0) {
        errors.push({
          qid: question.qid,
          type: 'incomplete',
          message: 'マトリクスの行または列が設定されていません',
        });
      }
    }

    // Check rules
    if (question.rules) {
      question.rules.forEach((rule, index) => {
        if (rule.then.action === 'GOTO' && rule.then.targetQid) {
          if (!qids.has(rule.then.targetQid)) {
            errors.push({
              qid: question.qid,
              type: 'missing_target',
              message: `ルール${index + 1}: 遷移先QID "${rule.then.targetQid}" が存在しません`,
            });
          }
        }
      });
    }
  });

  // Check for potential loops (simple detection)
  const loopResult = detectLoops(survey.questions);
  if (loopResult.hasLoop) {
    errors.push({
      qid: loopResult.qids[0] || '',
      type: 'loop_detected',
      message: `ループが検出されました: ${loopResult.qids.join(' → ')}`,
    });
  }

  return errors;
}

function detectLoops(questions: Question[]): { hasLoop: boolean; qids: string[] } {
  const qidToIndex = new Map<string, number>();
  questions.forEach((q, i) => qidToIndex.set(q.qid, i));

  // Simple loop detection: check if any GOTO points backward
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    if (question.rules) {
      for (const rule of question.rules) {
        if (rule.then.action === 'GOTO' && rule.then.targetQid) {
          const targetIndex = qidToIndex.get(rule.then.targetQid);
          if (targetIndex !== undefined && targetIndex <= i) {
            return {
              hasLoop: true,
              qids: [question.qid, rule.then.targetQid],
            };
          }
        }
      }
    }
  }

  return { hasLoop: false, qids: [] };
}

export function getQuestionStatus(question: Question): QuestionStatus {
  // Check if has rules
  if (question.rules && question.rules.length > 0) {
    return 'has_rules';
  }

  // Check if complete
  if (!question.text.trim()) {
    return 'incomplete';
  }

  if ((question.type === 'SA' || question.type === 'MA') && (!question.options || question.options.length === 0)) {
    return 'incomplete';
  }

  if (question.type === 'MATRIX') {
    if (!question.matrix || question.matrix.rows.length === 0 || question.matrix.cols.length === 0) {
      return 'incomplete';
    }
  }

  return 'complete';
}

export function exportToJSON(survey: SurveyDefinition): string {
  return JSON.stringify(survey, null, 2);
}

export function importFromJSON(json: string): SurveyDefinition {
  return JSON.parse(json);
}

export function downloadJSON(survey: SurveyDefinition, filename: string = 'survey.json'): void {
  const json = exportToJSON(survey);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
