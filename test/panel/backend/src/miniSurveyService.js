const COMPLETE_REASON = 'mini_survey_complete';
const COMPLETE_POINTS = 100;

/**
 * Publishes a survey and creates a notification for all members.
 * `db` is expected to provide `query(sql, params)` and transaction support.
 */
export async function publishMiniSurvey({ db, surveyId, publishedAt = new Date() }) {
  return db.transaction(async (trx) => {
    await trx.query(
      `UPDATE mini_survey
       SET status = 'published', published_at = $2, updated_at = NOW()
       WHERE id = $1`,
      [surveyId, publishedAt],
    );

    await trx.query(
      `INSERT INTO notification (kind, title, body, related_survey_id, created_at)
       VALUES ('mini_survey_published', '新しいミニサーベイが公開されました', '回答受付を開始しました。', $1, NOW())`,
      [surveyId],
    );
  });
}

/**
 * Completes one response and records points/notification in the same transaction.
 */
export async function completeMiniSurveyResponse({
  db,
  surveyId,
  responseId,
  memberId,
  completedAt = new Date(),
}) {
  return db.transaction(async (trx) => {
    await trx.query(
      `UPDATE mini_survey_response
       SET status = 'completed', completed_at = $2, updated_at = NOW()
       WHERE id = $1 AND member_id = $3`,
      [responseId, completedAt, memberId],
    );

    await trx.query(
      `INSERT INTO point_ledger (member_id, reason, points, survey_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [memberId, COMPLETE_REASON, COMPLETE_POINTS, surveyId],
    );

    await trx.query(
      `INSERT INTO notification (member_id, kind, title, body, related_survey_id, created_at)
       VALUES ($1, 'mini_survey_completed', 'ミニサーベイ回答完了', '100ptを付与しました。', $2, NOW())`,
      [memberId, surveyId],
    );
  });
}

function safeCsv(value) {
  const raw = value == null ? '' : String(value);
  const escaped = raw.replaceAll('"', '""');
  return `"${escaped}"`;
}

/**
 * Exports 1 row per (member x survey) with flattened snapshot + answers.
 */
export function buildMiniSurveyCsv({ snapshots, questions, responses }) {
  const questionColumns = questions
    .sort((a, b) => a.questionOrder - b.questionOrder)
    .map((q) => ({ id: q.id, key: `q_${q.questionOrder}` }));

  const header = [
    'survey_id',
    'response_id',
    'member_id',
    'specialty',
    'hospital_type',
    'prefecture',
    'years_in_practice',
    'facility_size',
    ...questionColumns.map((x) => x.key),
  ];

  const rows = responses.map((response) => {
    const snapshot = snapshots.find((x) => x.responseId === response.id);
    if (!snapshot) {
      throw new Error(`snapshot missing for response_id=${response.id}`);
    }

    const answerMap = new Map(response.answers.map((a) => [a.questionId, JSON.stringify(a.answerValueJson)]));

    return [
      response.surveyId,
      response.id,
      snapshot.memberId,
      snapshot.specialty,
      snapshot.hospitalType,
      snapshot.prefecture,
      snapshot.yearsInPractice,
      snapshot.facilitySize ?? '',
      ...questionColumns.map((col) => answerMap.get(col.id) ?? ''),
    ];
  });

  return [header, ...rows].map((line) => line.map(safeCsv).join(',')).join('\n');
}

export const constants = {
  COMPLETE_REASON,
  COMPLETE_POINTS,
};
