"use client";

import { useState, useRef, useEffect } from "react";

type Role = "USER" | "ASSISTANT";

interface Message {
  role: Role;
  content: string;
}

export default function AIChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Load persisted chat history on mount
  useEffect(() => {
    fetch("/api/ai")
      .then((res) => res.json())
      .then((history: Message[]) => {
        setMessages(history);
      })
      .catch((err) => {
        console.error("Failed to load chat history:", err);
      })
      .finally(() => {
        setLoadingHistory(false);
      });
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { role: "USER", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const body = await res.json();
      if (body.error) throw new Error(body.error);

      const assistantMsg: Message = { role: "ASSISTANT", content: body.reply };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err: unknown) {
      console.error("Chat error:", err);
      setMessages((m) => [
        ...m,
        { role: "ASSISTANT", content: "⚠️ Something went wrong." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] max-h-[800px] bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Message window */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {loadingHistory ? (
          <p className="text-gray-500 dark:text-gray-400">Loading chat…</p>
        ) : (
          <>
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "USER" ? "text-right" : "text-left"}
              >
                <span
                  className={
                    (m.role === "USER"
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-gray-200 dark:bg-gray-700") +
                    " inline-block p-2 rounded-md"
                  }
                >
                  {m.content}
                </span>
              </div>
            ))}
            <div ref={endRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-300 dark:border-gray-700 flex space-x-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !sending) handleSend();
          }}
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
        >
          {sending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
