import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sun, Skull, Vote, Timer, ArrowRight, Moon } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';

type DaySubPhase = 'announcement' | 'discussion' | 'voting' | 'results';

export default function DayPhase() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [subPhase, setSubPhase] = useState<DaySubPhase>('announcement');
  const [timeLeft, setTimeLeft] = useState(state.discussionTime);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [currentVoter, setCurrentVoter] = useState(0);
  const { play } = useSound();

  const alivePlayers = state.players.filter(p => p.alive);
  const eliminatedNames = state.eliminatedLastNight
    .map(id => state.players.find(p => p.id === id)?.name)
    .filter(Boolean);

  // Discussion timer
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const voters = alivePlayers;
  const currentVoterPlayer = voters[currentVoter];

  // Play elimination sound on announcement
  useEffect(() => {
    if (subPhase === 'announcement' && eliminatedNames.length > 0) {
      play('elimination');
    }
  }, [subPhase]);

  // Navigate to victory when state changes
  useEffect(() => {
    if (state.phase === 'victory') {
      navigate('/victory');
    }
  }, [state.phase, navigate]);

  const handleCastVote = () => {
    play('vote');
    if (selectedVote !== null && currentVoterPlayer) {
      dispatch({ type: 'CAST_VOTE', voterId: currentVoterPlayer.id, targetId: selectedVote });
    }
    setSelectedVote(null);
    if (currentVoter >= voters.length - 1) {
      // All votes cast - resolve then check victory
      dispatch({ type: 'RESOLVE_VOTES' });
      setSubPhase('results');
    } else {
      setCurrentVoter(prev => prev + 1);
    }
  };

  const handleNextRound = () => {
    if (state.phase === 'victory') {
      navigate('/victory');
      return;
    }
    dispatch({ type: 'NEXT_ROUND' });
    navigate('/night');
  };

  // Check victory only after results sub-phase and after RESOLVE_VOTES has settled
  useEffect(() => {
    if (subPhase === 'results') {
      dispatch({ type: 'CHECK_VICTORY' });
    }
  }, [subPhase]);

  return (
    <div className=\"min-h-screen bg-night-gradient flex flex-col\" style={{
      background: 'linear-gradient(180deg, hsl(210 30% 18%) 0%, hsl(210 25% 25%) 50%, hsl(40 50% 45%) 100%)',
    }}>
      <header className=\"pt-6 pb-4 px-4 text-center\">
        <div className=\"flex items-center justify-center gap-2 text-foreground text-sm\">
          <Sun className=\"w-4 h-4 text-primary\" />
          <span className=\"font-display\">第 {state.round} 天</span>
        </div>
      </header>

      <div className=\"flex-1 flex flex-col items-center justify-center px-4\">
        <AnimatePresence mode=\"wait\">
          {subPhase === 'announcement' && (
            <motion.div
              key=\"announcement\"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className=\"text-center w-full max-w-sm space-y-6\"
            >
              {eliminatedNames.length > 0 ? (
                <>
                  <Skull className=\"w-12 h-12 mx-auto text-destructive\" />
                  <div>
                    <h2 className=\"text-2xl font-display font-bold text-foreground mb-2\">昨晚的犧牲者</h2>
                    {eliminatedNames.map(name => (
                      <p key={name} className=\"text-xl text-destructive font-bold\">{name}</p>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className=\"text-5xl\">🌅</div>
                  <h2 className=\"text-2xl font-display font-bold text-foreground\">平安夜</h2>
                  <p className=\"text-muted-foreground\">昨晚沒有人被淘汰。</p>
                </>
              )}
              <Button onClick={() => setSubPhase('discussion')} className=\"w-full h-14 text-lg font-display gap-2\" size=\"lg\">
                開始討論 <ArrowRight className=\"w-5 h-5\" />
              </Button>
            </motion.div>
          )}

          {subPhase === 'discussion' && (
            <motion.div
              key=\"discussion\"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className=\"text-center w-full max-w-sm space-y-6\"
            >
              <Timer className=\"w-10 h-10 mx-auto text-primary\" />
              <h2 className=\"text-2xl font-display font-bold text-foreground\">自由討論</h2>
              <div className=\"text-5xl font-display font-bold text-primary\">
                {formatTime(timeLeft)}
              </div>
              <div className=\"flex gap-3 justify-center\">
                <Button
                  onClick={() => setTimerActive(!timerActive)}
                  variant={timerActive ? 'destructive' : 'default'}
                  className=\"font-display\"
                >
                  {timerActive ? '暫停' : '開始計時'}
                </Button>
                <Button onClick={() => setTimeLeft(state.discussionTime)} variant=\"outline\" className=\"font-display\">
                  重置
                </Button>
              </div>
              <div className=\"grid grid-cols-3 gap-2\">
                {state.players.map(p => (
                  <div
                    key={p.id}
                    className={`p-2 rounded-lg border text-xs text-center ${
                      p.alive
                        ? 'border-border bg-secondary/30 text-foreground'
                        : 'border-border/30 bg-secondary/10 text-muted-foreground line-through opacity-40'
                    }`}
                  >
                    {!p.alive && <Skull className=\"w-3 h-3 mx-auto mb-0.5 text-destructive/50\" />}
                    {p.name}
                  </div>
                ))}
              </div>
              <Button onClick={() => { setSubPhase('voting'); setCurrentVoter(0); }} className=\"w-full h-14 text-lg font-display gap-2\" size=\"lg\">
                <Vote className=\"w-5 h-5\" /> 進入投票
              </Button>
            </motion.div>
          )}

          {subPhase === 'voting' && currentVoterPlayer && (
            <motion.div
              key={`voting-${currentVoter}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className=\"text-center w-full max-w-sm space-y-4\"
            >
              <Vote className=\"w-8 h-8 mx-auto text-primary\" />
              <div>
                <p className=\"text-sm text-muted-foreground\">投票 {currentVoter + 1}/{voters.length}</p>
                <h2 className=\"text-2xl font-display font-bold text-primary mt-1\">
                  {currentVoterPlayer.name}
                </h2>
                <p className=\"text-sm text-muted-foreground\">選擇要投票淘汰的玩家</p>
              </div>
              <div className=\"grid grid-cols-3 gap-2\">
                {alivePlayers
                  .filter(p => p.id !== currentVoterPlayer.id)
                  .map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedVote(p.id === selectedVote ? null : p.id)}
                      className={`p-3 rounded-lg border text-sm transition-all ${
                        selectedVote === p.id
                          ? 'border-destructive bg-destructive/10 text-destructive'
                          : 'border-border bg-secondary/30 text-foreground hover:border-destructive/50'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
              </div>
              <Button onClick={handleCastVote} className=\"w-full h-12 font-display gap-2\" size=\"lg\">
                {selectedVote !== null ? '確認投票' : '棄票'} <ArrowRight className=\"w-4 h-4\" />
              </Button>
            </motion.div>
          )}

          {subPhase === 'results' && (
            <motion.div
              key=\"results\"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className=\"text-center w-full max-w-sm space-y-6\"
            >
              <h2 className=\"text-2xl font-display font-bold text-foreground\">投票結果</h2>
              {state.events.length > 0 && (
                <p className=\"text-lg text-foreground\">
                  {state.events[state.events.length - 1].description}
                </p>
              )}
              <Button onClick={handleNextRound} className=\"w-full h-14 text-lg font-display gap-2\" size=\"lg\">
                <Moon className=\"w-5 h-5\" /> 進入夜晚
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
