document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById("pdfFile");
    const statusDiv = document.getElementById("uploadStatus");

    if (fileInput.files.length === 0) {
        statusDiv.textContent = "請選擇一個 PDF 文件";
        return;
    }

    const formData = new FormData();
    formData.append("pdf", fileInput.files[0]);

    statusDiv.textContent = "正在上傳...";

    try {
        const response = await fetch("http://localhost:3300/upload", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const result = await response.text();
            statusDiv.textContent = result;
        } else {
            statusDiv.textContent = "上傳失敗: " + response.statusText;
        }
    } catch (error) {
        statusDiv.textContent = "上傳出錯: " + error.message;
    }
});
