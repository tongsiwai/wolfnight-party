import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, ArrowRight, Lock } from 'lucide-react';

export default function RoleAssignment() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const isLastPlayer = state.currentPlayerIndex >= state.players.length - 1;

  if (!currentPlayer) {
    return null;
  }

  const handleReveal = () => setRevealed(true);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      if (isLastPlayer) {
        dispatch({ type: 'SET_PHASE', phase: 'night' });
        navigate('/night');
      } else {
        dispatch({ type: 'NEXT_PLAYER' });
        setRevealed(false);
        setConfirmed(false);
      }
    }, 300);
  };

  const role = currentPlayer.role;
  const teamColor = role?.team === 'wolf' ? 'text-wolf' : role?.team === 'villager' ? 'text-villager' : 'text-neutral';
  const teamGlow = role?.team === 'wolf' ? 'glow-wolf' : role?.team === 'villager' ? 'glow-villager' : 'glow-neutral';

  return (
    <div className="min-h-screen bg-night-gradient bg-moonlit flex flex-col items-center justify-center px-4">
      {/* Progress */}
      <div className="absolute top-6 left-4 right-4 max-w-lg mx-auto">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>玩家 {state.currentPlayerIndex + 1}/{state.players.length}</span>
          <span>角色分配中</span>
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((state.currentPlayerIndex + 1) / state.players.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentPlayer.id}-${revealed}`}
          initial={{ opacity: 0, rotateY: revealed ? 180 : 0 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-center w-full max-w-sm"
        >
          {!revealed ? (
            /* Card back - pass to player */
            <div className="space-y-6">
              <div className="text-6xl animate-float">🃏</div>
              <div>
                <p className="text-muted-foreground text-sm mb-2">請將手機傳給</p>
                <h2 className="text-3xl font-display font-bold text-primary">{currentPlayer.name}</h2>
              </div>
              <Button
                onClick={handleReveal}
                className="w-full h-14 text-lg font-display gap-2"
                size="lg"
              >
                <Eye className="w-5 h-5" /> 查看我的角色
              </Button>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> 只有你能看到
              </p>
            </div>
          ) : (
            /* Card front - role reveal */
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={`card-tarot p-8 ${teamGlow}`}
              >
                <span className="text-6xl block mb-4">{role?.emoji}</span>
                <h2 className={`text-3xl font-display font-bold ${teamColor}`}>
                  {role?.nameCn}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">{role?.name}</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-foreground/80">{role?.descriptionCn}</p>
                </div>
                <div className="mt-3 p-3 rounded-lg bg-secondary/40">
                  <p className="text-xs text-muted-foreground">💡 {role?.tip}</p>
                </div>
              </motion.div>

              <Button
                onClick={handleConfirm}
                className="w-full h-14 text-lg font-display gap-2"
                size="lg"
              >
                <EyeOff className="w-5 h-5" /> 我知道了
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
