import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Home, Skull, Crown } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';

export default function Victory() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const { play } = useSound();

  useEffect(() => {
    play('victory');
  }, []);

  const winLabel = state.winner === 'wolf' ? '🐺 狼人陣營獲勝！' : state.winner === 'villager' ? '👥 好人陣營獲勝！' : '🎭 第三方獲勝！';
  const winColor = state.winner === 'wolf' ? 'text-wolf' : state.winner === 'villager' ? 'text-villager' : 'text-neutral';

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_GAME' });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-night-gradient bg-moonlit flex flex-col items-center justify-center px-4">
      {/* Confetti-like particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/40"
            initial={{
              x: Math.random() * 400 - 200 + window.innerWidth / 2,
              y: -20,
              opacity: 1,
            }}
            animate={{
              y: window.innerHeight + 20,
              opacity: 0,
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: i % 3 === 0 ? 'hsl(45, 90%, 55%)' : i % 3 === 1 ? 'hsl(0, 70%, 50%)' : 'hsl(210, 70%, 55%)',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="text-center z-10 w-full max-w-sm space-y-6"
      >
        <Trophy className="w-16 h-16 mx-auto text-primary animate-float" />

        <h1 className={`text-3xl font-display font-bold ${winColor}`}>
          {winLabel}
        </h1>

        {/* All players with roles */}
        <div className="space-y-2 mt-6">
          <h3 className="text-sm text-muted-foreground font-display mb-3">所有玩家角色</h3>
          {state.players.map(p => (
            <div
              key={p.id}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                p.alive
                  ? 'border-border bg-secondary/40'
                  : 'border-border/30 bg-secondary/10 opacity-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {!p.alive && <Skull className="w-3 h-3 text-destructive" />}
                <span className={`text-sm ${p.alive ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                  {p.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{p.role?.emoji}</span>
                <span className={`text-xs font-medium ${
                  p.role?.team === 'wolf' ? 'text-wolf' : p.role?.team === 'villager' ? 'text-villager' : 'text-neutral'
                }`}>
                  {p.role?.nameCn}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-4">
          <Button onClick={handlePlayAgain} className="w-full h-14 text-lg font-display gap-2 glow-gold" size="lg">
            <RotateCcw className="w-5 h-5" /> 再玩一局
          </Button>
          <Button onClick={() => { dispatch({ type: 'RESET_GAME' }); navigate('/'); }} variant="ghost" className="w-full text-muted-foreground font-display gap-2">
            <Home className="w-4 h-4" /> 返回大廳
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
