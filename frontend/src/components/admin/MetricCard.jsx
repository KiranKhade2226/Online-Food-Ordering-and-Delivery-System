export default function MetricCard({ label, value, hint, tone = 'default' }) {
  return (
    <article className={`admin-metric-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </article>
  );
}