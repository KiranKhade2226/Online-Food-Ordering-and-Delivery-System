export default function SectionFrame({ title, description, children, action }) {
  return (
    <section className="admin-frame">
      <div className="admin-frame-header">
        <div>
          <span className="eyebrow eyebrow-light">{title}</span>
          <p>{description}</p>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}