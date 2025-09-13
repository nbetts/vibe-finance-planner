

import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks';
import './App.css';
import { calculateBreakdown } from './salaryCalculations';
import { TAX_YEARS } from './constants';
import type { TaxYearConfig } from './types';
import type { SalaryBreakdown } from './types';


function App() {
  const [salary, setSalary] = useLocalStorage<string>('salary', '');
  // (localStorage logic handled by useLocalStorage hook)
  const [breakdown, setBreakdown] = useState<SalaryBreakdown | null>(null);
  const [taxYearKey, setTaxYearKey] = useState<string>('2025_26');
  const taxYearConfig: TaxYearConfig = TAX_YEARS[taxYearKey];

  // All constants imported from constants.ts


  const handleCalculate = () => {
    const gross = Number(salary);
    if (isNaN(gross) || gross <= 0) {
      setBreakdown(null);
      return;
    }
    setBreakdown(calculateBreakdown(gross, taxYearConfig));
  };

  // Auto-run calculation only on initial load if salary exists
  // Recalculate on mount or when tax year changes (if salary exists)
  useEffect(() => {
    if (salary && !isNaN(Number(salary)) && Number(salary) > 0) {
      setBreakdown(calculateBreakdown(Number(salary), taxYearConfig));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxYearKey]);

  return (
    <div className="salary-planner-container">
      <h1>UK Salary Planner</h1>
      <form
        className="salary-input"
        onSubmit={e => {
          e.preventDefault();
          handleCalculate();
        }}
        autoComplete="off"
      >
        <div className="salary-input-row">
          <label htmlFor="taxYear">Tax Year: </label>
          <select
            id="taxYear"
            value={taxYearKey}
            onChange={e => setTaxYearKey(e.target.value)}
          >
            {Object.entries(TAX_YEARS).map(([key, config]) => (
              <option key={key} value={key}>{config.yearLabel}</option>
            ))}
          </select>
          <label htmlFor="salary">Annual Salary (£): </label>
          <input
            id="salary"
            type="number"
            min="0"
            value={salary}
            onChange={e => setSalary(e.target.value)}
            placeholder="e.g. 40000"
          />
          <button type="submit">Calculate</button>
        </div>
      </form>
      {breakdown && (
        <div className="breakdown">
          <h2>Salary Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Yearly (£)</th>
                <th>Monthly (£)</th>
                <th>Weekly (£)</th>
                <th>Daily (£)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Gross Income</td>
                <td>£{breakdown.gross.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.grossMonthly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.grossWeekly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.grossDaily.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
              </tr>
              <tr>
                <td>Pension as Salary Sacrifice (15%)</td>
                <td>£{breakdown.pension.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.pensionMonthly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.pensionWeekly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.pensionDaily.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
              </tr>
              <tr>
                <td>Extra Salary Sacrifice</td>
                <td>£{breakdown.extraSalarySacrifice.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.extraSalarySacrificeMonthly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.extraSalarySacrificeWeekly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.extraSalarySacrificeDaily.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
              </tr>
              <tr>
                <td>Taxable Income</td>
                <td>£{breakdown.taxableIncome.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.taxableIncomeMonthly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.taxableIncomeWeekly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.taxableIncomeDaily.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
              </tr>
              <tr>
                <td>Income Tax</td>
                <td>£{breakdown.tax.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.taxMonthly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.taxWeekly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.taxDaily.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
              </tr>
              <tr>
                <td colSpan={5}>
                  <details>
                    <summary>Tax Breakdown</summary>
                    <ul>
                      <li>Personal Allowance: £{breakdown.taxBreakdown.personalAllowance.toLocaleString(undefined, {maximumFractionDigits:2})}</li>
                      <li>Basic Rate: £{breakdown.taxBreakdown.basic.toLocaleString(undefined, {maximumFractionDigits:2})}</li>
                      <li>Higher Rate: £{breakdown.taxBreakdown.higher.toLocaleString(undefined, {maximumFractionDigits:2})}</li>
                      <li>Additional Rate: £{breakdown.taxBreakdown.additional.toLocaleString(undefined, {maximumFractionDigits:2})}</li>
                    </ul>
                  </details>
                </td>
              </tr>
              <tr>
                <td>National Insurance</td>
                <td>£{breakdown.ni.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.niMonthly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.niWeekly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.niDaily.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
              </tr>
              <tr>
                <td>Student Loan (Plan 2)</td>
                <td>£{breakdown.studentLoan.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.studentLoanMonthly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.studentLoanWeekly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                <td>£{breakdown.studentLoanDaily.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
              </tr>
              <tr>
                <td><strong>Take Home</strong></td>
                <td><strong>£{breakdown.takeHome.toLocaleString(undefined, {maximumFractionDigits:2})}</strong></td>
                <td><strong>£{breakdown.takeHomeMonthly.toLocaleString(undefined, {maximumFractionDigits:2})}</strong></td>
                <td><strong>£{breakdown.takeHomeWeekly.toLocaleString(undefined, {maximumFractionDigits:2})}</strong></td>
                <td><strong>£{breakdown.takeHomeDaily.toLocaleString(undefined, {maximumFractionDigits:2})}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
