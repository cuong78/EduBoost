import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, Bot, Loader2, Trash2 } from 'lucide-react';
import { apiClient } from '../../services/api';

const STORAGE_KEY = 'eduboost_chat_history';

const AIChat = () => {
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch { /* ignore */ }
        return [
            { id: 1, role: 'assistant', text: 'Chào em! Thầy là Gia sư AI EduBoost 🎓. Em cần thầy giúp gì về bài học hôm nay không?' }
        ];
    });
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    // Persist chat history to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
        } catch { /* ignore */ }
    }, [messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg = { id: Date.now(), role: 'user', text: input.trim() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);
        setError(null);

        // Build history for API (exclude initial greeting)
        const history = newMessages
            .filter(m => m.id !== 1)
            .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }));

        try {
            const { data } = await apiClient.post('/ai-chat/message', {
                message: userMsg.text,
                history: history.slice(0, -1), // send history before current message
            });

            const aiMsg = { id: Date.now() + 1, role: 'assistant', text: data.reply };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            const errText = err?.response?.data?.message || 'Xin lỗi, gia sư AI đang bận. Hãy thử lại sau nhé!';
            setError(errText);
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: errText, isError: true }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuickPrompt = (prompt) => setInput(prompt);

    const clearHistory = () => {
        localStorage.removeItem(STORAGE_KEY);
        setMessages([{ id: Date.now(), role: 'assistant', text: 'Đã xóa lịch sử. Em cần hỏi gì thầy nghe?' }]);
    };

    // Render message content (may contain SVG)
    const renderContent = (text) => (
        <span dangerouslySetInnerHTML={{ __html: text
            .replace(/\n/g, '<br/>')
            // SVG is already inline — just let it render
        }} />
    );

    return (
        <div className="chat-container">
            <div className="chat-interface glass">
                {/* Header */}
                <div className="chat-header">
                    <div className="ai-avatar-wrapper">
                        <div className="ai-avatar">
                            <Sparkles size={24} color="white" />
                        </div>
                        <div className="online-badge"></div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3>Gia sư AI EduBoost</h3>
                        <div className="status-text">
                            <span className="dot"></span> Đang trực tuyến
                        </div>
                    </div>
                    <button
                        onClick={clearHistory}
                        title="Xóa lịch sử trò chuyện"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ds-text-muted)', padding: '6px', borderRadius: '8px' }}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="chat-messages">
                    {messages.map(msg => (
                        <div key={msg.id} className={`message ${msg.role === 'user' ? 'user' : 'ai'}`}>
                            <div className="avatar-small">
                                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                            </div>
                            <div className="message-content">
                                <div className="sender-name">
                                    {msg.role === 'assistant' ? 'EduBoost AI' : 'Bạn'}
                                </div>
                                <div className={`message-bubble ${msg.isError ? 'error' : ''}`}>
                                    {renderContent(msg.text)}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="message ai">
                            <div className="avatar-small"><Bot size={16} /></div>
                            <div className="message-content">
                                <div className="sender-name">EduBoost AI</div>
                                <div className="message-bubble typing">
                                    <Loader2 className="animate-spin" size={16} />
                                    <span>Đang soạn tin...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                {messages.length < 3 && (
                    <div className="quick-prompts">
                        <button onClick={() => handleQuickPrompt('Giải giúp em bài toán này')} className="prompt-chip">📐 Giải toán</button>
                        <button onClick={() => handleQuickPrompt('Vẽ biểu đồ Ven cho em hiểu')} className="prompt-chip">🔵 Biểu đồ Ven</button>
                        <button onClick={() => handleQuickPrompt('Ôn tập kiến thức Vật Lý 12')} className="prompt-chip">⚛️ Ôn Lý</button>
                        <button onClick={() => handleQuickPrompt('Lập kế hoạch học tập cho em')} className="prompt-chip">📅 Kế hoạch học</button>
                    </div>
                )}

                {/* Input Area */}
                <div className="chat-input-area">
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Nhập câu hỏi của bạn..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            disabled={isTyping}
                        />
                        <button
                            className={`send-btn ${(!input.trim() || isTyping) ? 'disabled' : ''}`}
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                        >
                            {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--ds-text-muted)', margin: '0.4rem 0 0', textAlign: 'center' }}>
                        AI có thể mắc lỗi. Kiểm tra lại thông tin quan trọng.
                    </p>
                </div>
            </div>

            <style>{`
                .chat-container {
                    height: calc(100vh - 100px);
                    display: flex;
                    justify-content: center;
                    padding: 1rem;
                    box-sizing: border-box;
                }

                .chat-interface {
                    width: 100%;
                    max-width: 900px;
                    display: flex;
                    flex-direction: column;
                    background: rgba(255, 255, 255, 0.85);
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.08);
                    border: 1px solid rgba(255,255,255, 0.6);
                }

                .chat-header {
                    padding: 1.25rem 2rem;
                    border-bottom: 1px solid rgba(0,0,0,0.06);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: rgba(255,255,255,0.95);
                    backdrop-filter: blur(10px);
                }

                .ai-avatar-wrapper { position: relative; }

                .ai-avatar {
                    width: 52px; height: 52px;
                    background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
                    border-radius: 16px;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
                }

                .online-badge {
                    position: absolute; bottom: -2px; right: -2px;
                    width: 14px; height: 14px;
                    background: #22c55e; border: 3px solid white; border-radius: 50%;
                }

                .chat-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--color-text-primary); }

                .status-text { font-size: 0.85rem; color: var(--color-text-secondary); display: flex; align-items: center; gap: 6px; margin-top: 2px; }
                .status-text .dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite; }

                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }

                .chat-messages {
                    flex: 1; padding: 2rem; overflow-y: auto;
                    display: flex; flex-direction: column; gap: 1.5rem;
                    scroll-behavior: smooth;
                }

                .message { display: flex; gap: 1rem; max-width: 82%; animation: slideIn 0.3s ease-out; }
                @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .message.user { align-self: flex-end; flex-direction: row-reverse; }
                .message.ai { align-self: flex-start; }

                .avatar-small {
                    width: 32px; height: 32px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                    background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    color: var(--color-text-secondary); border: 1px solid rgba(0,0,0,0.05);
                }
                .message.user .avatar-small { background: var(--color-accent-1); color: white; }

                .message-content { display: flex; flex-direction: column; gap: 4px; }
                .message.user .message-content { align-items: flex-end; }

                .sender-name { font-size: 0.75rem; color: var(--color-text-secondary); font-weight: 600; padding: 0 4px; }

                .message-bubble {
                    padding: 0.8rem 1.25rem; border-radius: 20px;
                    font-size: 0.95rem; line-height: 1.6;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }
                .message.user .message-bubble {
                    background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
                    color: white; border-top-right-radius: 4px;
                }
                .message.ai .message-bubble {
                    background: white; color: var(--color-text-primary);
                    border: 1px solid rgba(0,0,0,0.05); border-top-left-radius: 4px;
                }
                .message-bubble.error { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
                .message-bubble.typing { display: flex; align-items: center; gap: 8px; color: var(--color-text-secondary); padding: 0.6rem 1rem; font-size: 0.85rem; }
                .message-bubble svg { max-width: 100%; height: auto; }

                .quick-prompts { padding: 0 2rem 1rem; display: flex; gap: 0.8rem; overflow-x: auto; }
                .prompt-chip {
                    padding: 0.5rem 1rem; background: rgba(255,255,255,0.6);
                    border: 1px solid rgba(0,0,0,0.08); border-radius: 99px;
                    font-size: 0.85rem; color: var(--color-text-secondary);
                    cursor: pointer; white-space: nowrap; transition: all 0.2s; font-family: var(--font-main);
                }
                .prompt-chip:hover { background: white; border-color: var(--color-accent-1); color: var(--color-accent-1); transform: translateY(-2px); }

                .chat-input-area { padding: 1.25rem 2rem 1.5rem; background: white; border-top: 1px solid rgba(0,0,0,0.06); }

                .input-group {
                    display: flex; background: #f8fafc; padding: 0.5rem;
                    border-radius: 16px; gap: 0.5rem; border: 1px solid #e2e8f0;
                    transition: all 0.2s; align-items: center;
                }
                .input-group:focus-within { border-color: var(--color-accent-1); background: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15); }
                .input-group input {
                    flex: 1; border: none; background: transparent;
                    padding: 0.6rem 1rem; font-size: 1rem; outline: none; font-family: var(--font-main); color: var(--color-text-primary);
                }
                .input-group input::placeholder { color: #94a3b8; }

                .send-btn {
                    width: 44px; height: 44px; border-radius: 12px; border: none;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s;
                    background: var(--color-accent-1); color: white;
                    box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
                }
                .send-btn:hover:not(.disabled) { transform: scale(1.05); background: var(--color-accent-2); box-shadow: 0 4px 10px rgba(99, 102, 241, 0.4); }
                .send-btn.disabled { background: #cbd5e1; cursor: not-allowed; box-shadow: none; transform: none; }

                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AIChat;
