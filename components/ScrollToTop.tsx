'use client';

import { useEffect, useState } from 'react';
import { LuArrowUp } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className='fixed bottom-8 right-8 z-40'
        >
          <Button
            onClick={scrollToTop}
            className='rounded-full p-3 h-auto shadow-lg hover:shadow-xl border border-white'
            aria-label='Scroll to top'
          >
            <LuArrowUp size={20} />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
