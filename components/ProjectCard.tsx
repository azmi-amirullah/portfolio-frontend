'use client';

import { motion } from 'framer-motion';
import { LuExternalLink } from 'react-icons/lu';
import Image from 'next/image';

import { useState } from 'react';
import ImageGalleryModal from './ImageGalleryModal';

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  images?: string[];
  webUrl: string;
  repoUrl: string;
}

export default function ProjectCard({
  title,
  description,
  tags,
  images = [],
  webUrl,
}: // repoUrl,
ProjectCardProps) {
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
      >
        <div className='group overflow-hidden border border-border rounded-lg hover:border-secondary/50 transition-all duration-300 hover:shadow-lg bg-white h-full flex flex-col'>
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
              <div className='absolute bottom-3 right-3 z-20 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity'>
                {galleryImages.length} images
              </div>
            )}
          </div>

          <div className='p-6 pb-2'>
            <div className='flex justify-between items-start mb-2'>
              <h3 className='text-2xl font-heading font-bold text-primary group-hover:text-secondary transition-colors'>
                {title}
              </h3>

              {webUrl && (
                <div className='flex gap-3 mt-1.5'>
                  <a
                    href={webUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-muted-foreground hover:text-secondary transition-colors'
                    title='View Website'
                  >
                    <LuExternalLink size={20} />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className='p-6 pt-2 grow flex flex-col'>
            <p className='text-muted-foreground leading-relaxed mb-8'>
              {description}
            </p>
            <div className='flex flex-wrap gap-2 mt-auto'>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className='inline-flex cursor-default items-center px-3 py-1 rounded-full text-sm font-normal bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors'
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
