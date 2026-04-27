export default function StatCard({ title, value, note, tone = "default" }) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <p>{title}</p>
      <h3>{value}</h3>
      {note ? <span>{note}</span> : null}
    </article>
  );
}
