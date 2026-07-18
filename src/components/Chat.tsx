import { apiFetch } from '../lib/api';
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Send, Bot, User, Paperclip, FileText, Image as ImageIcon, X, Loader2, 
  Mic, Edit, ThumbsUp, ThumbsDown, Copy, ArrowRight, PanelLeftClose, PanelLeft, Plus, Search, MessageSquare, Pin, MoreHorizontal,
  ChevronDown
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "./AuthProvider";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachedFile?: string;
  citations?: any[];
}

export function Chat() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [attachedDoc, setAttachedDoc] = useState<{ id: string; name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);


  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your SecondBrain AI assistant. You can ask me questions about your uploaded documents, notes, or concepts. How can I help you today?"
    }
  ]);
  const [history, setHistory] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);


  const fetchSidebarData = async () => {
    try {
      const [chatRes, docsRes] = await Promise.all([
        apiFetch("/api/chat"),
        apiFetch("/api/documents?limit=5")
      ]);
      const chatData = await chatRes.json();
      const docsData = await docsRes.json();
      
      if (chatData.success) {
        setHistory(chatData.data);
      }
      if (docsData.success) {
        setSources(docsData.data);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  useEffect(() => {
    fetchSidebarData();
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setInput(q);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("q");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

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

  const handleSend = async (textToUse?: string) => {
    const text = textToUse || input;
    if (!text.trim() && !attachedDoc) return;

    const userContent = text.trim() || "Analyze this document.";
    
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
        fetchSidebarData();
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

  const suggestedPrompts = [
    "Summarize my recent biology notes",
    "Explain the concept of React Hooks",
    "Generate a quiz from my history document",
    "Create a study schedule for next week"
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background relative overflow-hidden">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative border-r">
        {/* Header */}
        <div className="px-6 md:px-12 pt-8 pb-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Chat</h1>
            <p className="text-sm text-muted-foreground mt-1 hidden sm:block">Your AI study assistant. Ask anything about your notes and documents.</p>
          </div>
          <Button variant="outline" className="rounded-xl gap-2 font-medium h-10 px-4" onClick={() => { setMessages([{ id: "1", role: "assistant", content: "How can I help you today?" }]); setConversationId(null); }}>
            <Edit className="h-4 w-4" /> New Chat
          </Button>
        </div>

        {/* Chat ScrollArea */}
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          <div className="max-w-4xl mx-auto flex flex-col gap-8 p-4 md:p-8 pb-40">
            
            {messages.length === 1 && (
              <div className="flex flex-col py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 {/* Reserved for future */}
              </div>
            )}

            {messages.map((msg, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id} 
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-black dark:bg-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Bot className="h-4 w-4 text-white dark:text-black" />
                  </div>
                )}
                
                <div className={`flex flex-col gap-2 max-w-[85%] md:max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}>
                  
                  {msg.role === "user" ? (
                    <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#2C2C2C] text-white text-[15px] leading-relaxed break-words shadow-sm">
                      {msg.attachedFile && (
                        <div className="flex items-center gap-2 mb-3 p-2 rounded-xl bg-white/10 border border-white/20 text-xs font-medium">
                          <FileText className="h-4 w-4 text-white" />
                          <span className="truncate">{msg.attachedFile}</span>
                        </div>
                      )}
                      {msg.content}
                      <div className="flex justify-end mt-1">
                         <span className="text-[10px] text-white/50">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ✓✓</span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl rounded-tl-sm px-6 py-5 bg-muted/30 border text-foreground text-[15px] leading-relaxed break-words shadow-sm w-full">
                      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
                        <ReactMarkdown
                          components={{
                            code({node, inline, className, children, ...props}: any) {
                              const match = /language-(\w+)/.exec(className || '')
                              return !inline && match ? (
                                <div className="rounded-xl overflow-hidden border my-4 bg-[#1E1E1E]">
                                  <div className="flex items-center justify-between px-4 py-2 text-xs text-zinc-400 font-medium">
                                    <span>{match[1]}</span>
                                    <button className="flex items-center gap-1.5 hover:text-white transition-colors bg-white/5 px-2 py-1 rounded-md"><Copy className="h-3 w-3"/> Copy</button>
                                  </div>
                                  <SyntaxHighlighter
                                    {...props}
                                    children={String(children).replace(/\n$/, '')}
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{ margin: 0, padding: '16px', borderRadius: 0, background: 'transparent' }}
                                  />
                                </div>
                              ) : (
                                <code {...props} className={`${className} bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm`}>
                                  {children}
                                </code>
                              )
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      
                      {/* Interaction icons for assistant message */}
                      {idx !== 0 && (
                        <div className="flex items-center justify-between mt-4 pt-3 border-t">
                           <span className="text-xs text-muted-foreground">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                           <div className="flex items-center gap-2">
                              <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                                <ThumbsUp className="h-4 w-4" />
                              </button>
                              <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                                <ThumbsDown className="h-4 w-4" />
                              </button>
                              <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                                <Copy className="h-4 w-4" />
                              </button>
                           </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-black dark:bg-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="h-4 w-4 text-white dark:text-black" />
                </div>
                <div className="flex items-center gap-1.5 h-8">
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-background via-background to-transparent pt-20 pointer-events-none">
          <div className="max-w-4xl mx-auto w-full pointer-events-auto">
            
            {/* Suggested Prompts before input box */}
            {messages.length === 1 && (
               <div className="flex flex-wrap gap-2 mb-4 justify-center">
                  {[
                     { text: "Show a Flexbox example", icon: Bot },
                     { text: "Difference between Grid and Flexbox", icon: Bot },
                     { text: "Create a responsive grid example", icon: Bot },
                  ].map((p, i) => (
                     <button key={i} onClick={() => handleSend(p.text)} className="flex items-center gap-2 px-4 py-2.5 bg-background border rounded-full text-sm font-medium hover:bg-muted transition-colors shadow-sm">
                        <p.icon className="h-4 w-4 text-muted-foreground" />
                        {p.text}
                     </button>
                  ))}
               </div>
            )}

            {attachedDoc && (
              <div className="mb-3 flex items-center justify-between p-2.5 rounded-xl border bg-background shadow-sm text-sm w-fit max-w-xs ml-4">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                  </div>
                  <span className="truncate font-medium">{attachedDoc.name}</span>
                </div>
                <button 
                  onClick={() => setAttachedDoc(null)}
                  className="p-1 hover:bg-muted-foreground/20 rounded-full transition-colors shrink-0 ml-2"
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
            
            <div className="relative flex flex-col rounded-2xl border bg-background shadow-sm focus-within:shadow-md focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all overflow-hidden p-3">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={isUploading ? "Uploading..." : "Ask anything about your notes, documents, or concepts..."}
                disabled={isUploading}
                className="flex-1 border-0 shadow-none focus-visible:ring-0 min-h-[40px] px-2 bg-transparent text-base"
              />
              <div className="flex items-center justify-between px-1 pt-2 mt-2">
                 <div className="flex items-center gap-2">
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     disabled={isUploading || isLoading}
                     className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted rounded-full transition-colors text-sm text-muted-foreground font-medium"
                   >
                     {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                     Attach
                   </button>
                   <button 
                     className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted rounded-full transition-colors text-sm text-muted-foreground font-medium"
                   >
                     <ImageIcon className="h-4 w-4" />
                     Image
                   </button>
                   <button 
                     className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted rounded-full transition-colors text-sm text-muted-foreground font-medium"
                   >
                     <Mic className="h-4 w-4" />
                     Voice
                   </button>
                 </div>
                 
                 <div className="flex items-center gap-3">
                   <div className="hidden sm:flex flex-col border rounded-xl px-3 py-1 bg-muted/30">
                      <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">AI Model</span>
                      <span className="text-xs font-bold flex items-center gap-2">GPT-4o <ChevronDown className="w-3 h-3 text-muted-foreground"/></span>
                   </div>
                   <Button 
                     size="icon" 
                     onClick={() => handleSend()}
                     disabled={(!input.trim() && !attachedDoc) || isLoading || isUploading}
                     className={`rounded-full h-10 w-10 shrink-0 transition-all ${
                       input.trim() || attachedDoc 
                         ? 'bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 shadow-md' 
                         : 'bg-muted text-muted-foreground'
                     }`}
                   >
                     <Send className="h-4 w-4 ml-0.5" />
                   </Button>
                 </div>
              </div>
            </div>
            <div className="text-center mt-4">
              <span className="text-[11px] text-muted-foreground font-medium">AI can make mistakes. Please verify important information.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar (Sources & History) */}
      <div className="w-[320px] xl:w-[350px] shrink-0 bg-[#FAFAFA] dark:bg-background border-l hidden lg:flex flex-col overflow-y-auto">
         <div className="p-6 flex flex-col gap-8">
            
            {/* Sources */}
            <div className="flex flex-col gap-4">
               <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[15px]">Sources ({sources.length})</h3>
                  <button className="text-xs text-muted-foreground hover:text-foreground font-medium">View all</button>
               </div>
               <div className="flex flex-col gap-3">
                  {sources.slice(0, 3).map((source, i) => {
                     let color = "text-blue-600 dark:text-blue-400";
                     let bg = "bg-blue-100 dark:bg-blue-900/30";
                     if (source.type === 'pdf') { color = "text-red-600 dark:text-red-400"; bg = "bg-red-100 dark:bg-red-900/30"; }
                     else if (source.type === 'image') { color = "text-emerald-600 dark:text-emerald-400"; bg = "bg-emerald-100 dark:bg-emerald-900/30"; }

                     return (
                        <div key={i} className="p-3 rounded-xl bg-background border shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.open(`/documents/${source._id}`, '_blank')}>
                           <div className={`p-1.5 ${bg} rounded-lg shrink-0`}>
                              <FileText className={`h-5 w-5 ${color}`} />
                           </div>
                           <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm font-semibold truncate">{source.title}</span>
                              <div className="flex items-center justify-between mt-1">
                                 <span className="text-xs text-muted-foreground">Document</span>
                                 <span className="text-xs text-emerald-600 font-medium">Available</span>
                              </div>
                           </div>
                        </div>
                     )
                  })}
                  {sources.length === 0 && (
                     <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-xl">No sources found</div>
                  )}
               </div>
            </div>

            {/* Chat History */}
            <div className="flex flex-col gap-4">
               <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[15px]">Chat History</h3>
                  <button className="text-xs text-muted-foreground hover:text-foreground font-medium">Clear all</button>
               </div>
               <div className="flex flex-col gap-2">
                  {history.slice(0, 5).map((chat, i) => {
                     const date = new Date(chat.updatedAt);
                     const isToday = new Date().toDateString() === date.toDateString();
                     const timeStr = isToday ? date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : date.toLocaleDateString();
                     
                     return (
                        <div 
                           key={i} 
                           className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border"
                           onClick={async () => {
                              try {
                                 const res = await apiFetch(`/api/chat/${chat._id}`);
                                 const data = await res.json();
                                 if (data.success) {
                                    setConversationId(chat._id);
                                    setMessages(data.data.messages.map((m: any) => ({
                                       id: m._id || Math.random().toString(),
                                       role: m.role === 'model' ? 'assistant' : m.role,
                                       content: m.content
                                    })));
                                 }
                              } catch (e) {
                                 toast.error("Failed to load conversation");
                              }
                           }}
                        >
                           <div className="flex items-center gap-3 overflow-hidden">
                              <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="text-sm font-medium truncate">{chat.title}</span>
                           </div>
                           <span className="text-xs text-muted-foreground shrink-0 ml-2">{timeStr}</span>
                        </div>
                     )
                  })}
                  {history.length === 0 && (
                     <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-xl">No chat history</div>
                  )}
               </div>
               {history.length > 5 && (
                  <Button variant="ghost" className="w-full mt-2 text-sm font-bold gap-2">
                    More history <ArrowRight className="h-4 w-4" />
                  </Button>
               )}
            </div>
            
         </div>
      </div>
    </div>
  );
}