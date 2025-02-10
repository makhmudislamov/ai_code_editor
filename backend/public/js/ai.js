"use strict";
import theme from "./theme.js";
import { sourceEditor } from "./ide.js";
// import { initializeLLMControls } from "./llm.js";
import { llmApi } from './llm_api.js';


const THREAD = [
    {
        role: "system",
        content: `
You are an AI assistant integrated into an online code editor.
Your main job is to help users with their code, but you should also be able to engage in casual conversation.

The following are your guidelines:
1. **If the user asks for coding help**:
   - Always consider the user's provided code.
   - Analyze the code and provide relevant help (debugging, optimization, explanation, etc.).
   - Make sure to be specific and clear when explaining things about their code.

2. **If the user asks a casual question or makes a casual statement**:
   - Engage in friendly, natural conversation.
   - Do not reference the user's code unless they bring it up or ask for help.
   - Be conversational and polite.

3. **If the user's message is ambiguous or unclear**:
   - Politely ask for clarification or more details to better understand the user's needs.
   - If the user seems confused about something, help guide them toward what they need.

4. **General Behavior**:
   - Always respond in a helpful, friendly, and professional tone.
   - Never assume the user's intent. If unsure, ask clarifying questions.
   - Keep the conversation flowing naturally, even if the user hasn't directly asked about their code.

You will always have access to the user's latest code.
Use this context only when relevant to the user's message.
If their message is unrelated to the code, focus solely on their conversational intent.
        `.trim()
    }
];


// Single func for handling message processing

async function handleChatMessage(userInputValue) {
    const userInput = document.getElementById("judge0-chat-user-input");
    const form = document.getElementById("judge0-chat-form");

    // Input validation
    if (!userInputValue || userInputValue.trim() === "") {
        return false;
    }

    // Set loading state
    userInput.disabled = true;
    form.classList.add("loading");

    // Create and display user message
    const userMessage = document.createElement("div");
    userMessage.innerText = userInputValue;
    userMessage.classList.add("ui", "small", "segment", "judge0-message", "judge0-user-message");
    if (!theme.isLight()) {
        userMessage.classList.add("inverted");
    }

    const messages = document.getElementById("judge0-chat-messages");
    messages.appendChild(userMessage);


    // Clear input and scroll to bottom
    userInput.value = "";
    messages.scrollTop = messages.scrollHeight;

    // Add message to thread
    THREAD.push({
        role: "user",
        content: `
User's code:
${sourceEditor.getValue()}

User's message:
${userInputValue}
`.trim()
    });

    // Create AI message container
    const aiMessage = document.createElement("div");
    aiMessage.classList.add("ui", "small", "basic", "segment", "judge0-message");
    if (!theme.isLight()) {
        aiMessage.classList.add("inverted");
    }

    try {
        const response = await llmApi.sendChatMessage(userInputValue, 'openai-gpt-4o-mini');
        
        // Extract the message content from the correct path
        const aiResponseValue = response.data.choices[0].message.content;
        console.log('AI Response:', aiResponseValue); // Should show "Hi! How can I assist you today?"
    
        THREAD.push({
            role: "assistant",
            content: aiResponseValue
        });
    
        // Parse markdown
        const markdownContent = marked.parse(aiResponseValue, {
            gfm: true,
            breaks: true
        });
    
        // Sanitize and set content
        const sanitizedContent = DOMPurify.sanitize(markdownContent);
        aiMessage.innerHTML = sanitizedContent;
    
        messages.appendChild(aiMessage);
        messages.scrollTop = messages.scrollHeight;
    } catch (error) {
        console.error("Error processing message:", error);
        aiMessage.innerHTML = "Sorry, there was an error processing your message.";
        messages.appendChild(aiMessage);

    } finally {
        // Reset UI state
        userInput.disabled = false;
        form.classList.remove("loading");
        userInput.focus();
    }

    return true;

    
}


// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("judge0-chat-form");

    // initializeLLMControls();
    
    // Handle form submission (Enter key and button click)
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const userInput = document.getElementById("judge0-chat-user-input");
        await handleChatMessage(userInput.value.trim());
    });
});


document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
            case "p":
                e.preventDefault();
                document.getElementById("judge0-chat-user-input").focus();
                break;
        }
    }
});
