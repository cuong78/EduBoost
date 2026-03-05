import { Save, Bell, Lock, Globe } from 'lucide-react';

const Settings = () => {
    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">System Settings</h1>

            <div className="space-y-6">
                {/* General Settings */}
                <div className="glass rounded-xl p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Globe size={20} className="text-indigo-600" /> General Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600">Platform Name</label>
                            <input type="text" defaultValue="EduBoost" className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600">Support Email</label>
                            <input type="email" defaultValue="support@eduboost.com" className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                </div>

                {/* Notifications & Security */}
                <div className="glass rounded-xl p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Lock size={20} className="text-indigo-600" /> Security & Access
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gray-50/50 rounded-lg">
                            <div>
                                <h4 className="font-bold text-gray-700">Maintenance Mode</h4>
                                <p className="text-sm text-gray-500">Disable access for all non-admin users</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-gray-50/50 rounded-lg">
                            <div>
                                <h4 className="font-bold text-gray-700">Allow New Registrations</h4>
                                <p className="text-sm text-gray-500">If disabled, only admins can add new users</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-bold">Cancel</button>
                    <button className="btn btn-primary flex items-center gap-2">
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
