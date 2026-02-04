import React, { useState } from 'react';
import { Plus, Trash2, User, BookOpen, UserCheck, X } from 'lucide-react';

const ParentDashboard = () => {
    const [linkedStudents, setLinkedStudents] = useState([
        { id: 1, name: 'Nguyen Van An', class: '10A1', teacher: 'Mrs. Lan', relation: 'Mother' },
        // Mock data
    ]);

    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkForm, setLinkForm] = useState({ code: '', relationship: 'Mother' });

    const handleUnlink = (id) => {
        if (confirm('Are you sure you want to unlink this student from your account?')) {
            setLinkedStudents(linkedStudents.filter(s => s.id !== id));
        }
    };

    const handleLinkSubmit = (e) => {
        e.preventDefault();
        // Mock linking
        setLinkedStudents([...linkedStudents, {
            id: Date.now(),
            name: 'New Linked Student',
            class: '11B2',
            teacher: 'Mr. Hung',
            relation: linkForm.relationship
        }]);
        setShowLinkModal(false);
        setLinkForm({ code: '', relationship: 'Mother' });
    };

    return (
        <div className="page-container fade-in">
            <header className="page-header">
                <div>
                    <h1>My Children</h1>
                    <p className="subtitle">Manage profiles of your children studying at EduBoost.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowLinkModal(true)}>
                    <Plus size={18} style={{ marginRight: '8px' }} /> Link Student
                </button>
            </header>

            <div className="students-grid">
                {linkedStudents.map(student => (
                    <div className="glass student-card" key={student.id}>
                        <div className="card-top">
                            <div className="student-avatar">
                                {student.name.charAt(0)}
                            </div>
                            <div className="student-details">
                                <h3>{student.name}</h3>
                                <span className="relationship-chip">{student.relation}</span>
                            </div>
                        </div>

                        <div className="card-body">
                            <div className="info-row">
                                <BookOpen size={16} className="icon" />
                                <span>Class: <strong>{student.class}</strong></span>
                            </div>
                            <div className="info-row">
                                <UserCheck size={16} className="icon" />
                                <span>Teacher: <strong>{student.teacher}</strong></span>
                            </div>
                        </div>

                        <div className="card-footer">
                            <button className="btn btn-outline small" onClick={() => alert('View Progress')}>View Progress</button>
                            <button className="btn-icon danger" onClick={() => handleUnlink(student.id)} title="Unlink">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {linkedStudents.length === 0 && (
                    <div className="empty-state glass">
                        <User size={48} className="empty-icon" />
                        <h3>No students linked yet</h3>
                        <p>Use the invite code provided by the teacher to link your child's profile.</p>
                        <button className="btn btn-primary mt-4" onClick={() => setShowLinkModal(true)}>Link Student Now</button>
                    </div>
                )}
            </div>

            {/* Link Student Modal */}
            {showLinkModal && (
                <div className="modal-overlay">
                    <div className="glass modal-content animate-pop">
                        <div className="modal-header">
                            <h3>Link New Student</h3>
                            <button onClick={() => setShowLinkModal(false)} className="close-btn"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleLinkSubmit}>
                            <div className="form-group">
                                <label>Invite Code</label>
                                <input
                                    required
                                    className="input-field"
                                    placeholder="Enter Code (e.g. STU-123)"
                                    value={linkForm.code}
                                    onChange={e => setLinkForm({ ...linkForm, code: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Relationship</label>
                                <select
                                    className="input-field"
                                    value={linkForm.relationship}
                                    onChange={e => setLinkForm({ ...linkForm, relationship: e.target.value })}
                                >
                                    <option value="Mother">Mother</option>
                                    <option value="Father">Father</option>
                                    <option value="Guardian">Guardian</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowLinkModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Link Profile</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .page-container { padding: 2rem; max-width: 1000px; margin: 0 auto; }
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .subtitle { color: #6b7280; margin-top: 0.5rem; }

                .students-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
                
                .student-card { padding: 1.5rem; border-radius: 16px; transition: transform 0.2s; }
                .student-card:hover { transform: translateY(-4px); }
                
                .card-top { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
                .student-avatar { 
                    width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #fbcfe8, #f472b6); 
                    color: #9d174d; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem;
                }
                .student-details h3 { font-size: 1.1rem; margin: 0; }
                .relationship-chip { font-size: 0.8rem; color: #6b7280; background: rgba(255,255,255,0.5); padding: 2px 8px; border-radius: 12px; }

                .card-body { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.8rem; }
                .info-row { display: flex; align-items: center; gap: 0.8rem; color: #4b5563; font-size: 0.95rem; }
                .icon { color: #9ca3af; }

                .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05); }
                .btn-outline { background: transparent; border: 1px solid #ddd; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; color: #666; font-weight: 500; }
                .btn-outline:hover { border-color: var(--color-accent-1); color: var(--color-accent-1); background: white; }
                .btn-icon { width: 36px; height: 36px; border-radius: 8px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .btn-icon.danger { color: #ef4444; }
                .btn-icon.danger:hover { background: #fee2e2; }

                .empty-state { text-align: center; padding: 4rem 2rem; border-radius: 16px; grid-column: 1 / -1; }
                .empty-icon { color: #d1d5db; margin-bottom: 1rem; }
                .mt-4 { margin-top: 1rem; }

                /* Reuse Modal Styles */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-content { width: 90%; max-width: 400px; padding: 2rem; border-radius: 20px; background: rgba(255,255,255,0.9); }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .form-group { margin-bottom: 1.2rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem; }
                .input-field { width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; font-family: inherit; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
                .close-btn { background: none; border: none; cursor: pointer; }
                
                .animate-pop { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .btn-ghost { background: transparent; border: 1px solid transparent; color: #666; cursor: pointer; padding: 0.5rem 1rem; border-radius: 8px; }
                .btn-ghost:hover { background: #f3f4f6; }
            `}</style>
        </div>
    );
};

export default ParentDashboard;
