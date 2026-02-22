import React, { createContext, useContext, useReducer, useEffect, useState, useRef, useCallback } from 'react';
import { Role, getRoleById } from '@/data/roles';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export type GamePhase = 'lobby' | 'role-selection' | 'role-assignment' | 'night' | 'day' | 'victory';
export type WinTeam = 'wolf' | 'villager' | 'neutral' | null;

export interface Player {
  id: number;
  name: string;
  role?: Role;
  alive: boolean;
  votedOut?: boolean;
  hasVotingRights?: boolean;
}

export interface GameEvent {
  phase: string;
  round: number;
  description: string;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  selectedRoles: Record<string, number>;
  currentPlayerIndex: number;
  round: number;
  nightStep: number;
  nightActions: NightAction[];
  votes: Record<number, number>;
  eliminatedLastNight: number[];
  events: GameEvent[];
  winner: WinTeam;
  discussionTime: number;
  lastGuardedPlayerId: number | null;
  usedHealPotion: boolean;
  usedPoisonPotion: boolean;
}

export interface NightAction {
  roleId: string;
  playerId?: number;
  targetId?: number;
  action?: string;
}

type Action =
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'SET_PLAYERS'; players: Player[] }
  | { type: 'ADD_PLAYER'; name: string; id?: number }
  | { type: 'REMOVE_PLAYER'; id: number }
  | { type: 'SET_SELECTED_ROLES'; roles: Record<string, number> }
  | { type: 'INCREMENT_ROLE'; roleId: string }
  | { type: 'DECREMENT_ROLE'; roleId: string }
  | { type: 'ASSIGN_ROLES' }
  | { type: 'NEXT_PLAYER' }
  | { type: 'SET_NIGHT_STEP'; step: number }
  | { type: 'ADD_NIGHT_ACTION'; action: NightAction }
  | { type: 'RESOLVE_NIGHT' }
  | { type: 'CAST_VOTE'; voterId: number; targetId: number }
  | { type: 'RESOLVE_VOTES' }
  | { type: 'ELIMINATE_PLAYER'; playerId: number }
  | { type: 'ADD_EVENT'; event: GameEvent }
  | { type: 'CHECK_VICTORY' }
  | { type: 'NEXT_ROUND' }
  | { type: 'SET_DISCUSSION_TIME'; time: number }
  | { type: 'LOAD_TEMPLATE'; roles: Record<string, number> }
  | { type: 'RESET_GAME' }
  | { type: 'SYNC_STATE'; state: GameState };

