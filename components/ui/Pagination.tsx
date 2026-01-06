'use client';

import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
  { value: 200, label: '200' },
];

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const goToPrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-3'>
      <div className='flex items-center gap-3'>
        <span className='text-gray-500'>Show</span>
        <Select
          aria-label='Items per page'
          options={PAGE_SIZE_OPTIONS}
          value={PAGE_SIZE_OPTIONS.find((o) => o.value === pageSize)}
          onChange={(option) => option && onPageSizeChange(option.value)}
          isSearchable={false}
          menuPlacement='top'
          className='w-24'
          styles={{
            control: (base, state) => ({
              ...base,
              minHeight: '40px',
              height: '40px',
              borderRadius: '0.375rem',
              backgroundColor: 'white',
              borderColor: state.isFocused
                ? 'var(--color-blue-600)'
                : 'var(--color-gray-200)',
              boxShadow: state.isFocused
                ? '0 0 0 1px var(--color-blue-600)'
                : 'none',
            }),
          }}
        />
        <span className='text-gray-500'>of {totalItems} items</span>
      </div>
      <div className='flex items-center gap-2'>
        <Button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          size='icon-lg'
          className='bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
          aria-label='Previous page'
        >
          <MdChevronLeft size={24} />
        </Button>
        <span className='px-4 py-2 bg-white border border-gray-200 rounded-md'>
          {currentPage} / {totalPages || 1}
        </span>
        <Button
          onClick={goToNextPage}
          disabled={currentPage >= totalPages}
          size='icon-lg'
          className='bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
          aria-label='Next page'
        >
          <MdChevronRight size={24} />
        </Button>
      </div>
    </div>
  );
}
