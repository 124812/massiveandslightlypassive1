import json

with open('strategy.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

changed = []

def fix_cell(cells, idx, old, new):
    source = cells[idx]['source']
    text = ''.join(source)
    if old not in text:
        print(f'  WARNING: pattern not found in cell {idx}: {repr(old[:80])}')
        return False
    new_text = text.replace(old, new, 1)
    if new_text != text:
        cells[idx]['source'] = [new_text]
        return True
    return False

# Cell 21: fix max_loss_1x for covered call
# For covered call: max loss = stock goes to 0, lose S_e but keep premium
# Per $1 spot: -1.0 + premium
fix_cell(nb['cells'], 21,
    '"max_loss_1x"] = -exp_rows["premium"] - (1 - exp_rows["S_entry"] / exp_rows["S_entry"])  # max loss ≈ -premium when stock goes to 0',
    '"max_loss_1x"] = exp_rows["premium"] - 1.0  # covered call max loss: stock to 0 minus premium collected')

with open('strategy.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)

print('Fixed max_loss_1x formula')
