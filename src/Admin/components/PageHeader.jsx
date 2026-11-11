export default function PageHeader({ title, description, actions, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {(actions || children) && (
        <div className="flex items-center gap-2.5 shrink-0">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
}
