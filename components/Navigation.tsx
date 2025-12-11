'use client';

import { useState, useEffect } from 'react';
import { LuMenu, LuX } from 'react-icons/lu';
import { Button } from './ui/Button';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    handleScroll();
    // Enable transitions only after initial state is set
    requestAnimationFrame(() => setMounted(true));
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Past Projects', href: '#projects' },
    { name: 'Personal Projects', href: '#personal-projects' },
    { name: 'About', href: '#about' },
  ];

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav
        className={`fixed w-full z-50 ${mounted ? 'opacity-100 transition-all duration-300' : 'opacity-0'
          } ${scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-sm py-4'
            : 'bg-transparent py-4'
          }`}
      >
        <div className='container mx-auto px-6 md:px-12 flex justify-between items-center'>
          <a
            href='#'
            className='text-2xl font-heading font-bold text-primary tracking-tight'
          >
            Azmi<span className='text-secondary'>.Dev</span>
          </a>

          {/* Desktop Nav */}
          <div className='hidden md:flex items-center gap-8'>
            {navLinks.map((link) => (
              <Button
                key={link.name}
                variant='ghost'
                onClick={() => scrollToSection(link.href)}
                className='text-foreground/80 hover:text-secondary font-medium transition-colors px-0'
                data-testid={`nav-link-${link.name.toLowerCase()}`}
              >
                {link.name}
              </Button>
            ))}
            <Button
              href='#contact'
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#contact');
              }}
              className='px-5'
              data-testid='nav-cta'
            >
              Contact Me
            </Button>
          </div>

          {/* Mobile Toggle */}
          <Button
            variant='ghost'
            size='icon'
            className='md:hidden text-foreground hover:text-secondary'
            onClick={() => setIsOpen(!isOpen)}
            data-testid='nav-toggle'
          >
            {isOpen ? (
              <LuX className='h-6 w-6' />
            ) : (
              <LuMenu className='h-6 w-6' />
            )}
          </Button>
        </div>

        {/* Mobile Menu is rendered below the nav (see after </nav>) */}
      </nav>

      {/* Mobile Menu (rendered below the fixed nav so it's not clipped) */}
      {isOpen && (
        <div className='md:hidden fixed left-0 w-full top-16 bg-white border-b border-border px-6 py-2 flex flex-col shadow-lg z-40 animate-in slide-in-from-top-5'>
          {navLinks.map((link) => (
            <Button
              key={link.name}
              variant='ghost'
              onClick={() => scrollToSection(link.href)}
              className='justify-start text-lg font-medium text-left py-2 h-auto border-b border-dashed border-border last:border-0 rounded-none hover:text-secondary'
            >
              {link.name}
            </Button>
          ))}
        </div>
      )}
    </>
  );
}
