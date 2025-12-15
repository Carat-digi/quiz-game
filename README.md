# Quiz Game

Simple quiz web app — student final project for a Software Development course.

This project is a small full-stack application that lets users take quizzes, track results, and view leaderboards. The backend is built with Node.js, Express and MongoDB. The frontend is a React app built with Vite.

**Technologies & libraries:**
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Auth & security:** jsonwebtoken (JWT), bcryptjs, cookie-parser
- **HTTP & utilities:** axios (frontend), cors, uuid
- **Frontend:** React, Vite, react-router-dom
- **Testing & linting:** supertest, eslint

**Main functionality:**
- User registration and login (access + refresh tokens via cookies)
- Create, list, view, and delete quizzes (admin or creator)
- Take quizzes and save results
- Leaderboard per quiz
- User admin panel (view users, change roles, delete users)
- User statistics and history

**Install & run (simple steps):**

Prerequisites: Node.js (v18+ recommended), npm, MongoDB (local or cloud URI).

1) Backend

```
cd backend
npm install
# copy or create backend/.env from backend/.env.example and set values
npm run dev
```

Backend scripts available:
- `npm run dev` — run backend in watch mode (`node --watch index.js`)
- `npm test` — run tests (NODE_ENV=test)

2) Frontend

```
cd frontend
npm install
npm run dev
```

Frontend scripts available:
- `npm run dev` — start Vite dev server
- `npm run build` — build production bundle

Notes:
- Backend expects CORS origin `http://localhost:5173` by default.
- API base path: `/api` (see endpoints below).

**Project structure:**

- `backend/` — Node.js + Express server
  - `index.js` — server start
  - `app.js` — express app, routes mounting
  - `src/controllers/` — request handlers (auth, quiz, result, user)
  - `src/models/` — Mongoose models (`User`, `Quiz`, `Question`)
  - `src/routes/` — Express routes (`authRout.js`, `quizRout.js`, `resultRout.js`, `userRout.js`)
  - `src/middleware/` — middleware (auth, error handling, async wrapper)
  - `src/utils/` — config, logger, app error helper
  - `tests/` — backend tests (integration tests with `supertest` and Node test runner)
  - `.env.example` — example environment variables (added)

- `frontend/` — React app (Vite)
  - `index.html` — main HTML file for the Vite app
  - `vite.config.js`, `package.json` — build/dev config and scripts
  - `src/` — application source code
    - `main.jsx` — app bootstrap, router and provider setup
    - `App.jsx` — top-level layout and routes
    - `api/` — API helper modules using `axios`
    - `components/` — reusable UI components
    - `pages/` — route pages
    - `hooks/` — custom hooks and auth provider
    - `styles/` — CSS files for pages and components
    - `utils/` — small helpers (for example `logger.js`)

- Root files
  - `README.md` — project description (this file)
  - `LICENSE`, other metadata

**Testing:**

- Backend tests are located in `backend/tests/`. Tests use Node's built-in test runner and `supertest` for HTTP assertions.
- To run backend tests, set a test MongoDB URI in `backend/.env` (see `backend/.env.example`) and run:

```bash
cd backend
npm test
```

- The test script runs with `NODE_ENV=test` and uses `TEST_MONGODB_URI` if set. There is also a watch helper:

```bash
npm run test:watch
```

- Frontend currently has no automated tests included (focus is on the backend integration tests).


**Database structure (summary):**

- `User` collection
  - `username` (unique)
  - `email` (unique)
  - `passwordHash`
  - `root` (`user` or `admin`)
  - `quizResults` (array of objects: quiz reference, score, percentage, timeSpent, attempts, completedAt)
  - `createdQuizzes` (array of quiz ObjectId)

- `Quiz` collection
  - `title`, `description`, `category`, `timeLimit` (seconds or null)
  - `questions` (array of `Question` ObjectId)
  - `creator` (User ObjectId)

- `Question` collection
  - `question` (text)
  - `options` (array of strings)
  - `answerIndex` (index of correct option)

**Sample database files:**

The project includes three example JSON files (MongoDB exports) showing real database content:

- `users-db-example.json` — sample users with different roles (admin/user), quiz results, and statistics
- `quizzes-db-example.json` — example quizzes covering geography, science, and technology topics
- `questions-db-example.json` — actual quiz questions with multiple-choice answers

These files can be used to:
- Understand the real data structure and relationships between collections
- Seed your test database with sample content
- Import into MongoDB using `mongoimport` command (example below)

To import sample data into your MongoDB:
```bash
# Import users
mongoimport --db quiz-game --collection users --file users-db-example.json --jsonArray

# Import quizzes
mongoimport --db quiz-game --collection quizzes --file quizzes-db-example.json --jsonArray

# Import questions
mongoimport --db quiz-game --collection questions --file questions-db-example.json --jsonArray
```

Note: Make sure to adjust the database name (`quiz-game`) if you're using a different one in your `.env` configuration.

**API endpoints (HTTP path → brief):**

- Auth (`/api/auth`)
  - `POST /register` — register new user
  - `POST /login` — login, returns access token and sets refresh cookie
  - `POST /refresh` — refresh access token using refresh cookie
  - `POST /logout` — revoke refresh token and clear cookie

- Quizzes (`/api/quizzes`)
  - `GET /` — list quizzes (query: search, sort, page, limit, category)
  - `GET /:id` — get quiz by id (includes questions)
  - `POST /` — create quiz (admin only)
  - `DELETE /:id` — delete quiz (creator or admin)

- Results (`/api/results`)
  - `GET /leaderboard/:quizId` — public leaderboard for a quiz
  - (auth required below)
  - `POST /` — save/update quiz result for authenticated user
  - `GET /` — get all results for authenticated user
  - `GET /quiz/:quizId` — get user's result for a quiz
  - `GET /stats` — user statistics summary
  - `DELETE /quiz/:quizId` — delete user's result for a quiz

- Users (`/api/users`) — admin only
  - `GET /` — list users
  - `GET /:userId` — get user by id
  - `PATCH /:userId/role` — update user role
  - `DELETE /:userId` — delete user

**What I learned (student notes):**
- Building a REST API with Express and MongoDB (Mongoose models)
- Authentication with JWT access tokens and refresh tokens via cookies
- Designing relationships between models (`User`, `Quiz`, `Question`)
- Basic frontend with React and Vite, client-server communication with Axios
- Handling pagination, search, and leaderboards
- Writing simple tests with `supertest` and setting up ESLint

**Screenshots**

Below is a list of screenshots with relative paths and short descriptions.

- `screenshots/homePage.png` — Home page with a list of quizzes and search.
- `screenshots/quizPage.png` — Quiz-taking page (questions and answer choices).
- `screenshots/quiz.png` — Quiz card / quiz overview (list of questions).
- `screenshots/resultsAfterQuiz.png` — Results and statistics page after finishing a quiz.
- `screenshots/answersAfterQuiz.png` — View showing correct answers and explanations after completing a quiz.
- `screenshots/createForm.png` — Create quiz form (UI for adding quiz details).
- `screenshots/createForm2.png` — Alternate view/step of the quiz creation form.
- `screenshots/profile.png` — User profile page with result history.