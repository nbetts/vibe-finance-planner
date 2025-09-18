// HICBC result display component
import { calculateHICBC } from './salaryCalculations';

const HICBCResult: React.FC<{ netIncome: number; config: import('./types').TaxYearConfig }> = ({ netIncome, config }) => {
  const children = 1; // Could be made user-configurable
  const charge = calculateHICBC(netIncome, config, children);
  if (charge === 0) {
    return (
      <div style={{ marginTop: '1.5rem', color: 'var(--primary)' }}>
        <strong>No High Income Child Benefit Charge applies.</strong>
      </div>
    );
  }
  return (
    <div style={{ marginTop: '1.5rem', color: 'var(--warning)', fontWeight: 500 }}>
      <strong>Estimated yearly HICBC, assuming 1 child: £{charge.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong><br />
    </div>
  );
};

export default HICBCResult;
