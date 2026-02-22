import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { wolfRoles, villagerRoles, neutralRoles, templates, Role } from '@/data/roles';
import { RoleCard } from '@/components/RoleCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

type TabId = 'wolf' | 'villager' | 'neutral';

const tabs: { id: TabId; label: string; emoji: string; roles: Role[] }[] = [
  { id: 'wolf', label: '狼人陣營', emoji: '🐺', roles: wolfRoles },
  { id: 'villager', label: '好人陣營', emoji: '👥', roles: villagerRoles },
  { id: 'neutral', label: '第三方', emoji: '🎭', roles: neutralRoles },
];

export default function RoleSelection() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('wolf');

  const totalSelected = Object.values(state.selectedRoles).reduce((a, b) => a + b, 0);
  const playerCount = state.players.length;
  const isValid = totalSelected === playerCount;

  const wolfCount = Object.entries(state.selectedRoles)
    .filter(([id]) => wolfRoles.some(r => r.id === id))
    .reduce((a, [, c]) => a + c, 0);

  const handleIncrement = (roleId: string) => {
    dispatch({ type: 'INCREMENT_ROLE', roleId });
  };

  const handleDecrement = (roleId: string) => {
    dispatch({ type: 'DECREMENT_ROLE', roleId });
  };

  const handleTemplate = (roles: Record<string, number>) => {
    dispatch({ type: 'LOAD_TEMPLATE', roles });
  };

  const startGame = () => {
    dispatch({ type: 'ASSIGN_ROLES' });
    navigate('/assign');
  };

  const currentTabRoles = tabs.find(t => t.id === activeTab)!.roles;

  return (
    <div className="min-h-screen bg-night-gradient bg-moonlit flex flex-col">
      {/* Header */}
      <header className="pt-6 pb-3 px-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg text-foreground">選擇角色</h1>
          <div className="text-sm text-muted-foreground">
            <span className={totalSelected === playerCount ? 'text-primary font-bold' : totalSelected > playerCount ? 'text-destructive font-bold' : ''}>
              {totalSelected}
            </span>
            /{playerCount}
          </div>
        </div>
      </header>

      {/* Templates */}
      <div className="px-4 pb-3 max-w-lg mx-auto w-full">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {templates.filter(t => t.playerCount <= playerCount).map(t => (
            <button
              key={t.id}
              onClick={() => handleTemplate(t.roles)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/60 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
            >
              <Sparkles className="w-3 h-3" />
              {t.nameCn}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 max-w-lg mx-auto w-full">
        <div className="flex rounded-lg bg-secondary/40 p-1 gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-xs py-2 rounded-md font-medium transition-all ${
                activeTab === tab.id
                  ? tab.id === 'wolf' ? 'bg-wolf/20 text-wolf' : tab.id === 'villager' ? 'bg-villager/20 text-villager' : 'bg-neutral/20 text-neutral'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Role grid */}
      <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full overflow-y-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-3 gap-3"
        >
          {currentTabRoles.map(role => {
            const count = state.selectedRoles[role.id] || 0;
            return (
              <div key={role.id} className="relative group">
                <RoleCard
                  role={role}
                  count={count}
                  selected={count > 0}
                  onClick={() => count === 0 ? handleIncrement(role.id) : null}
                  size="sm"
                  showDescription={false}
                />
                {count > 0 && (
                  <div className="absolute -top-1 -right-1 flex gap-1 z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDecrement(role.id); }}
                      className="w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center text-lg font-bold shadow-lg hover:scale-110 transition-transform"
                    >
                      −
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleIncrement(role.id); }}
                      className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold shadow-lg hover:scale-110 transition-transform"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Status bar */}
      <div className="px-4 pb-2 max-w-lg mx-auto w-full">
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>🐺 狼人: {wolfCount}</span>
          <span>👥 好人: {totalSelected - wolfCount}</span>
        </div>
      </div>

      {/* Start button */}
      <div className="px-4 pb-8 max-w-lg mx-auto w-full">
        <Button
          onClick={startGame}
          disabled={!isValid || wolfCount === 0}
          className="w-full h-14 text-lg font-display gap-2 glow-gold"
          size="lg"
        >
          開始分配角色 <ArrowRight className="w-5 h-5" />
        </Button>
        {!isValid && totalSelected > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-2">
            {totalSelected < playerCount ? `還需選擇 ${playerCount - totalSelected} 個角色` : `多選了 ${totalSelected - playerCount} 個角色`}
          </p>
        )}
      </div>
    </div>
  );
}
