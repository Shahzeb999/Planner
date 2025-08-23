import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DifficultyPillProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  className?: string;
}

export function DifficultyPill({ difficulty, className }: DifficultyPillProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Hard':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Badge
      variant="secondary"
      className={cn(getDifficultyColor(difficulty), 'text-xs font-medium', className)}
    >
      {difficulty}
    </Badge>
  );
}

