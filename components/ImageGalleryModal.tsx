'use client';

import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setCurrentIndex(0);
    }
  }

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, images.length - 1));
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextImage, prevImage]);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const activeThumbnail = scrollContainerRef.current.querySelector(
        `[data-index="${currentIndex}"]`
      ) as HTMLElement;

      if (activeThumbnail) {
        const container = scrollContainerRef.current;
        const scrollLeft =
          activeThumbnail.offsetLeft -
          container.clientWidth / 2 +
          activeThumbnail.clientWidth / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    }
  }, [currentIndex, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth='5xl'
      headerClassName='bg-card border-border'
      footer={
        images.length > 1 ? (
          <div
            className='w-full overflow-x-auto p-1 relative'
            ref={scrollContainerRef}
          >
            <div className='flex gap-2 w-fit mx-auto'>
              {images.map((img, idx) => (
                <Button
                  key={idx}
                  variant='ghost'
                  data-index={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-20 h-14 p-0 rounded-md overflow-hidden border-2 transition-all shrink-0 hover:bg-transparent ${
                    currentIndex === idx
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent opacity-40 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className='object-cover'
                  />
                </Button>
              ))}
            </div>
          </div>
        ) : undefined
      }
    >
      {/* Main Image Area */}
      <div className='relative w-full h-[60vh] min-h-[300px] bg-black/5 flex items-center justify-center overflow-hidden rounded-md'>
        <AnimatePresence mode='wait'>
          {images.length > 0 ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.1 }}
              className='relative w-full h-full flex items-center justify-center p-4'
            >
              <div className='relative w-full h-full aspect-video'>
                <Image
                  src={images[currentIndex]}
                  alt={`${title} - Image ${currentIndex + 1}`}
                  fill
                  className='object-contain'
                  priority
                  unoptimized={true}
                />
              </div>
            </motion.div>
          ) : (
            <div className='text-muted-foreground'>No images available</div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <Button
              variant='ghost'
              onClick={prevImage}
              disabled={currentIndex === 0}
              className={`absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/25 text-white hover:bg-black/50 hover:text-white h-12 w-12 p-0 transition-opacity ${
                currentIndex === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-100'
              }`}
            >
              <LuChevronLeft size={24} />
            </Button>
            <Button
              variant='ghost'
              onClick={nextImage}
              disabled={currentIndex === images.length - 1}
              className={`absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/25 text-white hover:bg-black/50 hover:text-white h-12 w-12 p-0 transition-opacity ${
                currentIndex === images.length - 1
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-100'
              }`}
            >
              <LuChevronRight size={24} />
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
