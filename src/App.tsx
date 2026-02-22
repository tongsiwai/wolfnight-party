// WolfNight Party - Multi-Device Edition
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/context/GameContext";
import Lobby from "./pages/Lobby";
import RoleSelection from "./pages/RoleSelection";
import PlayerView from "./pages/PlayerView";
import NightPhase from "./pages/NightPhase";
import DayPhase from "./pages/DayPhase";
import Victory from "./pages/Victory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Lobby />} />
            <Route path="/roles" element={<RoleSelection />} />
            <Route path="/player" element={<PlayerView />} />
            <Route path="/night" element={<NightPhase />} />
            <Route path="/day" element={<DayPhase />} />
            <Route path="/victory" element={<Victory />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
