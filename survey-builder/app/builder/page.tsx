'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SurveyDefinition, Question, QuestionType, ValidationError } from '@/types/survey';
import { storage, generateQid, validateSurvey, getQuestionStatus, downloadJSON, exportToJSON, importFromJSON } from '@/lib/utils';

export default function BuilderPage() {
  const router = useRouter();
  const [survey, setSurvey] = useState<SurveyDefinition>({
    surveyId: 'new-survey',
    title: '新規調査',
    questions: [],
  });
  const [selectedQid, setSelectedQid] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showImport, setShowImport] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = storage.load();
    if (saved) {
      setSurvey(saved);
      if (saved.questions.length > 0) {
        setSelectedQid(saved.questions[0].qid);
      }
    } else {
      // Load sample
      loadSample();
    }
  }, []);

  // Auto-save
  useEffect(() => {
    storage.save(survey);
    const newErrors = validateSurvey(survey);
    setErrors(newErrors);
  }, [survey]);

  const loadSample = async () => {
    try {
      const res = await fetch('/sample-survey.json');
      const sample = await res.json();
      setSurvey(sample);
      if (sample.questions.length > 0) {
        setSelectedQid(sample.questions[0].qid);
      }
    } catch (error) {
      console.error('Failed to load sample:', error);
    }
  };

  const addQuestion = () => {
    const newQid = generateQid(survey.questions);
    const newQuestion: Question = {
      qid: newQid,
      type: 'SA',
      text: '',
      required: true,
      options: [],
    };
    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setSelectedQid(newQid);
  };

  const updateQuestion = (qid: string, updates: Partial<Question>) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.qid === qid ? { ...q, ...updates } : q
      ),
    }));
  };

  const deleteQuestion = (qid: string) => {
    if (!confirm(`質問 ${qid} を削除しますか？`)) return;
    
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.qid !== qid),
    }));
    
    if (selectedQid === qid) {
      const remaining = survey.questions.filter(q => q.qid !== qid);
      setSelectedQid(remaining.length > 0 ? remaining[0].qid : null);
    }
  };

  const moveQuestion = (qid: string, direction: 'up' | 'down') => {
    const index = survey.questions.findIndex(q => q.qid === qid);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === survey.questions.length - 1) return;

    const newQuestions = [...survey.questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];

    setSurvey(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleExport = () => {
    downloadJSON(survey, `${survey.surveyId}.json`);
  };

  const handleImport = (jsonString: string) => {
    try {
      const imported = importFromJSON(jsonString);
      setSurvey(imported);
      if (imported.questions.length > 0) {
        setSelectedQid(imported.questions[0].qid);
      }
      setShowImport(false);
      alert('インポートしました');
    } catch (error) {
      alert('JSONの解析に失敗しました');
    }
  };

  const handleNewSurvey = () => {
    if (!confirm('新規調査を作成しますか？現在の調査は失われます。')) return;
    setSurvey({
      surveyId: 'new-survey',
      title: '新規調査',
      questions: [],
    });
    setSelectedQid(null);
    storage.clear();
  };

  const selectedQuestion = survey.questions.find(q => q.qid === selectedQid);

  return (
    <div>
      <div className="header">
        <h1>📋 調査ビルダー</h1>
        <div className="header-actions">
          <input
            type="text"
            value={survey.title}
            onChange={e => setSurvey(prev => ({ ...prev, title: e.target.value }))}
            className="form-input"
            placeholder="調査タイトル"
            style={{ width: '300px' }}
          />
          <button onClick={() => router.push('/preview')} className="btn btn-primary">
            👁️ プレビュー
          </button>
          <button onClick={handleExport} className="btn btn-secondary">
            📥 エクスポート
          </button>
          <button onClick={() => setShowImport(true)} className="btn btn-secondary">
            📤 インポート
          </button>
          <button onClick={loadSample} className="btn btn-secondary">
            📄 サンプル読込
          </button>
          <button onClick={handleNewSurvey} className="btn btn-danger">
            🆕 新規作成
          </button>
        </div>
      </div>

      <div className="container">
        {errors.length > 0 && (
          <div className="errors-panel">
            <div className="errors-title">⚠️ 警告 ({errors.length}件)</div>
            <ul className="errors-list">
              {errors.map((error, index) => (
                <li key={index} className="error-item">
                  <strong>{error.qid}:</strong> {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="two-pane">
          <div className="left-pane">
            <h3 style={{ marginBottom: '16px' }}>質問一覧</h3>
            {survey.questions.length === 0 ? (
              <p className="text-muted text-center">質問がありません</p>
            ) : (
              <ul className="question-list">
                {survey.questions.map((question, index) => {
                  const status = getQuestionStatus(question);
                  return (
                    <li
                      key={question.qid}
                      className={`question-item ${selectedQid === question.qid ? 'active' : ''} ${
                        status === 'incomplete' ? 'incomplete' : ''
                      }`}
                      onClick={() => setSelectedQid(question.qid)}
                    >
                      <div className="question-status">
                        {status === 'complete' && '✅'}
                        {status === 'incomplete' && '⚠️'}
                        {status === 'has_rules' && '🔀'}
                      </div>
                      <div className="question-info">
                        <div className="question-qid">{question.qid}</div>
                        <div className="question-type">{question.type}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            moveQuestion(question.qid, 'up');
                          }}
                          className="btn btn-small btn-secondary"
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            moveQuestion(question.qid, 'down');
                          }}
                          className="btn btn-small btn-secondary"
                          disabled={index === survey.questions.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            deleteQuestion(question.qid);
                          }}
                          className="btn btn-small btn-danger"
                        >
                          🗑️
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <button onClick={addQuestion} className="btn btn-primary add-question-btn">
              ➕ 質問を追加
            </button>
          </div>

          <div className="right-pane">
            {selectedQuestion ? (
              <QuestionEditor
                question={selectedQuestion}
                allQuestions={survey.questions}
                onChange={updates => updateQuestion(selectedQuestion.qid, updates)}
              />
            ) : (
              <div className="text-center text-muted" style={{ marginTop: '60px' }}>
                <h3>質問を選択してください</h3>
                <p style={{ marginTop: '12px' }}>左のリストから質問を選択するか、新しい質問を追加してください</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImport={handleImport}
        />
      )}
    </div>
  );
}

// Import Question Editor
import QuestionEditor from '@/components/builder/QuestionEditor';

// Import Modal Component
function ImportModal({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (json: string) => void;
}) {
  const [jsonText, setJsonText] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">JSONインポート</h2>
        <textarea
          className="form-textarea"
          value={jsonText}
          onChange={e => setJsonText(e.target.value)}
          placeholder="JSONを貼り付けてください"
          rows={15}
        />
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">
            キャンセル
          </button>
          <button
            onClick={() => onImport(jsonText)}
            className="btn btn-primary"
            disabled={!jsonText.trim()}
          >
            インポート
          </button>
        </div>
      </div>
    </div>
  );
}
