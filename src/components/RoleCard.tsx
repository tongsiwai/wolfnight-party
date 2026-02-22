import { motion } from 'framer-motion';
import { Role, Team } from '@/data/roles';
import { cn } from '@/lib/utils';

interface RoleCardProps {
  role: Role;
  count?: number;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

const teamStyles: Record<Team, string> = {
  wolf: 'card-tarot-wolf',
  villager: 'card-tarot-villager',
  neutral: 'card-tarot-neutral',
};

const teamBadge: Record<Team, string> = {
  wolf: 'bg-wolf text-destructive-foreground',
  villager: 'bg-villager text-accent-foreground',
  neutral: 'bg-neutral text-accent-foreground',
};

const teamGlow: Record<Team, string> = {
  wolf: 'glow-wolf',
  villager: 'glow-villager',
  neutral: 'glow-neutral',
};

export function RoleCard({ role, count = 0, selected, onClick, size = 'md', showDescription = true }: RoleCardProps) {
  const isLarge = size === 'lg';
  const isSm = size === 'sm';

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        'card-tarot cursor-pointer transition-all duration-300 relative',
        teamStyles[role.team],
        selected && teamGlow[role.team],
        selected && 'ring-1 ring-primary/50',
        isSm ? 'p-2' : isLarge ? 'p-6' : 'p-3',
      )}
    >
      {/* Count badge */}
      {count > 0 && (
        <div className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg">
          {count}
        </div>
      )}

      {/* Shimmer overlay when selected */}
      {selected && <div className="absolute inset-0 shimmer rounded-xl pointer-events-none" />}

      <div className="flex flex-col items-center text-center gap-1">
        <span className={cn('block', isLarge ? 'text-5xl' : isSm ? 'text-2xl' : 'text-3xl')}>
          {role.emoji}
        </span>

        <div>
          <h3 className={cn(
            'font-display font-bold leading-tight',
            isLarge ? 'text-xl' : isSm ? 'text-xs' : 'text-sm'
          )}>
            {role.nameCn}
          </h3>
          <p className={cn(
            'text-muted-foreground',
            isLarge ? 'text-sm' : 'text-[10px]'
          )}>
            {role.name}
          </p>
        </div>

        <span className={cn(
          'inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
          teamBadge[role.team]
        )}>
          {role.team === 'wolf' ? '🐺 狼人' : role.team === 'villager' ? '👥 好人' : '🎭 第三方'}
        </span>

        {showDescription && !isSm && (
          <p className={cn(
            'text-muted-foreground leading-snug mt-1',
            isLarge ? 'text-sm' : 'text-[10px]'
          )}>
            {role.descriptionCn}
          </p>
        )}
      </div>
    </motion.div>
  );
}
