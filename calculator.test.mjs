import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateApit, calculateSalary } from "./calculator.mjs";

const CASES = [
  { grossSalary: 150000, apit: 0, employeeEpf: 12000, netPay: 137975 },
  { grossSalary: 200000, apit: 3000, employeeEpf: 16000, netPay: 180975 },
  { grossSalary: 300000, apit: 18500, employeeEpf: 24000, netPay: 257475 },
  { grossSalary: 500000, apit: 86000, employeeEpf: 40000, netPay: 373975 },
];

describe("Sri Lanka salary reference calculation", () => {
  for (const expected of CASES) {
    it(`matches the published LKR ${expected.grossSalary} test case`, () => {
      const actual = calculateSalary({
        grossSalary: expected.grossSalary,
      });

      assert.equal(actual.apit, expected.apit);
      assert.equal(actual.employeeEpf, expected.employeeEpf);
      assert.equal(actual.netPay, expected.netPay);
    });
  }

  it("supports a separate EPF/ETF eligible earnings base", () => {
    const actual = calculateSalary({
      grossSalary: 200000,
      epfEtfEarningsBase: 150000,
    });

    assert.equal(actual.apit, 3000);
    assert.equal(actual.employeeEpf, 12000);
    assert.equal(actual.employerEpf, 18000);
    assert.equal(actual.employerEtf, 4500);
    assert.equal(actual.netPay, 184975);
  });

  it("rejects invalid inputs", () => {
    assert.throws(() => calculateApit(Number.NaN), TypeError);
    assert.throws(
      () =>
        calculateSalary({
          grossSalary: 100000,
          epfEtfEarningsBase: 110000,
        }),
      RangeError
    );
  });
});
