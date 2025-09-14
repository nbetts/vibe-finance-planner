import { useState } from 'react';
import { useLocalStorage } from '../../hooks';
import { calculateCarFinanceBreakdown } from './carFinanceCalculations';
import type { CarFinanceBreakdown } from './types';
import { MONTHS_PER_YEAR } from '../../constants';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// Car form and tab state types
type Unit = 'year' | 'month';
type FuelType = 'unleaded' | 'electric';
interface CarFormInputs {
  finance: string;
  financeUnit: Unit;
  mileage: string;
  mileageUnit: Unit;
  fuelType: FuelType;
  fuelCost: string;
  fuelEfficiency: string;
  roadTax: string;
  roadTaxUnit: Unit;
  servicing: string;
  servicingUnit: Unit;
  insurance: string;
  insuranceUnit: Unit;
}
interface CarTab {
  id: string;
  label: string;
  inputs: CarFormInputs;
  result: CarFinanceBreakdown | null;
}

export default function CarFinancePlanner() {
  // Helper to create a blank car form
  const createBlankCar = (label: string): CarTab => ({
    id: uuidv4(),
    label,
    inputs: {
      finance: '',
      financeUnit: 'year',
      mileage: '',
      mileageUnit: 'year',
      fuelType: 'unleaded',
      fuelCost: '135',
      fuelEfficiency: '40',
      roadTax: '',
      roadTaxUnit: 'year',
      servicing: '',
      servicingUnit: 'year',
      insurance: '',
      insuranceUnit: 'year',
    },
    result: null,
  });

  // Use useLocalStorage for persistence
  const [cars, setCars] = useLocalStorage<CarTab[]>(
    'carFinancePlanner.cars',
    [createBlankCar('Car 1')]
  );
  const [activeTab, setActiveTab] = useLocalStorage<number>(
    'carFinancePlanner.activeTab',
    0
  );
  const [outputUnit, setOutputUnit] = useState<'year' | 'month'>('year');

  const handleAddTab = () => {
    const newCars = [...cars, createBlankCar(`Car ${cars.length + 1}`)];
    setCars(newCars);
    setActiveTab(newCars.length - 1); // focus new tab
  };
  const handleDeleteTab = (idx: number) => {
    if (cars.length === 1) {
      // Reset the only tab
      const newCars = cars.map((car, i) => i === idx ? createBlankCar(car.label) : car);
      setCars(newCars);
      return;
    }
    const newCars = cars.filter((_, i) => i !== idx);
    setCars(newCars);
    setActiveTab(idx > 0 ? idx - 1 : 0);
  };
  const handleTabLabelChange = (idx: number, label: string) => {
    const newCars = cars.map((car, i) => i === idx ? { ...car, label } : car);
    setCars(newCars);
  };

  const car = cars[activeTab];

  const getValue = (val: number) => outputUnit === 'year' ? val : val / 12;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parse = (v: string) => {
      const n = Number(v);
      return isNaN(n) || v.trim() === '' ? 0 : n;
    };
    const toYearly = (val: string, unit: 'year' | 'month') => unit === 'month' ? parse(val) * MONTHS_PER_YEAR : parse(val);
    const breakdown = calculateCarFinanceBreakdown({
      finance: String(toYearly(car.inputs.finance, car.inputs.financeUnit)),
      roadTax: String(toYearly(car.inputs.roadTax, car.inputs.roadTaxUnit)),
      servicing: String(toYearly(car.inputs.servicing, car.inputs.servicingUnit)),
      insurance: String(toYearly(car.inputs.insurance, car.inputs.insuranceUnit)),
      mileage: car.inputs.mileage,
      mileageUnit: car.inputs.mileageUnit,
      fuelType: car.inputs.fuelType,
      fuelCost: car.inputs.fuelCost,
      fuelEfficiency: car.inputs.fuelEfficiency,
    });
  const newCars = cars.map((c, i) => i === activeTab ? { ...c, result: breakdown } : c);
  setCars(newCars);
  };

  const handleReset = () => {
  const newCars = cars.map((car, i) => i === activeTab ? createBlankCar(car.label) : car);
  setCars(newCars);
  };

  return (
    <div className="planner-container">
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>&larr; Back to Home</Link>
      </div>
      <h1>Car Finance Planner</h1>
      {/* Tab bar UI */}
      <div className="car-tabs-bar">
        {cars.map((car, idx) => (
          <div
            key={car.id}
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
              const newCars = [...cars];
              const [moved] = newCars.splice(fromIdx, 1);
              newCars.splice(idx, 0, moved);
              setCars(newCars as CarTab[]);
              // Update activeTab if needed
              if (activeTab === fromIdx) setActiveTab(idx);
              else if (activeTab > fromIdx && activeTab <= idx) setActiveTab(activeTab - 1);
              else if (activeTab < fromIdx && activeTab >= idx) setActiveTab(activeTab + 1);
            }}
            style={{ cursor: 'grab' }}
          >
            <span className="car-tab-label" style={{ fontWeight: idx === activeTab ? 700 : 400 }}>
              {car.label}
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
        <button type="button" aria-label="Add car" className="add-tab-btn" onClick={handleAddTab}>+</button>
      </div>
      <form className="salary-input" onSubmit={handleSubmit} autoComplete="off">
        <div className="salary-input-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.7rem' }}>
          <label htmlFor="car-label">Name</label>
          <input
            id="car-label"
            type="text"
            value={car.label}
            onChange={e => handleTabLabelChange(activeTab, e.target.value)}
            placeholder="e.g. Car 1"
            style={{ marginBottom: '0.7rem', maxWidth: 200 }}
          />
          <label htmlFor="finance">Finance (£/{car.inputs.financeUnit})</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              id="finance"
              type="number"
              min="0"
              value={car.inputs.finance}
              onChange={e => {
                const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, finance: e.target.value } } : c);
                setCars(newCars as CarTab[]);
              }}
              placeholder="e.g. 3000"
              style={{ flex: 1 }}
            />
            <button type="button" aria-label="Toggle finance unit" style={{ minWidth: 70 }} onClick={() => {
              const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, financeUnit: (c.inputs.financeUnit === 'year' ? 'month' : 'year') as Unit } } : c);
              setCars(newCars as CarTab[]);
            }}>
              {car.inputs.financeUnit === 'year' ? 'Yearly' : 'Monthly'}
            </button>
          </div>
          <label htmlFor="mileage">Mileage (miles/{car.inputs.mileageUnit})</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <input
              id="mileage"
              type="number"
              min="0"
              value={car.inputs.mileage}
              onChange={e => {
                const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, mileage: e.target.value } } : c);
                setCars(newCars as CarTab[]);
              }}
              placeholder="e.g. 12000"
              style={{ flex: 1 }}
            />
            <button type="button" aria-label="Toggle mileage unit" style={{ minWidth: 70 }} onClick={() => {
              const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, mileageUnit: (c.inputs.mileageUnit === 'year' ? 'month' : 'year') as Unit } } : c);
              setCars(newCars as CarTab[]);
            }}>
              {car.inputs.mileageUnit === 'year' ? 'Yearly' : 'Monthly'}
            </button>
          </div>
          <label htmlFor="fuelType">Fuel Type</label>
          <select
            id="fuelType"
            value={car.inputs.fuelType}
            onChange={e => {
              const type = e.target.value as FuelType;
              const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, fuelType: type, fuelCost: type === 'unleaded' ? '135' : '8.5', fuelEfficiency: type === 'unleaded' ? '40' : '3.5' } } : c);
              setCars(newCars as CarTab[]);
            }}
            style={{ marginBottom: '0.5rem', maxWidth: 200 }}
          >
            <option value="unleaded">Unleaded</option>
            <option value="electric">Electric</option>
          </select>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="fuelCost">Fuel Cost ({car.inputs.fuelType === 'unleaded' ? 'pence/litre' : 'pence/kWh'})</label>
              <input
                id="fuelCost"
                type="number"
                min="0"
                step="any"
                value={car.inputs.fuelCost}
                onChange={e => {
                  const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, fuelCost: e.target.value } } : c);
                  setCars(newCars as CarTab[]);
                }}
                placeholder={car.inputs.fuelType === 'unleaded' ? '135' : '8.5'}
                style={{ width: '90%' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="fuelEfficiency">Fuel Efficiency ({car.inputs.fuelType === 'unleaded' ? 'MPG' : 'miles/kWh'})</label>
              <input
                id="fuelEfficiency"
                type="number"
                min="0"
                step="any"
                value={car.inputs.fuelEfficiency}
                onChange={e => {
                  const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, fuelEfficiency: e.target.value } } : c);
                  setCars(newCars as CarTab[]);
                }}
                placeholder={car.inputs.fuelType === 'unleaded' ? '40' : '3.5'}
                style={{ width: '90%' }}
              />
            </div>
          </div>
          <label htmlFor="roadTax">Road Tax (£/{car.inputs.roadTaxUnit})</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              id="roadTax"
              type="number"
              min="0"
              value={car.inputs.roadTax}
              onChange={e => {
                const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, roadTax: e.target.value } } : c);
                setCars(newCars as CarTab[]);
              }}
              placeholder="e.g. 180"
              style={{ flex: 1 }}
            />
            <button type="button" aria-label="Toggle road tax unit" style={{ minWidth: 70 }} onClick={() => {
              const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, roadTaxUnit: (c.inputs.roadTaxUnit === 'year' ? 'month' : 'year') as Unit } } : c);
              setCars(newCars as CarTab[]);
            }}>
              {car.inputs.roadTaxUnit === 'year' ? 'Yearly' : 'Monthly'}
            </button>
          </div>
          <label htmlFor="servicing">Servicing/Repairs (£/{car.inputs.servicingUnit})</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              id="servicing"
              type="number"
              min="0"
              value={car.inputs.servicing}
              onChange={e => {
                const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, servicing: e.target.value } } : c);
                setCars(newCars as CarTab[]);
              }}
              placeholder="e.g. 400"
              style={{ flex: 1 }}
            />
            <button type="button" aria-label="Toggle servicing unit" style={{ minWidth: 70 }} onClick={() => {
              const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, servicingUnit: (c.inputs.servicingUnit === 'year' ? 'month' : 'year') as Unit } } : c);
              setCars(newCars as CarTab[]);
            }}>
              {car.inputs.servicingUnit === 'year' ? 'Yearly' : 'Monthly'}
            </button>
          </div>
          <label htmlFor="insurance">Insurance (£/{car.inputs.insuranceUnit})</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              id="insurance"
              type="number"
              min="0"
              value={car.inputs.insurance}
              onChange={e => {
                const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, insurance: e.target.value } } : c);
                setCars(newCars as CarTab[]);
              }}
              placeholder="e.g. 600"
              style={{ flex: 1 }}
            />
            <button type="button" aria-label="Toggle insurance unit" style={{ minWidth: 70 }} onClick={() => {
              const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, insuranceUnit: (c.inputs.insuranceUnit === 'year' ? 'month' : 'year') as Unit } } : c);
              setCars(newCars as CarTab[]);
            }}>
              {car.inputs.insuranceUnit === 'year' ? 'Yearly' : 'Monthly'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.7rem' }}>
            <button type="submit">Calculate</button>
            <button type="button" onClick={handleReset} style={{ background: 'var(--border)', color: 'var(--text)' }}>Reset</button>
          </div>
        </div>
      </form>
      {cars.length > 0 && cars[activeTab].result && (
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
                {cars.map(car => (
                  <th key={car.id}>{car.label} (£/{outputUnit === 'year' ? 'yr' : 'mo'})</th>
                ))}
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
                  {cars.map(car => (
                    <td key={car.id}>
                      {car.result ?
                        getValue(car.result[field as keyof CarFinanceBreakdown]).toLocaleString(undefined, { maximumFractionDigits: 2 }) :
                        '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
// NOTE: If uuid is not installed, run: npm install uuid
