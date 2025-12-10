'use client';

import { useEffect, useRef, useCallback } from 'react';

interface TurnstileProps {
    siteKey: string;
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
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
                    'before-interactive-callback'?: () => void;
                    'after-interactive-callback'?: () => void;
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
    theme = 'auto',
    size = 'normal',
}: TurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    const handleVerify = useCallback((token: string) => {
        console.log('[Turnstile] onVerify called, token:', token?.substring(0, 20) + '...');
        if (token && token.length > 0) {
            onVerify(token);
        }
    }, [onVerify]);

    const handleError = useCallback(() => {
        console.log('[Turnstile] onError called');
        onError?.();
    }, [onError]);

    const handleExpire = useCallback(() => {
        console.log('[Turnstile] onExpire called');
        onExpire?.();
    }, [onExpire]);

    const renderWidget = useCallback(() => {
        if (!window.turnstile || !containerRef.current) return;
        if (widgetIdRef.current) return;

        console.log('[Turnstile] Rendering widget...');
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: handleVerify,
            'error-callback': handleError,
            'expired-callback': handleExpire,
            'before-interactive-callback': () => console.log('[Turnstile] before-interactive'),
            'after-interactive-callback': () => console.log('[Turnstile] after-interactive'),
            theme,
            size,
            retry: 'auto',
            'retry-interval': 5000,
        });
        console.log('[Turnstile] Widget rendered, id:', widgetIdRef.current);
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

    return <div ref={containerRef} className="flex justify-center my-4" />;
}
