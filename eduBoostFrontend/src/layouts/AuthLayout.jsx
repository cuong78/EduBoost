import { Outlet, Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const AuthLayout = () => {
    return (
        <div className="auth-page">
            <Link to="/" className="auth-logo">
                <img src={logo} alt="EduBoost Logo" />
            </Link>
            <Outlet />

            <style>{`
                .auth-page {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem 1rem;
                }

                .auth-logo {
                    margin-bottom: 2rem;
                    display: block;
                    transition: transform 0.2s;
                }
                .auth-logo:hover {
                    transform: scale(1.05);
                }
                .auth-logo img {
                    height: 60px;
                    width: auto;
                }
                
                .auth-card {
                    width: 100%;
                    max-width: 480px;
                    padding: 3rem;
                    border-radius: 24px;
                }

                .auth-card h2 {
                    text-align: center;
                    margin-bottom: 0.5rem;
                    font-size: 2rem;
                }

                .auth-subtitle {
                    text-align: center;
                    color: var(--color-text-secondary);
                    margin-bottom: 2rem;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    font-size: 0.9rem;
                }

                .input-wrapper {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--color-text-secondary);
                }

                input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 2.75rem;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    background: rgba(255, 255, 255, 0.5);
                    font-family: inherit;
                    font-size: 1rem;
                    transition: all 0.3s;
                }

                input:focus {
                    outline: none;
                    border-color: var(--color-accent-1);
                    background: rgba(255, 255, 255, 0.8);
                    box-shadow: 0 0 0 4px rgba(96, 78, 255, 0.1);
                }

                .full-width {
                    width: 100%;
                }
                
                .form-options {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    font-size: 0.9rem;
                }
                
                .form-options a {
                    color: var(--color-accent-1);
                    font-weight: 600;
                }

                .checkbox {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    user-select: none;
                }
                
                 .checkbox span {
                    line-height: 1.4;
                }
                .checkbox a { color: var(--color-accent-1); font-weight: 600; }

                .auth-separator {
                    text-align: center;
                    margin: 2rem 0;
                    position: relative;
                }
                
                .auth-separator::before, .auth-separator::after {
                    content: "";
                    position: absolute;
                    top: 50%;
                    width: 30%;
                    height: 1px;
                    background: rgba(0,0,0,0.1);
                }
                .auth-separator::before { left: 0; }
                .auth-separator::after { right: 0; }
                
                .auth-separator span {
                    color: var(--color-text-secondary);
                    font-size: 0.9rem;
                }

                .social-login {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .social-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-weight: 500;
                    font-size: 0.9rem;
                }
                
                .auth-footer {
                    text-align: center;
                    font-size: 0.95rem;
                }

                .auth-footer a {
                    color: var(--color-accent-1);
                    font-weight: 700;
                }
                
                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--color-text-secondary);
                    margin-bottom: 2rem;
                    font-weight: 500;
                    transition: color 0.2s;
                }
                .back-link:hover { color: var(--color-accent-1); }
                
                /* Extra util for Register page form row */
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
            `}</style>
        </div>
    );
};

export default AuthLayout;
