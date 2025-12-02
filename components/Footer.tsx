export default function Footer() {
  return (
    <footer className='py-2 bg-primary text-primary-foreground/80 text-center'>
      <div className='container mx-auto px-6'>
        <p className='text-sm'>
          &copy; {new Date().getFullYear()} Mohd Azmi Amirullah A. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
