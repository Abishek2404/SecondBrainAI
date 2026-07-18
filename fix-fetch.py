import re

with open('src/components/Chat.tsx', 'r') as f:
    content = f.read()

# Replace the current useEffect for fetching
old_fetch = """  useEffect(() => {
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
  }, []);"""

new_fetch = """  const fetchSidebarData = async () => {
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
  }, []);"""

content = content.replace(old_fetch, new_fetch)

# Call fetchSidebarData in handleSend after successful response
handle_send_end = """        setMessages(prev => [...prev, assistantMsg]);
      } else {"""
      
handle_send_end_new = """        setMessages(prev => [...prev, assistantMsg]);
        fetchSidebarData();
      } else {"""

content = content.replace(handle_send_end, handle_send_end_new)

with open('src/components/Chat.tsx', 'w') as f:
    f.write(content)
