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

export default function PastProjects() {
  const projects: Project[] = [
    {
      title: 'Claim Monitoring Tool (CMT)',
      description:
        'The Claim Monitoring Tool (CMT) by Panrise is a sophisticated software designed for litigation funding. It offers advanced data analysis, risk identification, and opportunity assessment for investors and partners. Key features include seamless data import/export, customizable reporting, AI-enhanced document analysis, and structured approval workflows, all aimed at improving decision-making and operational efficiency.',
      tags: [
        'React.js',
        'Node.js',
        'Strapi',
        'Tailwind',
        'PostgreSQL',
        'Redux',
      ],
      images: Array.from(
        { length: 2 },
        (_, i) => `/projects/cmt/cmt_${i + 1}.png`
      ),
      webUrl: '',
      repoUrl: '',
    },
    {
      title: 'Claimback',
      description:
        'Claimback.de is a legal platform that helps consumers recover financial losses and claims. It focuses on cases such as online gambling refunds, compensation for diesel emission scandals, and data breaches like the Facebook leak. The service operates without cost risk, working on a contingency basis, and partners with established law firms to handle claims efficiently. Users can submit claims digitally with minimal effort, ensuring maximum compensation if successful.',
      tags: ['React.js', 'Next.js', 'Firebase', 'JavaScript', 'Tailwind'],
      images: Array.from(
        { length: 1 },
        (_, i) => `/projects/claimback/claimback_${i + 1}.png`
      ),
      webUrl: 'https://claimback.de',
      repoUrl: '',
    },
    {
      title: 'Odysseus – Daihatsu Landing Page Generator',
      description:
        'Daihatsu aims to provide each salesman with a standardized, brand-aligned landing page built on the DSO Commerce system. This removes the need for manually creating personal pages or blogs, while ensuring consistent branding, better lead capture, and easier content management.',
      tags: ['React.js', 'Next.js', 'TypeScript', 'Tailwind', 'Ant Design'],
      images: Array.from(
        { length: 3 },
        (_, i) => `/projects/odysseus/odysseus_${i + 1}.png`
      ),
      webUrl: 'https://www.astra-daihatsu.id/',
      repoUrl: '',
    },
    {
      title: 'Retail Sales Supply Planning (RSSP)',
      description:
        'Retail Sales Supply Planning (RSSP) is used for the planning process for the next 3 months, viewing sales data and information related to RSSP, integrating planning units with ADM supply, and comparison with master budget data.',
      tags: ['React.js', 'TypeScript', 'Node.js', 'Ant Design', 'SCSS', 'MobX'],
      images: Array.from(
        { length: 27 },
        (_, i) => `/projects/rssp/rssp_${i + 1}.png`
      ),
      webUrl: '',
      repoUrl: '',
    },
    {
      title: 'Asset Management System',
      description:
        'Web + mobile system for tracking company assets, locations, and depreciation values. Delivered full-stack modules including scanning, asset lists, and value calculation rules.',
      tags: ['React.js', 'Node.js', 'MongoDB', 'React Native', 'Redux'],
      images: [],
      webUrl: '',
      repoUrl: '',
    },
    {
      title: 'Task Management App (Trello-like)',
      description:
        'A customizable Kanban workspace with drag-drop tasks, column configs, comments, due dates, and team collaboration. Includes real-time updates with WebSocket/Socket.io.',
      tags: [
        'React.js',
        'Node.js',
        'MongoDB',
        'WebSocket',
        'Socket.io',
        'Redux',
      ],
      images: [],
      webUrl: '',
      repoUrl: '',
    },
    {
      title: 'Notary Public Workflow System',
      description:
        'A document-tracking system to manage client requests, progress stages, and secure storage of certificates and identity files.',
      tags: ['React.js', 'Node.js', 'MongoDB', 'Redux'],
      images: [],
      webUrl: '',
      repoUrl: '',
    },
    {
      title: 'SPPD (Official Travel Warrant)',
      description:
        'A government application for generating travel documents, estimating budgets, reporting actual expenses, and producing official reports for Riau Islands administration.',
      tags: ['React.js', 'Node.js', 'MongoDB', 'Redux'],
      images: [],
      webUrl: '',
      repoUrl: '',
    },
    {
      title: 'SmartSiz – Valve Product Selector',
      description:
        'Desktop engineering tool to calculate optimal valve products based on client specifications, with cost estimation and report generation.',
      tags: ['C#', 'ASP.NET', '.NET Framework', 'WPF', 'MVVM'],
      images: [],
      webUrl: '',
      repoUrl: '',
    },
    {
      title: 'SmartSiz – User Management App',
      description:
        'A lightweight WPF desktop app for managing SmartSiz user accounts with full CRUD functionality.',
      tags: ['C#', 'ASP.NET', '.NET Framework', 'WPF', 'MVVM'],
      images: [],
      webUrl: '',
      repoUrl: '',
    },
  ];

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
          {projects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
