import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OllamaEmbeddings } from "@langchain/ollama";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ollamaService, chromaService } from "../config/environments/development.js";
import crypto from 'crypto';


export async function vectorizer(filePath) {
    // load
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    // split
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    const splits = await textSplitter.splitDocuments(docs);

    // enbedding
    const embeddings = new OllamaEmbeddings({
        model: ollamaService.embedModel, // Default value
        baseUrl: ollamaService.url, // Default value
    });

    // const collectionName = filePath.split("/").pop().split(".")[0];
    const collectionName = crypto.randomUUID();

    const vectorStore = new Chroma(embeddings, {
        collectionName: `${collectionName}`,
        url: chromaService.url, // Optional, will default to this value
        collectionMetadata: {
            "hnsw:space": "cosine",
        },
    });

    // store
    const saveToVectorStore = await vectorStore.addDocuments(splits);



    console.log("完成向量儲存", saveToVectorStore);

    return {...saveToVectorStore, collection: collectionName};
}
