'use client';

import { ReactNode } from 'react';
import { IconType } from 'react-icons';

interface PageHeaderProps {
    icon: IconType;
    title: string;
    subtitle: string;
    actions?: ReactNode;
}

export function PageHeader({ icon: Icon, title, subtitle, actions }: PageHeaderProps) {
    return (
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
            <div>
                <h1 className='text-2xl lg:text-3xl font-bold flex items-center gap-2 lg:gap-3'>
                    <Icon className='text-blue-600' size={28} />
                    <span>{title}</span>
                </h1>
                <p className='text-gray-500 mt-1 lg:text-base'>
                    {subtitle}
                </p>
            </div>
            {actions && (
                <div className='flex gap-2 w-full sm:w-auto'>
                    {actions}
                </div>
            )}
        </div>
    );
}
