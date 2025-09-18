import { useState } from 'react';
import { useLocalStorage } from '../../hooks';
import { calculateCarFinanceBreakdown } from './carFinanceCalculations';
import { forecastCarValues } from './carFinanceCalculations';
import type { CarFinanceBreakdown } from './types';
import { CarCostBreakdown } from './CarCostBreakdown';
import { MONTHS_PER_YEAR } from '../../constants';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import CarCostGraph from './CarCostGraph';

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
  extra: string;
  extraUnit: Unit;
  oneOff: string;
  ownershipType?: 'Owned' | 'Lease' | 'PCP' | 'HP';
  currentCarValue?: string;
  currentAge?: string;
  currentMileage?: string;
  financeYearsRemaining?: string;
  balloonPayment?: string;
}
interface CarTab {
  id: string;
  label: string;
  inputs: CarFormInputs;
  result: CarFinanceBreakdown | null;
}

const COLORS = [
  '#0074D9', '#FF4136', '#2ECC40', '#FF851B', '#B10DC9', '#FFDC00', '#001f3f', '#39CCCC', '#01FF70', '#F012BE'
];

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
      extra: '',
      extraUnit: 'year',
      oneOff: '',
      ownershipType: 'Owned',
      balloonPayment: '',
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



  // Helper to parse and convert values
  const parse = (v: string) => {
    const n = Number(v);
    return isNaN(n) || v.trim() === '' ? 0 : n;
  };
  const toYearly = (val: string, unit: 'year' | 'month') => unit === 'month' ? parse(val) * MONTHS_PER_YEAR : parse(val);

  // Recalculate result whenever inputs change
  const updateCarResult = (newCars: CarTab[], idx: number) => {
    const car = newCars[idx];
    const financeValue = car.inputs.ownershipType === 'Owned' ? '0' : car.inputs.finance;
    const breakdown = calculateCarFinanceBreakdown({
      finance: String(toYearly(financeValue, car.inputs.financeUnit)),
      roadTax: String(toYearly(car.inputs.roadTax, car.inputs.roadTaxUnit)),
      servicing: String(toYearly(car.inputs.servicing, car.inputs.servicingUnit)),
      insurance: String(toYearly(car.inputs.insurance, car.inputs.insuranceUnit)),
      extra: String(toYearly(car.inputs.extra, car.inputs.extraUnit)),
      mileage: car.inputs.mileage,
      mileageUnit: car.inputs.mileageUnit,
      fuelType: car.inputs.fuelType,
      fuelCost: car.inputs.fuelCost,
      fuelEfficiency: car.inputs.fuelEfficiency,
      ownershipType: car.inputs.ownershipType,
      balloonPayment: car.inputs.balloonPayment,
    });
    return newCars.map((c, i) => i === idx ? { ...c, result: breakdown } : c);
  };


  const getYearlyMaintenanceCost = (carTab: CarTab) => {
    if (!carTab.result) return 0;
    return carTab.result.roadTax + carTab.result.fuel + carTab.result.servicing + carTab.result.insurance + (carTab.result.extra ?? 0);
  };

  const calculateForecastRows = (car: CarTab) => {
    let forecastRows: Array<{ year: number; residualValue: number; maintenance: number; depreciation: number; finance: number; cost: number; totalCost: number }> = [];
    let currentValue = car.inputs.currentCarValue?.trim() || '';
    let currentAge = car.inputs.currentAge?.trim() || '';
    let currentMileage = car.inputs.currentMileage?.trim() || '';
    let financeYears = car.inputs.financeYearsRemaining?.trim() || '';
    const forecastLength = 10;
    if (car.inputs.ownershipType === 'Owned') {
      financeYears = '0';
    }
    if (car.inputs.ownershipType === 'Lease') {
      currentValue = '0';
      currentAge = '0';
      currentMileage = '0';
      financeYears = String(forecastLength); // Lease always matches forecast length
    }
    if (
      currentValue !== '' &&
      currentAge !== '' &&
      currentMileage !== '' &&
      !isNaN(Number(currentValue)) &&
      !isNaN(Number(currentAge)) &&
      !isNaN(Number(currentMileage))
    ) {
      const value = Number(currentValue);
      const age = Number(currentAge);
      const mileage = Number(currentMileage);
      const years = financeYears !== '' && !isNaN(Number(financeYears)) ? Number(financeYears) : 0;
      const forecast = forecastCarValues(value, age, forecastLength, mileage);
      let accumulated = 0;
      let prevValue = value;
      const oneOff = car.inputs.oneOff && !isNaN(Number(car.inputs.oneOff)) ? Number(car.inputs.oneOff) : 0;
      forecastRows = forecast.map((row, idx) => {
        const maintenance = getYearlyMaintenanceCost(car);
        const depreciation = prevValue - row.value;
        prevValue = row.value;
        let finance = (car.result && idx < years) ? car.result.finance : 0;
        // Add balloon payment at the end of finance years for PCP
        if (car.inputs.ownershipType === 'PCP' && idx === years - 1) {
          finance += car.result?.balloonPayment ?? 0;
        }
        // Add one-off cost only in first year
        const yearCost = maintenance + finance + (idx === 0 ? oneOff : 0);
        accumulated += yearCost;
        return {
          year: row.age,
          residualValue: row.value,
          maintenance,
          depreciation,
          finance,
          cost: yearCost,
          totalCost: accumulated,
        };
      });
    }

    return forecastRows;
  };

  return (
    <div className="planner-container">
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>&larr; Back to Home</Link>
      </div>
      <h1>Car Finance Planner</h1>
      <p>Calculate and compare car finance options, forecast costs, and visualize total ownership over time. Instantly see breakdowns and forecasts as you adjust inputs.</p>
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
      <div className="planner-view">
        <form className="salary-input" autoComplete="off" onSubmit={e => e.preventDefault()}>
          <div className="salary-input-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.7rem' }}>
            <label htmlFor="car-label">Name</label>
            <input
              id="car-label"
              type="text"
              value={car.label}
              onChange={e => handleTabLabelChange(activeTab, e.target.value)}
              placeholder="e.g. Car 1"
              style={{ maxWidth: 200 }}
            />
            <h3 style={{ marginBottom: '1.2rem' }}>Maintenance Costs</h3>
            <label htmlFor="mileage">Mileage (miles/{car.inputs.mileageUnit})</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
              <input
                id="mileage"
                type="number"
                min="0"
                value={car.inputs.mileage}
                onChange={e => {
                  const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, mileage: e.target.value } } : c);
                  setCars(updateCarResult(newCars as CarTab[], activeTab));
                }}
                placeholder="e.g. 12000"
                style={{ flex: 1 }}
              />
              <button type="button" aria-label="Toggle mileage unit" style={{ minWidth: 70 }} onClick={() => {
                const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, mileageUnit: (c.inputs.mileageUnit === 'year' ? 'month' : 'year') as Unit } } : c);
                setCars(updateCarResult(newCars as CarTab[], activeTab));
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
                setCars(updateCarResult(newCars as CarTab[], activeTab));
              }}
              style={{ marginBottom: '0.5rem', maxWidth: 200 }}
            >
              <option value="electric">Electric</option>
              <option value="unleaded">Unleaded</option>
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
                      setCars(updateCarResult(newCars as CarTab[], activeTab));
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
                      setCars(updateCarResult(newCars as CarTab[], activeTab));
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
                  setCars(updateCarResult(newCars as CarTab[], activeTab));
                }}
                placeholder="e.g. 180"
                style={{ flex: 1 }}
              />
              <button type="button" aria-label="Toggle road tax unit" style={{ minWidth: 70 }} onClick={() => {
                const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, roadTaxUnit: (c.inputs.roadTaxUnit === 'year' ? 'month' : 'year') as Unit } } : c);
                setCars(updateCarResult(newCars as CarTab[], activeTab));
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
                  setCars(updateCarResult(newCars as CarTab[], activeTab));
                }}
                placeholder="e.g. 400"
                style={{ flex: 1 }}
              />
              <button type="button" aria-label="Toggle servicing unit" style={{ minWidth: 70 }} onClick={() => {
                const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, servicingUnit: (c.inputs.servicingUnit === 'year' ? 'month' : 'year') as Unit } } : c);
                setCars(updateCarResult(newCars as CarTab[], activeTab));
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
                  setCars(updateCarResult(newCars as CarTab[], activeTab));
                }}
                placeholder="e.g. 600"
                style={{ flex: 1 }}
              />
              <button type="button" aria-label="Toggle insurance unit" style={{ minWidth: 70 }} onClick={() => {
                const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, insuranceUnit: (c.inputs.insuranceUnit === 'year' ? 'month' : 'year') as Unit } } : c);
                setCars(updateCarResult(newCars as CarTab[], activeTab));
              }}>
                {car.inputs.insuranceUnit === 'year' ? 'Yearly' : 'Monthly'}
              </button>
            </div>
            <label htmlFor="extra">Extra costs/savings (£/{car.inputs.extraUnit}) e.g. business miles, HICBC savings</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                id="extra"
                type="number"
                min="0"
                value={car.inputs.extra}
                onChange={e => {
                  const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, extra: e.target.value } } : c);
                  setCars(updateCarResult(newCars as CarTab[], activeTab));
                }}
                placeholder="e.g. 0"
                style={{ flex: 1 }}
              />
              <button type="button" aria-label="Toggle extra unit" style={{ minWidth: 70 }} onClick={() => {
                const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, extraUnit: (c.inputs.extraUnit === 'year' ? 'month' : 'year') as Unit } } : c);
                setCars(updateCarResult(newCars as CarTab[], activeTab));
              }}>
                {car.inputs.extraUnit === 'year' ? 'Yearly' : 'Monthly'}
              </button>
            </div>
            <h3 style={{ marginBottom: '1.2rem' }}>Residual Costs</h3>
            <label htmlFor="ownershipType">Ownership Type</label>
            <select
              id="ownershipType"
              value={car.inputs.ownershipType || 'Owned'}
              onChange={e => {
                const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, ownershipType: e.target.value as 'Owned' | 'Lease' | 'PCP' | 'HP' } } : c);
                setCars(updateCarResult(newCars as CarTab[], activeTab));
              }}
              style={{ marginBottom: '0.5rem', maxWidth: 200 }}
            >
              <option value="Owned">Owned</option>
              <option value="Lease">Lease</option>
              <option value="PCP">PCP</option>
              <option value="HP">HP</option>
            </select>
            {car.inputs.ownershipType !== 'Owned' && (
              <>
                <label htmlFor="finance">Finance (£/{car.inputs.financeUnit})</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    id="finance"
                    type="number"
                    min="0"
                    value={car.inputs.finance}
                    onChange={e => {
                      const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, finance: e.target.value } } : c);
                      setCars(updateCarResult(newCars as CarTab[], activeTab));
                    }}
                    placeholder="e.g. 3000"
                    style={{ flex: 1 }}
                  />
                  <button type="button" aria-label="Toggle finance unit" style={{ minWidth: 70 }} onClick={() => {
                    const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, financeUnit: (c.inputs.financeUnit === 'year' ? 'month' : 'year') as Unit } } : c);
                    setCars(updateCarResult(newCars as CarTab[], activeTab));
                  }}>
                    {car.inputs.financeUnit === 'year' ? 'Yearly' : 'Monthly'}
                  </button>
                </div>
              </>
            )}
            {car.inputs.ownershipType !== 'Owned' && car.inputs.ownershipType !== 'Lease' && (
              <>
                <label htmlFor="financeYearsRemaining">Finance Years Remaining</label>
                <input
                  id="financeYearsRemaining"
                  type="number"
                  min="0"
                  max="10"
                  value={car.inputs.financeYearsRemaining || ''}
                  onChange={e => {
                    const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, financeYearsRemaining: e.target.value } } : c);
                    setCars(updateCarResult(newCars as CarTab[], activeTab));
                  }}
                  placeholder="e.g. 3"
                  style={{ marginBottom: '0.5rem', maxWidth: 200 }}
                />
                {car.inputs.ownershipType === 'PCP' && (
                  <>
                    <label htmlFor="balloonPayment">Balloon Payment (£ at end of term)</label>
                    <input
                      id="balloonPayment"
                      type="number"
                      min="0"
                      value={car.inputs.balloonPayment || ''}
                      onChange={e => {
                        const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, balloonPayment: e.target.value } } : c);
                        setCars(updateCarResult(newCars as CarTab[], activeTab));
                      }}
                      placeholder="e.g. 8000"
                      style={{ marginBottom: '0.5rem', maxWidth: 200 }}
                    />
                  </>
                )}
              </>
            )}
            {car.inputs.ownershipType !== 'Lease' && (
              <>
                <label htmlFor="currentCarValue">Current Car Value (£)</label>
                <input
                  id="currentCarValue"
                  type="number"
                  min="0"
                  value={car.inputs.currentCarValue || ''}
                  onChange={e => {
                    const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, currentCarValue: e.target.value } } : c);
                    setCars(updateCarResult(newCars as CarTab[], activeTab));
                  }}
                  placeholder="e.g. 15000"
                  style={{ marginBottom: '0.5rem', maxWidth: 200 }}
                />
                <label htmlFor="currentAge">Current Age (years)</label>
                <input
                  id="currentAge"
                  type="number"
                  min="0"
                  value={car.inputs.currentAge || ''}
                  onChange={e => {
                    const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, currentAge: e.target.value } } : c);
                    setCars(updateCarResult(newCars as CarTab[], activeTab));
                  }}
                  placeholder="e.g. 2"
                  style={{ marginBottom: '0.5rem', maxWidth: 200 }}
                />
                <label htmlFor="currentMileage">Current Mileage</label>
                <input
                  id="currentMileage"
                  type="number"
                  min="0"
                  value={car.inputs.currentMileage || ''}
                  onChange={e => {
                    const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, currentMileage: e.target.value } } : c);
                    setCars(updateCarResult(newCars as CarTab[], activeTab));
                  }}
                  placeholder="e.g. 30000"
                  style={{ marginBottom: '0.5rem', maxWidth: 200 }}
                />
              </>
            )}
            <label htmlFor="oneOff">One off cost/saving (£) e.g. buying/selling car</label>
            <input
              id="oneOff"
              type="number"
              min="0"
              value={car.inputs.oneOff}
              onChange={e => {
                const newCars = cars.map((c, i) => i === activeTab ? { ...c, inputs: { ...c.inputs, oneOff: e.target.value } } : c);
                setCars(updateCarResult(newCars as CarTab[], activeTab));
              }}
              placeholder="e.g. 0"
              style={{ marginBottom: '0.5rem', maxWidth: 200 }}
            />
          </div>
        </form>
        <CarCostBreakdown car={cars[activeTab]} outputUnit={outputUnit} setOutputUnit={setOutputUnit} forecastRows={calculateForecastRows(cars[activeTab])} />
      </div>
      {/* Graph of total costs over 10 years for all cars */}
      <CarCostGraph
        cars={cars.map((car, idx) => ({
          label: car.label,
          forecastRows: calculateForecastRows(car),
          color: COLORS[idx % COLORS.length],
        }))}
      />
    </div>
  );
};
