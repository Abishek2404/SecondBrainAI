import re

with open('src/components/Chat.tsx', 'r') as f:
    content = f.read()

# Add state variables
state_vars = """
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your SecondBrain AI assistant. You can ask me questions about your uploaded documents, notes, or concepts. How can I help you today?"
    }
  ]);
  const [history, setHistory] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
"""

content = re.sub(r'  const \[messages, setMessages\] = useState<Message\[\]>\(\[.*?\]\);', state_vars, content, flags=re.DOTALL)

# Add useEffect for fetching data
use_effect = """
  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
  }, []);

  useEffect(() => {
"""

content = content.replace("  useEffect(() => {\n    const q = searchParams", use_effect + "    const q = searchParams")

# Replace sources rendering
sources_render_target = r'            \{\/\* Sources \*\/\}.*?            \{\/\* Chat History \*\/\}'

sources_render_new = """            {/* Sources */}
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

            {/* Chat History */}"""

content = re.sub(sources_render_target, sources_render_new, content, flags=re.DOTALL)


# Replace chat history rendering
history_render_target = r'            \{\/\* Chat History \*\/\}.*?            <\/div>\n            \n         <\/div>\n      <\/div>'

history_render_new = """            {/* Chat History */}
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
      </div>"""

content = re.sub(history_render_target, history_render_new, content, flags=re.DOTALL)

with open('src/components/Chat.tsx', 'w') as f:
    f.write(content)
