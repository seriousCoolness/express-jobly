"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const job = require("../models/job");

const db = require("../db");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { id, name, description, numEmployees, logoUrl }
 *
 * Returns { id, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {

    const job = await job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { jobs: [ { id, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minSalary
 * - maxEmployees
 * - titleLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    //get filters
    const { titleLike, minSalary, hasEquity } = req.query;
    
    //set up base sql query
    let sqlQuery = `SELECT * FROM jobs`;
    let sqlArgs = [];
    if(minSalary)
    {
      sqlArgs.push(minSalary); //add filter's value for use in query call later

      if(sqlArgs.length == 1) { sqlQuery += ` WHERE `; } //add a 'where' if this is the first
      
      sqlQuery += `num_employees > $${sqlArgs.length}`;
    }
    if(hasEquity)
    {

      sqlArgs.push(hasEquity);

      if(sqlArgs.length == 1) { sqlQuery += ` WHERE `; }
      else if(sqlArgs.length >= 2) { sqlQuery += ` AND `; }

      sqlQuery += `equity = $${sqlArgs.length}`;
    }
    if(titleLike)
    {
      sqlArgs.push(`%${titleLike}%`);

      if(sqlArgs.length == 1) { sqlQuery += ` WHERE `; }
      else if(sqlArgs.length >= 2) { sqlQuery += ` AND `; }

      sqlQuery += `title ILIKE $${sqlArgs.length}`;
    }
    const jobs = await db.query(sqlQuery, sqlArgs);
    return res.json({ jobs: jobs.rows });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  =>  { job }
 *
 *  job is { id, title, salary, equity, company_handle }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const job = await job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: login
 */

router.patch("/:id", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {

    const job = await job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: login
 */

router.delete("/:id", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    await job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
