import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className={cn("animate-spin rounded-full border-2 border-primary border-t-transparent", className)} />
  );
}