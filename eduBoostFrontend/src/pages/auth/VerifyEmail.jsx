import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';

const VerifyEmail = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [status, setStatus] = useState('pending');
	const [message, setMessage] = useState('Đang xác minh email...');
    const called = useRef(false);

	useEffect(() => {
		if (called.current) return; // prevent double-call in StrictMode
		called.current = true;
		const params = new URLSearchParams(location.hash ? location.hash.split('?')[1] : location.search);
		const token = params.get('token') || '';
		if (!token) {
			setStatus('error');
			setMessage('Thiếu token xác minh.');
			showErrorToast('Thiếu token xác minh.');
			return;
		}

		(async () => {
			try {
				const res = await authService.verifyEmail(token);
				// Only show success once and ignore any later errors
				setStatus('success');
				setMessage(res.message || 'Xác minh email thành công. Đang chuyển đến trang đăng nhập...');
				showSuccessToast(res.message || 'Xác minh email thành công!');
				setTimeout(() => navigate('/login'), 1500);
		} catch (e) {
				if (status === 'success') return; // swallow late errors after success
				setStatus('error');
				setMessage(e?.message || 'Xác minh thất bại.');
				showErrorToast(e?.message || 'Xác minh thất bại.');
			}
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location, navigate]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 text-center">
				<h1 className={`text-2xl font-bold mb-4 ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>Xác minh email</h1>
				<p className="text-gray-700">{message}</p>
			</div>
		</div>
	);
};

export default VerifyEmail;


