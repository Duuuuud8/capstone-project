process.env.NODE_ENV = "test";

require("dotenv").config();

const request = require("supertest");
    // simulate http requests
const chai = require("chai");
const mongoose = require("mongoose");

const User = require("../models/User");
const Note = require("../models/Note");
const app = require("../app");

require("../db");

const expect = chai.expect;


beforeEach(async () => {
    await User.deleteMany({});
    await Note.deleteMany({});

});

after(async () => {
    await mongoose.connection.close();
});


describe("Note Routes", () => {
    let token;

    beforeEach(async () => {
        const res = await request(app)
                            .post("/auth/register")
                            .send({
                                username: "jrock",
                                email: "email@test.com",
                                password: "test1234"
                            });
        token = res.body.token;
    });

    describe("POST /notes", () => {
        it("Should create a new note for the logged in and authenticated user", async () => {
            const res = await request(app)
                                .post("/notes")
                                .set("Authorization", `Bearer ${token}`)
                                .send({
                                    title: "Grocery List",
                                    content: "q-tips",
                                    mood: "💪"
                                });
            expect(res.status).to.equal(201);
            expect(res.body.message).to.equal("Note created successfully");
            expect(res.body.note).to.have.property("_id");
            expect(res.body.note.title).to.equal("Grocery List");
            expect(res.body.note.content).to.equal("q-tips");
            expect(res.body.note.mood).to.equal("💪");
        });
    });

    describe("GET /notes", () => {
        it("Should return all notes for the logged in user", async () => {
            await request(app)
                    .post("/notes")
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                        title: "Grocery List",
                        content: "q-tips"
                    });
            const getRes = await request(app)
                                .get("/notes")
                                .set("Authorization", `Bearer ${token}`);
            expect(getRes.status).to.equal(200);
            expect(getRes.body).to.have.property("notes");
            expect(getRes.body.notes).to.be.an("array");
            expect(getRes.body.notes.length).to.equal(1);
            expect(getRes.body.notes[0].title).to.equal("Grocery List");
            expect(getRes.body.notes[0].content).to.equal("q-tips");
        });
    });

    describe("PATCH /notes/:id", () => {
        it("Should update the selected note", async () => {
            const noteRes = await request(app)
                                .post("/notes")
                                .set("Authorization", `Bearer ${token}`)
                                .send({
                                    title: "Grocery List",
                                    content: "q-tips",
                                    mood: "💪"
                                });
            const noteId = noteRes.body.note._id;
            const res = await request(app)
                                .patch(`/notes/${noteId}`)
                                .set("Authorization", `Bearer ${token}`)
                                .send({
                                    content: "New note",
                                    mood: "🔥"
                                });

            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Note updated successfully");
            expect(res.body.note.title).to.equal("Grocery List");
            expect(res.body.note.content).to.equal("New note");
            expect(res.body.note.mood).to.equal("🔥");
        });

        it("Should not let user update someone else's note", async () => {
            const noteRes = await request(app)
                                .post("/notes")
                                .set("Authorization", `Bearer ${token}`)
                                .send({
                                    title: "Grocery List",
                                    content: "q-tips"
                                });
            const noteId = noteRes.body.note._id;
            
            const secondUser = await request(app)
                                        .post("/auth/register")
                                        .send({
                                            username: "someone",
                                            email: "someone@test.com",
                                            password: "password123"
                                        });
            const secondToken = secondUser.body.token;

            const res = await request(app)
                                .patch(`/notes/${noteId}`)
                                .set("Authorization", `Bearer ${secondToken}`)
                                .send({
                                    content: "New note"
                                });

            expect(res.status).to.equal(403);
            expect(res.body.error).to.equal("You do not have permission to edit this note.");
        });
    });

// =================================
// shareNote Tests

