
import React from 'react';
import { BarChart3Icon, ChevronRightIcon, ClipboardListIcon, SearchIcon, UploadIcon } from 'lucide-react';

type QuickAction = {
  id: 'import' | 'review' | 'search' | 'report';
  title: string;
  description: string;
  icon: typeof UploadIcon;
  iconClassName: string;
};

type QuickActionsPanelProps = {
  onAction: (action: QuickAction['id']) => void;
};

const quickActions: QuickAction[] = [
{ id: 'import', title: 'Import Student Data', description: 'Upload CSV / Excel batch file', icon: UploadIcon, iconClassName: 'bg-maroon/10 text-maroon' },
{ id: 'review', title: 'Review Registrations', description: '341 pending approval', icon: ClipboardListIcon, iconClassName: 'bg-gold/20 text-amber-700' },
{ id: 'search', title: 'Student Search', description: 'Lookup by name, ID, or NIC', icon: SearchIcon, iconClassName: 'bg-slate-100 text-slate-700' },
{ id: 'report', title: 'Generate Report', description: 'Export summary to PDF / Excel', icon: BarChart3Icon, iconClassName: 'bg-emerald-50 text-emerald-600' }];


export function QuickActionsPanel({ onAction }: QuickActionsPanelProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="font-bold text-slate-900">Quick Actions</h2>
      <p className="mt-1 text-xs text-slate-500">Common tasks at a glance</p>
      <div className="mt-5 space-y-2">
        {quickActions.map(({ id, title, description, icon: Icon, iconClassName }) =>
        <button
          key={id}
          type="button"
          onClick={() => onAction(id)}
          className="group flex w-full items-center gap-3 rounded-md border border-stone-200 px-3 py-3 text-left transition hover:border-maroon/40 hover:bg-maroon/[0.02] focus:outline-none focus:ring-2 focus:ring-maroon/20">
          
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded ${iconClassName}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-slate-900">{title}</span>
              <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
            </span>
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-maroon" aria-hidden="true" />
          </button>
        )}
      </div>
    </section>);

}