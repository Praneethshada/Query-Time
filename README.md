# Query Time - MERN Classroom Q&A Platform

Live site: https://query-time-online.onrender.com/

Query Time is a full-stack MERN application designed to facilitate Q&A in a classroom setting. It provides distinct interfaces for teachers and students. Teachers can create virtual classrooms, each with a unique join code. Students can use this code to join a class and ask questions, which are visible only to the teacher. This creates an organized and interruption-free learning environment.

---

<!-- DOCS:START solution-diagram -->

## Solution Diagram

The application follows a standard client-server architecture. The React frontend communicates with the Express backend via a RESTful API, which in turn interacts with the MongoDB database.

```txt
+------------------+         HTTP Requests          +------------------+       DB Queries         +-----------------+
|                  |  (GET, POST, PATCH, DELETE)    |                  |  (find, create, save)    |                 |
|   React Client   | <----------------------------> |  Express Server  |  <-------------------->  |    MongoDB      |
| (localhost:3000) |                                | (localhost:5000) |                          |    (Local)      |
|                  |                                |                  |                          |                 |
+------------------+                                +------------------+                          +-----------------+
```

<!-- DOCS:END solution-diagram -->

<!-- DOCS:START realtime-architecture -->

## Realtime Architecture (Questions)

We use Socket.IO for realtime question updates because it provides reliable WebSocket transport with automatic reconnection, built-in room support, and a simple auth handshake that fits our JWT-based API.

### What happens

- The client connects to the Socket.IO server with the JWT in the `auth` payload.
- The client joins a classroom room using `classroom:join` with the classroom id.
- The server routes connections into role-specific rooms:
  - `classId:teacher` receives full question data including asker name.
  - `classId:student` receives sanitized question data without asker name.

### Events (only questions)

- `question:created` - A new question was posted to the class.
- `question:status-updated` - A teacher updated a question status (answered/important/unanswered).
- `question:answer-updated` - A teacher added or updated an optional answer.
- `question:cleared` - All questions in a class were cleared.

### Why this design

- **Room-based fanout** keeps events scoped to one classroom and role.
- **JWT auth on connect** keeps realtime channels consistent with REST permissions.
- **Privacy by design** keeps asker identity visible only to the host.
- **Minimal event set** avoids unnecessary traffic and keeps the system easy to reason about.

## Patterns & Performance Tactics

- **SRP (Single Responsibility)**: question API calls are centralized in a dedicated service module.
- **Factory**: socket client creation is encapsulated in a `createSocket` factory.
- **Observer**: Socket.IO events notify clients of question changes in realtime.
- **Performance**: indexing questions by classroom/status/createdAt improves query speed; role-scoped fanout reduces payload size.

<!-- DOCS:END realtime-architecture -->

## Design Decisions

Several key decisions were made to shape the application's architecture and user experience:

- _JWT-Based Authentication_: To secure the application and manage user sessions, JSON Web Tokens (JWT) are used. Upon successful login, the backend issues a token that the frontend stores and sends in the Authorization header for all protected API requests.

- _Role-Based Access Control (RBAC)_: The system is built around two distinct roles: 'teacher' and 'student'. Backend middleware protects sensitive endpoints, ensuring that only users with the 'teacher' role can create classes, view all questions, and manage question statuses.

- _Centralized State Management: The frontend uses \*\*Redux Toolkit_ for predictable and centralized state management. This handles the global user authentication state, classroom data, and questions, simplifying data flow and keeping the UI in sync.

- _Data Integrity_: To maintain a clean Q&A board, the backend API prevents duplicate questions from being posted within the same classroom. The check is case-insensitive for a more user-friendly experience.

---

## Tech Stack

### Backend

- _Node.js_: JavaScript runtime environment
- _Express.js_: Web application framework for Node.js
- _MongoDB_: NoSQL database for storing data
- _Mongoose_: Object Data Modeling (ODM) library for MongoDB
- _JSON Web Token (JWT)_: For user authentication
- _bcrypt.js_: For hashing passwords

### Frontend

- _React_: JavaScript library for building user interfaces
- _Redux Toolkit_: For efficient and predictable state management
- _React Router_: For client-side routing and navigation
- _Axios_: For making HTTP requests to the backend API
- _Socket.IO Client_: For realtime question updates

---

## Set-up and Installation Steps

To run this project locally, you will need Node.js and MongoDB installed on your machine. You will need to run the backend and frontend servers in two separate terminals.

### 1. Backend Server

1.  Navigate to the backend directory:

    cd backend

2.  Install the necessary dependencies:

    npm install

3.  Create a .env file in the root of the backend folder (you can start from `.env.example`). Add the following variables, replacing the placeholders with your own values:

    PORT=5000

    MONGO_URI=your_mongodb_connection_string

    JWT_SECRET=your_super_secret_jwt_key

    CLIENT_ORIGIN=http://localhost:3000

    # You can provide multiple origins as a comma-separated list

    NODE_ENV=development

4.  Start the backend server:

    npm start

    The server should now be running on http://localhost:5000.
    Health check: http://localhost:5000/health

### 2. Frontend Client

1.  Navigate to the frontend directory in a new terminal:

    cd frontend

2.  Install the necessary dependencies:

    npm install

3.  (Optional) Create a `.env` file in the root of the frontend folder (you can start from `.env.example`) for API endpoints:

    REACT_APP_API_URL=http://localhost:5000

    REACT_APP_SOCKET_URL=http://localhost:5000

4.  Start the frontend development server:

    npm start

    The React application will open automatically in your browser at http://localhost:3000.

## Testing

The project uses the default Create React App test runner. If you want to run tests in watch mode:

    npm test

Note: If you add new test dependencies that ship ESM-only builds, Jest may require additional mocks or config.

## Assumptions

In building the Query Time project, we made several key assumptions to define its scope and functionality.

### Authentication and Roles

- Fixed Roles: We assumed users are strictly either a 'teacher' or a 'student'. This role is assigned at registration and does not change. There are no other roles, like administrators or teaching assistants.

### Classroom and Question Management

- Join Code is Sufficient: We assumed that a unique, 6-character, randomly generated code is a secure and sufficient method for students to join a class. There is no system for email invitations or manual enrollment by the teacher.

- No Deletion of Core Data: The application does not include functionality to delete a user account or an entire classroom. The only deletion feature is the "Clear All Questions" function for teachers.

- Non-deletable Classes: Once a class is created, it cannot be deleted. This was assumed because:
  - Students may still have doubts after the session ends and should be able to post questions later.
  - Teachers or teaching assistants may revisit past classes to review questions and prepare clarifications or study resources.

- Open Enrollment: Any student with a valid join code can join the corresponding class. There is no approval system.

- Student Identification: Every question posted by a student includes their name. The purpose of this design choice is simply to keep the class environment professional and focused, but not to point at individual students.

### Technical and UI Scope

- Local Development: We assumed the entire project is being developed and run in a local environment (localhost). For production, you should define `REACT_APP_API_URL`, `REACT_APP_SOCKET_URL`, and `CLIENT_ORIGIN`.

- Simple Data Types: The system is designed to handle text-based questions only. There is no functionality for file uploads, images, or rich text formatting.

### Git Repo link -

    https://github.com/Praneethshada/Query-Time
