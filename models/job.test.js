"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  test("works", async function () {
    const newJob = {
      title: "Software Engineer",
      salary: 60000,
      equity: "0.1",
      companyHandle: "c1",
    };

    let job = await Job.create(newJob);
    expect(job).toEqual({ ...newJob, id: expect.any(Number) });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE id=$1`,
      [job.id]
    );
    expect(result.rows).toEqual([{ ...newJob, id: expect.any(Number) }]);
  });
});
/************************************** find all */

describe("findAll", () => {
  test("works", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "Job1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: expect.any(Number),
        title: "Job2",
        salary: 200,
        equity: "0.2",
        companyHandle: "c2",
        companyName: "C2",
      },
      {
        id: expect.any(Number),
        title: "Job3",
        salary: 300,
        equity: "0",
        companyHandle: "c3",
        companyName: "C3",
      },
      {
        id: expect.any(Number),
        title: "Job4",
        salary: null,
        equity: null,
        companyHandle: "c1",
        companyName: "C1",
      },
    ]);
  });
});

/************************************** filter */
describe("filter", function () {
  test("works: filters based on title", async function () {
    let criterion = { title: "J" };
    let filteredJobs = await Job.filter(criterion);
    expect(filteredJobs).toEqual([
      {
        id: expect.any(Number),
        title: "Job1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: expect.any(Number),
        title: "Job2",
        salary: 200,
        equity: "0.2",
        companyHandle: "c2",
        companyName: "C2",
      },
      {
        id: expect.any(Number),
        title: "Job3",
        salary: 300,
        equity: "0",
        companyHandle: "c3",
        companyName: "C3",
      },
      {
        id: expect.any(Number),
        title: "Job4",
        salary: null,
        equity: null,
        companyHandle: "c1",
        companyName: "C1",
      },
    ]);
  });
  test("works: filters based on minSalary", async function () {
    let criterion = { minSalary: 101 };
    let filteredJobs = await Job.filter(criterion);
    expect(filteredJobs).toEqual([
      {
        id: expect.any(Number),
        title: "Job2",
        salary: 200,
        equity: "0.2",
        companyHandle: "c2",
        companyName: "C2",
      },
      {
        id: expect.any(Number),
        title: "Job3",
        salary: 300,
        equity: "0",
        companyHandle: "c3",
        companyName: "C3",
      },
    ]);
  });
  test("works: filters based on hasEquity", async function () {
    let criterion = { hasEquity: "true" };
    let filteredJobs = await Job.filter(criterion);
    expect(filteredJobs).toEqual([
      {
        id: expect.any(Number),
        title: "Job1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: expect.any(Number),
        title: "Job2",
        salary: 200,
        equity: "0.2",
        companyHandle: "c2",
        companyName: "C2",
      },
    ]);
  });
  test("works: filters based on all 3 criteria", async function () {
    let criteria = {
      title: "J",
      minSalary: 99,
      hasEquity: "true",
    };
    let filteredJobs = await Job.filter(criteria);
    expect(filteredJobs).toEqual([
      {
        id: expect.any(Number),
        title: "Job1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: expect.any(Number),
        title: "Job2",
        salary: 200,
        equity: "0.2",
        companyHandle: "c2",
        companyName: "C2",
      },
    ]);
  });
  test("returns false for no matched results", async function () {
    let criteria = {
      title: "Queen of the World",
    };
    let filteredJobs = await Job.filter(criteria);
    expect(filteredJobs).toBe(false);
  });
});
/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(testJobIds[0]);
    expect(job).toEqual({
      id: testJobIds[0],
      title: "Job1",
      salary: 100,
      equity: "0.1",
      companyHandle: "c1",
      companyName: "C1",
    });
  });
  test("not found if no such job", async function () {
    try {
      await Job.get(865);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "New",
    salary: 600000,
    equity: "0.5",
  };
  test("works", async function () {
    let job = await Job.update(testJobIds[0], updateData);
    expect(job).toEqual({
      id: testJobIds[0],
      companyHandle: "c1",
      ...updateData,
    });
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE id=$1`,
      [testJobIds[0]]
    );
    expect(result.rows).toEqual([
      {
        id: testJobIds[0],
        companyHandle: "c1",
        ...updateData,
      },
    ]);
  });
  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New Job",
      salary: 70000,
      equity: null,
    };
    let job = await Job.update(testJobIds[0], updateDataSetNulls);
    expect(job).toEqual({
      id: testJobIds[0],
      companyHandle: "c1",
      ...updateDataSetNulls,
    });
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE id=$1`,
      [testJobIds[0]]
    );
    expect(result.rows).toEqual([
      {
        id: testJobIds[0],
        companyHandle: "c1",
        ...updateDataSetNulls,
      },
    ]);
  });
  test("not found if no such company", async function () {
    try {
      const maxSQLSafeInt = 2147483647;
      await Job.update(maxSQLSafeInt, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("fails: no data in request", async function () {
    try {
      await Job.update(testJobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** delete */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(testJobIds[0]);
    const res = await db.query(
      `SELECT id FROM jobs WHERE id ='${testJobIds[0]}'`
    );
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(testJobIds[testJobIds.length + 999]);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
