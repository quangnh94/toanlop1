const express = require('express');
const cors = require('cors');
const path = require('path');
const examRoutes = require('./routes/exam');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', examRoutes);

// Serve trang chủ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve trang làm bài
app.get('/exam', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'exam.html'));
});

// Serve trang bộ sưu tập sticker
app.get('/collection.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'collection.html'));
});

// Serve trang test âm thanh
app.get('/sound-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sound-test.html'));
});

// Serve trang pet
app.get('/pet', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pet.html'));
});

// Serve trang avatar
app.get('/avatar.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'avatar.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy trang'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Lỗi server',
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(``);
  console.log(`╔════════════════════════════════════════╗`);
  console.log(`║   Ứng dụng tạo đề thi Toán lớp 1       ║`);
  console.log(`║   Bắt đầu tại port ${PORT}                    ║`);
  console.log(`╚════════════════════════════════════════╝`);
  console.log(``);
  console.log(`Truy cập: http://localhost:${PORT}`);
  console.log(``);
});
