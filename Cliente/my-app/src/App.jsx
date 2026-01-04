import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Login } from "./pages/Login";
import { Wait } from "./pages/Wait";
import "./main.css";
import { MainPage } from "./pages/MainPage";
import { socket } from "../socket";
import { useEffect } from "react";
// import { Lobby } from "./screens/Lobby";

// Criei esse componente separado porque o useLocation só funciona DENTRO do BrowserRouter
const RotasAnimadas = () => {
  const location = useLocation(); // O segredo está aqui!

  useEffect(() => {
    // Escuta quando o app é aberto por uma URL (ex: tolofoly://server?ip=192...)
    App.addListener("appUrlOpen", (data) => {
      console.log("URL Recebida:", data.url);

      // Lógica para extrair o IP ou comandos da URL
      const url = new URL(data.url.replace("tolofoly:/", "https://fake.com"));
      const serverIp = url.searchParams.get("ip");

      if (serverIp) {
        // Chame sua função de conectar ao socket aqui!
        console.log("Conectando ao servidor:", serverIp);
      }
    });
  }, []);
  return (
    // mode="wait" significa: "Espere a velha sair para a nova entrar"
    <AnimatePresence mode="wait">
      {/* O location e o key avisam o React que a página mudou */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Login />} />
        <Route path="/wait" element={<Wait />} />
        <Route path="/main" element={<MainPage />} />
        {/* <Route path="/lobby" element={<Lobby />} /> */}
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