describe("PATCH /notes/:id/share", () => {
    it("Should allow owner to share a note with another user", async () => {
      const noteRes = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Shared Note",
          content: "This is shared content",
        });

      const noteId = noteRes.body.note._id;

      const secondUser = await request(app)
        .post("/auth/register")
        .send({
          username: "vieweruser",
          email: "viewer@test.com",
          password: "password123",
        });

        const secondUserFromDb = await User.findOne({ email: "viewer@test.com" });
        const secondUserId = secondUserFromDb._id;

      const res = await request(app)
        .patch(`/notes/${noteId}/share`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          login: "viewer@test.com",
          permission: "view",
        });

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("Note shared successfully.");
      expect(res.body.note.sharedWith.length).to.equal(1);
      expect(res.body.note.sharedWith[0].permission).to.equal("view");
    });

    it("Should allow shared viewer to view the note", async () => {
      const noteRes = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Viewer Note",
          content: "Viewer can read this",
        });

      const noteId = noteRes.body.note._id;

      const secondUser = await request(app)
        .post("/auth/register")
        .send({
          username: "vieweruser",
          email: "viewer@test.com",
          password: "password123",
        });

        const secondUserFromDb = await User.findOne({ email: "viewer@test.com" });
        const secondUserId = secondUserFromDb._id;
      
      const secondToken = secondUser.body.token;

      await request(app)
        .patch(`/notes/${noteId}/share`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          login: "viewer@test.com",
          permission: "view",
        });

      const res = await request(app)
        .get("/notes")
        .set("Authorization", `Bearer ${secondToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.notes).to.be.an("array");
      expect(res.body.notes.length).to.equal(1);
      expect(res.body.notes[0].title).to.equal("Viewer Note");
      expect(res.body.notes[0].content).to.equal("Viewer can read this");
    });

    it("Should not allow shared viewer to edit the note", async () => {
      const noteRes = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Viewer Cannot Edit",
          content: "Original content",
        });

      const noteId = noteRes.body.note._id;

      const secondUser = await request(app)
        .post("/auth/register")
        .send({
          username: "vieweruser",
          email: "viewer@test.com",
          password: "password123",
        });

        const secondUserFromDb = await User.findOne({ email: "viewer@test.com" });
        const secondUserId = secondUserFromDb._id;
      const secondToken = secondUser.body.token;

      await request(app)
        .patch(`/notes/${noteId}/share`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          login: "viewer@test.com",
          permission: "view",
        });

      const res = await request(app)
        .patch(`/notes/${noteId}`)
        .set("Authorization", `Bearer ${secondToken}`)
        .send({
          content: "Viewer tried to edit",
        });

      expect(res.status).to.equal(403);
      expect(res.body.error).to.equal(
        "You do not have permission to edit this note."
      );
    });

    it("Should allow shared editor to edit the note", async () => {
      const noteRes = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Editor Can Edit",
          content: "Original content",
        });

      const noteId = noteRes.body.note._id;

      const secondUser = await request(app)
        .post("/auth/register")
        .send({
          username: "editoruser",
          email: "editor@test.com",
          password: "password123",
        });

        const secondUserFromDb = await User.findOne({ email: "editor@test.com" });
        const secondUserId = secondUserFromDb._id;
      const secondToken = secondUser.body.token;

      await request(app)
        .patch(`/notes/${noteId}/share`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          login: "editor@test.com",
          permission: "edit",
        });

      const res = await request(app)
        .patch(`/notes/${noteId}`)
        .set("Authorization", `Bearer ${secondToken}`)
        .send({
          content: "Editor updated this",
        });

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("Note updated successfully");
      expect(res.body.note.content).to.equal("Editor updated this");
    });
  });

// =================================
    describe("DELETE /notes/:id", () => {
        it("Should allow owner to delete notes", async () => {
            const noteRes = await request(app)
                                .post("/notes")
                                .set("Authorization", `Bearer ${token}`)
                                .send({
                                    title: "Grocery List",
                                    content: "q-tips"
                                });
            const noteId = noteRes.body.note._id;
            
            const res = await request(app)
                                .delete(`/notes/${noteId}`)
                                .set("Authorization", `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Note deleted successfully");

            const deletedNote = await Note.findById(noteId);

            expect(deletedNote).to.equal(null);
        });

        it("Should not let user delete someone else's note", async () => {
            const noteRes = await request(app)
                                .post("/notes")
                                .set("Authorization", `Bearer ${token}`)
                                .send({
                                    title: "Grocery List",
                                    content: "q-tips"
                                });
            const noteId = noteRes.body.note._id;
            
            const secondUser = await request(app)
                                        .post("/auth/register")
                                        .send({
                                            username: "someone",
                                            email: "someone@test.com",
                                            password: "password123"
                                        });
            const secondToken = secondUser.body.token;

            const res = await request(app)
                                .delete(`/notes/${noteId}`)
                                .set("Authorization", `Bearer ${secondToken}`);

            expect(res.status).to.equal(403);
            expect(res.body.error).to.equal("You can only delete your own notes.");
        });
    });
});