import { apiFetch } from '../lib/api';
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Send, Bot, User, Paperclip, FileText, Image as ImageIcon, X, Loader2, 
  Mic, Edit, ThumbsUp, ThumbsDown, Copy, ArrowRight, PanelLeftClose, PanelLeft, Plus, Search, MessageSquare, Pin, MoreHorizontal,
  ChevronDown, Trash2, Bookmark, Volume2
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
          <Button variant="outline" className="rounded-xl gap-2 font-semibold h-9 px-4 text-xs" onClick={() => { setMessages([{ id: "1", role: "assistant", content: "How can I help you today?" }]); setConversationId(null); }}>
            <Trash2 className="h-4 w-4" /> Clear Chat
          </Button>
        </div>

        {/* Chat ScrollArea */}
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          <div className="max-w-4xl mx-auto flex flex-col gap-8 p-4 md:p-8 pb-40">
            
            {messages.map((msg, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id} 
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 relative mt-1">
                    <img src="/chat-logo.png" alt="AI" className="w-full h-full object-contain drop-shadow-sm bg-indigo-50 rounded-full p-1 border border-indigo-100" />
                  </div>
                )}
                
                <div className={`flex flex-col gap-2 max-w-[85%] md:max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}>
                  
                  {msg.role === "user" ? (
                    <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#F4F2FF] text-[#3B2C96] border border-[#E9E5FF] text-[15px] leading-relaxed break-words shadow-sm">
                      {msg.attachedFile && (
                        <div className="flex items-center gap-2 mb-3 p-2 rounded-xl bg-white/50 border border-indigo-100 text-xs font-medium">
                          <FileText className="h-4 w-4 text-indigo-500" />
                          <span className="truncate">{msg.attachedFile}</span>
                        </div>
                      )}
                      <span className="font-medium">{msg.content}</span>
                      <div className="flex justify-end mt-1 items-center gap-1">
                         <span className="text-[10px] text-indigo-400 font-medium">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                         <span className="text-[10px] text-indigo-500 font-bold"></span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl rounded-tl-sm px-6 py-5 bg-white border text-foreground text-[15px] leading-relaxed break-words shadow-sm w-full">
                      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent prose-table:border prose-table:rounded-lg prose-th:bg-muted/50 prose-th:p-3 prose-td:p-3 prose-td:border-t">
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
            
            <div className="relative flex flex-col rounded-[24px] border bg-white shadow-sm focus-within:shadow-md focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all overflow-hidden p-3">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={isUploading ? "Uploading..." : "Ask anything about your notes, documents, or concepts..."}
                disabled={isUploading}
                className="flex-1 border-0 shadow-none focus-visible:ring-0 min-h-[40px] px-3 bg-transparent text-base font-medium placeholder:text-muted-foreground/70"
              />
              <div className="flex items-center justify-between px-1 pt-2 mt-2 border-t border-slate-100">
                 <div className="flex items-center gap-1 md:gap-2 pt-1">
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     disabled={isUploading || isLoading}
                     className="flex items-center gap-1.5 px-3 py-2 hover:bg-slate-100 rounded-xl transition-colors text-xs font-semibold text-slate-700"
                   >
                     {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : <Paperclip className="h-4 w-4 text-slate-500" />}
                     Attach
                   </button>
                 </div>
                 
                 <div className="flex items-center gap-3">
                   <Button 
                     size="icon" 
                     onClick={() => handleSend()}
                     disabled={(!input.trim() && !attachedDoc) || isLoading || isUploading}
                     className={`rounded-full h-10 w-10 shrink-0 transition-all ${
                       input.trim() || attachedDoc 
                         ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' 
                         : 'bg-slate-100 text-slate-400'
                     }`}
                   >
                     <Send className="h-4 w-4 ml-0.5" />
                   </Button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-[320px] xl:w-[350px] shrink-0 bg-[#FAFAFA] dark:bg-background border-l hidden lg:flex flex-col overflow-y-auto">
         <div className="p-6 flex flex-col gap-8">
            
            {/* Recent Chats */}
            <div className="flex flex-col gap-4">
               <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[15px]">Recent Chats</h3>
                  <button className="text-xs text-indigo-600 hover:text-indigo-700 font-bold">View all</button>
               </div>
               
               <div className="flex flex-col gap-4">
                 <div className="flex flex-col gap-2">
                   <span className="text-xs font-semibold text-muted-foreground px-1">Today</span>
                   {history.slice(0, 3).map((chat, i) => (
                      <div 
                         key={i} 
                         className="flex items-center justify-between p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-border"
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
                         <div className="flex items-center gap-2.5 overflow-hidden">
                            <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm font-medium truncate">{chat.title}</span>
                         </div>
                         <div className="flex items-center gap-1 shrink-0 ml-2">
                            <span className="text-[10px] text-muted-foreground">{new Date(chat.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <ChevronDown className="h-3 w-3 text-muted-foreground -rotate-90" />
                         </div>
                      </div>
                   ))}
                   {history.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-xl">No chat history</div>
                   )}
                 </div>
               </div>
            </div>

            {/* Knowledge Context */}
            <div className="flex flex-col gap-4 mt-2">
               <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[15px]">Knowledge Context</h3>
                  <button className="text-xs text-indigo-600 hover:text-indigo-700 font-bold">View all</button>
               </div>
               <div className="flex items-center gap-1 -mt-2">
                 <span className="text-xs font-semibold text-muted-foreground">Connected Sources ({sources.length})</span>
               </div>
               <div className="flex flex-col gap-2">
                  {sources.slice(0, 4).map((source, i) => {
                     let color = "text-blue-600";
                     let bg = "bg-blue-50";
                     if (source.type === 'pdf') { color = "text-red-600"; bg = "bg-red-50"; }
                     else if (source.type === 'image') { color = "text-emerald-600"; bg = "bg-emerald-50"; }

                     const relevance = [98, 95, 90, 88, 85][i % 5];

                     return (
                        <div key={i} className="p-3 rounded-xl bg-white border shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.open(`/documents/${source._id}`, '_blank')}>
                           <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center">
  {source.type === 'pdf' ? (
    <img src="/pdf.svg.webp" alt="PDF" className="w-full h-full object-contain" />
  ) : (
    <img src="/Doc%20File.png" alt="Doc" className="w-full h-full object-contain" />
  )}
</div>
                           <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm font-bold truncate">{source.title}</span>
                              <div className="flex items-center justify-between mt-1">
                                 <span className="text-[11px] text-muted-foreground font-medium">PDF Document</span>
                                 <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    {relevance}% relevant
                                 </span>
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

            {/* AI Memory */}
            <div className="flex flex-col gap-4 mt-2">
               <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[15px]">AI Memory</h3>
                  <button className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">This conversation <div className="w-3 h-3 rounded-full border border-muted-foreground flex items-center justify-center text-[8px]">i</div></button>
               </div>
               <div className="grid grid-cols-4 gap-2">
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border">
                    <span className="font-bold text-lg text-slate-800">3</span>
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase">Messages</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border">
                    <span className="font-bold text-lg text-slate-800">5</span>
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase">Sources</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-orange-50 border">
                    <span className="font-bold text-lg text-orange-800">2</span>
                    <span className="text-[9px] font-semibold text-orange-600 uppercase">Minutes</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 border">
                    <span className="font-bold text-lg text-emerald-800">98%</span>
                    <span className="text-[9px] font-semibold text-emerald-600 uppercase">Relevance</span>
                  </div>
               </div>
            </div>
            
         </div>
      </div>
    </div>
  );
}