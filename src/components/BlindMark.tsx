import React from 'react';

interface BlindMarkProps {
  className?: string;
  glow?: boolean;
  animated?: boolean;
}

/**
 * Precision vector emblem faithful to the official BlinD perimeter security mark:
 * outer radar ring, horizontal scan horizon, concentric iris with highlight pupil,
 * and top-right telemetry node emitting dual directional waves.
 */
export const BlindMark: React.FC<BlindMarkProps> = ({
  className = 'w-10 h-10',
  glow = false,
  animated = false,
}) => {
  const filterId = glow ? 'blind-mark-glow' : undefined;

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="blind-ice-grad" x1="20" y1="15" x2="96" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="52%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
        {glow && (
          <filter id="blind-mark-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      <g filter={filterId ? `url(#${filterId})` : undefined}>
        {/* Outer perimeter ring (top arc broken by horizontal scan bar and top-right node) */}
        <path
          d="M 22 61 A 36 36 0 0 1 80.5 34.5"
          stroke={glow ? 'url(#blind-ice-grad)' : 'currentColor'}
          strokeWidth="5.2"
          strokeLinecap="round"
        />
        <path
          d="M 88.5 43.2 A 36 36 0 0 1 94 61"
          stroke={glow ? 'url(#blind-ice-grad)' : 'currentColor'}
          strokeWidth="5.2"
          strokeLinecap="round"
        />
        <path
          d="M 93.8 73.5 A 36 36 0 0 1 22.2 73.5"
          stroke={glow ? 'url(#blind-ice-grad)' : 'currentColor'}
          strokeWidth="5.2"
          strokeLinecap="round"
        />

        {/* Inner concentric ring */}
        <path
          d="M 36.5 61 A 21.5 21.5 0 0 1 79.5 61"
          stroke={glow ? 'url(#blind-ice-grad)' : '#28A9E0'}
          strokeWidth="4.6"
          strokeLinecap="round"
        />
        <path
          d="M 79.2 73 A 21.5 21.5 0 0 1 36.8 73"
          stroke={glow ? 'url(#blind-ice-grad)' : '#28A9E0'}
          strokeWidth="4.6"
          strokeLinecap="round"
        />

        {/* Horizontal perimeter scan line */}
        <line
          x1="10"
          y1="67"
          x2="106"
          y2="67"
          stroke={glow ? 'url(#blind-ice-grad)' : '#28A9E0'}
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Eye core with upper-left specular crescent */}
        <path
          d="M 58 53.5 A 13.5 13.5 0 1 1 46.2 60.4 A 6.2 6.2 0 0 0 55.2 53.8 A 13.5 13.5 0 0 1 58 53.5 Z"
          fill={glow ? 'url(#blind-ice-grad)' : '#28A9E0'}
        />

        {/* Top-right radar emitter node */}
        <circle
          cx="85"
          cy="39"
          r="5.5"
          stroke={glow ? 'url(#blind-ice-grad)' : 'currentColor'}
          strokeWidth="4.2"
          fill="#070B10"
        />

        {/* Dual signal arcs */}
        <path
          d="M 83 22 A 18 18 0 0 1 101.5 40.5"
          stroke={glow ? '#67E8F9' : '#28A9E0'}
          strokeWidth="4.5"
          strokeLinecap="round"
          className={animated ? 'animate-signal-1' : undefined}
        />
        <path
          d="M 85 11.5 A 28.5 28.5 0 0 1 112 39"
          stroke={glow ? '#38BDF8' : '#28A9E0'}
          strokeWidth="4.5"
          strokeLinecap="round"
          className={animated ? 'animate-signal-2' : undefined}
        />
      </g>
    </svg>
  );
};
