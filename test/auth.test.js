process.env.NODE_ENV = "test";

require("dotenv").config();

const request = require("supertest");
    // simulate http requests
const chai = require("chai");
const mongoose = require("mongoose");

const User = require("../models/User");
const app = require("../app");

require("../db");

const expect = chai.expect;


beforeEach(async () => {
    await User.deleteMany({});
});

after(async () => {
    await mongoose.connection.close();
});


describe("Auth Routes", () => {

    describe("POST /auth/register", () => {
        it("should register a new user", async () => {
            const res = await request(app)
                                .post("/auth/register")
                                .send({
                                    username: "testuser",
                                    email: "test@test.com",
                                    password: "password123"
                                });
            expect(res.status).to.equal(201);
            expect(res.body).to.have.property("token");
            expect(res.body.message).to.equal("User registered successfully");
        });
    });


    describe("POST /auth/login", () => {
        it("should login existing user with username", async () => {
            await request(app)
                    .post("/auth/register")
                    .send({
                        username: "testuser",
                        email: "test@test.com",
                        password: "password123"
                    });

            const res = await request(app)
                                .post("/auth/login")
                                .send({
                                    login: "testuser",
                                    password: "password123"
                                });
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("token");
            expect(res.body.message).to.equal("Login successful");
        });

        it("should login existing user with email", async () => {
            await request(app)
                    .post("/auth/register")
                    .send({
                        username: "testuser",
                        email: "test@test.com",
                        password: "password123"
                    });

            const res = await request(app)
                                .post("/auth/login")
                                .send({
                                    login: "test@test.com",
                                    password: "password123"
                                });
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("token");
            expect(res.body.message).to.equal("Login successful");
        });

        it("should reject invalid login", async () => {
            await request(app)
                    .post("/auth/register")
                    .send({
                        username: "testuser",
                        email: "test@test.com",
                        password: "password123"
                    });

            const res = await request(app)
                                .post("/auth/login")
                                .send({
                                    login: "wronguser",
                                    password: "password123"
                                });
            expect(res.status).to.equal(401);
            expect(res.body.error).to.equal("Invalid credentials");
        });
        
        it("should reject invalid password", async () => {
            await request(app)
                    .post("/auth/register")
                    .send({
                        username: "testuser",
                        email: "test@test.com",
                        password: "password123"
                    });

            const res = await request(app)
                                .post("/auth/login")
                                .send({
                                    login: "testuser",
                                    password: "wrongpassword"
                                });
            expect(res.status).to.equal(401);
            expect(res.body.error).to.equal("Invalid credentials");
        });
    });
});