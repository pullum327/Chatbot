import React, { useState, useRef, useEffect } from 'react';
import { SSE } from 'sse.js';
import './App.css';

function App() {
  const [conversation, setConversation] = useState([
    { role: 'system', content: '💬 SSE Chatbot' }
  ]);
  const [input, setInput] = useState('');
  const [partial, setPartial] = useState('');
  const [loading, setLoading] = useState(false);
  const sourceRef = useRef(null);

  const sendMessage = () => {
    if (!input.trim()) return;

    // 1. 推入使用者訊息
    setConversation(prev => [
      ...prev,
      { role: 'user', content: input }
    ]);
    setPartial('');
    setLoading(true);

    // 2. 關閉舊連線
    if (sourceRef.current) {
      sourceRef.current.close();
    }

    // 3. 建立新的 SSE 連線到你自己的後端
    const url = `http://57.183.28.41:5000/chat?message=${encodeURIComponent(input)}`;
    const source = new SSE(url);
    sourceRef.current = source;

    let buffer = '';
    source.addEventListener('message', (e) => {
      const data = e.data;
      if (data === '[DONE]') {
        // 完成：把累積的 buffer 推入歷史
        setConversation(prev => [
          ...prev,
          { role: 'assistant', content: buffer }
        ]);
        setLoading(false);
        source.close();
      } else {
        // 逐字累積並顯示
        buffer += data;
        setPartial(buffer);
      }
    });

    source.addEventListener('error', (err) => {
      console.error('SSE error', err);
      setConversation(prev => [
        ...prev,
        { role: 'assistant', content: '⚠️ 無法取得串流回應' }
      ]);
      setLoading(false);
      source.close();
    });

    // 4. 啟動串流
    source.stream();

    // 5. 清空輸入框
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      sendMessage();
    }
  };

  // 元件卸載時，關閉 SSE
  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        sourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="chat-wrapper">
      <div className="chat-window">
        <header className="chat-header">
          <h2 className="title">🤖 SSE.js 聊天機器人</h2>
          <p className="subtitle">與後端 SSE 串流互動</p>
        </header>

        <div className="chat-box">
          {conversation.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="msg-content">
                <strong>
                  {m.role === 'user' ? '你：' :
                   m.role === 'assistant' ? '機器人：' :
                   ''}
                </strong>
                <span>{m.content}</span>
              </div>
            </div>
          ))}

          {loading && partial && (
            <div className="msg assistant typing">
              <div className="msg-content">
                <strong>機器人：</strong>
                <span>{partial}</span>
              </div>
            </div>
          )}
        </div>

        <footer className="input-row">
          <input
            type="text"
            placeholder="輸入訊息..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading}>
            {loading ? '傳送中…' : '送出'}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default App;
