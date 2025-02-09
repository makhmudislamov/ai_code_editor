"use strict";

// Define available LLM providers with their specific models
const LLM_PROVIDERS = [
    {
        id: "openai-gpt-4o",
        name: "GPT-4o",
        provider: "OpenAI"
    },
    {
        id: "openai-gpt-4o-mini",
        name: "GPT-4o mini",
        provider: "OpenAI"
    },
    {
        id: "openai-o1",
        name: "o1",
        provider: "OpenAI"
    },
    {
        id: "claude-sonnet",
        name: "Claude 3.5 Sonnet",
        provider: "Anthropic"
    },
    {
        id: "claude-haiku",
        name: "Claude 3.5 Haiku",
        provider: "Anthropic"
    }
];

// Initialize LLM dropdown
function initializeLLMDropdown() {
    const $selectLLM = $("#judge0-llm-provider");
    
    // Clear existing options except placeholder
    $selectLLM.find('option:not([value=""])').remove();
    
    // Add providers
    const options = LLM_PROVIDERS.map(provider => 
        new Option(provider.name, provider.id)
    );
    
    // Append to dropdown
    $selectLLM.append(options);
    
    // Initialize Semantic UI dropdown
    $selectLLM.dropdown({
        fullTextSearch: true,
        onChange: function(value) {
            console.log("Selected LLM:", value);
            // TODO: Handle model selection
        }
    });
}

// Export functions
export { initializeLLMDropdown, LLM_PROVIDERS };