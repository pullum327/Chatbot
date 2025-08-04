import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/build')));

const chatModel = new ChatOpenAI({
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ response: '請輸入訊息' });

  try {
    const response = await chatModel.invoke([new HumanMessage(message)]);
    res.json({ response: response.content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ response: '錯誤：無法取得回應' });
  }
});

// 前端路由支援
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(5000, '0.0.0.0', () => {
  console.log(`✅ Server running at http://0.0.0.0:5000`);
});
