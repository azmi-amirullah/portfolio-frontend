'use client';

import { useEffect, useState } from 'react';
import { LuArrowUp } from 'react-icons/lu';
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
    <>
      {isVisible && (
        <Button
          onClick={scrollToTop}
          className='fixed bottom-8 right-8 rounded-full p-3 h-auto shadow-lg hover:shadow-xl z-50 border border-white'
          aria-label='Scroll to top'
        >
          <LuArrowUp size={20} />
        </Button>
      )}
    </>
  );
}
