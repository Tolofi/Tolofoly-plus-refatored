import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Login } from "./pages/Login";
import { Wait } from "./pages/Wait";
import "./Main.css";
import "./boardCss.css"
import { MainPage } from "./pages/MainPage";
import { useEffect } from "react";
// Importar o socket garante que ele inicialize e leia a URL do PWA
import { socket } from "../socket";
import { AuxiliarScreen } from "./pages/Auxiliar";

const RotasAnimadas = () => {
  const location = useLocation();

  useEffect(() => {
    // Como você está usando PWA, o "Inject" de IP já foi feito
    // automaticamente no arquivo '../socket.js' através do window.location.search.
    // Não precisamos mais do App.addListener aqui.
    console.log("App PWA iniciado na rota:", location.pathname);
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Login />} />
        <Route path="/wait" element={<Wait />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/board" element={<AuxiliarScreen />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <RotasAnimadas />
    </BrowserRouter>
  );
}

export default App;
