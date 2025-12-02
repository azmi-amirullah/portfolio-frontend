'use client';

import { LuMail, LuMapPin, LuPhone } from 'react-icons/lu';
import React from 'react';
import { toast } from 'react-toastify';
import { Button } from './ui/Button';

export default function Contact() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (formData.name.length < 2)
      newErrors.name = 'Name must be at least 2 characters.';
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Please enter a valid email address.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const mailtoLink = `mailto:azmiupb@gmail.com?subject=Contact Form Submission&body=Name: ${encodeURIComponent(
        formData.name
      )}%0AEmail: ${encodeURIComponent(
        formData.email
      )}%0A%0AMessage:%0A${encodeURIComponent(formData.message)}`;

      window.location.href = mailtoLink;

      toast.success("Thanks for reaching out. I'll get back to you soon.");
      setFormData({ name: '', email: '', message: '' });
    }
  };

  return (
    <section id='contact' className='py-24 bg-white'>
      <div className='container mx-auto px-6 md:px-12'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-16'>
          <div>
            <h2 className='text-4xl font-heading font-bold text-primary mb-6'>
              Let&apos;s Work Together
            </h2>
            <p className='text-xl text-muted-foreground mb-12'>
              Have a project in mind or want to discuss a potential partnership?
              I&apos;m currently open to new opportunities.
            </p>

            <div className='space-y-8'>
              <div className='flex items-start gap-4'>
                <div className='bg-secondary/10 p-3 rounded-lg text-secondary'>
                  <LuMail size={24} />
                </div>
                <div>
                  <h3 className='font-bold text-primary'>Email</h3>
                  <p className='text-muted-foreground'>azmiupb@gmail.com</p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='bg-secondary/10 p-3 rounded-lg text-secondary'>
                  <LuPhone size={24} />
                </div>
                <div>
                  <h3 className='font-bold text-primary'>Phone</h3>
                  <p className='text-muted-foreground'>+62 812-7005-2123</p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='bg-secondary/10 p-3 rounded-lg text-secondary'>
                  <LuMapPin size={24} />
                </div>
                <div>
                  <h3 className='font-bold text-primary'>Location</h3>
                  <p className='text-muted-foreground'>Batam, Indonesia</p>
                  <p className='text-sm text-muted-foreground/80 mt-1'>
                    Available for remote work
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white p-8 rounded-2xl border border-border shadow-sm'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>
                  Name
                </label>
                <input
                  type='text'
                  placeholder='Enter your name'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className='w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                />
                {errors.name && (
                  <p className='text-red-500 text-sm mt-1'>{errors.name}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>
                  Email
                </label>
                <input
                  type='email'
                  placeholder='Enter your email'
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className='w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                />
                {errors.email && (
                  <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>
                  Message
                </label>
                <textarea
                  placeholder='Enter your message..'
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className='w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px] resize-none'
                />
                {errors.message && (
                  <p className='text-red-500 text-sm mt-1'>{errors.message}</p>
                )}
              </div>

              <Button type='submit' className='w-full h-12'>
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
