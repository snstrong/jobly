const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate, sqlForCompanyFilter } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("works: handles good request", function () {
    let data = { firstName: "Hedy", lastName: "Lamarr" };
    let colNames = { firstName: "first_name", lastName: "last_name" };
    let result = sqlForPartialUpdate(data, colNames);
    expect(result).toEqual({
      setCols: '"first_name"=$1, "last_name"=$2',
      values: ["Hedy", "Lamarr"],
    });
  });
  test("works: handles bad request (no data)", function () {
    try {
      sqlForPartialUpdate({}, {});
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("sqlForCompanyFilter", function () {
  test("works: returns false if no data", function () {
    let result = sqlForCompanyFilter({});
    expect(result).toBe(false);
  });
  test("works: Throws error if too many fields", function () {
    let filterCriteria = {
      name: "Hedy",
      minEmployees: 1,
      maxEmployees: 2,
      extraField: "is here",
    };
    expect(() => sqlForCompanyFilter(filterCriteria)).toThrow(
      "Too many fields"
    );
  });
  test("works: handles good request", function () {
    let filterCriteria = { name: "Hedy", minEmployees: 1, maxEmployees: 2 };
    let results = sqlForCompanyFilter(filterCriteria);
    expect(results.filterClause).toEqual(
      "name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3"
    );
    expect(results.values).toEqual(["Hedy", 1, 2]);
  });
  test("works: handles request with bad field", function () {
    let filterCriteria = { name: "Hedy", minEmployees: 1, mxxxxxxEmployees: 2 };
    //   expect(() => compileAndroidCode()).toThrow(Error);
    expect(() => sqlForCompanyFilter(filterCriteria)).toThrow(
      `Unaccepted field: mxxxxxxEmployees`
    );
  });
});
