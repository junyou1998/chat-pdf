import app from './app.js';
import { server } from './config/environments/development.js';

const port = server.port;

// 啟動服務器
app.listen(port, () => {
    console.log(`服務器運行在 http://localhost:${port}`);
});