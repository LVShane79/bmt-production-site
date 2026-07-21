"use client";

import { FormEvent } from "react";
import { ArrowIcon } from "../components/SiteShell";

export function ContactForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const company = String(form.get("company") || "");
    const location = String(form.get("location") || "");
    const service = String(form.get("service") || "");
    const stage = String(form.get("stage") || "");
    const timing = String(form.get("timing") || "");
    const details = String(form.get("details") || "");

    const subject = `BMT project inquiry — ${company || name}`;
    const body = [
      "Black Mountain Technologies project inquiry",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company || "Not provided"}`,
      `Project location: ${location || "Not provided"}`,
      `Help needed: ${service}`,
      `Project stage: ${stage}`,
      `Desired timing: ${timing || "Not provided"}`,
      "",
      "Project details:",
      details,
    ].join("\n");

    window.location.href = `mailto:info@blackmountain.tech?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <span>PROJECT INQUIRY / 001</span>
        <h2>Tell us where the project stands.</h2>
        <p>A few useful details are enough to start. We can sort out the deeper technical questions together.</p>
      </div>

      <div className="form-grid">
        <label>
          <span>Name <i>Required</i></span>
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          <span>Work email <i>Required</i></span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          <span>Company</span>
          <input name="company" autoComplete="organization" />
        </label>
        <label>
          <span>Project location</span>
          <input name="location" placeholder="City, state" autoComplete="address-level2" />
        </label>
        <label>
          <span>What do you need help with? <i>Required</i></span>
          <select name="service" defaultValue="" required>
            <option value="" disabled>Select one</option>
            <option>Engineered documentation</option>
            <option>AV network design</option>
            <option>Design or drawing review</option>
            <option>Technical consulting</option>
            <option>Project management support</option>
            <option>Not sure yet</option>
          </select>
        </label>
        <label>
          <span>Project stage <i>Required</i></span>
          <select name="stage" defaultValue="" required>
            <option value="" disabled>Select one</option>
            <option>Early planning</option>
            <option>Pricing or bid</option>
            <option>Design development</option>
            <option>Construction or shop drawings</option>
            <option>In progress / field support</option>
            <option>Closeout or as-builts</option>
          </select>
        </label>
        <label className="form-span-two">
          <span>When do you need help?</span>
          <input name="timing" placeholder="A date, milestone, or general timeframe" />
        </label>
        <label className="form-span-two">
          <span>What is the project, and where is the uncertainty? <i>Required</i></span>
          <textarea
            name="details"
            rows={7}
            placeholder="A short description of the system, the deliverable you need, and the problem your team is trying to solve."
            required
          />
        </label>
      </div>

      <div className="form-submit-row">
        <p>This prepares an email in your mail app so you can review it before sending.</p>
        <button className="button button-primary" type="submit">Prepare project email <ArrowIcon /></button>
      </div>
    </form>
  );
}
