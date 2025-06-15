"use client";

import { useState, useRef, useEffect } from "react";
import TripPlannerModal from "./TripPlannerModal";

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
  const [showTripPlanner, setShowTripPlanner] = useState(false);
  const [clearing, setClearing] = useState(false);
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

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;
    
    const userMsg: Message = { role: "USER", content: text };
    setMessages((m) => [...m, userMsg]);
    
    if (!messageText) {
      setInput("");
    }
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

  const handleClearConversation = async () => {
    if (!confirm("Are you sure you want to clear the entire conversation? This action cannot be undone.")) {
      return;
    }

    setClearing(true);
    try {
      const res = await fetch("/api/ai", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        throw new Error("Failed to clear conversation");
      }

      // Clear messages from UI
      setMessages([]);
    } catch (err: unknown) {
      console.error("Clear conversation error:", err);
      alert("Failed to clear conversation. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  const handleTripPlanSubmit = (message: string) => {
    handleSend(message);
  };

  return (
    <>
      <div className="flex flex-col h-[90vh] max-h-[800px] bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Header with Trip Planner and Clear Conversation Buttons */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-blue-400 dark:bg-blue-800 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-grey-900 dark:text-gray-100">
              AI Travel Assistant
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowTripPlanner(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Plan a trip now!</span>
              </button>
              <button
                onClick={handleClearConversation}
                disabled={clearing || messages.length === 0}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>{clearing ? "Clearing..." : "Clear conversation"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Message window */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {loadingHistory ? (
            <p className="text-gray-500 dark:text-gray-400">Loading chat…</p>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-lg font-medium mb-2">Welcome to your AI Travel Assistant!</p>
                    <p className="text-sm">Ask me anything about travel or use the &quot;Plan a trip now!&quot; button to get started with personalized recommendations.</p>
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={m.role === "USER" ? "text-right" : "text-left"}
                >
                  <div className={m.role === "USER" ? "flex justify-end" : "flex justify-start"}>
                    <div
                      className={
                        (m.role === "USER"
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100") +
                        " inline-block p-3 rounded-lg max-w-[80%] whitespace-pre-wrap"
                      }
                    >
                      {m.content}
                    </div>
                  </div>
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
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !sending) handleSend();
            }}
            disabled={sending}
          />
          <button
            onClick={() => handleSend()}
            disabled={sending || !input.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? "…" : "Send"}
          </button>
        </div>
      </div>

      {/* Trip Planner Modal */}
      <TripPlannerModal
        isOpen={showTripPlanner}
        onClose={() => setShowTripPlanner(false)}
        onSubmit={handleTripPlanSubmit}
      />
    </>
  );
}