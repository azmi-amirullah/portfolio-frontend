'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

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
    const [isInteracting, setIsInteracting] = useState(false);

    const handleVerify = useCallback((token: string) => {
        // Only accept the token if we're not in the middle of an interactive challenge
        // or if the token is definitely valid (non-empty string)
        if (token && token.length > 0) {
            setIsInteracting(false);
            onVerify(token);
        }
    }, [onVerify]);

    const handleError = useCallback(() => {
        setIsInteracting(false);
        onError?.();
    }, [onError]);

    const handleExpire = useCallback(() => {
        setIsInteracting(false);
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
            'before-interactive-callback': () => setIsInteracting(true),
            'after-interactive-callback': () => setIsInteracting(false),
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
        <div className="relative">
            <div ref={containerRef} className="flex justify-center my-4" />
            {isInteracting && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 pointer-events-none">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}
