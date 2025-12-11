'use client';

import { createContext, useContext, useState, useLayoutEffect, useEffect, ReactNode } from 'react';

export type TextSize = 'normal' | 'large' | 'xl';

interface TextSizeContextType {
    textSize: TextSize;
    setTextSize: (size: TextSize) => void;
}

const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

const STORAGE_KEY = 'cashier-text-size';

const TEXT_SIZE_MAP: Record<TextSize, string> = {
    normal: '100%',
    large: '110%',
    xl: '125%',
};

export function TextSizeProvider({ children }: { children: ReactNode }) {
    const [textSize, setTextSizeState] = useState<TextSize>('normal');
    const [isReady, setIsReady] = useState(false);

    useLayoutEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as TextSize | null;
        const size = stored && TEXT_SIZE_MAP[stored] ? stored : 'normal';
        document.documentElement.style.fontSize = TEXT_SIZE_MAP[size];
        queueMicrotask(() => {
            setTextSizeState(size);
            setIsReady(true);
        });
    }, []);

    useEffect(() => {
        if (isReady) {
            document.documentElement.style.fontSize = TEXT_SIZE_MAP[textSize];
        }
    }, [textSize, isReady]);

    useEffect(() => {
        return () => {
            document.documentElement.style.fontSize = '';
        };
    }, []);

    const setTextSize = (size: TextSize) => {
        setTextSizeState(size);
        localStorage.setItem(STORAGE_KEY, size);
    };

    if (!isReady) {
        return null;
    }

    return (
        <TextSizeContext.Provider value={{ textSize, setTextSize }}>
            {children}
        </TextSizeContext.Provider>
    );
}

export function useTextSize() {
    const context = useContext(TextSizeContext);
    if (!context) {
        throw new Error('useTextSize must be used within a TextSizeProvider');
    }
    return context;
}

export { TEXT_SIZE_MAP };

