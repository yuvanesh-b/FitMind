import React from 'react';

export const BodybuilderIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Bodybuilder Flexed Bicep & Dumbbell Icon */}
    <path d="m6.5 6.5 11 11" />
    <path d="m21 21-1-1" />
    <path d="m3 3 1 1" />
    <path d="m18 22 4-4" />
    <path d="m2 6 4-4" />
    <path d="m3 10 7-7" />
    <path d="m14 21 7-7" />
  </svg>
);

export const FlexingMuscleIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.48 4.02C10.74 3.73 9.07 4.54 8.27 6.07L6.96 8.57C6.67 9.12 6.09 9.46 5.47 9.46H4.25C2.87 9.46 1.75 10.58 1.75 11.96C1.75 13.34 2.87 14.46 4.25 14.46H5.47C6.09 14.46 6.67 14.8 6.96 15.35L8.27 17.85C9.07 19.38 10.74 20.19 12.48 19.9L16.2 19.28C18.66 18.87 20.5 16.73 20.5 14.23V9.69C20.5 7.19 18.66 5.05 16.2 4.64L12.48 4.02Z" />
  </svg>
);
