export default function SectionCard({ title, action, children }) {
  return (
    <section className="section-card">
      <div className="section-header">
        <h3>{title}</h3>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
