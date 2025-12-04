export function EnvStat({ title, value, unit }) {
  return (
    <div className="env-stat">
      <div className="env-title">{title}</div>
      <div className="env-value">
        {value ?? "--"} <span>{unit}</span>
      </div>
    </div>
  );
}
