import { Suspense } from 'react';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

interface RouteLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  spinnerSize?: 'sm' | 'md' | 'lg';
  text?: string;
}

const RouteLoader = ({ 
  children, 
  fallback,
  spinnerSize = 'lg',
  text = 'Đang tải...' 
}: RouteLoaderProps) => {
  return (
    <Suspense fallback={fallback || <LoadingSpinner size={spinnerSize} fullScreen text={text} />}>
      {children}
    </Suspense>
  );
};

export default RouteLoader;
