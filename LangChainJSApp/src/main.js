//Import statements for all the different chat models and their embeddings
import { OpenAIEmbeddings, ChatOpenAI, AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";
import { ChatXAI } from "@langchain/xai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { TogetherAI } from "@langchain/community/llms/togetherai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatCohere, CohereEmbeddings } from "@langchain/cohere";
import { ChatGroq } from "@langchain/groq";
import { MistralAI } from "@langchain/mistralai";

import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { fetchRepoContentsFromUrl } from "./utils";

/**
 * Method to get the response from the LLM 
 * @param {*} context the context for the RAG process
 * @param {*} query the query asked by the user
 * @param {*} llm the llm to be used for the query
 * @returns returns the result of the query based on the context
 */
async function generateResponse(context, query, llm) {
    const promptTemplate = ChatPromptTemplate.fromTemplate(`
        You are an expert assistant answering questions related to the repository data pulled from a GitHub repository.
        Use the following context to answer the query:

        Context:
        {context}

        Query:
        {query}

        Provide a detailed, accurate response based on the context provided.
        If you're unsure about something, please say so.
        
        Answer:
    `);

    const chain = RunnableSequence.from([
        promptTemplate,
        llm,
    ]);

    const response = await chain.invoke({
        context,
        query,
    });

    return response.content;
}


/**
 * Method to pull content from the repository and answer the query
 */
export async function pullFromRepo(){
    let files = [];
    const githubToken = document.getElementById('githubToken').value;
    const repoUrl = document.getElementById('sourceUrl').value;
    const apiKey = document.getElementById('apiKey').value;
    const chosenLLM = document.getElementById("aiModel").value;
    let llm;
    let embeddings;
    let needOtherAPIKey = false;
    switch(chosenLLM){
        case "OpenAI":
            //Need OpenAI Api Key
            llm = new ChatOpenAI({
                model: "gpt-4o-mini",
                temperature: 0,
                apiKey: apiKey
            });
            embeddings = new OpenAIEmbeddings({
                model: "text-embedding-3-small",
                apiKey: apiKey
            });
            break;
        case "Anthropic":
            llm = new ChatAnthropic({
                model: "claude-3-5-sonnet-20240620",
                apiKey: apiKey
            });
            //Need another API key for embedding
            needOtherAPIKey = true;
            break;
        case "Azure":
            llm = new AzureChatOpenAI({
                model: "gpt-4o",
                temperature: 0,
                azureOpenAIApiKey: apiKey
            });
            embeddings = new AzureOpenAIEmbeddings({
                azureOpenAIApiEmbeddingsDeploymentName: "text-embedding-ada-002"
            });
            break;
        case "Google":
            llm = new ChatGoogleGenerativeAI({
                model: "gemini-1.5-pro",
                temperature: 0,
                apiKey: apiKey
            });
            //Need another API key for embedding
            needOtherAPIKey = true;
            break;
        case "Cohere":
            llm = new ChatCohere({
                model: "command-r-plus",
                temperature: 0,
                apiKey: apiKey
            });
            embeddings = new CohereEmbeddings({
                model: "embed-english-v3.0"
            });
            break;
        case "FireworksAI":
            llm = new ChatFireworks({
                model: "accounts/fireworks/models/llama-v3p1-70b-instruct",
                temperature: 0,
                apiKey: apiKey
            });
            //Need another API key for embedding
            needOtherAPIKey = true;
            break;
        case "Groq":
            llm = new ChatGroq({
                model:"mixtral-8x7b-32768",
                temperature: 0,
                apiKey: apiKey
            });
            //Need another API key for embedding
            needOtherAPIKey = true;
            break;
        case "MistralAI":
            llm = new MistralAI({
                model: "codestral-latest",
                temperature: 0,
                apiKey: apiKey
            });
            //Need another API key for embedding
            needOtherAPIKey = true;
            break;
        //This is a langchian community LLM
        case "TogetherAI":
            llm = new TogetherAI({
                model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
                maxTokens: 256,
                apiKey: apiKey
            });
            needOtherAPIKey = true;
            //Need another API key for embedding
        default:
            console.log("Invalid LLM model selected");
    }
    if(needOtherAPIKey){
        const otherAPIKey = document.getElementById('otherApiKey').value;
        embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-small",
            apiKey: otherAPIKey
        });
    }
    const vectorStore = new MemoryVectorStore(embeddings);
    try{
        const urlType = document.getElementById('sourceType').value;
        const contents = await fetchRepoContentsFromUrl(repoUrl, urlType);
        console.log("Contents:", contents);
        // Run the documents through the splitter
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize:10000,
            chunkOverlap:2000
        });

        const allSplits = await splitter.splitDocuments(contents);
        console.log("Splitted Documents:", allSplits);
        // Add documents to vector store directly without separate embedding step
        await vectorStore.addDocuments(allSplits);

        const query = document.getElementById('userQuery').value;

        const topMatches = await vectorStore.similaritySearch(query, 5);
        console.log("Top matches:", topMatches);
        const context = topMatches.map((doc, i) => `Source ${i + 1}: ${doc.metadata.source}\n${doc.pageContent}`).join("\n\n");
        console.log("Context:", context);
        console.log("Query:", query);
        const answer = await generateResponse(context, query, llm);
        document.getElementById('response').innerText = answer;

    } catch(e){
        console.log("Error loading documents:", e);
    }
}

// Event listener Javascript code
document.addEventListener('DOMContentLoaded', () => {
    // Get references to HTML elements
    const button = document.getElementById('submitButton');

    // Add click event listener to the button
    button.addEventListener('click', () => {
        pullFromRepo();
    });
});

