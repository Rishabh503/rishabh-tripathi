"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import {
  MessageSquare,
  X,
  SendHorizontal,
  RotateCcw,
  Sparkles,
  User,
  Bot,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DATA } from "@/data/resume";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const SUGGESTIONS = [
  "What are Rishabh's technical skills?",
  "Tell me about his DRDO work experience",
  "What did he build for Lesson Start?",
  "How can I contact Rishabh?",
];

interface ChatbotProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const TRIVIA_FACTS = [
  "Rishabh is currently in his 7th semester at MAIT with a strong 8.9 CGPA.",
  "He built 'Tamasha Bhawan', a music learning platform built with Next.js, Prisma, and Gemini AI.",
  "During his 6-week internship at DRDO's Scientific Analysis Group, Rishabh developed explainable AI models for cryptographic security analysis.",
  "Rishabh speaks English, Hindi, and Punjabi fluently.",
  "He won a college cricket tournament representing MAIT as team captain.",
  "He built 'Workflow', an AI-powered academic task tracker utilizing Next.js and MongoDB.",
  "He built 'Edunite', a hackathon project featuring course management and automated assignment grading.",
  "Rishabh has zero active backlogs in his B.Tech Computer Science and Technology curriculum.",
  "He is available immediately for internships or full-time roles, open to relocating to Pune, Mumbai, Hyderabad, Chennai, and Bangalore."
];

