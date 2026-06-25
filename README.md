# Shared Notes API

A RESTful API built with the MERN stack backend technologies that allows users to create, manage, and share notes with customizable permissions.

This project was created as a capstone project demonstrating authentication, authorization, CRUD operations, user permissions, and API testing.

---

## Features

### User Authentication
- Register new users
- Secure login with JWT authentication
- Protected routes using middleware

### Notes
- Create notes
- View your own notes
- Update notes
- Delete notes

### Sharing Permissions
- Owners can share notes with other registered users
- Viewer permission (read only)
- Editor permission (read and update)
- Permission checks enforced on protected routes

### Markdown Support
- Notes store Markdown as plain text
- Markdown rendering is intended for the React frontend

### Mood / Emoji Support
- Optional mood field on notes
- Store emojis such as:
  - 📝
  - 💪
  - 🔥
  - 🎉
  - ✅

---

# Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcrypt
- Mocha
- Chai
- Supertest

---

# Installation

Clone the repository

```bash
git clone https://github.com/Duuuuud8/capstone-project.git
```

Move into the project

```bash
cd capstone-project
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
PORT=3000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

Start the server

```bash
npm start
```

or

```bash
node server.js
```

---

# Running Tests

Run the complete test suite

```bash
npm test
```

Current test coverage includes:

- User Registration
- User Login
- Create Note
- View Notes
- Update Note
- Delete Note
- Share Note
- Viewer Permissions
- Editor Permissions
- Mood Field Support

---

# API Endpoints

## Authentication

### Register

```
POST /auth/register
```

### Login

```
POST /auth/login
```

---

## Notes

### Create Note

```
POST /notes
```

### View Notes

```
GET /notes
```

Returns:
- Notes owned by the authenticated user
- Notes shared with the authenticated user

### Update Note

```
PATCH /notes/:id
```

### Delete Note

```
DELETE /notes/:id
```

---

## Sharing

### Share a Note

```
PATCH /notes/:id/share
```

Request Body

```json
{
  "userId": "<user_id>",
  "permission": "view"
}
```

or

```json
{
  "userId": "<user_id>",
  "permission": "edit"
}
```

---

# Project Structure

```
controllers/
middlewares/
models/
routes/
test/

app.js
server.js
db.js
package.json
```

---

# Permissions

| User | View | Edit | Delete | Share |
|------|------|------|--------|-------|
| Owner | ✅ | ✅ | ✅ | ✅ |
| Viewer | ✅ | ❌ | ❌ | ❌ |
| Editor | ✅ | ✅ | ❌ | ❌ |

---

# Future Improvements

- React frontend
- Markdown rendering using react-markdown
- Search and filtering
- GIF integration using the Giphy API
- User profile page
- Dark mode
- Rich dashboard

---

# Author

Josh Liles

Capstone Project