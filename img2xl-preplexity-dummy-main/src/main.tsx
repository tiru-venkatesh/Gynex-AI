import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";
import { AuthProvider } from "./auth/AuthContext";

const root = createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
