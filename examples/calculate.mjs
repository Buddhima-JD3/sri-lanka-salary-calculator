import { calculateSalary } from "../calculator.mjs";

const grossSalary = Number(process.argv[2] || 200000);
const epfEtfEarningsBase = Number(process.argv[3] || grossSalary);

const result = calculateSalary({ grossSalary, epfEtfEarningsBase });
console.log(JSON.stringify(result, null, 2));
