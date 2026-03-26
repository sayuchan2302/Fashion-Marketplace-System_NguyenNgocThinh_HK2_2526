import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
}

const Portal = ({ children }: PortalProps) => {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(children, document.body);
};

export default Portal;
