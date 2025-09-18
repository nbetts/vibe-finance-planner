interface CarCostGraphProps {
  cars: Array<{
    label: string;
    forecastRows: Array<{ year: number; totalCost: number }>;
    color: string;
  }>;
}

export default function CarCostGraph({ cars }: CarCostGraphProps) {
  // SVG dimensions
  const width = 700;
  const height = 320;
  const padding = 50;
  const years = Array.from({ length: 10 }, (_, i) => i + 1);
  // Find max cost for scaling
  const maxCost = Math.max(...cars.flatMap(car => car.forecastRows.map(r => r.totalCost)), 1000);
  // Axis scaling
  const xScale = (year: number) => padding + ((year - 1) / 9) * (width - 2 * padding);
  const yScale = (cost: number) => height - padding - (cost / maxCost) * (height - 2 * padding);

  return (
    <div style={{ marginTop: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 24 }}>
      <h2 style={{ marginBottom: 8 }}>Total Cost Forecast (10 Years)</h2>
      <svg width={width} height={height} style={{ background: '#f8f8f8', borderRadius: 8 }}>
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#333" strokeWidth={2} />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#333" strokeWidth={2} />
        {/* Dashed grid lines for X axis (vertical) */}
        {years.map(year => (
          <line
            key={`vgrid-${year}`}
            x1={xScale(year)}
            y1={padding}
            x2={xScale(year)}
            y2={height - padding}
            stroke="#bbb"
            strokeDasharray="5,5"
            strokeWidth={1}
          />
        ))}
        {/* Dashed grid lines for Y axis (horizontal) */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <line
            key={`hgrid-${f}`}
            x1={padding}
            y1={yScale(f * maxCost)}
            x2={width - padding}
            y2={yScale(f * maxCost)}
            stroke="#bbb"
            strokeDasharray="5,5"
            strokeWidth={1}
          />
        ))}
        {/* X axis labels */}
        {years.map(year => (
          <text key={year} x={xScale(year)} y={height - padding + 20} fontSize={13} textAnchor="middle">{year}</text>
        ))}
        <text x={width / 2} y={height - 10} fontSize={15} textAnchor="middle">Years</text>
        {/* Y axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <text key={f} x={padding - 10} y={yScale(f * maxCost) + 5} fontSize={13} textAnchor="end">£{Math.round(f * maxCost).toLocaleString()}</text>
        ))}
        <text x={padding - 30} y={padding - 10} fontSize={15} textAnchor="end">Total Cost (£)</text>
        {/* Car lines */}
        {cars.map((car) => (
          <polyline
            key={car.label}
            fill="none"
            stroke={car.color}
            strokeWidth={3}
            points={car.forecastRows.map((row, idx) => `${xScale(idx + 1)},${yScale(row.totalCost)}`).join(' ')}
          />
        ))}
      </svg>
      <div style={{ marginTop: 8, fontSize: 13, color: '#555' }}>
        <span style={{ marginRight: 16 }}><strong>Key:</strong></span>
        {cars.map((car) => (
          <span key={car.label} style={{ color: car.color, marginRight: 16 }}>
            &#9632; {car.label}
          </span>
        ))}
      </div>
    </div>
  );
}
