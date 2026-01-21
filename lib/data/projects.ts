import { Project } from '@/lib/types/project';

export const pastProjects: Project[] = [
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
      'AI Integration',
    ],
    images: Array.from(
      { length: 2 },
      (_, i) => `/projects/cmt/cmt_${i + 1}.png`,
    ),
    webUrl: '',
  },
  {
    title: 'Claimback',
    description:
      'Claimback.de is a legal platform that helps consumers recover financial losses and claims. It focuses on cases such as online gambling refunds, compensation for diesel emission scandals, and data breaches like the Facebook leak. The service operates without cost risk, working on a contingency basis, and partners with established law firms to handle claims efficiently. Users can submit claims digitally with minimal effort, ensuring maximum compensation if successful.',
    tags: ['React.js', 'Next.js', 'Firebase', 'JavaScript', 'Tailwind'],
    images: Array.from(
      { length: 1 },
      (_, i) => `/projects/claimback/claimback_${i + 1}.png`,
    ),
    webUrl: 'https://claimback.de',
  },
  {
    title: 'Odysseus – Daihatsu Landing Page Generator',
    description:
      'Daihatsu aims to provide each salesman with a standardized, brand-aligned landing page built on the DSO Commerce system. This removes the need for manually creating personal pages or blogs, while ensuring consistent branding, better lead capture, and easier content management.',
    tags: ['React.js', 'Next.js', 'TypeScript', 'Tailwind', 'Ant Design'],
    images: Array.from(
      { length: 3 },
      (_, i) => `/projects/odysseus/odysseus_${i + 1}.png`,
    ),
    webUrl: 'https://www.astra-daihatsu.id/',
  },
  {
    title: 'Retail Sales Supply Planning (RSSP)',
    description:
      'Retail Sales Supply Planning (RSSP) is used for the planning process for the next 3 months, viewing sales data and information related to RSSP, integrating planning units with ADM supply, and comparison with master budget data.',
    tags: ['React.js', 'TypeScript', 'Node.js', 'Ant Design', 'SCSS', 'MobX'],
    images: Array.from(
      { length: 27 },
      (_, i) => `/projects/rssp/rssp_${i + 1}.png`,
    ),
    webUrl: '',
  },
  {
    title: 'Asset Management System',
    description:
      'Web + mobile system for tracking company assets, locations, and depreciation values. Delivered full-stack modules including scanning, asset lists, and value calculation rules.',
    tags: ['React.js', 'Node.js', 'MongoDB', 'React Native', 'Redux'],
    images: [],
    webUrl: '',
  },
  {
    title: 'Task Management App (Trello-like)',
    description:
      'A customizable Kanban workspace with drag-drop tasks, column configs, comments, due dates, and team collaboration. Includes real-time updates with WebSocket/Socket.io.',
    tags: ['React.js', 'Node.js', 'MongoDB', 'WebSocket', 'Socket.io', 'Redux'],
    images: [],
    webUrl: '',
  },
  {
    title: 'Notary Public Workflow System',
    description:
      'A document-tracking system to manage client requests, progress stages, and secure storage of certificates and identity files.',
    tags: ['React.js', 'Node.js', 'MongoDB', 'Redux'],
    images: [],
    webUrl: '',
  },
  {
    title: 'SPPD (Official Travel Warrant)',
    description:
      'A government application for generating travel documents, estimating budgets, reporting actual expenses, and producing official reports for Riau Islands administration.',
    tags: ['React.js', 'Node.js', 'MongoDB', 'Redux'],
    images: [],
    webUrl: '',
  },
  {
    title: 'SmartSiz – Valve Product Selector',
    description:
      'Desktop engineering tool to calculate optimal valve products based on client specifications, with cost estimation and report generation.',
    tags: ['C#', 'ASP.NET', '.NET Framework', 'WPF', 'MVVM'],
    images: [],
    webUrl: '',
  },
  {
    title: 'SmartSiz – User Management App',
    description:
      'A lightweight WPF desktop app for managing SmartSiz user accounts with full CRUD functionality.',
    tags: ['C#', 'ASP.NET', '.NET Framework', 'WPF', 'MVVM'],
    images: [],
    webUrl: '',
  },
];

export const personalProjects: Project[] = [
  {
    title: 'UKIT',
    description:
      'A comprehensive personal utility platform that evolves beyond simple link-in-bio tools. Features a multi-app architecture starting with "Bio", layered identity management, username aliases, and strictly separated public/private routing. Built for scalability with a Google-like ecosystem approach.',
    tags: [
      'Next.js 16',
      'React 19',
      'Supabase',
      'Tailwind CSS',
      'Shadcn/UI',
      'Framer Motion',
      'dnd-kit',
    ],
    images: Array.from(
      { length: 1 },
      (_, i) => `/projects/ukit/ukit_${i + 1}.png`,
    ),
    webUrl: 'https://ukitapp.vercel.app',
  },
  {
    title: 'Mini Market Cashier System',
    description:
      'A full-stack point-of-sale (POS) system for mini markets with inventory management, transaction-based sales tracking, stock management with expiration dates, backend synchronization, and comprehensive sales history with advanced search and filtering.',
    tags: [
      'Next.js',
      'TypeScript',
      'React',
      'Tailwind CSS',
      'Supabase',
      'PostgreSQL',
    ],
    images: Array.from(
      { length: 10 },
      (_, i) => `/projects/cashier/cashier_${i + 1}.png`,
    ),
    webUrl: '/cashier',
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
  },
];
