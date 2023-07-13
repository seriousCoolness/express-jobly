const { sqlForPartialUpdate } = require("./sql");

describe("prepareDataForUpdate", function () {
    test("works: column-name translation", function () {
        const testData = {firstName: 'Aliya', age: 32};
        const testJsToSql = {firstName: "first_name", age: "age"};
        
        const colAndValues = sqlForPartialUpdate(testData, testJsToSql);
        expect(colAndValues.setCols).toEqual(`"first_name"=$1, "age"=$2`);
        expect(colAndValues.values).toEqual(['Aliya', 32]);
    });
});