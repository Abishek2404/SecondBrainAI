import { apiFetch } from '../lib/api';
import { useState, useRef } from "react";
import { Send, Bot, User, Paperclip, FileText, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachedFile?: string;
}

export function Chat() {
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [attachedDoc, setAttachedDoc] = useState<{ id: string; name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your SecondBrain AI assistant. You can ask me questions about your uploaded documents, biology notes, or computer science concepts. How can I help you today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiFetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setAttachedDoc({ id: data.data._id, name: data.data.originalName || data.data.title });
        toast.success("File attached successfully");
      } else {
        toast.error(data.error || "Failed to upload file");
      }
    } catch (error) {
      toast.error("Error uploading file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !attachedDoc) return;

    const userContent = input.trim() || "Analyze this document.";
    
    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: "user", 
      content: userContent,
      attachedFile: attachedDoc?.name
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    const docIdToSend = attachedDoc?.id;
    setAttachedDoc(null);
    setIsLoading(true);

    try {
      const response = await apiFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: userContent, 
          conversationId,
          documentId: docIdToSend
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
                {msg.attachedFile && (
                  <div className="flex items-center gap-2 mb-2 p-2 rounded bg-primary-foreground/10 border border-primary-foreground/20 text-xs">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="truncate">{msg.attachedFile}</span>
                  </div>
                )}
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
          {attachedDoc && (
            <div className="mb-3 flex items-center justify-between p-2.5 rounded-lg border bg-muted/50 text-sm">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate font-medium">{attachedDoc.name}</span>
              </div>
              <button 
                onClick={() => setAttachedDoc(null)}
                className="p-1 hover:bg-muted-foreground/20 rounded-full transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            onChange={handleFileUpload} 
          />
          <div className="relative flex items-center rounded-2xl border bg-card shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all overflow-hidden p-2">
            <div className="flex items-center gap-1 px-2 text-muted-foreground shrink-0">
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 disabled={isUploading}
                 className="p-1.5 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
               >
                 {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
               </button>
            </div>
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={isUploading ? "Uploading..." : "Ask anything about your notes, documents, or concepts..."}
              disabled={isUploading}
              className="flex-1 border-0 shadow-none focus-visible:ring-0 h-10 px-2 bg-transparent"
            />
            <Button 
              size="icon" 
              onClick={handleSend}
              disabled={(!input.trim() && !attachedDoc) || isLoading || isUploading}
              className="rounded-full h-9 w-9 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
             <button 
               onClick={() => fileInputRef.current?.click()}
               disabled={isUploading}
               className="flex items-center gap-1.5 hover:text-foreground transition-colors disabled:opacity-50"
             >
               <FileText className="h-3.5 w-3.5" /> Attach Document
             </button>
             <button 
               onClick={() => fileInputRef.current?.click()}
               disabled={isUploading}
               className="flex items-center gap-1.5 hover:text-foreground transition-colors disabled:opacity-50"
             >
               <ImageIcon className="h-3.5 w-3.5" /> Analyze Image
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
