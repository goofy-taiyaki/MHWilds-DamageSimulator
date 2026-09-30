// Analyze each detected pattern independently; suggestions are not simultaneous.
export function remainingPatternSlots(r, weaponSlots) {
    const slots = [];
    [r.h, r.c, r.a, r.w, r.l].forEach((item, piece) => {
        (item.slots || []).forEach(s => {
            const lvl = typeof s === 'number' ? s : s.lvl;
            if (lvl > 0) slots.push({piece, lvl, type: 'a'});
        });
    });
    weaponSlots.forEach(lvl => { if (lvl > 0) slots.push({piece: 'weapon', lvl, type: 'w'}); });
    (r.t.slots || []).forEach(s => {
        const lvl = typeof s === 'number' ? s : s.lvl;
        if (lvl > 0) slots.push({piece: 'talisman', lvl, type: s.type || 'a'});
    });
    // Smallest fitting slot in the assigned piece preserves larger free slots.
    const used = [...r.assignment.decos].sort((a,b) => b.deco.lvl - a.deco.lvl);
    for (const d of used) {
        let best = -1;
        slots.forEach((s,i) => {
            if (s.piece === d.piece && s.type === d.deco.type && s.lvl >= d.deco.lvl &&
                (best < 0 || s.lvl < slots[best].lvl)) best = i;
        });
        if (best < 0) throw new Error('装飾品とスロットの対応を確認できません。');
        slots.splice(best,1);
    }
    return slots;
}

export function analyzePatterns(patterns, target, skills, decorations, weaponSlots, getLevels) {
    const existing = new Map(), addable = new Map();
    const eligible = skills.filter(s => !s.name.includes('オメガ'));
    const choicesByName = new Map();
    decorations.forEach(deco => deco.sk?.forEach(effect => {
        const choices = choicesByName.get(effect.n) || [];
        choices.push(deco); choicesByName.set(effect.n, choices);
    }));
    patterns.forEach((r, patternIndex) => {
        const levels = getLevels(r);
        const slots = remainingPatternSlots(r, weaponSlots);
        for (const skill of eligible) {
            const current = levels[skill.id] || 0;
            const requested = target[skill.id] || 0;
            if (current > requested) {
                const old = existing.get(skill.id);
                existing.set(skill.id, {skill, count:(old?.count || 0)+1,
                    level:Math.max(old?.level || 0,current),
                    patternIndex:current >= (old?.level || 0) ? patternIndex : old.patternIndex});
            }
            if (!['weapon','armor'].includes(skill.mainCategory) || current >= skill.maxLevel) continue;
            const choices = choicesByName.get(skill.name) || [];
            let gain = 0;
            const extra = [];
            for (const slot of slots) {
                let best = null, points = 0;
                for (const deco of choices) {
                    if (deco.t !== slot.type || deco.sl > slot.lvl) continue;
                    const value = deco.sk.filter(s=>s.n===skill.name).reduce((sum,s)=>sum+s.l,0);
                    if (value > points) {best = deco; points = value;}
                }
                if (best && current + gain < skill.maxLevel) {
                    gain += points;
                    extra.push({piece:slot.piece,deco:{...best,name:best.n,lvl:best.sl,type:best.t}});
                }
            }
            if (!gain) continue;
            const level = Math.min(skill.maxLevel,current+gain);
            const old = addable.get(skill.id);
            const best = !old || level > old.level;
            addable.set(skill.id,{skill,count:(old?.count || 0)+1,
                level:Math.max(old?.level || 0,level),
                current:best ? current : old.current,
                patternIndex:best ? patternIndex : old.patternIndex,
                extra:best ? extra : old.extra});
        }
    });
    return {existing:[...existing.values()],addable:[...addable.values()]};
}
