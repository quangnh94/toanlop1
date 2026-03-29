#!/usr/bin/env python3
import json
import re

# Read the questions file
with open('/Users/bee/Documents/Bông/bong-toan-lop-1/data/questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

questions = data['questions']
wrong_answers = []

def check_addition(q):
    match = re.search(r'(\d+)\s*\+\s*(\d+)\s*=?', q['question'])
    if match:
        a = int(match.group(1))
        b = int(match.group(2))
        result = a + b
        if str(result) in q['options']:
            return q['options'].index(str(result))
    return None

def check_subtraction(q):
    match = re.search(r'(\d+)\s*-\s*(\d+)\s*=?', q['question'])
    if match:
        a = int(match.group(1))
        b = int(match.group(2))
        result = a - b
        if str(result) in q['options']:
            return q['options'].index(str(result))
    return None

def check_comparison(q):
    match = re.search(r'(\d+)\s*\?\s*(\d+)', q['question'])
    if match:
        a = int(match.group(1))
        b = int(match.group(2))
        if a > b:
            correct_symbol = '>'
        elif a < b:
            correct_symbol = '<'
        else:
            correct_symbol = '='
        if correct_symbol in q['options']:
            return q['options'].index(correct_symbol)
    return None

def check_fill_blank(q):
    # ? + 5 = 8
    match = re.search(r'\?\s*\+\s*(\d+)\s*=\s*(\d+)', q['question'])
    if match:
        b = int(match.group(1))
        result = int(match.group(2))
        answer = result - b
        if str(answer) in q['options']:
            return q['options'].index(str(answer))

    # 10 + ? = 15
    match = re.search(r'(\d+)\s*\+\s*\?\s*=\s*(\d+)', q['question'])
    if match:
        a = int(match.group(1))
        result = int(match.group(2))
        answer = result - a
        if str(answer) in q['options']:
            return q['options'].index(str(answer))

    # 10 - ? = 5
    match = re.search(r'(\d+)\s*-\s*\?\s*=\s*(\d+)', q['question'])
    if match:
        a = int(match.group(1))
        result = int(match.group(2))
        answer = a - result
        if str(answer) in q['options']:
            return q['options'].index(str(answer))

    # ? - 5 = 3
    match = re.search(r'\?\s*-\s*(\d+)\s*=\s*(\d+)', q['question'])
    if match:
        b = int(match.group(1))
        result = int(match.group(2))
        answer = result + b
        if str(answer) in q['options']:
            return q['options'].index(str(answer))

    return None

def check_word_problem(q):
    question_text = q['question']

    # Pattern: "có X, thêm Y" or "có X, cho thêm Y"
    match = re.search(r'có\s+(\d+).*?(?:thêm|cho)\s+(?:thêm\s+)?(\d+)', question_text)
    if match:
        a = int(match.group(1))
        b = int(match.group(2))
        result = a + b
        if str(result) in q['options']:
            return q['options'].index(str(result))

    # Pattern: "X, đi Y, còn lại"
    match = re.search(r'(\d+).*?(?:đi|bán|ăn)\s+(\d+).*?còn', question_text)
    if match:
        a = int(match.group(1))
        b = int(match.group(2))
        result = a - b
        if str(result) in q['options']:
            return q['options'].index(str(result))

    # Pattern: "X, Y, còn lại Z" - looking for multi-step
    # Example: "Xe buýt có 18 người. Xuống đi 7 người. Lên thêm 5 người."
    match = re.search(r'(\d+).*?(\d+).*?(\d+)', question_text)
    if match:
        nums = [int(match.group(1)), int(match.group(2)), int(match.group(3))]

        # Check for "xuống ... lên thêm" pattern (subtract then add)
        if 'xuống' in question_text and 'lên' in question_text:
            result = nums[0] - nums[1] + nums[2]
            if str(result) in q['options']:
                return q['options'].index(str(result))

        # Check for "chuyển đi ... nhận thêm" pattern
        if 'chuyển' in question_text and 'nhận' in question_text:
            result = nums[0] - nums[1] + nums[2]
            if str(result) in q['options']:
                return q['options'].index(str(result))

        # Check for "mua thêm ... mượn" pattern (add then subtract)
        if 'mua' in question_text and 'mượn' in question_text:
            result = nums[0] + nums[1] - nums[2]
            if str(result) in q['options']:
                return q['options'].index(str(result))

        # Check for "trồng ... bán" pattern
        if 'trồng' in question_text and 'bán' in question_text:
            result = nums[0] + nums[1] - nums[2]
            if str(result) in q['options']:
                return q['options'].index(str(result))

        # Check for "sáng bán ... chiều bán" pattern (subtract twice)
        if 'sáng' in question_text and 'chiều' in question_text and 'bán' in question_text:
            result = nums[0] - nums[1] - nums[2]
            if str(result) in q['options']:
                return q['options'].index(str(result))

        # Check for "mua ... mua" pattern (subtract twice)
        if question_text.count('mua') >= 2:
            result = nums[0] - nums[1] - nums[2]
            if str(result) in q['options']:
                return q['options'].index(str(result))

    return None

def check_multi_step(q):
    expr = q['question'].replace('?', '').strip()
    try:
        result = eval(expr)
        if str(result) in q['options']:
            return q['options'].index(str(result))
    except:
        pass
    return None

def check_sequence(q):
    question_text = q['question']

    # Check if it's a sorting question
    if 'sắp xếp' in question_text.lower() or 'Sắp xếp' in question_text:
        match = re.search(r'(\d+),\s*(\d+),\s*(\d+),\s*(\d+)', question_text)
        if match:
            numbers = [int(match.group(1)), int(match.group(2)), int(match.group(3)), int(match.group(4))]

            if 'bé đến lớn' in question_text or 'tăng dần' in question_text or 'chẵn - lẻ' in question_text:
                sorted_nums = sorted(numbers)
                sorted_str = ', '.join(map(str, sorted_nums))
                if sorted_str in q['options']:
                    return q['options'].index(sorted_str)
            elif 'lớn đến bé' in question_text or 'giảm dần' in question_text:
                sorted_nums = sorted(numbers, reverse=True)
                sorted_str = ', '.join(map(str, sorted_nums))
                if sorted_str in q['options']:
                    return q['options'].index(sorted_str)
        return None

    # Check if it's a continuation question
    if 'Tiếp tục' in question_text:
        match = re.search(r'(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*\?', question_text)
        if match:
            nums = [int(match.group(1)), int(match.group(2)), int(match.group(3)), int(match.group(4))]

            # Check arithmetic progression
            diff1 = nums[1] - nums[0]
            diff2 = nums[2] - nums[1]
            diff3 = nums[3] - nums[2]

            if diff1 == diff2 == diff3:
                next_num = nums[3] + diff1
                if str(next_num) in q['options']:
                    return q['options'].index(str(next_num))

            # Check geometric progression
            if nums[0] != 0 and nums[1] % nums[0] == 0:
                ratio1 = nums[1] // nums[0]
                ratio2 = nums[2] // nums[1] if nums[1] != 0 else 0
                ratio3 = nums[3] // nums[2] if nums[2] != 0 else 0

                if ratio1 == ratio2 == ratio3 and ratio1 > 0:
                    next_num = nums[3] * ratio1
                    if str(next_num) in q['options']:
                        return q['options'].index(str(next_num))

    return None

def check_geometry(q):
    question_text = q['question']

    # Hình tròn có 0 góc
    if 'hình tròn' in question_text.lower() and 'góc' in question_text.lower():
        if '0 góc' in q['options']:
            return q['options'].index('0 góc')

    # Hình tam giác có 3 cạnh
    if 'tam giác' in question_text.lower() and 'cạnh' in question_text.lower():
        if '3 cạnh' in q['options']:
            return q['options'].index('3 cạnh')

    # Hình vuông có 4 cạnh bằng nhau
    if 'vuông' in question_text.lower() and 'cạnh' in question_text.lower():
        if '4 cạnh' in q['options']:
            return q['options'].index('4 cạnh')

    # Hình chữ nhật có 4 góc
    if 'chữ nhật' in question_text.lower() and 'góc' in question_text.lower():
        if '4 góc' in q['options']:
            return q['options'].index('4 góc')

    return None

def check_number_sense(q):
    question_text = q['question']

    if 'lớn nhất' in question_text:
        nums = [int(x) for x in re.findall(r'\d+', q['question'])]
        options_nums = []
        for opt in q['options']:
            match = re.search(r'\d+', opt)
            if match:
                options_nums.append(int(match.group()))
        if options_nums:
            max_num = max(options_nums)
            max_str = str(max_num)
            # Find option containing this number
            for i, opt in enumerate(q['options']):
                if str(max_num) in opt:
                    return i

    if 'nhỏ nhất' in question_text:
        nums = [int(x) for x in re.findall(r'\d+', q['question'])]
        options_nums = []
        for opt in q['options']:
            match = re.search(r'\d+', opt)
            if match:
                options_nums.append(int(match.group()))
        if options_nums:
            min_num = min(options_nums)
            for i, opt in enumerate(q['options']):
                if str(min_num) in opt:
                    return i

    if 'liền sau' in question_text:
        match = re.search(r'sau\s+(\d+)', question_text)
        if match:
            num = int(match.group(1))
            next_num = num + 1
            if str(next_num) in q['options']:
                return q['options'].index(str(next_num))

    if 'liền trước' in question_text:
        match = re.search(r'trước\s+(\d+)', question_text)
        if match:
            num = int(match.group(1))
            prev_num = num - 1
            if str(prev_num) in q['options']:
                return q['options'].index(str(prev_num))

    return None

def check_time(q):
    question_text = q['question']

    # 1 giờ = 60 phút
    if '1 giờ' in question_text and 'phút' in question_text and 'bao nhiêu' in question_text:
        if '60 phút' in q['options']:
            return q['options'].index('60 phút')

    # Nửa giờ = 30 phút
    if 'nửa giờ' in question_text:
        if '30 phút' in q['options']:
            return q['options'].index('30 phút')

    # Kim phút chỉ số 6 = 30 phút
    if 'số 6' in question_text and 'phút' in question_text:
        if '30 phút' in q['options']:
            return q['options'].index('30 phút')

    # Kim phút chỉ số 3 = 15 phút
    if 'số 3' in question_text and 'phút' in question_text:
        if '15 phút' in q['options']:
            return q['options'].index('15 phút')

    # Kim phút chỉ số 9 = 45 phút
    if 'số 9' in question_text and 'phút' in question_text:
        if '45 phút' in q['options']:
            return q['options'].index('45 phút')

    return None

def check_money(q):
    question_text = q['question']

    # Price calculation: X đồng for Y items
    match = re.search(r'(\d+)\s*đồng.*?(\d+)\s*(?:quả|gói|quyển)', question_text)
    if match and 'giá' in question_text and 'bao nhiêu' in question_text:
        total = int(match.group(1))
        count = int(match.group(2))
        price = total // count
        for i, opt in enumerate(q['options']):
            if str(price) in opt:
                return i

    return None

def check_length(q):
    question_text = q['question']

    # 1 mét = 100cm
    if '1 mét' in question_text and 'xen-ti-mét' in question_text or 'cm' in question_text:
        if '100cm' in q['options']:
            return q['options'].index('100cm')

    # Comparison: A dài hơn B bao nhiêu
    match = re.search(r'(\d+).*?(\d+).*?dài hơn.*?bao nhiêu', question_text)
    if match:
        a = int(match.group(1))
        b = int(match.group(2))
        result = a - b
        for i, opt in enumerate(q['options']):
            if str(result) in opt:
                return i

    return None

def check_fraction(q):
    question_text = q['question']

    # Division: X items divided among Y people
    match = re.search(r'(\d+).*?chia\s+đều.*?(\d+)', question_text)
    if match:
        total = int(match.group(1))
        people = int(match.group(2))
        result = total // people
        for i, opt in enumerate(q['options']):
            if str(result) in opt:
                return i

    return None

def check_grouping(q):
    question_text = q['question']

    # X nhóm, mỗi nhóm Y người = total
    match = re.search(r'(\d+)\s*(?:nhóm|đội|cái|bàn|hàng|người|hộp|túi).*?(\d+)\s*(?:học sinh|người|ghế|cây|bóng|cốc|quyển|quả|bút)', question_text)
    if match:
        groups = int(match.group(1))
        per_group = int(match.group(2))
        result = groups * per_group
        for i, opt in enumerate(q['options']):
            if str(result) in opt:
                return i

    return None

def check_find_missing(q):
    question_text = q['question']

    # Find missing in sequence
    match = re.search(r'(\d+),\s*\?,\s*(\d+),\s*(\d+)', question_text)
    if match:
        a = int(match.group(1))
        c = int(match.group(2))
        d = int(match.group(3))

        # Check arithmetic progression
        diff1 = c - a
        diff2 = d - c

        if diff1 == diff2:
            missing = a + diff1 // 2 if diff1 % 2 == 0 else None
            if missing and str(missing) in q['options']:
                return q['options'].index(str(missing))

        # If a and c have same difference as c and d
        if (c - a) == (d - c):
            missing = (a + c) // 2
            if str(missing) in q['options']:
                return q['options'].index(str(missing))

    return None

def check_estimate(q):
    question_text = q['question']

    # Extract the expression and estimate
    match = re.search(r'(\d+)\s*([+-])\s*(\d+)', question_text)
    if match:
        a = int(match.group(1))
        op = match.group(2)
        b = int(match.group(3))

        if op == '+':
            result = a + b
        else:
            result = a - b

        # Round to nearest 5 or 10
        rounded = round(result / 5) * 5
        for i, opt in enumerate(q['options']):
            if str(rounded) in opt:
                return i

    return None

def check_position(q):
    question_text = q['question']

    # Find position of a number in a sequence
    match = re.search(r'(\d+),\s*(\d+),\s*(\d+),\s*(\d+).*?(\d+).*?thứ\s*mấy', question_text)
    if not match:
        match = re.search(r'(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+).*?(\d+)', question_text)

    if match:
        nums = [int(match.group(i)) for i in range(1, 6) if match.group(i)]
        # Find the number mentioned after the sequence
        target_match = re.search(r'Số\s+(\d+)', question_text)
        if target_match:
            target = int(target_match.group(1))
            if target in nums:
                position = nums.index(target) + 1
                for i, opt in enumerate(q['options']):
                    if f'thứ {position}' in opt or f'{position}' in opt:
                        return i

    return None

# Check all questions
for q in questions:
    correct_index = None
    current_answer = int(q['correctAnswer'])

    if q['type'] == 'addition':
        correct_index = check_addition(q)
    elif q['type'] == 'subtraction':
        correct_index = check_subtraction(q)
    elif q['type'] == 'comparison':
        correct_index = check_comparison(q)
    elif q['type'] == 'fill-blank':
        correct_index = check_fill_blank(q)
    elif q['type'] == 'word-problem':
        correct_index = check_word_problem(q)
    elif q['type'] == 'multi-step':
        correct_index = check_multi_step(q)
    elif q['type'] == 'sequence' or q['type'] == 'pattern':
        correct_index = check_sequence(q)
    elif q['type'] == 'geometry':
        correct_index = check_geometry(q)
    elif q['type'] == 'number-sense':
        correct_index = check_number_sense(q)
    elif q['type'] == 'time':
        correct_index = check_time(q)
    elif q['type'] == 'money':
        correct_index = check_money(q)
    elif q['type'] == 'length':
        correct_index = check_length(q)
    elif q['type'] == 'fraction':
        correct_index = check_fraction(q)
    elif q['type'] == 'grouping':
        correct_index = check_grouping(q)
    elif q['type'] == 'find-missing':
        correct_index = check_find_missing(q)
    elif q['type'] == 'estimate':
        correct_index = check_estimate(q)
    elif q['type'] == 'position':
        correct_index = check_position(q)

    if correct_index is not None and correct_index != current_answer:
        wrong_answers.append({
            'id': q['id'],
            'type': q['type'],
            'question': q['question'],
            'current_answer': q['options'][current_answer],
            'correct_answer': q['options'][correct_index],
            'correct_index': correct_index,
            'current_index': current_answer
        })

print(f"Found {len(wrong_answers)} questions with wrong answers:\n")
for wa in wrong_answers:
    print(f"ID: {wa['id']}")
    print(f"Type: {wa['type']}")
    print(f"Question: {wa['question']}")
    print(f"Current Answer (index {wa['current_index']}): {wa['current_answer']}")
    print(f"Correct Answer (index {wa['correct_index']}): {wa['correct_answer']}")
    print("-" * 80)
