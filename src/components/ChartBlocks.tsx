interface MetricTileProps {
  label: string;
  value: string | number;
  accent?: 'blue' | 'green' | 'yellow' | 'pink';
}

const accentMap: Record<NonNullable<MetricTileProps['accent']>, string> = {
  blue: 'metric-tile metric-tile--blue',
  green: 'metric-tile metric-tile--green',
  yellow: 'metric-tile metric-tile--yellow',
  pink: 'metric-tile metric-tile--pink',
};

export function MetricTile({ label, value, accent = 'blue' }: MetricTileProps) {
  return (
    <div className={accentMap[accent]}>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

interface BarChartRow {
  label: string;
  value: number;
  max: number;
}

export function BarChartCard({
  title,
  rows,
}: {
  title: string;
  rows: BarChartRow[];
}) {
  return (
    <section className="panel-card">
      <div className="panel-card__eyebrow">{title}</div>
      <div className="bar-chart">
        {rows.map((row) => (
          <div key={row.label} className="bar-chart__row">
            <span>{row.label}</span>
            <div className="bar-chart__track">
              <div
                className="bar-chart__fill"
                style={{ width: `${Math.max(8, (row.value / Math.max(row.max, 1)) * 100)}%` }}
              />
            </div>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
