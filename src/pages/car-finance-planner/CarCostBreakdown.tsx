
import React from 'react';
import type { CarTab, CarFinanceBreakdown, Unit } from './types';

interface CarCostBreakdownProps {
  car: CarTab;
  outputUnit: Unit;
  setOutputUnit: (unit: Unit) => void;
  forecastRows: Array<{ year: number; residualValue: number; maintenance: number; depreciation: number; finance: number; cost: number; totalCost: number }>;
}

const getValue = (val: number, outputUnit: Unit) => outputUnit === 'year' ? val : val / 12;

export const CarCostBreakdown: React.FC<CarCostBreakdownProps> = ({ car, outputUnit, setOutputUnit, forecastRows }) => {
  if (!car.result) return null;

  return (
    <div className="breakdown">
      <h2>Car Cost Breakdown</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span>Show as</span>
        <button type="button" style={{ minWidth: 70, fontWeight: outputUnit === 'year' ? 700 : 400 }} onClick={() => setOutputUnit('year')}>Yearly</button>
        <button type="button" style={{ minWidth: 70, fontWeight: outputUnit === 'month' ? 700 : 400 }} onClick={() => setOutputUnit('month')}>Monthly</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>{car.label} (£/{outputUnit === 'year' ? 'yr' : 'mo'})</th>
          </tr>
        </thead>
        <tbody>
          {['finance', 'fuel', 'roadTax', 'servicing', 'insurance', 'total'].map((field) => (
            <tr key={field} style={field === 'total' ? { fontWeight: 600 } : {}}>
              <td>
                {field === 'finance' ? 'Finance' :
                 field === 'fuel' ? 'Fuel' :
                 field === 'roadTax' ? 'Road Tax' :
                 field === 'servicing' ? 'Servicing/Repairs' :
                 field === 'insurance' ? 'Insurance' :
                 'Total'}
              </td>
              <td>
                {car.result ?
                  getValue(car.result[field as keyof CarFinanceBreakdown], outputUnit).toLocaleString(undefined, { maximumFractionDigits: 2 }) :
                  '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Forecast Table */}
      {forecastRows.length > 0 && (
        <>
          <h3 style={{ marginTop: '2rem', marginBottom: '1.2rem' }}>Car Cost Forecast</h3>
          <table style={{ marginTop: '0.5rem' }}>
            <thead>
              <tr>
                <th>Year</th>
                <th>Residual Value (£)</th>
                <th>Depreciation (£)</th>
                <th>Maintenance (£)</th>
                <th>Finance (£)</th>
                <th>Year Cost (£)</th>
                <th>Total Cost (£)</th>
              </tr>
            </thead>
            <tbody>
              {forecastRows.map((row, index) => (
                <tr key={row.year}>
                  <td>{index + 1}</td>
                  <td>{row.residualValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td>{row.depreciation.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td>{row.maintenance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td>{row.finance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td>{row.cost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td>{row.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};
