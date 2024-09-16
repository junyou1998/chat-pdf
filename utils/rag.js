import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OllamaEmbeddings } from "@langchain/ollama";
import { ollamaService, chromaService } from "../config/environments/development.js";

const embeddings = new OllamaEmbeddings({
    model: ollamaService.embedModel,
    baseUrl: ollamaService.url,
});

const prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        "Answer the user's questions in Traditional Chinese, based on the context provided below:\n\n{context}'",
    ],
    ["human", "{input}"],
]);

const llm = new ChatOllama({
    model: ollamaService.model,
    baseUrl: ollamaService.url,
});


export async function queryRAG(query, collection) {

    const vectorStore = new Chroma(embeddings, {
        collectionName: collection,
        url: chromaService.url,
        collectionMetadata: {
            "hnsw:space": "cosine",
        }, // Optional, can be used to specify the distance method of the embedding space https://docs.trychroma.com/usage-guide#changing-the-distance-function
    });
    const retrievedDocs = await vectorStore.similaritySearchWithScore(query, 5); 

    
    const context = retrievedDocs
        .map(([doc, score]) => doc.pageContent)
        .join("\n");
    console.log("串起來的", context);

    const chain = prompt.pipe(llm);

    const test = await chain.invoke({
        context: context,
        input: query,
    });


    return test;
}
