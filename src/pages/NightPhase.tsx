import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, ArrowRight, Skull, Shield } from 'lucide-react';
import { roles as allRoles } from '@/data/roles';

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

  // Build night steps based on active roles
  const nightSteps: NightStepDef[] = [];

  const activeRoleIds = new Set<string>();
  state.players.forEach(p => {
    if (p.alive && p.role) activeRoleIds.add(p.role.id);
  });

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
  nightSteps.push({
    roleId: 'werewolf',
    title: '狼人 請睜眼',
    instruction: '選擇一位玩家作為今晚的目標。',
    emoji: '🐺',
    requiresTarget: true,
  });

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

  // All close eyes
  nightSteps.push({
    roleId: 'all',
    title: '天亮了',
    instruction: '所有玩家請睜眼。',
    emoji: '☀️',
  });

  const step = nightSteps[currentStep];
  const isLastStep = currentStep >= nightSteps.length - 1;
  const alivePlayers = state.players.filter(p => p.alive);

  const handleNext = () => {
    // Record night action if target selected
    if (selectedTarget !== null && step.requiresTarget) {
      if (step.roleId === 'werewolf') {
        dispatch({ type: 'ADD_NIGHT_ACTION', action: { roleId: 'werewolf', action: 'wolf-kill', targetId: selectedTarget } });
      } else if (step.roleId === 'guard') {
        dispatch({ type: 'ADD_NIGHT_ACTION', action: { roleId: 'guard', targetId: selectedTarget } });
      } else if (step.roleId === 'witch') {
        dispatch({ type: 'ADD_NIGHT_ACTION', action: { roleId: 'witch', action: 'heal', targetId: selectedTarget } });
      } else if (step.roleId === 'seer') {
        dispatch({ type: 'ADD_NIGHT_ACTION', action: { roleId: 'seer', targetId: selectedTarget } });
      }
    }

    setSelectedTarget(null);

    if (isLastStep) {
      // Resolve night and go to day
      dispatch({ type: 'RESOLVE_NIGHT' });
      navigate('/day');
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    setSelectedTarget(null);
    if (isLastStep) {
      dispatch({ type: 'RESOLVE_NIGHT' });
      navigate('/day');
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  if (!step) return null;

  return (
    <div className="min-h-screen bg-night-gradient flex flex-col">
      {/* Night header */}
      <header className="pt-6 pb-4 px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-1">
          <Moon className="w-4 h-4" />
          <span className="font-display">第 {state.round} 夜</span>
        </div>
        {/* Step progress */}
        <div className="flex gap-1 max-w-xs mx-auto mt-2">
          {nightSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= currentStep ? 'bg-primary' : 'bg-secondary'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center w-full max-w-sm"
          >
            <span className="text-6xl block mb-4">{step.emoji}</span>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">{step.title}</h2>
            <p className="text-muted-foreground text-sm mb-6">{step.instruction}</p>

            {/* Target selection */}
            {step.requiresTarget && (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {alivePlayers.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedTarget(p.id === selectedTarget ? null : p.id)}
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
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="px-4 pb-8 max-w-sm mx-auto w-full space-y-2">
        <Button
          onClick={handleNext}
          className="w-full h-14 text-lg font-display gap-2"
          size="lg"
        >
          {isLastStep ? '進入白天' : '下一步'} <ArrowRight className="w-5 h-5" />
        </Button>
        {step.requiresTarget && (
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            跳過此步驟
          </Button>
        )}
      </div>
    </div>
  );
}
