#!/usr/bin/env python3
"""
Manual check of questions that need careful verification
"""
import json

with open('/Users/bee/Documents/Bông/bong-toan-lop-1/data/questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

questions = data['questions']

# List of questions to manually check
problem_ids = [
    'sub-022', 'sub-023', 'sub-025', 'sub-029', 'sub-031', 'sub-032', 'sub-033', 'sub-034',
    'fill-002', 'fill-004', 'fill-011', 'fill-012', 'fill-013', 'fill-014', 'fill-017', 'fill-018', 'fill-019', 'fill-020',
    'money-004', 'money-010', 'length-009'
]

print("Manual verification of problematic questions:\n")
print("=" * 100)

for q in questions:
    if q['id'] in problem_ids:
        print(f"\nID: {q['id']}")
        print(f"Type: {q['type']}")
        print(f"Question: {q['question']}")
        print(f"Options: {q['options']}")
        print(f"Current Answer (index {q['correctAnswer']}): {q['options'][int(q['correctAnswer'])]}")

        # Manual calculation
        if q['type'] == 'subtraction':
            match = q['question'].split(' - ')
            if len(match) == 2:
                a = int(match[0])
                b = int(match[1].replace(' = ?', ''))
                result = a - b
                correct_idx = q['options'].index(str(result))
                print(f"Calculation: {a} - {b} = {result}")
                print(f"Correct Answer (index {correct_idx}): {q['options'][correct_idx]}")

        elif q['type'] == 'fill-blank':
            # Various patterns
            if '?' in q['question'] and '=' in q['question']:
                parts = q['question'].split('=')
                left = parts[0].strip()
                right = int(parts[1].strip())

                # Test each option
                for i, opt in enumerate(q['options']):
                    test_expr = left.replace('?', opt)
                    try:
                        if eval(test_expr) == right:
                            print(f"Correct Answer (index {i}): {q['options'][i]}")
                            break
                    except:
                        pass

        elif q['type'] == 'money':
            # Parse the question
            if 'giá' in q['question'] and 'bao nhiêu' in q['question']:
                # Price calculation: X đồng for 1 item, Y items cost?
                import re
                match = re.search(r'(\d+)\s*đồng.*?(\d+)\s*(?:quyển|gói|bút|quả)', q['question'])
                if match:
                    price = int(match.group(1))
                    quantity = int(match.group(2))
                    result = price * quantity
                    for i, opt in enumerate(q['options']):
                        if str(result) in opt:
                            print(f"Calculation: {price} × {quantity} = {result}")
                            print(f"Correct Answer (index {i}): {q['options'][i]}")
                            break

        print("-" * 100)
