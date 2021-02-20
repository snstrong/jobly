const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("handles good request", function () {
    let data = { firstName: "Hedy", lastName: "Lamarr" };
    let colNames = { firstName: "first_name", lastName: "last_name" };
    let result = sqlForPartialUpdate(data, colNames);
    expect(result).toEqual({
      setCols: '"first_name"=$1, "last_name"=$2',
      values: ["Hedy", "Lamarr"],
    });
  });
});
