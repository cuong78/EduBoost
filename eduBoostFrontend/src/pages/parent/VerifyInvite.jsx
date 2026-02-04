import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const VerifyInvite = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, valid, invalid
    const [resultData, setResultData] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const handleVerify = (e) => {
        e.preventDefault();
        if (!code.trim()) return;

        setStatus('loading');

        // Mock API Simulation
        setTimeout(() => {
            if (code.toUpperCase().startsWith('STU')) {
                setStatus('valid');
                setResultData({
                    studentName: 'Nguyen Van An',
                    classQuery: '10A1',
                    school: 'High School Name'
                });
            } else {
                setStatus('invalid');
                setErrorMsg('Invalid code format or code not found.');
            }
        }, 1500);
    };

    return (
        <div className="verify-page liquid-bg-wrapper">
            <div className="content-container">
                <div className="glass verify-card">
                    <div className="card-header">
                        <h2>Verify Invite Code</h2>
                        <p>Enter the code provided by the teacher to connect with your child.</p>
                    </div>

                    {status === 'idle' || status === 'loading' || status === 'invalid' ? (
                        <form onSubmit={handleVerify} className="verify-form">
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => {
                                        setCode(e.target.value);
                                        if (status === 'invalid') setStatus('idle');
                                    }}
                                    placeholder="Enter Invite Code (e.g., STU-XYZ123)"
                                    className={status === 'invalid' ? 'error' : ''}
                                    disabled={status === 'loading'}
                                />
                            </div>

                            {status === 'invalid' && (
                                <div className="error-msg fade-in">
                                    <AlertCircle size={16} /> {errorMsg}
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary full-width" disabled={status === 'loading'}>
                                {status === 'loading' ? <Loader2 className="spin" size={20} /> : 'Check Code'}
                            </button>
                        </form>
                    ) : null}

                    {status === 'valid' && resultData && (
                        <div className="result-view fade-in">
                            <div className="success-icon">
                                <CheckCircle size={48} color="#10B981" />
                            </div>
                            <h3>Code Valid!</h3>
                            <div className="student-preview">
                                <p className="label">Student Name</p>
                                <p className="value">{resultData.studentName}</p>
                                <p className="label">Class</p>
                                <p className="value">{resultData.classQuery}</p>
                            </div>
                            <div className="actions">
                                <button className="btn btn-primary full-width" onClick={() => navigate('/register', { state: { inviteCode: code, studentData: resultData } })}>
                                    Continue to Register
                                </button>
                                <button className="btn btn-ghost full-width" onClick={() => navigate('/login', { state: { inviteCode: code } })}>
                                    Already have an account? Login
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="back-link">
                    <Link to="/">Back to Home</Link>
                </div>
            </div>

            <style jsx>{`
                .verify-page { 
                    min-height: 100vh; display: flex; align-items: center; justify-content: center; 
                    position: relative; overflow: hidden;
                }
                .content-container { z-index: 10; width: 100%; max-width: 450px; padding: 1rem; }
                
                .verify-card {
                    padding: 2.5rem; border-radius: 24px; background: rgba(255,255,255,0.7);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                }
                .card-header { text-align: center; margin-bottom: 2rem; }
                .card-header h2 { font-size: 1.8rem; margin-bottom: 0.5rem; color: var(--color-text-primary); }
                .card-header p { color: #6b7280; font-size: 0.95rem; }

                .input-group input {
                    width: 100%; padding: 1rem; font-size: 1.1rem; border-radius: 12px;
                    border: 2px solid rgba(0,0,0,0.1); background: rgba(255,255,255,0.8);
                    text-align: center; letter-spacing: 1px; transition: all 0.3s;
                }
                .input-group input:focus { outline: none; border-color: var(--color-accent-1); box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }
                .input-group input.error { border-color: #ef4444; background: #fef2f2; }

                .error-msg { 
                    display: flex; align-items: center; gap: 0.5rem; color: #dc2626; 
                    font-size: 0.9rem; margin-top: 0.8rem; justify-content: center;
                }

                .full-width { width: 100%; margin-top: 1.5rem; }

                .result-view { text-align: center; }
                .success-icon { margin-bottom: 1rem; }
                .student-preview { 
                    background: rgba(255,255,255,0.5); padding: 1.5rem; border-radius: 12px; 
                    margin: 1.5rem 0; text-align: left; border: 1px dashed #10B981;
                }
                .label { font-size: 0.8rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
                .value { font-size: 1.1rem; font-weight: 600; color: #111827; margin-bottom: 0.8rem; }
                .value:last-child { margin-bottom: 0; }

                .btn-ghost { background: transparent; color: var(--color-accent-dark); margin-top: 0.5rem; border: none; }
                .btn-ghost:hover { text-decoration: underline; background: transparent; box-shadow: none; transform: none; }

                .back-link { text-align: center; margin-top: 2rem; color: #4b5563; font-weight: 500; }
                .back-link a:hover { color: var(--color-accent-dark); }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default VerifyInvite;
