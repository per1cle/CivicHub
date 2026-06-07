import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import Chatbot from "./components/Chatbot";
import { useAuth } from "./context/AuthContext";

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <AppRoutes />
      {user?.role !== "FUNCTIONAR" && <Chatbot />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}