import { useNavigate } from 'react-router-dom';

export default function UnauthorizedPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <div className="text-8xl mb-4">🚫</div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Không có quyền truy cập
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Bạn không được phép truy cập trang này. 
                        Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
                    </p>
                </div>
                
                <div className="space-y-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        ← Quay lại trang trước
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Về trang chủ
                    </button>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                        <strong>💡 Gợi ý:</strong> Đảm bảo bạn đã đăng nhập với tài khoản có quyền truy cập phù hợp.
                    </p>
                </div>
            </div>
        </div>
    );
}
