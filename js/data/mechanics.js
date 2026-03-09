export const SHARPNESS = {
  red: { name: '赤', raw: 0.5, element: 0.25 },
  orange: { name: '橙', raw: 0.75, element: 0.5 },
  yellow: { name: '黄', raw: 1.0, element: 0.75 },
  green: { name: '緑', raw: 1.05, element: 1.0 },
  blue: { name: '青', raw: 1.2, element: 1.0625 },
  white: { name: '白', raw: 1.32, element: 1.15 },
  purple: { name: '紫', raw: 1.39, element: 1.25 }
};

export const RESTORATION_PARTS = [
  { id: 'none', name: 'なし', attack: 0, affinity: 0 },
  { id: 'attack', name: '基礎攻撃増強', attack: 5, affinity: 0 },
  { id: 'affinity', name: '会心率増強', attack: 0, affinity: 5 }
];

export const RESTORATION_BONUSES = [
  { id: 'none', name: 'なし', group: 'none', value: 0 },
  // 基礎攻撃力
  { id: 'atk_1', name: '基礎攻撃力強化Ⅰ', group: 'atk', attack: 3 },
  { id: 'atk_2', name: '基礎攻撃力強化Ⅱ', group: 'atk', attack: 6 },
  { id: 'atk_3', name: '基礎攻撃力強化Ⅲ', group: 'atk', attack: 9 },
  { id: 'atk_ex', name: '基礎攻撃力強化EX', group: 'atk', attack: 12 },
  // 会心
  { id: 'aff_1', name: '会心率強化Ⅰ', group: 'aff', affinity: 4 },
  { id: 'aff_2', name: '会心率強化Ⅱ', group: 'aff', affinity: 6 },
  { id: 'aff_3', name: '会心率強化Ⅲ', group: 'aff', affinity: 8 },
  { id: 'aff_ex', name: '会心率強化EX', group: 'aff', affinity: 10 },
  // 属性
  { id: 'elem_1', name: '属性強化Ⅰ', group: 'elem', value: 50 },
  { id: 'elem_2', name: '属性強化Ⅱ', group: 'elem', value: 100 },
  { id: 'elem_ex', name: '属性強化EX', group: 'elem', value: 150 },
  // 切れ味・装填
  { id: 'sharp_load', name: '切れ味・装填強化', group: 'sharp_load', value: 1 },
  { id: 'sharp_load_ex', name: '切れ味・装填強化EX', group: 'sharp_load', value: 2 }
];

