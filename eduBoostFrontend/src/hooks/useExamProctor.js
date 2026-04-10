/**
 * useExamProctor — Anti-cheat hook for TakeExam page
 *
 * Features:
 * - Fullscreen enforcement
 * - Tab/visibility detection
 * - Idle time tracking
 * - Copy/paste counting
 * - Network monitoring
 * - WebSocket heartbeat (every 8 seconds)
 * - Real-time violation alerts to teacher
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { API } from '../constants/api';

const HEARTBEAT_INTERVAL_MS = 8000; // 8 seconds
const IDLE_THRESHOLD_MS = 120000;   // 2 minutes idle = suspicious

// Detect mobile devices — used to skip fullscreen enforcement
const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export const useExamProctor = ({ assignmentId, studentId, studentName, enabled = true, onAutoSubmit }) => {
    const [violations, setViolations] = useState([]);
    const [tabActive, setTabActive] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [networkOnline, setNetworkOnline] = useState(navigator.onLine);

    const stompClientRef = useRef(null);
    const heartbeatTimerRef = useRef(null);
    const copyPasteCountRef = useRef(0);
    const lastActivityRef = useRef(Date.now());
    const violationCountRef = useRef(0);
    const timeLeftRef = useRef(null); // updated externally

    // ── Connect WebSocket ──────────────────────────────────────────────────
    const connectWs = useCallback(() => {
        if (!enabled || !assignmentId) return;
        try {
            const client = new Client({
                webSocketFactory: () => new SockJS(`${API.BASE.replace('/api', '')}/ws`),
                reconnectDelay: 5000,
                connectHeaders: {
                    studentId: String(studentId || ''),
                    studentName: studentName || '',
                },
                onConnect: () => {
                    console.log('[Proctor] WS connected');
                    startHeartbeat(client);
                },
                onDisconnect: () => console.log('[Proctor] WS disconnected'),
                onStompError: (frame) => console.error('[Proctor] STOMP error', frame),
            });
            client.activate();
            stompClientRef.current = client;
        } catch (e) {
            console.warn('[Proctor] WS connect failed:', e);
        }
    }, [assignmentId, studentId, studentName, enabled]);

    // ── Heartbeat ──────────────────────────────────────────────────────────
    const startHeartbeat = (client) => {
        heartbeatTimerRef.current = setInterval(() => {
            if (!client?.connected) return;
            const idleSeconds = Math.floor((Date.now() - lastActivityRef.current) / 1000);
            const payload = {
                tabActive: !document.hidden,
                fullscreen: isMobile() ? true : !!document.fullscreenElement, // Mobile doesn't support fullscreen API
                idleSeconds,
                copyPasteCount: copyPasteCountRef.current,
                networkOnline: navigator.onLine,
                timeLeftSeconds: timeLeftRef.current,
            };
            client.publish({
                destination: `/app/exam/${assignmentId}/heartbeat`,
                headers: { studentId: String(studentId || ''), studentName: studentName || '' },
                body: JSON.stringify(payload),
            });
        }, HEARTBEAT_INTERVAL_MS);
    };

    // ── Send immediate alert ───────────────────────────────────────────────
    const sendAlert = useCallback((reason) => {
        const client = stompClientRef.current;
        if (!client?.connected) return;
        client.publish({
            destination: `/app/exam/${assignmentId}/alert`,
            headers: { studentId: String(studentId || ''), studentName: studentName || '' },
            body: JSON.stringify({ reason, timestamp: new Date().toISOString() }),
        });

        violationCountRef.current += 1;
        setViolations(prev => [...prev, { reason, time: new Date().toLocaleTimeString('vi-VN') }]);

        // Auto-submit after 5 violations
        if (violationCountRef.current >= 5 && onAutoSubmit) {
            onAutoSubmit('AUTO_FOCUS_LOST');
        }
    }, [assignmentId, studentId, studentName, onAutoSubmit]);

    // ── Fullscreen ─────────────────────────────────────────────────────────
    const requestFullscreen = useCallback(() => {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    }, []);

    const fullscreenDebounceRef = useRef(null);

    const exitFullscreenHandler = useCallback(() => {
        const inFs = !!document.fullscreenElement;
        setIsFullscreen(inFs);
        // On mobile, skip fullscreen violation entirely
        if (isMobile()) return;
        if (!inFs && enabled) {
            // Debounce to avoid rapid-fire false positives
            clearTimeout(fullscreenDebounceRef.current);
            fullscreenDebounceRef.current = setTimeout(() => {
                if (!document.fullscreenElement) {
                    sendAlert('FULLSCREEN_EXIT');
                }
            }, 500);
        }
    }, [enabled, sendAlert]);

    // ── Visibility / tab switch ────────────────────────────────────────────
    const visibilityHandler = useCallback(() => {
        const active = !document.hidden;
        setTabActive(active);
        if (!active && enabled) {
            sendAlert('TAB_SWITCH');
        }
    }, [enabled, sendAlert]);

    // ── Window blur — DESKTOP ONLY ─────────────────────────────────────────
    // On mobile, blur fires during normal scroll/touch — causes false positives.
    const blurHandler = useCallback(() => {
        if (isMobile()) return; // Skip on mobile
        if (enabled) sendAlert('WINDOW_BLUR');
    }, [enabled, sendAlert]);

    // ── Copy/Paste ─────────────────────────────────────────────────────────
    const copyPasteHandler = useCallback(() => {
        copyPasteCountRef.current += 1;
        if (enabled) sendAlert('COPY_PASTE');
    }, [enabled, sendAlert]);

    // ── Activity tracking ──────────────────────────────────────────────────
    const activityHandler = useCallback(() => {
        lastActivityRef.current = Date.now();
    }, []);

    // ── Prevent right-click + DevTools ────────────────────────────────────
    const preventDevTools = useCallback((e) => {
        if (!enabled) return;
        // F12, Ctrl+Shift+I/J/C, Ctrl+U
        if (e.keyCode === 123 ||
            (e.ctrlKey && e.shiftKey && [73, 74, 67].includes(e.keyCode)) ||
            (e.ctrlKey && e.keyCode === 85)) {
            e.preventDefault();
        }
    }, [enabled]);

    // ── Network status ─────────────────────────────────────────────────────
    const networkHandler = useCallback(() => {
        setNetworkOnline(navigator.onLine);
        if (!navigator.onLine && enabled) sendAlert('NETWORK_OFFLINE');
    }, [enabled, sendAlert]);

    // ── Mount / Unmount ────────────────────────────────────────────────────
    useEffect(() => {
        if (!enabled) return;

        // 1. Enter fullscreen (desktop only — mobile doesn't support it well)
        if (!isMobile()) {
            requestFullscreen();
        }

        // 2. Connect WebSocket
        connectWs();

        // 3. Register event listeners
        document.addEventListener('visibilitychange', visibilityHandler);
        window.addEventListener('blur', blurHandler);
        document.addEventListener('fullscreenchange', exitFullscreenHandler);
        document.addEventListener('copy', copyPasteHandler);
        document.addEventListener('paste', copyPasteHandler);
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        document.addEventListener('keydown', preventDevTools);
        document.addEventListener('mousemove', activityHandler);
        document.addEventListener('touchstart', activityHandler); // Mobile activity tracking
        document.addEventListener('keydown', activityHandler);
        window.addEventListener('online', networkHandler);
        window.addEventListener('offline', networkHandler);

        return () => {
            // Cleanup
            clearInterval(heartbeatTimerRef.current);
            stompClientRef.current?.deactivate();

            document.removeEventListener('visibilitychange', visibilityHandler);
            window.removeEventListener('blur', blurHandler);
            document.removeEventListener('fullscreenchange', exitFullscreenHandler);
            document.removeEventListener('copy', copyPasteHandler);
            document.removeEventListener('paste', copyPasteHandler);
            document.removeEventListener('contextmenu', (e) => e.preventDefault());
            document.removeEventListener('keydown', preventDevTools);
            document.removeEventListener('mousemove', activityHandler);
            document.removeEventListener('touchstart', activityHandler);
            document.removeEventListener('keydown', activityHandler);
            window.removeEventListener('online', networkHandler);
            window.removeEventListener('offline', networkHandler);

            // Exit fullscreen on unmount (desktop only)
            if (!isMobile() && document.fullscreenElement) document.exitFullscreen?.();
        };
    }, [enabled, connectWs]);

    // Expose timeLeft setter
    const setTimeLeft = (secs) => { timeLeftRef.current = secs; };

    return {
        violations,
        tabActive,
        isFullscreen,
        networkOnline,
        violationCount: violationCountRef.current,
        requestFullscreen,
        setTimeLeft,
        copyPasteCount: copyPasteCountRef.current,
    };
};
