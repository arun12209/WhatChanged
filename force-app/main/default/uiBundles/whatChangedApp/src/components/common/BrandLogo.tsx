import React from 'react';
import logoImg from '../../assets/logo.png';

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'badge' | 'plain' | 'glass';
  className?: string;
  alt?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  alt = 'WhatChanged Logo',
}) => {
  const sizeMap: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', string> = {
    xs: 'w-6 h-6',
    sm: 'w-9 h-9',
    md: 'w-[52px] h-[52px]',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  };

  const imgSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`inline-flex items-center justify-center flex-shrink-0 transition-transform duration-200 hover:scale-105 ${className}`}
    >
      <img
        src={logoImg}
        alt={alt}
        className={`${imgSize} object-contain select-none drop-shadow-sm`}
        draggable={false}
      />
    </div>
  );
};
