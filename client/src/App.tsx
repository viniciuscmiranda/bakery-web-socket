import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./global.css";
import { ChatPicker } from "./components/chat-picker";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatPicker />
    </QueryClientProvider>
  );
}
