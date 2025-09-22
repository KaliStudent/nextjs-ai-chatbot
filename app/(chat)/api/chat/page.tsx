"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggle = () => {
    if (dark) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setDark(true);
    }
  };

  return (
    <button onClick={toggle} className="px-3 py-1 rounded border text-sm dark:border-gray-700">
      {dark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-xs px-4 py-2 rounded-lg shadow text-sm bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-bl-none">
        <span className="flex items-center gap-1">
          <span className="animate-bounce">●</span>
          <span className="animate-bounce delay-150">●</span>
          <span className="animate-bounce delay-300">●</span>
        </span>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({ api: "/api/chat" });
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="w-full max-w-2xl border dark:border-gray-700 rounded-lg shadow bg-white dark:bg-gray-800 p-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">🤖 AI Chatbot</h1>
          <ThemeToggle />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded">
          {messages.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center mt-10">Start chatting with me!</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-lg shadow text-sm ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-bl-none"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {isLoading && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="flex-grow border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={input}
            placeholder="Type your message..."
            onChange={handleInputChange}
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
