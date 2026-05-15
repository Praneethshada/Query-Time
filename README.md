# Query Time - MERN Classroom Q&A Platform

Query Time is a full-stack MERN application designed to facilitate Q&A in a classroom setting. It provides distinct interfaces for teachers and students. Teachers can create virtual classrooms, each with a unique join code. Students can use this code to join a class and ask questions, which are visible only to the teacher. This creates an organized and interruption-free learning environment.

---

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

---

## Set-up and Installation Steps

To run this project locally, you will need Node.js and MongoDB installed on your machine. You will need to run the backend and frontend servers in two separate terminals.

### 1. Backend Server

1.  Navigate to the backend directory:

    cd backend

2.  Install the necessary dependencies:

    npm install

3.  Create a .env file in the root of the backend folder. Add the following variables, replacing the placeholders with your own values:

    PORT=5000

    MONGO_URI=your_mongodb_connection_string

    JWT_SECRET=your_super_secret_jwt_key

4.  Start the backend server:

    npm start

    The server should now be running on http://localhost:5000.

### 2. Frontend Client

1.  Navigate to the frontend directory in a new terminal:

    cd frontend

2.  Install the necessary dependencies:

    npm install

3.  Start the frontend development server:

    npm start

    The React application will open automatically in your browser at http://localhost:3000.

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

- Local Development: We assumed the entire project is being developed and run in a local environment (localhost) and did not account for production deployment complexities like environment variable management for a live server or database.

- Simple Data Types: The system is designed to handle text-based questions only. There is no functionality for file uploads, images, or rich text formatting.

## Contributors

### Raj k Jain (2025201036)

### Shada Praneeth Reddy (2025204006)

### Qasim Naik (2025201064)

### Thirumalareddy sathvik reddy (2025201020)

### Subhash Dangeti (2025201007)

### Git Repo link -

    https://github.com/Rajkjain03/Query-Time-Classroom-Q-A-sticky-board
