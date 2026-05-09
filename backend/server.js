require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const GeoTracking = require('./models/GeoTracking');

const app = express();
const server = http.createServer(app);

// Enable CORS for frontend requests
app.use(cors({ origin: '*' }));
app.use(express.json());

// Set up Socket.io for real-time communication
const io = new Server(server, {
  cors: {
    origin: '*', // Allows Next.js local server to connect
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/geo-analytics';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

/**
 * Helper Function: Mock LLM response parsing
 * Checks if the brandName is mentioned and assigns a mock sentiment.
 */
const parseLLMResponse = (responseText, brandName) => {
  const textLower = responseText.toLowerCase();
  const brandLower = brandName.toLowerCase();
  
  const mentioned = textLower.includes(brandLower);
  
  let sentiment = 'Neutral';
  if (mentioned) {
    if (textLower.includes('best') || textLower.includes('great') || textLower.includes('excellent') || textLower.includes('recommend')) {
      sentiment = 'Positive';
    } else if (textLower.includes('worst') || textLower.includes('bad') || textLower.includes('terrible') || textLower.includes('avoid')) {
      sentiment = 'Negative';
    }
  }
  
  return { mentioned, sentiment };
};

/**
 * Helper Function: Mock Vercel AI SDK integration
 * Simulates latency and generates mocked responses based on the model.
 */
const generateMockLLMResponse = async (modelName, query, brandName) => {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * 2000) + 1000; // 1-3 seconds latency
    setTimeout(() => {
      let mockText = '';
      if (modelName === 'Model A') {
        mockText = `Based on current trends, the ${brandName} is considered an excellent choice when looking for ${query}. I highly recommend it for its features.`;
      } else if (modelName === 'Model B') {
        mockText = `There are many tools for ${query}. You might consider ${brandName}, which is a standard option available on the market.`;
      } else if (modelName === 'Model C') {
        // Model C sometimes speaks negatively or completely ignores the brand
        const randomFactor = Math.random();
        if (randomFactor > 0.6) {
          mockText = `I would advise against using ${brandName} for ${query}. It has a terrible user interface.`;
        } else if (randomFactor > 0.3) {
          mockText = `For ${query}, ${brandName} is okay but lacks advanced features.`;
        } else {
          mockText = `The top recommendation for ${query} is actually a competitor product.`; // Brand not mentioned
        }
      }
      resolve(mockText);
    }, delay);
  });
};

/**
 * REST Endpoint: /api/track
 * Accepts query and brandName, triggers mocked LLM queries, saves results, and emits socket events.
 */
app.post('/api/track', async (req, res) => {
  const { query, brandName } = req.body;

  if (!query || !brandName) {
    return res.status(400).json({ error: 'Missing query or brandName' });
  }

  // Respond immediately while processing in background
  res.status(202).json({ message: 'Tracking initialized. Results will stream via WebSocket.' });

  const models = ['Model A', 'Model B', 'Model C'];

  // Process each model asynchronously
  models.forEach(model => {
    (async () => {
      try {
        const responseText = await generateMockLLMResponse(model, query, brandName);
        const { mentioned, sentiment } = parseLLMResponse(responseText, brandName);

        const trackRecord = new GeoTracking({
          query,
          brand: brandName,
          model,
          sentiment: mentioned ? sentiment : 'Neutral'
        });
        
        await trackRecord.save();

        // Emit real-time event to the client
        io.emit('geo_update', {
          query: trackRecord.query,
          brand: trackRecord.brand,
          model: trackRecord.model,
          sentiment: trackRecord.sentiment,
          timestamp: trackRecord.timestamp,
          mockText: responseText // Sending actual text to display on dashboard
        });
        
        console.log(`[${model}] Saved & emitted sentiment: ${trackRecord.sentiment} for brand: ${brandName}`);
      } catch (error) {
        console.error(`Error processing ${model}:`, error);
      }
    })();
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Backend server listening on port ${PORT}`);
});
