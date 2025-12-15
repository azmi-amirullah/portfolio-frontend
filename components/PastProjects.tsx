'use client';

import ProjectCard from './ProjectCard';
import { motion } from 'framer-motion';
import { pastProjects } from '@/lib/data/projects';

export default function PastProjects() {
  return (
    <section id='projects' className='py-24 bg-background'>
      <div className='container mx-auto px-6 md:px-12'>
        <div className='mb-16 md:max-w-2xl'>
          <h2 className='text-4xl font-heading font-bold text-primary mb-4'>
            Past Projects
          </h2>
          <p className='text-xl text-muted-foreground'>
            Highlighted work I was involved in at my previous company.
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
          {pastProjects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
