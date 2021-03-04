"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForJobFilter } = require("../helpers/sql");

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

  /** Filter selected jobs.
   * criteria can include { title, minSalary, hasEquity }
   * Will match results that contain whatever is given as "title", case-insensitive, not just exact matches
   * Returns [{ id, title, salary, equity, companyHandle, companyName }, ...]
   * */
  static async filter(criteria) {
    const sqlized = sqlForJobFilter(criteria);
    const jobsRes = await db.query(
      `SELECT j.id,
            j.title,
            j.salary,
            j.equity,
            j.company_handle AS "companyHandle",
            c.name AS "companyName"
        FROM jobs j 
        LEFT JOIN companies AS c ON c.handle = j.company_handle
        WHERE ${sqlized.filterClause}`,
      sqlized.values
    );
    if (jobsRes.rows.length === 0) {
      return false;
    }
    return jobsRes.rows;
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

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id,
                                title,
                                salary,
                                equity,
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No company: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const job = result.rows[0];

    if (!job) {
      throw new NotFoundError(`No job: ${id}`);
    }
  }
}

module.exports = Job;
