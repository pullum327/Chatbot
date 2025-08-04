import React, { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { role: 'system', content: '💬 Chatbot with LangChain + React' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://57.183.28.41:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
        mode: "cors" 
      });

      if (!res.ok) throw new Error('伺服器回應失敗');
      const data = await res.json();

      let reply = data.response || '⚠️ 沒有回應';
      let current = '';
      let i = 0;
      const typeNext = () => {
        if (i < reply.length) {
          current += reply[i++];
          setTypingMessage(current);
          setTimeout(typeNext, 25);
        } else {
          setMessages([...newMessages, { role: 'assistant', content: reply }]);
          setTypingMessage('');
        }
      };
      typeNext();
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: '⚠️ 發生錯誤！' }]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-window">
        <header className="chat-header">
          <h2 className="title">🤖 LangChain Chatbot</h2>
          <p className="subtitle">使用 OpenAI + LangChain 技術實作</p>
        </header>

        <div className="chat-box">
          {messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.role}`}>
              <div className="msg-content">
                <strong>{msg.role === 'user' ? '你：' : msg.role === 'assistant' ? '機器人：' : ''}</strong>
                <span>{msg.content}</span>
              </div>
            </div>
          ))}
          {loading && typingMessage && (
            <div className="msg assistant typing">
              <div className="msg-content">
                <strong>機器人：</strong><span>{typingMessage}</span>
              </div>
            </div>
          )}
        </div>

        <footer className="input-row">
          <input
            type="text"
            placeholder="輸入訊息..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={sendMessage}>送出</button>
        </footer>
      </div>
    </div>
  );
}

export default App;