'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LuX, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import Image from 'next/image';
import { useState } from 'react';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  title: string;
}

export default function ImageGalleryModal({
  isOpen,
  onClose,
  images,
  title,
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setCurrentIndex(0);
    }
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8'>
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
            className='relative w-full max-w-5xl bg-background rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]'
          >
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b border-border bg-card'>
              <h3 className='text-lg font-semibold text-foreground truncate pr-4'>
                {title}
              </h3>
              <button
                onClick={onClose}
                className='p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
              >
                <LuX size={24} />
              </button>
            </div>

            {/* Main Image Area */}
            <div className='relative flex-1 bg-black/5 flex items-center justify-center overflow-hidden min-h-[300px]'>
              {images.length > 0 ? (
                <div className='relative w-full h-full flex items-center justify-center p-4'>
                  <div className='relative w-full h-full max-h-[70vh] aspect-video'>
                    <Image
                      src={images[currentIndex]}
                      alt={`${title} - Image ${currentIndex + 1}`}
                      fill
                      className='object-contain'
                      priority
                      unoptimized={true}
                    />
                  </div>
                </div>
              ) : (
                <div className='text-muted-foreground'>No images available</div>
              )}

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className='absolute cursor-pointer left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/25 text-white hover:bg-black/50 transition-all '
                  >
                    <LuChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className='absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/25 text-white hover:bg-black/50 transition-all '
                  >
                    <LuChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails / Footer */}
            {images.length > 1 && (
              <div className='p-4 bg-card border-t border-border overflow-x-auto'>
                <div className='flex gap-2 justify-center min-w-min'>
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative cursor-pointer w-20 h-14 rounded-md overflow-hidden border-2 transition-all shrink-0 ${
                        currentIndex === idx
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className='object-cover'
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
