"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowIcon } from "../components/SiteShell";
import { trackSiteEvent } from "../lib/analytics";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const startedAt = useRef(0);
  const submissionId = useRef("");

  useEffect(() => {
    startedAt.current = Date.now();
    submissionId.current = crypto.randomUUID();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    const service = String(payload.service || "");
    const stage = String(payload.stage || "");

    setStatus("submitting");
    setMessage("");
    trackSiteEvent("contact_form_submit_started", {
      service: service || "not_provided",
      stage: stage || "not_provided",
    });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          startedAt: startedAt.current,
          submissionId: submissionId.current || crypto.randomUUID(),
        }),
      });
      const result = await response.json() as { ok?: boolean; message?: string; inquiryId?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "We could not send the inquiry. Please try again.");
      }

      setStatus("success");
      setMessage("Your inquiry is in. We sent a confirmation to your email and will reply from info@blackmountain.tech.");
      trackSiteEvent("generate_lead", {
        service: service || "not_provided",
        stage: stage || "not_provided",
        company_provided: Boolean(payload.company),
        location_provided: Boolean(payload.location),
      });
      formElement.reset();
      startedAt.current = Date.now();
      submissionId.current = crypto.randomUUID();
    } catch (error) {
      const fallback = "We could not send the inquiry. Your information is still in the form—please try again or email info@blackmountain.tech.";
      setStatus("error");
      setMessage(error instanceof Error ? error.message : fallback);
      trackSiteEvent("contact_form_error", {
        service: service || "not_provided",
        stage: stage || "not_provided",
      });
    }
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <span>PROJECT INQUIRY / 001</span>
        <h2>Tell us where the project stands.</h2>
        <p>A few useful details are enough to start. We can sort out the deeper technical questions together.</p>
      </div>

      <div className="form-grid">
        <label className="form-honeypot" aria-hidden="true">
          <span>Website</span>
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <label>
          <span>Name <i>Required</i></span>
          <input name="name" autoComplete="name" maxLength={120} required />
        </label>
        <label>
          <span>Work email <i>Required</i></span>
          <input name="email" type="email" autoComplete="email" maxLength={254} required />
        </label>
        <label>
          <span>Company</span>
          <input name="company" autoComplete="organization" maxLength={160} />
        </label>
        <label>
          <span>Project location</span>
          <input name="location" placeholder="City, state" autoComplete="address-level2" maxLength={160} />
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
          <input name="timing" placeholder="A date, milestone, or general timeframe" maxLength={200} />
        </label>
        <label className="form-span-two">
          <span>What is the project, and where is the uncertainty? <i>Required</i></span>
          <textarea
            name="details"
            rows={7}
            placeholder="A short description of the system, the deliverable you need, and the problem your team is trying to solve."
            maxLength={5000}
            required
          />
        </label>
      </div>

      {message && (
        <div className={`form-status form-status-${status}`} role={status === "error" ? "alert" : "status"} aria-live="polite">
          <strong>{status === "success" ? "Inquiry received." : "The form did not send."}</strong>
          <p>{message}</p>
          {status === "error" && <a href="mailto:info@blackmountain.tech">Email BMT directly <ArrowIcon /></a>}
        </div>
      )}

      <div className="form-submit-row">
        <p>Your information goes directly to BMT. We will also email you a copy of the next-step confirmation.</p>
        <button className="button button-primary" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending inquiry…" : "Send project inquiry"} <ArrowIcon />
        </button>
      </div>
    </form>
  );
}
