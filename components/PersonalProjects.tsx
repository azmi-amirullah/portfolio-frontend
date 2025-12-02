'use client';

import ProjectCard from './ProjectCard';
import { motion } from 'framer-motion';

interface Project {
  title: string;
  description: string;
  tags: string[];
  images: string[];
  webUrl: string;
  repoUrl: string;
}

export default function PersonalProjects() {
  const projects: Project[] = [
    {
      title: 'Mini Market Cashier System',
      description:
        'A comprehensive point-of-sale (POS) system for mini markets featuring inventory management, sales tracking, stock batch management with expiration dates, and detailed sales history. (In Progress - Currently using mock API with localStorage)',
      tags: [
        'Next.js',
        'TypeScript',
        'React',
        'Tailwind CSS',
        'LocalStorage API',
        'Framer Motion',
      ],
      images: ['/projects/cashier/cashier_1.png'],
      webUrl: '/cashier',
      repoUrl: '',
    },
    {
      title: 'Personal Portfolio V1',
      description:
        'My first personal portfolio website built to showcase my early work and skills. It features a simple design and basic project listing.',
      tags: [
        'Next.js',
        'Tailwind CSS',
        'TypeScript',
        'React',
        'Material Ui',
        'HTML & CSS',
      ],
      images: ['/projects/portfolio/portfolio_1.png'],
      webUrl: '#',
      repoUrl: '#',
    },
    {
      title: 'MQL Trading Tools & Expert Advisors',
      description:
        'Development of custom Expert Advisors (EAs), indicators, and automated trading solutions for MetaTrader 4 and MetaTrader 5 platforms. Specialized in algorithmic trading strategies and technical analysis tools for forex and financial markets.',
      tags: [
        'MQL4',
        'MQL5',
        'Expert Advisors',
        'Algorithmic Trading',
        'MetaTrader',
      ],
      images: ['/projects/mql5/mql5_1.png'],
      webUrl: 'https://www.mql5.com/en/users/azmiupb/seller',
      repoUrl: '',
    },
  ];

  return (
    <section id='personal-projects' className='py-24 bg-white'>
      <div className='container mx-auto px-6 md:px-12'>
        <div className='mb-16 md:max-w-2xl'>
          <h2 className='text-4xl font-heading font-bold text-primary mb-4'>
            Personal Projects
          </h2>
          <p className='text-xl text-muted-foreground'>
            My personal experiments and side projects.
          </p>
        </div>

        <motion.div
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
          initial='hidden'
          whileInView='show'
          viewport={{ once: true, margin: '-100px' }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
        >
          {projects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