export const EXCITATION_DATA = {
  gs: {
    attack: { attack: 10, affinity: -15, element: 0 },
    affinity: { attack: -10, affinity: 10, element: -10 },
    element: { attack: 0, affinity: -5, element: 50 }
  },
  ls: {
    attack: { attack: 10, affinity: -15, element: 0 },
    affinity: { attack: -10, affinity: 10, element: -20 },
    element: { attack: 0, affinity: -5, element: 50 }
  },
  sns: {
    attack: { attack: 10, affinity: -15, element: 0 },
    affinity: { attack: -10, affinity: 10, element: -20 },
    element: { attack: 0, affinity: -5, element: 40 }
  },
  db: {
    attack: { attack: 10, affinity: -15, element: 0 },
    affinity: { attack: -10, affinity: 10, element: -20 },
    element: { attack: 0, affinity: -5, element: 30 }
  },
  hammer: {
    attack: { attack: 10, affinity: -15, element: 0 },
    affinity: { attack: -10, affinity: 10, element: -10 },
    element: { attack: 0, affinity: -5, element: 40 }
  },
  hh: {
    attack: { attack: 10, affinity: -15, element: 0 },
    affinity: { attack: -10, affinity: 10, element: 20 },
    element: { attack: 0, affinity: -5, element: 80 }
  },
  lance: {
    attack: { attack: 10, affinity: -15, element: 0 },
    affinity: { attack: -10, affinity: 10, element: -20 },
    element: { attack: 0, affinity: -5, element: 50 }
  },
  gl: {
    attack: { attack: 10, affinity: -15, element: 0 },
    affinity: { attack: -10, affinity: 10, element: 30 },
    element: { attack: 0, affinity: -5, element: 80 }
  },
  sa: {
    attack: { attack: 10, affinity: -15, element: 0 },
    affinity: { attack: -10, affinity: 10, element: -20 },
    element: { attack: 0, affinity: -5, element: 40 }
  },
  cb: {
    attack: { attack: 10, affinity: -15, element: 0 },
    affinity: { attack: -10, affinity: 10, element: -20 },
    element: { attack: 0, affinity: -5, element: 50 }
  },
  ig: {
    attack: { attack: 10, affinity: -15, element: 0 },
    affinity: { attack: -10, affinity: 10, element: -20 },
    element: { attack: 0, affinity: -5, element: 40 }
  },
  bow: {
    attack: { attack: 10, affinity: -15, element: 0 },
    affinity: { attack: -10, affinity: 10, element: -20 },
    element: { attack: 0, affinity: -5, element: 30 }
  },
  lbg: {
    attack: { attack: 10, affinity: -15, element: 0 },
    affinity: { attack: -10, affinity: 10, element: 0 },
    element: { attack: 0, affinity: -5, element: 0 }
  },
  hbg: {
    attack: { attack: 10, affinity: -15, element: 0 },
    affinity: { attack: -10, affinity: 10, element: 0 },
    element: { attack: 0, affinity: -5, element: 0 }
  }
};

export const EXCITATION_TYPES = [
  { id: 'none', name: 'なし' },
  { id: 'attack', name: '攻撃激化' },
  { id: 'affinity', name: '会心激化' },
  { id: 'element', name: '属性激化' }
];

export const ELEMENT_TYPES = [
  { id: 'none', name: '無属性' },
  { id: 'fire', name: '火属性' },
  { id: 'water', name: '水属性' },
  { id: 'thunder', name: '雷属性' },
  { id: 'ice', name: '氷属性' },
  { id: 'dragon', name: '龍属性' }
];

export const BUFF_GROUPS = [
  {
    id: 'group_a',
    name: 'グループA',
    buffs: [
      { id: 'seeds', name: '怪力の種', attack: 10 },
      { id: 'ammo', name: '鬼人弾', attack: 10 },
      { id: 'pill', name: '怪力の丸薬', attack: 25 }
    ]
  },
  {
    id: 'group_b',
    name: 'グループB',
    buffs: [
      { id: 'powder', name: '鬼人の粉塵', attack: 10 }
    ]
  },
  {
    id: 'group_c',
    name: 'グループC',
    buffs: [
      { id: 'potion', name: '鬼人薬', attack: 5 },
      { id: 'potion_g', name: '鬼人薬グレート', attack: 7 },
      { id: 'mushroom', name: 'ニトロダケ (鬼人薬)', attack: 5 }
    ]
  },
  {
    id: 'group_d',
    name: 'グループD (旋律)',
    buffs: [
      { id: 'melody_s', name: '攻撃力UP【小】', multiplier: 1.03 },
      { id: 'melody_s_stack', name: '攻撃力UP【小】重ね掛け', multiplier: 1.045 },
      { id: 'melody_l', name: '攻撃力UP【大】', multiplier: 1.045 },
      { id: 'melody_l_stack', name: '攻撃力UP【大】重ね掛け', multiplier: 1.1 }
    ]
  },
  {
    id: 'group_other',
    name: '旋律その他',
    multi: true,
    buffs: [
      { id: 'melody_aff_15', name: '会心率+15％', affinity: 15 },
      { id: 'melody_atk_aff', name: '攻撃1.1倍・会心+25％', multiplier: 1.1, affinity: 25 }
    ]
  }
];
