import React from 'react';

interface MainverLogoProps {
  variant?: 'full' | 'horizontal' | 'icon';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  lightText?: boolean;
}

export const MainverIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 48,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Circular white disc matching authentic logo background */}
      <circle cx="120" cy="120" r="114" fill="#FFFFFF" />

      {/* Background circle arc (open at top & right) */}
      <path
        d="M 122 18 A 96 96 0 1 0 162 120"
        stroke="#0B192C"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M 162 82 A 96 96 0 0 1 162 120"
        stroke="#0B192C"
        strokeWidth="10"
        strokeLinecap="round"
      />

      {/* Main Port Gantry Crane Frame (Dark Navy) */}
      <g stroke="#0B192C" fill="#0B192C">
        {/* Left vertical legs / columns */}
        <path
          d="M 82 64 L 82 142 M 90 64 L 90 142 M 98 72 L 98 142"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Leg base pad / sill */}
        <path
          d="M 76 138 L 102 138"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Left column cross bracing */}
        <path
          d="M 82 86 L 98 102 M 82 118 L 98 134"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Diagonal support / A-frame leg */}
        <path
          d="M 98 72 L 150 102"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Horizontal Crane Boom / Girder */}
        <path
          d="M 80 62 L 154 100 L 154 116 L 80 78 Z"
          fill="currentColor"
        />
        <path
          d="M 78 58 L 156 97"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Diagonal stay / back tie */}
        <path
          d="M 148 104 L 148 122"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Top Mast / Tower Structure */}
        <path
          d="M 136 28 L 136 44 M 144 28 L 144 44"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 132 28 C 132 22 148 22 148 28"
          stroke="currentColor"
          strokeWidth="3.5"
          fill="none"
        />
        {/* Mast diagonals */}
        <path
          d="M 126 54 L 136 44 L 146 54"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* Red Crane Cabin / Machinery House */}
      <polygon
        points="138,44 156,52 156,98 138,90"
        fill="#DC2626"
      />
      <line
        x1="138"
        y1="44"
        x2="138"
        y2="90"
        stroke="#991B1B"
        strokeWidth="1.5"
      />

      {/* Container Hoist Cables & Spreader */}
      <g>
        {/* Trolley hook point */}
        <circle cx="116" cy="98" r="2.5" fill="#0B192C" />
        {/* Suspended wire cables */}
        <line x1="116" y1="100" x2="108" y2="114" stroke="#0B192C" strokeWidth="1.8" />
        <line x1="116" y1="100" x2="124" y2="114" stroke="#0B192C" strokeWidth="1.8" />
      </g>

      {/* Suspended ISO Shipping Container in 3D Perspective */}
      <g id="suspended-container">
        {/* Container Left Face (Steel Gray flank) */}
        <polygon
          points="106,116 120,112 120,136 106,140"
          fill="#64748B"
        />
        {/* Container Left Face corrugations */}
        <line x1="110" y1="115" x2="110" y2="139" stroke="#475569" strokeWidth="1" />
        <line x1="115" y1="113.5" x2="115" y2="137.5" stroke="#475569" strokeWidth="1" />

        {/* Container Right Face (White interior with Red border and Red X) */}
        <polygon
          points="120,112 136,114 136,138 120,136"
          fill="#FFFFFF"
          stroke="#DC2626"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Red X Cross Bracing */}
        <line
          x1="120"
          y1="112"
          x2="136"
          y2="138"
          stroke="#DC2626"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="136"
          y1="114"
          x2="120"
          y2="136"
          stroke="#DC2626"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export const MainverLogo: React.FC<MainverLogoProps> = ({
  variant = 'horizontal',
  className = '',
  size = 'md',
  showTagline = true,
  lightText = true,
}) => {
  const iconPixelSize = {
    sm: 36,
    md: 46,
    lg: 60,
    xl: 84,
  }[size];

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <MainverIcon size={iconPixelSize} />
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {/* Emblem */}
        <div className="relative mb-2">
          <MainverIcon size={iconPixelSize * 1.5} />
        </div>

        {/* Wordmark: MAIN + VER */}
        <div className="flex items-center tracking-wider font-extrabold text-2xl sm:text-3xl leading-none">
          <span className={lightText ? 'text-white' : 'text-slate-900'}>
            M<span className="inline-block scale-y-110 tracking-tighter">Λ</span>IN
          </span>
          <span className="text-red-600 font-black ml-0.5">VER</span>
        </div>

        {/* Slogan */}
        {showTagline && (
          <div className="mt-2 text-[10px] sm:text-xs font-semibold tracking-[0.25em] text-slate-300 uppercase flex items-center justify-center gap-1.5">
            <span>VENTA</span>
            <span className="text-red-600 font-bold">|</span>
            <span>RENTA</span>
            <span className="text-red-600 font-bold">|</span>
            <span>MANTENIMIENTO</span>
          </div>
        )}
      </div>
    );
  }

  // Horizontal variant (Ideal for Navbar & Footers)
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Icon Badge */}
      <div className="relative flex-shrink-0 flex items-center justify-center p-1 rounded-xl bg-slate-950/80 border border-slate-800 shadow-md shadow-red-950/20 group">
        <MainverIcon size={iconPixelSize} />
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline tracking-wider font-black text-xl sm:text-2xl leading-tight">
          <span className={lightText ? 'text-white' : 'text-slate-900'}>
            M<span className="inline-block font-sans scale-y-105 tracking-tighter">Λ</span>IN
          </span>
          <span className="text-red-600 font-black ml-0.5 drop-shadow-sm">VER</span>
          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-600/15 text-red-400 border border-red-500/30">
            CMMS
          </span>
        </div>

        {showTagline && (
          <div className="text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase flex items-center gap-1 mt-0.5">
            <span>VENTA</span>
            <span className="text-red-600 font-bold">|</span>
            <span>RENTA</span>
            <span className="text-red-600 font-bold">|</span>
            <span>MANTENIMIENTO</span>
          </div>
        )}
      </div>
    </div>
  );
};
