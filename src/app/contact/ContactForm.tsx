"use client";

import { useState } from "react";
import { EnvelopeSimple, PaperPlaneRight } from "@phosphor-icons/react";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  function validate(): boolean {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "This field is required.";
    if (!email.trim()) next.email = "This field is required.";
    if (!message.trim()) next.message = "This field is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    setErrors({});
    try {
      // Placeholder: replace with your API or form service (e.g. Formspree, Netlify Forms, API route).
      await new Promise((r) => setTimeout(r, 800));
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-[#0a234e] sm:text-xl mb-6 flex items-center gap-2">
        <EnvelopeSimple className="text-[#2854a6] shrink-0" size={24} weight="regular" aria-hidden />
        Contact Form
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-gray-800">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#2854a6] focus:outline-none focus:ring-1 focus:ring-[#2854a6]"
            placeholder="Your name"
            required
            disabled={status === "submitting"}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-gray-800">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#2854a6] focus:outline-none focus:ring-1 focus:ring-[#2854a6]"
            placeholder="your@email.com"
            required
            disabled={status === "submitting"}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        <div>
          <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-gray-800">
            Message <span className="text-red-600">*</span>
          </label>
          <textarea
            id="contact-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#2854a6] focus:outline-none focus:ring-1 focus:ring-[#2854a6] resize-y min-h-[120px]"
            placeholder="Your message"
            required
            disabled={status === "submitting"}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-[#2854a6] px-4 py-3 font-medium text-white transition hover:bg-[#1e3a8a] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <PaperPlaneRight size={20} weight="regular" />
          {status === "submitting" ? "Sending…" : "Submit"}
        </button>
        {status === "success" && (
          <p className="rounded-lg bg-green-50 p-3 text-center text-sm text-green-800">
            Thank you. Your message has been sent. We&apos;ll get back to you soon.
          </p>
        )}
        {status === "error" && (
          <p className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">
            Something went wrong. Please try again or email us directly.
          </p>
        )}
      </form>
    </div>
  );
}
