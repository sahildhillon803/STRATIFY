import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './auth.store'; // Pulls the token from your existing auth store

// Define the types for TypeScript
interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

interface CfoState {
  chatHistory: ChatMessage[];
  monthlyReport: string | null;
  isProcessingChat: boolean;
  isGeneratingReport: boolean;
  
  // Actions
  sendUserMessage: (text: string) => Promise<void>;
  fetchExecutiveReport: () => Promise<void>;
  resetChatSession: () => void;
}

export const useCfoStore = create<CfoState>((set) => ({
  // Initial State
  chatHistory: [{ 
    role: 'ai', 
    text: 'Hello. I have loaded your financial ledgers. What metrics would you like to review?' 
  }],
  monthlyReport: null,
  isProcessingChat: false,
  isGeneratingReport: false,

  // Action: Send a message to the Chat API
  sendUserMessage: async (text: string) => {
    // 1. Append user input to the chat UI instantly and show loading state
    set((state) => ({ 
      chatHistory: [...state.chatHistory, { role: 'user', text }],
      isProcessingChat: true 
    }));

    try {
      // 2. Get the current user's token for security
      const token = useAuthStore.getState().token;
      
      // 3. Make the API call to your FastAPI backend
      const res = await axios.post(
        '/api/v1/ai/chat', 
        { message: text, context_months: 12 }, // We feed it the last 12 months of context
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 4. Append the AI's response to the chat UI
      set((state) => ({
        chatHistory: [...state.chatHistory, { role: 'ai', text: res.data.response }]
      }));
    } catch (err) {
      console.error("CFO Chat Error:", err);
      set((state) => ({
        chatHistory: [...state.chatHistory, { role: 'ai', text: 'Error connecting to the financial engine. Please try again.' }]
      }));
    } finally {
      // 5. Turn off the typing indicator
      set({ isProcessingChat: false });
    }
  },

  // Action: Fetch the Monthly Board Update
  fetchExecutiveReport: async () => {
    set({ isGeneratingReport: true });
    try {
        const token = useAuthStore.getState().token;
        const res = await axios.post(
          '/api/v1/ai/report', 
          {}, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        set({ monthlyReport: res.data.report });
    } catch (err) {
        console.error("CFO Report Error:", err);
        set({ monthlyReport: "Failed to compile the executive summary. Ensure you have financial data imported." });
    } finally {
        set({ isGeneratingReport: false });
    }
  },

  // Action: Clear the chat
  resetChatSession: () => set({ 
    chatHistory: [{ role: 'ai', text: 'Chat reset. How else can I assist?' }] 
  })
}));