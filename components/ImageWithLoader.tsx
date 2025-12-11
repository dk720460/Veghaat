
import React, { useState } from 'react';

interface ImageWithLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  useSkeleton?: boolean;
}

const ImageWithLoader: React.FC<ImageWithLoaderProps> = ({ 
  src, 
  alt, 
  className, 
  containerClassName,
  useSkeleton = true,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${containerClassName || ''}`}>
      {/* Professional Shimmer Placeholder */}
      {!isLoaded && !error && useSkeleton && (
        <div className="absolute inset-0 bg-gray-100 animate-shimmer z-10" />
      )}
      
      <img
        src={error ? 'https://cdn-icons-png.flaticon.com/512/1147/1147805.png' : src}
        alt={alt}
        className={`transition-all duration-500 ease-out ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } ${className}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => { setIsLoaded(true); setError(true); }}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  );
};

export default ImageWithLoader;
