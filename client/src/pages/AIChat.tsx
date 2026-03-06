import { useState, useRef, useEffect } from 'react';
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

const suggestedQueries = [
  { icon: TrendingUp, text: 'Why is my reply rate low this week?' },
  { icon: BarChart3, text: 'Which industry segments respond most?' },
  { icon: MessageCircle, text: 'How can I improve my outreach messaging?' },
  { icon: Lightbulb, text: 'Suggest a workflow for SaaS founders' },
];

const mockResponses: Record<string, string> = {
  'why is my reply rate low': `Based on your campaign data, here are the key factors affecting your reply rate:\n\n**1. Timing Issue** — 42% of your emails are sent between 2-4 PM, which historically has lower open rates. Try shifting to 8-10 AM.\n\n**2. Subject Line Length** — Your average subject is 68 characters. Top-performing campaigns use 35-45 characters.\n\n**3. Follow-up Gap** — You're waiting 72 hours for follow-ups. Data shows 24-48 hours yields 23% higher responses.\n\n**Recommendation:** Adjust send times, shorten subjects, and tighten follow-up windows.`,

  'which industry': `Here's the industry breakdown from your campaigns:\n\n| Industry | Reply Rate | Leads |\n|----------|-----------|-------|\n| AI/ML | **42%** | 1,400 |\n| SaaS | **38%** | 3,200 |\n| Fintech | **34%** | 2,100 |\n| DevTools | **31%** | 1,800 |\n\n**AI/ML** leads have the highest engagement, followed by **SaaS**. Consider allocating more budget to these segments.`,

  'improve': `Here are 5 data-driven ways to improve your outreach:\n\n1. **Personalize the first line** — Reference their recent work or company news. This alone can boost replies by 30%.\n\n2. **Keep it short** — Messages under 100 words get 2x more replies.\n\n3. **Add social proof** — Mention mutual connections or relevant case studies.\n\n4. **Use questions** — End with a specific, easy-to-answer question.\n\n5. **A/B test** — Test 2-3 variations per campaign to find what resonates.`,

  'suggest': `Here's a recommended workflow for reaching SaaS founders:\n\n**Day 1:** Send LinkedIn connection request with personalized note\n**Day 2:** Wait for connection acceptance\n**Day 3:** Send warm intro email referencing mutual connections\n**Day 5:** Follow up with a value-add (case study / article)\n**Day 8:** Send final follow-up with direct CTA\n\nWould you like me to generate this as a workflow in the builder?`,
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(mockResponses)) {
    if (lower.includes(key)) return response;
  }
  return `I've analyzed your campaign data. Based on your current metrics:\n\n• **12,847** total leads processed\n• **34.2%** average response rate\n• **24** active campaigns\n\nYour performance is above industry average. Would you like me to drill deeper into any specific metric or campaign?`;
}

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

  const handleSend = (text?: string) => {
    const message = text || input;
    if (!message.trim()) return;

    const userMsg: Message = {
      id: messages.length,
      role: 'user',
      content: message,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: messages.length + 1,
        role: 'assistant',
        content: getResponse(message),
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
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
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  }`}
                >
                  {msg.content}
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
