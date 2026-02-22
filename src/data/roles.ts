export type Team = 'wolf' | 'villager' | 'neutral';

export interface Role {
  id: string;
  name: string;
  nameCn: string;
  emoji: string;
  team: Team;
  description: string;
  descriptionCn: string;
  tip: string;
  nightOrder?: number; // order of action at night, lower = earlier
}

export const roles: Role[] = [
  // Werewolf Camp
  {
    id: 'werewolf',
    name: 'Werewolf',
    nameCn: '狼人',
    emoji: '🐺',
    team: 'wolf',
    description: 'Each night, werewolves collectively choose one player to eliminate.',
    descriptionCn: '每晚，狼人們共同選擇一位玩家淘汰。',
    tip: 'Blend in during the day. Coordinate with your wolf teammates at night.',
    nightOrder: 20,
  },
  {
    id: 'alpha-wolf',
    name: 'Alpha Werewolf',
    nameCn: '狼王',
    emoji: '👑🐺',
    team: 'wolf',
    description: 'When eliminated, can drag one player to death.',
    descriptionCn: '被淘汰時，可以帶走一位玩家。',
    tip: 'Your death is powerful. Use it strategically to take out a key villager.',
    nightOrder: 20,
  },
  {
    id: 'white-wolf',
    name: 'White Wolf',
    nameCn: '白狼王',
    emoji: '🐺💀',
    team: 'wolf',
    description: 'Every other night, can eliminate an additional player.',
    descriptionCn: '每隔一夜，可以額外淘汰一位玩家。',
    tip: 'Use your extra kill wisely to accelerate the wolf advantage.',
    nightOrder: 21,
  },
  {
    id: 'wolf-beauty',
    name: 'Wolf Beauty',
    nameCn: '狼美人',
    emoji: '🐺💋',
    team: 'wolf',
    description: 'Can charm a player; if Wolf Beauty dies, the charmed player also dies.',
    descriptionCn: '可以魅惑一位玩家；狼美人死亡時，被魅惑的玩家也會死亡。',
    tip: 'Charm a powerful villager role to maximize your death impact.',
    nightOrder: 22,
  },
  {
    id: 'hidden-wolf',
    name: 'Hidden Wolf',
    nameCn: '隱狼',
    emoji: '🐺🎭',
    team: 'wolf',
    description: 'Appears as a villager to the Seer\'s detection.',
    descriptionCn: '在預言家的查驗中顯示為好人。',
    tip: 'The Seer can\'t find you. Use this to gain village trust.',
    nightOrder: 20,
  },
  // Villager Camp
  {
    id: 'villager',
    name: 'Villager',
    nameCn: '村民',
    emoji: '👤',
    team: 'villager',
    description: 'No special ability. Uses logic and deduction to find wolves.',
    descriptionCn: '沒有特殊能力，依靠邏輯和推理找出狼人。',
    tip: 'Pay close attention to everyone\'s behavior and statements.',
  },
  {
    id: 'seer',
    name: 'Seer',
    nameCn: '預言家',
    emoji: '🔮',
    team: 'villager',
    description: 'Each night, can check one player\'s true identity.',
    descriptionCn: '每晚可以查驗一位玩家的真實身份。',
    tip: 'Be strategic about when to reveal your findings.',
    nightOrder: 10,
  },
  {
    id: 'witch',
    name: 'Witch',
    nameCn: '女巫',
    emoji: '🧙‍♀️',
    team: 'villager',
    description: 'Has one healing potion and one poison potion, each usable once per game.',
    descriptionCn: '擁有一瓶解藥和一瓶毒藥，每瓶只能使用一次。',
    tip: 'Save your potions for critical moments. Don\'t waste them early.',
    nightOrder: 30,
  },
  {
    id: 'hunter',
    name: 'Hunter',
    nameCn: '獵人',
    emoji: '🏹',
    team: 'villager',
    description: 'Upon death (except by poison), can shoot and eliminate one player.',
    descriptionCn: '死亡時（毒殺除外），可以開槍帶走一位玩家。',
    tip: 'Make sure your shot counts. Gather information before you die.',
  },
  {
    id: 'guard',
    name: 'Guard',
    nameCn: '守衛',
    emoji: '🛡️',
    team: 'villager',
    description: 'Each night, can protect one player from werewolf attack. Cannot protect same player consecutively.',
    descriptionCn: '每晚可以守護一位玩家免受狼人攻擊，不能連續守護同一人。',
    tip: 'Try to predict who the wolves will target tonight.',
    nightOrder: 25,
  },
  {
    id: 'idiot',
    name: 'Idiot',
    nameCn: '白痴',
    emoji: '🤪',
    team: 'villager',
    description: 'If voted out during the day, reveals role and stays alive but loses voting rights.',
    descriptionCn: '若在白天被投票淘汰，翻牌後存活但失去投票權。',
    tip: 'You\'re hard to eliminate by vote. Use this survivability wisely.',
  },
  {
    id: 'elder',
    name: 'Elder',
    nameCn: '長老',
    emoji: '👴',
    team: 'villager',
    description: 'Can survive one extra werewolf attack (has 2 lives against wolves).',
    descriptionCn: '可以多承受一次狼人攻擊（對狼人有兩條命）。',
    tip: 'Your extra life gives you time to gather more information.',
    nightOrder: 35,
  },
  {
    id: 'little-girl',
    name: 'Little Girl',
    nameCn: '小女孩',
    emoji: '👧',
    team: 'villager',
    description: 'Can peek during werewolf phase with a risk of being caught.',
    descriptionCn: '可以在狼人階段偷看，但有被發現的風險。',
    tip: 'Peeking is risky but can give you valuable information.',
    nightOrder: 20,
  },
  {
    id: 'knight',
    name: 'Knight',
    nameCn: '騎士',
    emoji: '⚔️',
    team: 'villager',
    description: 'Can challenge a player during the day; if target is wolf, target dies; if wrong, Knight dies.',
    descriptionCn: '白天可以決鬥一位玩家；若對方是狼人則對方死亡，若猜錯則騎士死亡。',
    tip: 'Only challenge when you\'re very confident about someone being a wolf.',
  },
  // Neutral / Third Party
  {
    id: 'cupid',
    name: 'Cupid',
    nameCn: '丘比特',
    emoji: '💘',
    team: 'neutral',
    description: 'On the first night, links two players as lovers; if one dies, the other also dies.',
    descriptionCn: '第一個夜晚，將兩位玩家連結為情侶；若一人死亡，另一人也會死亡。',
    tip: 'Choose lovers wisely — cross-team lovers create a hidden win condition.',
    nightOrder: 1,
  },
  {
    id: 'thief',
    name: 'Thief',
    nameCn: '盜賊',
    emoji: '🦹',
    team: 'neutral',
    description: 'On the first night, can swap their role with one of two extra role cards.',
    descriptionCn: '第一個夜晚，可以與兩張額外角色牌中的一張交換身份。',
    tip: 'Check both cards carefully before deciding which role to take.',
    nightOrder: 0,
  },
  {
    id: 'fox',
    name: 'Fox',
    nameCn: '狐狸',
    emoji: '🦊',
    team: 'neutral',
    description: 'Each night, can check 3 adjacent players; if none are werewolves, loses the power.',
    descriptionCn: '每晚可以查驗三位相鄰玩家；若其中沒有狼人，則失去此能力。',
    tip: 'Use your power to narrow down where the wolves are sitting.',
    nightOrder: 5,
  },
  {
    id: 'piper',
    name: 'Piper',
    nameCn: '吹笛者',
    emoji: '🎵',
    team: 'neutral',
    description: 'Each night, charms 2 players. Wins when all living players are charmed.',
    descriptionCn: '每晚魅惑兩位玩家，當所有存活玩家都被魅惑時獲勝。',
    tip: 'Stay hidden and slowly charm everyone. Don\'t draw attention.',
    nightOrder: 40,
  },
];

