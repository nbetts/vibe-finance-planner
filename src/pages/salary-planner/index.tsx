import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '../../hooks';
import { calculateBreakdown } from './salaryCalculations';
import { TAX_YEARS } from './constants';
import type { TaxYearConfig } from './types';
import type { SalaryBreakdown } from './types';
import { v4 as uuidv4 } from 'uuid';
import HICBCResult from './HICBCResult';


// Salary tab type
type SalaryTabInputs = {
  label: string;
  salary: string;
  includeStudentLoan: boolean;
  pensionPercent: string;
  extraSalarySacrifice: string;
  extraSalarySacrificeUnit: 'year' | 'month';
  taxYearKey: string;
  includeHICBC: boolean;
};

type SalaryTab = {
  id: string;
  inputs: SalaryTabInputs;
  breakdown: SalaryBreakdown | null;
};

function createBlankSalaryTab(label: string): SalaryTab {
  return {
    id: uuidv4(),
    inputs: {
      label,
      salary: '',
      includeStudentLoan: true,
      pensionPercent: '15',
  extraSalarySacrifice: '0',
  extraSalarySacrificeUnit: 'year',
      taxYearKey: '2025_26',
      includeHICBC: false,
    },
    breakdown: null,
  };
}

function SalaryPlanner() {
  // Helper to parse and convert values
  const parse = (v: string) => {
    const n = Number(v);
    return isNaN(n) || v.trim() === '' ? 0 : n;
  };
  const toYearly = (val: string, unit: 'year' | 'month') => unit === 'month' ? parse(val) * 12 : parse(val);
  const [tabs, setTabs] = useLocalStorage<SalaryTab[]>('salaryPlanner.tabs', [createBlankSalaryTab('Salary 1')]);
  const [activeTab, setActiveTab] = useLocalStorage<number>('salaryPlanner.activeTab', 0);

  const tab = tabs[activeTab];
  const taxYearConfig: TaxYearConfig = TAX_YEARS[tab.inputs.taxYearKey];

  // Recalculate breakdown whenever any input changes
  useEffect(() => {
    const gross = Number(tab.inputs.salary);
    const pension = tab.inputs.pensionPercent.trim() === '' ? undefined : Number(tab.inputs.pensionPercent) / 100;
    const extraSalarySacrifice = toYearly(tab.inputs.extraSalarySacrifice, tab.inputs.extraSalarySacrificeUnit);
    let newBreakdown: SalaryBreakdown | null = null;
    if (
      gross > 0 &&
      !isNaN(gross) &&
      (tab.inputs.pensionPercent.trim() === '' || (!isNaN(Number(tab.inputs.pensionPercent)) && Number(tab.inputs.pensionPercent) >= 0)) &&
      (tab.inputs.extraSalarySacrifice.trim() === '' || (!isNaN(Number(tab.inputs.extraSalarySacrifice)) && Number(tab.inputs.extraSalarySacrifice) >= 0))
    ) {
      newBreakdown = calculateBreakdown(gross, taxYearConfig, {
        includeStudentLoan: tab.inputs.includeStudentLoan,
        pensionRate: pension,
        extraSalarySacrifice,
      });
    }
    const newTabs = tabs.map((t, i) => i === activeTab ? { ...t, breakdown: newBreakdown } : t);
    setTabs(newTabs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab.inputs.salary, tab.inputs.includeStudentLoan, tab.inputs.pensionPercent, tab.inputs.extraSalarySacrifice, tab.inputs.extraSalarySacrificeUnit, tab.inputs.taxYearKey]);

  // Tab bar handlers
  const handleAddTab = () => {
    const newTabs = [...tabs, createBlankSalaryTab(`Salary ${tabs.length + 1}`)];
    setTabs(newTabs);
    setActiveTab(newTabs.length - 1);
  };
  const handleDeleteTab = (idx: number) => {
    if (tabs.length === 1) {
      // Reset the only tab
      const newTabs = tabs.map((t, i) => i === idx ? createBlankSalaryTab(t.inputs.label) : t);
      setTabs(newTabs);
      return;
    }
    const newTabs = tabs.filter((_, i) => i !== idx);
    setTabs(newTabs);
    setActiveTab(idx > 0 ? idx - 1 : 0);
  };
  const handleTabLabelChange = (idx: number, label: string) => {
    const newTabs = tabs.map((t, i) => i === idx ? { ...t, inputs: { ...t.inputs, label } } : t);
    setTabs(newTabs);
  };

  // Input change handler
  const updateTabInputs = (field: keyof SalaryTabInputs, value: string | boolean) => {
    const newTabs = tabs.map((t, i) => i === activeTab ? { ...t, inputs: { ...t.inputs, [field]: value } } : t);
    setTabs(newTabs);
  };

  return (
    <div className="planner-container">
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>&larr; Back to Home</Link>
      </div>
      <h1>Salary Planner</h1>
      {/* Tab bar UI */}
      <div className="car-tabs-bar">
        {tabs.map((tab, idx) => (
          <div
            key={tab.id}
            className={`car-tab${idx === activeTab ? ' active' : ''}`}
            onClick={() => setActiveTab(idx)}
            tabIndex={0}
            onKeyDown={e => {
              if ((e.key === 'Enter' || e.key === ' ') && activeTab !== idx) setActiveTab(idx);
            }}
            draggable
            onDragStart={e => {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', String(idx));
            }}
            onDragOver={e => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={e => {
              e.preventDefault();
              const fromIdx = Number(e.dataTransfer.getData('text/plain'));
              if (fromIdx === idx || isNaN(fromIdx)) return;
              const newTabs = [...tabs];
              const [moved] = newTabs.splice(fromIdx, 1);
              newTabs.splice(idx, 0, moved);
              setTabs(newTabs as SalaryTab[]);
              // Update activeTab if needed
              if (activeTab === fromIdx) setActiveTab(idx);
              else if (activeTab > fromIdx && activeTab <= idx) setActiveTab(activeTab - 1);
              else if (activeTab < fromIdx && activeTab >= idx) setActiveTab(activeTab + 1);
            }}
            style={{ cursor: 'grab' }}
          >
            <span className="car-tab-label" style={{ fontWeight: idx === activeTab ? 700 : 400 }}>
              {tab.inputs.label}
            </span>
            <button
              type="button"
              className="delete-tab-btn"
              aria-label="Delete tab"
              onClick={e => { e.stopPropagation(); handleDeleteTab(idx); }}
              tabIndex={-1}
            >
              ×
            </button>
          </div>
        ))}
        <button type="button" aria-label="Add salary" className="add-tab-btn" onClick={handleAddTab}>+</button>
      </div>
      <div className="planner-view">
        <form
          className="salary-input"
          autoComplete="off"
          onSubmit={e => e.preventDefault()}
        >
          <div className="salary-input-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.7rem' }}>
            <label htmlFor="tab-label">Name</label>
            <input
              id="tab-label"
              type="text"
              value={tab.inputs.label}
              onChange={e => handleTabLabelChange(activeTab, e.target.value)}
              placeholder="e.g. Salary 1"
              style={{ marginBottom: '0.7rem', maxWidth: 200 }}
            />
            <label htmlFor="taxYear">Tax Year</label>
            <select
              id="taxYear"
              value={tab.inputs.taxYearKey}
              onChange={e => updateTabInputs('taxYearKey', e.target.value)}
            >
              {Object.entries(TAX_YEARS).map(([key, config]) => (
                <option key={key} value={key}>{config.yearLabel}</option>
              ))}
            </select>
            <label htmlFor="salary">Annual Salary (£)</label>
            <input
              id="salary"
              type="number"
              min="0"
              value={tab.inputs.salary}
              onChange={e => updateTabInputs('salary', e.target.value)}
              placeholder="e.g. 40000"
            />
            <label htmlFor="studentLoanToggle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                id="studentLoanToggle"
                type="checkbox"
                checked={tab.inputs.includeStudentLoan}
                onChange={e => updateTabInputs('includeStudentLoan', e.target.checked)}
              />
              Include Student Loan (Plan 2)
            </label>
            <label htmlFor="pensionPercent">Pension % (salary sacrifice)</label>
            <input
              id="pensionPercent"
              type="number"
              min="0"
              max="100"
              step="1"
              value={tab.inputs.pensionPercent}
              onChange={e => {
                let val = e.target.value;
                if (val !== '' && (isNaN(Number(val)) || Number(val) < 0)) val = '0';
                if (Number(val) > 100) val = '100';
                updateTabInputs('pensionPercent', val);
              }}
              placeholder="e.g. 15"
            />
            <label htmlFor="extraSalarySacrifice">Extra Salary Sacrifice (£/{tab.inputs.extraSalarySacrificeUnit})</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                id="extraSalarySacrifice"
                type="number"
                min="0"
                step="1"
                value={tab.inputs.extraSalarySacrifice}
                onChange={e => {
                  let val = e.target.value;
                  if (val !== '' && (isNaN(Number(val)) || Number(val) < 0)) val = '0';
                  updateTabInputs('extraSalarySacrifice', val);
                }}
                placeholder="e.g. 2000"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                aria-label="Toggle extra salary sacrifice unit"
                style={{ minWidth: 70 }}
                onClick={() => {
                  updateTabInputs('extraSalarySacrificeUnit', tab.inputs.extraSalarySacrificeUnit === 'year' ? 'month' : 'year');
                }}
              >
                {tab.inputs.extraSalarySacrificeUnit === 'year' ? 'Yearly' : 'Monthly'}
              </button>
            </div>
            <label htmlFor="hicbcToggle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                id="hicbcToggle"
                type="checkbox"
                checked={!!tab.inputs.includeHICBC}
                onChange={e => updateTabInputs('includeHICBC', e.target.checked)}
              />
              Include High Income Child Benefit Charge (HICBC)
            </label>
          </div>
        </form>
        {tab.breakdown && (
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
                  <td>£{tab.breakdown.gross.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.grossMonthly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.grossWeekly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.grossDaily.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                </tr>
                <tr>
                  <td>Pension</td>
                  <td>£{tab.breakdown.pension.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.pensionMonthly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.pensionWeekly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.pensionDaily.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                </tr>
                <tr>
                  <td>Extra Salary Sacrifice</td>
                  <td>£{tab.breakdown.extraSalarySacrifice.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.extraSalarySacrificeMonthly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.extraSalarySacrificeWeekly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.extraSalarySacrificeDaily.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                </tr>
                <tr>
                  <td>Taxable Income</td>
                  <td>£{tab.breakdown.taxableIncome.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.taxableIncomeMonthly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.taxableIncomeWeekly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.taxableIncomeDaily.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                </tr>
                <tr>
                  <td>Income Tax</td>
                  <td>£{tab.breakdown.tax.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.taxMonthly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.taxWeekly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.taxDaily.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                </tr>
                <tr>
                  <td colSpan={5}>
                    <details>
                      <summary>Tax Breakdown</summary>
                      <ul>
                        <li>Personal Allowance: £{tab.breakdown.taxBreakdown.personalAllowance.toLocaleString(undefined, {maximumFractionDigits:2})}</li>
                        <li>Basic Rate: £{tab.breakdown.taxBreakdown.basic.toLocaleString(undefined, {maximumFractionDigits:2})}</li>
                        <li>Higher Rate: £{tab.breakdown.taxBreakdown.higher.toLocaleString(undefined, {maximumFractionDigits:2})}</li>
                        <li>Additional Rate: £{tab.breakdown.taxBreakdown.additional.toLocaleString(undefined, {maximumFractionDigits:2})}</li>
                      </ul>
                    </details>
                  </td>
                </tr>
                <tr>
                  <td>National Insurance</td>
                  <td>£{tab.breakdown.ni.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.niMonthly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.niWeekly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.niDaily.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                </tr>
                <tr>
                  <td>Student Loan (Plan 2)</td>
                  <td>£{tab.breakdown.studentLoan.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.studentLoanMonthly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.studentLoanWeekly.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                  <td>£{tab.breakdown.studentLoanDaily.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                </tr>
                <tr>
                  <td><strong>Take Home</strong></td>
                  <td><strong>£{tab.breakdown.takeHome.toLocaleString(undefined, {maximumFractionDigits:2})}</strong></td>
                  <td><strong>£{tab.breakdown.takeHomeMonthly.toLocaleString(undefined, {maximumFractionDigits:2})}</strong></td>
                  <td><strong>£{tab.breakdown.takeHomeWeekly.toLocaleString(undefined, {maximumFractionDigits:2})}</strong></td>
                  <td><strong>£{tab.breakdown.takeHomeDaily.toLocaleString(undefined, {maximumFractionDigits:2})}</strong></td>
                </tr>
              </tbody>
            </table>
            {tab.inputs.includeHICBC && (
              <HICBCResult
                netIncome={tab.breakdown.takeHome + tab.breakdown.tax + tab.breakdown.ni + tab.breakdown.studentLoan}
                config={taxYearConfig}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SalaryPlanner;
