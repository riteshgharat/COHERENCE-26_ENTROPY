import { useState, useRef, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Sparkles,
  User,
  TrendingUp,
  BarChart3,
  MessageCircle,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ── General Q&A knowledge base ──
const GENERAL_QA: { pattern: RegExp; answer: string }[] = [
  {
    pattern: /what (is|are|does) (this|the) (tool|platform|app|system)/i,
    answer: `## About This Platform\n\nThis is an **AI-powered outreach automation platform** that helps you:\n\n- **Import leads** from CSV, Excel, or Google Sheets\n- **Build workflows** with visual drag-and-drop nodes\n- **Send multi-channel messages** via Email, LinkedIn & WhatsApp\n- **Track analytics** on opens, replies and conversions\n- **Use AI** to draft personalised messages and optimise campaigns\n\n> Think of it as your intelligent sales co-pilot.`,
  },
  {
    pattern: /how (do i|to|can i) (start|begin|create|set ?up)/i,
    answer: `## Getting Started\n\n1. **Import Leads** — Go to the Leads page and upload a CSV/Excel file or connect Google Sheets\n2. **Create a Workflow** — Head to Workflows, pick a template or start from scratch\n3. **Configure Nodes** — Add message nodes (Email / LinkedIn / WhatsApp) and set delays\n4. **Run the Workflow** — Hit *Execute* to start your outreach sequence\n5. **Monitor Results** — Check the Analytics dashboard for live stats\n\n> **Tip:** Start with a small batch (50–100 leads) to test your messaging before scaling.`,
  },
  {
    pattern: /what (channels?|platforms?) (are|do you) support/i,
    answer: `## Supported Channels\n\n| Channel | Status | Best For |\n|---------|--------|----------|\n| **Email** | ✅ Full support | Cold outreach at scale |\n| **LinkedIn** | ✅ Full support | Professional B2B outreach |\n| **WhatsApp** | ✅ Full support | High-engagement follow-ups |\n\nYou can combine channels in a single workflow for **multi-touch sequences**.`,
  },
  {
    pattern: /how (does|do) (the )?ai|what can (the )?ai do/i,
    answer: `## AI Capabilities\n\n- **Message Generation** — Draft personalised cold emails, LinkedIn messages and WhatsApp texts based on lead data\n- **Conversation Replies** — AI generates context-aware follow-up replies when leads respond\n- **Workflow Suggestions** — Describe your campaign goal and AI builds a full workflow with nodes and timing\n- **Performance Analysis** — Ask me about your stats and I'll provide data-driven insights\n\nAll AI features use **Groq** or **Gemini** as the language model provider.`,
  },
  {
    pattern: /what (is|are) (a )?workflow|how (does|do) workflow/i,
    answer: `## Workflows\n\nA workflow is a **visual automation pipeline** that defines your outreach sequence:\n\n- **Trigger Node** — Starts the flow (e.g., new lead imported)\n- **Message Nodes** — Send via Email, LinkedIn, or WhatsApp\n- **Delay Nodes** — Wait hours or days between steps\n- **Condition Nodes** — Branch based on lead status or replies\n- **AI Nodes** — Generate dynamic message content\n\nWorkflows execute automatically once started, processing each lead through the pipeline.`,
  },
  {
    pattern: /how (do i|to|can i) import|upload (leads?|csv|excel|data)/i,
    answer: `## Importing Leads\n\n### From CSV / Excel\n1. Go to **Leads** page\n2. Click **Import** and drop your file\n3. The system auto-maps columns (name, email, company, industry, etc.)\n4. Duplicates are skipped based on email address\n\n### From Google Sheets\n1. Add a **Sheets Import** node in your workflow\n2. Paste the Sheet URL and configure column mapping\n3. Run the workflow — leads sync automatically\n\n> Supported formats: **.csv**, **.xlsx**, **.xls**`,
  },
  {
    pattern: /help|what can (you|i) (do|ask)/i,
    answer: `## What I Can Help With\n\n- **Campaign Performance** — "How is my campaign performing?"\n- **Channel Analysis** — "Which channels have the best response rate?"\n- **Message Tips** — "How can I improve my outreach messaging?"\n- **Workflow Suggestions** — "Suggest a workflow for SaaS founders"\n- **Platform Help** — "How do I import leads?" / "What channels are supported?"\n- **AI Features** — "What can the AI do?"\n\nJust type your question and I'll do my best to help!`,
  },
];

function matchGeneralQA(text: string): string | null {
  for (const qa of GENERAL_QA) {
    if (qa.pattern.test(text)) return qa.answer;
  }
  return null;
}

const suggestedQueries = [
  { icon: TrendingUp, text: 'How is my campaign performing?' },
  { icon: BarChart3, text: 'Which channels have the best response rate?' },
  { icon: MessageCircle, text: 'How can I improve my outreach messaging?' },
  { icon: Lightbulb, text: 'Suggest a workflow for SaaS founders' },
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      content: 'Hello! I\'m your AI campaign analyst. I can help you understand your outreach performance, suggest improvements, and generate workflow recommendations.\n\nWhat would you like to know?',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const message = text || input;
    if (!message.trim() || isTyping) return;

    const userMsg: Message = {
      id: messages.length,
      role: 'user',
      content: message,
      timestamp: 'Just now',
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    // Artificial thinking delay (5-10 seconds)
    const delay = 5000 + Math.random() * 5000;
    await new Promise((r) => setTimeout(r, delay));

    // Check general Q&A first
    const qaAnswer = matchGeneralQA(message);
    if (qaAnswer) {
      setMessages((prev) => [
        ...prev,
        { id: updatedMessages.length, role: 'assistant', content: qaAnswer, timestamp: 'Just now' },
      ]);
      setIsTyping(false);
      return;
    }

    try {
      const chatHistory = updatedMessages
        .filter(m => m.id > 0) // skip initial greeting
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_URL}/api/v1/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        id: updatedMessages.length,
        role: 'assistant',
        content: data.reply || 'Sorry, I couldn\'t generate a response.',
        timestamp: 'Just now',
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const aiMsg: Message = {
        id: updatedMessages.length,
        role: 'assistant',
        content: 'Failed to reach the AI service. Make sure the backend is running.',
        timestamp: 'Just now',
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col -m-6 animate-fade-in">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={14} />
                </div>
              )}
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md whitespace-pre-wrap'
                      : 'bg-muted rounded-bl-md prose prose-sm prose-invert max-w-none [&_table]:text-xs [&_th]:px-2 [&_td]:px-2 [&_th]:py-1 [&_td]:py-1'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 block px-1">{msg.timestamp}</span>
              </div>
              {msg.role === 'user' && (
                <div className="h-8 w-8 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <User size={14} />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Sparkles size={14} />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" />
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:200ms]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:400ms]" />
                </div>
              </div>
            </div>
          )}

          {messages.length === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
              {suggestedQueries.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q.text)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-foreground/10 transition-all text-left group"
                >
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                    <q.icon size={14} />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{q.text}</span>
                  <ArrowRight size={12} className="ml-auto text-muted-foreground/0 group-hover:text-muted-foreground transition-all shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-2 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Input
                placeholder="Ask about your campaigns..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="pr-10 rounded-xl h-10 bg-muted/50 border-transparent focus:border-border text-sm"
              />
            </div>
            <Button
              size="icon"
              className="rounded-xl h-10 w-10 shrink-0"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
            >
              <Send size={16} />
            </Button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            AI insights are based on your campaign data. Results may vary.
          </p>
        </div>
      </div>
    </div>
  );
}
