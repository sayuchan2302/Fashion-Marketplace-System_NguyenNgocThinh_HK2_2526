import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
}

const Drawer = ({ open, onClose, children, className = '', overlayClassName = '' }: DrawerProps) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <>
      <div className={`drawer-overlay ${overlayClassName}`.trim()} onClick={onClose} />
      <div className={`drawer ${className}`.trim()}>{children}</div>
    </>,
    document.body,
  );
};

export default Drawer;
