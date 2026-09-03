
import React from 'react';

export function EmptyState({ title, description, icon, action }: { title: string, description?: string, icon?: React.ReactNode, action?: React.ReactNode }) {
  return (
    <div className="text-center py-12 px-4 sm:px-6 lg:px-8 border-2 border-dashed border-gray-300 rounded-lg">
      {icon && <div className="mx-auto h-12 w-12 text-gray-400">{icon}</div>}
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
