import { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  const addMessage = (role, content, language = 'hi') => {
    const message = {
      id: Date.now(),
      role,
      content,
      language,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, message]);
    setConversationHistory(prev => [...prev, { role, content }]);
    return message;
  };

  const clearMessages = () => {
    setMessages([]);
    setConversationHistory([]);
  };

  const setTyping = (typing) => {
    setIsTyping(typing);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      isTyping,
      conversationHistory,
      addMessage,
      clearMessages,
      setTyping
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
