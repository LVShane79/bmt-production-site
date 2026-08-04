import { NextRequest } from "next/server";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import { ProjectAcknowledgementEmail } from "../../emails/ProjectAcknowledgementEmail";
import { ProjectInquiry, ProjectInquiryEmail } from "../../emails/ProjectInquiryEmail";

export const runtime = "nodejs";

const services = new Set([
  "Engineered documentation",
  "AV network design",
  "Design or drawing review",
  "Technical consulting",
  "Project management support",
  "Not sure yet",
]);

const stages = new Set([
  "Early planning",
  "Pricing or bid",
  "Design development",
  "Construction or shop drawings",
  "In progress / field support",
  "Closeout or as-builts",
]);

type RateLimitEntry = { count: number; resetAt: number };

declare global {
  var bmtContactRateLimits: Map<string, RateLimitEntry> | undefined;
  var bmtContactSubmissionIds: Map<string, number> | undefined;
}

const rateLimits = globalThis.bmtContactRateLimits ?? new Map<string, RateLimitEntry>();
globalThis.bmtContactRateLimits = rateLimits;
const sentSubmissionIds = globalThis.bmtContactSubmissionIds ?? new Map<string, number>();
globalThis.bmtContactSubmissionIds = sentSubmissionIds;

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function requestIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

function rateLimitExceeded(ip: string) {
  const now = Date.now();
  const existing = rateLimits.get(ip);

  if (!existing || existing.resetAt <= now) {
    rateLimits.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }

  existing.count += 1;
  return existing.count > 5;
}

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");

  if (!origin || !host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function errorResponse(message: string, status = 400) {
  return Response.json({ ok: false, message }, { status });
}

function smtpErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") {
    return { name: "unknown" };
  }

  const smtpError = error as {
    name?: unknown;
    code?: unknown;
    command?: unknown;
    responseCode?: unknown;
    response?: unknown;
  };

  return {
    name: typeof smtpError.name === "string" ? smtpError.name : "unknown",
    code: typeof smtpError.code === "string" ? smtpError.code : undefined,
    command: typeof smtpError.command === "string" ? smtpError.command : undefined,
    responseCode: typeof smtpError.responseCode === "number" ? smtpError.responseCode : undefined,
    response: typeof smtpError.response === "string"
      ? smtpError.response.replace(/[A-Za-z0-9+/=_-]{24,}/g, "[redacted]").slice(0, 400)
      : undefined,
  };
}

function alreadySent(submissionId: string) {
  const now = Date.now();
  for (const [id, expiresAt] of sentSubmissionIds) {
    if (expiresAt <= now) sentSubmissionIds.delete(id);
  }
  return sentSubmissionIds.has(submissionId);
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return errorResponse("This request could not be verified.", 403);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 24_000) {
    return errorResponse("That message is too large.", 413);
  }

  const ip = requestIp(request);
  if (rateLimitExceeded(ip)) {
    return errorResponse("Too many attempts. Please wait a few minutes and try again.", 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse("The form could not be read.");
  }

  const website = text(body.website, 200);
  const startedAt = Number(body.startedAt);
  if (website || (Number.isFinite(startedAt) && Date.now() - startedAt < 800)) {
    return Response.json({ ok: true, inquiryId: "received" });
  }

  const inquiry: ProjectInquiry = {
    inquiryId: text(body.submissionId, 80) || crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    name: text(body.name, 120),
    email: text(body.email, 254).toLowerCase(),
    company: text(body.company, 160),
    location: text(body.location, 160),
    service: text(body.service, 120),
    stage: text(body.stage, 120),
    timing: text(body.timing, 200),
    details: text(body.details, 5_000),
  };

  if (inquiry.name.length < 2) {
    return errorResponse("Please enter your name.");
  }
  if (!isEmail(inquiry.email)) {
    return errorResponse("Please enter a valid work email.");
  }
  if (!services.has(inquiry.service)) {
    return errorResponse("Please select the type of help you need.");
  }
  if (!stages.has(inquiry.stage)) {
    return errorResponse("Please select the current project stage.");
  }
  if (inquiry.details.length < 10) {
    return errorResponse("Please add a little more project detail.");
  }

  if (alreadySent(inquiry.inquiryId)) {
    return Response.json({ ok: true, inquiryId: inquiry.inquiryId });
  }

  const smtpUser = process.env.GOOGLE_SMTP_USER;
  const smtpPassword = process.env.GOOGLE_SMTP_APP_PASSWORD;
  const contactTo = process.env.CONTACT_TO_EMAIL || "info@blackmountain.tech";
  const contactFrom = process.env.CONTACT_FROM_EMAIL || "info@blackmountain.tech";

  if (!smtpUser || !smtpPassword) {
    console.error("Contact form email configuration is incomplete.");
    return errorResponse("Email delivery is temporarily unavailable. Please email info@blackmountain.tech directly.", 503);
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPassword.replace(/\s+/g, ""),
    },
  });

  const sender = `Black Mountain Technologies <${contactFrom}>`;
  const subjectName = inquiry.company || inquiry.name;
  const notificationHtml = await render(ProjectInquiryEmail({ inquiry }));
  const acknowledgementHtml = await render(ProjectAcknowledgementEmail({
    name: inquiry.name.split(/\s+/)[0],
    inquiryId: inquiry.inquiryId,
  }));
  const notificationText = [
    `New BMT project inquiry / ${inquiry.inquiryId}`,
    "",
    `Name: ${inquiry.name}`,
    `Work email: ${inquiry.email}`,
    `Company: ${inquiry.company || "Not provided"}`,
    `Project location: ${inquiry.location || "Not provided"}`,
    `Help needed: ${inquiry.service}`,
    `Project stage: ${inquiry.stage}`,
    `Desired timing: ${inquiry.timing || "Not provided"}`,
    "",
    "Project details:",
    inquiry.details,
  ].join("\n");

  try {
    await transporter.sendMail({
      from: sender,
      to: contactTo,
      replyTo: inquiry.email,
      subject: `BMT project inquiry — ${subjectName}`,
      html: notificationHtml,
      text: notificationText,
      headers: {
        "X-BMT-Inquiry-ID": inquiry.inquiryId,
      },
    });

    sentSubmissionIds.set(inquiry.inquiryId, Date.now() + 24 * 60 * 60 * 1000);

    try {
      await transporter.sendMail({
        from: sender,
        to: inquiry.email,
        replyTo: contactTo,
        subject: "We received your BMT project inquiry",
        html: acknowledgementHtml,
        text: [
          `Thanks, ${inquiry.name.split(/\s+/)[0]}. We have your project inquiry.`,
          "",
          "Black Mountain Technologies will review the project stage, requested support, and timing before replying from info@blackmountain.tech.",
          "",
          `Inquiry reference: ${inquiry.inquiryId}`,
          "https://blackmountain.tech/resources",
        ].join("\n"),
        headers: {
          "X-BMT-Inquiry-ID": inquiry.inquiryId,
        },
      });
    } catch (error) {
      console.error("BMT inquiry acknowledgement failed:", smtpErrorDetails(error));
    }

    return Response.json({ ok: true, inquiryId: inquiry.inquiryId });
  } catch (error) {
    console.error("BMT contact route failed:", smtpErrorDetails(error));
    return errorResponse("We could not deliver the inquiry. Your form is still here—please try again or email info@blackmountain.tech.", 502);
  }
}
