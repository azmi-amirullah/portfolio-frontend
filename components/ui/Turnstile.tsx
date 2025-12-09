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
                    theme?: 'light' | 'dark' | 'auto';
                    size?: 'normal' | 'compact';
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

    const renderWidget = useCallback(() => {
        if (!window.turnstile || !containerRef.current) return;
        if (widgetIdRef.current) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: onVerify,
            'error-callback': onError,
            'expired-callback': onExpire,
            theme,
            size,
        });
    }, [siteKey, onVerify, onError, onExpire, theme, size]);

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
