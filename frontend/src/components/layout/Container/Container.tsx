import './Container.css';

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Container = ({ children, maxWidth = 'lg', className = '' }: ContainerProps) => {
  return (
    <div className={`container container-${maxWidth} ${className}`}>
      {children}
    </div>
  );
};

