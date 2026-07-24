export default function ResourceHero({ number, kicker, title, emphasis, description }: {
  number: string;
  kicker: string;
  title: string;
  emphasis: string;
  description: string;
}) {
  return (
    <section className="questionnaire-hero">
      <div>
        <p className="eyebrow"><span /> BMT resource {number} · {kicker}</p>
        <h1>{title}<br /><em>{emphasis}</em></h1>
      </div>
      <div className="questionnaire-hero-copy">
        <p>{description}</p>
        <span>Work in the browser · Print or save as PDF · Saves on this device</span>
      </div>
    </section>
  );
}
