
```typescript
namespace TheQuantumAssistant {
    type Utterance = {
        readonly role: "user" | "assistant";
        readonly text: string;
    };

    type FinancialSnapshot = string;
    
    class TheAssistantMind {
        private readonly chatHistory: Utterance[];
        private readonly geminiChat: any;
        
        constructor() {
            this.chatHistory = [];
            this.geminiChat = {};
            this.initializeSystemPersona();
        }
        
        private initializeSystemPersona(): void {
            const systemInstruction = "You are Quantum, an AI assistant for the Demo Bank application. You have access to a real-time snapshot of the user's financial data to answer their questions. Be helpful, concise, and professional. Use the provided data to inform your answers.";
            this.geminiChat.systemInstruction = systemInstruction;
        }
        
        public async answerQuery(query: string, snapshot: FinancialSnapshot): Promise<string> {
            this.chatHistory.push({ role: "user", text: query });
            const promptWithContext = `${query}\n\n${snapshot}`;
            const responseText: string = await this.geminiChat.sendMessageStream(promptWithContext);
            this.chatHistory.push({ role: "assistant", text: responseText });
            return responseText;
        }
    }
    
    class TheFinancialDataScribe {
        public static createSnapshot(context: any): FinancialSnapshot {
            const summary = `
            --- FINANCIAL DATA SNAPSHOT ---
            - Total Balance: ${context.totalBalance}
            - Recent Transactions (last 3): ${context.recentTransactions}
            - Budgets: ${context.budgets}
            -----------------------------`;
            return summary.trim();
        }
    }

    class TheChatbotComponent {
        private readonly assistant: TheAssistantMind;
        private readonly scribe: TheFinancialDataScribe;

        constructor() {
            this.assistant = new TheAssistantMind();
            this.scribe = new TheFinancialDataScribe();
        }

        public render(): React.ReactElement {
            const ChatButton = React.createElement('button');
            const ChatWindow = React.createElement('div');
            return React.createElement('div', null, ChatButton, ChatWindow);
        }
    }
    
    function startAConversation(): void {
        const chatbot = new TheChatbotComponent();
        const renderedChatbot = chatbot.render();
    }
}
```
