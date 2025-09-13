declare module 'node-telegram-bot-api' {
  interface TelegramBot {
    constructor(token: string, options?: any): TelegramBot;
    on(event: string, listener: (...args: any[]) => void): this;
    sendMessage(chatId: number, text: string, options?: any): Promise<any>;
    answerCallbackQuery(callbackQueryId: string, options?: any): Promise<any>;
    setWebHook(url: string): Promise<any>;
    stopPolling(): Promise<any>;
  }
  const TelegramBot: {
    new (token: string, options?: any): TelegramBot;
  }
  export = TelegramBot;
}