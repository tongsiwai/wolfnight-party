import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, ArrowRight } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';

interface NightStepDef {
  roleId: string;
  title: string;
  instruction: string;
  emoji: string;
  requiresTarget?: boolean;
}

export default function NightPhase() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [seerResult, setSeerResult] = useState<string | null>(null);
  const [witchMode, setWitchMode] = useState<'heal' | 'poison' | null>(null);
  const { play } = useSound();

  useEffect(() => {
    play('night-ambient');
    play('crickets');
  }, []);

  // Build night steps based on active roles
  const nightSteps: NightStepDef[] = [];
  const activeRoleIds = new Set<string>();
  state.players.forEach(p => {
    if (p.alive && p.role) activeRoleIds.add(p.role.id);
  });

  const wolvesAlive = state.players.some(p => p.alive && p.role?.team === 'wolf');

  // Seer
  if (activeRoleIds.has('seer')) {
    nightSteps.push({
      roleId: 'seer',
      title: '預言家 請睜眼',
      instruction: '選擇一位玩家查驗身份。',
      emoji: '🔮',
      requiresTarget: true,
    });
  }

  // Werewolves
  if (wolvesAlive) {
    nightSteps.push({
      roleId: 'werewolf',
      title: '狼人 請睜眼',
      instruction: '選擇一位玩家作為今晚的目標。',
      emoji: '🐺',
      requiresTarget: true,
    });
  }

  // Guard
  if (activeRoleIds.has('guard')) {
    nightSteps.push({
      roleId: 'guard',
      title: '守衛 請睜眼',
      instruction: '選擇一位玩家守護（不能連續守護同一人）。',
      emoji: '🛡️',
      requiresTarget: true,
    });
  }

  // Witch
  if (activeRoleIds.has('witch')) {
    nightSteps.push({
      roleId: 'witch',
      title: '女巫 請睜眼',
      instruction: '你可以選擇使用解藥或毒藥。',
      emoji: '🧙‍♀️',
      requiresTarget: true,
    });
  }

  nightSteps.push({
    roleId: 'all',
    title: '天亮了',
    instruction: '所有玩家請睜眼。',
    emoji: '☀️',
  });

  const step = nightSteps[currentStep];
  const isLastStep = currentStep >= nightSteps.length - 1;

  useEffect(() => {
    if (step?.roleId === 'werewolf') {
      play('wolf-howl');
    } else if (step?.roleId === 'all') {
      play('dawn');
    }
  }, [currentStep, step?.roleId]);

  const handleNext = () => {
    if (step.roleId === 'seer' && selectedTarget !== null && !seerResult) {
      const target = state.players.find(p => p.id === selectedTarget);
      if (target) {
        const isWolf = target.role?.team === 'wolf' && target.role?.id !== 'hidden-wolf';
        setSeerResult(isWolf ? '狼人陣營 🐺' : '好人陣營 👥');
      }
      return;
    }

    if (selectedTarget !== null && step.requiresTarget) {
      if (step.roleId === 'werewolf') {
        dispatch({ type: 'ADD_NIGHT_ACTION', action: { roleId: 'werewolf', action: 'wolf-kill', targetId: selectedTarget } });
      } else if (step.roleId === 'guard') {
        dispatch({ type: 'ADD_NIGHT_ACTION', action: { roleId: 'guard', targetId: selectedTarget } });
      } else if (step.roleId === 'witch') {
        dispatch({ type: 'ADD_NIGHT_ACTION', action: { roleId: 'witch', action: witchMode || 'heal', targetId: selectedTarget } });
      } else if (step.roleId === 'seer') {
        dispatch({ type: 'ADD_NIGHT_ACTION', action: { roleId: 'seer', targetId: selectedTarget } });
      }
    }

    setSeerResult(null);
    setSelectedTarget(null);
    setWitchMode(null);

    if (isLastStep) {
      dispatch({ type: 'RESOLVE_NIGHT' });
      dispatch({ type: 'CHECK_VICTORY' });
      navigate('/day');
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    setSeerResult(null);
    setSelectedTarget(null);
    setWitchMode(null);
    if (isLastStep) {
      dispatch({ type: 'RESOLVE_NIGHT' });
      dispatch({ type: 'CHECK_VICTORY' });
      navigate('/day');
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  if (!step) return null;

  const wolfKillTargetId = state.nightActions.find(a => a.roleId === 'werewolf')?.targetId;
  const wolfKillName = state.players.find(p => p.id === wolfKillTargetId)?.name;

  const selectablePlayers = state.players.filter(p => {
    if (!p.alive) return false;
    if (step.roleId === 'guard' && p.id === state.lastGuardedPlayerId) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-night-gradient flex flex-col">
      <header className="pt-6 pb-4 px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-1">
          <Moon className="w-4 h-4" />
          <span className="font-display">第 {state.round} 夜</span>
        </div>
        <div className="flex gap-1 max-w-xs mx-auto mt-2">
          {nightSteps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= currentStep ? 'bg-primary' : 'bg-secondary'}`} />
          ))}
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep + (seerResult ? '-result' : '')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center w-full max-w-sm"
          >
            <span className="text-6xl block mb-4">{step.emoji}</span>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">{step.title}</h2>
            
            {step.roleId === 'seer' && seerResult ? (
              <div className="mt-8 p-6 rounded-2xl bg-primary/10 border border-primary/20 animate-in zoom-in duration-300">
                <p className="text-muted-foreground text-sm mb-2">查驗結果：</p>
                <p className="text-3xl font-display font-bold text-primary">{seerResult}</p>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground text-sm mb-6">{step.instruction}</p>
                
                {step.roleId === 'witch' && !state.usedHealPotion && wolfKillName && (
                  <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive-foreground">今晚被殺的是：<span className="font-bold">{wolfKillName}</span></p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 bg-background/50"
                      onClick={() => { setWitchMode('heal'); setSelectedTarget(wolfKillTargetId!); }}
                    >
                      使用解藥
                    </Button>
                  </div>
                )}

                {step.requiresTarget && (
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {selectablePlayers.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedTarget(p.id === selectedTarget ? null : p.id);
                          if (step.roleId === 'witch') setWitchMode('poison');
                        }}
                        className={`p-3 rounded-lg border text-sm transition-all ${
                          selectedTarget === p.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-secondary/30 text-foreground hover:border-primary/50'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-4 pb-8 max-w-sm mx-auto w-full space-y-2">
        <Button onClick={handleNext} className="w-full h-14 text-lg font-display gap-2" size="lg">
          {seerResult ? '我知道了' : isLastStep ? '進入白天' : '下一步'} <ArrowRight className="w-5 h-5" />
        </Button>
        {step.requiresTarget && !seerResult && (
          <Button onClick={handleSkip} variant="ghost" className="w-full text-muted-foreground">
            跳過此步驟
          </Button>
        )}
      </div>
    </div>
  );
}
