export const SKILLS = [
  {
    "id": "attack_boost",
    "name": "攻撃",
    "mainCategory": "weapon",
    "subCategory": "attack",
    "maxLevel": 5,
    "effects": [
      {
        "level": 1,
        "attackAdd": 3
      },
      {
        "level": 2,
        "attackAdd": 5
      },
      {
        "level": 3,
        "attackAdd": 7
      },
      {
        "level": 4,
        "attackAdd": 8,
        "attackMult": 0.02
      },
      {
        "level": 5,
        "attackAdd": 9,
        "attackMult": 0.04
      }
    ]
  },
  {
    "id": "airborne",
    "name": "飛燕",
    "mainCategory": "weapon",
    "subCategory": "attack",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "attackMult": 0.1
      }
    ]
  },
  {
    "id": "critical_boost",
    "name": "超会心",
    "mainCategory": "weapon",
    "subCategory": "affinity",
    "maxLevel": 5,
    "effects": [
      {
        "level": 1,
        "critMultAdd": 0.03
      },
      {
        "level": 2,
        "critMultAdd": 0.06
      },
      {
        "level": 3,
        "critMultAdd": 0.09
      },
      {
        "level": 4,
        "critMultAdd": 0.12
      },
      {
        "level": 5,
        "critMultAdd": 0.15
      }
    ]
  },
  {
    "id": "critical_eye",
    "name": "見切り",
    "mainCategory": "weapon",
    "subCategory": "affinity",
    "maxLevel": 5,
    "effects": [
      {
        "level": 1,
        "affinity": 4
      },
      {
        "level": 2,
        "affinity": 8
      },
      {
        "level": 3,
        "affinity": 12
      },
      {
        "level": 4,
        "affinity": 16
      },
      {
        "level": 5,
        "affinity": 20
      }
    ]
  },
  {
    "id": "critical_draw",
    "name": "抜刀術【技】",
    "mainCategory": "weapon",
    "subCategory": "affinity",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1,
        "affinity": 50
      },
      {
        "level": 2,
        "affinity": 75
      },
      {
        "level": 3,
        "affinity": 100
      }
    ]
  },
  {
    "id": "critical_element",
    "name": "会心撃【属性】",
    "mainCategory": "weapon",
    "subCategory": "element",
    "maxLevel": 3,
    "weaponSpecific": true,
    "weaponEffects": {
      "gs": [
        {
          "level": 1,
          "elementCritMult": 0.08
        },
        {
          "level": 2,
          "elementCritMult": 0.14
        },
        {
          "level": 3,
          "elementCritMult": 0.2
        }
      ],
      "ls": [
        {
          "level": 1,
          "elementCritMult": 0.05
        },
        {
          "level": 2,
          "elementCritMult": 0.1
        },
        {
          "level": 3,
          "elementCritMult": 0.15
        }
      ],
      "sns": [
        {
          "level": 1,
          "elementCritMult": 0.05
        },
        {
          "level": 2,
          "elementCritMult": 0.1
        },
        {
          "level": 3,
          "elementCritMult": 0.15
        }
      ],
      "db": [
        {
          "level": 1,
          "elementCritMult": 0.05
        },
        {
          "level": 2,
          "elementCritMult": 0.1
        },
        {
          "level": 3,
          "elementCritMult": 0.15
        }
      ],
      "hammer": [
        {
          "level": 1,
          "elementCritMult": 0.08
        },
        {
          "level": 2,
          "elementCritMult": 0.14
        },
        {
          "level": 3,
          "elementCritMult": 0.2
        }
      ],
      "hh": [
        {
          "level": 1,
          "elementCritMult": 0.08
        },
        {
          "level": 2,
          "elementCritMult": 0.14
        },
        {
          "level": 3,
          "elementCritMult": 0.2
        }
      ],
      "lance": [
        {
          "level": 1,
          "elementCritMult": 0.05
        },
        {
          "level": 2,
          "elementCritMult": 0.1
        },
        {
          "level": 3,
          "elementCritMult": 0.15
        }
      ],
      "gl": [
        {
          "level": 1,
          "elementCritMult": 0.08
        },
        {
          "level": 2,
          "elementCritMult": 0.14
        },
        {
          "level": 3,
          "elementCritMult": 0.2
        }
      ],
      "sa": [
        {
          "level": 1,
          "elementCritMult": 0.08
        },
        {
          "level": 2,
          "elementCritMult": 0.14
        },
        {
          "level": 3,
          "elementCritMult": 0.2
        }
      ],
      "cb": [
        {
          "level": 1,
          "elementCritMult": 0.08
        },
        {
          "level": 2,
          "elementCritMult": 0.14
        },
        {
          "level": 3,
          "elementCritMult": 0.2
        }
      ],
      "ig": [
        {
          "level": 1,
          "elementCritMult": 0.05
        },
        {
          "level": 2,
          "elementCritMult": 0.1
        },
        {
          "level": 3,
          "elementCritMult": 0.15
        }
      ],
      "bow": [
        {
          "level": 1,
          "elementCritMult": 0.05
        },
        {
          "level": 2,
          "elementCritMult": 0.1
        },
        {
          "level": 3,
          "elementCritMult": 0.15
        }
      ],
      "lbg": [
        {
          "level": 1,
          "elementCritMult": 0.05
        },
        {
          "level": 2,
          "elementCritMult": 0.1
        },
        {
          "level": 3,
          "elementCritMult": 0.15
        }
      ],
      "hbg": [
        {
          "level": 1,
          "elementCritMult": 0.05
        },
        {
          "level": 2,
          "elementCritMult": 0.1
        },
        {
          "level": 3,
          "elementCritMult": 0.15
        }
      ]
    }
  },
  {
    "id": "fire_attack_boost",
    "name": "火属性攻撃強化",
    "mainCategory": "weapon",
    "subCategory": "element",
    "maxLevel": 3,
    "requiresElement": "fire",
    "effects": [
      {
        "level": 1,
        "elementAdd": 40
      },
      {
        "level": 2,
        "elementAdd": 50,
        "elementMult": 0.1
      },
      {
        "level": 3,
        "elementAdd": 60,
        "elementMult": 0.2
      }
    ]
  },
  {
    "id": "water_attack_boost",
    "name": "水属性攻撃強化",
    "mainCategory": "weapon",
    "subCategory": "element",
    "maxLevel": 3,
    "requiresElement": "water",
    "effects": [
      {
        "level": 1,
        "elementAdd": 40
      },
      {
        "level": 2,
        "elementAdd": 50,
        "elementMult": 0.1
      },
      {
        "level": 3,
        "elementAdd": 60,
        "elementMult": 0.2
      }
    ]
  },
  {
    "id": "thunder_attack_boost",
    "name": "雷属性攻撃強化",
    "mainCategory": "weapon",
    "subCategory": "element",
    "maxLevel": 3,
    "requiresElement": "thunder",
    "effects": [
      {
        "level": 1,
        "elementAdd": 40
      },
      {
        "level": 2,
        "elementAdd": 50,
        "elementMult": 0.1
      },
      {
        "level": 3,
        "elementAdd": 60,
        "elementMult": 0.2
      }
    ]
  },
  {
    "id": "ice_attack_boost",
    "name": "氷属性攻撃強化",
    "mainCategory": "weapon",
    "subCategory": "element",
    "maxLevel": 3,
    "requiresElement": "ice",
    "effects": [
      {
        "level": 1,
        "elementAdd": 40
      },
      {
        "level": 2,
        "elementAdd": 50,
        "elementMult": 0.1
      },
      {
        "level": 3,
        "elementAdd": 60,
        "elementMult": 0.2
      }
    ]
  },
  {
    "id": "dragon_attack_boost",
    "name": "龍属性攻撃強化",
    "mainCategory": "weapon",
    "subCategory": "element",
    "maxLevel": 3,
    "requiresElement": "dragon",
    "effects": [
      {
        "level": 1,
        "elementAdd": 40
      },
      {
        "level": 2,
        "elementAdd": 50,
        "elementMult": 0.1
      },
      {
        "level": 3,
        "elementAdd": 60,
        "elementMult": 0.2
      }
    ]
  },
  {
    "id": "normal_up",
    "name": "通常弾・連射矢強化",
    "mainCategory": "weapon",
    "subCategory": "ammo",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "attackMult": 0.05
      }
    ]
  },
  {
    "id": "pierce_up",
    "name": "貫通弾・竜の矢強化",
    "mainCategory": "weapon",
    "subCategory": "ammo",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "attackMult": 0.05
      }
    ]
  },
  {
    "id": "spread_up",
    "name": "散弾・剛射強化",
    "mainCategory": "weapon",
    "subCategory": "ammo",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "attackMult": 0.05
      }
    ]
  },
  {
    "id": "rapid_fire_up_lbg",
    "name": "速射強化",
    "mainCategory": "weapon",
    "subCategory": "ammo",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "attackMult": 0.05
      }
    ]
  },
  {
    "id": "force_shot",
    "name": "フォースショット",
    "mainCategory": "weapon",
    "subCategory": "ammo",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1,
        "attackAdd": 3,
        "elementMult": 0.05,
        "affinity": 8
      },
      {
        "level": 2,
        "attackAdd": 6,
        "elementMult": 0.05,
        "affinity": 10
      },
      {
        "level": 3,
        "attackAdd": 10,
        "elementMult": 0.05,
        "affinity": 12
      }
    ]
  },
  {
    "id": "first_shot",
    "name": "ファーストショット",
    "mainCategory": "weapon",
    "subCategory": "ammo",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1,
        "attackAdd": 5,
        "elementMult": 0.1
      },
      {
        "level": 2,
        "attackAdd": 10,
        "elementMult": 0.1
      },
      {
        "level": 3,
        "attackAdd": 15,
        "elementMult": 0.1
      }
    ]
  },
  {
    "id": "resentment",
    "name": "逆恨み",
    "mainCategory": "armor",
    "subCategory": "attack",
    "maxLevel": 5,
    "effects": [
      {
        "level": 1,
        "attackAdd": 5
      },
      {
        "level": 2,
        "attackAdd": 10
      },
      {
        "level": 3,
        "attackAdd": 15
      },
      {
        "level": 4,
        "attackAdd": 20
      },
      {
        "level": 5,
        "attackAdd": 25
      }
    ]
  },
  {
    "id": "adrenaline_rush",
    "name": "巧撃",
    "mainCategory": "armor",
    "subCategory": "attack",
    "maxLevel": 5,
    "effects": [
      {
        "level": 1,
        "attackAdd": 10
      },
      {
        "level": 2,
        "attackAdd": 15
      },
      {
        "level": 3,
        "attackAdd": 20
      },
      {
        "level": 4,
        "attackAdd": 25
      },
      {
        "level": 5,
        "attackAdd": 30
      }
    ]
  },
  {
    "id": "peak_performance",
    "name": "フルチャージ",
    "mainCategory": "armor",
    "subCategory": "attack",
    "maxLevel": 5,
    "effects": [
      {
        "level": 1,
        "attackAdd": 3
      },
      {
        "level": 2,
        "attackAdd": 6
      },
      {
        "level": 3,
        "attackAdd": 10
      },
      {
        "level": 4,
        "attackAdd": 15
      },
      {
        "level": 5,
        "attackAdd": 20
      }
    ]
  },
  {
    "id": "counterstrike",
    "name": "逆襲",
    "mainCategory": "armor",
    "subCategory": "attack",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1,
        "attackAdd": 10
      },
      {
        "level": 2,
        "attackAdd": 15
      },
      {
        "level": 3,
        "attackAdd": 25
      }
    ]
  },
  {
    "id": "weakness_exploit",
    "name": "弱点特効",
    "mainCategory": "armor",
    "subCategory": "affinity",
    "maxLevel": 5,
    "effects": [
      {
        "level": 1,
        "attackAdd": 3,
        "affinity": 5
      },
      {
        "level": 2,
        "attackAdd": 5,
        "affinity": 10
      },
      {
        "level": 3,
        "attackAdd": 10,
        "affinity": 15
      },
      {
        "level": 4,
        "attackAdd": 15,
        "affinity": 20
      },
      {
        "level": 5,
        "attackAdd": 20,
        "affinity": 30
      }
    ]
  },
  {
    "id": "maximum_might",
    "name": "渾身",
    "mainCategory": "armor",
    "subCategory": "affinity",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1,
        "affinity": 10
      },
      {
        "level": 2,
        "affinity": 20
      },
      {
        "level": 3,
        "affinity": 30
      }
    ]
  },
  {
    "id": "element_conversion",
    "name": "属性変換",
    "mainCategory": "armor",
    "subCategory": "element",
    "maxLevel": 3,
    "requiresElement": "any_element",
    "effects": [
      {
        "level": 1,
        "elementAdd": 8,
        "elementMult": 0.1
      },
      {
        "level": 2,
        "elementAdd": 12,
        "elementMult": 0.15
      },
      {
        "level": 3,
        "elementAdd": 18,
        "elementMult": 0.2
      }
    ]
  },
  {
    "id": "divine_blessing",
    "name": "精霊の加護",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "fire_resistance",
    "name": "火耐性",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1,
        "resAdd": 6
      },
      {
        "level": 2,
        "resAdd": 12
      },
      {
        "level": 3,
        "resAdd": 20,
        "defAdd": 10
      }
    ]
  },
  {
    "id": "water_resistance",
    "name": "水耐性",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1,
        "resAdd": 6
      },
      {
        "level": 2,
        "resAdd": 12
      },
      {
        "level": 3,
        "resAdd": 20,
        "defAdd": 10
      }
    ]
  },
  {
    "id": "thunder_resistance",
    "name": "雷耐性",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1,
        "resAdd": 6
      },
      {
        "level": 2,
        "resAdd": 12
      },
      {
        "level": 3,
        "resAdd": 20,
        "defAdd": 10
      }
    ]
  },
  {
    "id": "ice_resistance",
    "name": "氷耐性",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1,
        "resAdd": 6
      },
      {
        "level": 2,
        "resAdd": 12
      },
      {
        "level": 3,
        "resAdd": 20,
        "defAdd": 10
      }
    ]
  },
  {
    "id": "dragon_resistance",
    "name": "龍耐性",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1,
        "resAdd": 6
      },
      {
        "level": 2,
        "resAdd": 12
      },
      {
        "level": 3,
        "resAdd": 20,
        "defAdd": 10
      }
    ]
  },
  {
    "id": "poison_resistance",
    "name": "毒耐性",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "paralysis_resistance",
    "name": "麻痺耐性",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "sleep_resistance",
    "name": "睡眠耐性",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "defense_down_resistance",
    "name": "防御力DOWN耐性",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "blight_resistance",
    "name": "属性やられ耐性",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "stun_resistance",
    "name": "気絶耐性",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "bleeding_resistance",
    "name": "裂傷耐性",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "restraint_resistance",
    "name": "拘束耐性",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "blast_resistance",
    "name": "爆破やられ耐性",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "environmental_adaptation",
    "name": "環境適応",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 2,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      }
    ]
  },
  {
    "id": "recovery_up",
    "name": "体力回復量UP",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "recovery_speed",
    "name": "回復速度",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "environment_knowledge",
    "name": "環境利用の知識",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "constitution",
    "name": "体術",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 5,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      },
      {
        "level": 4
      },
      {
        "level": 5
      }
    ]
  },
  {
    "id": "stamina_surge",
    "name": "スタミナ急速回復",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "marathon_runner",
    "name": "ランナー",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "hunger_resistance",
    "name": "腹減り耐性",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "challenger",
    "name": "挑戦者",
    "mainCategory": "armor",
    "subCategory": "affinity",
    "maxLevel": 5,
    "effects": [
      {
        "level": 1,
        "attackAdd": 4,
        "affinity": 3
      },
      {
        "level": 2,
        "attackAdd": 8,
        "affinity": 5
      },
      {
        "level": 3,
        "attackAdd": 12,
        "affinity": 7
      },
      {
        "level": 4,
        "attackAdd": 16,
        "affinity": 10
      },
      {
        "level": 5,
        "attackAdd": 20,
        "affinity": 15
      }
    ]
  },
  {
    "id": "latent_power",
    "name": "力の解放",
    "mainCategory": "armor",
    "subCategory": "affinity",
    "maxLevel": 5,
    "effects": [
      {
        "level": 1,
        "attackAdd": 70,
        "affinity": 10
      },
      {
        "level": 2,
        "attackAdd": 70,
        "affinity": 20
      },
      {
        "level": 3,
        "attackAdd": 50,
        "affinity": 30
      },
      {
        "level": 4,
        "attackAdd": 50,
        "affinity": 40
      },
      {
        "level": 5,
        "attackAdd": 50,
        "affinity": 50
      }
    ]
  },
  {
    "id": "heroics",
    "name": "火事場力",
    "mainCategory": "armor",
    "subCategory": "attack",
    "maxLevel": 5,
    "effects": [
      {
        "level": 1,
        "attackAdd": 50
      },
      {
        "level": 2,
        "attackAdd": 50,
        "attackMult": 0.05
      },
      {
        "level": 3
      },
      {
        "level": 4
      },
      {
        "level": 5,
        "attackMult": 0.3
      }
    ]
  },
  {
    "id": "burst",
    "name": "連撃",
    "mainCategory": "armor",
    "subCategory": "attack",
    "maxLevel": 5,
    "weaponSpecific": true,
    "weaponEffects": {
      "gs": [
        {
          "level": 1,
          "attackAdd": 10,
          "elementAdd": 80
        },
        {
          "level": 2,
          "attackAdd": 12,
          "elementAdd": 100
        },
        {
          "level": 3,
          "attackAdd": 14,
          "elementAdd": 120
        },
        {
          "level": 4,
          "attackAdd": 16,
          "elementAdd": 160
        },
        {
          "level": 5,
          "attackAdd": 18,
          "elementAdd": 200
        }
      ],
      "ls": [
        {
          "level": 1,
          "attackAdd": 8,
          "elementAdd": 60
        },
        {
          "level": 2,
          "attackAdd": 10,
          "elementAdd": 80
        },
        {
          "level": 3,
          "attackAdd": 12,
          "elementAdd": 100
        },
        {
          "level": 4,
          "attackAdd": 15,
          "elementAdd": 120
        },
        {
          "level": 5,
          "attackAdd": 18,
          "elementAdd": 140
        }
      ],
      "sns": [
        {
          "level": 1,
          "attackAdd": 8,
          "elementAdd": 60
        },
        {
          "level": 2,
          "attackAdd": 10,
          "elementAdd": 80
        },
        {
          "level": 3,
          "attackAdd": 12,
          "elementAdd": 100
        },
        {
          "level": 4,
          "attackAdd": 15,
          "elementAdd": 120
        },
        {
          "level": 5,
          "attackAdd": 18,
          "elementAdd": 140
        }
      ],
      "db": [
        {
          "level": 1,
          "attackAdd": 8,
          "elementAdd": 40
        },
        {
          "level": 2,
          "attackAdd": 10,
          "elementAdd": 60
        },
        {
          "level": 3,
          "attackAdd": 12,
          "elementAdd": 80
        },
        {
          "level": 4,
          "attackAdd": 15,
          "elementAdd": 100
        },
        {
          "level": 5,
          "attackAdd": 18,
          "elementAdd": 120
        }
      ],
      "hammer": [
        {
          "level": 1,
          "attackAdd": 8,
          "elementAdd": 60
        },
        {
          "level": 2,
          "attackAdd": 10,
          "elementAdd": 80
        },
        {
          "level": 3,
          "attackAdd": 12,
          "elementAdd": 100
        },
        {
          "level": 4,
          "attackAdd": 15,
          "elementAdd": 120
        },
        {
          "level": 5,
          "attackAdd": 18,
          "elementAdd": 140
        }
      ],
      "hh": [
        {
          "level": 1,
          "attackAdd": 10,
          "elementAdd": 80
        },
        {
          "level": 2,
          "attackAdd": 12,
          "elementAdd": 100
        },
        {
          "level": 3,
          "attackAdd": 14,
          "elementAdd": 120
        },
        {
          "level": 4,
          "attackAdd": 16,
          "elementAdd": 160
        },
        {
          "level": 5,
          "attackAdd": 18,
          "elementAdd": 200
        }
      ],
      "lance": [
        {
          "level": 1,
          "attackAdd": 8,
          "elementAdd": 60
        },
        {
          "level": 2,
          "attackAdd": 10,
          "elementAdd": 80
        },
        {
          "level": 3,
          "attackAdd": 12,
          "elementAdd": 100
        },
        {
          "level": 4,
          "attackAdd": 15,
          "elementAdd": 120
        },
        {
          "level": 5,
          "attackAdd": 18,
          "elementAdd": 140
        }
      ],
      "gl": [
        {
          "level": 1,
          "attackAdd": 8,
          "elementAdd": 60
        },
        {
          "level": 2,
          "attackAdd": 10,
          "elementAdd": 80
        },
        {
          "level": 3,
          "attackAdd": 12,
          "elementAdd": 100
        },
        {
          "level": 4,
          "attackAdd": 15,
          "elementAdd": 120
        },
        {
          "level": 5,
          "attackAdd": 18,
          "elementAdd": 140
        }
      ],
      "sa": [
        {
          "level": 1,
          "attackAdd": 8,
          "elementAdd": 60
        },
        {
          "level": 2,
          "attackAdd": 10,
          "elementAdd": 80
        },
        {
          "level": 3,
          "attackAdd": 12,
          "elementAdd": 100
        },
        {
          "level": 4,
          "attackAdd": 15,
          "elementAdd": 120
        },
        {
          "level": 5,
          "attackAdd": 18,
          "elementAdd": 140
        }
      ],
      "cb": [
        {
          "level": 1,
          "attackAdd": 8,
          "elementAdd": 60
        },
        {
          "level": 2,
          "attackAdd": 10,
          "elementAdd": 80
        },
        {
          "level": 3,
          "attackAdd": 12,
          "elementAdd": 100
        },
        {
          "level": 4,
          "attackAdd": 15,
          "elementAdd": 120
        },
        {
          "level": 5,
          "attackAdd": 18,
          "elementAdd": 140
        }
      ],
      "ig": [
        {
          "level": 1,
          "attackAdd": 8,
          "elementAdd": 60
        },
        {
          "level": 2,
          "attackAdd": 10,
          "elementAdd": 80
        },
        {
          "level": 3,
          "attackAdd": 12,
          "elementAdd": 100
        },
        {
          "level": 4,
          "attackAdd": 15,
          "elementAdd": 120
        },
        {
          "level": 5,
          "attackAdd": 18,
          "elementAdd": 140
        }
      ],
      "bow": [
        {
          "level": 1,
          "attackAdd": 6,
          "elementAdd": 40
        },
        {
          "level": 2,
          "attackAdd": 7,
          "elementAdd": 60
        },
        {
          "level": 3,
          "attackAdd": 8,
          "elementAdd": 80
        },
        {
          "level": 4,
          "attackAdd": 9,
          "elementAdd": 100
        },
        {
          "level": 5,
          "attackAdd": 10,
          "elementAdd": 120
        }
      ],
      "lbg": [
        {
          "level": 1,
          "attackAdd": 6,
          "elementAdd": 0
        },
        {
          "level": 2,
          "attackAdd": 7,
          "elementAdd": 0
        },
        {
          "level": 3,
          "attackAdd": 8,
          "elementAdd": 0
        },
        {
          "level": 4,
          "attackAdd": 9,
          "elementAdd": 0
        },
        {
          "level": 5,
          "attackAdd": 10,
          "elementAdd": 0
        }
      ],
      "hbg": [
        {
          "level": 1,
          "attackAdd": 6,
          "elementAdd": 0
        },
        {
          "level": 2,
          "attackAdd": 7,
          "elementAdd": 0
        },
        {
          "level": 3,
          "attackAdd": 8,
          "elementAdd": 0
        },
        {
          "level": 4,
          "attackAdd": 9,
          "elementAdd": 0
        },
        {
          "level": 5,
          "attackAdd": 10,
          "elementAdd": 0
        }
      ]
    }
  },
  {
    "id": "foray",
    "name": "攻勢",
    "mainCategory": "armor",
    "subCategory": "affinity",
    "maxLevel": 5,
    "effects": [
      {
        "level": 1,
        "attackAdd": 6
      },
      {
        "level": 2,
        "attackAdd": 8,
        "affinity": 5
      },
      {
        "level": 3,
        "attackAdd": 10,
        "affinity": 10
      },
      {
        "level": 4,
        "attackAdd": 12,
        "affinity": 15
      },
      {
        "level": 5,
        "attackAdd": 15,
        "affinity": 20
      }
    ]
  },
  {
    "id": "chain_blade_stitch",
    "name": "鎖刃刺撃",
    "mainCategory": "armor",
    "subCategory": "attack",
    "maxLevel": 5,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2,
        "attackMult": 0.2
      },
      {
        "level": 3,
        "attackMult": 0.6
      },
      {
        "level": 4,
        "attackMult": 1
      },
      {
        "level": 5,
        "attackMult": 1.5
      }
    ]
  },
  {
    "id": "palico_rally",
    "name": "オトモへの采配",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 5,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      },
      {
        "level": 4
      },
      {
        "level": 5
      }
    ]
  },
  {
    "id": "partbreaker",
    "name": "破壊王",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "coalescence",
    "name": "災禍転福",
    "mainCategory": "armor",
    "subCategory": "element",
    "maxLevel": 3,
    "weaponSpecific": true,
    "weaponEffects": {
      "ls": [
        {
          "level": 1,
          "elementMult": 0.05
        },
        {
          "level": 2,
          "elementMult": 0.1
        },
        {
          "level": 3,
          "elementMult": 0.15
        }
      ],
      "sns": [
        {
          "level": 1,
          "elementMult": 0.05
        },
        {
          "level": 2,
          "elementMult": 0.1
        },
        {
          "level": 3,
          "elementMult": 0.15
        }
      ],
      "db": [
        {
          "level": 1,
          "elementMult": 0.05
        },
        {
          "level": 2,
          "elementMult": 0.1
        },
        {
          "level": 3,
          "elementMult": 0.15
        }
      ],
      "lance": [
        {
          "level": 1,
          "elementMult": 0.05
        },
        {
          "level": 2,
          "elementMult": 0.1
        },
        {
          "level": 3,
          "elementMult": 0.15
        }
      ],
      "ig": [
        {
          "level": 1,
          "elementMult": 0.05
        },
        {
          "level": 2,
          "elementMult": 0.1
        },
        {
          "level": 3,
          "elementMult": 0.15
        }
      ],
      "bow": [
        {
          "level": 1,
          "elementMult": 0.05
        },
        {
          "level": 2,
          "elementMult": 0.1
        },
        {
          "level": 3,
          "elementMult": 0.15
        }
      ],
      "gs": [
        {
          "level": 1,
          "elementMult": 0.1
        },
        {
          "level": 2,
          "elementMult": 0.2
        },
        {
          "level": 3,
          "elementMult": 0.3
        }
      ],
      "hammer": [
        {
          "level": 1,
          "elementMult": 0.1
        },
        {
          "level": 2,
          "elementMult": 0.2
        },
        {
          "level": 3,
          "elementMult": 0.3
        }
      ],
      "hh": [
        {
          "level": 1,
          "elementMult": 0.1
        },
        {
          "level": 2,
          "elementMult": 0.2
        },
        {
          "level": 3,
          "elementMult": 0.3
        }
      ],
      "gl": [
        {
          "level": 1,
          "elementMult": 0.1
        },
        {
          "level": 2,
          "elementMult": 0.2
        },
        {
          "level": 3,
          "elementMult": 0.3
        }
      ],
      "sa": [
        {
          "level": 1,
          "elementMult": 0.1
        },
        {
          "level": 2,
          "elementMult": 0.2
        },
        {
          "level": 3,
          "elementMult": 0.3
        }
      ],
      "cb": [
        {
          "level": 1,
          "elementMult": 0.1
        },
        {
          "level": 2,
          "elementMult": 0.2
        },
        {
          "level": 3,
          "elementMult": 0.3
        }
      ],
      "lbg": [
        {
          "level": 1,
          "elementMult": 0.1
        },
        {
          "level": 2,
          "elementMult": 0.2
        },
        {
          "level": 3,
          "elementMult": 0.3
        }
      ],
      "hbg": [
        {
          "level": 1,
          "elementMult": 0.1
        },
        {
          "level": 2,
          "elementMult": 0.2
        },
        {
          "level": 3,
          "elementMult": 0.3
        }
      ]
    }
  },
  {
    "id": "sudden_attack",
    "name": "急襲",
    "mainCategory": "armor",
    "subCategory": "attack",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1,
        "attackAdd": 30,
        "attackMult": 0.05
      },
      {
        "level": 2,
        "attackAdd": 30,
        "attackMult": 0.1
      },
      {
        "level": 3,
        "attackAdd": 30,
        "attackMult": 0.15
      }
    ]
  },
  {
    "id": "inner_peace",
    "name": "無我の境地",
    "mainCategory": "armor",
    "subCategory": "affinity",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1,
        "attackAdd": 3,
        "affinity": 3
      },
      {
        "level": 2,
        "attackAdd": 6,
        "affinity": 6
      },
      {
        "level": 3,
        "attackAdd": 10,
        "affinity": 10
      }
    ]
  },
  {
    "id": "element_absorption",
    "name": "属性吸収",
    "mainCategory": "armor",
    "subCategory": "element",
    "maxLevel": 3,
    "requiresElement": "any_element",
    "weaponSpecific": true,
    "weaponEffects": {
      "gs": [
        {
          "level": 1,
          "elementAdd": 70
        },
        {
          "level": 2,
          "elementAdd": 100
        },
        {
          "level": 3,
          "elementAdd": 120
        }
      ],
      "hh": [
        {
          "level": 1,
          "elementAdd": 70
        },
        {
          "level": 2,
          "elementAdd": 100
        },
        {
          "level": 3,
          "elementAdd": 120
        }
      ],
      "ls": [
        {
          "level": 1,
          "elementAdd": 60
        },
        {
          "level": 2,
          "elementAdd": 70
        },
        {
          "level": 3,
          "elementAdd": 80
        }
      ],
      "sns": [
        {
          "level": 1,
          "elementAdd": 60
        },
        {
          "level": 2,
          "elementAdd": 70
        },
        {
          "level": 3,
          "elementAdd": 80
        }
      ],
      "hammer": [
        {
          "level": 1,
          "elementAdd": 60
        },
        {
          "level": 2,
          "elementAdd": 70
        },
        {
          "level": 3,
          "elementAdd": 80
        }
      ],
      "lance": [
        {
          "level": 1,
          "elementAdd": 60
        },
        {
          "level": 2,
          "elementAdd": 70
        },
        {
          "level": 3,
          "elementAdd": 80
        }
      ],
      "gl": [
        {
          "level": 1,
          "elementAdd": 60
        },
        {
          "level": 2,
          "elementAdd": 70
        },
        {
          "level": 3,
          "elementAdd": 80
        }
      ],
      "sa": [
        {
          "level": 1,
          "elementAdd": 60
        },
        {
          "level": 2,
          "elementAdd": 70
        },
        {
          "level": 3,
          "elementAdd": 80
        }
      ],
      "cb": [
        {
          "level": 1,
          "elementAdd": 60
        },
        {
          "level": 2,
          "elementAdd": 70
        },
        {
          "level": 3,
          "elementAdd": 80
        }
      ],
      "ig": [
        {
          "level": 1,
          "elementAdd": 60
        },
        {
          "level": 2,
          "elementAdd": 70
        },
        {
          "level": 3,
          "elementAdd": 80
        }
      ],
      "db": [
        {
          "level": 1,
          "elementAdd": 50
        },
        {
          "level": 2,
          "elementAdd": 60
        },
        {
          "level": 3,
          "elementAdd": 70
        }
      ],
      "bow": [
        {
          "level": 1,
          "elementAdd": 50
        },
        {
          "level": 2,
          "elementAdd": 60
        },
        {
          "level": 3,
          "elementAdd": 70
        }
      ],
      "lbg": [
        {
          "level": 1,
          "elementAdd": 12
        },
        {
          "level": 2,
          "elementAdd": 18
        },
        {
          "level": 3,
          "elementAdd": 24
        }
      ],
      "hbg": [
        {
          "level": 1,
          "elementAdd": 12
        },
        {
          "level": 2,
          "elementAdd": 18
        },
        {
          "level": 3,
          "elementAdd": 24
        }
      ]
    }
  },
  {
    "id": "evade_window",
    "name": "回避性能",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 5,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      },
      {
        "level": 4
      },
      {
        "level": 5
      }
    ]
  },
  {
    "id": "evade_extender",
    "name": "回避距離UP",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "earplugs",
    "name": "耳栓",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "quick_sheath",
    "name": "納刀術",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "windproof",
    "name": "風圧耐性",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "tremor_resistance",
    "name": "耐震",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "flinch_free",
    "name": "ひるみ軽減",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "intimidation",
    "name": "威嚇",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "speed_eating",
    "name": "早食い",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "water_mud_adapt",
    "name": "水場・油泥適応",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 2,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      }
    ]
  },
  {
    "id": "leap_of_faith",
    "name": "飛び込み",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "jump_master",
    "name": "ジャンプ鉄人",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "climber",
    "name": "クライマー",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "wide_range",
    "name": "広域化",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 5,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      },
      {
        "level": 4
      },
      {
        "level": 5
      }
    ]
  },
  {
    "id": "tool_specialist",
    "name": "整備",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 5,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      },
      {
        "level": 4
      },
      {
        "level": 5
      }
    ]
  },
  {
    "id": "bombardier",
    "name": "ボマー",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "mushroom_mancer",
    "name": "キノコ大好き",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "item_prolonger",
    "name": "アイテム使用強化",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "free_meal",
    "name": "満足感",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "flash_boost",
    "name": "閃光強化",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "botanist",
    "name": "植生学",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 4,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      },
      {
        "level": 4
      }
    ]
  },
  {
    "id": "geologists",
    "name": "地質学",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_4e9fb9",
    "name": "昆虫標本の達人",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_1934d2",
    "name": "ハンター生活",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "power_proud",
    "name": "闢獣の力",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 2,
        "attackAdd": 10
      },
      {
        "level": 4,
        "attackAdd": 25
      }
    ]
  },
  {
    "id": "scorching",
    "name": "火竜の力",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "灼熱化Ⅰ"
      },
      {
        "level": 2,
        "name": "灼熱化Ⅱ"
      }
    ]
  },
  {
    "id": "bold_table",
    "name": "暗器蛸の力",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 2,
        "attackAdd": 15
      },
      {
        "level": 4,
        "attackAdd": 30
      }
    ]
  },
  {
    "id": "unblemished_armor",
    "name": "鎧竜の守護",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "無傷の重装Ⅰ"
      },
      {
        "level": 2,
        "name": "無傷の重装Ⅱ"
      }
    ]
  },
  {
    "id": "war_cry_series",
    "name": "雪獅子の闘志",
    "mainCategory": "series",
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "ウォークライⅠ"
      },
      {
        "level": 2,
        "name": "ウォークライⅡ"
      }
    ]
  },
  {
    "id": "burst_boost",
    "name": "兇爪竜の力",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 2,
        "attackAdd": 8
      },
      {
        "level": 4,
        "attackAdd": 18
      }
    ]
  },
  {
    "id": "infinite_supply",
    "name": "雷顎竜の闘志",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "無尽蔵Ⅰ"
      },
      {
        "level": 2,
        "name": "無尽蔵Ⅱ"
      }
    ]
  },
  {
    "id": "guard_of_protection",
    "name": "波衣竜の守護",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "守護のヴェールⅠ"
      },
      {
        "level": 2,
        "name": "守護のヴェールⅡ"
      }
    ]
  },
  {
    "id": "thunderous_resonance",
    "name": "煌雷竜の力",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "雷々響鳴Ⅰ"
      },
      {
        "level": 2,
        "name": "雷々響鳴Ⅱ"
      }
    ]
  },
  {
    "id": "hell_octopus_rebellion",
    "name": "獄焔蛸の反逆",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "恨撃Ⅰ",
        "attackAdd": 10
      },
      {
        "level": 2,
        "name": "恨撃Ⅱ",
        "attackAdd": 25
      }
    ]
  },
  {
    "id": "restraint_counter",
    "name": "凍峰竜の反逆",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "束縛反攻Ⅰ"
      },
      {
        "level": 2,
        "name": "束縛反攻Ⅱ"
      }
    ]
  },
  {
    "id": "gore_magala_unity",
    "name": "黒蝕竜の力",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "黒蝕一体Ⅰ",
        "affinity": 15
      },
      {
        "level": 2,
        "name": "黒蝕一体Ⅱ",
        "attackAdd": 15,
        "affinity": 15
      }
    ]
  },
  {
    "id": "hastening_recovery",
    "name": "鎖刃竜の飢餓",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "加速再生Ⅰ"
      },
      {
        "level": 2,
        "name": "加速再生Ⅱ"
      }
    ]
  },
  {
    "id": "destruction_impulse",
    "name": "護鎖刃竜の命脈",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "破壊衝動Ⅰ"
      },
      {
        "level": 2,
        "name": "破壊衝動Ⅱ"
      }
    ]
  },
  {
    "id": "bubbly_dance",
    "name": "泡狐竜の力",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "泡沫の舞Ⅰ"
      },
      {
        "level": 2,
        "name": "泡沫の舞Ⅱ"
      }
    ]
  },
  {
    "id": "super_recovery",
    "name": "白熾龍の脈動",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "超回復力Ⅰ"
      },
      {
        "level": 2,
        "name": "超回復力Ⅱ"
      }
    ]
  },
  {
    "id": "thunder_flash",
    "name": "海竜の渦雷",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "蒼雷一閃Ⅰ",
        "affinity": 15
      },
      {
        "level": 2,
        "name": "蒼雷一閃Ⅱ",
        "affinity": 15
      }
    ]
  },
  {
    "id": "thousand_blade_evasion",
    "name": "千刃竜の闘志",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "千刃の身躱しⅠ"
      },
      {
        "level": 2,
        "name": "千刃の身躱しⅡ",
        "attackMult": 0.04
      }
    ]
  },
  {
    "id": "dark_knight_proof",
    "name": "暗黒騎士の証",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "ダークアーツ"
      },
      {
        "level": 2,
        "name": "ブラックナイト"
      }
    ]
  },
  {
    "id": "omega_resonance",
    "name": "オメガレゾナンス",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "レゾナンスⅠ",
        "attackAdd": 10,
        "affinity": 20
      },
      {
        "level": 2,
        "name": "レゾナンスⅡ",
        "attackAdd": 20,
        "affinity": 40
      }
    ]
  },
  {
    "id": "war_cry",
    "name": "巨戟龍の黙示録",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "宣戦呼応Ⅰ",
        "elementMult": 0.2,
        "elementAdd": 20
      },
      {
        "level": 2,
        "name": "宣戦呼応Ⅱ",
        "elementMult": 0.3,
        "elementAdd": 40
      }
    ]
  },
  {
    "id": "hanamai_prayer",
    "name": "花舞の祈り",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "地の恵み【花舞】Ⅰ"
      },
      {
        "level": 2,
        "name": "地の恵み【花舞】Ⅱ"
      }
    ]
  },
  {
    "id": "odoribi_prayer",
    "name": "踊火の祈り",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "地の恵み【踊火】Ⅰ"
      },
      {
        "level": 2,
        "name": "地の恵み【踊火】Ⅱ"
      }
    ]
  },
  {
    "id": "yumetomoshibi_prayer",
    "name": "夢灯の祈り",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "地の恵み【夢灯】Ⅰ"
      },
      {
        "level": 2,
        "name": "地の恵み【夢灯】Ⅱ"
      }
    ]
  },
  {
    "id": "iwaiuta_prayer",
    "name": "祝謡の祈り",
    "mainCategory": "series",
    "subCategory": null,
    "maxLevel": 2,
    "effects": [
      {
        "level": 1,
        "name": "地の恵み【祝謡】Ⅰ"
      },
      {
        "level": 2,
        "name": "地の恵み【祝謡】Ⅱ"
      }
    ]
  },
  {
    "id": "skill_77632c",
    "name": "祝祭の巡り",
    "mainCategory": "group",
    "subCategory": null,
    "isGroupSkill": true,
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "name": "剥ぎ取り名人"
      }
    ]
  },
  {
    "id": "skill_fa3242",
    "name": "栄光の誉れ",
    "mainCategory": "group",
    "subCategory": null,
    "isGroupSkill": true,
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "name": "幸運"
      }
    ]
  },
  {
    "id": "skill_5c31ac",
    "name": "甲虫の知らせ",
    "mainCategory": "group",
    "subCategory": null,
    "isGroupSkill": true,
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "name": "ハニーハンター"
      }
    ]
  },
  {
    "id": "skill_2f0afd",
    "name": "甲虫の擬態",
    "mainCategory": "group",
    "subCategory": null,
    "isGroupSkill": true,
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "name": "忍び歩き"
      }
    ]
  },
  {
    "id": "skill_3b29da",
    "name": "鱗張りの技法",
    "mainCategory": "group",
    "subCategory": null,
    "isGroupSkill": true,
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "name": "乗り名人"
      }
    ]
  },
  {
    "id": "skill_24d29f",
    "name": "鱗重ねの工夫",
    "mainCategory": "group",
    "subCategory": null,
    "isGroupSkill": true,
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "name": "奮起"
      }
    ]
  },
  {
    "id": "skill_eddf91",
    "name": "革細工の柔性",
    "mainCategory": "group",
    "subCategory": null,
    "isGroupSkill": true,
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "name": "採集の達人"
      }
    ]
  },
  {
    "id": "skill_c8ca9c",
    "name": "革細工の滑性",
    "mainCategory": "group",
    "subCategory": null,
    "isGroupSkill": true,
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "name": "滑走強化"
      }
    ]
  },
  {
    "id": "skill_fe1dee",
    "name": "毛皮の昂揚",
    "mainCategory": "group",
    "subCategory": null,
    "isGroupSkill": true,
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "name": "不屈",
        "attackMult": 0.1
      }
    ]
  },
  {
    "id": "skill_a294f5",
    "name": "毛皮の誘惑",
    "mainCategory": "group",
    "subCategory": null,
    "isGroupSkill": true,
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "name": "陽動"
      }
    ]
  },
  {
    "id": "skill_a1f79a",
    "name": "ヌシの誇り",
    "mainCategory": "group",
    "subCategory": null,
    "isGroupSkill": true,
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "name": "激励",
        "attackAdd": 10
      }
    ]
  },
  {
    "id": "skill_457ea9",
    "name": "ヌシの憤激",
    "mainCategory": "group",
    "subCategory": null,
    "isGroupSkill": true,
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "name": "死中に活",
        "attackAdd": 10
      }
    ]
  },
  {
    "id": "skill_d84e52",
    "name": "ヌシの魂",
    "mainCategory": "group",
    "subCategory": null,
    "isGroupSkill": true,
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "name": "根性【果敢】",
        "attackMult": 0.05
      }
    ]
  },
  {
    "id": "skill_6edf87",
    "name": "護竜の脈動",
    "mainCategory": "group",
    "subCategory": null,
    "isGroupSkill": true,
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "name": "竜乳活性"
      }
    ]
  },
  {
    "id": "skill_d5a82d",
    "name": "護竜の守り",
    "mainCategory": "group",
    "subCategory": null,
    "isGroupSkill": true,
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "name": "竜都の護り"
      }
    ]
  },
  {
    "id": "skill_c5cd72",
    "name": "先達の導き",
    "mainCategory": "group",
    "subCategory": null,
    "isGroupSkill": true,
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "name": "探索者の幸運"
      }
    ]
  },
  {
    "id": "skill_4a6f01",
    "name": "拳を極めし者",
    "mainCategory": "group",
    "subCategory": null,
    "isGroupSkill": true,
    "maxLevel": 1,
    "effects": [
      {
        "level": 1,
        "name": "殺意の波動",
        "attackMult": 0.05
      }
    ]
  },
  {
    "id": "skill_q0e2ai",
    "name": "攻めの守勢",
    "mainCategory": "weapon",
    "subCategory": "attack",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1,
        "attackMult": 0.05
      },
      {
        "level": 2,
        "attackMult": 0.1
      },
      {
        "level": 3,
        "attackMult": 0.15
      }
    ]
  },
  {
    "id": "skill_wr8tm0",
    "name": "毒属性強化",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_3rfp89",
    "name": "麻痺属性強化",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_4szm0x",
    "name": "睡眠属性強化",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_9q3a1b",
    "name": "爆破属性強化",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_toqjqs",
    "name": "会心撃【特殊】",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_2utnlo",
    "name": "チャージマスター",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "weaponSpecific": true,
    "weaponEffects": {
      "gs": [
        {
          "level": 1,
          "elementMult": 0.15
        },
        {
          "level": 2,
          "elementMult": 0.2
        },
        {
          "level": 3,
          "elementMult": 0.25
        }
      ],
      "ls": [
        {
          "level": 1,
          "elementMult": 0.15
        },
        {
          "level": 2,
          "elementMult": 0.2
        },
        {
          "level": 3,
          "elementMult": 0.25
        }
      ],
      "sns": [
        {
          "level": 1,
          "elementMult": 0.15
        },
        {
          "level": 2,
          "elementMult": 0.2
        },
        {
          "level": 3,
          "elementMult": 0.25
        }
      ],
      "hammer": [
        {
          "level": 1,
          "elementMult": 0.15
        },
        {
          "level": 2,
          "elementMult": 0.2
        },
        {
          "level": 3,
          "elementMult": 0.25
        }
      ],
      "lance": [
        {
          "level": 1,
          "elementMult": 0.15
        },
        {
          "level": 2,
          "elementMult": 0.2
        },
        {
          "level": 3,
          "elementMult": 0.25
        }
      ],
      "cb": [
        {
          "level": 1,
          "elementMult": 0.15
        },
        {
          "level": 2,
          "elementMult": 0.2
        },
        {
          "level": 3,
          "elementMult": 0.25
        }
      ],
      "ig": [
        {
          "level": 1,
          "elementMult": 0.15
        },
        {
          "level": 2,
          "elementMult": 0.2
        },
        {
          "level": 3,
          "elementMult": 0.25
        }
      ],
      "bow": [
        {
          "level": 1,
          "elementMult": 0.05
        },
        {
          "level": 2,
          "elementMult": 0.1
        },
        {
          "level": 3,
          "elementMult": 0.15
        }
      ]
    }
  },
  {
    "id": "skill_0dx43n",
    "name": "匠",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 5,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      },
      {
        "level": 4
      },
      {
        "level": 5
      }
    ]
  },
  {
    "id": "skill_qaynjd",
    "name": "業物",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_phcqqc",
    "name": "剛刃研磨",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "minds_eye",
    "name": "心眼",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_ex0i8v",
    "name": "鈍器使い",
    "mainCategory": "weapon",
    "subCategory": "attack",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1,
        "attackMult": 0.05
      },
      {
        "level": 2,
        "attackMult": 0.1
      },
      {
        "level": 3,
        "attackMult": 0.1
      }
    ]
  },
  {
    "id": "skill_fzddcu",
    "name": "特殊射撃強化",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 2,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      }
    ]
  },
  {
    "id": "skill_yejpyx",
    "name": "集中",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_3ule3z",
    "name": "抜刀術【力】",
    "mainCategory": "weapon",
    "subCategory": "attack",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1,
        "attackAdd": 3
      },
      {
        "level": 2,
        "attackAdd": 5
      },
      {
        "level": 3,
        "attackAdd": 7
      }
    ]
  },
  {
    "id": "skill_jdwwu9",
    "name": "ＫＯ術",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_z2iu5e",
    "name": "砲術",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_y6j609",
    "name": "高速変形",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_9c8y5r",
    "name": "ガード性能",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_rg59ag",
    "name": "防御",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 7,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      },
      {
        "level": 4
      },
      {
        "level": 5
      },
      {
        "level": 6
      },
      {
        "level": 7
      }
    ]
  },
  {
    "id": "skill_7lihg8",
    "name": "達人芸",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_a7c99l",
    "name": "弾導強化",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_67k7g7",
    "name": "毒ビン追加",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_5ff5pc",
    "name": "麻痺ビン追加",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_vpn7k3",
    "name": "睡眠ビン追加",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_pfngiv",
    "name": "爆破ビン追加",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_s93zgn",
    "name": "減気ビン追加",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_2kssqf",
    "name": "強化持続",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_r5b46j",
    "name": "スタミナ奪取",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_1r13b2",
    "name": "笛吹き名人",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 2,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      }
    ]
  },
  {
    "id": "skill_8lo3n1",
    "name": "溜打強化",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_ntj9eh",
    "name": "毒ダメージ強化",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_dbci18",
    "name": "ガード強化",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_r3dwsk",
    "name": "砲弾装填",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 2,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      }
    ]
  },
  {
    "id": "skill_27g21i",
    "name": "砥石使用高速化",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 2,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      }
    ]
  },
  {
    "id": "skill_4cs9xw",
    "name": "濡れ刃紋",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_t4g64d",
    "name": "白熾の奔流",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_os84gu",
    "name": "耐性変換【雷】",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_bbsnq2",
    "name": "刃鱗研装",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_lo14hm",
    "name": "刃鱗増装",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_tq3xtv",
    "name": "パワーストーン",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_kdmk4s",
    "name": "焼き砲モロコシ",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_8k1cyt",
    "name": "炎の料理人",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_vbzhp5",
    "name": "回避装填",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_0z3iok",
    "name": "暗黒",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_bj2xfz",
    "name": "シールドオプション",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_tagxus",
    "name": "連携プログラム",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_9sybh3",
    "name": "にゃんにゃんぼう",
    "mainCategory": "weapon",
    "subCategory": "utility",
    "maxLevel": 0,
    "effects": []
  },
  {
    "id": "skill_cu2wsq",
    "name": "防御力ＤＯＷＮ耐性",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1,
        "attackAdd": 50
      },
      {
        "level": 2,
        "attackAdd": 25
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_6m58jj",
    "name": "研鑽",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  },
  {
    "id": "skill_sayel1",
    "name": "回避距離ＵＰ",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 3,
    "effects": [
      {
        "level": 1
      },
      {
        "level": 2
      },
      {
        "level": 3
      }
    ]
  },
  {
    "id": "skill_p0c2wx",
    "name": "緩衝",
    "mainCategory": "armor",
    "subCategory": "utility",
    "maxLevel": 1,
    "effects": [
      {
        "level": 1
      }
    ]
  }
];
