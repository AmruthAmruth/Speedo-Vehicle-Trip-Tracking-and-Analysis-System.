import React from 'react';

/**
 * Full-screen loading spinner used during route transitions,
 * auth state checks, and React.lazy Suspense boundaries.
 */
const LoadingScreen: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-black animate-spin"
          role="status"
          aria-label="Loading"
        />
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
