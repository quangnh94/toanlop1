// Biến toàn cục
let currentExam = null;
let userAnswers = [];
let timerInterval = null;
let seconds = 0;

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
  loadExam();
  setupEventListeners();
});

// Tải đề thi từ localStorage
function loadExam() {
  const examData = localStorage.getItem('currentExam');

  if (!examData) {
    alert('Không tìm thấy đề thi. Vui lòng tạo đề thi mới!');
    window.location.href = '/';
    return;
  }

  currentExam = JSON.parse(examData);

  // Khởi tạo mảng đáp án
  userAnswers = new Array(currentExam.questions.length).fill(null);

  // Hiển thị câu hỏi
  displayQuestions();

  // Bắt đầu đếm thời gian
  startTimer();

  // Ẩn loading, hiển thị đề thi
  document.getElementById('loading').style.display = 'none';
  document.getElementById('examContainer').style.display = 'block';
}

// Hiển thị danh sách câu hỏi
function displayQuestions() {
  const container = document.getElementById('questionsList');
  container.innerHTML = '';

  currentExam.questions.forEach((question, index) => {
    const questionCard = createQuestionCard(question, index);
    container.appendChild(questionCard);
  });

  updateProgress();
}

// Tạo card câu hỏi
function createQuestionCard(question, index) {
  const card = document.createElement('div');
  card.className = 'question-card';
  card.id = `question-${index}`;

  // Số thứ tự câu hỏi
  const questionNumber = document.createElement('div');
  questionNumber.className = 'question-number';
  questionNumber.textContent = `Câu ${index + 1}`;
  card.appendChild(questionNumber);

  // Nội dung câu hỏi
  const questionText = document.createElement('div');
  questionText.className = 'question-text';
  questionText.textContent = question.question;
  card.appendChild(questionText);

  // Các đáp án
  const optionsGrid = document.createElement('div');
  optionsGrid.className = 'options-grid';

  question.options.forEach((option, optionIndex) => {
    const optionBtn = document.createElement('button');
    optionBtn.className = 'option-btn';
    optionBtn.textContent = option;
    optionBtn.onclick = () => selectAnswer(index, optionIndex);

    if (userAnswers[index] === optionIndex) {
      optionBtn.classList.add('selected');
    }

    optionsGrid.appendChild(optionBtn);
  });

  card.appendChild(optionsGrid);

  return card;
}

