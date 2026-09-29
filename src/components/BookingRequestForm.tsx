"use client";

import { useRef, useState, type FormEvent } from "react";

type Props = { initialModule?: string };

const slots = Array.from({ length: 24 }, (_, index) => {
  const hour = 12 + Math.floor(index / 2);
  const minute = index % 2 ? "30" : "00";
  const value = `${String(hour).padStart(2, "0")}:${minute}`;
  const label = `${hour > 12 ? hour - 12 : hour}:${minute} PM`;
  return { value, label };
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
  const formRef = useRef<HTMLFormElement>(null);
  const [module, setModule] = useState(initialModule);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [goal, setGoal] = useState("");
  const [minDate] = useState(() => indiaNow().date);
  const [message, setMessage] = useState("");

  const subject = `RakshXD Module ${module || "consultation"} — slot request`;
  const details = [
    "Hi Raksh,",
    "",
    `Name: ${name.trim()}`,
    `Email: ${email.trim()}`,
    `WhatsApp: ${whatsapp.trim() || "Not provided"}`,
    `Module: ${module || "Please help me choose"}`,
    `Preferred first-call date: ${date}`,
    `Preferred first-call time (IST): ${time}`,
    `What I want help with: ${goal.trim() || "I will share more details by email."}`,
    "",
    "I understand this is a slot request. Please confirm availability, the pre-call form and payment steps.",
  ].join("\n");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const now = indiaNow();
    if (`${date} ${time}` <= `${now.date} ${now.time}`) {
      setMessage("Please choose a future date and time in IST.");
      return;
    }
    setMessage("Your email draft is ready. Send it from your mail app to request the slot; it is not reserved yet.");
    window.location.href = `mailto:rakshitjain889@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(details)}`;
  }

  async function copyDetails() {
    if (!formRef.current?.reportValidity()) return;
    const now = indiaNow();
    if (`${date} ${time}` <= `${now.date} ${now.time}`) {
      setMessage("Please choose a future date and time in IST.");
      return;
    }
    try {
      await navigator.clipboard.writeText(`To: rakshitjain889@gmail.com\nSubject: ${subject}\n\n${details}`);
      setMessage("Request copied. Paste it into an email to rakshitjain889@gmail.com.");
    } catch {
      setMessage("Copy was unavailable. Use the email button or write to rakshitjain889@gmail.com.");
    }
  }

  return <form className="slot-form" ref={formRef} onSubmit={handleSubmit}>
    <div className="slot-form__grid">
      <label>Your name<input name="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required /></label>
      <label>Email<input name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label>Module<select name="module" value={module} onChange={(event) => setModule(event.target.value)} required><option value="">Choose a module</option><option value="01">01 / What To Make?</option><option value="02">02 / Make It Perform</option><option value="03">03 / Build The Business</option></select></label>
      <label>WhatsApp number <span>(optional)</span><input name="whatsapp" type="tel" autoComplete="tel" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="With country code" /></label>
      <label>Preferred first-call date<input name="date" type="date" min={minDate} value={date} onChange={(event) => setDate(event.target.value)} required /></label>
      <label>Preferred start time <span>(IST)</span><select name="time" value={time} onChange={(event) => setTime(event.target.value)} required><option value="">Choose a time</option>{slots.map((slot) => <option value={slot.value} key={slot.value}>{slot.label}</option>)}</select></label>
    </div>
    <label>What would you like help with? <span>(optional)</span><textarea name="goal" rows={3} value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="A little context helps us prepare." /></label>
    <div className="slot-form__footer"><button type="submit" className="pill-button">Prepare slot request <span>↗</span></button><button type="button" className="slot-form__copy" onClick={copyDetails}>Copy request instead ↗</button></div>
    <p className="slot-form__note">Your preferred time is a request, not a confirmed reservation. Raksh&apos;s team confirms availability, shares the pre-call form and payment steps, then sends the Google Meet details. Payment is 100% upfront after confirmation.</p>
    <p className="slot-form__status" role="status" aria-live="polite">{message}</p>
  </form>;
}
