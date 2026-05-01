import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import ClientDetail from "./pages/ClientDetail.tsx";
import Listings from "./pages/Listings.tsx";
import NotFound from "./pages/NotFound.tsx";
import { ClientsProvider } from "@/context/ClientsContext";
import { PropertiesProvider } from "@/context/PropertiesContext";
import { AddClientDialog } from "@/components/dashboard/AddClientDialog";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ClientsProvider>
        <PropertiesProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <AddClientDialog />
        </PropertiesProvider>
      </ClientsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
