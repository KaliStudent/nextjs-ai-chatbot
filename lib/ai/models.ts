export const DEFAULT_CHAT_MODEL: string = 'chat-model'; 

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Grok Vision',
    description: 'Advanced multimodal model with vision and text capabilities',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Grok Reasoning',
    description: 'Uses advanced chain-of-thought reasoning for complex problems',
  },
  {
    id: 'chat-model-resume',  // NEW
    name: 'Resume Assistant',
    description: 'Specialized assistant for answering questions about Brian’s resume and contact info',
  },
];
