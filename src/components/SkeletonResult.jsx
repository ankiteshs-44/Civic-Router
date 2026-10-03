import React from 'react';

export default function SkeletonResult() {
  return (
    <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Routing complaint and generating letter">
      {/* Category Card Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-7 w-44 rounded bg-slate-300 dark:bg-slate-600" />
          </div>
          <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-32 rounded bg-slate-300 dark:bg-slate-600" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-40 rounded bg-slate-300 dark:bg-slate-600" />
          </div>
        </div>
      </div>

      {/* Authority Card Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-2 h-6 w-64 rounded bg-slate-300 dark:bg-slate-600" />
        <div className="mt-2 h-4 w-48 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="h-11 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="h-11 rounded-xl bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      {/* Letter Card Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="h-5 w-40 rounded bg-slate-300 dark:bg-slate-600" />
          <div className="h-8 w-24 rounded-lg bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="mt-4 space-y-3 rounded-2xl bg-slate-100 p-5 dark:bg-slate-800/60">
          <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}
