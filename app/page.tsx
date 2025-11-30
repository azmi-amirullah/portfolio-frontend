import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import PastProjects from '@/components/PastProjects';
import PersonalProjects from '@/components/PersonalProjects';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className='min-h-screen bg-background font-sans selection:bg-secondary/20 selection:text-secondary'>
      <Navigation />
      <main>
        <Hero />
        <PastProjects />
        <PersonalProjects />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
