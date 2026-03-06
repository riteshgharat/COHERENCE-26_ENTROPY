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

    try {
      const chatHistory = updatedMessages
        .filter(m => m.id > 0) // skip initial greeting
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('http://localhost:8000/api/v1/ai/chat', {
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
