import React from 'react';

export type SelectOption = { value: string; label: string };

type Props = {
  value: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  className?: string;
};

export type CustomSelectHandle = {
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export const CustomSelect = React.forwardRef<CustomSelectHandle, Props>(({ 
  value,
  options,
  placeholder = 'Выберите значение',
  disabled,
  onChange,
  className,
}, ref) => {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const [openUp, setOpenUp] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  const selected = options.find((o) => o.value === value);

  const close = () => setOpen(false);
  const toggle = () => {
    if (disabled) return;
    setOpen((v) => !v);
  };
  const openSelect = () => {
    if (disabled) return;
    setOpen(true);

    const idx = Math.max(0, options.findIndex((o) => o.value === value));
    setActiveIndex(idx);
    triggerRef.current?.focus();
  };

  React.useImperativeHandle(ref, () => ({ open: openSelect, close, toggle }), [openSelect]);

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };

    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenUp(spaceBelow < 180 && spaceAbove > spaceBelow);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const max = options.length - 1;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i < max ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i > 0 ? i - 1 : max));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else if (activeIndex >= 0) {
        onChange(options[activeIndex].value);
        close();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  const handleSelect = (opt: SelectOption, idx: number) => {
    onChange(opt.value);
    setActiveIndex(idx);
    close();
  };

  return (
    <div
      ref={(node) => { rootRef.current = node; }}
      className={['custom-select', disabled ? 'is-disabled' : '', open ? 'is-open' : '', openUp ? 'open-up' : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className="custom-select-trigger"
        onClick={toggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        ref={triggerRef}
      >
        {selected ? selected.label : <span className="custom-select-placeholder">{placeholder}</span>}
      </button>
      {open && (
        <ul className="custom-select-menu" role="listbox">
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isActive = idx === activeIndex;
            return (
              <li
                key={opt.value || idx}
                role="option"
                aria-selected={isSelected}
                className={[
                  'custom-select-option',
                  isSelected ? 'is-selected' : '',
                  isActive ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(opt, idx)}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});
