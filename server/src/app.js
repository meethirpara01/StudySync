const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/auth.routes');
const studyGroupRoutes = require('./routes/studyGroup.routes');
const messageRoutes = require('./routes/message.routes');
const aiRoutes = require('./routes/ai.routes');

app.get('/', (req, res) => {
  res.send('StudySync API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/groups', studyGroupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
