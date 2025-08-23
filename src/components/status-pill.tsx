import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusPillProps {
  status: 'todo' | 'in_progress' | 'done' | 'solved' | 'skipped';
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'done':
      case 'solved':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'skipped':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'done':
        return 'Done';
      case 'solved':
        return 'Solved';
      case 'skipped':
        return 'Skipped';
      default:
        return status;
    }
  };

  return (
    <Badge
      variant="secondary"
      className={cn(getStatusColor(status), 'text-xs font-medium', className)}
    >
      {getStatusText(status)}
    </Badge>
  );
}

