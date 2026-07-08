import { apiFetch } from '../lib/api';
import { useState } from "react";
import { Send, Bot, User, Paperclip, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function Chat() {
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your SecondBrain AI assistant. You can ask me questions about your uploaded documents, biology notes, or computer science concepts. How can I help you today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await apiFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: userMsg.content, 
          conversationId,
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setConversationId(data.data.conversationId);
        const assistantMsg: Message = {
          id: data.data.message._id || (Date.now() + 1).toString(),
          role: "assistant",
          content: data.data.message.content
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.error || "Sorry, I couldn't process that."
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Error connecting to the AI service."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background relative">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b bg-card/50 backdrop-blur-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg tracking-tight leading-none">SecondBrain Chat</h2>
            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Ask questions across your entire knowledge base</p>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4 md:p-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <Avatar className="h-8 w-8 border shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs"><Bot className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              )}
              <div className={`rounded-2xl px-4 md:px-5 py-3 md:py-3.5 max-w-[90%] md:max-w-[85%] text-sm shadow-sm ${
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-br-sm" 
                  : "bg-card border text-card-foreground rounded-bl-sm"
              }`}>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <Avatar className="h-8 w-8 border shrink-0">
                  <AvatarFallback className="bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-xs">JL</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <Avatar className="h-8 w-8 border shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs"><Bot className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div className="rounded-2xl px-5 py-4 bg-card border text-card-foreground rounded-bl-sm flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 bg-background border-t shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center rounded-2xl border bg-card shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all overflow-hidden p-2">
            <div className="flex items-center gap-1 px-2 text-muted-foreground shrink-0">
               <button className="p-1.5 hover:bg-muted rounded-full transition-colors"><Paperclip className="h-4 w-4" /></button>
            </div>
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask anything about your notes, documents, or concepts..."
              className="flex-1 border-0 shadow-none focus-visible:ring-0 h-10 px-2 bg-transparent"
            />
            <Button 
              size="icon" 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="rounded-full h-9 w-9 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
             <button className="flex items-center gap-1.5 hover:text-foreground transition-colors"><FileText className="h-3.5 w-3.5" /> Attach Document</button>
             <button className="flex items-center gap-1.5 hover:text-foreground transition-colors"><ImageIcon className="h-3.5 w-3.5" /> Analyze Image</button>
          </div>
        </div>
      </div>
    </div>
  );
}
