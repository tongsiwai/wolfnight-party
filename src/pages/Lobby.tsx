import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Users, ArrowRight, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Lobby() {
  const { state, dispatch } = useGame();
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const addPlayer = () => {
    if (name.trim() && state.players.length < 18) {
      dispatch({ type: 'ADD_PLAYER', name: name.trim() });
      setName('');
    }
  };

  const canProceed = state.players.length >= 6;

  return (
    <div className="min-h-screen bg-night-gradient bg-moonlit flex flex-col">
      {/* Header */}
      <header className="pt-12 pb-6 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-5xl mb-3 animate-float">🐺</div>
          <h1 className="text-4xl font-display font-bold text-primary tracking-wider">
            WolfNight
          </h1>
          <p className="text-lg text-muted-foreground font-display mt-1">狼人殺</p>
        </motion.div>
      </header>

      {/* Player Entry */}
      <div className="flex-1 px-4 pb-6 max-w-lg mx-auto w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Player count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-sm font-body">{state.players.length}/18 位玩家</span>
            </div>
            {!canProceed && (
              <span className="text-xs text-muted-foreground">至少需要 6 位玩家</span>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="輸入玩家名稱..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPlayer()}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              maxLength={12}
            />
            <Button
              onClick={addPlayer}
              disabled={!name.trim() || state.players.length >= 18}
              size="icon"
              className="shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Player list */}
          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
            <AnimatePresence>
              {state.players.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between bg-secondary/60 rounded-lg px-4 py-3 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-display w-5 text-center">
                      {i + 1}
                    </span>
                    <span className="text-foreground font-medium">{player.name}</span>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_PLAYER', id: player.id })}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {state.players.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Moon className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">新增玩家以開始遊戲</p>
              <p className="text-xs mt-1">Add players to start</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom action */}
      <div className="px-4 pb-8 max-w-lg mx-auto w-full">
        <Button
          onClick={() => {
            dispatch({ type: 'SET_PHASE', phase: 'role-selection' });
            navigate('/roles');
          }}
          disabled={!canProceed}
          className="w-full h-14 text-lg font-display gap-2 glow-gold"
          size="lg"
        >
          選擇角色 <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
