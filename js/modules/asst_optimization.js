// Pure search core. Evaluation and game constraints are supplied explicitly.
// Completion is part of the result: a budget-limited best is never called a maximum.
// Each skill is maximized independently, so this is a relaxed upper bound, never a feasible assignment.
export function decorationSkillPotential(slots, decorations, nameToId) {
    const result={};
    for(const slot of slots) {
        const maximum={};
        for(const deco of decorations) {
            if((deco.type??deco.t)!==(slot.type||'a') || (deco.lvl??deco.sl)>(slot.lvl??slot))continue;
            const gains={};
            for(const effect of deco.sk||[]) {
                const id=nameToId[effect.n];
                if(id)gains[id]=(gains[id]||0)+effect.l;
            }
            for(const [id,n] of Object.entries(gains))maximum[id]=Math.max(maximum[id]||0,n);
        }
        for(const [id,n] of Object.entries(maximum))result[id]=(result[id]||0)+n;
    }
    return result;
}

export function categoryRequirementFits(current, item, target, ids, remaining, automatic) {
    const missing=ids.reduce((sum,id)=>sum+Math.max(0,target[id]-(current[id]||0)-(item[id]||0)),0);
    return missing<=remaining+(automatic?1:0);
}

export function enumerateArtiaConfigurations({excitations, parts, bonuses, maxCopies, categoryLimits={}, categoryFor={}}) {
    const limit = id => typeof maxCopies === 'number' ? maxCopies : maxCopies?.[id];
    if (bonuses.some(id=>!Number.isInteger(limit(id))||limit(id)<0)) throw new Error('復元ボーナスごとの上限が必要です。');
    const partSets = [], bonusSets = [];
    for (let i=0;i<parts.length;i++) for(let j=i;j<parts.length;j++) for(let k=j;k<parts.length;k++)
        partSets.push([parts[i],parts[j],parts[k]]);
    function fill(combo,index) {
        if(combo.length===5){bonusSets.push([...combo]);return;}
        if(index>=bonuses.length)return;
        const id=bonuses[index],category=categoryFor[id];
        const used=combo.filter(b=>categoryFor[b]===category).length;
        const categoryRemaining=category in categoryLimits ? categoryLimits[category]-used : 5;
        for(let count=0;count<=Math.min(limit(id),categoryRemaining,5-combo.length);count++){
            fill([...combo,...Array(count).fill(bonuses[index])],index+1);
        }
    }
    fill([],0);
    const result=[];
    for(const excitation of excitations) for(const partSet of partSets) for(const bonusSet of bonusSets)
        result.push({excitation,parts:partSet,bonuses:bonusSet});
    return result;
}

