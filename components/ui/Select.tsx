import { useId } from 'react';
import ReactSelect, { Props as SelectProps, GroupBase } from 'react-select';

export function Select<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: SelectProps<Option, IsMulti, Group>) {
  const instanceId = useId();

  return (
    <ReactSelect
      instanceId={instanceId}
      aria-label={props['aria-label'] || 'Select an option'}
      {...props}
      styles={{
        control: (base, state) => ({
          ...base,
          minHeight: '50px',
          height: '50px',
          borderRadius: '0.75rem',
          backgroundColor: 'white',
          borderColor: state.isFocused
            ? 'var(--color-blue-600)'
            : 'var(--color-gray-200)',
          boxShadow: state.isFocused
            ? '0 0 0 2px var(--color-blue-600)'
            : '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          '&:hover': {
            borderColor: 'var(--color-blue-600)',
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
          marginBottom: '8px',
          boxShadow:
            '0 0 15px -3px rgb(0 0 0 / 0.15), 0 0 6px -4px rgb(0 0 0 / 0.15)',
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
            ? 'var(--color-blue-600)'
            : state.isFocused
            ? 'var(--color-blue-50)'
            : 'transparent',
          color: state.isSelected
            ? 'white'
            : state.isFocused
            ? 'var(--color-blue-800)'
            : 'var(--color-gray-900)',
          ':active': {
            backgroundColor: 'var(--color-blue-600)',
            color: 'white',
          },
        }),
        ...props.styles,
      }}
      className={`text-gray-900 basic-single ${props.className || ''}`}
      classNamePrefix='select'
    />
  );
}

Select.displayName = 'Select';

// Re-export common types for convenience
export type { SingleValue, MultiValue, ActionMeta } from 'react-select';
