import json
import re

# Load existing skills
existing_file = r'e:\Users\tai_r\Documents\AI\mhwilds-site\js\data\skills.js'
with open(existing_file, 'r', encoding='utf-8') as f:
    text = f.read()
    # Remove 'export const SKILLS = ' and final ';'
    text = re.sub(r'^export const SKILLS = ', '', text.strip(), flags=re.MULTILINE)
    text = re.sub(r';$', '', text.strip())
    existing_skills = json.loads(text)

# Load new skills from scratchpad
new_file = r'C:\Users\tai_r\.gemini\antigravity\brain\8cffc39f-96aa-4c46-b045-98c43a564a63\browser\scratchpad_lc5b48o4.md'
with open(new_file, 'r', encoding='utf-8') as f:
    new_skills_raw = json.load(f)

# Helper to generate ID
def generate_id(name):
    # This is a bit arbitrary but works for missing IDs
    return "skill_" + name.encode('utf-8').hex()[:8]

# Skills to categories mapping (based on subagent's categorization if available)
# If new_skills has 'category' field, use it.

# Mapping of names to existing skills
name_to_existing = {s['name']: s for s in existing_skills}

# Damage fields to keep
DAMAGE_FIELDS = ['attackAdd', 'attackMult', 'affinity', 'elementAdd', 'elementMult', 'critMultAdd', 'elementCritMult', 'criticalDamageMult']

final_skills = []

# To keep the order, I'll first process existing skills and then add new ones
processed_names = set()

for s in existing_skills:
    name = s['name']
    if name in [ns['name'] for ns in new_skills_raw]:
        new_s = next(ns for ns in new_skills_raw if ns['name'] == name)
        # Update existing skill
        s['maxLevel'] = new_s.get('maxLevel', s['maxLevel'])
        
        # Merge effects
        new_levels = new_s.get('levels', [])
        # If the original has weaponSpecific, keep it special
        if s.get('weaponSpecific'):
            # Just keep original for now as it's more detailed than Kiranico summary
            pass
        else:
            # Reconstruct effects from new levels
            new_effects = []
            for nl in new_levels:
                lvl_str = nl['level']
                lvl_int = int(re.search(r'\d+', lvl_str).group())
                
                effect = {"level": lvl_int}
                # Copy damage fields
                for fld in DAMAGE_FIELDS:
                    if fld in nl:
                        effect[fld] = nl[fld]
                # Special case: criticalDamageMult -> critMultAdd (relative to 1.25)
                if 'criticalDamageMult' in nl:
                    effect['critMultAdd'] = round(nl['criticalDamageMult'] - 1.25, 3)
                
                new_effects.append(effect)
            s['effects'] = new_effects
        
        final_skills.append(s)
        processed_names.add(name)
    else:
        # Keep as is
        final_skills.append(s)
        processed_names.add(name)

# Add new skills
for ns in new_skills_raw:
    name = ns['name']
    if name not in processed_names:
        new_id = generate_id(name)
        new_effects = []
        for nl in ns['levels']:
            lvl_str = nl['level']
            lvl_int = int(re.search(r'\d+', lvl_str).group())
            effect = {"level": lvl_int}
            for fld in DAMAGE_FIELDS:
                if fld in nl:
                    effect[fld] = nl[fld]
            if 'criticalDamageMult' in nl:
                effect['critMultAdd'] = round(nl['criticalDamageMult'] - 1.25, 3)
            new_effects.append(effect)
        
        s = {
            "id": new_id,
            "name": name,
            "mainCategory": ns.get("category", "armor"),
            "subCategory": "utility", # default
            "maxLevel": ns["maxLevel"],
            "effects": new_effects
        }
        final_skills.append(s)

# Output
with open(r'e:\Users\tai_r\Documents\AI\mhwilds-site\js\data\skills_merged.js', 'w', encoding='utf-8') as f:
    f.write('export const SKILLS = ')
    json.dump(final_skills, f, ensure_ascii=False, indent=2)
    f.write(';')

print(f"Successfully merged. Total skills: {len(final_skills)}")

