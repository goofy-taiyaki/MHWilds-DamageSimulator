import { WEAPON_TYPES } from '../data/weapons.js';
import { RESTORATION_PARTS, RESTORATION_BONUSES, EXCITATION_DATA } from '../data/mechanics.js';

export { WEAPON_TYPES };
export const PARTS = RESTORATION_PARTS;
// Em0078 grinding limits, ArtianBonusData patch_012. Rejected / tier I unavailable entries excluded.
export const BONUSES = RESTORATION_BONUSES.filter(b=>['none','atk_2','atk_3','atk_ex','aff_2','aff_3','aff_ex','elem_2','elem_ex','sharp_load','sharp_load_ex'].includes(b.id));
export const EXCITATIONS = [{id:'attack',name:'攻撃激化'},{id:'affinity',name:'会心激化'},{id:'element',name:'属性激化'}];
export function weaponConfigurations(settings) {
    if(!WEAPON_TYPES.some(w=>w.id===settings.weaponTypeId))throw new Error('武器種を選択してください。');
    const partOptions= settings.parts.map(id=>id==='auto'?PARTS.filter(p=>p.id!=='none'):PARTS.filter(p=>p.id===id));
    // Other bonuses add no single-hit raw attack/affinity; EX attack dominates those in automatic frames.
    const bonusOptions=settings.bonuses.map(id=>id==='auto'?BONUSES.filter(b=>['atk_ex','aff_ex'].includes(b.id)):BONUSES.filter(b=>b.id===id));
    const excitations=settings.excitation==='auto'?EXCITATIONS:EXCITATIONS.filter(e=>e.id===settings.excitation);
    if(settings.parts.length!==3||settings.bonuses.length!==5||[...partOptions,...bonusOptions].some(o=>!o.length)||!excitations.length)throw new Error('強化枠の設定を確認してください。');
    const result=new Map();
    function product(options,callback,path=[],index=0){
        if(index===options.length){callback(path);return;}
        for(const value of options[index])product(options,callback,[...path,value],index+1);
    }
    for(const e of excitations)product(partOptions,parts=>product(bonusOptions,bonuses=>{
        if(bonuses.filter(b=>b.group==='sharp_load').length>2||bonuses.filter(b=>b.group==='elem').length>4)return;
        const excitation=EXCITATION_DATA[settings.weaponTypeId][e.id];
        const attack=190+excitation.attack+parts.reduce((n,p)=>n+(p.attack||0),0)+bonuses.reduce((n,b)=>n+(b.attack||0),0);
        const affinity=5+excitation.affinity+parts.reduce((n,p)=>n+(p.affinity||0),0)+bonuses.reduce((n,b)=>n+(b.affinity||0),0);
        const key=attack+','+affinity;
        if(!result.has(key))result.set(key,{weaponTypeId:settings.weaponTypeId,excitationType:e.id,parts:parts.map(p=>p.id),bonuses:bonuses.map(b=>b.id),attack,affinity});
    }));
    if(!result.size)throw new Error('切れ味・装填は最大2枠、属性は最大4枠です。固定枠を見直してください。');
    return [...result.values()];
}
export function skillEffect(skill,points,weaponTypeId){
    if(!points)return null;
    const ranged=['lbg','hbg','bow'].includes(weaponTypeId);
    if(['force_shot','first_shot','rapid_fire_up_lbg'].includes(skill.id)&&!['lbg','hbg'].includes(weaponTypeId))return null;
    if(['normal_up','pierce_up','spread_up','skill_fzddcu'].includes(skill.id)&&!ranged)return null;
    if(['airborne','critical_draw','skill_3ule3z'].includes(skill.id)&&['lbg','hbg'].includes(weaponTypeId))return null;
    if(skill.id==='skill_y6j609'&&!['sa','cb'].includes(weaponTypeId))return null;
    const level=skill.mainCategory==='series'?(points>=4?2:points>=2?1:0):skill.mainCategory==='group'?(points>=3?1:0):Math.min(points,skill.maxLevel);
    return (skill.weaponSpecific?skill.weaponEffects?.[weaponTypeId]:skill.effects)?.find(e=>e.level===level)||null;
}
const physical=e=>e&&(e.attackAdd||e.atkAdd||e.attackMult||e.affinity||e.critMultAdd);
export function createWeaponEvaluator(settings,skills){
    const configurations=weaponConfigurations(settings),cache=new Map(),upperCache=new Map();
    const relevant=skills.filter(s=>{
        if(s.mainCategory==='series'||s.mainCategory==='group')return (s.effects||[]).some(physical);
        return Array.from({length:s.maxLevel},(_,i)=>skillEffect(s,i+1,settings.weaponTypeId)).some(physical);
    });
    function combine(effects){
        let add=0,mult=1,aff=0,crit=1.25;
        for(const e of effects){if(!e)continue;add+=(e.attackAdd||0)+(e.atkAdd||0);mult*=1+(e.attackMult||0);aff+=e.affinity||0;crit+=e.critMultAdd||0;}
        let best=null;
        for(const weapon of configurations){
            const attack=weapon.attack*mult+add,affinity=weapon.affinity+aff,clamped=Math.min(100,Math.max(-100,affinity));
            const value=attack*(1+clamped/100*(clamped>=0?crit-1:0.25));
            if(!best||value>best.value)best={value,atk:Math.floor(attack),aff:affinity,weapon};
        }
        return best;
    }
    const evaluate=points=>{
        const key=relevant.map(s=>points[s.id]||0).join(',');
        if(!cache.has(key))cache.set(key,combine(relevant.map(s=>skillEffect(s,points[s.id]||0,settings.weaponTypeId))));
        return cache.get(key);
    };
    const upperBound=(points,remaining)=>{
        const bounds=relevant.map(s=>{const cap=s.mainCategory==='series'?4:s.mainCategory==='group'?3:s.maxLevel;return [Math.min(points[s.id]||0,cap),Math.min((points[s.id]||0)+(remaining[s.id]||0),cap)];});
        const key=JSON.stringify(bounds);
        if(!upperCache.has(key))upperCache.set(key,combine(relevant.map((s,i)=>{
            const best={};for(let n=bounds[i][0];n<=bounds[i][1];n++){
                const e=skillEffect(s,n,settings.weaponTypeId)||{};
                for(const k of ['attackAdd','atkAdd','attackMult','affinity','critMultAdd'])best[k]=Math.max(best[k]||0,e[k]||0);
            }return best;
        })).value);
        return upperCache.get(key);
    };
    return {evaluate,upperBound,scoreSkillIds:relevant.map(s=>s.id),configurationCount:configurations.length};
}
export function describeWeapon(w){
    return `${WEAPON_TYPES.find(t=>t.id===w.weaponTypeId)?.name}・${EXCITATIONS.find(e=>e.id===w.excitationType)?.name}｜パーツ: ${w.parts.map(id=>PARTS.find(p=>p.id===id)?.name).join(' / ')}｜復元: ${w.bonuses.map(id=>BONUSES.find(b=>b.id===id)?.name).join(' / ')}`;
}
