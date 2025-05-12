import { Clock } from 'lucide-react';

export default function Logo({ size = 'md', variant = 'dark' }) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };
  
  const colorClasses = {
    light: 'text-white',
    dark: 'text-blue-800',
  };
  
  return (
    <div className={`flex items-center font-bold ${sizeClasses[size]} ${colorClasses[variant]}`}>
      <Clock className="mr-2" />
      <span>Workly</span>
    </div>
  );
}