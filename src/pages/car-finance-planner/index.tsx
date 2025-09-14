import { useState } from 'react';
import { useLocalStorage } from '../../hooks';
import { calculateCarFinanceBreakdown } from './carFinanceCalculations';
import type { CarFinanceBreakdown } from './types';
import { MONTHS_PER_YEAR } from '../../constants';
import { Link } from 'react-router-dom';

export default function CarFinancePlanner() {
  const [finance, setFinance] = useLocalStorage<string>('carFinance.finance', '');
  const [financeUnit, setFinanceUnit] = useLocalStorage<'year' | 'month'>('carFinance.financeUnit', 'year');
  const [mileage, setMileage] = useLocalStorage<string>('carFinance.mileage', '12000');
  const [mileageUnit, setMileageUnit] = useLocalStorage<'year' | 'month'>('carFinance.mileageUnit', 'year');
  const [fuelType, setFuelType] = useLocalStorage<'unleaded' | 'electric'>('carFinance.fuelType', 'unleaded');
  const [fuelCost, setFuelCost] = useLocalStorage<string>('carFinance.fuelCost', fuelType === 'unleaded' ? '135' : '8.5');
  const [fuelEfficiency, setFuelEfficiency] = useLocalStorage<string>('carFinance.fuelEfficiency', fuelType === 'unleaded' ? '40' : '3.5');
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
      roadTax: String(toYearly(roadTax, roadTaxUnit)),
      servicing: String(toYearly(servicing, servicingUnit)),
      insurance: String(toYearly(insurance, insuranceUnit)),
      mileage,
      mileageUnit,
      fuelType,
      fuelCost,
      fuelEfficiency,
    });
    setResult(breakdown);
    setShowResult(true);
  };

  const handleReset = () => {
    setFinance('');
    setFinanceUnit('year');
    setMileage('12000');
    setMileageUnit('year');
    setFuelType('unleaded');
    setFuelCost('135');
    setFuelEfficiency('40');
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
          <label htmlFor="mileage">Mileage (miles/{mileageUnit}):</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <input
              id="mileage"
              type="number"
              min="0"
              value={mileage}
              onChange={e => setMileage(e.target.value)}
              placeholder="e.g. 12000"
              style={{ flex: 1 }}
            />
            <button type="button" aria-label="Toggle mileage unit" style={{ minWidth: 70 }} onClick={() => setMileageUnit(mileageUnit === 'year' ? 'month' : 'year')}>
              {mileageUnit === 'year' ? 'Yearly' : 'Monthly'}
            </button>
          </div>
          <label htmlFor="fuelType">Fuel Type:</label>
          <select
            id="fuelType"
            value={fuelType}
            onChange={e => {
              const type = e.target.value as 'unleaded' | 'electric';
              setFuelType(type);
              setFuelCost(type === 'unleaded' ? '135' : '8.5');
              setFuelEfficiency(type === 'unleaded' ? '40' : '3.5');
            }}
            style={{ marginBottom: '0.5rem', maxWidth: 200 }}
          >
            <option value="unleaded">Unleaded</option>
            <option value="electric">Electric</option>
          </select>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="fuelCost">Fuel Cost ({fuelType === 'unleaded' ? 'pence/litre' : 'pence/kWh'}):</label>
              <input
                id="fuelCost"
                type="number"
                min="0"
                step="any"
                value={fuelCost}
                onChange={e => setFuelCost(e.target.value)}
                placeholder={fuelType === 'unleaded' ? '135' : '8.5'}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="fuelEfficiency">Fuel Efficiency ({fuelType === 'unleaded' ? 'MPG' : 'miles/kWh'}):</label>
              <input
                id="fuelEfficiency"
                type="number"
                min="0"
                step="any"
                value={fuelEfficiency}
                onChange={e => setFuelEfficiency(e.target.value)}
                placeholder={fuelType === 'unleaded' ? '40' : '3.5'}
                style={{ width: '100%' }}
              />
            </div>
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
