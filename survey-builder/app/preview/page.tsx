'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SurveyDefinition, Question } from '@/types/survey';
import { storage } from '@/lib/utils';

type PreviewStatus = 'inprogress' | 'complete' | 'screenout' | 'quota_full';

export default function PreviewPage() {
  const router = useRouter();
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<PreviewStatus>('inprogress');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const saved = storage.load();
    if (saved) {
      setSurvey(saved);
    } else {
      alert('調査データがありません。ビルダーに戻ります。');
      router.push('/builder');
    }
  }, [router]);

  if (!survey) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (status !== 'inprogress') {
    return (
      <div className="preview-container">
        <div className="preview-question">
          <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
            {status === 'complete' && '✅ 回答完了'}
            {status === 'screenout' && '⚠️ 対象外'}
            {status === 'quota_full' && '📊 割付満了'}
          </h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
            {status === 'complete' && (survey.settings?.completeMessage || 'アンケートにご協力いただき、ありがとうございました。')}
            {status === 'screenout' && (survey.settings?.screenoutMessage || '誠に申し訳ございませんが、今回の調査対象外となりました。')}
            {status === 'quota_full' && (survey.settings?.quotaFullMessage || '該当セグメントの回答数が上限に達しました。')}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => router.push('/builder')} className="btn btn-primary">
              ビルダーに戻る
            </button>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setAnswers({});
                setStatus('inprogress');
                setError('');
              }}
              className="btn btn-secondary"
            >
              最初からやり直す
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = survey.questions[currentIndex];

  if (!currentQuestion) {
    // 全質問完了
    setStatus('complete');
    return null;
  }

  const handleNext = () => {
    setError('');

    // Validation
    if (currentQuestion.required && !answers[currentQuestion.qid]) {
      setError('この質問は必須です');
      return;
    }

    if (currentQuestion.type === 'MA' && currentQuestion.required) {
      const answer = answers[currentQuestion.qid];
      if (!answer || answer.length === 0) {
        setError('1つ以上選択してください');
        return;
      }
    }

    // Check rules
    if (currentQuestion.rules && currentQuestion.rules.length > 0) {
      const answer = answers[currentQuestion.qid];
      
      for (const rule of currentQuestion.rules) {
        let match = false;

        if (rule.when.op === 'equals') {
          match = answer === rule.when.value;
        } else if (rule.when.op === 'contains') {
          if (Array.isArray(answer)) {
            match = answer.includes(rule.when.value);
          }
        }

        if (match) {
          // Apply action
          if (rule.then.action === 'SCREENOUT') {
            setStatus('screenout');
            return;
          } else if (rule.then.action === 'COMPLETE') {
            setStatus('complete');
            return;
          } else if (rule.then.action === 'QUOTA_FULL') {
            setStatus('quota_full');
            return;
          } else if (rule.then.action === 'GOTO' && rule.then.targetQid) {
            const targetIndex = survey.questions.findIndex(q => q.qid === rule.then.targetQid);
            if (targetIndex >= 0) {
              setCurrentIndex(targetIndex);
              return;
            } else {
              setError(`遷移先QID "${rule.then.targetQid}" が見つかりません`);
              return;
            }
          }
          break;
        }
      }
    }

    // Move to next question
    if (currentIndex < survey.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setStatus('complete');
    }
  };

  return (
    <div>
      <div className="header">
        <h1>👁️ プレビュー</h1>
        <div className="header-actions">
          <button onClick={() => router.push('/builder')} className="btn btn-secondary">
            ← ビルダーに戻る
          </button>
        </div>
      </div>

      <div className="preview-container">
        <div className="preview-progress">
          質問 {currentIndex + 1} / {survey.questions.length}
        </div>

        <div className="preview-question">
          <div className="preview-question-text">
            {currentQuestion.text || '（質問文未入力）'}
            {currentQuestion.required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
          </div>

          {currentQuestion.helpText && (
            <div className="preview-help-text">{currentQuestion.helpText}</div>
          )}

          {error && (
            <div style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '12px', borderRadius: '6px', marginBottom: '16px', color: '#856404' }}>
              {error}
            </div>
          )}

          <QuestionRenderer
            question={currentQuestion}
            value={answers[currentQuestion.qid]}
            onChange={value => setAnswers(prev => ({ ...prev, [currentQuestion.qid]: value }))}
          />

          <button onClick={handleNext} className="preview-next-btn btn btn-primary">
            {currentQuestion.nextButtonText || '次へ'}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionRenderer({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}) {
  if (question.type === 'SA') {
    return (
      <ul className="preview-options">
        {question.options?.map(option => (
          <li
            key={option.value}
            className={`preview-option ${value === option.value ? 'selected' : ''}`}
            onClick={() => onChange(option.value)}
          >
            <input
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              style={{ marginRight: '8px' }}
            />
            {option.label}
          </li>
        ))}
      </ul>
    );
  }

  if (question.type === 'MA') {
    const selected = value || [];
    const hasOther = question.options?.some(opt => opt.isOther && selected.includes(opt.value));

    return (
      <div>
        <ul className="preview-options">
          {question.options?.map(option => (
            <li key={option.value}>
              <label
                className={`preview-option ${selected.includes(option.value) ? 'selected' : ''}`}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={e => {
                    if (e.target.checked) {
                      onChange([...selected, option.value]);
                    } else {
                      onChange(selected.filter((v: string) => v !== option.value));
                    }
                  }}
                  style={{ marginRight: '8px' }}
                />
                {option.label}
              </label>
              {option.isOther && selected.includes(option.value) && (
                <input
                  type="text"
                  className="form-input"
                  placeholder="具体的に入力してください"
                  style={{ marginTop: '8px', marginLeft: '28px' }}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (question.type === 'FREE') {
    return (
      <textarea
        className="form-textarea"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        rows={6}
        placeholder="こちらにご記入ください"
      />
    );
  }

  if (question.type === 'NUMERIC') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="number"
          className="form-input"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          min={question.min}
          max={question.max}
          style={{ width: '150px' }}
        />
        {question.unit && <span>{question.unit}</span>}
      </div>
    );
  }

  if (question.type === 'MATRIX' && question.matrix) {
    const matrixValue = value || {};
    
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px', background: '#f5f5f5' }}></th>
              {question.matrix.cols.map(col => (
                <th key={col.id} style={{ border: '1px solid #ddd', padding: '8px', background: '#f5f5f5', textAlign: 'center' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {question.matrix.rows.map(row => (
              <tr key={row.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: '500' }}>
                  {row.label}
                </td>
                {question.matrix!.cols.map(col => (
                  <td key={col.id} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                    <input
                      type="radio"
                      name={`matrix-${row.id}`}
                      checked={matrixValue[row.id] === col.id}
                      onChange={() => onChange({ ...matrixValue, [row.id]: col.id })}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <div>（未対応の質問タイプ）</div>;
}
