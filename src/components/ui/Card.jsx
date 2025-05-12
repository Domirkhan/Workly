import { clsx } from 'clsx';

export function Card({ children, className, variant = 'default' }) {
  const variantClasses = {
    default: 'card p-6',
    glass: 'glass-card p-6',
    outlined: 'rounded-lg border border-slate-200 p-6',
  };

  return (
    <div className={clsx(variantClasses[variant], className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={clsx('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return <h3 className={clsx('text-xl font-semibold', className)}>{children}</h3>;
}

export function CardDescription({ children, className }) {
  return <p className={clsx('text-sm text-slate-500', className)}>{children}</p>;
}

export function CardContent({ children, className }) {
  return <div className={clsx('', className)}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return <div className={clsx('mt-4', className)}>{children}</div>;
}