import Image from 'next/image';
import { FaRegCheckCircle } from 'react-icons/fa';
import Img from '@/assets/img.png';

export default function About() {
  const skills = [
    'React.js',
    'JavaScript',
    'TypeScript',
    'Tailwind CSS',
    'Next.js',
    'Strapi',
    'Redux',
    'Node.js',
    'PostgreSQL',
    'Mysql',
    'HTML & CSS',
    'Ant Design',
    'Chatgpt Integration',
    'Websocket',
  ];

  return (
    <section id='about' className='py-24 bg-background border-y border-border'>
      <div className='container mx-auto px-6 md:px-12'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
          <div className='relative'>
            <div className='absolute -top-4 -left-4 w-24 h-24 bg-secondary/10 rounded-full blur-xl'></div>
            <div className='absolute -bottom-4 -right-4 w-32 h-32 bg-accent/10 rounded-full blur-xl'></div>
            <Image
              src={Img.src}
              alt='img of me'
              width={800}
              height={450}
              className='relative rounded-2xl shadow-xl w-full max-w-md mx-auto lg:ml-0 transition-transform duration-500 hover:scale-101'
            />
          </div>

          <div>
            <h2 className='text-4xl font-heading font-bold text-primary mb-6'>
              About Me
            </h2>
            <div className='space-y-4 text-muted-foreground text-lg leading-relaxed'>
              <p>
                Hello! I&apos;m Azmi Amirullah, but you can call me Azmi, a
                passionate frontend developer who enjoys bridging the gap
                between engineering and design. I have been developing web
                applications for over 4 years, specializing in the React
                ecosystem.
              </p>
              <p>
                My approach to development is centered around three core
                principles: writing clean, maintainable code, creating intuitive
                user experiences, and constantly learning new technologies to
                stay ahead of the curve.
              </p>
            </div>

            <div className='mt-8'>
              <h3 className='text-lg font-bold text-primary mb-4'>
                Technical Skills
              </h3>
              <div className='grid grid-cols-2 gap-3'>
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className='flex items-center gap-2 text-muted-foreground'
                  >
                    <FaRegCheckCircle size={16} className='text-secondary' />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
