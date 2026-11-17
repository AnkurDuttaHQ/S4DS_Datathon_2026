# S4DS First-Round Secure Quiz API

## Locked rules
- Team attempt, operated only by the registered team leader.
- Exactly one attempt per registration/team and quiz.
- 30 questions, 30 minutes.
- Correct: +1; incorrect/unanswered: 0.
- Scheduled start/end window; results hidden until admin publication.
- Randomized question and option order; auto-save; server-side expiry and auto-submit.

## Existing registration integration
The current `Registration` model is the team record:
- `team.name`
- `lead.email`
- `members[]` (three additional members)
- `status === "APPROVED"`
- `payment.status` is expected to be `"VERIFIED"` when payment is required.

Quiz team identity must be derived from the authenticated leader's verified email and the matching Registration record. Never accept a registration ID/team ID from the participant request as authority.

## Admin routes
All routes below require the existing ADMIN Bearer JWT middleware:
- `GET /api/admin/quiz`
- `POST /api/admin/quiz` body: `{ title, description?, startsAt, endsAt }`
- `POST /api/admin/quiz/:quizId/questions` body: `{ prompt, options: [{ optionId: "A"|"B"|"C"|"D", text } x4], correctOptionId }`
- `GET /api/admin/quiz/:quizId/questions` (admin-only; includes answer keys)
- `POST /api/admin/quiz/:quizId/activate` (requires exactly 30 active questions)

## Participant API contract (next integration step)
- `GET /api/quiz/eligibility`
- `GET /api/quiz/instructions`
- `POST /api/quiz/start`
- `GET /api/quiz/attempt/current`
- `GET /api/quiz/attempt/questions`
- `PUT /api/quiz/attempt/answer`
- `POST /api/quiz/attempt/submit`
- `GET /api/quiz/attempt/status`
- `GET /api/quiz/results`

Participant authentication is deliberately not guessed in this first pass: the existing repository currently exposes admin JWT authentication but no participant login/session middleware. Before enabling participant routes, implement a verified team-leader identity flow (prefer a separate leader login or one-time invitation flow, not public trust in a typed email or registration ID).

## Operational notes
- MongoDB must be a replica set (Atlas qualifies) for transactions if transactions are used.
- Ensure Mongoose indexes have completed before opening registration/quiz traffic.
- Use server UTC timestamps; display local time in the UI.
- Never use in-memory timers. On every attempt read, answer save, and submission, compare server time to `expiresAt`; run a periodic recovery worker to auto-submit expired attempts after restarts.
- Keep correct answers out of participant responses. Use separate participant projections.
- Add rate limiting, CSRF protection if cookie auth is used, strict CORS, Helmet/CSP, request validation, and security event review before production.
