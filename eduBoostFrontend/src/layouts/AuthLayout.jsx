import { Outlet, Link } from "react-router-dom";
import logo from "../assets/logo.png";

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
                    position: static !important;
                    transform: none !important;
                    background: transparent !important;
                    padding: 0 !important;
                    pointer-events: auto !important;
                    color: var(--color-text-primary) !important;
                }

                .input-wrapper {
                    position: relative !important;
                    display: block !important;
                }

                .input-icon {
                    position: absolute !important;
                    left: 1rem !important;
                    top: 50% !important;
                    transform: translateY(-50%) !important;
                    color: var(--color-text-secondary) !important;
                    z-index: 2 !important;
                    pointer-events: none !important;
                }

                input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 2.75rem !important;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    background: rgba(255, 255, 255, 0.5);
                    font-family: inherit;
                    font-size: 1rem;
                    transition: all 0.3s;
                    position: relative !important;
                    z-index: 1 !important;
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
                
                /* Error styling */
                .error-message {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    color: #DC2626;
                    font-size: 0.875rem;
                    margin-top: 0.5rem;
                    font-weight: 500;
                }
                
                input.error {
                    border-color: #DC2626 !important;
                    background: rgba(220, 38, 38, 0.05);
                }
                
                input.error:focus {
                    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
                }
                
                /* Password toggle button */
                .password-toggle {
                    position: absolute !important;
                    right: 1rem !important;
                    top: 50% !important;
                    transform: translateY(-50%) !important;
                    background: none !important;
                    border: none !important;
                    color: var(--color-text-secondary) !important;
                    cursor: pointer !important;
                    padding: 0.25rem !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    transition: color 0.2s;
                    z-index: 2 !important;
                }
                
                .password-toggle:hover {
                    color: var(--color-accent-1);
                }
                
                .password-toggle:focus {
                    outline: none;
                }
                
                /* Loading state */
                button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                input:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                /* Spinner animation */
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
                
                button .btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }
            `}</style>
    </div>
  );
};

export default AuthLayout;
