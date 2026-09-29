"use client";

import { useState, type FormEvent } from "react";

type Props = { initialModule?: string };

const slots = Array.from({ length: 24 }, (_, index) => {
  const hour = 12 + Math.floor(index / 2);
  const minute = index % 2 ? "30" : "00";
  return { value: `${String(hour).padStart(2, "0")}:${minute}`, label: `${hour > 12 ? hour - 12 : hour}:${minute} PM` };
});

function indiaNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return { date: `${value("year")}-${value("month")}-${value("day")}`, time: `${value("hour")}:${value("minute")}` };
}

export default function BookingRequestForm({ initialModule = "" }: Props) {
  const [module, setModule] = useState(initialModule);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [goal, setGoal] = useState("");
  const [consent, setConsent] = useState(false);
  const [minDate] = useState(() => indiaNow().date);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!!date !== !!time) { setMessage("Choose both a date and time, or leave both blank."); return; }
    const now = indiaNow();
    if (date && `${date} ${time}` <= `${now.date} ${now.time}`) { setMessage("Please choose a future time in IST."); return; }
    setBusy(true); setMessage("");
    try {
      const form = event.currentTarget;
      const website = (new FormData(form).get("website") || "").toString();
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, whatsapp, module, date, time, goal, consent, website }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not send your request");
      setSuccess(true);
      setMessage("Thank you. Your pre-sales request has been received. Rakshit's team will contact you with next steps.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send your request. Please try again.");
    } finally { setBusy(false); }
  }

  return <form className="slot-form" onSubmit={handleSubmit} aria-busy={busy}>
    <p className="eyebrow">Pre-sales enquiry / No payment today</p>
    <p className="slot-form__note">Leave your details and we&apos;ll contact you with availability and the next steps. Submitting this form does not charge you or reserve a slot.</p>
    <div className="slot-form__grid">
      <label>Your name<input name="name" autoComplete="name" maxLength={120} value={name} onChange={(event) => setName(event.target.value)} required disabled={success} /></label>
      <label>Email<input name="email" type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} required disabled={success} /></label>
      <label>Module<select name="module" value={module} onChange={(event) => setModule(event.target.value)} required disabled={success}><option value="">Choose a module</option><option value="01">01 / What To Make?</option><option value="02">02 / Make It Perform</option><option value="03">03 / Build The Business</option></select></label>
      <label>WhatsApp number <span>(optional)</span><input name="whatsapp" type="tel" autoComplete="tel" maxLength={35} value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="With country code" disabled={success} /></label>
      <label>Preferred first-call date <span>(optional)</span><input name="date" type="date" min={minDate} value={date} onChange={(event) => setDate(event.target.value)} disabled={success} /></label>
      <label>Preferred start time <span>(IST, optional)</span><select name="time" value={time} onChange={(event) => setTime(event.target.value)} disabled={success}><option value="">Choose a time</option>{slots.map((slot) => <option value={slot.value} key={slot.value}>{slot.label}</option>)}</select></label>
    </div>
    <label>What would you like help with? <span>(optional)</span><textarea name="goal" rows={3} maxLength={2000} value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="A little context helps us prepare." disabled={success} /></label>
    <label className="slot-form__consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required disabled={success} /><span>I agree to be contacted by Rakshit&apos;s team about this enquiry.</span></label>
    <label className="slot-form__honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <div className="slot-form__footer"><button type="submit" className="pill-button" disabled={busy || success}>{busy ? "Sending..." : success ? "Request received ✓" : "Join pre-sales ↗"}</button></div>
    <p className="slot-form__status" role="status" aria-live="polite">{message}</p>
  </form>;
}
