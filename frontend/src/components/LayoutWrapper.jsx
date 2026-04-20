import React from 'react';

export default function LayoutWrapper({ children }) {
  return (
    <div
      style={{ paddingLeft: 'var(--sidebar-width)' }}
      className="min-h-screen w-full box-border"
    >
      {children}
    </div>
  );
}
