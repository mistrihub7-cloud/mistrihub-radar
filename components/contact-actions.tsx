import { Icon } from "./simple-icons";

export function ContactActions({ phone, unlocked }: { phone?: string; unlocked: boolean }) {
  const cleanPhone = (phone || "").replace(/\D/g, "");
  const callHref = cleanPhone ? `tel:+91${cleanPhone.slice(-10)}` : undefined;
  const whatsappHref = cleanPhone ? `https://wa.me/91${cleanPhone.slice(-10)}` : undefined;

  if (!unlocked) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-slate-500">
            <Icon name="shield" />
          </span>
          <div>
            <h3 className="font-black text-slate-950">Contact locked</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Phone and WhatsApp unlock only after the worker accepts the job inside MistriHub.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-200 font-black text-slate-500" disabled>
            <Icon name="phone" />
            Call Locked
          </button>
          <button className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-200 font-black text-slate-500" disabled>
            <Icon name="phone" />
            WhatsApp Locked
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3 font-black">Contact (Unlocked)</h3>
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
        <a
          className={`flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-50 font-black text-brand-600 ${callHref ? "" : "pointer-events-none opacity-60"}`}
          href={callHref || "#"}
        >
          <Icon name="phone" />
          Call
        </a>
        <a
          className={`flex h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-50 font-black text-emerald-600 ${whatsappHref ? "" : "pointer-events-none opacity-60"}`}
          href={whatsappHref || "#"}
          rel="noreferrer"
          target="_blank"
        >
          <Icon name="phone" />
          WhatsApp
        </a>
        </div>
        <a className="flex h-12 items-center justify-center rounded-2xl bg-brand-600 font-black text-white" href="#job-chat">
          Open Platform Chat
        </a>
        {!cleanPhone ? <p className="text-xs font-bold text-slate-500">Phone number not saved for this request.</p> : null}
      </div>
    </div>
  );
}
