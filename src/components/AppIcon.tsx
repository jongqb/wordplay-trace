import React from 'react';

interface AppIconProps {
  size?: number | string;
  className?: string;
  showText?: boolean;
}

export const AppIcon: React.FC<AppIconProps> = ({
  size = 56,
  className = '',
  showText = true,
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none flex-shrink-0 ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
      aria-label="WordPlay Trace App Icon"
    >
      <svg
        viewBox="0 0 512 512"
        width="100%"
        height="100%"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* Sky Blue Background Gradient */}
          <linearGradient id="wpBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7CD0FD" />
            <stop offset="45%" stopColor="#4AA8F0" />
            <stop offset="100%" stopColor="#2A75C7" />
          </linearGradient>

          {/* Left Leg Gradient: Blue to Fresh Green */}
          <linearGradient id="wpLeftGrad" x1="0%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="25%" stopColor="#06B6D4" />
            <stop offset="65%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#84CC16" />
          </linearGradient>

          {/* Right Leg Gradient: Golden to Deep Coral Orange */}
          <linearGradient id="wpRightGrad" x1="0%" y1="0%" x2="30%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="50%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          {/* Crossbar Ribbon Gradient: Warm Yellow */}
          <linearGradient id="wpCrossbarGrad" x1="0%" y1="0%" x2="100%" y2="20%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Inner glow & highlights */}
          <filter id="wpDropShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#1E3A8A" floodOpacity="0.28" />
          </filter>

          <filter id="wpTubeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* Squircle Base Container with Smooth Rounded Corners */}
        <rect
          x="20"
          y="20"
          width="472"
          height="472"
          rx="116"
          ry="116"
          fill="url(#wpBgGrad)"
          filter="url(#wpDropShadow)"
        />

        {/* Subtle Top Gloss Curve */}
        <path
          d="M 50 140 Q 256 50 462 140 Q 256 80 50 140 Z"
          fill="#FFFFFF"
          opacity="0.14"
        />

        {/* Stylized Tracing 'A' Logo */}
        <g id="tracingA" filter="url(#wpTubeGlow)">
          {/* Left Leg (Green Tracing Path with Starting Node) */}
          <path
            d="M 188 340 C 182 300 216 195 256 126"
            fill="none"
            stroke="url(#wpLeftGrad)"
            strokeWidth="38"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Blue Start Dot */}
          <circle cx="188" cy="340" r="14" fill="#2563EB" stroke="#60A5FA" strokeWidth="3" />
          <circle cx="188" cy="340" r="5" fill="#BFDBFE" />

          {/* Right Leg (Orange Tracing Path with Arrow End) */}
          <path
            d="M 256 126 C 290 190 326 295 340 340"
            fill="none"
            stroke="url(#wpRightGrad)"
            strokeWidth="38"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Green Apex Dot */}
          <circle cx="256" cy="126" r="13" fill="#22C55E" stroke="#86EFAC" strokeWidth="3" />

          {/* Downward Arrow Guide at Tip */}
          <path
            d="M 326 318 L 340 344 L 354 318"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* Crossbar Ribbon (Curving Yellow Band) */}
          <path
            d="M 182 274 C 224 276 294 262 346 202"
            fill="none"
            stroke="url(#wpCrossbarGrad)"
            strokeWidth="32"
            strokeLinecap="round"
          />
          {/* Crossbar Left Start Point */}
          <circle cx="182" cy="274" r="10" fill="#F59E0B" stroke="#FEF08A" strokeWidth="3" />

          {/* Success Checkmark Badge on Crossbar */}
          <path
            d="M 324 218 L 334 228 L 350 206"
            fill="none"
            stroke="#D97706"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Playful Chinese Character "学" (Learn) */}
          <g id="chineseXue" transform="translate(228, 280) scale(0.68)">
            {/* Top Three Dots (Xue radical) */}
            <ellipse cx="20" cy="18" rx="4" ry="7" transform="rotate(-20 20 18)" fill="#06B6D4" />
            <ellipse cx="40" cy="14" rx="4" ry="7" fill="#F59E0B" />
            <ellipse cx="62" cy="18" rx="4" ry="7" transform="rotate(20 62 18)" fill="#FB923C" />
            {/* Crown Roof */}
            <path d="M 14 36 L 22 36 L 22 44" fill="none" stroke="#10B981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 22 36 Q 42 34 66 36 L 68 44" fill="none" stroke="#10B981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Child Radical "子" */}
            <path d="M 40 48 L 46 56 L 32 66 L 56 66" fill="none" stroke="#3B82F6" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 42 56 Q 44 76 34 84" fill="none" stroke="#F97316" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 20 72 L 64 70" fill="none" stroke="#38BDF8" strokeWidth="5.5" strokeLinecap="round" />
          </g>
        </g>

        {/* Official Brand Typography */}
        {showText && (
          <text
            x="256"
            y="424"
            textAnchor="middle"
            fontFamily="'Fredoka', 'Quicksand', 'Nunito', system-ui, sans-serif"
            fontSize="43"
            fontWeight="700"
            letterSpacing="0.5"
            fill="#FFFFFF"
            filter="drop-shadow(0 2px 4px rgba(15, 23, 42, 0.4))"
          >
            WordPlay Trace
          </text>
        )}
      </svg>
    </div>
  );
};
