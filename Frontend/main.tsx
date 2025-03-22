import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PrivyProvider } from "@privy-io/react-auth";

const privyAppId = `cm7d61lvy03c9gg4dqksb3rl7`; 

createRoot(document.getElementById("root")!).render(

    <PrivyProvider appId={privyAppId}>
    <App />
    </PrivyProvider>
);
