"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u4Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "Jr Dev",
    salary: 60000,
    equity: "0",
    companyHandle: "c1",
  };

  test("works for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: { ...newJob, id: expect.any(Number) },
    });
  });

  // TODO: FAILS FOR UNAUTH USER (LOGGED IN BUT NOT ADMIN, ANON)
});

/************************************** GET /jobs */

/************************************** GET /jobs/:id */

/************************************** PATCH /jobs/:id */

/************************************** DELETE /jobs/:id */