export const initialState: GameState = {
  phase: 'lobby',
  players: [],
  selectedRoles: {},
  currentPlayerIndex: 0,
  round: 1,
  nightStep: 0,
  nightActions: [],
  votes: {},
  eliminatedLastNight: [],
  events: [],
  winner: null,
  discussionTime: 300,
  lastGuardedPlayerId: null,
  usedHealPotion: false,
  usedPoisonPotion: false,
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function checkVictory(players: Player[]): WinTeam {
  const alive = players.filter(p => p.alive);
  const wolves = alive.filter(p => p.role?.team === 'wolf');
  const villagers = alive.filter(p => p.role?.team !== 'wolf');
  if (wolves.length === 0) return 'villager';
  if (wolves.length >= villagers.length) return 'wolf';
  return null;
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SYNC_STATE':
      return { ...action.state };
    case 'SET_PHASE':
      return { ...state, phase: action.phase };
    case 'SET_PLAYERS':
      return { ...state, players: action.players };
    case 'ADD_PLAYER': {
      const id = action.id || (state.players.length > 0 ? Math.max(...state.players.map(p => p.id)) + 1 : 1);
      if (state.players.find(p => p.id === id)) return state;
      return { ...state, players: [...state.players, { id, name: action.name, alive: true, hasVotingRights: true }] };
    }
    case 'REMOVE_PLAYER':
      return { ...state, players: state.players.filter(p => p.id !== action.id) };
    case 'SET_SELECTED_ROLES':
      return { ...state, selectedRoles: action.roles };
    case 'INCREMENT_ROLE': {
      const totalSelected = Object.values(state.selectedRoles).reduce((a, b) => a + b, 0);
      if (totalSelected >= state.players.length) return state;
      return { ...state, selectedRoles: { ...state.selectedRoles, [action.roleId]: (state.selectedRoles[action.roleId] || 0) + 1 } };
    }
    case 'DECREMENT_ROLE': {
      const current = state.selectedRoles[action.roleId] || 0;
      if (current <= 0) return state;
      const newRoles = { ...state.selectedRoles };
      if (current === 1) delete newRoles[action.roleId];
      else newRoles[action.roleId] = current - 1;
      return { ...state, selectedRoles: newRoles };
    }
    case 'LOAD_TEMPLATE':
      return { ...state, selectedRoles: { ...action.roles } };
    case 'ASSIGN_ROLES': {
      const roleList: Role[] = [];
      for (const [roleId, count] of Object.entries(state.selectedRoles)) {
        const role = getRoleById(roleId);
        if (role) for (let i = 0; i < count; i++) roleList.push(role);
      }
      const missing = state.players.length - roleList.length;
      if (missing > 0) {
        const villager = getRoleById('villager')!;
        for (let i = 0; i < missing; i++) roleList.push(villager);
      }
      const shuffled = shuffleArray(roleList);
      const players = state.players.map((p, i) => ({ ...p, role: shuffled[i], alive: true, hasVotingRights: true, votedOut: false }));
      return { ...state, players, currentPlayerIndex: 0, phase: 'night', round: 1, events: [] };
    }
    case 'NEXT_PLAYER':
      return { ...state, currentPlayerIndex: state.currentPlayerIndex + 1 };
    case 'SET_NIGHT_STEP':
      return { ...state, nightStep: action.step };
    case 'ADD_NIGHT_ACTION':
      return { ...state, nightActions: [...state.nightActions, action.action] };
    case 'RESOLVE_NIGHT': {
      const wolfAction = state.nightActions.find(a => a.roleId === 'werewolf' || a.roleId === 'white-wolf');
      const guardAction = state.nightActions.find(a => a.roleId === 'guard');
      const witchHeal = state.nightActions.find(a => a.roleId === 'witch' && a.action === 'heal');
      const witchPoison = state.nightActions.find(a => a.roleId === 'witch' && a.action === 'poison');
      const eliminated: number[] = [];
      let usedHeal = state.usedHealPotion;
      let usedPoison = state.usedPoisonPotion;
      if (wolfAction?.targetId) {
        const isGuarded = guardAction?.targetId === wolfAction.targetId;
        const isHealed = witchHeal?.targetId === wolfAction.targetId;
        if (witchHeal) usedHeal = true;
        if (!isGuarded && !isHealed) eliminated.push(wolfAction.targetId);
      }
      if (witchPoison?.targetId) {
        if (!eliminated.includes(witchPoison.targetId)) eliminated.push(witchPoison.targetId);
        usedPoison = true;
      }
      const players = state.players.map(p => ({ ...p, alive: eliminated.includes(p.id) ? false : p.alive }));
      const events = [...state.events];
      if (eliminated.length > 0) {
        const names = eliminated.map(id => players.find(p => p.id === id)?.name).join(', ');
        events.push({ phase: 'night', round: state.round, description: `${names} was eliminated during the night.` });
      } else {
        events.push({ phase: 'night', round: state.round, description: 'Peaceful night \u2014 no one was eliminated.' });
      }
      return { ...state, players, eliminatedLastNight: eliminated, nightActions: [], nightStep: 0, events, phase: 'day', lastGuardedPlayerId: guardAction?.targetId || null, usedHealPotion: usedHeal, usedPoisonPotion: usedPoison };
    }
    case 'CAST_VOTE':
      return { ...state, votes: { ...state.votes, [action.voterId]: action.targetId } };
    case 'RESOLVE_VOTES': {
      const tally: Record<number, number> = {};
      Object.values(state.votes).forEach(targetId => { tally[targetId] = (tally[targetId] || 0) + 1; });
      let maxVotes = 0, eliminatedId: number | null = null, tie = false;
      Object.entries(tally).forEach(([idStr, count]) => {
        const id = parseInt(idStr);
        if (count > maxVotes) { maxVotes = count; eliminatedId = id; tie = false; }
        else if (count === maxVotes) { tie = true; }
      });
      const events = [...state.events];
      let players = [...state.players];
      if (eliminatedId !== null && !tie) {
        const targetPlayer = players.find(p => p.id === eliminatedId);
        if (targetPlayer?.role?.id === 'idiot') {
          players = players.map(p => p.id === eliminatedId ? { ...p, hasVotingRights: false } : p);
          events.push({ phase: 'day', round: state.round, description: `${targetPlayer.name} was voted out, but revealed as the Idiot and survived (lost voting rights).` });
        } else {
          players = players.map(p => p.id === eliminatedId ? { ...p, alive: false, votedOut: true } : p);
          events.push({ phase: 'day', round: state.round, description: `${targetPlayer?.name} was voted out.` });
        }
      } else {
        events.push({ phase: 'day', round: state.round, description: 'Vote was tied \u2014 no one was eliminated.' });
      }
      return { ...state, players, votes: {}, events };
    }
    case 'ELIMINATE_PLAYER':
      return { ...state, players: state.players.map(p => p.id === action.playerId ? { ...p, alive: false } : p) };
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.event] };
    case 'CHECK_VICTORY': {
      const winner = checkVictory(state.players);
      if (winner) return { ...state, winner, phase: 'victory' };
      return state;
    }
    case 'NEXT_ROUND':
      return { ...state, round: state.round + 1, phase: 'night', nightStep: 0, nightActions: [], eliminatedLastNight: [] };
    case 'SET_DISCUSSION_TIME':
      return { ...state, discussionTime: action.time };
    case 'RESET_GAME':
      return { ...initialState, players: state.players.map(p => ({ ...p, role: undefined, alive: true, votedOut: false, hasVotingRights: true })), selectedRoles: state.selectedRoles };
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: (action: Action) => void;
  isHost: boolean;
  roomCode: string | null;
  myPlayerId: number | null;
  isConnecting: boolean;
  createRoom: () => Promise<void>;
  joinRoom: (code: string, name: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatchRaw] = useReducer(gameReducer, initialState);
  const [isHost, setIsHost] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<number | null>(null);
  const [roomDbId, setRoomDbId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const broadcastChannelRef = useRef<RealtimeChannel | null>(null);
  const dbChannelRef = useRef<RealtimeChannel | null>(null);
  const isHostRef = useRef(false);

  useEffect(() => { isHostRef.current = isHost; }, [isHost]);

  const dispatch = useCallback((action: Action) => {
    dispatchRaw(action);
  }, []);

  // HOST: sync state to Supabase after every change (debounced)
  useEffect(() => {
    if (!isHost || !roomDbId) return;
    const timer = setTimeout(async () => {
      const { error } = await supabase
        .from('rooms')
        .update({ game_state: state as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
        .eq('id', roomDbId);
      if (error) console.error('[WolfNight] Failed to sync state to Supabase:', error.message);
    }, 80);
    return () => clearTimeout(timer);
  }, [state, isHost, roomDbId]);

  // Cleanup channels on unmount
  useEffect(() => {
    return () => {
      if (broadcastChannelRef.current) supabase.removeChannel(broadcastChannelRef.current);
      if (dbChannelRef.current) supabase.removeChannel(dbChannelRef.current);
    };
  }, []);

  const createRoom = useCallback(async () => {
    setIsConnecting(true);
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data, error } = await supabase
        .from('rooms')
        .insert({ code, game_state: initialState as unknown as Record<string, unknown> })
        .select()
        .single();
      if (error || !data) {
        toast.error('\u7121\u6cd5\u5efa\u7acb\u623f\u9593\uff0c\u8acb\u7a0d\u5f8c\u518d\u8a66\u3002');
        console.error(error);
        return;
      }
      setRoomDbId(data.id);
      setIsHost(true);
      setRoomCode(code);
      dispatchRaw({ type: 'SET_PHASE', phase: 'lobby' });

      // Subscribe to broadcast channel to receive player join requests
      const bc = supabase.channel(`wolfnight:${code}`, { config: { broadcast: { self: false } } });
      bc.on('broadcast', { event: 'PLAYER_JOIN' }, ({ payload }) => {
        const newId = Date.now();
        dispatchRaw({ type: 'ADD_PLAYER', name: payload.name, id: newId });
        bc.send({ type: 'broadcast', event: 'PLAYER_ACCEPTED', payload: { name: payload.name, id: newId } });
        toast(`\ud83d\udc3a ${payload.name} \u52a0\u5165\u4e86\u623f\u9593\uff01`);
      }).subscribe();
      broadcastChannelRef.current = bc;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const joinRoom = useCallback(async (code: string, name: string) => {
    setIsConnecting(true);
    try {
      const upperCode = code.toUpperCase();
      const { data: room, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', upperCode)
        .single();
      if (error || !room) {
        toast.error('\u627e\u4e0d\u5230\u623f\u9593\uff0c\u8acb\u6aa2\u67e5\u4ee3\u78bc\u662f\u5426\u6b63\u78ba\u3002');
        return;
      }
      setRoomDbId(room.id);
      setIsHost(false);
      setRoomCode(upperCode);

      // Load current game state from DB
      if (room.game_state) dispatchRaw({ type: 'SYNC_STATE', state: room.game_state as GameState });

      // Subscribe to DB realtime changes to receive host state updates
      const dbCh = supabase
        .channel(`wolfnight_db:${room.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${room.id}` }, (payload) => {
          if (payload.new?.game_state) {
            dispatchRaw({ type: 'SYNC_STATE', state: payload.new.game_state as GameState });
          }
        })
        .subscribe();
      dbChannelRef.current = dbCh;

      // Subscribe to broadcast channel and send join request
      const bc = supabase.channel(`wolfnight:${upperCode}`, { config: { broadcast: { self: false } } });
      bc.on('broadcast', { event: 'PLAYER_ACCEPTED' }, ({ payload }) => {
        const pending = sessionStorage.getItem('pendingName');
        if (payload.name === pending) {
          setMyPlayerId(payload.id);
          sessionStorage.removeItem('pendingName');
          toast.success(`\u2705 \u6210\u529f\u52a0\u5165\uff01\u6b61\u8fce ${payload.name}`);
        }
      }).subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          sessionStorage.setItem('pendingName', name);
          await bc.send({ type: 'broadcast', event: 'PLAYER_JOIN', payload: { name } });
        }
      });
      broadcastChannelRef.current = bc;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch, isHost, roomCode, myPlayerId, isConnecting, createRoom, joinRoom }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
