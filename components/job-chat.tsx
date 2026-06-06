"use client";

import { useEffect, useRef, useState } from "react";
import { accountDisplayName } from "@/lib/display-name";
import { getMockAccount, type MockRequestMessage } from "@/lib/mock-store";
import { loadRequestMessages, sendRequestMessage } from "@/lib/supabase-flow";

export function JobChat({ jobId }: { jobId: string }) {
  const [messages, setMessages] = useState<MockRequestMessage[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesListRef = useRef<HTMLDivElement | null>(null);
  const account = typeof window !== "undefined" ? getMockAccount() : null;

  useEffect(() => {
    let cancelled = false;
    async function loadMessages() {
      const nextMessages = await loadRequestMessages(jobId);
      if (!cancelled) setMessages(nextMessages);
    }

    loadMessages();
    const timer = window.setInterval(loadMessages, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [jobId]);

  useEffect(() => {
    if (!messages.length) return;
    const scrollToLatestMessage = () => {
      messagesListRef.current?.scrollTo({
        behavior: "smooth",
        top: messagesListRef.current.scrollHeight
      });
      const page = document.scrollingElement ?? document.documentElement;
      const bottom = page.scrollHeight - window.innerHeight;
      if (bottom > page.scrollTop) {
        page.scrollTo({ behavior: "smooth", top: bottom });
      }
    };

    window.requestAnimationFrame(scrollToLatestMessage);
    const timer = window.setTimeout(scrollToLatestMessage, 120);
    return () => window.clearTimeout(timer);
  }, [messages.length]);

  async function submitMessage() {
    const text = message.trim();
    if (!text || sending) return;
    const senderRole = account?.role === "worker" ? "worker" : "user";
    const senderName = accountDisplayName(account);
    setSending(true);
    setMessage("");
    const nextMessage = await sendRequestMessage({
      jobId,
      senderRole,
      senderName,
      message: text
    });
    setMessages((currentMessages) => [...currentMessages, nextMessage]);
    setSending(false);
  }

  return (
    <div className="card p-5" id="job-chat">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-black">Job Chat</h2>
          <p className="mt-1 text-sm text-slate-500">User aur worker ki job discussion ka record yahin rahega.</p>
        </div>
        <span className="status-pill bg-brand-50 text-brand-600">{messages.length}</span>
      </div>
      <div ref={messagesListRef} className="mt-4 max-h-72 space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-3">
        {messages.length ? (
          messages.map((item) => {
            const mine = item.senderRole === account?.role;
            return (
              <div className={`flex ${mine ? "justify-end" : "justify-start"}`} key={item.id}>
                <div className={`max-w-[82%] rounded-2xl p-3 text-sm ${mine ? "bg-brand-600 text-white" : "bg-white text-slate-800 shadow-sm"}`}>
                  <p className={`text-xs font-black ${mine ? "text-blue-100" : "text-brand-600"}`}>{item.senderName}</p>
                  <p className="mt-1 leading-5">{item.message}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-6 text-center text-sm font-bold text-slate-500">No chat yet. Start with one short message.</p>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          className="h-12 min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-brand-500"
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submitMessage();
          }}
          placeholder="Type message..."
          value={message}
        />
        <button className="btn-primary h-12 w-24 text-sm" disabled={sending || !message.trim()} onClick={submitMessage} type="button">
          {sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
