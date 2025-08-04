# 🤖 Chatbot Web App (LangChain + React)

本專案是一個基於 **React + Node.js + LangChain (OpenAI API)** 的 AI 聊天機器人，前後端皆可部署至 **AWS EC2** 伺服器。

---

## 🌐 展示 (Demo)

<img width="766" height="823" alt="image" src="https://github.com/user-attachments/assets/da29bb8a-7613-4949-922c-b0fcad779275" />


---

## ⚙️ 技術架構

| 技術 | 說明 |
|------|------|
| React | 前端 UI |
| Node.js + Express | 後端伺服器 |
| LangChain + OpenAI | AI 對話引擎 |
| AWS EC2 | 雲端部署平台 |
| serve | 前端靜態檔案部署工具 |

## 📁 專案結構

Chatbot/
├── frontend/ # React 前端
│ └── src/
│ └── App.js
│ └── App.css
├── backend/ # Express 後端
│ └── index.js
│ └── .env # OpenAI 金鑰設定
└── README.md

建立 .env
cd ~/chatbot/backend
nano .env
# 貼上你的 OPENAI_API_KEY

前端
cd frontend
npm install
npm start

後端
ssh -i chatbot.pem ubuntu@57.183.28.41
cd backend
node index.js

測試 API
curl -X POST http://<EC2_IP>:5000/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"你好"}'
