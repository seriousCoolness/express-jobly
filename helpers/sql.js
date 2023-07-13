const { BadRequestError } = require("../expressError");

/** Takes json data and a js-to-sql name dictionary, 
 * and returns the data as sql column names and values.
 * Use this to make table updating less of a hassle.
 * Returns { setCols, values } */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // Maps the json data to sql column names and parameter values using the jsToSql dict.
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
