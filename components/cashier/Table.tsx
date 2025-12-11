'use client';

import { ReactNode } from 'react';
import { IconType } from 'react-icons';

interface TableColumn<T> {
    header: string;
    key?: keyof T;
    renderRow?: (item: T) => ReactNode;
    align?: 'left' | 'center' | 'right';
    className?: string;
}

interface TableEmptyState {
    icon: IconType;
    title: string;
    subtitle: string;
}

interface TableProps<T> {
    columns: TableColumn<T>[];
    data: T[];
    emptyState: TableEmptyState;
    rowKey?: (item: T) => string;
    onRowClick?: (item: T) => void;
    className?: string;
    size?: 'sm' | 'md';
    rowClassName?: (item: T) => string;
}

export function Table<T>({
    columns,
    data,
    emptyState,
    rowKey,
    onRowClick,
    className,
    size = 'md',
    rowClassName,
}: TableProps<T>) {
    const EmptyIcon = emptyState.icon;

    const renderCell = (item: T, col: TableColumn<T>) => {
        if (col.renderRow) return col.renderRow(item);
        if (col.key) {
            const value = item[col.key];
            return <span>{String(value)}</span>;
        }
        return null;
    };

    const paddingClass = size === 'sm' ? 'px-3 py-2' : 'px-6 py-3';
    const cellPaddingClass = size === 'sm' ? 'px-3 py-2' : 'px-6 py-4';

    return (
        <div className={`bg-white shadow overflow-x-auto rounded-lg border border-gray-200 ${className || 'hidden md:block'}`}>
            <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                    <tr>
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                className={`${paddingClass} font-bold text-gray-500 uppercase tracking-wider ${col.align === 'center' ? 'text-center' :
                                    col.align === 'right' ? 'text-right' : 'text-left'
                                    }`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className={`text-center ${size === 'sm' ? 'px-3 py-4 text-gray-500' : 'px-6 py-12'}`}>
                                {size === 'sm' ? (
                                    emptyState.title
                                ) : (
                                    <>
                                        <div className='bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                                            <EmptyIcon size={32} className='text-gray-500' />
                                        </div>
                                        <h3 className='text-lg font-medium text-gray-500 mb-1'>
                                            {emptyState.title}
                                        </h3>
                                        <p className='text-gray-500'>{emptyState.subtitle}</p>
                                    </>
                                )}
                            </td>
                        </tr>
                    ) : (
                        data.map((item, index) => (
                            <tr
                                key={rowKey ? rowKey(item) : (item as { id?: string }).id || String(index)}
                                onClick={() => onRowClick?.(item)}
                                className={`${onRowClick ? 'hover:bg-blue-50 transition-colors cursor-pointer' : ''} ${rowClassName ? rowClassName(item) : ''}`}
                            >
                                {columns.map((col, idx) => (
                                    <td
                                        key={idx}
                                        className={`${cellPaddingClass} whitespace-nowrap ${col.align === 'center' ? 'text-center' :
                                            col.align === 'right' ? 'text-right' : ''
                                            } ${col.className || ''}`}
                                    >
                                        {renderCell(item, col)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
