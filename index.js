import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
app.use(cors());
// 如果你不需要接受 POST JSON 也可以註解掉
app.use(express.json());

const chatModel = new ChatOpenAI({
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

// －－－－－－－－－－－－－－－－－－－
// 一定要放在 static / wildcard 前面！
// SSE GET /chat?message=… 路由
app.get('/chat', async (req, res) => {
  const message = req.query.message;
  if (!message) {
    res.status(400).end('Missing message');
    return;
  }

  // 設定 SSE 必要 header
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = await chatModel.stream([ new HumanMessage(message) ]);
    for await (const chunk of stream) {
      const text = chunk?.content ?? '';
      res.write(`data: ${text}\n\n`);
    }
    // 流結束標記
    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (err) {
    console.error(err);
    res.write(`data: 錯誤：無法取得回應\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  }
});
// －－－－－－－－－－－－－－－－－－－

// （可選）舊的 POST /chat：如果要保留一次性回應
// app.post('/chat', async (req, res) => {
//   const { message } = req.body;
//   if (!message) return res.status(400).json({ response: '請輸入訊息' });
//   try {
//     const response = await chatModel.invoke([new HumanMessage(message)]);
//     res.json({ response: response.content });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ response: '錯誤：無法取得回應' });
//   }
// });

// serve 前端
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../frontend/build')));

// wildcard：其他路由都回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(5000, '0.0.0.0', () => {
  console.log('✅ Server running at http://0.0.0.0:5000');
});
