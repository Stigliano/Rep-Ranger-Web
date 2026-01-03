import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

/**
 * Componente Card riutilizzabile
 */
export const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  actions,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 ${className}`}
    >
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

