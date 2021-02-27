"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   * Returns { id, title, salary, equity, company_handle }
   *
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, companyHandle, companyName }, ...]
   * */

  static async findAll() {
    const jobList = await db.query(
      `SELECT j.id,
            j.title,
            j.salary,
            j.equity,
            j.company_handle AS "companyHandle",
            c.name AS "companyName"
        FROM jobs j 
        LEFT JOIN companies AS c ON c.handle = j.company_handle`
    );
    return jobList.rows;
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity,companyHandle, companyName }
   *
   * Throws NotFoundError if not found.
   **/
  static async get(id) {
    const jobRes = await db.query(
      `SELECT j.id,
            j.title,
            j.salary,
            j.equity,
            j.company_handle AS "companyHandle",
            c.name AS "companyName"
        FROM jobs j 
        LEFT JOIN companies AS c ON c.handle = j.company_handle
        WHERE j.id = $1`,
      [id]
    );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM job
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}

module.exports = Job;
