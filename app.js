import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { queryRAG } from "./utils/rag.js";
import { upload } from "./utils/pdfUploader.js";
import { vectorizer } from "./utils/vectorizer.js";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//首頁
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/index.html"));
});

//pdf上傳頁面
app.get("/pdf-upload", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/pdfUpload.html"));
});

//pdf聊天頁面
app.get("/pdf-chat",(req, res) =>{
  res.sendFile(path.join(__dirname, "/views/chatPDF.html"));
})

//取得向量資料庫collection資訊
app.get("/vectorCollection",async (req, res) =>{
  const result = await fetch("http://localhost:8000/api/v1/collections");
  const data = await result.json();

  return res.json(data);
})

//針對指定collection進行提問
app.post("/query/:collection", async (req, res) => {

  const answer = await queryRAG(req.body.query, req.params.collection);

  return res.json(answer);
})

//pdf上傳並處理資料向量儲存
app.post("/upload", upload.single("pdf"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("沒有文件被上傳。");
    }
    try {
        // 執行上傳後處理
        const filePath = path.join(__dirname, req.file.path);

        try {
            const result = await vectorizer(filePath);

            console.log("已完成向量轉換", result);
        } catch (error) {
            console.error("處理文件時發生錯誤:", error);
            res.status(500).send("文件上傳成功，但處理過程中發生錯誤。");
        }

        console.log(`完成的檔案名稱: ${req.file.filename}`);
        res.send("PDF 文件上傳成功並已處理!");
    } catch (error) {
        console.error("處理文件時發生錯誤:", error);
        res.status(500).send("文件上傳成功，但處理過程中發生錯誤。");
    }
});

export default app;
