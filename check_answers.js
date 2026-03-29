const fs = require('fs');

// Read the questions file
const data = JSON.parse(fs.readFileSync('/Users/bee/Documents/Bông/bong-toan-lop-1/data/questions.json', 'utf8'));
const questions = data.questions;

const wrongAnswers = [];

// Helper function to check addition
function checkAddition(question) {
    const match = question.question.match(/(\d+)\s*\+\s*(\d+)\s*=?/);
    if (match) {
        const a = parseInt(match[1]);
        const b = parseInt(match[2]);
        const result = a + b;
        const correctIndex = question.options.indexOf(result.toString());
        return correctIndex;
    }
    return null;
}

// Helper function to check subtraction
function checkSubtraction(question) {
    const match = question.question.match(/(\d+)\s*-\s*(\d+)\s*=?/);
    if (match) {
        const a = parseInt(match[1]);
        const b = parseInt(match[2]);
        const result = a - b;
        const correctIndex = question.options.indexOf(result.toString());
        return correctIndex;
    }
    return null;
}

// Helper function to check comparison
function checkComparison(question) {
    const match = question.question.match(/(\d+)\s*\?\s*(\d+)/);
    if (match) {
        const a = parseInt(match[1]);
        const b = parseInt(match[2]);
        let correctSymbol;
        if (a > b) correctSymbol = '>';
        else if (a < b) correctSymbol = '<';
        else correctSymbol = '=';

        const correctIndex = question.options.indexOf(correctSymbol);
        return correctIndex;
    }
    return null;
}

// Helper function to check fill-blank
function checkFillBlank(question) {
    // Check patterns like "? + 5 = 8" or "10 - ? = 3"
    let match = question.question.match(/\?\s*\+\s*(\d+)\s*=\s*(\d+)/);
    if (match) {
        const b = parseInt(match[1]);
        const result = parseInt(match[2]);
        const answer = result - b;
        const correctIndex = question.options.indexOf(answer.toString());
        return correctIndex;
    }

    match = question.question.match(/(\d+)\s*\+\s*\?\s*=\s*(\d+)/);
    if (match) {
        const a = parseInt(match[1]);
        const result = parseInt(match[2]);
        const answer = result - a;
        const correctIndex = question.options.indexOf(answer.toString());
        return correctIndex;
    }

    match = question.question.match(/(\d+)\s*-\s*\?\s*=\s*(\d+)/);
    if (match) {
        const a = parseInt(match[1]);
        const result = parseInt(match[2]);
        const answer = a - result;
        const correctIndex = question.options.indexOf(answer.toString());
        return correctIndex;
    }

    match = question.question.match(/\?\s*-\s*(\d+)\s*=\s*(\d+)/);
    if (match) {
        const b = parseInt(match[1]);
        const result = parseInt(match[2]);
        const answer = result + b;
        const correctIndex = question.options.indexOf(answer.toString());
        return correctIndex;
    }

    // Check multi-step fill-blank like "? + 5 + 3 = 15"
    match = question.question.match(/\?\s*[+\-]\s*\d+\s*[+\-]\s*\d+\s*=\s*(\d+)/);
    if (match) {
        const result = parseInt(match[1]);
        const parts = question.question.split('=');
        const leftPart = parts[0].replace('?', '');
        const evalResult = eval(leftPart);
        // Find the number that when added makes the equation work
        for (let i = 0; i < question.options.length; i++) {
            const testExpr = parts[0].replace('?', question.options[i]);
            try {
                if (eval(testExpr) === result) {
                    return i;
                }
            } catch (e) {}
        }
    }

    return null;
}

// Helper function to check word problems
function checkWordProblem(question) {
    const q = question.question;

    // Pattern: "có X, thêm/bớt Y, còn lại bao nhiêu?"
    // Addition patterns
    let match = q.match(/có\s+(\d+).*?(?:thêm|cho|nữa)\s+(\d+)/);
    if (match) {
        const a = parseInt(match[1]);
        const b = parseInt(match[2]);
        const result = a + b;
        const correctIndex = question.options.indexOf(result.toString());
        if (correctIndex !== -1) return correctIndex;
    }

    // Subtraction patterns
    match = q.match(/(\d+).*?(?:đi|bán|ăn|hay|mượn|chuyển)\s+(\d+).*?còn\s*(?:lại)?/);
    if (match) {
        const a = parseInt(match[1]);
        const b = parseInt(match[2]);
        const result = a - b;
        const correctIndex = question.options.indexOf(result.toString());
        if (correctIndex !== -1) return correctIndex;
    }

    // Multi-step: X - Y + Z
    match = q.match(/(\d+).*?(\d+).*?(\d+).*?còn/);
    if (match) {
        const parts = q.match(/(\d+).*?(\d+).*?(\d+)/);
        if (parts) {
            const a = parseInt(parts[1]);
            const b = parseInt(parts[2]);
            const c = parseInt(parts[3]);

            // Check if it's subtraction then addition or addition then subtraction
            if (q.includes('xuống') && q.includes('lên') || q.includes('bán') && q.includes('mua') || q.includes('chuyển') && q.includes('nhận')) {
                const result = a - b + c;
                const correctIndex = question.options.indexOf(result.toString());
                if (correctIndex !== -1) return correctIndex;
            } else if (q.includes('mua') && q.includes('mượn')) {
                const result = a + b - c;
                const correctIndex = question.options.indexOf(result.toString());
                if (correctIndex !== -1) return correctIndex;
            }
        }
    }

    // More complex multi-step
    match = q.match(/(\d+).*?(\d+).*?(\d+).*?(\d+).*?còn/);
    if (match) {
        const a = parseInt(match[1]);
        const b = parseInt(match[2]);
        const c = parseInt(match[3]);
        const d = parseInt(match[4]);

        // Pattern: X + Y - Z
        if (q.includes('thêm') && q.includes('mượn')) {
            const result = a + b - c;
            const correctIndex = question.options.indexOf(result.toString());
            if (correctIndex !== -1) return correctIndex;
        }
    }

    return null;
}