export default function Chatbot({ isOpen, setIsOpen }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "warning" | "sleeping" | "offline">("checking");
  const [mounted, setMounted] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  
  // Render spin-up progress variables
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize and load saved messages
  useEffect(() => {
    setMounted(true);

    const saved = localStorage.getItem("rishabh_portfolio_chat_messages");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved chat messages:", e);
        initializeGreeting();
      }
    } else {
      initializeGreeting();
    }

    checkHealth(true);
  }, []);

  // Polling loop when sleeping or checking
  useEffect(() => {
    if (backendStatus !== "sleeping" && backendStatus !== "checking") return;

    const interval = setInterval(async () => {
      const isUp = await checkHealth(false);
      if (!isUp) {
        setSecondsElapsed((prev) => {
          const next = prev + 4;
          if (next >= 90) {
            setBackendStatus("offline");
          }
          return next;
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [backendStatus]);

  // Trivia fact rotation interval
  useEffect(() => {
    if (backendStatus !== "sleeping" && backendStatus !== "checking") return;

    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % TRIVIA_FACTS.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [backendStatus]);

  // Check health status once every 30 seconds if open and online
  useEffect(() => {
    if (!isOpen || backendStatus !== "online") return;
    
    const interval = setInterval(async () => {
      await checkHealth(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [isOpen, backendStatus]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  // Alert user of incoming responses if chatbot is closed
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "assistant" && !isOpen) {
      setHasNewMessage(true);
    }
  }, [messages, isOpen]);

  const initializeGreeting = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Hi! I'm Rishabh's AI assistant. 🚀\n\nI can answer questions about his skills, education, experience, or projects using factual data from his profile. What would you like to know?`,
        timestamp: Date.now(),
      },
    ]);
  };

  const checkHealth = async (isInitial = false) => {
    try {
      const res = await fetch("/api/chat", { method: "GET" });
      if (!res.ok) throw new Error("Health status returned non-200");
      const data = await res.json();
      
      if (data.status === "ok") {
        setBackendStatus("online");
        setSecondsElapsed(0);
        return true;
      } else if (data.status === "warning" || data.api_key_configured === false) {
        setBackendStatus("warning");
        setSecondsElapsed(0);
        return true;
      }
      throw new Error("Backend offline status");
    } catch (err) {
      console.error("Failed to query backend health proxy:", err);
      if (isInitial) {
        setBackendStatus("sleeping");
      }
      return false;
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    localStorage.setItem("rishabh_portfolio_chat_messages", JSON.stringify(updatedMessages));
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: text }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        role: "assistant",
        content: data.answer || "I'm sorry, but I received an empty response. Please try again.",
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);
      localStorage.setItem("rishabh_portfolio_chat_messages", JSON.stringify(finalMessages));
    } catch (error) {
      console.error("Failed to fetch response:", error);
      const assistantMsg: Message = {
        id: `assistant-err-${Date.now()}`,
        role: "assistant",
        content: "I'm having trouble connecting to my server. Please ensure the portfolio chatbot backend is running at http://localhost:8000.",
        timestamp: Date.now(),
      };
      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);
      localStorage.setItem("rishabh_portfolio_chat_messages", JSON.stringify(finalMessages));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
      initializeGreeting();
      localStorage.removeItem("rishabh_portfolio_chat_messages");
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 transition-all duration-300 ${isOpen ? "md:hidden" : ""}`}>
        <motion.button
          onClick={handleToggle}
          className="relative h-14 w-14 rounded-full bg-linear-to-r from-violet-600 to-indigo-600 dark:from-violet-500 dark:to-indigo-500 text-white flex items-center justify-center shadow-xl hover:shadow-2xl focus:outline-hidden hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          {isOpen ? (
            <X className="size-6 transition-transform duration-200" />
          ) : (
            <MessageSquare className="size-6 transition-transform duration-200" />
          )}

          {/* New message notification ping */}
          {hasNewMessage && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-white text-[8px] font-bold text-white items-center justify-center">1</span>
            </span>
          )}
        </motion.button>
      </div>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed z-50 flex flex-col border border-border bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-500 ease-in-out bottom-24 right-4 left-4 sm:left-auto sm:right-6 w-auto sm:w-96 h-[520px] max-h-[calc(100vh-10rem)] rounded-2xl md:top-0 md:bottom-0 md:right-0 md:left-auto md:h-screen md:max-h-screen md:w-1/2 md:rounded-none md:border-y-0 md:border-r-0 md:border-l"
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-border/60 bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="size-9 border border-border shadow-sm">
                    <AvatarImage src={DATA.avatarUrl} alt={DATA.name} />
                    <AvatarFallback>{DATA.initials}</AvatarFallback>
                  </Avatar>
                  {/* Status dot */}
                  <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background ${
                    backendStatus === "online" ? "bg-emerald-500 animate-pulse" :
                    backendStatus === "warning" ? "bg-amber-500 animate-pulse" :
                    backendStatus === "sleeping" ? "bg-amber-500 animate-pulse" :
                    backendStatus === "offline" ? "bg-rose-500 animate-pulse" :
                    "bg-muted-foreground/40"
                  }`} 
                  title={`API Status: ${
                    backendStatus === "online" ? "Online" :
                    backendStatus === "warning" ? "Unconfigured Key" :
                    backendStatus === "sleeping" ? "Starting Up (Render)" :
                    backendStatus === "offline" ? "Offline" :
                    "Checking Connection..."
                  }`}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    {`${DATA.name.split(" ")[0]}'s Assistant`}
                    <Sparkles className="size-3 text-indigo-500 dark:text-indigo-400" />
                  </h4>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    {backendStatus === "online" && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="size-2.5 text-emerald-500" />
                        Ask anything
                      </span>
                    )}
                    {backendStatus === "warning" && (
                      <span className="flex items-center gap-1 text-amber-500">
                        <AlertCircle className="size-2.5" />
                        Setup Required
                      </span>
                    )}
                    {backendStatus === "sleeping" && (
                      <span className="flex items-center gap-1 text-amber-500">
                        <span className="size-1.5 rounded-full bg-amber-500 animate-ping inline-block shrink-0" />
                        Starting Up...
                      </span>
                    )}
                    {backendStatus === "offline" && (
                      <span className="flex items-center gap-1 text-rose-500">
                        <AlertCircle className="size-2.5" />
                        Backend Offline
                      </span>
                    )}
                    {backendStatus === "checking" && (
                      <span className="flex items-center gap-1">
                        Connecting...
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {/* Reset History Button */}
                {messages.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                    onClick={handleClearHistory}
                    title="Clear Chat History"
                  >
                    <RotateCcw className="size-4" />
                  </Button>
                )}
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                  onClick={handleToggle}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 font-sans scroll-smooth"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 items-start ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Left avatar for assistant */}
                  {msg.role === "assistant" && (
                    <Avatar className="size-7 border border-border mt-0.5 shadow-xs">
                      <AvatarImage src={DATA.avatarUrl} alt={DATA.name} />
                      <AvatarFallback>{DATA.initials}</AvatarFallback>
                    </Avatar>
                  )}

                  {/* Message Bubble */}
                  <div className="flex flex-col gap-1 max-w-[82%]">
                    <div
                      className={`px-3.5 py-2.5 text-sm rounded-2xl leading-relaxed shadow-xs ${
                        msg.role === "user"
                          ? "bg-linear-to-r from-violet-600 to-indigo-600 dark:from-violet-500 dark:to-indigo-500 text-white rounded-tr-xs self-end ml-auto"
                          : "bg-muted/80 border border-border/50 text-foreground rounded-tl-xs"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-sm font-sans space-y-1.5 text-foreground leading-relaxed break-words
                          [&_p]:mb-1 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5 [&_a]:text-indigo-500 dark:[&_a]:text-indigo-400 [&_a]:underline hover:[&_a]:text-indigo-600 [&_strong]:font-semibold [&_code]:bg-muted-foreground/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-muted-foreground/10 [&_pre]:p-2 [&_pre]:rounded [&_pre]:my-2 [&_pre]:overflow-x-auto"
                        >
                          <Markdown>
                            {msg.content}
                          </Markdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      )}
                    </div>
                    {/* Timestamp */}
                    <span
                      className={`text-[9px] text-muted-foreground/70 px-1 ${
                        msg.role === "user" ? "self-end" : "self-start"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {/* Render trivia box if server is spinning up */}
              {backendStatus === "sleeping" && (
                <div className="border border-indigo-500/20 bg-indigo-500/5 rounded-2xl p-4.5 space-y-4 my-2 shadow-xs ml-9">
                  <div className="flex items-center gap-3">
                    <div className="relative size-8 shrink-0 flex items-center justify-center bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-xl">
                      <div className="absolute inset-0 rounded-xl border-2 border-indigo-500/30 animate-ping" />
                      <Bot className="size-4 animate-bounce" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-semibold text-foreground">Waking up Rishabh's AI...</h5>
                      <p className="text-[10px] text-muted-foreground leading-none">Render services sleep after 15 mins. Booting takes ~50s.</p>
                    </div>
                    <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded-md">{Math.max(0, 90 - secondsElapsed)}s</span>
                  </div>

                  {/* Rotating Did You Know Fact */}
                  <div className="h-[76px] flex flex-col justify-center border-t border-indigo-500/10 pt-3 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentFactIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="text-xs leading-relaxed text-foreground/90 font-sans"
                      >
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">Did you know? </span>
                        {TRIVIA_FACTS[currentFactIndex]}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="bg-linear-to-r from-violet-500 to-indigo-500 h-1.5 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${Math.min(100, (secondsElapsed / 90) * 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {/* Render offline error if server doesn't respond after 90 seconds */}
              {backendStatus === "offline" && (
                <div className="border border-rose-500/20 bg-rose-500/5 rounded-2xl p-4.5 space-y-2 my-2 shadow-xs ml-9 flex items-start gap-3">
                  <AlertCircle className="size-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h5 className="text-xs font-semibold text-rose-500">Connection Offline</h5>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Could not reach Rishabh's AI server. If you just deployed, make sure the Render instance hasn't crashed or that the backend is running.
                    </p>
                  </div>
                </div>
              )}

              {/* Suggestions chips (only show after initial greeting to encourage interaction) */}
              {messages.length === 1 && !isLoading && backendStatus === "online" && (
                <div className="pl-9 space-y-2 mt-2">
                  <p className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <HelpCircle className="size-3 text-indigo-500" /> Suggested questions
                  </p>
                  <div className="flex flex-col gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSend(suggestion)}
                        className="text-left w-full border border-border/80 bg-background/50 hover:bg-muted/80 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-[0.99] cursor-pointer"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-2.5 items-start justify-start">
                  <Avatar className="size-7 border border-border mt-0.5">
                    <AvatarImage src={DATA.avatarUrl} alt={DATA.name} />
                    <AvatarFallback>{DATA.initials}</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted/80 border border-border/50 px-3.5 py-3 rounded-2xl rounded-tl-xs flex items-center justify-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce delay-200" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce delay-300" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            {backendStatus === "sleeping" ? (
              <div className="p-3 border-t border-border/50 bg-muted/20 text-center text-xs text-muted-foreground flex items-center justify-center gap-2 font-sans select-none">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span>Waking up server... Chat input will enable shortly</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="p-3 border-t border-border/50 bg-muted/20 flex gap-2 items-center"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    backendStatus === "offline" 
                      ? "AI server is offline" 
                      : backendStatus === "checking" 
                      ? "Connecting to AI..." 
                      : "Ask Rishabh's AI assistant..."
                  }
                  disabled={isLoading || backendStatus === "offline" || backendStatus === "checking"}
                  className="flex-1 h-10 px-3.5 rounded-xl border border-border/80 bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring disabled:opacity-60 placeholder:text-muted-foreground animate-none"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading || backendStatus === "offline" || backendStatus === "checking"}
                  size="icon"
                  className="h-10 w-10 rounded-xl flex items-center justify-center bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md disabled:shadow-none hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 cursor-pointer"
                >
                  <SendHorizontal className="size-4" />
                </Button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
