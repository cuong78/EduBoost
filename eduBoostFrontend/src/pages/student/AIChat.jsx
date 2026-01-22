import { useState } from 'react';
import { Send, Mic, Sparkles } from 'lucide-react';

const AIChat = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: "Chào em! Thầy là AI EduBoost. Em cần thầy giải đáp thắc mắc gì về bài học hôm nay không?" }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate AI response
        setTimeout(() => {
            const aiMsg = { id: Date.now() + 1, sender: 'ai', text: "Thầy đã nhận được câu hỏi của em. Để thầy phân tích một chút nhé..." };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    return (
        <div className="chat-container">
            <div className="chat-interface glass">
                <div className="chat-header">
                    <div className="ai-avatar">
                        <Sparkles size={24} color="white" />
                    </div>
                    <div>
                        <h3>Gia sư AI EduBoost</h3>
                        <span className="status">Đang trực tuyến</span>
                    </div>
                </div>

                <div className="chat-messages">
                    {messages.map(msg => (
                        <div key={msg.id} className={`message ${msg.sender}`}>
                            <div className="message-bubble">
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="chat-input-area">
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Nhập câu hỏi của bạn..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button className="icon-btn"><Mic size={20} /></button>
                        <button className="send-btn" onClick={handleSend}><Send size={20} /></button>
                    </div>
                </div>
            </div>

            <style>{`
                .chat-container {
                    height: calc(100vh - 140px); /* Adjust based on layout */
                    display: flex;
                    justify-content: center;
                }

                .chat-interface {
                    width: 100%;
                    max-width: 900px;
                    display: flex;
                    flex-direction: column;
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.05);
                }

                .chat-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #f0f0f0;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: rgba(255,255,255,0.9);
                }

                .ai-avatar {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .status {
                    font-size: 0.85rem;
                    color: #4caf50;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .status::before {
                    content: "";
                    width: 8px;
                    height: 8px;
                    background: #4caf50;
                    border-radius: 50%;
                }

                .chat-messages {
                    flex: 1;
                    padding: 2rem;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    background: #f8faff;
                }

                .message {
                    display: flex;
                }

                .message.user {
                    justify-content: flex-end;
                }

                .message.ai {
                    justify-content: flex-start;
                }

                .message-bubble {
                    max-width: 70%;
                    padding: 1rem 1.5rem;
                    border-radius: 16px;
                    font-size: 1rem;
                    line-height: 1.5;
                    position: relative;
                }

                .message.user .message-bubble {
                    background: var(--color-accent-1);
                    color: white;
                    border-bottom-right-radius: 4px;
                }

                .message.ai .message-bubble {
                    background: white;
                    color: var(--color-text-primary);
                    border: 1px solid #e0e0e0;
                    border-bottom-left-radius: 4px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.03);
                }

                .chat-input-area {
                    padding: 1.5rem;
                    background: white;
                    border-top: 1px solid #f0f0f0;
                }

                .input-group {
                    display: flex;
                    background: #f5f5f7;
                    padding: 0.5rem;
                    border-radius: 99px;
                    gap: 0.5rem;
                    border: 1px solid transparent;
                    transition: all 0.2s;
                }
                
                .input-group:focus-within {
                    border-color: var(--color-accent-1);
                    background: white;
                    box-shadow: 0 4px 12px rgba(96, 78, 255, 0.1);
                }

                .input-group input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    padding: 0.5rem 1rem;
                    font-size: 1rem;
                    outline: none;
                }

                .icon-btn, .send-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .icon-btn {
                    background: transparent;
                    color: var(--color-text-secondary);
                }
                .icon-btn:hover {
                    background: rgba(0,0,0,0.05);
                }

                .send-btn {
                    background: var(--color-accent-1);
                    color: white;
                }
                .send-btn:hover {
                    transform: scale(1.05);
                    background: var(--color-accent-2);
                }
            `}</style>
        </div>
    );
};

export default AIChat;
