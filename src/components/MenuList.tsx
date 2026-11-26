"use client";

import { useCallback, useEffect, useRef } from "react";

export interface MenuItem {
  id: string;
  label: string;
  onSelect: () => void;
  detail?: string;
  disabled?: boolean;
}

interface MenuListProps {
  items: MenuItem[];
  ariaLabel: string;
  className?: string;
}

/**
 * Vertical tactical menu: arrow keys move focus, Enter/Space activate.
 * Focus is real DOM focus, so screen readers and touch both work.
 */
export default function MenuList({ items, ariaLabel, className }: MenuListProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusAt = useCallback((index: number) => {
    const next = ((index % items.length) + items.length) % items.length;
    refs.current[next]?.focus();
  }, [items.length]);

  useEffect(() => {
    refs.current.length = items.length;
  }, [items.length]);

  return (
    <nav className={className} aria-label={ariaLabel}>
      {items.map((item, index) => (
        <button
          key={item.id}
          id={item.id}
          type="button"
          ref={(node) => {
            refs.current[index] = node;
          }}
          className="menu-button"
          disabled={item.disabled}
          onClick={item.onSelect}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowRight") {
              event.preventDefault();
              focusAt(index + 1);
            } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
              event.preventDefault();
              focusAt(index - 1);
            } else if (event.key === "Home") {
              event.preventDefault();
              focusAt(0);
            } else if (event.key === "End") {
              event.preventDefault();
              focusAt(items.length - 1);
            }
          }}
        >
          <span className="menu-button-label">{item.label}</span>
          {item.detail ? (
            <span className="menu-button-detail">{item.detail}</span>
          ) : null}
        </button>
      ))}
    </nav>
  );
}
