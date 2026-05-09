# GEO Analytics Platform MVP

This is a Minimum Viable Product (MVP) for a Generative Engine Optimization (GEO) analytics platform. It tracks how often and in what context a brand is mentioned by major Large Language Models (LLMs).

## Architecture & Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, TypeScript, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io (for real-time streaming).
- **Database**: MongoDB (via Mongoose) to persist tracking data.

## Features
- **Real-Time Data Streaming**: Uses WebSockets (`socket.io`) to stream LLM responses to the frontend live.
- **Glassmorphic UI**: A modern, sleek dashboard to view tracked mentions.
- **Mock LLM Integration**: Simulates varying latencies and AI responses across multiple models (Model A, B, and C).
- **Sentiment Analysis**: Parses responses to assign positive, neutral, or negative sentiment.

## How to Run Locally

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Set up your environment variables:
   Ensure your `.env` file contains your MongoDB URI:
   ```env
   MONGODB_URI="your_mongodb_atlas_connection_string"
   ```
3. Install dependencies and start the server:
   ```bash
   npm install
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal tab and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies and start the Next.js server:
   ```bash
   npm install
   npm run dev
   ```
3. Open your browser and go to `http://localhost:3000`.
