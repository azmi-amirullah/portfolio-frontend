'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '@/lib/services/auth-service';
import { Button } from '@/components/ui/Button';
import { Turnstile } from '@/components/ui/Turnstile';
import { toast } from 'react-toastify';
import { MdDashboard, MdLock, MdPerson, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import Loading from '@/components/ui/Loading';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

export default function CashierLoginPage() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = () => {
            if (authService.isAuthenticated()) {
                router.replace('/cashier/pos');
            } else {
                setIsCheckingAuth(false);
            }
        };
        checkAuth();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        const success = await authService.login(identifier, password);

        if (success) {
            toast.success('Login successful');
            router.push('/cashier/pos');
            // Keep isLoading true until navigation completes
        } else {
            setIsLoading(false);
        }
    };

    if (isCheckingAuth) {
        return (
            <div className='min-h-dvh flex items-center justify-center bg-gray-50'>
                <Loading />
            </div>
        );
    }

    const showTurnstile = TURNSTILE_SITE_KEY && !turnstileToken;

    return (
        <AnimatePresence mode='wait'>
            {showTurnstile ? (
                <Turnstile
                    key='turnstile'
                    siteKey={TURNSTILE_SITE_KEY}
                    onVerify={setTurnstileToken}
                    onExpire={() => setTurnstileToken(null)}
                    onError={() => setTurnstileToken(null)}
                />
            ) : (
                <div key='login' className='min-h-dvh flex items-center justify-center bg-gray-50 px-4'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className='max-w-md w-full space-y-6 md:space-y-8 bg-white p-6 md:p-8 rounded-2xl shadow-lg'
                    >
                        <div className='text-center'>
                            <div className='mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
                                <MdDashboard className='h-8 w-8 text-blue-600' />
                            </div>
                            <h2 className='text-2xl md:text-3xl font-bold '>Welcome Back</h2>
                            <p className='mt-2 text-gray-500'>
                                Sign in to access the cashier system
                            </p>
                        </div>

                        <form className='mt-6 md:mt-8 space-y-6' onSubmit={handleLogin}>
                            <div className='space-y-5 md:space-y-6'>
                                <div>
                                    <label
                                        htmlFor='identifier'
                                        className='block font-medium'
                                    >
                                        Username or Email
                                    </label>
                                    <div className='mt-1 relative rounded-md shadow-sm'>
                                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                            <MdPerson className='h-5 w-5 text-gray-500' />
                                        </div>
                                        <input
                                            id='identifier'
                                            name='identifier'
                                            type='text'
                                            required
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                            placeholder='Enter your username or email'
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor='password'
                                        className='block font-medium'
                                    >
                                        Password
                                    </label>
                                    <div className='mt-1 relative rounded-md shadow-sm'>
                                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                            <MdLock className='h-5 w-5 text-gray-500' />
                                        </div>
                                        <input
                                            id='password'
                                            name='password'
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className='block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                            placeholder='Enter your password'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => setShowPassword(!showPassword)}
                                            className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer'
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? (
                                                <MdVisibilityOff className='h-5 w-5 text-gray-500 hover:text-gray-900' />
                                            ) : (
                                                <MdVisibility className='h-5 w-5 text-gray-500 hover:text-gray-900' />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Button
                                    type='submit'
                                    disabled={isLoading}
                                    className='w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    {isLoading ? 'Signing in...' : 'Sign in'}
                                </Button>
                            </div>
                        </form>

                        <div className='bg-blue-50 border border-blue-200 rounded-lg py-2 px-4'>
                            <p className='font-medium text-blue-800 mb-2'>Try it out:</p>
                            <div className='text-blue-800'>
                                <p><span className='font-medium'>Username:</span> guest</p>
                                <p><span className='font-medium'>Password:</span> guest.password</p>
                            </div>
                        </div>

                        <div className='bg-amber-50 border border-amber-200 rounded-lg py-2 px-4'>
                            <p className='text-amber-800'>
                                <span className='font-medium'>⚠️ Note:</span> First login may take 30-60s due to server cold start.
                            </p>
                        </div>

                        <div className='text-center'>
                            <p className='text-gray-500'>
                                &copy; {new Date().getFullYear()} Mohd Azmi Amirullah A. All rights
                                reserved.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
