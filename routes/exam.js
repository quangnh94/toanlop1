const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Đọc dữ liệu câu hỏi từ file JSON
const questionsPath = path.join(__dirname, '../data/questions.json');
const stickersPath = path.join(__dirname, '../data/stickers.json');

function getQuestions() {
  try {
    const data = fs.readFileSync(questionsPath, 'utf8');
    const json = JSON.parse(data);
    return json.questions;
  } catch (error) {
    console.error('Lỗi đọc file câu hỏi:', error);
    return [];
  }
}

function getStickersData() {
  try {
    const data = fs.readFileSync(stickersPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Lỗi đọc file stickers:', error);
    return { stickers: [], rarity: {} };
  }
}

// Hàm random sticker theo độ hiếm
function getRandomSticker() {
  const stickersData = getStickersData();
  const stickers = stickersData.stickers;
  const rarity = stickersData.rarity;

  // Random số từ 1-100
  const random = Math.random() * 100;
  let selectedRarity = 'common';

  // Xác định độ hiếm dựa trên % chance
  let cumulative = 0;
  for (const [key, value] of Object.entries(rarity)) {
    cumulative += value.chance;
    if (random <= cumulative) {
      selectedRarity = key;
      break;
    }
  }

  // Lọc sticker theo độ hiếm đã chọn
  const stickersByRarity = stickers.filter(s => s.rarity === selectedRarity);

  // Random sticker trong danh sách
  const randomIndex = Math.floor(Math.random() * stickersByRarity.length);

  return stickersByRarity[randomIndex];
}

// GET /api/questions - Lấy danh sách câu hỏi theo bộ lọc
router.get('/questions', (req, res) => {
  try {
    const questions = getQuestions();
    const { type, difficulty } = req.query;

    let filteredQuestions = questions;

    // Lọc theo loại câu hỏi
    if (type) {
      const types = Array.isArray(type) ? type : [type];
      filteredQuestions = filteredQuestions.filter(q => types.includes(q.type));
    }

    // Lọc theo độ khó
    if (difficulty) {
      const difficulties = Array.isArray(difficulty) ? difficulty : [difficulty];
      filteredQuestions = filteredQuestions.filter(q => difficulties.includes(q.difficulty));
    }

    res.json({
      success: true,
      count: filteredQuestions.length,
      questions: filteredQuestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// POST /api/exam/generate - Tạo đề thi ngẫu nhiên
router.post('/exam/generate', (req, res) => {
  try {
    const { count = 10, types, difficulty } = req.body;

    const questions = getQuestions();
    let filteredQuestions = questions;

    // Lọc theo loại câu hỏi
    if (types && types.length > 0) {
      filteredQuestions = filteredQuestions.filter(q => types.includes(q.type));
    }

    // Lọc theo độ khó
    if (difficulty && difficulty.length > 0) {
      filteredQuestions = filteredQuestions.filter(q => difficulty.includes(q.difficulty));
    }

    // Kiểm tra số lượng câu hỏi yêu cầu
    if (filteredQuestions.length < count) {
      return res.status(400).json({
        success: false,
        message: `Chỉ có ${filteredQuestions.length} câu hỏi phù hợp. Vui lòng giảm số lượng câu hỏi.`,
        availableQuestions: filteredQuestions.length
      });
    }

    // Random và chọn câu hỏi
    const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, count);

    // Tạo ID cho đề thi
    const examId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    res.json({
      success: true,
      examId: examId,
      exam: {
        id: examId,
        questions: selectedQuestions,
        totalQuestions: selectedQuestions.length,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo đề thi',
      error: error.message
    });
  }
});

// POST /api/exam/submit - Nộp bài và chấm điểm
router.post('/exam/submit', (req, res) => {
  try {
    const { examId, answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ'
      });
    }

    // Đọc câu hỏi từ request body để chấm điểm
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin câu hỏi'
      });
    }

    let correctCount = 0;
    const results = [];

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer == question.correctAnswer;

      if (isCorrect) {
        correctCount++;
      }

      results.push({
        questionId: question.id,
        question: question.question,
        userAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        correctAnswerText: question.options[question.correctAnswer],
        isCorrect: isCorrect
      });
    });

    const totalQuestions = questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 50;

    // Kiểm tra nếu làm đúng > 80% thì tặng sticker
    let rewardSticker = null;
    if (score > 80) {
      rewardSticker = getRandomSticker();
    }

    res.json({
      success: true,
      examId: examId,
      result: {
        totalQuestions: totalQuestions,
        correctCount: correctCount,
        incorrectCount: totalQuestions - correctCount,
        score: score,
        passed: passed,
        details: results,
        rewardSticker: rewardSticker
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi chấm bài',
      error: error.message
    });
  }
});

// GET /api/types - Lấy danh sách các loại câu hỏi
router.get('/types', (req, res) => {
  const types = [
    { value: 'addition', label: 'Phép cộng' },
    { value: 'subtraction', label: 'Phép trừ' },
    { value: 'comparison', label: 'So sánh' },
    { value: 'fill-blank', label: 'Điền số còn thiếu' },
    { value: 'order', label: 'Sắp xếp' },
    { value: 'geometry', label: 'Hình học' },
    { value: 'word-problem', label: 'Giải toán' },
    { value: 'multi-step', label: 'Phép tính nhiều bước' },
    { value: 'number-sense', label: 'Nhận biết số' },
    { value: 'time', label: 'Đọc giờ' },
    { value: 'pattern', label: 'Dãy số' },
    { value: 'money', label: 'Tiền' },
    { value: 'length', label: 'Đo độ dài' },
    { value: 'fraction', label: 'Phân số đơn giản' },
    { value: 'grouping', label: 'Nhóm/Lớp' },
    { value: 'find-missing', label: 'Tìm số còn thiếu' },
    { value: 'position', label: 'Vị trí thứ tự' },
    { value: 'sequence', label: 'Sắp xếp dãy số theo quy luật' }
  ];

  res.json({
    success: true,
    types: types
  });
});

// GET /api/stickers - Lấy danh sách tất cả stickers
router.get('/stickers', (req, res) => {
  try {
    const stickersData = getStickersData();
    res.json({
      success: true,
      stickers: stickersData.stickers,
      rarity: stickersData.rarity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sticker',
      error: error.message
    });
  }
});

// GET /api/pets - Lấy dữ liệu pets
router.get('/pets', (req, res) => {
  try {
    const petsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/pets.json'), 'utf8'));
    res.json({
      success: true,
      pets: petsData.pets,
      food: petsData.food,
      toys: petsData.toys,
      accessories: petsData.accessories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu pets',
      error: error.message
    });
  }
});

// GET /api/world-map - Lấy dữ liệu bản đồ
router.get('/world-map', (req, res) => {
  try {
    const worldMapData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/world-map.json'), 'utf8'));
    res.json({
      success: true,
      worlds: worldMapData.worlds,
      connections: worldMapData.connections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu bản đồ',
      error: error.message
    });
  }
});

// GET /api/stickers/my-collection - Lấy bộ sưu tập sticker của người dùng (từ localStorage, không cần API này)
// Frontend sẽ tự lưu vào localStorage

module.exports = router;
