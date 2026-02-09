BEGIN;

CREATE TABLE mini_survey (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(64) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  close_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mini_survey_question (
  id BIGSERIAL PRIMARY KEY,
  survey_id BIGINT NOT NULL REFERENCES mini_survey(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  question_type VARCHAR(32) NOT NULL,
  body TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (survey_id, question_order)
);

CREATE TABLE mini_survey_option (
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT NOT NULL REFERENCES mini_survey_question(id) ON DELETE CASCADE,
  option_order INTEGER NOT NULL,
  value VARCHAR(255) NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (question_id, option_order)
);

CREATE TABLE mini_survey_response (
  id BIGSERIAL PRIMARY KEY,
  survey_id BIGINT NOT NULL REFERENCES mini_survey(id) ON DELETE CASCADE,
  member_id BIGINT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'started',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (survey_id, member_id)
);

CREATE TABLE mini_survey_answer (
  id BIGSERIAL PRIMARY KEY,
  response_id BIGINT NOT NULL REFERENCES mini_survey_response(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES mini_survey_question(id) ON DELETE CASCADE,
  answer_value_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (response_id, question_id)
);

CREATE TABLE mini_survey_response_snapshot (
  id BIGSERIAL PRIMARY KEY,
  response_id BIGINT NOT NULL UNIQUE REFERENCES mini_survey_response(id) ON DELETE CASCADE,
  member_id BIGINT NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  hospital_type VARCHAR(255) NOT NULL,
  prefecture VARCHAR(64) NOT NULL,
  years_in_practice INTEGER NOT NULL,
  facility_size VARCHAR(64), -- optional, to be finalized in a spec meeting.
  snapshot_taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX mini_survey_response_survey_id_status_idx
  ON mini_survey_response (survey_id, status);

CREATE INDEX mini_survey_answer_response_id_idx
  ON mini_survey_answer (response_id);

COMMIT;
