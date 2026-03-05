import { Activity, Server, Users, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">System Overview</h1>

            {/* System Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="glass p-6 rounded-2xl border-l-4 border-green-500">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500 font-medium">Server Status</span>
                        <Server className="text-green-500" size={24} />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">Operational</div>
                    <div className="text-xs text-gray-400 mt-2">Uptime: 99.9%</div>
                </div>

                <div className="glass p-6 rounded-2xl border-l-4 border-blue-500">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500 font-medium">Total Users</span>
                        <Users className="text-blue-500" size={24} />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">2,453</div>
                    <div className="text-xs text-green-500 mt-2">↑ 120 this week</div>
                </div>

                <div className="glass p-6 rounded-2xl border-l-4 border-purple-500">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500 font-medium">System Load</span>
                        <Activity className="text-purple-500" size={24} />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">34%</div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '34%' }}></div>
                    </div>
                </div>

                <div className="glass p-6 rounded-2xl border-l-4 border-yellow-500">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500 font-medium">Revenue</span>
                        <DollarSign className="text-yellow-500" size={24} />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">$12,450</div>
                </div>
            </div>

            {/* Recent System Logs */}
            <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-xl text-gray-800 mb-6">Recent System Logs</h3>
                <div className="space-y-4">
                    {[
                        { type: 'INFO', msg: 'New user registration: user_8473', time: '2 mins ago', color: 'bg-blue-100 text-blue-700' },
                        { type: 'WARN', msg: 'High memory usage detected on Node-1', time: '15 mins ago', color: 'bg-yellow-100 text-yellow-700' },
                        { type: 'SUCCESS', msg: 'Daily backup completed successfully', time: '1 hour ago', color: 'bg-green-100 text-green-700' },
                        { type: 'ERROR', msg: 'Failed login attempt from IP 192.168.1.5', time: '2 hours ago', color: 'bg-red-100 text-red-700' },
                        { type: 'INFO', msg: 'Course "Advanced Physics" published', time: '3 hours ago', color: 'bg-blue-100 text-blue-700' }
                    ].map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-3 hover:bg-white/50 rounded-lg transition-colors border-b border-gray-50 last:border-0 big-white">
                            <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${log.color} w-20 text-center`}>{log.type}</span>
                                <span className="text-gray-700 font-mono text-sm">{log.msg}</span>
                            </div>
                            <span className="text-gray-400 text-xs">{log.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
