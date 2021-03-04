const e = require("cors");
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

/** Formats data for use in filtering companies
 *
 * filterCriteria: {name, minEmployees, maxEmployees}
 * returns {filterClause: "", values: []}
 */

function sqlForCompanyFilter(filterCriteria) {
  const keys = Object.keys(filterCriteria);
  if (keys.length === 0) {
    return false;
  }
  if (keys.length > 3) {
    throw new BadRequestError("Too many fields");
  }
  let filterArr = [];
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === "name") {
      filterArr.push(`name ILIKE $${i + 1}`);
      filterCriteria.name = `%${filterCriteria.name}%`;
    } else if (keys[i] === "minEmployees") {
      filterArr.push(`num_employees >= $${i + 1}`);
    } else if (keys[i] === "maxEmployees") {
      filterArr.push(`num_employees <= $${i + 1}`);
    } else {
      throw new BadRequestError(`Unaccepted field: ${keys[i]}`);
    }
  }

  return {
    filterClause: filterArr.join(" AND "),
    values: Object.values(filterCriteria),
  };
}

function sqlForJobFilter(filterCriteria) {
  const keys = Object.keys(filterCriteria);
  if (keys.length === 0) {
    return false;
  }
  if (keys.length > 3) {
    throw new BadRequestError("Too many fields");
  }
  let filterArr = [];
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === "title") {
      filterArr.push(`title ILIKE $${i + 1}`);
      filterCriteria.title = `%${filterCriteria.title}%`;
    } else if (keys[i] === "minSalary") {
      if (parseInt(filterCriteria.minSalary)) {
        filterArr.push(`salary >= $${i + 1}`);
      } else {
        throw new BadRequestError(
          `Unaccepted value for minSalary: ${filterCriteria.minSalary}`
        );
      }
    } else if (keys[i] === "hasEquity") {
      if (filterCriteria.hasEquity === "true") {
        filterArr.push(`equity > 0`);
        filterCriteria.hasEquity = true;
      } else if (filterCriteria.hasEquity === "false") {
        filterCriteria.hasEquity = false;
      } else {
        throw new BadRequestError(
          `Unaccepted value for hasEquity: ${filterCriteria.hasEquity}`
        );
      }
    } else {
      throw new BadRequestError(`Unaccepted field: ${keys[i]}`);
    }
  }
  const filterVals = Object.values(filterCriteria);
  const values = filterVals.filter((val) => !(typeof val === "boolean"));

  return {
    filterClause: filterArr.join(" AND "),
    values: values,
  };
}

module.exports = { sqlForPartialUpdate, sqlForCompanyFilter, sqlForJobFilter };
