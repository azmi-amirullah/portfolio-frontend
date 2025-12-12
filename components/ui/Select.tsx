import React from 'react';
import ReactSelect, { Props as SelectProps, GroupBase } from 'react-select';

export function Select<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: SelectProps<Option, IsMulti, Group>) {
  return (
    <ReactSelect
      {...props}
      styles={{
        control: (base, state) => ({
          ...base,
          minHeight: '50px',
          height: '50px',
          borderRadius: '0.75rem',
          backgroundColor: 'white',
          borderColor: state.isFocused ? 'transparent' : '#e5e7eb',
          boxShadow: state.isFocused
            ? '0 0 0 2px #3b82f6'
            : '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          '&:hover': {
            borderColor: state.isFocused ? 'transparent' : '#d1d5db',
          },
          ...props.styles?.control?.(base, state),
        }),
        valueContainer: (base, state) => ({
          ...base,
          padding: '4px 8px',
          ...props.styles?.valueContainer?.(base, state),
        }),
        menu: (base) => ({
          ...base,
          borderRadius: '0.75rem',
          marginTop: '8px',
          boxShadow:
            '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          overflow: 'hidden',
          zIndex: 50,
        }),
        menuList: (base) => ({
          ...base,
          padding: '4px',
        }),
        option: (base, state) => ({
          ...base,
          padding: '10px 12px',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          backgroundColor: state.isSelected
            ? '#2563eb'
            : state.isFocused
            ? '#f9fafb'
            : 'transparent',
          color: state.isSelected ? 'white' : '#111827',
          ':active': {
            backgroundColor: state.isSelected ? '#2563eb' : '#f3f4f6',
          },
        }),
        ...props.styles,
      }}
      className={`text-gray-900 basic-single ${props.className || ''}`}
      classNamePrefix='select'
    />
  );
}

// Re-export common types for convenience
export type { SingleValue, MultiValue, ActionMeta } from 'react-select';
