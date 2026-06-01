"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatProductCard from "./ChatProductCard";
import {
  industryFlows,
  createMessage,
  INITIAL_MESSAGE,
  INDUSTRY_BUTTONS,
  sleep,
  type ChatMessage,
  type ChatSession,
  type ChatProduct,
  type LeadFormData,
} from "@/lib/chatFlows";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const SESSION_KEY = "starbottles_chat_session";

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-gray-100 rounded-2xl rounded-tl-sm w-fit">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-gray-400 block"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

// ── Inline lead form ──────────────────────────────────────────────────────────
function LeadForm({
  productName,
  onSubmit,
  onSkip,
}: {
  productName?: string;
  onSubmit: (data: LeadFormData) => void;
  onSkip: () => void;
}) {
  const [form, setForm] = useState<LeadFormData>({
    phone: "",
    name: "",
    email: "",
    business_type: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<LeadFormData>>({});

  function validate() {
    const e: Partial<LeadFormData> = {};
    if (!form.phone.trim()) e.phone = "Mobile number is required";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit(form);
  }

  const inputClass = (key: keyof LeadFormData) =>
    `mt-0.5 w-full text-xs rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-[#1B2178]/30 transition ${
      errors[key] ? "border-red-300 bg-red-50/30" : "border-gray-200"
    }`;

  const label = (text: string, optional = false) => (
    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
      {text}{" "}
      {optional
        ? <span className="text-gray-400 normal-case font-normal">(optional)</span>
        : <span className="text-red-400">*</span>}
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
      {productName && (
        <p className="text-[11px] text-[#1B2178] font-semibold bg-blue-50 rounded-lg px-3 py-1.5 truncate">
          📦 {productName}
        </p>
      )}

      {/* Mobile Number — required */}
      <div>
        {label("Mobile Number")}
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(er => ({ ...er, phone: undefined })); }}
          placeholder="e.g. 9876543210"
          className={inputClass("phone")}
        />
        {errors.phone && <p className="text-[10px] text-red-400 mt-0.5">{errors.phone}</p>}
      </div>

      {/* Name — optional */}
      <div>
        {label("Name", true)}
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Your full name"
          className={inputClass("name")}
        />
      </div>

      {/* Email — optional */}
      <div>
        {label("Email", true)}
        <input
          type="email"
          value={form.email}
          onChange={(e) => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: undefined })); }}
          placeholder="you@company.com"
          className={inputClass("email")}
        />
        {errors.email && <p className="text-[10px] text-red-400 mt-0.5">{errors.email}</p>}
      </div>

      {/* Business Type — optional */}
      <div>
        {label("Business Type", true)}
        <input
          type="text"
          value={form.business_type}
          onChange={(e) => setForm(f => ({ ...f, business_type: e.target.value }))}
          placeholder="e.g. Retailer, Manufacturer, Distributor"
          className={inputClass("business_type")}
        />
      </div>

      {/* Message — optional */}
      <div>
        {label("Message", true)}
        <textarea
          value={form.message}
          onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
          placeholder="Any specific requirements or questions…"
          rows={2}
          className={`${inputClass("message")} resize-none`}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onSkip}
          className="flex-1 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition"
        >
          Skip
        </button>
        <button
          type="submit"
          className="flex-1 py-2 rounded-lg bg-[#1B2178] text-white text-xs font-semibold hover:bg-[#141a5e] transition"
        >
          Request Call Back
        </button>
      </div>
    </form>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<ChatSession>({
    state: "greeting",
    messages: [INITIAL_MESSAGE],
  });
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [waNumber, setWaNumber] = useState("918086850000");
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load session + fetch WA number
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatSession;
        if (parsed.messages?.length > 0) setSession(parsed);
      } catch {}
    }
    fetch(`${API_URL}/api/v1/website/settings`, { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((json) => {
        const s = json.data ?? json;
        if (s.whatsapp_number) setWaNumber(s.whatsapp_number);
      })
      .catch(() => {});
  }, []);

  // Persist session
  useEffect(() => {
    if (session.state !== "greeting" || session.messages.length > 1) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  }, [session]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages, isTyping]);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 350);
  }, [open]);

  // Pulse on new bot message while closed
  useEffect(() => {
    if (!open && session.messages.length > 1) setHasNewMessage(true);
  }, [session.messages.length]);

  const addBotMessage = useCallback((partial: Partial<ChatMessage>) => {
    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, createMessage("bot", partial)],
    }));
  }, []);

  const addUserMessage = useCallback((text: string) => {
    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, createMessage("user", { text })],
    }));
  }, []);

  async function handleIndustryClick(key: string) {
    if (key === "__other__") {
      addUserMessage("Other");
      setIsTyping(true);
      await sleep(600);
      setIsTyping(false);
      addBotMessage({
        text: "No problem! Just describe what you need — material, size, use case, or anything you have in mind.",
      });
      return;
    }
    const industry = industryFlows[key];
    addUserMessage(industry.label);
    setSession((prev) => ({ ...prev, state: "subcategory", selectedIndustry: key }));
    setIsTyping(true);
    await sleep(600);
    setIsTyping(false);
    addBotMessage({
      text: `What type of ${industry.label.toLowerCase()} packaging are you looking for?`,
      quickReplies: Object.keys(industry.subcategories).map((k) => ({ label: k, value: k })),
    });
  }

  async function handleSubcategoryClick(subcategory: string) {
    const industry = industryFlows[session.selectedIndustry!];
    const searchTerm = industry.subcategories[subcategory];
    addUserMessage(subcategory);
    setSession((prev) => ({ ...prev, state: "loading" }));
    setIsTyping(true);
    try {
      const res = await fetch(
        `${API_URL}/api/v1/products?search=${encodeURIComponent(searchTerm)}&per_page=6`,
        { headers: { Accept: "application/json" } }
      );
      const json = await res.json();
      const products: ChatProduct[] = (json.data ?? []).slice(0, 6);
      await sleep(300);
      setIsTyping(false);
      if (products.length === 0) {
        addBotMessage({
          text: `I couldn't find specific ${subcategory.toLowerCase()} right now. Try typing what you need or browse our full catalog.`,
          quickReplies: [
            { label: "🔍 Search Again", value: "__reset__" },
            { label: "📦 View All Products", value: "__all__" },
          ],
        });
      } else {
        addBotMessage({
          text: `Here are our ${subcategory.toLowerCase()} options:`,
          products,
          quickReplies: [
            { label: "🔍 Search Again", value: "__reset__" },
            { label: "📦 View All →", value: "__all__" },
          ],
        });
      }
      setSession((prev) => ({ ...prev, state: "products_shown" }));
    } catch {
      setIsTyping(false);
      addBotMessage({ text: "Couldn't fetch products right now. Please try again." });
      setSession((prev) => ({ ...prev, state: "products_shown" }));
    }
  }

  async function handleFreeText(query: string) {
    if (!query.trim()) return;
    addUserMessage(query);
    setInputValue("");
    setIsTyping(true);
    setSession((prev) => ({ ...prev, state: "loading" }));
    try {
      const conversationHistory = session.messages
        .filter((m) => m.text && !m.products && !m.showForm)
        .slice(-10)
        .map((m) => ({ role: m.from === "bot" ? "assistant" : "user", content: m.text! }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, messages: conversationHistory }),
      });
      const data = await res.json();
      await sleep(200);
      setIsTyping(false);

      addBotMessage({
        text: data.message,
        products: data.products?.length > 0 ? data.products : undefined,
        quickReplies: data.show_rfq
          ? [{ label: "📋 Get a Quote", value: "__rfq__" }]
          : [
              { label: "🔍 Search Again", value: "__reset__" },
              { label: "📦 View All →", value: "__all__" },
            ],
      });
      setSession((prev) => ({ ...prev, state: "products_shown" }));

      if (data.show_rfq) {
        await sleep(500);
        addBotMessage({ showForm: true });
        setSession((prev) => ({ ...prev, state: "quote_form" }));
      }
    } catch {
      setIsTyping(false);
      addBotMessage({
        text: "Sorry, I ran into an issue. You can browse by industry or contact us on WhatsApp:",
        quickReplies: [
          ...INDUSTRY_BUTTONS,
          { label: "💬 WhatsApp Us", value: "__wa__" },
        ],
      });
      setSession((prev) => ({ ...prev, state: "products_shown" }));
    }
  }

  async function handleQuickReply(value: string) {
    if (value === "__reset__") { resetChat(); return; }
    if (value === "__all__") { window.open("/products", "_blank"); return; }
    if (value === "__rfq__") {
      addBotMessage({ showForm: true });
      setSession((prev) => ({ ...prev, state: "quote_form" }));
      return;
    }
    if (value === "__wa__") {
      window.open(`https://wa.me/${waNumber}?text=Hi%2C%20I%20need%20help%20finding%20packaging%20products.`, "_blank");
      return;
    }
    // Industry button
    if (industryFlows[value] || value === "__other__") { handleIndustryClick(value); return; }
    // Subcategory button
    if (session.selectedIndustry && industryFlows[session.selectedIndustry]?.subcategories[value]) {
      handleSubcategoryClick(value);
      return;
    }
    // Fall through to AI search
    handleFreeText(value);
  }

  function handleGetQuote(product: ChatProduct) {
    const name = product.display_name || product.title;
    setSession((prev) => ({ ...prev, state: "quote_form", selectedProduct: { name } }));
    addUserMessage(`Get Quote: ${name}`);
    addBotMessage({
      text: "Let me take your details and our team will reach out to you.",
      showForm: true,
    });
  }

  async function handleLeadSubmit(formData: LeadFormData) {
    const productContext = session.selectedProduct
      ? `Product of interest: ${session.selectedProduct.name}\n`
      : "";
    try {
      await fetch("/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          message: `${productContext}${formData.message}`.trim(),
        }),
      });
    } catch {}

    setIsTyping(true);
    await sleep(600);
    setIsTyping(false);
    addBotMessage({
      text: `Thanks${formData.name ? ` ${formData.name}` : ""}! 🎉 Our team will call you on ${formData.phone} shortly.`,
      quickReplies: [
        { label: "💬 Chat on WhatsApp", value: `__wa_lead__${formData.phone}` },
        { label: "🔍 Search More Products", value: "__reset__" },
      ],
    });
    setSession((prev) => ({ ...prev, state: "submitted" }));
  }

  function handleLeadSkip() {
    addBotMessage({
      text: "No problem! Feel free to browse our catalog or ask me anything else.",
      quickReplies: [
        { label: "🔍 Search Again", value: "__reset__" },
        { label: "📦 View All Products", value: "__all__" },
      ],
    });
    setSession((prev) => ({ ...prev, state: "products_shown" }));
  }

  function resetChat() {
    localStorage.removeItem(SESSION_KEY);
    setSession({ state: "greeting", messages: [INITIAL_MESSAGE] });
  }

  function handleOpen() {
    setOpen(true);
    setHasNewMessage(false);
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  function renderMessage(msg: ChatMessage) {
    const isBot = msg.from === "bot";

    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`flex flex-col gap-2 ${isBot ? "items-start" : "items-end"}`}
      >
        {/* Text bubble */}
        {msg.text && (
          <div
            className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              isBot
                ? "bg-gray-100 text-gray-800 rounded-tl-sm"
                : "bg-[#1B2178] text-white rounded-tr-sm"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Product cards */}
        {msg.products && msg.products.length > 0 && (
          <div className="w-full space-y-2">
            {msg.products.map((p) => (
              <ChatProductCard key={p.id} product={p} onGetQuote={handleGetQuote} />
            ))}
          </div>
        )}

        {/* Lead form */}
        {msg.showForm && session.state !== "submitted" && (
          <div className="w-full">
            <LeadForm
              productName={session.selectedProduct?.name}
              onSubmit={handleLeadSubmit}
              onSkip={handleLeadSkip}
            />
          </div>
        )}

        {/* Quick replies */}
        {msg.quickReplies && msg.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {msg.quickReplies.map((qr) => (
              <button
                key={qr.value}
                onClick={() => {
                  if (qr.value.startsWith("__wa_lead__")) {
                    const phone = qr.value.replace("__wa_lead__", "");
                    const num = phone.startsWith("91") ? phone : `91${phone}`;
                    window.open(
                      `https://wa.me/${num}?text=Hi%2C%20I%20recently%20submitted%20an%20inquiry%20on%20starbottles.in`,
                      "_blank"
                    );
                  } else {
                    handleQuickReply(qr.value);
                  }
                }}
                disabled={session.state === "loading"}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-[#1B2178]/30 text-[#1B2178] bg-white hover:bg-[#1B2178] hover:text-white hover:border-[#1B2178] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {qr.label}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl shadow-black/20 border border-gray-100 flex flex-col overflow-hidden"
            style={{ height: "520px" }}
          >
            {/* Header */}
            <div className="bg-[#1B2178] px-4 py-3 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">
                🤖
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm leading-tight">StarBot</p>
                <p className="text-white/70 text-[11px]">Packaging Advisor · Usually replies instantly</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetChat}
                  title="Start over"
                  className="text-white/60 hover:text-white transition p-1"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-white/60 hover:text-white transition p-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
              {session.messages.map((msg) => renderMessage(msg))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start"
                >
                  <TypingDots />
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-gray-100 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (inputValue.trim()) handleFreeText(inputValue.trim());
                }}
                className="flex gap-2 items-center"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your question..."
                  disabled={session.state === "loading"}
                  className="flex-1 text-sm rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1B2178]/30 transition disabled:opacity-50 bg-gray-50"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || session.state === "loading"}
                  className="w-9 h-9 rounded-xl bg-[#1B2178] text-white flex items-center justify-center hover:bg-[#141a5e] transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger button */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-[#1B2178] flex items-center justify-center shadow-xl shadow-[#1B2178]/40 hover:shadow-2xl hover:shadow-[#1B2178]/50 hover:scale-105 transition-all duration-300"
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1.8 }}
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.div
              key="bot"
              initial={{ rotate: 15, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -15, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center"
            >
              {/* Robot face */}
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Antenna */}
                <line x1="18" y1="2" x2="18" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="18" cy="2" r="2" fill="#93c5fd"/>
                {/* Head */}
                <rect x="6" y="8" width="24" height="20" rx="5" fill="white"/>
                {/* Eyes */}
                <rect x="11" y="14" width="5" height="5" rx="1.5" fill="#1B2178"/>
                <rect x="20" y="14" width="5" height="5" rx="1.5" fill="#1B2178"/>
                {/* Eye shine */}
                <rect x="13" y="15" width="1.5" height="1.5" rx="0.5" fill="white"/>
                <rect x="22" y="15" width="1.5" height="1.5" rx="0.5" fill="white"/>
                {/* Smile */}
                <path d="M13 23 Q18 27 23 23" stroke="#1B2178" strokeWidth="2" strokeLinecap="round" fill="none"/>
                {/* Ears */}
                <rect x="3" y="14" width="3" height="6" rx="1.5" fill="white"/>
                <rect x="30" y="14" width="3" height="6" rx="1.5" fill="white"/>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread dot */}
        {hasNewMessage && !open && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white"
          />
        )}
      </motion.button>
    </>
  );
}
