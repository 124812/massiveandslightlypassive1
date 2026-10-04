import json

with open('strategy.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Find apply_cashout_exits and check for otm references
for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code':
        text = ''.join(cell['source'])
        if 'apply_cashout_exits' in text:
            print(f'Cell {i}: apply_cashout_exits')
            for line in text.split('\n'):
                if 'otm' in line.lower():
                    print(f'  {line}')
