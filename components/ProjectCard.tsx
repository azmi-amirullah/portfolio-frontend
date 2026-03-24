'use client';

import { motion } from 'framer-motion';
import { LuExternalLink } from 'react-icons/lu';
import Image from 'next/image';
import { useState } from 'react';
import ImageGalleryModal from './ImageGalleryModal';
import { Project } from '@/lib/types/project';

type ProjectCardProps = Project;

export default function ProjectCard({
  title,
  description,
  tags,
  images = [],
  webUrl,
}: ProjectCardProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const displayImage = images.length > 0 ? images[0] : '';
  const galleryImages = images.length > 0 ? images : [];

  return (
    <>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
        }}
        className='h-full'
      >
        <div className='group relative overflow-hidden border border-border rounded-xl hover:border-secondary transition-all duration-300 hover:shadow-lg bg-white h-full flex flex-col'>
          <div
            className={`relative overflow-hidden aspect-video ${
              galleryImages.length > 0 ? 'cursor-pointer' : ''
            }`}
            onClick={() => galleryImages.length > 0 && setIsGalleryOpen(true)}
          >
            <div className='absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-300 z-10 mix-blend-multiply'></div>
            {displayImage ? (
              <Image
                src={displayImage}
                alt={title}
                width={800}
                height={450}
                className='w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500'
              />
            ) : (
              <div className='w-full h-full bg-muted flex items-center justify-center'>
                <span className='text-muted-foreground font-medium'>
                  No Preview
                </span>
              </div>
            )}

            {/* Gallery Indicator */}
            {galleryImages.length > 1 && (
              <div className='absolute bottom-3 right-3 z-20 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm'>
                {galleryImages.length} images
              </div>
            )}
          </div>

          <div className='p-6 pb-2'>
            <div className='mb-2'>
              {webUrl ? (
                <a
                  href={webUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='group/header flex justify-between items-center'
                >
                  <h3 className='text-2xl font-heading font-bold text-primary group-hover/header:text-secondary transition-all underline-offset-4 decoration-secondary/0 group-hover/header:decoration-secondary decoration-2 duration-300'>
                    {title}
                  </h3>
                  <div className='text-muted-foreground group-hover/header:text-secondary transition-all duration-300'>
                    <LuExternalLink size={20} />
                  </div>
                </a>
              ) : (
                <h3 className='text-2xl font-heading font-bold text-primary'>
                  {title}
                </h3>
              )}
            </div>
          </div>

          <div className='p-6 pt-2 grow flex flex-col'>
            <p className='text-lg text-muted-foreground leading-relaxed mb-8 grow'>
              {description}
            </p>
            <div className='flex flex-wrap gap-2 mt-auto'>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className='inline-flex cursor-default items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/5 text-primary border border-primary/10 hover:bg-secondary/10 hover:text-secondary hover:border-secondary/20 transition-all duration-300'
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <ImageGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={galleryImages}
        title={title}
      />
    </>
  );
}
