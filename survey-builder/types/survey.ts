export type QuestionType = 'SA' | 'MA' | 'FREE' | 'NUMERIC' | 'MATRIX';

export type RuleActionType = 'NEXT' | 'GOTO' | 'SCREENOUT' | 'COMPLETE' | 'QUOTA_FULL';

export type RuleOperator = 'equals' | 'contains';

export interface QuestionOption {
  value: string;
  label: string;
  isOther?: boolean;
}

export interface MatrixRowCol {
  id: string;
  label: string;
}

export interface MatrixConfig {
  rows: MatrixRowCol[];
  cols: MatrixRowCol[];
}

export interface RuleCondition {
  op: RuleOperator;
  value: string | string[];
}

export interface RuleAction {
  action: RuleActionType;
  targetQid?: string;
}

export interface QuestionRule {
  when: RuleCondition;
  then: RuleAction;
}

export interface Question {
  qid: string;
  type: QuestionType;
  text: string;
  helpText?: string;
  required: boolean;
  nextButtonText?: string;
  
  // For SA/MA
  options?: QuestionOption[];
  otherTextRequired?: boolean;
  
  // For Numeric
  min?: number;
  max?: number;
  unit?: string;
  
  // For Matrix
  matrix?: MatrixConfig;
  
  // Rules
  rules?: QuestionRule[];
}

export interface SurveyDefinition {
  surveyId: string;
  title: string;
  description?: string;
  questions: Question[];
  settings?: {
    completeMessage?: string;
    screenoutMessage?: string;
    quotaFullMessage?: string;
  };
}

export interface ValidationError {
  qid: string;
  type: 'missing_target' | 'loop_detected' | 'incomplete' | 'invalid_rule';
  message: string;
}

export type QuestionStatus = 'complete' | 'incomplete' | 'has_rules';
