// Xử lý form tạo đề thi
document.getElementById('examForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Lấy số lượng câu hỏi
  const questionCount = parseInt(document.getElementById('questionCount').value);

  // Lấy các loại câu hỏi được chọn
  const typeCheckboxes = document.querySelectorAll('#typeCheckboxes input[type="checkbox"]:checked');
  const types = Array.from(typeCheckboxes).map(cb => cb.value);

  // Nếu không chọn loại nào, mặc định chọn tất cả
  const selectedTypes = types.length > 0 ? types : null;

  // Lấy độ khó
  const difficulty = document.getElementById('difficulty').value;
  const selectedDifficulty = difficulty ? [difficulty] : null;

  // Tạo object dữ liệu
  const examData = {
    count: questionCount,
    types: selectedTypes,
    difficulty: selectedDifficulty
  };

  // Gọi API tạo đề thi
  fetch('/api/exam/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(examData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Lưu thông tin đề thi vào localStorage
      localStorage.setItem('currentExam', JSON.stringify(data.exam));
      // Chuyển đến trang làm bài
      window.location.href = '/exam';
    } else {
      alert('Lỗi: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Lỗi:', error);
    alert('Có lỗi xảy ra. Vui lòng thử lại!');
  });
});

// Thêm hiệu ứng khi chọn checkbox
const checkboxItems = document.querySelectorAll('.checkbox-item');
checkboxItems.forEach(item => {
  item.addEventListener('click', function(e) {
    if (e.target.tagName !== 'INPUT') {
      const checkbox = this.querySelector('input[type="checkbox"]');
      checkbox.checked = !checkbox.checked;
    }
  });
});

// Hiển thị số lượng sticker ở nút
function updateStickerCount() {
  const collection = JSON.parse(localStorage.getItem('stickerCollection') || '[]');
  const collectionBtn = document.getElementById('viewCollection');
  if (collectionBtn && collection.length > 0) {
    collectionBtn.innerHTML = `<span>📚 Bộ sưu tập (${collection.length})</span>`;
  }
}

// Cập nhật số lượng sticker khi tải trang
updateStickerCount();

// Xử lý nút xem bộ sưu tập
document.getElementById('viewCollection').addEventListener('click', function() {
  window.location.href = '/collection.html';
});

// Xử lý nút xem pet
document.getElementById('viewPet').addEventListener('click', function() {
  window.location.href = '/pet';
});

// Xử lý nút xem avatar
document.getElementById('viewAvatar').addEventListener('click', function() {
  window.location.href = '/avatar.html';
});