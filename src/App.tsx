import React from 'react';
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Header from "@/components/Header";
import Simulation from "@/pages/Simulation";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { HashRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <HashRouter>
          <div className="flex flex-col min-h-screen bg-space">
            <Header />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/simulation" element={<Simulation />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* Toasters are usually rendered at the end of the app */}
            <Toaster />
            <Sonner />
          </div>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
