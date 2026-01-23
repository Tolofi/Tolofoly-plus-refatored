import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Login } from "./pages/Login";
import { Wait } from "./pages/Wait";
import { MainPage } from "./pages/MainPage";
import { AuxiliarScreen } from "./pages/Auxiliar";
import { Outdated } from "./pages/Outdated";
import "./Main.css";
import "./boardCss.css";
import "./leilao.css"

import { useEffect } from "react";
import { socket } from "../socket";

import { StatusBar } from "@capacitor/status-bar";
import { NavigationBar } from "@capgo/capacitor-navigation-bar";
import { Capacitor } from "@capacitor/core";
import { Fullscreen } from "@boengli/capacitor-fullscreen";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { App as CapacitorApp } from "@capacitor/app";
import { Leilao } from "./pages/Leilao";

const RotasAnimadas = () => {
  const location = useLocation();

  useEffect(() => {}, [location]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Login />} />
        <Route path="/wait" element={<Wait />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/board" element={<AuxiliarScreen />} />
        <Route path="/outdated" element={<Outdated />} />
        <Route path="/leilao" element={<Leilao />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  useEffect(() => {
    const backButtonListener = CapacitorApp.addListener(
      "backButton",
      (data) => {
        // data.canGoBack = true se tiver histórico de navegação (ex: página anterior)
        // data.canGoBack = false se for a primeira página (Login ou Home)

        if (!data.canGoBack) {
          // Se não tiver pra onde voltar, MINIMIZA o app (vai pra home do celular)
          // Isso impede que o app feche/morra
          CapacitorApp.minimizeApp();
        } else {
          // Se tiver histórico (ex: você entrou num menu), deixa voltar normal
          window.history.back();
        }
      },
    );
    if (!Capacitor.isNativePlatform()) return;

    const init = async () => {
      try {
        await StatusBar.hide();
        await NavigationBar.hide({
          type: "immersiveSticky",
        });
      } catch (e) {
        console.warn("Erro inicial fullscreen", e);
      }
    };

    setTimeout(init, 1000);

    return () => {
      backButtonListener.then((listener) => listener.remove());
    };
  }, []);

  return (
    <BrowserRouter>
      <RotasAnimadas />
    </BrowserRouter>
  );
}

export default App;
