import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Users, ArrowRight, Moon, Copy, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Lobby() {
  const { state, dispatch, isHost, roomCode, isConnecting, createRoom, joinRoom, myPlayerId } = useGame();
  const [name, setName] = useState('');
  const [inputCode, setInputCode] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    await createRoom();
  };

  const handleJoinRoom = async () => {
    if (!name.trim() || !inputCode.trim()) {
      toast.error('\u8acb\u8f38\u5165\u540d\u7a31\u53ca\u623f\u9593\u4ee3\u78bc');
      return;
    }
    await joinRoom(inputCode.trim(), name.trim());
  };

  const copyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      toast('\u623f\u9593\u4ee3\u78bc\u5df2\u8907\u88fd \ud83d\udccb');
    }
  };

  useEffect(() => {
    if (state.phase !== 'lobby') {
      if (isHost) navigate('/roles');
      else navigate('/player');
    }
  }, [state.phase, isHost, navigate]);

  // ── View 1: Not yet in a room ──────────────────────────────────────────
  if (!roomCode) {
    return (
      <div className="min-h-screen bg-night-gradient bg-moonlit flex flex-col justify-center px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="text-6xl mb-4 animate-float">\ud83d\udc3a</div>
          <h1 className="text-5xl font-display font-bold text-primary tracking-wider mb-2">WolfNight</h1>
          <p className="text-muted-foreground font-display">\u72fc\u4eba\u6bba</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="max-w-xs mx-auto w-full space-y-6">
          <div className="space-y-3 p-6 rounded-2xl bg-secondary/50 border border-border">
            <h2 className="text-lg font-display text-center text-foreground mb-4">\u52a0\u5165\u904a\u6232</h2>
            <Input
              placeholder="\u4f60\u7684\u540d\u7a31..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={12}
              className="bg-background"
              onKeyDown={e => e.key === 'Enter' && handleJoinRoom()}
            />
            <Input
              placeholder="\u623f\u9593\u4ee3\u78bc (6\u4f4d)..."
              value={inputCode}
              onChange={e => setInputCode(e.target.value.toUpperCase())}
              className="bg-background font-mono tracking-widest uppercase"
              maxLength={6}
              onKeyDown={e => e.key === 'Enter' && handleJoinRoom()}
            />
            <Button
              onClick={handleJoinRoom}
              className="w-full font-display mt-2"
              size="lg"
              disabled={!name || !inputCode || isConnecting}
            >
              {isConnecting
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> \u9023\u7dda\u4e2d...</>
                : <><LogIn className="w-4 h-4 mr-2" /> \u52a0\u5165\u623f\u9593</>}
            </Button>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-border" />
            <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm font-display">\u6216</span>
            <div className="flex-grow border-t border-border" />
          </div>

          <Button
            onClick={handleCreateRoom}
            variant="outline"
            className="w-full font-display border-primary/50 text-primary hover:bg-primary/10"
            size="lg"
            disabled={isConnecting}
          >
            {isConnecting
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> \u5efa\u7acb\u4e2d...</>
              : '\u5efa\u7acb\u65b0\u623f\u9593 (\u4e3b\u6301)'}
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── View 2: Player waiting room ────────────────────────────────────────
  if (!isHost) {
    return (
      <div className="min-h-screen bg-night-gradient bg-moonlit flex flex-col items-center justify-center px-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 w-full max-w-sm">
          <div className="text-5xl">{myPlayerId ? '\u2705' : '\u23f3'}</div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            {myPlayerId ? '\u5df2\u9023\u7dda\uff01\u7b49\u5f85\u958b\u59cb...' : '\u6b63\u5728\u9023\u7dda...'}
          </h2>
          <div className="p-4 rounded-xl bg-secondary/40 border border-border">
            <p className="text-muted-foreground text-sm mb-1">\u623f\u9593\u4ee3\u78bc</p>
            <p className="text-3xl font-mono font-bold tracking-widest text-primary">{roomCode}</p>
          </div>
          {myPlayerId
            ? <p className="text-green-400 text-sm">\u4e3b\u6301\u9078\u5b8c\u89d2\u8272\u5f8c\uff0c\u904a\u6232\u6703\u81ea\u52d5\u958b\u59cb\u3002</p>
            : <p className="text-yellow-400 text-sm animate-pulse">\u6b63\u5728\u9023\u7dda\u81f3\u4e3b\u6a5f...</p>}
        </motion.div>
      </div>
    );
  }

  // ── View 3: Host lobby ─────────────────────────────────────────────────
  const canProceed = state.players.length >= 4;

  return (
    <div className="min-h-screen bg-night-gradient bg-moonlit flex flex-col">
      <header className="pt-12 pb-6 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-4xl mb-3 animate-float">\ud83d\udc51</div>
          <h1 className="text-2xl font-display font-bold text-primary mb-3">\u4e3b\u6a5f\u5927\u5ef3</h1>
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors cursor-pointer"
          >
            <span className="font-mono font-bold tracking-widest text-xl">{roomCode}</span>
            <Copy className="w-4 h-4" />
          </button>
          <p className="text-xs text-muted-foreground mt-2">\u5c07\u4ee5\u4e0a\u4ee3\u78bc\u5206\u4eab\u7d66\u670b\u53cb\uff0c\u8b93\u4ed6\u5011\u8f38\u5165\u52a0\u5165</p>
        </motion.div>
      </header>

      <div className="flex-1 px-4 pb-4 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-sm font-body">{state.players.length} \u4f4d\u73a9\u5bb6</span>
          </div>
          {!canProceed && <span className="text-xs text-muted-foreground">\u81f3\u5c11\u9700\u8981 4 \u4f4d\u624d\u80fd\u958b\u59cb</span>}
        </div>

        <div className="space-y-2 max-h-[45vh] overflow-y-auto">
          <AnimatePresence>
            {state.players.map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between bg-secondary/60 rounded-lg px-4 py-3 border border-border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5 text-center">{i + 1}</span>
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
          <div className="text-center py-16 text-muted-foreground">
            <Moon className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">\u7b49\u5f85\u73a9\u5bb6\u8f38\u5165\u4ee3\u78bc\u52a0\u5165...</p>
          </div>
        )}
      </div>

      <div className="px-4 pb-8 max-w-lg mx-auto w-full">
        <Button
          onClick={() => { dispatch({ type: 'SET_PHASE', phase: 'role-selection' }); navigate('/roles'); }}
          disabled={!canProceed}
          className="w-full h-14 text-lg font-display gap-2 glow-gold"
          size="lg"
        >
          \u9078\u64c7\u89d2\u8272\u4e26\u958b\u59cb <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
