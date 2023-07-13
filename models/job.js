"use strict";

const db = require("../db");

const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
} = require("../expressError");

class Job {
    /**Job class.
    * Bottom Text. */

    static async create({ title, salary, equity, company_handle }) {
        const duplicateCheck = await db.query(
              `SELECT title
               FROM jobs
               WHERE title = $1`,
            [title]);
    
        if (duplicateCheck.rows[0])
          throw new BadRequestError(`Duplicate job: ${title}`);

          const result = await db.query(
            `INSERT INTO jobs
             (title, salary, equity, company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING title, salary, equity, company_handle`,
          [
            title,
            salary,
            equity,
            company_handle
          ],
      );
      const job = result.rows[0];
  
      return job;
    }

    /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, company_handle }, ...]
   * */
    static async findAll() {
        
        const result = await db.query("SELECT * FROM jobs ORDER BY title");

        return result.rows;
    }

    static async findAllFor(handle) {
        
        const result = await db.query("SELECT id, title, salary, equity FROM jobs ORDER BY title WHERE company_handle=$1",[handle]);

        return result.rows;
    }

    static async get(id) {
        const result = await db.query('SELECT * FROM jobs WHERE id=$1',[id]);

        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;
    }


    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
              title: "title",
              salary: "salary",
              equity: "equity",
            });
        const idVarIdx = "$" + (values.length + 1);
    
        const querySql = `UPDATE jobs 
                          SET ${setCols} 
                          WHERE id = ${idVarIdx} 
                          RETURNING id, 
                                    title, 
                                    salary, 
                                    equity, 
                                    company_handle`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];
    
        if (!job) throw new NotFoundError(`No job: ${id}`);
    
        return job;
      }
}

module.exports = Job;