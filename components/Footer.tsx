export default function Footer() {
  return (
    <footer className='py-2 bg-primary text-primary-foreground/80 text-center'>
      <div className='container mx-auto px-6'>
        <p className='text-sm'>
          &copy; {new Date().getFullYear()} Azmi Developer. All rights reserved.
        </p>
        {/* <p className="text-xs mt-2 text-primary-foreground/50">
          Designed & Built with React and Tailwind CSS
        </p> */}
      </div>
    </footer>
  );
}
