'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth-service';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';
import { MdDashboard, MdLock, MdPerson, MdVisibility, MdVisibilityOff } from 'react-icons/md';

export default function CashierLoginPage() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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
        }
        setIsLoading(false);
    };

    if (isCheckingAuth) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <div className='text-center'>
                    <div className='mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse'>
                        <MdDashboard className='h-8 w-8 text-blue-600' />
                    </div>
                    <p className='text-gray-600'>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
            <div className='max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg'>
                <div className='text-center'>
                    <div className='mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
                        <MdDashboard className='h-8 w-8 text-blue-600' />
                    </div>
                    <h2 className='text-3xl font-bold text-gray-900'>Welcome Back</h2>
                    <p className='mt-2 text-sm text-gray-600'>
                        Sign in to access the cashier system
                    </p>
                </div>

                <form className='mt-8 space-y-6' onSubmit={handleLogin}>
                    <div className='space-y-4'>
                        <div>
                            <label
                                htmlFor='identifier'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Username or Email
                            </label>
                            <div className='mt-1 relative rounded-md shadow-sm'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <MdPerson className='h-5 w-5 text-gray-400' />
                                </div>
                                <input
                                    id='identifier'
                                    name='identifier'
                                    type='text'
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                    placeholder='Enter your username or email'
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor='password'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Password
                            </label>
                            <div className='mt-1 relative rounded-md shadow-sm'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <MdLock className='h-5 w-5 text-gray-400' />
                                </div>
                                <input
                                    id='password'
                                    name='password'
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                    placeholder='Enter your password'
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer'
                                >
                                    {showPassword ? (
                                        <MdVisibilityOff className='h-5 w-5 text-gray-400 hover:text-gray-600' />
                                    ) : (
                                        <MdVisibility className='h-5 w-5 text-gray-400 hover:text-gray-600' />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Button
                            type='submit'
                            disabled={isLoading}
                            className='w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </div>
                </form>

                <div className='bg-blue-50 border border-blue-200 rounded-lg py-2 px-4'>
                    <p className='text-sm font-medium text-blue-900 mb-2'>Try it out:</p>
                    <div className='text-sm text-blue-700'>
                        <p><span className='font-medium'>Username:</span> guest</p>
                        <p><span className='font-medium'>Password:</span> guest.password</p>
                    </div>
                </div>

                <div className='text-center'>
                    <p className='text-xs text-gray-500'>
                        &copy; {new Date().getFullYear()} Mohd Azmi Amirullah A. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
