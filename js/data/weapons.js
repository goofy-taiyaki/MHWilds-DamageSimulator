export const WEAPON_TYPES = [
  { id: 'gs', name: '大剣', multiplier: 4.8, type: 'sever' },
  { id: 'ls', name: '太刀', multiplier: 3.3, type: 'sever' },
  { id: 'sns', name: '片手剣', multiplier: 1.4, type: 'sever' },
  { id: 'db', name: '双剣', multiplier: 1.4, type: 'sever' },
  { id: 'hammer', name: 'ハンマー', multiplier: 5.2, type: 'blunt' },
  { id: 'hh', name: '狩猟笛', multiplier: 4.2, type: 'blunt' },
  { id: 'lance', name: 'ランス', multiplier: 2.3, type: 'sever' },
  { id: 'gl', name: 'ガンランス', multiplier: 2.3, type: 'sever' },
  { id: 'sa', name: 'スラッシュアックス', multiplier: 3.5, type: 'sever' },
  { id: 'cb', name: 'チャージアックス', multiplier: 3.6, type: 'sever' },
  { id: 'ig', name: '操虫棍', multiplier: 3.1, type: 'sever' },
  { id: 'lbg', name: 'ライトボウガン', multiplier: 1.3, type: 'ammo' },
  { id: 'hbg', name: 'ヘビィボウガン', multiplier: 1.5, type: 'ammo' },
  { id: 'bow', name: '弓', multiplier: 1.2, type: 'ammo' }
];

// Artia weapons base stats - Updated 2026-03-02
const ARTIA_BASE_STATS = {
  gs: { attack: 190, affinity: 5, element: 480 },
  ls: { attack: 190, affinity: 5, element: 300 },
  sns: { attack: 190, affinity: 5, element: 250 },
  db: { attack: 190, affinity: 5, element: 270 },
  hammer: { attack: 190, affinity: 5, element: 350 },
  hh: { attack: 190, affinity: 5, element: 350 },
  lance: { attack: 190, affinity: 5, element: 300 },
  gl: { attack: 190, affinity: 5, element: 400 },
  sa: { attack: 190, affinity: 5, element: 280 },
  cb: { attack: 190, affinity: 5, element: 300 },
  ig: { attack: 190, affinity: 5, element: 280 },
  bow: { attack: 190, affinity: 5, element: 210 },
  lbg: { attack: 190, affinity: 5, element: 0 },
  hbg: { attack: 190, affinity: 5, element: 0 }
};

export const WEAPONS = WEAPON_TYPES.map(type => ({
  id: `artia_${type.id}`,
  type: type.id,
  name: '巨戟アーティア',
  attack: ARTIA_BASE_STATS[type.id].attack,
  affinity: ARTIA_BASE_STATS[type.id].affinity,
  element: ARTIA_BASE_STATS[type.id].element,
  elementType: null
}));

// weapon-specific excitation bonuses [Attack, Affinity, Element]
