"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

// const companyNewSchema = require("../schemas/companyNew.json");
// const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();

/** POST / { job } => { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */
router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const job = await Job.create(req.body);
    console.log(job);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET / => { jobs: [ {id, title, salary, equity, companyHandle, companyName }, ...] }
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
  } catch (err) {
    return next(err);
  }
});

/** GET /[id] => { job }
 * job is { id, title, salary, equity, companyHandle, companyName }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] { field1, field2, ...} => { job }
 *
 * Updates job data
 *
 * fields can be: { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id] => { deleted: id }
 * Authorization: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
