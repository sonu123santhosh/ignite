import React from 'react';

export default function Card({
  children,
  className = '',
  hoverLift = true,
  onClick,
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      onClick={onClick}
      className={`bg-[#172033] border border-[#2a3652] rounded-[18px] p-6 sm:p-7 transition-all duration-200 ${
        hoverLift
          ? 'hover:-translate-y-[3px] hover:border-[#c6ff3d] hover:shadow-[0_12px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(198,255,61,0.12)]'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