export const wolfRoles = roles.filter(r => r.team === 'wolf');
export const villagerRoles = roles.filter(r => r.team === 'villager');
export const neutralRoles = roles.filter(r => r.team === 'neutral');

export interface GameTemplate {
  id: string;
  name: string;
  nameCn: string;
  playerCount: number;
  roles: Record<string, number>; // roleId -> count
}

export const templates: GameTemplate[] = [
  {
    id: 'classic-8',
    name: 'Classic 8-Player',
    nameCn: '經典8人局',
    playerCount: 8,
    roles: { werewolf: 2, villager: 3, seer: 1, witch: 1, hunter: 1 },
  },
  {
    id: 'classic-10',
    name: 'Classic 10-Player',
    nameCn: '經典10人局',
    playerCount: 10,
    roles: { werewolf: 3, villager: 3, seer: 1, witch: 1, hunter: 1, guard: 1 },
  },
  {
    id: 'advanced-12',
    name: 'Advanced 12-Player',
    nameCn: '進階12人局',
    playerCount: 12,
    roles: { werewolf: 3, 'alpha-wolf': 1, villager: 3, seer: 1, witch: 1, hunter: 1, guard: 1, cupid: 1 },
  },
];

export function getRoleById(id: string): Role | undefined {
  return roles.find(r => r.id === id);
}
