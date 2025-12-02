'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  showCloseButton?: boolean;
  headerIcon?: ReactNode;
  headerClassName?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'lg',
  showCloseButton = true,
  headerIcon,
  headerClassName = 'bg-gray-50 border-gray-200',
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='absolute inset-0 bg-black/80 backdrop-blur-sm'
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]`}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div
                className={`flex items-center justify-between px-6 py-4 border-b ${headerClassName}`}
              >
                {title && (
                  <h3 className='text-xl font-bold truncate pr-4 flex items-center gap-3'>
                    {headerIcon}
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={onClose}
                    className='hover:bg-gray-200 h-8 w-8 ml-auto'
                  >
                    <MdClose size={24} />
                  </Button>
                )}
              </div>
            )}

            {/* Content */}
            <div className='flex-1 overflow-y-auto'>{children}</div>

            {/* Footer */}
            {footer && (
              <div className='px-6 py-4 border-t border-gray-200 bg-gray-50'>
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
