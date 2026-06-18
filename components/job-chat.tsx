"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { accountDisplayName } from "@/lib/display-name";
import { getMockAccount, getWorkerRegistration, type MockRequestMessage } from "@/lib/mock-store";
import { loadRequestMessages, sendRequestMessage } from "@/lib/supabase-flow";
import { ImportantNotice } from "./important-notice";

type ChatWorker = {
  id?: string;
  name?: string;
};

export function JobChat({
  jobId,
  worker,
  lockedWorkerId,
  disabledReason
}: {
  jobId: string;
  worker?: ChatWorker;
  lockedWorkerId?: string;
  disabledReason?: string;
}) {
  const [messages, setMessages] = useState<MockRequestMessage[]>([]);
  const [message, setMessage] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [sending, setSending] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const messagesListRef = useRef<HTMLDivElement | null>(null);
  const pageScrolledToChatRef = useRef(false);
  const account = typeof window !== "undefined" ? getMockAccount() : null;
  const workerProfile = typeof window !== "undefined" && account?.role === "worker" ? getWorkerRegistration() : null;
  const scopedWorkerId = account?.role === "worker" ? workerProfile?.id : undefined;
  const displayName = accountDisplayName(account, workerProfile || undefined);
  const notice =
    account?.role === "worker"
      ? `Dear ${displayName}, job accept karne se pehle user se price, work details aur timing properly discuss kar lein. Agar sab details clear ho tabhi job accept karein. Accept karne ke baad unnecessary cancel na karein, isse aapka score affect ho sakta hai. MistriHub.In sirf users aur professionals ko connect karta hai. Final deal, payment aur work agreement user aur service partner ke beech hoga.`
      : `Dear ${displayName}, professional ko hire karne se pehle price, work details aur timing achhe se discuss kar lein. Multiple service partners aapse contact kar sakte hain. Aapko jo trusted aur sahi lage, usi expert ko hire karein. MistriHub.In sirf nearby professionals se connect karwata hai. Final deal, price aur payment user aur service partner ke beech hoga.`;

  useEffect(() => {
    let cancelled = false;
    async function loadMessages() {
      const nextMessages = await loadRequestMessages(jobId, scopedWorkerId);
      if (!cancelled) setMessages(nextMessages);
    }

    loadMessages();
    const timer = window.setInterval(loadMessages, 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [jobId, scopedWorkerId]);

  useEffect(() => {
    if (!messages.length) return;
    if (!pageScrolledToChatRef.current) {
      pageScrolledToChatRef.current = true;
      window.setTimeout(() => chatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    }
    const scrollToLatestMessage = () => {
      messagesListRef.current?.scrollTo({
        behavior: "smooth",
        top: messagesListRef.current.scrollHeight
      });
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
    if (disabledReason) return;
    const targetWorker = conversations.find((item) => item.id === selectedWorkerId);
    const targetWorkerId = account?.role === "worker" ? workerProfile?.id : targetWorker?.id || worker?.id;
    const targetWorkerName = account?.role === "worker" ? workerProfile?.name : targetWorker?.name || worker?.name;
    setSending(true);
    setMessage("");
    const nextMessage = await sendRequestMessage({
      jobId,
      workerId: targetWorkerId || undefined,
      workerName: targetWorkerName || undefined,
      senderRole,
      senderName,
      message: text
    });
    setMessages((currentMessages) => [...currentMessages, nextMessage]);
    setSending(false);
  }

  const conversations = useMemo(() => {
    const nextConversations = Array.from(
      messages.reduce((map, item) => {
        if (item.workerId) map.set(item.workerId, item.workerName || item.senderName || "Professional");
        return map;
      }, new Map<string, string>())
    ).map(([id, name]) => ({ id, name }));

    if (account?.role !== "worker" && worker?.id && !nextConversations.some((item) => item.id === worker.id)) {
      nextConversations.unshift({ id: worker.id, name: worker.name || "Professional" });
    }

    if (account?.role !== "worker" && lockedWorkerId) {
      return nextConversations.filter((item) => item.id === lockedWorkerId);
    }

    return nextConversations;
  }, [account?.role, lockedWorkerId, messages, worker?.id, worker?.name]);

  const visibleMessages =
    account?.role === "worker" || !selectedWorkerId
      ? messages
      : messages.filter((item) => item.workerId === selectedWorkerId || (!item.workerId && conversations.length <= 1));

  useEffect(() => {
    if (account?.role === "worker") return;
    if (lockedWorkerId) {
      setSelectedWorkerId(lockedWorkerId);
      return;
    }
    if (selectedWorkerId && conversations.some((item) => item.id === selectedWorkerId)) return;
    setSelectedWorkerId(conversations[0]?.id || "");
  }, [account?.role, conversations, lockedWorkerId, selectedWorkerId]);

  return (
    <div className="card scroll-mt-24 p-5" id="job-chat" ref={chatRef}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-black">Job Chat</h2>
          <p className="mt-1 text-sm text-slate-500">
            {lockedWorkerId ? "Booking accepted ho gaya. Chat sirf hired professional ke saath active hai." : "User aur professional ki job discussion ka record yahin rahega."}
          </p>
        </div>
        <span className="status-pill bg-brand-50 text-brand-600">{messages.length}</span>
      </div>
      <div className="mt-4">
        <ImportantNotice message={notice} />
      </div>
      {account?.role !== "worker" && conversations.length > 1 ? (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {conversations.map((item) => (
            <button
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${
                selectedWorkerId === item.id ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
              key={item.id}
              onClick={() => setSelectedWorkerId(item.id)}
              type="button"
            >
              {item.name}
            </button>
          ))}
        </div>
      ) : null}
      <div ref={messagesListRef} className="mt-4 max-h-72 space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-3">
        {visibleMessages.length ? (
          visibleMessages.map((item) => {
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
          disabled={Boolean(disabledReason)}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submitMessage();
          }}
          placeholder={disabledReason || "Type message..."}
          value={message}
        />
        <button className="btn-primary h-12 w-24 text-sm" disabled={Boolean(disabledReason) || sending || !message.trim()} onClick={submitMessage} type="button">
          {sending ? "..." : "Send"}
        </button>
      </div>
      {disabledReason ? <p className="mt-2 rounded-2xl bg-amber-50 p-3 text-xs font-black text-amber-800">{disabledReason}</p> : null}
    </div>
  );
}
