const { createApp, ref, onMounted, watch } = Vue;

createApp({
    setup() {
        const collections = ref([]);
        const message = ref("Hello vue!");
        const pickedCollection = ref();
        const answer = ref();
        const query = ref();
        const user = ref();

        const currentPdf = ref(
            "http://localhost:3300/pdfs/006914a3-8653-4aee-9df1-86c7d6e393b6.pdf"
        );

        onMounted(() => {
            fetch("http://localhost:3300/collections")
                .then((res) => {
                    return res.json();
                })
                .then((data) => {
                    console.log("new", data);
                    collections.value = data;
                });

            renderPdf(currentPdf.value);
        });

        // 監聽選擇的 PDF 檔案變化
        watch(pickedCollection, (newPdf) => {
            console.log("newPdf", newPdf.media);
            // log("newPdf", newPdf);
            renderPdf(`http://localhost:3300/pdfs/${newPdf.media}`);
        });

        // 初次渲染
        // renderPdf(currentPdf.value);

        function renderPdf(url) {
            const container = document.getElementById("pdf-container");
            if (!container) {
                console.error("找不到 pdf-container 元素");
                return;
            }
            // 清除之前的渲染內容
            container.innerHTML = "";

            // 載入 PDF 檔案
            pdfjsLib.getDocument(url).promise.then((pdfDoc_) => {
                // 渲染所有頁面
                for (let pageNum = 1; pageNum <= pdfDoc_.numPages; pageNum++) {
                    pdfDoc_.getPage(pageNum).then((page) => {
                        const scale = 1;
                        const viewport = page.getViewport({ scale });

                        // 建立文字圖層的 div
                        const textLayerDiv = document.createElement("div");
                        textLayerDiv.className = "textLayer";
                        textLayerDiv.style.position = "absolute";
                        textLayerDiv.style.top = "0";
                        textLayerDiv.style.left = "0";
                        textLayerDiv.style.height = `${viewport.height}px`;
                        textLayerDiv.style.width = `${viewport.width}px`;

                        // 建立 canvas 元素
                        const canvas = document.createElement("canvas");
                        const context = canvas.getContext("2d");
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        // 將 canvas 和文字圖層添加到容器
                        const pageContainer = document.createElement("div");
                        pageContainer.style.position = "relative";
                        pageContainer.appendChild(canvas);
                        pageContainer.appendChild(textLayerDiv);
                        container.appendChild(pageContainer);

                        // 渲染頁面內容
                        const renderContext = {
                            canvasContext: context,
                            viewport: viewport,
                        };

                        page.render(renderContext)
                            .promise.then(() => {
                                // 渲染文字圖層
                                return page.getTextContent();
                            })
                            .then((textContent) => {
                                pdfjsLib.renderTextLayer({
                                    textContent: textContent,
                                    container: textLayerDiv,
                                    viewport: viewport,
                                    textDivs: [],
                                });
                            });
                    });
                }
            });
        }

        const uploadPDF = async () => {
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
        };
        const ragQuery = () => {
            answer.value = null;
            user.value = query.value;
            console.log(
                "start query",
                `http://localhost:3300/query/${pickedCollection.value.name}`
            );

            fetch(`http://localhost:3300/query/${pickedCollection.value.name}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: query.value,
                }),
            })
                .then((res) => {
                    return res.json();
                })
                .then((data) => {
                    answer.value = data;
                    console.log("已經完成檢索");
                });
        };
        return {
            message,
            collections,
            pickedCollection,
            ragQuery,
            answer,
            query,
            user,
            currentPdf,
            uploadPDF,
        };
    },
}).mount("#app");
