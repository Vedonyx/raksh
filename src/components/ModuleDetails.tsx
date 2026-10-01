import { consultationCurriculum } from "../lib/consultation-curriculum";

export default function ModuleDetails({ index }: { index: number }) {
  const curriculum = consultationCurriculum[index];
  return <details className="module-details" id={`module-${String(index + 1).padStart(2, "0")}-details`}>
    <summary><span>Read more: the full module<small>Preparation, every call and what you take away</small></span><b aria-hidden="true">+</b></summary>
    <div className="module-details__content">
      <div className="module-details__prep"><p className="eyebrow">YOUR STARTING POINT</p><h3>{curriculum.promise}</h3><p>Before the first call, we ask you to share the context below through the pre-call assessment.</p><ul>{curriculum.preparation.map(item => <li key={item}>{item}</li>)}</ul></div>
      {curriculum.days.map((day, i) => <section className={`module-details__day${day.revenue ? " module-details__day--revenue" : ""}`} key={day.name}>
        <p className="eyebrow">DAY {String(i + 1).padStart(2, "0")} / {day.name}</p><h3>{day.question}</h3><p>{day.intro}</p><h4>What we work through</h4><ul>{day.topics.map(topic => <li key={topic}>{topic}</li>)}</ul>
        {day.revenue && <><h4>Included: my real creator revenue breakdown</h4><p>I share actual numbers from selected videos I have created, and walk you through the business behind them.</p><ul>{day.revenue.map(item => <li key={item}>{item}</li>)}</ul></>}
        <div className="module-details__outcomes"><h4>What you take away</h4><ul>{day.outcomes.map(outcome => <li key={outcome}>{outcome}</li>)}</ul></div>
      </section>)}
    </div>
  </details>;
}
