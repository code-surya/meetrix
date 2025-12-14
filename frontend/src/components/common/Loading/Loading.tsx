import './Loading.css';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export const Loading = ({ size = 'medium', fullScreen = false }: LoadingProps) => {
  const sizeClass = `loading-${size}`;
  const containerClass = fullScreen ? 'loading-fullscreen' : 'loading-container';

  return (
    <div className={containerClass}>
      <div className={`loading-spinner ${sizeClass}`}></div>
    </div>
  );
};

