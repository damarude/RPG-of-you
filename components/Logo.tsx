
import React from 'react';

export const Logo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <div className={`${className} relative flex items-center justify-center`}>
    {/* Outer container handles the rotation */}
    <div className="w-full h-full animate-spin-slow origin-center">
      {/* Inner image handles the breathing/pulsing */}
      <img 
        src="https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/lt%20logo.png" 
        alt="Logo" 
        className="w-full h-full object-contain animate-breathe drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"
      />
    </div>
  </div>
);
