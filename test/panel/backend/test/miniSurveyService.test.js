import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildMiniSurveyCsv,
  completeMiniSurveyResponse,
  constants,
  publishMiniSurvey,
} from '../src/miniSurveyService.js';

function createMockDb() {
  const calls = [];
  const trx = {
    query: async (sql, params) => {
      calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    },
  };
  return {
    calls,
    transaction: async (fn) => fn(trx),
  };
}

test('completeMiniSurveyResponse records completion, points and notification in one transaction', async () => {
  const db = createMockDb();

  await completeMiniSurveyResponse({
    db,
    surveyId: 9,
    responseId: 12,
    memberId: 1001,
    completedAt: new Date('2026-02-01T00:00:00Z'),
  });

  assert.equal(db.calls.length, 3);
  assert.match(db.calls[0].sql, /UPDATE mini_survey_response/);
  assert.match(db.calls[1].sql, /INSERT INTO point_ledger/);
  assert.deepEqual(db.calls[1].params, [1001, constants.COMPLETE_REASON, constants.COMPLETE_POINTS, 9]);
  assert.match(db.calls[2].sql, /INSERT INTO notification/);
});

test('publishMiniSurvey updates status and inserts publish notification', async () => {
  const db = createMockDb();

  await publishMiniSurvey({ db, surveyId: 5, publishedAt: new Date('2026-01-01T00:00:00Z') });

  assert.equal(db.calls.length, 2);
  assert.match(db.calls[0].sql, /UPDATE mini_survey/);
  assert.match(db.calls[1].sql, /mini_survey_published/);
});

test('buildMiniSurveyCsv guarantees one row per response and ordered question columns', () => {
  const csv = buildMiniSurveyCsv({
    snapshots: [
      {
        responseId: 300,
        memberId: 88,
        specialty: 'cardiology',
        hospitalType: 'university',
        prefecture: 'tokyo',
        yearsInPractice: 12,
        facilitySize: '500+',
      },
    ],
    questions: [
      { id: 20, questionOrder: 2 },
      { id: 10, questionOrder: 1 },
    ],
    responses: [
      {
        id: 300,
        surveyId: 55,
        answers: [
          { questionId: 10, answerValueJson: { value: 'A' } },
          { questionId: 20, answerValueJson: ['x', 'y'] },
        ],
      },
    ],
  });

  const [header, data] = csv.split('\n');
  assert.match(header, /"q_1","q_2"$/);
  assert.match(data, /"55","300","88"/);
  assert.match(data, /"{""value"":""A""}"/);
});

test('buildMiniSurveyCsv fails when snapshot is missing', () => {
  assert.throws(
    () =>
      buildMiniSurveyCsv({
        snapshots: [],
        questions: [],
        responses: [{ id: 1, surveyId: 1, answers: [] }],
      }),
    /snapshot missing/,
  );
});
