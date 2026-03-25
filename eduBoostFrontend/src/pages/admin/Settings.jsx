import { Save, Lock, Globe } from 'lucide-react';

const Settings = () => {
    return (
        <div>
            <div className="ds-page-header">
                <div className="ds-page-header-left">
                    <div className="ds-page-icon"><Globe size={22} /></div>
                    <div>
                        <h1 className="ds-page-title">System Settings</h1>
                        <p className="ds-page-subtitle">Cấu hình hệ thống EduBoost</p>
                    </div>
                </div>
            </div>

            <div className="ds-flex-col ds-gap-lg">
                {/* General Settings */}
                <div className="ds-card">
                    <div className="ds-card-header">
                        <span className="ds-flex ds-items-center ds-gap-sm"><Globe size={18} color="var(--ds-primary)" /> General Information</span>
                    </div>
                    <div className="ds-card-body">
                        <div className="settings-grid">
                            <div className="ds-form-group">
                                <label className="ds-label">Platform Name</label>
                                <input type="text" defaultValue="EduBoost" className="ds-input" />
                            </div>
                            <div className="ds-form-group">
                                <label className="ds-label">Support Email</label>
                                <input type="email" defaultValue="support@eduboost.com" className="ds-input" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="ds-card">
                    <div className="ds-card-header">
                        <span className="ds-flex ds-items-center ds-gap-sm"><Lock size={18} color="var(--ds-primary)" /> Security & Access</span>
                    </div>
                    <div className="ds-card-body ds-flex-col ds-gap-md">
                        <div className="settings-toggle-row">
                            <div>
                                <div className="ds-text-bold">Maintenance Mode</div>
                                <div className="ds-text-sub">Disable access for all non-admin users</div>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="settings-toggle-row">
                            <div>
                                <div className="ds-text-bold">Allow New Registrations</div>
                                <div className="ds-text-sub">If disabled, only admins can add new users</div>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" defaultChecked />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="ds-flex ds-gap-sm" style={{ justifyContent: 'flex-end' }}>
                    <button className="ds-btn ds-btn-secondary">Cancel</button>
                    <button className="ds-btn ds-btn-primary">
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>

            <style>{`
                .settings-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--ds-space-lg);
                }
                @media (max-width: 640px) {
                    .settings-grid { grid-template-columns: 1fr; }
                }
                .settings-toggle-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--ds-space-md);
                    background: var(--ds-bg-subtle);
                    border-radius: var(--ds-radius-sm);
                }
                .toggle {
                    position: relative;
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                    flex-shrink: 0;
                }
                .toggle input { opacity: 0; width: 0; height: 0; }
                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    inset: 0;
                    background: var(--ds-border);
                    border-radius: var(--ds-radius-full);
                    transition: var(--ds-transition);
                }
                .toggle-slider::before {
                    content: "";
                    position: absolute;
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background: white;
                    border-radius: 50%;
                    transition: var(--ds-transition);
                    box-shadow: var(--ds-shadow-xs);
                }
                .toggle input:checked + .toggle-slider {
                    background: var(--ds-primary);
                }
                .toggle input:checked + .toggle-slider::before {
                    transform: translateX(20px);
                }
            `}</style>
        </div>
    );
};

export default Settings;
