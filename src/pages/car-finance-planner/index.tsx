

import { useState } from 'react';
import { useLocalStorage } from '../../hooks';
import { calculateCarFinanceBreakdown } from './carFinanceCalculations';
import type { CarFinanceBreakdown } from './types';
import { MONTHS_PER_YEAR } from '../../constants';
import { Link } from 'react-router-dom';

export default function CarFinancePlanner() {
  const [finance, setFinance] = useLocalStorage<string>('carFinance.finance', '');
  const [financeUnit, setFinanceUnit] = useLocalStorage<'year' | 'month'>('carFinance.financeUnit', 'year');
  const [fuel, setFuel] = useLocalStorage<string>('carFinance.fuel', '');
  const [fuelUnit, setFuelUnit] = useLocalStorage<'year' | 'month'>('carFinance.fuelUnit', 'year');
  const [roadTax, setRoadTax] = useLocalStorage<string>('carFinance.roadTax', '');
  const [roadTaxUnit, setRoadTaxUnit] = useLocalStorage<'year' | 'month'>('carFinance.roadTaxUnit', 'year');
  const [servicing, setServicing] = useLocalStorage<string>('carFinance.servicing', '');
  const [servicingUnit, setServicingUnit] = useLocalStorage<'year' | 'month'>('carFinance.servicingUnit', 'year');
  const [insurance, setInsurance] = useLocalStorage<string>('carFinance.insurance', '');
  const [insuranceUnit, setInsuranceUnit] = useLocalStorage<'year' | 'month'>('carFinance.insuranceUnit', 'year');

  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<CarFinanceBreakdown>({ yearly: 0, monthly: 0, threeYear: 0 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parse = (v: string) => {
      const n = Number(v);
      return isNaN(n) || v.trim() === '' ? 0 : n;
    };
    const toYearly = (val: string, unit: 'year' | 'month') => unit === 'month' ? parse(val) * MONTHS_PER_YEAR : parse(val);
    const breakdown = calculateCarFinanceBreakdown({
      finance: String(toYearly(finance, financeUnit)),
      fuel: String(toYearly(fuel, fuelUnit)),
      roadTax: String(toYearly(roadTax, roadTaxUnit)),
      servicing: String(toYearly(servicing, servicingUnit)),
      insurance: String(toYearly(insurance, insuranceUnit)),
    });
    setResult(breakdown);
    setShowResult(true);
  };

  const handleReset = () => {
    setFinance('');
    setFinanceUnit('year');
    setFuel('');
    setFuelUnit('year');
    setRoadTax('');
    setRoadTaxUnit('year');
    setServicing('');
    setServicingUnit('year');
    setInsurance('');
    setInsuranceUnit('year');
    setResult({ yearly: 0, monthly: 0, threeYear: 0 });
    setShowResult(false);
  };

  return (
    <div className="planner-container">
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>&larr; Back to Home</Link>
      </div>
      <h1>Car Finance Planner</h1>
      <form className="salary-input" onSubmit={handleSubmit} autoComplete="off">
        <div className="salary-input-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.7rem' }}>
          <label htmlFor="finance">Finance (£/{financeUnit}):</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              id="finance"
              type="number"
              min="0"
              value={finance}
              onChange={e => setFinance(e.target.value)}
              placeholder="e.g. 3000"
              style={{ flex: 1 }}
            />
            <button type="button" aria-label="Toggle finance unit" style={{ minWidth: 70 }} onClick={() => setFinanceUnit(financeUnit === 'year' ? 'month' : 'year')}>
              {financeUnit === 'year' ? 'Yearly' : 'Monthly'}
            </button>
          </div>
          <label htmlFor="fuel">Fuel (£/{fuelUnit}):</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              id="fuel"
              type="number"
              min="0"
              value={fuel}
              onChange={e => setFuel(e.target.value)}
              placeholder="e.g. 1800"
              style={{ flex: 1 }}
            />
            <button type="button" aria-label="Toggle fuel unit" style={{ minWidth: 70 }} onClick={() => setFuelUnit(fuelUnit === 'year' ? 'month' : 'year')}>
              {fuelUnit === 'year' ? 'Yearly' : 'Monthly'}
            </button>
          </div>
          <label htmlFor="roadTax">Road Tax (£/{roadTaxUnit}):</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              id="roadTax"
              type="number"
              min="0"
              value={roadTax}
              onChange={e => setRoadTax(e.target.value)}
              placeholder="e.g. 180"
              style={{ flex: 1 }}
            />
            <button type="button" aria-label="Toggle road tax unit" style={{ minWidth: 70 }} onClick={() => setRoadTaxUnit(roadTaxUnit === 'year' ? 'month' : 'year')}>
              {roadTaxUnit === 'year' ? 'Yearly' : 'Monthly'}
            </button>
          </div>
          <label htmlFor="servicing">Servicing/Repairs (£/{servicingUnit}):</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              id="servicing"
              type="number"
              min="0"
              value={servicing}
              onChange={e => setServicing(e.target.value)}
              placeholder="e.g. 400"
              style={{ flex: 1 }}
            />
            <button type="button" aria-label="Toggle servicing unit" style={{ minWidth: 70 }} onClick={() => setServicingUnit(servicingUnit === 'year' ? 'month' : 'year')}>
              {servicingUnit === 'year' ? 'Yearly' : 'Monthly'}
            </button>
          </div>
          <label htmlFor="insurance">Insurance (£/{insuranceUnit}):</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              id="insurance"
              type="number"
              min="0"
              value={insurance}
              onChange={e => setInsurance(e.target.value)}
              placeholder="e.g. 600"
              style={{ flex: 1 }}
            />
            <button type="button" aria-label="Toggle insurance unit" style={{ minWidth: 70 }} onClick={() => setInsuranceUnit(insuranceUnit === 'year' ? 'month' : 'year')}>
              {insuranceUnit === 'year' ? 'Yearly' : 'Monthly'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.7rem' }}>
            <button type="submit">Calculate</button>
            <button type="button" onClick={handleReset} style={{ background: 'var(--border)', color: 'var(--text)' }}>Reset</button>
          </div>
        </div>
      </form>
      {showResult && (
        <div className="breakdown">
          <h2>Car Cost Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Total (£)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Yearly</td>
                <td>£{result.yearly.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td>Monthly</td>
                <td>£{result.monthly.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td>3 Years</td>
                <td>£{result.threeYear.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
