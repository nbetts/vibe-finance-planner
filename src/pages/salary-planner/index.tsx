import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '../../hooks';
import { calculateBreakdown } from './salaryCalculations';
import { TAX_YEARS } from './constants';
import type { TaxYearConfig } from './types';
import type { SalaryBreakdown } from './types';

function SalaryPlanner() {
  const [salary, setSalary] = useLocalStorage<string>('salary', '');
  const [includeStudentLoan, setIncludeStudentLoan] = useLocalStorage<boolean>('includeStudentLoan', true);
  const [pensionPercent, setPensionPercent] = useLocalStorage<string>('pensionPercent', '15');
  const [breakdown, setBreakdown] = useState<SalaryBreakdown | null>(null);
  const [taxYearKey, setTaxYearKey] = useState<string>('2025_26');
  const taxYearConfig: TaxYearConfig = TAX_YEARS[taxYearKey];

  const handleCalculate = () => {
    const gross = Number(salary);
    const pension = pensionPercent.trim() === '' ? undefined : Number(pensionPercent) / 100;
    if (isNaN(gross) || gross <= 0 || (pensionPercent.trim() !== '' && (isNaN(Number(pensionPercent)) || Number(pensionPercent) < 0))) {
      setBreakdown(null);
      return;
    }
    setBreakdown(calculateBreakdown(gross, taxYearConfig, { includeStudentLoan, pensionRate: pension }));
  };

  useEffect(() => {
    const gross = Number(salary);
    const pension = pensionPercent.trim() === '' ? undefined : Number(pensionPercent) / 100;
    if (gross > 0 && !isNaN(gross) && (pensionPercent.trim() === '' || (!isNaN(Number(pensionPercent)) && Number(pensionPercent) >= 0))) {
      setBreakdown(calculateBreakdown(gross, taxYearConfig, { includeStudentLoan, pensionRate: pension }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxYearKey]);

  const handleReset = () => {
    setSalary('');
    setIncludeStudentLoan(true);
    setPensionPercent('0');
    setBreakdown(null);
  };

  return (
    <div className="planner-container">
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>&larr; Back to Home</Link>
      </div>
      <h1>Salary Planner</h1>
      <form
        className="salary-input"
        onSubmit={e => {
          e.preventDefault();
          handleCalculate();
        }}
        autoComplete="off"
      >
        <div className="salary-input-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.7rem' }}>
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
          <label htmlFor="studentLoanToggle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              id="studentLoanToggle"
              type="checkbox"
              checked={includeStudentLoan}
              onChange={e => setIncludeStudentLoan(e.target.checked)}
            />
            Include Student Loan (Plan 2)
          </label>
          <label htmlFor="pensionPercent">Pension % (salary sacrifice): </label>
          <input
            id="pensionPercent"
            type="number"
            min="0"
            max="100"
            step="1"
            value={pensionPercent}
            onChange={e => {
              let val = e.target.value;
              if (val !== '' && (isNaN(Number(val)) || Number(val) < 0)) val = '0';
              if (Number(val) > 100) val = '100';
              setPensionPercent(val);
            }}
            placeholder="e.g. 15"
          />
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={pensionPercent === '' ? 0 : Number(pensionPercent)}
            onChange={e => setPensionPercent(e.target.value)}
            style={{ width: '100%' }}
            aria-label="Pension percentage slider"
          />
          <div style={{ display: 'flex', gap: '0.7rem' }}>
            <button type="submit">Calculate</button>
            <button type="button" onClick={handleReset} style={{ background: 'var(--border)', color: 'var(--text)' }}>Reset</button>
          </div>
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
                <td>Pension</td>
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

export default SalaryPlanner;
