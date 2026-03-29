// Biến toàn cục
let currentFilter = 'all';
let stickerCollection = [];

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
  loadCollection();
  setupEventListeners();
  loadAllStickers();
});

// Load bộ sưu tập từ localStorage
function loadCollection() {
  const collection = localStorage.getItem('stickerCollection');
  if (collection) {
    stickerCollection = JSON.parse(collection);
  }
  updateStats();
}

// Load tất cả stickers từ API
let allStickers = [];
function loadAllStickers() {
  fetch('/api/stickers')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        allStickers = data.stickers;
        displayCollection();
      }
    })
    .catch(error => {
      console.error('Lỗi khi tải stickers:', error);
    });
}

// Cập nhật thống kê
function updateStats() {
  const total = stickerCollection.length;
  const legendary = stickerCollection.filter(s => s.rarity === 'legendary').length;
  const epic = stickerCollection.filter(s => s.rarity === 'epic').length;
  const rare = stickerCollection.filter(s => s.rarity === 'rare').length;
  const common = stickerCollection.filter(s => s.rarity === 'common').length;

  document.getElementById('totalStickers').textContent = total;
  document.getElementById('legendaryCount').textContent = legendary;
  document.getElementById('epicCount').textContent = epic;
  document.getElementById('rareCount').textContent = rare;
  document.getElementById('commonCount').textContent = common;
}

// Hiển thị bộ sưu tập
function displayCollection() {
  const grid = document.getElementById('collectionGrid');
  const emptyState = document.getElementById('emptyState');

  if (stickerCollection.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  grid.style.display = 'grid';
  emptyState.style.display = 'none';
  grid.innerHTML = '';

  // Lọc theo loại
  let filteredCollection = stickerCollection;
  if (currentFilter !== 'all') {
    filteredCollection = stickerCollection.filter(s => s.rarity === currentFilter);
  }

  // Nhóm các sticker theo id để đếm số lượng
  const stickerGroups = {};
  filteredCollection.forEach(sticker => {
    if (!stickerGroups[sticker.id]) {
      stickerGroups[sticker.id] = {
        ...sticker,
        count: 0,
        collectedAt: []
      };
    }
    stickerGroups[sticker.id].count++;
    stickerGroups[sticker.id].collectedAt.push(sticker.collectedAt);
  });

  // Hiển thị từng sticker
  Object.values(stickerGroups).forEach(sticker => {
    const card = createStickerCard(sticker);
    grid.appendChild(card);
  });
}

// Tạo card sticker
function createStickerCard(sticker) {
  const card = document.createElement('div');
  card.className = `sticker-card ${sticker.rarity}`;
  card.style.background = `linear-gradient(135deg, ${sticker.color}22 0%, ${sticker.color}44 100%)`;

  const imageHtml = sticker.image ? `<img src="${sticker.image}" alt="${sticker.name}" class="sticker-image" onerror="this.parentElement.innerHTML='<div class=\\'sticker-emoji\\'>${sticker.emoji}</div>'">` : `<div class="sticker-emoji">${sticker.emoji}</div>`;

  card.innerHTML = `
    <div class="sticker-count">${sticker.count}x</div>
    <div class="sticker-image-container">${imageHtml}</div>
    <div class="sticker-info">
      <div class="sticker-name">${sticker.name}</div>
      <div class="sticker-rarity" style="color: ${sticker.color};">${sticker.rarityLabel}</div>
    </div>
  `;

  card.onclick = () => showStickerDetail(sticker);

  return card;
}

// Hiển thị chi tiết sticker
function showStickerDetail(sticker) {
  const modal = document.getElementById('stickerModal');
  const detail = modal.querySelector('.sticker-detail');

  const latestDate = new Date(Math.max(...sticker.collectedAt.map(d => new Date(d).getTime())));

  const detailImageHtml = sticker.image ? `<img src="${sticker.image}" alt="${sticker.name}" class="sticker-detail-image" onerror="this.replaceWith(document.createElement('div')).className='sticker-detail-emoji';this.textContent='${sticker.emoji}'">` : `<div class="sticker-detail-emoji">${sticker.emoji}</div>`;

  detail.innerHTML = `
    <div class="sticker-detail-display" style="background: linear-gradient(135deg, ${sticker.color}22 0%, ${sticker.color}44 100%);">
      ${detailImageHtml}
      <div class="sticker-detail-name">${sticker.name}</div>
      <div class="sticker-detail-rarity" style="color: ${sticker.color};">${sticker.rarityLabel}</div>
    </div>
    <div class="sticker-detail-info">
      <p><strong>Số lượng:</strong> ${sticker.count}</p>
      <p><strong>Lần cuối nhận:</strong> ${latestDate.toLocaleDateString('vi-VN')}</p>
      <p><strong>Tổng số lần nhận:</strong> ${sticker.collectedAt.length}</p>
    </div>
  `;

  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('show'), 10);
}

// Thiết lập event listeners
function setupEventListeners() {
  // Nút về trang chủ
  document.getElementById('backHome').addEventListener('click', () => {
    window.location.href = '/';
  });

  // Nút bắt đầu làm bài (khi chưa có sticker)
  const startExamBtn = document.getElementById('startExam');
  if (startExamBtn) {
    startExamBtn.addEventListener('click', () => {
      window.location.href = '/';
    });
  }

  // Nút lọc
  document.getElementById('filterAll').addEventListener('click', () => setFilter('all'));
  document.getElementById('filterLegendary').addEventListener('click', () => setFilter('legendary'));
  document.getElementById('filterEpic').addEventListener('click', () => setFilter('epic'));
  document.getElementById('filterRare').addEventListener('click', () => setFilter('rare'));
  document.getElementById('filterCommon').addEventListener('click', () => setFilter('common'));

  // Đóng modal
  document.querySelector('.close-modal').addEventListener('click', closeModal);
  document.getElementById('stickerModal').addEventListener('click', (e) => {
    if (e.target.id === 'stickerModal') {
      closeModal();
    }
  });
}

// Thiết lập bộ lọc
function setFilter(filter) {
  currentFilter = filter;

  // Cập nhật active state
  document.querySelectorAll('.collection-actions .btn').forEach(btn => {
    btn.classList.remove('active');
  });

  const activeBtn = document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }

  displayCollection();
}

// Đóng modal
function closeModal() {
  const modal = document.getElementById('stickerModal');
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}
