import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Mail, Trash2, Edit } from 'lucide-react';
import CreateStudentModal from '../../components/teacher/CreateStudentModal';

const StudentManagement = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [students, setStudents] = useState([
        { id: 1, name: 'Nguyen Van An', class: '10A1', email: 'an.nguyen@example.com', status: 'Active', joinDate: '2023-09-05' },
        { id: 2, name: 'Tran Thi Binh', class: '10A2', email: 'binh.tran@example.com', status: 'Pending', joinDate: '2023-09-10' },
        { id: 3, name: 'Le Hoang Nam', class: '11B1', email: 'nam.le@example.com', status: 'Active', joinDate: '2023-08-20' },
    ]);

    const handleCreateStudent = (newStudentData) => {
        // Mock adding student
        const newStudent = {
            id: students.length + 1,
            name: newStudentData.fullName,
            class: newStudentData.studentClass,
            email: newStudentData.email,
            status: 'Pending',
            joinDate: new Date().toISOString().split('T')[0]
        };
        setStudents([...students, newStudent]);
        setIsCreateModalOpen(false);
    };

    return (
        <div className="page-container fade-in">
            <header className="page-header">
                <div className="header-left">
                    <h2>Student Management</h2>
                    <p className="text-muted">Manage your students, classes, and invite codes.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Add Student
                </button>
            </header>

            <div className="filters-bar glass">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="Search students..." className="search-input" />
                </div>
                <div className="filter-wrapper">
                    <button className="btn-filter"><Filter size={16} /> Status</button>
                    <button className="btn-filter"><Filter size={16} /> Class</button>
                </div>
            </div>

            <div className="table-container glass">
                <table className="student-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Class</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Date Added</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id}>
                                <td>
                                    <div className="student-info" style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/teacher/students/${student.id}`}>
                                        <div className="avatar">{student.name.charAt(0)}</div>
                                        <div>
                                            <span className="student-name">{student.name}</span>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="badge class-badge">{student.class}</span></td>
                                <td>{student.email}</td>
                                <td>
                                    <span className={`status-dot ${student.status.toLowerCase()}`}></span>
                                    {student.status}
                                </td>
                                <td>{student.joinDate}</td>
                                <td className="actions-cell">
                                    <button className="icon-btn" title="Send Email"><Mail size={16} /></button>
                                    <button className="icon-btn" title="Edit"><Edit size={16} /></button>
                                    <button className="icon-btn danger" title="Delete"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <CreateStudentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateStudent}
            />

            <style jsx>{`
                .page-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .text-muted { color: var(--color-text-secondary); font-size: 0.95rem; }
                
                .filters-bar { 
                    padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; 
                    display: flex; justify-content: space-between; align-items: center;
                }
                .search-wrapper { position: relative; width: 300px; }
                .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
                .search-input { 
                    width: 100%; padding: 0.7rem 1rem 0.7rem 2.5rem; 
                    border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: rgba(255,255,255,0.5);
                }
                .filter-wrapper { display: flex; gap: 0.8rem; }
                .btn-filter { 
                    display: flex; align-items: center; gap: 6px; padding: 0.6rem 1rem; 
                    background: white; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; cursor: pointer; color: #4b5563;
                }

                .table-container { border-radius: 16px; overflow: hidden; }
                .student-table { width: 100%; border-collapse: collapse; }
                .student-table th { 
                    text-align: left; padding: 1.2rem; background: rgba(249, 250, 251, 0.6); 
                    color: #4b5563; font-weight: 600; font-size: 0.9rem;
                }
                .student-table td { padding: 1.2rem; border-top: 1px solid rgba(0,0,0,0.05); color: #374151; }
                .student-table tr:hover { background: rgba(255,255,255,0.4); }

                .student-info { display: flex; align-items: center; gap: 1rem; }
                .avatar { 
                    width: 36px; height: 36px; background: linear-gradient(135deg, #e0e7ff, #c7d2fe); 
                    color: #4338ca; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;
                }
                .student-name { font-weight: 500; }
                
                .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; }
                .class-badge { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
                
                .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
                .status-dot.active { background: #10b981; }
                .status-dot.pending { background: #f59e0b; }

                .actions-cell { display: flex; gap: 0.5rem; }
                .icon-btn { 
                    width: 32px; height: 32px; border-radius: 6px; border: none; background: transparent; 
                    cursor: pointer; color: #6b7280; display: flex; align-items: center; justify-content: center; transition: 0.2s;
                }
                .icon-btn:hover { background: #f3f4f6; color: #4338ca; }
                .icon-btn.danger:hover { background: #fee2e2; color: #ef4444; }

                .fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default StudentManagement;
