import { MessageCircle, ThumbsUp, Eye, PlusCircle } from 'lucide-react';

const POSTS = [
    { id: 1, title: "Làm sao để giải nhanh bài toán tích phân này?", author: "Minh Anh", replies: 12, likes: 24, views: 105, tag: "Toán 12" },
    { id: 2, title: "Hỏi về phương pháp ghi nhớ từ vựng IELTS", author: "Quốc Tuấn", replies: 8, likes: 15, views: 89, tag: "Tiếng Anh" },
    { id: 3, title: "Cần tìm nhóm học chung Vật Lý 11", author: "Lan Phương", replies: 5, likes: 5, views: 45, tag: "Vật Lý 11" },
];

const Forum = () => {
    return (
        <div className="forum-container">
            <div className="forum-header">
                <h1>Diễn đàn thảo luận</h1>
                <button className="btn btn-primary">
                    <PlusCircle size={18} style={{ marginRight: '8px' }} /> Tạo bài viết
                </button>
            </div>

            <div className="forum-layout">
                <div className="post-list">
                    {POSTS.map(post => (
                        <div key={post.id} className="post-card glass">
                            <div className="post-vote">
                                <ThumbsUp size={18} />
                                <span>{post.likes}</span>
                            </div>
                            <div className="post-content">
                                <div className="post-meta">
                                    <span className="tag">{post.tag}</span>
                                    <span className="author">Đăng bởi {post.author}</span>
                                </div>
                                <h3>{post.title}</h3>
                                <div className="post-stats">
                                    <span><MessageCircle size={16} /> {post.replies} trả lời</span>
                                    <span><Eye size={16} /> {post.views} xem</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="forum-sidebar">
                    <div className="sidebar-widget glass">
                        <h3>Chủ đề hot 🔥</h3>
                        <ul className="topic-list">
                            <li>#GiaiDeThiThu</li>
                            <li>#BiKipOnThi</li>
                            <li>#GocHocTap</li>
                        </ul>
                    </div>
                </div>
            </div>

            <style>{`
                .forum-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .forum-layout {
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 2rem;
                }

                .post-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .post-card {
                    display: flex;
                    padding: 1.5rem;
                    background: white;
                    border-radius: 16px;
                    gap: 1.5rem;
                    transition: transform 0.2s;
                    cursor: pointer;
                }

                .post-card:hover {
                    background: #fafafa;
                    transform: translateX(4px);
                }

                .post-vote {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    color: var(--color-text-secondary);
                    min-width: 40px;
                }

                .post-content {
                    flex: 1;
                }

                .post-meta {
                    display: flex;
                    gap: 1rem;
                    font-size: 0.85rem;
                    margin-bottom: 0.5rem;
                }

                .tag {
                    background: rgba(96, 78, 255, 0.1);
                    color: var(--color-accent-1);
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-weight: 600;
                }

                .author {
                    color: var(--color-text-secondary);
                }

                .post-card h3 {
                    font-size: 1.1rem;
                    margin-bottom: 0.75rem;
                }

                .post-stats {
                    display: flex;
                    gap: 1.5rem;
                    color: var(--color-text-secondary);
                    font-size: 0.85rem;
                }

                .post-stats span {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .sidebar-widget {
                    padding: 1.5rem;
                    background: white;
                    border-radius: 16px;
                }

                .topic-list {
                    list-style: none;
                    margin-top: 1rem;
                }

                .topic-list li {
                    padding: 0.5rem 0;
                    border-bottom: 1px solid #f0f0f0;
                    color: var(--color-text-primary);
                    font-weight: 500;
                    cursor: pointer;
                }
                
                .topic-list li:hover {
                    color: var(--color-accent-1);
                }
            `}</style>
        </div>
    );
};

export default Forum;
