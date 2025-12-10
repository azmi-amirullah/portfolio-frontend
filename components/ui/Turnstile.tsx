'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MdLock } from 'react-icons/md';

interface TurnstileProps {
    siteKey: string;
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
    title?: string;
    theme?: 'light' | 'dark' | 'auto';
    size?: 'normal' | 'compact';
}

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: string | HTMLElement,
                options: {
                    sitekey: string;
                    callback: (token: string) => void;
                    'error-callback'?: () => void;
                    'expired-callback'?: () => void;
                    theme?: 'light' | 'dark' | 'auto';
                    size?: 'normal' | 'compact';
                    retry?: 'auto' | 'never';
                    'retry-interval'?: number;
                }
            ) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
        onTurnstileLoad?: () => void;
    }
}

let scriptLoaded = false;
let scriptLoading = false;

export function Turnstile({
    siteKey,
    onVerify,
    onError,
    onExpire,
    title = 'Security Check',
    theme = 'light',
    size = 'normal',
}: TurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    const handleVerify = useCallback((token: string) => {
        if (token && token.length > 0) {
            setTimeout(() => onVerify(token), 500);
        }
    }, [onVerify]);

    const handleError = useCallback(() => {
        onError?.();
    }, [onError]);

    const handleExpire = useCallback(() => {
        onExpire?.();
    }, [onExpire]);

    const renderWidget = useCallback(() => {
        if (!window.turnstile || !containerRef.current) return;
        if (widgetIdRef.current) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: handleVerify,
            'error-callback': handleError,
            'expired-callback': handleExpire,
            theme,
            size,
            retry: 'auto',
            'retry-interval': 5000,
        });
    }, [siteKey, handleVerify, handleError, handleExpire, theme, size]);

    useEffect(() => {
        if (scriptLoaded && window.turnstile) {
            renderWidget();
            return;
        }

        if (scriptLoading) {
            const originalCallback = window.onTurnstileLoad;
            window.onTurnstileLoad = () => {
                originalCallback?.();
                renderWidget();
            };
            return;
        }

        const existingScript = document.querySelector(
            'script[src*="challenges.cloudflare.com/turnstile"]'
        );

        if (existingScript) {
            scriptLoaded = true;
            if (window.turnstile) {
                renderWidget();
            }
            return;
        }

        scriptLoading = true;
        window.onTurnstileLoad = () => {
            scriptLoaded = true;
            scriptLoading = false;
            renderWidget();
        };

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, [renderWidget]);

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className='max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-lg text-center'
            >
                <div className='mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center'>
                    <MdLock className='h-8 w-8 text-blue-600' />
                </div>
                <h2 className='text-2xl font-bold'>{title}</h2>
                <div ref={containerRef} className="flex justify-center my-4" />
            </motion.div>
        </div>
    );
}