// Chọn đáp án
function selectAnswer(questionIndex, answerIndex) {
  // Cập nhật đáp án
  userAnswers[questionIndex] = answerIndex;

  // Cập nhật UI
  const questionCard = document.getElementById(`question-${questionIndex}`);
  const optionBtns = questionCard.querySelectorAll('.option-btn');

  optionBtns.forEach((btn, index) => {
    if (index === answerIndex) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
}

// Cập nhật tiến độ
function updateProgress() {
  const answered = userAnswers.filter(a => a !== null).length;
  const total = currentExam.questions.length;
  document.getElementById('questionProgress').textContent = `Đã làm: ${answered} / ${total} câu`;
}

// Bắt đầu đếm thời gian
function startTimer() {
  seconds = 0;
  timerInterval = setInterval(() => {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('timer').textContent =
      `⏱️ ${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, 1000);
}

// Dừng đếm thời gian
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
}

// Thiết lập event listeners
function setupEventListeners() {
  // Nút nộp bài
  document.getElementById('submitExam').addEventListener('click', submitExam);

  // Nút về trang chủ
  document.getElementById('backHome').addEventListener('click', () => {
    if (confirm('Bạn có chắc muốn về trang chủ? Tiến độ sẽ mất.')) {
      stopTimer();
      window.location.href = '/';
    }
  });

  // Nút xem đáp án
  document.getElementById('reviewAnswers').addEventListener('click', toggleReview);

  // Nút làm đề mới
  document.getElementById('newExam').addEventListener('click', () => {
    localStorage.removeItem('currentExam');
    window.location.href = '/';
  });
}

// Nộp bài
function submitExam() {
  // Kiểm tra đã làm đủ câu chưa
  const unanswered = userAnswers.filter(a => a === null).length;

  if (unanswered > 0) {
    if (!confirm(`Bạn chưa làm ${unanswered} câu. Bạn có chắc muốn nộp bài?`)) {
      return;
    }
  }

  // Dừng timer
  stopTimer();

  // Gọi API chấm điểm
  fetch('/api/exam/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      examId: currentExam.id,
      questions: currentExam.questions,
      answers: userAnswers
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      displayResult(data.result);
    } else {
      alert('Lỗi: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Lỗi:', error);
    alert('Có lỗi xảy ra khi nộp bài.');
  });
}

// Lưu sticker vào localStorage
function saveSticker(sticker) {
  let collection = JSON.parse(localStorage.getItem('stickerCollection') || '[]');
  collection.push({
    ...sticker,
    collectedAt: new Date().toISOString()
  });
  localStorage.setItem('stickerCollection', JSON.stringify(collection));
}

// Hiển thị kết quả
function displayResult(result) {
  // Ẩn đề thi, hiển thị kết quả
  document.getElementById('examContainer').style.display = 'none';
  document.getElementById('resultContainer').style.display = 'block';

  // Hiển thị số điểm
  document.getElementById('scoreNumber').textContent = result.score;

  // Hiển thị số câu đúng/sai
  document.getElementById('correctCount').textContent = result.correctCount;
  document.getElementById('incorrectCount').textContent = result.incorrectCount;

  // Hiển thị thông báo đậu/rớt
  const passedMessage = document.getElementById('passedMessage');
  if (result.passed) {
    document.getElementById('resultTitle').textContent = '🎉 Chúc mừng!';
    passedMessage.textContent = 'Bạn đã hoàn thành tốt bài thi!';
    passedMessage.className = 'passed-message passed';
  } else {
    document.getElementById('resultTitle').textContent = '💪 Cố gắng lên!';
    passedMessage.textContent = 'Bạn cần luyện tập thêm nhé!';
    passedMessage.className = 'passed-message failed';
  }

  // Hiển thị sticker nếu được thưởng
  if (result.rewardSticker) {
    showRewardSticker(result.rewardSticker);
    saveSticker(result.rewardSticker);
  }

  // Lưu kết quả chi tiết để xem sau
  window.examResult = result;
}

// Hiển thị sticker thưởng
function showRewardSticker(sticker) {
  const imageHtml = sticker.image ? `<img src="${sticker.image}" alt="${sticker.name}" class="sticker-reward-image" onerror="this.replaceWith(document.createElement('div')).className='sticker-emoji';this.style.fontSize='80px';this.textContent='${sticker.emoji}'">` : `<div class="sticker-emoji" style="font-size: 80px;">${sticker.emoji}</div>`;

  // Tạo modal hiển thị sticker
  const modal = document.createElement('div');
  modal.className = 'sticker-reward-modal';
  modal.innerHTML = `
    <div class="sticker-reward-content">
      <div class="sticker-reward-header">
        <h2>🎉 Chúc mừng!</h2>
        <p>Bạn đã được tặng một sticker!</p>
      </div>
      <div class="sticker-display" style="background: linear-gradient(135deg, ${sticker.color}22 0%, ${sticker.color}44 100%);">
        ${imageHtml}
        <div class="sticker-name">${sticker.name}</div>
        <div class="sticker-rarity" style="color: ${sticker.color};">${sticker.rarityLabel}</div>
      </div>
      <button class="btn btn-primary" onclick="this.closest('.sticker-reward-modal').remove()">
        <span>👍 Tuyệt vời!</span>
      </button>
      <button class="btn btn-secondary" onclick="this.closest('.sticker-reward-modal').remove(); window.location.href='/collection.html'">
        <span>📚 Xem bộ sưu tập</span>
      </button>
    </div>
  `;
  document.body.appendChild(modal);

  // Hiệu ứng animation
  setTimeout(() => {
    modal.classList.add('show');
  }, 100);
}

// Hiển thị/ẩn đáp án chi tiết
function toggleReview() {
  const reviewDiv = document.getElementById('answerReview');
  const reviewBtn = document.getElementById('reviewAnswers');

  if (reviewDiv.style.display === 'none') {
    // Hiển thị đáp án
    displayAnswerReview();
    reviewDiv.style.display = 'block';
    reviewBtn.textContent = '📝 Ẩn đáp án';
  } else {
    // Ẩn đáp án
    reviewDiv.style.display = 'none';
    reviewBtn.textContent = '📝 Xem đáp án';
  }
}

// Hiển thị đáp án chi tiết
function displayAnswerReview() {
  const reviewList = document.getElementById('reviewList');
  reviewList.innerHTML = '';

  window.examResult.details.forEach((detail, index) => {
    const reviewItem = document.createElement('div');
    reviewItem.className = `review-item ${detail.isCorrect ? 'correct' : 'incorrect'}`;

    const questionDiv = document.createElement('div');
    questionDiv.className = 'review-question';
    questionDiv.textContent = `Câu ${index + 1}: ${detail.question}`;
    reviewItem.appendChild(questionDiv);

    const userAnswerDiv = document.createElement('div');
    userAnswerDiv.className = 'review-answer user-answer';
    userAnswerDiv.innerHTML = `<span class="label">Bạn chọn:</span> ${detail.userAnswer !== null ? currentExam.questions[index].options[detail.userAnswer] : 'Chưa làm'}`;
    reviewItem.appendChild(userAnswerDiv);

    if (!detail.isCorrect) {
      const correctAnswerDiv = document.createElement('div');
      correctAnswerDiv.className = 'review-answer correct-answer';
      correctAnswerDiv.innerHTML = `<span class="label">Đáp án đúng:</span> ${detail.correctAnswerText}`;
      reviewItem.appendChild(correctAnswerDiv);
    }

    reviewList.appendChild(reviewItem);
  });
}
