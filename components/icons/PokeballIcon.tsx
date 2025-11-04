
import React from 'react';

interface PokeballIconProps {
  className?: string;
  size?: number;
}

const PokeballIcon: React.FC<PokeballIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 0-10 10h20A10 10 0 0 0 12 2z" fill="currentColor" className="text-poke-red" />
      <path d="M2 12h20" />
      <circle cx="12" cy="12" r="4" fill="white" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
};

export default PokeballIcon;
