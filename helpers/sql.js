const { BadRequestError } = require("../expressError");

/** Formats data for use in a SQL update
 *
 * Args:
 *
 * dataToUpdate
 *    {firstName: "Hedy", lastName: "Lamarr"}
 *
 * jsToSql
 * (used to ensure column names are consistent with how they're formatted in the database (snake_case) rather than JS (camelCase) wherever that might be an issue)
 *   {firstName: "first_name", lastName: "last_name", "isAdmin": "is_admin"}
 *
 * Returns {setCols: "first_name, last_name", values: ["Hedy", "Lamarr"]}
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
