import React, { useEffect, useState, useRef } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/db";

interface Setting {
  whatsapp_number?: string;
  ai_chat_enabled?: boolean;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function SupportButtons() {
  const [settings, setSettings] = useState<Setting | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! How can I help you today?" }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then((res) => res.json())
      .then((data: Setting) => setSettings(data))
      .catch((err) => console.error("Error fetching support settings:", err));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chatOpen) {
      scrollToBottom();
    }
  }, [messages, chatOpen]);

  if (!settings) return null;

  const waNumber = settings.whatsapp_number || "923001234567";
  const aiEnabled = settings.ai_chat_enabled !== false;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isSending) return;

    const userMsg = inputVal.trim();
    setInputVal("");
    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMessages);
    setIsSending(true);

    try {
      const response = await fetch(`${API_URL}/api/support-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chat failed");

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm sorry, I am unable to connect right now. Please try again shortly or contact us on WhatsApp." }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none">
      {/* AI Chat Panel */}
      {chatOpen && aiEnabled && (
        <div className="w-[360px] max-w-[calc(100vw-2rem)] h-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                  🤖
                </div>
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-400 rounded-full border-2 border-emerald-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-wide">BreezyGo AI Support</h4>
                <p className="text-[10px] text-emerald-100 font-semibold uppercase tracking-wider">Online & Active</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-emerald-500 text-white rounded-br-none"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-bl-none"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 items-center">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 px-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={isSending || !inputVal.trim()}
              className="h-9 w-9 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white flex items-center justify-center transition-colors shrink-0"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      )}

      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/${waNumber}?text=Hi%2C%20I%20need%20help%20with%20my%20order`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
        title="Chat on WhatsApp"
      >
        <svg className="h-8 w-8 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436.002 9.852-4.411 9.855-9.85.002-2.634-1.02-5.11-2.885-6.978C16.38 1.912 13.9 .887 11.278.887c-5.44 0-9.858 4.415-9.86 9.858-.001 1.502.4 2.966 1.157 4.237L1.517 21.03l6.13-1.609-.001-.001-.001-.001zM10.82 7.7c-.16-.35-.33-.36-.48-.36h-.41c-.14 0-.38.05-.58.27-.2.22-.76.74-.76 1.81 0 1.07.78 2.1 1.76 2.45.19.07 1.52 1.01 2.95 1.5.34.12.68.18 1 .18.35 0 .76-.19 1.04-.46.28-.27.58-.69.58-1.01 0-.1-.03-.17-.08-.22-.05-.05-.22-.11-.47-.23-.25-.12-1.5-.74-1.73-.82-.23-.08-.39-.12-.56.13-.17.25-.66.83-.8 1-.15.17-.3.19-.55.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.15-.25-.02-.38.1-.5.11-.11.25-.29.37-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.13-.48-1.16-.66-1.58z" />
        </svg>
      </a>

      {/* AI Chat Toggle Button */}
      {aiEnabled && (
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`h-14 w-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all cursor-pointer ${
            chatOpen ? "bg-slate-800 text-white" : "bg-emerald-500 text-white"
          }`}
          title="AI Support Chat"
        >
          {chatOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </button>
      )}
    </div>
  );
}
