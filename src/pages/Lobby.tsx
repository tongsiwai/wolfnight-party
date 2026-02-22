import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Users, ArrowRight, Moon, Copy, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Lobby() {
  const { state, dispatch, isHost, roomCode, createRoom, joinRoom, myPlayerId } = useGame();
  const [name, setName] = useState('');
  const [inputCode, setInputCode] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    createRoom();
  };

  const handleJoinRoom = () => {
    if (name.trim() && inputCode.trim()) {
      joinRoom(inputCode.trim(), name.trim());
    } else {
      toast.error('請輸入名稱及房間代碼');
    }
  };

  const copyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      toast('房間代碼已複製');
    }
  };

  // If game already started, redirect
  useEffect(() => {
    if (state.phase !== 'lobby') {
      if (isHost) {
        navigate('/roles');
      } else if (state.phase === 'night' || state.phase === 'day' || state.phase === 'victory') {
        navigate('/player');
      }
    }
  }, [state.phase, isHost, navigate]);

  // View 1: Not in a room yet (Home Screen)
  if (!roomCode) {
    return (
      <div className="min-h-screen bg-night-gradient bg-moonlit flex flex-col justify-center px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="text-6xl mb-4 animate-float">🐺</div>
          <h1 className="text-5xl font-display font-bold text-primary tracking-wider mb-2">WolfNight</h1>
          <p className="text-muted-foreground font-display">狼人殺</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="max-w-xs mx-auto w-full space-y-6">
          <div className="space-y-3 p-6 rounded-2xl bg-secondary/50 border border-border">
            <h2 className="text-lg font-display text-center text-foreground mb-4">加入遊戲</h2>
            <Input placeholder="你的名稱..." value={name} onChange={e => setName(e.target.value)} maxLength={12} className="bg-background" />
            <Input placeholder="房間代碼..." value={inputCode} onChange={e => setInputCode(e.target.value.toUpperCase())} className="bg-background uppercase" maxLength={6} />
            <Button onClick={handleJoinRoom} className="w-full font-display glow-neutral mt-2" size="lg" disabled={!name || !inputCode}>
              <LogIn className="w-4 h-4 mr-2" /> 加入房間
            </Button>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm font-display">或</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <Button onClick={handleCreateRoom} variant="outline" className="w-full font-display border-primary/50 text-primary hover:bg-primary/10" size="lg">
            建立新房間 (主持)
          </Button>
        </motion.div>
      </div>
    );
  }

  // View 2: Player joined and waiting
  if (!isHost) {
    return (
      <div className="min-h-screen bg-night-gradient bg-moonlit flex flex-col items-center justify-center px-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 w-full max-w-sm">
          <div className="text-5xl animate-pulse">⏳</div>
          <h2 className="text-2xl font-display font-bold text-foreground">等待主持開始...</h2>
          <div className="p-4 rounded-xl bg-secondary/40 border border-border mt-8">
            <p className="text-muted-foreground text-sm mb-1">房間代碼</p>
            <p className="text-3xl font-mono font-bold tracking-widest text-primary">{roomCode}</p>
          </div>
          <p className="text-sm text-muted-foreground">你已加入為: {name}</p>
          {myPlayerId ? (
            <p className="text-green-500 text-sm mt-4">已成功連線！等待遊戲開始。</p>
          ) : (
            <p className="text-yellow-500 text-sm mt-4">正在連線至主機...</p>
          )}
        </motion.div>
      </div>
    );
  }

  // View 3: Host Lobby
  const canProceed = state.players.length >= 6;

  return (
    <div className="min-h-screen bg-night-gradient bg-moonlit flex flex-col">
      <header className="pt-12 pb-6 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-4xl mb-3 animate-float">👑</div>
          <h1 className="text-3xl font-display font-bold text-primary tracking-wider mb-2">主機模式</h1>
          <button onClick={copyCode} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors cursor-pointer mt-2">
            <span className="font-mono font-bold tracking-widest">{roomCode}</span>
            <Copy className="w-4 h-4" />
          </button>
        </motion.div>
      </header>

      <div className="flex-1 px-4 pb-6 max-w-lg mx-auto w-full">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-sm font-body">{state.players.length}/18 位玩家</span>
            </div>
            {!canProceed && <span className="text-xs text-muted-foreground">至少需要 6 位玩家</span>}
          </div>

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
                    <span className="text-xs text-muted-foreground font-display w-5 text-center">{i + 1}</span>
                    <span className="text-foreground font-medium">{player.name}</span>
                  </div>
                  <button onClick={() => dispatch({ type: 'REMOVE_PLAYER', id: player.id })} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {state.players.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Moon className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">等待玩家輸入代碼加入...</p>
            </div>
          )}
        </motion.div>
      </div>

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
          選擇角色並開始 <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
