if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const xss = require('xss-clean');
const logger = require('./utils/logger');
const isProduction = process.env.NODE_ENV === 'production';
const connectDB = require('./config/db');
const seedAdmin = require('./utils/seedAdmin');
const authRouter = require('./routes/auth');
connectDB();
seedAdmin();

// Validate JWT_SECRET strength on startup
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  logger.error('JWT_SECRET is missing or too short (must be at least 32 characters). Exiting.');
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;
const skillsRouter = require('./routes/skills');
const projectsRouter = require('./routes/projects');
const reviewsRouter = require('./routes/reviews');

app.use(helmet());
app.use(cors({
  origin: isProduction ? process.env.FRONTEND_URL : true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(xss());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

app.use(globalLimiter);
app.use(compression());

app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
);

// Root route placeholder
app.get('/', (req, res) => {
  res.send('Backend server running');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

app.use('/api/skills', skillsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/auth', authRouter);

app.use(require('./middleware/errorHandler'));

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

function shutdown(signal) {
  logger.info(`Received ${signal}. Shutting down server...`);
  server.close((err) => {
    if (err) {
      logger.error(err);
      process.exit(1);
      return;
    }
    logger.info('Server shutdown complete');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));


