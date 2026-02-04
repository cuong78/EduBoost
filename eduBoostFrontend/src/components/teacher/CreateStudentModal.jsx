import React, { useState } from 'react';
import { X, Check, Mail, Phone, MapPin, Calendar, User, Users } from 'lucide-react';

const CreateStudentModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        studentClass: '',
        dob: '',
        gender: 'select',
        address: '',
        generateInvite: false,
        inviteDuration: '7',
        inviteType: 'standard'
    });

    const [generatedCode, setGeneratedCode] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call and code generation
        if (formData.generateInvite) {
            const mockCode = 'STU-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            const mockPassword = Math.random().toString(36).substr(2, 8);
            setGeneratedCode({ code: mockCode, password: mockPassword });
        } else {
            onSubmit(formData);
        }
    };

    const handleFinalClose = () => {
        setGeneratedCode(null);
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            studentClass: '',
            dob: '',
            gender: 'select',
            address: '',
            generateInvite: false,
            inviteDuration: '7',
            inviteType: 'standard'
        });
        onClose();
    };

    // Success View with Invite Code
    if (generatedCode) {
        return (
            <div className="modal-overlay">
                <div className="glass modal-content animate-scale-in">
                    <div className="modal-header">
                        <h3>Student Created Successfully!</h3>
                        <button onClick={handleFinalClose} className="close-btn"><X size={20} /></button>
                    </div>
                    <div className="modal-body success-body">
                        <div className="success-icon">
                            <Check size={40} color="#10B981" />
                        </div>
                        <p>The student <strong>{formData.fullName}</strong> has been created.</p>

                        <div className="invite-card glass-panel">
                            <h4>Invite Details</h4>
                            <div className="code-display">
                                <span className="label">Invite Code:</span>
                                <span className="code">{generatedCode.code}</span>
                            </div>
                            <div className="code-display">
                                <span className="label">Temp Password:</span>
                                <span className="code">{generatedCode.password}</span>
                            </div>
                            <p className="hint">Share this with the student or parent.</p>
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    // Logic to copy or send email could go here
                                    handleFinalClose();
                                }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
                <style jsx>{`
          .success-body { text-align: center; display: flex; flex-direction: column; gap: 1.5rem; align-items: center; }
          .invite-card { background: rgba(255,255,255,0.5); padding: 1.5rem; border-radius: 12px; width: 100%; text-align: left; }
          .code-display { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-family: monospace; font-size: 1.1rem; }
          .code { font-weight: bold; color: var(--color-accent-dark); background: #fff; padding: 2px 8px; border-radius: 4px; }
          .hint { font-size: 0.8rem; color: #666; margin-top: 0.5rem; }
        `}</style>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="glass modal-content animate-scale-in">
                <div className="modal-header">
                    <h3>Create New Student</h3>
                    <button onClick={onClose} className="close-btn"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-grid">
                        {/* Personal Info */}
                        <div className="form-group">
                            <label><User size={14} /> Full Name</label>
                            <input required name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. Nguyen Van A" />
                        </div>
                        <div className="form-group">
                            <label><Mail size={14} /> Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="student@example.com" />
                        </div>

                        <div className="form-group">
                            <label><Phone size={14} /> Phone</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="09xxxxxxxxx" />
                        </div>
                        <div className="form-group">
                            <label><Users size={14} /> Class</label>
                            <select name="studentClass" value={formData.studentClass} onChange={handleChange}>
                                <option value="">Select Class</option>
                                <option value="10A1">10A1</option>
                                <option value="10A2">10A2</option>
                                <option value="11B1">11B1</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label><Calendar size={14} /> Date of Birth</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="select">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label><MapPin size={14} /> Address</label>
                            <input name="address" value={formData.address} onChange={handleChange} placeholder="123 Street, City" />
                        </div>

                        {/* Invite Code Generator Section */}
                        <div className="form-group full-width invite-section">
                            <div className="toggle-wrapper">
                                <label className="switch">
                                    <input type="checkbox" name="generateInvite" checked={formData.generateInvite} onChange={handleChange} />
                                    <span className="slider round"></span>
                                </label>
                                <div className="toggle-label">
                                    <strong>Auto-generate Invite Code</strong>
                                    <span className="sub-text">Create a code for student/parent to join active classes.</span>
                                </div>
                            </div>

                            {formData.generateInvite && (
                                <div className="invite-options reveal-visible">
                                    <div className="option-row">
                                        <div className="sub-group">
                                            <label>Expiry Duration</label>
                                            <select name="inviteDuration" value={formData.inviteDuration} onChange={handleChange}>
                                                <option value="7">7 Days</option>
                                                <option value="30">30 Days</option>
                                                <option value="unlimited">Unlimited</option>
                                            </select>
                                        </div>
                                        <div className="sub-group">
                                            <label>Type</label>
                                            <select name="inviteType" value={formData.inviteType} onChange={handleChange}>
                                                <option value="standard">Standard (Multiple uses)</option>
                                                <option value="onetime">One-time Use</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
                        <button type="submit" className="btn btn-primary">Create Student</button>
                    </div>
                </form>
            </div>

            <style jsx>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.3); backdrop-filter: blur(4px);
          display: flex; justify-content: center; align-items: center; z-index: 1000;
        }
        .modal-content {
          width: 90%; max-width: 600px; padding: 2rem; border-radius: 20px;
          background: rgba(255, 255, 255, 0.9);
          max-height: 90vh; overflow-y: auto;
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .modal-header h3 { font-size: 1.5rem; color: var(--color-text-primary); }
        .close-btn { background: none; border: none; cursor: pointer; color: #666; transition: 0.2s; }
        .close-btn:hover { color: #000; transform: scale(1.1); }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .full-width { grid-column: 1 / -1; }
        
        label { font-weight: 600; font-size: 0.9rem; color: #4b5563; display: flex; align-items: center; gap: 0.4rem; }
        input, select {
          padding: 0.7rem; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1);
          background: rgba(255,255,255,0.8); font-family: inherit; font-size: 0.95rem;
          transition: all 0.2s;
        }
        input:focus, select:focus { outline: none; border-color: var(--color-accent-1); box-shadow: 0 0 0 2px rgba(99,102,241,0.2); }
        
        .invite-section {
          background: rgba(99, 102, 241, 0.05); padding: 1rem; border-radius: 12px; border: 1px dashed var(--color-accent-1);
          margin-top: 0.5rem;
        }
        .toggle-wrapper { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
        .toggle-label { display: flex; flex-direction: column; }
        .sub-text { font-size: 0.8rem; color: #666; font-weight: 400; }
        
        .invite-options { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05); }
        .option-row { display: flex; gap: 1rem; }
        .sub-group { flex: 1; display: flex; flex-direction: column; gap: 0.3rem; }

        .modal-actions { margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem; }
        .btn-ghost { background: transparent; color: #666; border: 1px solid #ddd; }
        .btn-ghost:hover { background: #f3f4f6; }

        /* Switch Toggle */
        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
        input:checked + .slider { background-color: var(--color-accent-1); }
        input:checked + .slider:before { transform: translateX(20px); }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }

        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
      `}</style>
        </div>
    );
};

export default CreateStudentModal;