// Helper function to check multi-step
function checkMultiStep(question) {
    const expr = question.question.replace('?', '');
    try {
        const result = eval(expr);
        const correctIndex = question.options.indexOf(result.toString());
        return correctIndex;
    } catch (e) {
        return null;
    }
}

// Helper function to check sequence
function checkSequence(question) {
    const q = question.question;

    // Check if it's a sorting question
    if (q.includes('Sắp xếp') || q.includes('sắp xếp')) {
        const match = q.match(/(\d+),\s*(\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            const numbers = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseInt(match[4])];

            if (q.includes('bé đến lớn') || q.includes('tăng dần') || q.includes('chẵn - lẻ')) {
                const sorted = [...numbers].sort((a, b) => a - b);
                const sortedStr = sorted.join(', ');
                const correctIndex = question.options.indexOf(sortedStr);
                return correctIndex;
            } else if (q.includes('lớn đến bé') || q.includes('giảm dần')) {
                const sorted = [...numbers].sort((a, b) => b - a);
                const sortedStr = sorted.join(', ');
                const correctIndex = question.options.indexOf(sortedStr);
                return correctIndex;
            }
        }
        return null;
    }

    // Check if it's a continuation question
    if (q.includes('Tiếp tục')) {
        const match = q.match(/(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*\?/);
        if (match) {
            const nums = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseInt(match[4])];

            // Check arithmetic progression
            const diff1 = nums[1] - nums[0];
            const diff2 = nums[2] - nums[1];
            const diff3 = nums[3] - nums[2];

            if (diff1 === diff2 && diff2 === diff3) {
                const next = nums[3] + diff1;
                const correctIndex = question.options.indexOf(next.toString());
                if (correctIndex !== -1) return correctIndex;
            }

            // Check geometric progression
            const ratio1 = nums[1] / nums[0];
            const ratio2 = nums[2] / nums[1];
            const ratio3 = nums[3] / nums[2];

            if (ratio1 === ratio2 && ratio2 === ratio3 && Number.isInteger(ratio1)) {
                const next = nums[3] * ratio1;
                const correctIndex = question.options.indexOf(next.toString());
                if (correctIndex !== -1) return correctIndex;
            }
        }
    }

    return null;
}

// Check all questions
questions.forEach(q => {
    let correctIndex = null;

    switch(q.type) {
        case 'addition':
            correctIndex = checkAddition(q);
            break;
        case 'subtraction':
            correctIndex = checkSubtraction(q);
            break;
        case 'comparison':
            correctIndex = checkComparison(q);
            break;
        case 'fill-blank':
            correctIndex = checkFillBlank(q);
            break;
        case 'word-problem':
            correctIndex = checkWordProblem(q);
            break;
        case 'multi-step':
            correctIndex = checkMultiStep(q);
            break;
        case 'sequence':
        case 'pattern':
            correctIndex = checkSequence(q);
            break;
    }

    if (correctIndex !== null && correctIndex !== parseInt(q.correctAnswer)) {
        wrongAnswers.push({
            id: q.id,
            type: q.type,
            question: q.question,
            currentAnswer: q.options[parseInt(q.correctAnswer)],
            correctAnswer: q.options[correctIndex],
            correctIndex: correctIndex
        });
    }
});

console.log(`Found ${wrongAnswers.length} questions with wrong answers:`);
wrongAnswers.forEach(q => {
    console.log(`\nID: ${q.id}`);
    console.log(`Type: ${q.type}`);
    console.log(`Question: ${q.question}`);
    console.log(`Current Answer: ${q.currentAnswer}`);
    console.log(`Correct Answer: ${q.correctAnswer} (index ${q.correctIndex})`);
});
