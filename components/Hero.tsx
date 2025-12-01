'use client';

import { motion } from 'framer-motion';
import { LuArrowRight, LuGithub, LuLinkedin, LuTerminal } from 'react-icons/lu';
import heroBg from '@/assets/hero-bg.png';
import Image from 'next/image';
import { Button } from './ui/Button';

export default function Hero() {
  return (
    <section className='relative min-h-screen flex items-center pt-20 overflow-hidden bg-background'>
      {/* Background Image with Overlay */}
      <div className='absolute inset-0 z-0'>
        <Image
          src={heroBg}
          alt='Abstract geometric background'
          className='w-full h-full object-cover opacity-40'
        />
        <div className='absolute inset-0 bg-linear-to-b from-background/80 via-background/50 to-background'></div>
      </div>

      <div className='container mx-auto px-6 md:px-12 relative z-10'>
        <div className='max-w-3xl'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6'>
              <LuTerminal size={14} />
              <span>Frontend Developer</span>
            </div>

            <h1 className='text-5xl md:text-7xl font-heading font-bold text-primary leading-[1.1] mb-6'>
              Building digital <br />
              <span className='text-secondary'>experiences</span> that matter.
            </h1>

            <p className='text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl'>
              I&apos;m a specialized frontend developer focused on building
              accessible, pixel-perfect, and performant web applications using
              modern React architecture.
            </p>

            <div className='flex flex-col sm:flex-row gap-4'>
              <Button
                href='#projects'
                className='px-8 py-4 h-auto text-base shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all'
                data-testid='hero-cta-primary'
              >
                View My Work
                <LuArrowRight size={18} className='ml-2' />
              </Button>
              <Button
                href='#contact'
                variant='outline'
                className='px-8 py-4 h-auto text-base hover:bg-gray-50 hover:border-secondary/50 transition-all'
                data-testid='hero-cta-secondary'
              >
                Contact Me
              </Button>
            </div>

            <div className='mt-12 flex items-center gap-6 text-muted-foreground'>
              <a
                href='https://github.com/azmi-amirullah'
                className='hover:text-secondary transition-colors'
                aria-label='GitHub'
              >
                <LuGithub size={24} />
              </a>
              <a
                href='https://www.linkedin.com/in/azmi-amirullah/'
                className='hover:text-secondary transition-colors'
                aria-label='LinkedIn'
              >
                <LuLinkedin size={24} />
              </a>
              <div className='h-px w-12 bg-border'></div>
              <span className='text-sm font-medium'>
                Based in Indonesia, Available for remote work.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