function* decorationSearch({slots,basePoints,target,skills,decorations,nameToId,
    scoreSkillIds,evaluate,upperBound,initialAssignment=[],maxNodes=200000}) {
    const relevant=[...new Set([...Object.keys(target),...scoreSkillIds])];
    const skillById=Object.fromEntries(skills.map(s=>[s.id,s]));
    const cap=id=>Math.max(target[id]||0,skillById[id]?.mainCategory==='series'?4:skillById[id]?.mainCategory==='group'?3:skillById[id]?.maxLevel||0);
    const bounded=points=>Object.fromEntries(relevant.map(id=>[id,Math.min(cap(id),points[id]||0)]));
    const candidates=[],unique=new Set();
    for(const raw of decorations){
        const deco={...raw,name:raw.name||raw.n,lvl:raw.lvl??raw.sl,type:raw.type??raw.t};
        const gains={};for(const e of deco.sk||[]){const id=nameToId[e.n];if(id)gains[id]=(gains[id]||0)+e.l;}
        if(!relevant.some(id=>gains[id]>0))continue;
        const key=deco.type+':'+deco.lvl+'|'+relevant.map(id=>gains[id]||0).join(',');
        if(unique.has(key))continue;unique.add(key);candidates.push({deco,gains});
    }
    const add=(points,gains)=>bounded(Object.fromEntries(relevant.map(id=>[id,(points[id]||0)+(gains[id]||0)])));
    const feasible=points=>Object.entries(target).every(([id,n])=>(points[id]||0)>=n);
    const scoreCache=new Map();
    const scored=points=>{
        const key=scoreSkillIds.map(id=>points[id]||0).join(',');
        if(!scoreCache.has(key))scoreCache.set(key,evaluate(points));
        return scoreCache.get(key);
    };
    const ordered=[...slots].sort((a,b)=>a.type.localeCompare(b.type)||a.lvl-b.lvl);
    const potentialCache=new Map();
    const potentials=available=>{
        const key=available.map(s=>s.type+s.lvl).join(',');
        if(!potentialCache.has(key)){
            const gain={};for(const slot of available)for(const id of relevant){
                const max=Math.max(0,...candidates.filter(c=>c.deco.type===slot.type&&c.deco.lvl<=slot.lvl).map(c=>c.gains[id]||0));
                gain[id]=(gain[id]||0)+max;
            }potentialCache.set(key,gain);
        }return potentialCache.get(key);
    };
    let best=null,nodes=0,complete=true;
    const warmSlots=[...ordered];let baseline=bounded(basePoints),validInitial=true;
    for(const a of [...initialAssignment].sort((a,b)=>(b.deco.lvl??b.deco.sl)-(a.deco.lvl??a.deco.sl))){
        const index=warmSlots.findIndex(s=>s.piece===a.piece&&s.type===(a.deco.type??a.deco.t)&&s.lvl>=(a.deco.lvl??a.deco.sl));
        if(index<0){validInitial=false;break;}warmSlots.splice(index,1);
        const gains={};for(const e of a.deco.sk||[]){const id=nameToId[e.n];if(id)gains[id]=(gains[id]||0)+e.l;}
        baseline=add(baseline,gains);
    }
    if(validInitial&&feasible(baseline))best={...scored(baseline),points:baseline,assignment:initialAssignment.map(a=>({...a}))};
    const visited=new Set(),path=[];
    function* visit(points,available){
        if(nodes>=maxNodes){complete=false;return;}nodes++;
        if (nodes % 32 === 0) yield;
        const potential=potentials(available);
        if(Object.entries(target).some(([id,n])=>(points[id]||0)+(potential[id]||0)<n))return;
        if(best&&upperBound&&upperBound(points,potential)<best.value-1e-9)return;
        const key=available.map(s=>s.type+s.lvl).join(',')+'|'+relevant.map(id=>points[id]||0).join(',');
        if(visited.has(key))return;visited.add(key);
        const missing=Object.keys(target).filter(id=>(points[id]||0)<target[id]);
        if(!missing.length){
            const score=scored(points);
            if(!best||score.value>best.value||score.value===best.value&&path.length<best.assignment.length)
                best={...score,points:{...points},assignment:path.map(a=>({...a}))};
        }
        if(!available.length)return;
        const fitting=candidates.filter(c=>available.some(s=>s.type===c.deco.type&&s.lvl>=c.deco.lvl));
        // Branch on a required skill first. Same-type nested slots are interchangeable:
        // moving the covering jewel to the smallest fitting slot preserves every completion.
        const needed=missing.sort((a,b)=>fitting.filter(c=>c.gains[a]>0).length-fitting.filter(c=>c.gains[b]>0).length)[0];
        const options=(needed?fitting.filter(c=>c.gains[needed]>0):fitting.filter(c=>c.deco.type===available[0].type&&c.deco.lvl<=available[0].lvl))
            .map(c=>({...c,next:add(points,c.gains)}))
            .sort((a,b)=>scored(b.next).value-scored(a.next).value);
        for(const c of options){
            if(!complete)return;
            if(relevant.every(id=>c.next[id]===points[id]))continue;
            const index=needed?available.findIndex(s=>s.type===c.deco.type&&s.lvl>=c.deco.lvl):0;
            const nextSlots=[...available],slot=nextSlots.splice(index,1)[0];
            path.push({piece:slot.piece,deco:c.deco});yield* visit(c.next,nextSlots);path.pop();
        }
        if(!needed&&complete)yield* visit(points,available.slice(1));
    }
    yield* visit(bounded(basePoints),ordered);
    return {best,complete,nodes};
}


export function optimizeDecorationAssignment(input) {
    const search=decorationSearch(input);
    let step;
    do { step=search.next(); } while(!step.done);
    return step.value;
}

// Same traversal and node budget as the synchronous core; yield within each pattern.
export async function optimizeDecorationAssignmentAsync(input, {
    isCancelled=()=>false, sliceMs=12, yieldControl=()=>new Promise(resolve=>setTimeout(resolve,0))
}={}) {
    const search=decorationSearch(input);
    while(true) {
        if(isCancelled()) { search.return(); return {best:null,complete:false,cancelled:true}; }
        const start=performance.now();
        let step;
        do {
            step=search.next();
            if(step.done)return step.value;
        } while(performance.now()-start<sliceMs);
        await yieldControl();
    }
}
