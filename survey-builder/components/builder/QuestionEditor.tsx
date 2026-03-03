'use client';

import { useState } from 'react';
import { Question, QuestionType, QuestionOption, QuestionRule, RuleActionType } from '@/types/survey';

interface QuestionEditorProps {
  question: Question;
  allQuestions: Question[];
  onChange: (updates: Partial<Question>) => void;
}

export default function QuestionEditor({ question, allQuestions, onChange }: QuestionEditorProps) {
  const [showTypeSelection, setShowTypeSelection] = useState(!question.type || question.text === '');

  const handleTypeChange = (type: QuestionType) => {
    // Initialize type-specific fields
    const updates: Partial<Question> = { type };
    
    if (type === 'SA' || type === 'MA') {
      updates.options = question.options || [
        { value: '1', label: '' },
        { value: '2', label: '' },
      ];
    } else if (type === 'MATRIX') {
      updates.matrix = question.matrix || {
        rows: [{ id: 'r1', label: '' }],
        cols: [{ id: 'c1', label: '' }],
      };
    } else if (type === 'NUMERIC') {
      updates.min = question.min ?? 0;
      updates.max = question.max ?? 100;
      updates.unit = question.unit || '';
    }
    
    onChange(updates);
    setShowTypeSelection(false);
  };

  if (showTypeSelection) {
    return (
      <div>
        <h3 style={{ marginBottom: '20px' }}>質問タイプを選択</h3>
        <div className="type-cards">
          <div className="type-card" onClick={() => handleTypeChange('SA')}>
            <div className="type-card-icon">⭕</div>
            <div className="type-card-name">SA（単一選択）</div>
            <div className="type-card-desc">ラジオボタン</div>
          </div>
          <div className="type-card" onClick={() => handleTypeChange('MA')}>
            <div className="type-card-icon">☑️</div>
            <div className="type-card-name">MA（複数選択）</div>
            <div className="type-card-desc">チェックボックス</div>
          </div>
          <div className="type-card" onClick={() => handleTypeChange('FREE')}>
            <div className="type-card-icon">📝</div>
            <div className="type-card-name">Free（自由記述）</div>
            <div className="type-card-desc">テキストエリア</div>
          </div>
          <div className="type-card" onClick={() => handleTypeChange('NUMERIC')}>
            <div className="type-card-icon">🔢</div>
            <div className="type-card-name">Numeric（数値）</div>
            <div className="type-card-desc">整数入力</div>
          </div>
          <div className="type-card" onClick={() => handleTypeChange('MATRIX')}>
            <div className="type-card-icon">📊</div>
            <div className="type-card-name">Matrix（マトリクス）</div>
            <div className="type-card-desc">行×列選択</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>質問編集: {question.qid}</h3>
        <button
          onClick={() => setShowTypeSelection(true)}
          className="btn btn-secondary btn-small"
        >
          タイプ変更
        </button>
      </div>

      {/* Common Fields */}
      <div className="form-group">
        <label className="form-label">
          QID <span style={{ color: '#999', fontSize: '12px' }}>(変更可能)</span>
        </label>
        <input
          type="text"
          className="form-input"
          value={question.qid}
          onChange={e => onChange({ qid: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">質問文 *</label>
        <textarea
          className="form-textarea"
          value={question.text}
          onChange={e => onChange({ text: e.target.value })}
          placeholder="質問文を入力してください"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label className="form-label">補足文（任意）</label>
        <input
          type="text"
          className="form-input"
          value={question.helpText || ''}
          onChange={e => onChange({ helpText: e.target.value })}
          placeholder="補足説明があれば入力"
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            className="form-checkbox"
            checked={question.required}
            onChange={e => onChange({ required: e.target.checked })}
          />
          必須回答
        </label>
      </div>

      <div className="form-group">
        <label className="form-label">次へボタン文言（任意）</label>
        <input
          type="text"
          className="form-input"
          value={question.nextButtonText || ''}
          onChange={e => onChange({ nextButtonText: e.target.value })}
          placeholder="デフォルト: 次へ"
        />
      </div>

      <div className="divider" />

      {/* Type-specific fields */}
      {(question.type === 'SA' || question.type === 'MA') && (
        <OptionsEditor
          options={question.options || []}
          onChange={options => onChange({ options })}
        />
      )}

      {question.type === 'NUMERIC' && (
        <NumericEditor
          min={question.min}
          max={question.max}
          unit={question.unit}
          onChange={updates => onChange(updates)}
        />
      )}

      {question.type === 'MATRIX' && (
        <MatrixEditor
          matrix={question.matrix}
          onChange={matrix => onChange({ matrix })}
        />
      )}

      <div className="divider" />

      {/* Rules Editor */}
      <RulesEditor
        question={question}
        allQuestions={allQuestions}
        onChange={rules => onChange({ rules })}
      />

      <div className="divider" />

      {/* Mini Preview */}
      <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '6px' }}>
        <h4 style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
          プレビュー
        </h4>
        <QuestionPreview question={question} />
      </div>
    </div>
  );
}

// Options Editor for SA/MA
function OptionsEditor({ options, onChange }: { options: QuestionOption[]; onChange: (options: QuestionOption[]) => void }) {
  const addOption = () => {
    const newValue = String(options.length + 1);
    onChange([...options, { value: newValue, label: '' }]);
  };

  const updateOption = (index: number, updates: Partial<QuestionOption>) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    onChange(newOptions);
  };

  const deleteOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h4 style={{ marginBottom: '12px' }}>選択肢</h4>
      <ul className="options-list">
        {options.map((option, index) => (
          <li key={index} className="option-item">
            <span className="drag-handle">⋮⋮</span>
            <input
              type="text"
              className="form-input"
              placeholder="value"
              value={option.value}
              onChange={e => updateOption(index, { value: e.target.value })}
              style={{ flex: '0 0 80px' }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="ラベル"
              value={option.label}
              onChange={e => updateOption(index, { label: e.target.value })}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <input
                type="checkbox"
                checked={option.isOther || false}
                onChange={e => updateOption(index, { isOther: e.target.checked })}
              />
              <span style={{ fontSize: '12px' }}>その他</span>
            </label>
            <button
              onClick={() => deleteOption(index)}
              className="btn btn-small btn-danger"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
      <button onClick={addOption} className="btn btn-secondary btn-small">
        ➕ 選択肢を追加
      </button>
    </div>
  );
}

// Numeric Editor
function NumericEditor({ min, max, unit, onChange }: { min?: number; max?: number; unit?: string; onChange: (updates: any) => void }) {
  return (
    <div>
      <h4 style={{ marginBottom: '12px' }}>数値設定</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label">最小値</label>
          <input
            type="number"
            className="form-input"
            value={min ?? ''}
            onChange={e => onChange({ min: e.target.value ? parseInt(e.target.value) : undefined })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">最大値</label>
          <input
            type="number"
            className="form-input"
            value={max ?? ''}
            onChange={e => onChange({ max: e.target.value ? parseInt(e.target.value) : undefined })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">単位</label>
          <input
            type="text"
            className="form-input"
            value={unit || ''}
            onChange={e => onChange({ unit: e.target.value })}
            placeholder="例: 時間"
          />
        </div>
      </div>
    </div>
  );
}

// Matrix Editor
function MatrixEditor({ matrix, onChange }: { matrix?: any; onChange: (matrix: any) => void }) {
  const rows = matrix?.rows || [];
  const cols = matrix?.cols || [];

  const addRow = () => {
    onChange({
      ...matrix,
      rows: [...rows, { id: `r${rows.length + 1}`, label: '' }],
    });
  };

  const addCol = () => {
    onChange({
      ...matrix,
      cols: [...cols, { id: `c${cols.length + 1}`, label: '' }],
    });
  };

  const updateRow = (index: number, label: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], label };
    onChange({ ...matrix, rows: newRows });
  };

  const updateCol = (index: number, label: string) => {
    const newCols = [...cols];
    newCols[index] = { ...newCols[index], label };
    onChange({ ...matrix, cols: newCols });
  };

  const deleteRow = (index: number) => {
    onChange({ ...matrix, rows: rows.filter((_: any, i: number) => i !== index) });
  };

  const deleteCol = (index: number) => {
    onChange({ ...matrix, cols: cols.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="matrix-builder">
      <h4 style={{ marginBottom: '12px' }}>マトリクス設定</h4>
      
      <div className="matrix-section">
        <div className="matrix-section-title">行（質問項目）</div>
        {rows.map((row: any, index: number) => (
          <div key={index} className="matrix-item">
            <input
              type="text"
              className="form-input"
              value={row.label}
              onChange={e => updateRow(index, e.target.value)}
              placeholder={`行${index + 1}`}
            />
            <button
              onClick={() => deleteRow(index)}
              className="btn btn-small btn-danger"
            >
              削除
            </button>
          </div>
        ))}
        <button onClick={addRow} className="btn btn-secondary btn-small">
          ➕ 行を追加
        </button>
      </div>

      <div className="matrix-section">
        <div className="matrix-section-title">列（評価尺度）</div>
        {cols.map((col: any, index: number) => (
          <div key={index} className="matrix-item">
            <input
              type="text"
              className="form-input"
              value={col.label}
              onChange={e => updateCol(index, e.target.value)}
              placeholder={`列${index + 1}`}
            />
            <button
              onClick={() => deleteCol(index)}
              className="btn btn-small btn-danger"
            >
              削除
            </button>
          </div>
        ))}
        <button onClick={addCol} className="btn btn-secondary btn-small">
          ➕ 列を追加
        </button>
      </div>
    </div>
  );
}

// Rules Editor
function RulesEditor({ question, allQuestions, onChange }: { question: Question; allQuestions: Question[]; onChange: (rules: QuestionRule[]) => void }) {
  const rules = question.rules || [];

  const addRule = () => {
    const newRule: QuestionRule = {
      when: { op: 'equals', value: '' },
      then: { action: 'NEXT' },
    };
    onChange([...rules, newRule]);
  };

  const updateRule = (index: number, updates: Partial<QuestionRule>) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    onChange(newRules);
  };

  const deleteRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h4 style={{ marginBottom: '12px' }}>条件分岐ルール</h4>
      {rules.length === 0 ? (
        <p className="text-muted" style={{ fontSize: '14px' }}>ルールなし（次の質問へ進む）</p>
      ) : (
        <ul className="rules-list">
          {rules.map((rule, index) => (
            <li key={index} className="rule-item">
              <div className="rule-text">
                <span className="keyword">IF</span> {question.qid} {rule.when.op === 'equals' ? '=' : '含む'} "{rule.when.value}"
                {' → '}
                <span className="keyword">THEN</span>{' '}
                {rule.then.action === 'GOTO' && rule.then.targetQid
                  ? `→ ${rule.then.targetQid}`
                  : rule.then.action === 'SCREENOUT'
                  ? '対象外終了'
                  : rule.then.action === 'COMPLETE'
                  ? '完了'
                  : rule.then.action === 'QUOTA_FULL'
                  ? '割付満了'
                  : '次へ'}
              </div>
              <div className="rule-actions">
                <button
                  onClick={() => {
                    const action = prompt('アクション (NEXT/GOTO/SCREENOUT/COMPLETE/QUOTA_FULL):', rule.then.action);
                    if (!action) return;
                    const updates: any = { then: { action: action as RuleActionType } };
                    if (action === 'GOTO') {
                      const target = prompt('遷移先QID:', rule.then.targetQid || '');
                      if (target) updates.then.targetQid = target;
                    }
                    updateRule(index, updates);
                  }}
                  className="btn btn-small btn-secondary"
                >
                  編集
                </button>
                <button
                  onClick={() => deleteRule(index)}
                  className="btn btn-small btn-danger"
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button onClick={addRule} className="btn btn-secondary btn-small">
        ➕ ルールを追加
      </button>
    </div>
  );
}

// Question Preview (mini)
function QuestionPreview({ question }: { question: Question }) {
  return (
    <div>
      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
        {question.text || '（質問文未入力）'}
      </div>
      {question.helpText && (
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
          {question.helpText}
        </div>
      )}
      
      {question.type === 'SA' && question.options && (
        <div>
          {question.options.map((opt, i) => (
            <div key={i} style={{ padding: '6px 0', fontSize: '13px' }}>
              ⭕ {opt.label || `（選択肢${i + 1}）`}
            </div>
          ))}
        </div>
      )}

      {question.type === 'MA' && question.options && (
        <div>
          {question.options.map((opt, i) => (
            <div key={i} style={{ padding: '6px 0', fontSize: '13px' }}>
              ☑️ {opt.label || `（選択肢${i + 1}）`}
            </div>
          ))}
        </div>
      )}

      {question.type === 'FREE' && (
        <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px', color: '#999', fontSize: '13px' }}>
          （自由記述欄）
        </div>
      )}

      {question.type === 'NUMERIC' && (
        <div style={{ fontSize: '13px' }}>
          [数値入力] {question.unit && `単位: ${question.unit}`}
        </div>
      )}

      {question.type === 'MATRIX' && question.matrix && (
        <div style={{ fontSize: '13px' }}>
          行: {question.matrix.rows.length}個 × 列: {question.matrix.cols.length}個
        </div>
      )}
    </div>
  );
}
