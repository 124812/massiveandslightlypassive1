import json

with open('strategy.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

issues = []

for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] != 'code':
        continue
    text = ''.join(cell['source'])
    
    if 'return priced' in text and 'full-text screen' in text:
        issues.append(f'Cell {i}: dead code after return still present')
    if 'contract_type == "put"' in text:
        issues.append(f'Cell {i}: still filtering puts in pick_expiries')
    if 'otm_pcts' in text:
        issues.append(f'Cell {i}: otm_pcts still present')
    if 'INVERT_TO_BEAR' in text:
        issues.append(f'Cell {i}: INVERT_TO_BEAR still present')
    if 'RUN_HOLDOUT' in text:
        issues.append(f'Cell {i}: RUN_HOLDOUT still present')
    if 'def session_before' in text and 'max(idx, 0)' not in text:
        issues.append(f'Cell {i}: session_before bounds not fixed')
    if 'max_loss": -m_pre["short_call"]' in text:
        issues.append(f'Cell {i}: max_loss formula not fixed')
    if 'at least two puts' in text:
        issues.append(f'Cell {i}: docstring still says puts')

if issues:
    print('Remaining issues:')
    for issue in issues:
        print(f'  - {issue}')
else:
    print('All checks passed!')

print('\nVerification of fixes:')
for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code':
        text = ''.join(cell['source'])
        if 'contract_type == "call"' in text and 'pick_expiries' in text:
            print(f'  Cell {i}: pick_expiries correctly filters calls')
        if 'max_loss": -pe.spot_pre + m_pre' in text:
            print(f'  Cell {i}: max_loss formula fixed')
        if 'def session_before' in text and 'max(idx, 0)' in text:
            print(f'  Cell {i}: session_before bounds fixed')
        if 'contract_type == "put"' in text:
            print(f'  Cell {i}: WARNING - still has puts filter')
        if 'otm_pcts' in text:
            print(f'  Cell {i}: WARNING - still has otm_pcts')
