import { Icon } from "./simple-icons";

export function ContactActions({ unlocked }: { unlocked: boolean }) {
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
              Phone and WhatsApp unlock only after the user accepts the worker price quote inside MistriHub.
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
      <div className="grid grid-cols-2 gap-3">
        <button className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-50 font-black text-brand-600">
          <Icon name="phone" />
          Call
        </button>
        <button className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-50 font-black text-emerald-600">
          <Icon name="phone" />
          WhatsApp
        </button>
      </div>
    </div>
  );
}
