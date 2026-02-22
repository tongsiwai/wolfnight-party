import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Lock, Skull, Moon, Sun, Loader2 } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';

export default function PlayerView() {
  const { state, myPlayerId, isHost } = useGame();
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);
  const { play } = useSound();

  // Redirect host to correct host screen
  useEffect(() => {
    if (isHost) {
      if (state.phase === 'night') navigate('/night');
      else if (state.phase === 'day') navigate('/day');
      else if (state.phase === 'lobby') navigate('/');
    }
  }, [isHost, state.phase, navigate]);

  // Player: game reset — go back to lobby
  useEffect(() => {
    if (!isHost && state.phase === 'lobby') {
      navigate('/');
    }
  }, [isHost, state.phase, navigate]);

  // Player: game ended
  useEffect(() => {
    if (state.phase === 'victory') {
      navigate('/victory');
    }
  }, [state.phase, navigate]);

  const me = state.players.find(p => p.id === myPlayerId);

  // ── Still waiting to be accepted by host ─────────────────────────────
  if (!me) {
    return (
      <div className="min-h-screen bg-night-gradient bg-moonlit flex flex-col items-center justify-center px-4 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <h2 className="text-xl font-display font-bold text-foreground">正在連線...</h2>
        <p className="text-muted-foreground text-sm">等待主持人接受你的加入請求</p>
      </div>
    );
  }

  // ── Accepted but host still selecting roles ───────────────────────────
  if (!me.role || state.phase === 'role-selection') {
    return (
      <div className="min-h-screen bg-night-gradient bg-moonlit flex flex-col items-center justify-center px-4 text-center space-y-6">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="text-6xl"
        >
          🎴
        </motion.div>
        <div>
          <h2 className="text-2xl font-display font-bold text-primary mb-2">
            你已加入！
          </h2>
          <p className="text-muted-foreground text-sm">主持人正在分配角色中...<br />請稍候片刻</p>
        </div>
        <div className="px-4 py-2 rounded-full bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">
            房間 <span className="font-mono font-bold text-primary">{state.players.length}</span> 位玩家已就緒
          </p>
        </div>
      </div>
    );
  }

  const handleReveal = () => {
    play('card-flip');
    setRevealed(true);
  };

  const role = me.role;
  const teamColor = role?.team === 'wolf' ? 'text-wolf' : role?.team === 'villager' ? 'text-villager' : 'text-neutral';
  const teamGlow = role?.team === 'wolf' ? 'glow-wolf' : role?.team === 'villager' ? 'glow-villager' : 'glow-neutral';

  return (
    <div className="min-h-screen bg-night-gradient bg-moonlit flex flex-col items-center justify-center px-4">
      {/* Top Status Bar */}
      <div className="absolute top-6 left-4 right-4 flex justify-between items-center text-sm font-display">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{me.name}</span>
          {!me.alive && <span className="text-destructive font-bold">(已淘汰)</span>}
        </div>
        <div className="flex items-center gap-2 text-primary">
          {state.phase === 'night' ? (
            <><Moon className="w-4 h-4" /> 第 {state.round} 夜</>
          ) : (
            <><Sun className="w-4 h-4 text-yellow-500" /> 第 {state.round} 天</>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`reveal-${revealed}`}
          initial={{ opacity: 0, rotateY: revealed ? 180 : 0 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-center w-full max-w-sm"
        >
          {!revealed ? (
            <div className="space-y-6">
              {me.alive ? (
                <>
                  <div className="text-6xl animate-float">🃏</div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-primary mb-2">你的身份已分配</h2>
                    <p className="text-muted-foreground text-sm">請確保周圍沒有其他人看到螢幕</p>
                  </div>
                  <Button onClick={handleReveal} className="w-full h-14 text-lg font-display gap-2" size="lg">
                    <Eye className="w-5 h-5" /> 查看我的角色
                  </Button>
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-4">
                    <Lock className="w-3 h-3" /> 注意保密
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl">💀</div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-destructive mb-2">你已被淘汰</h2>
                    <p className="text-muted-foreground text-sm">請保持安靜，不要影響遊戲進行</p>
                  </div>
                  <Button onClick={handleReveal} variant="outline" className="w-full h-14 text-lg font-display gap-2 mt-6" size="lg">
                    <Eye className="w-5 h-5" /> 回顾我的角色
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={`card-tarot p-8 relative overflow-hidden ${!me.alive ? 'opacity-70 grayscale-[0.5]' : teamGlow}`}
              >
                {!me.alive && (
                  <div className="absolute inset-0 bg-red-950/20 z-10 flex items-center justify-center pointer-events-none">
                    <Skull className="w-32 h-32 text-destructive/20 rotate-12" />
                  </div>
                )}
                <span className="text-6xl block mb-4 relative z-20">{role?.emoji}</span>
                <h2 className={`text-3xl font-display font-bold relative z-20 ${teamColor}`}>
                  {role?.nameCn}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 relative z-20">{role?.name}</p>
                <div className="mt-4 pt-4 border-t border-border relative z-20">
                  <p className="text-sm text-foreground/80">{role?.descriptionCn}</p>
                </div>
                {me.alive && (
                  <div className="mt-3 p-3 rounded-lg bg-secondary/40 relative z-20">
                    <p className="text-xs text-muted-foreground">💡 {role?.tip}</p>
                  </div>
                )}
              </motion.div>
              <Button onClick={() => setRevealed(false)} className="w-full h-14 text-lg font-display gap-2" size="lg">
                <EyeOff className="w-5 h-5" /> 隱藏角色
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom instructions */}
      <div className="absolute bottom-8 left-4 right-4 text-center">
        {state.phase === 'night' ? (
          <p className="text-sm text-primary animate-pulse">🌙 天黑請閉眼，請聽從主持指示</p>
        ) : (
          <p className="text-sm text-yellow-500">☀️ 天亮了，請參與討論及投票</p>
        )}
      </div>
    </div>
  );
}
