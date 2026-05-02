import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Clients from "./pages/Clients.tsx";
import ClientDetail from "./pages/ClientDetail.tsx";
import Listings from "./pages/Listings.tsx";
import Activity from "./pages/Activity.tsx";
import Login from "./pages/Login.tsx";
import Pending from "./pages/Pending.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";
import { ClientsProvider } from "@/context/ClientsContext";
import { PropertiesProvider } from "@/context/PropertiesContext";
import { ActivityProvider } from "@/context/ActivityContext";
import { AuthProvider } from "@/context/AuthContext";
import { AddClientDialog } from "@/components/dashboard/AddClientDialog";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ClientsProvider>
            <PropertiesProvider>
              <ActivityProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/pending" element={<Pending />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/clients"
                    element={
                      <ProtectedRoute>
                        <Clients />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/clients/:id"
                    element={
                      <ProtectedRoute>
                        <ClientDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/listings"
                    element={
                      <ProtectedRoute>
                        <Listings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/activity"
                    element={
                      <ProtectedRoute>
                        <Activity />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin>
                        <Admin />
                      </ProtectedRoute>
                    }
                  />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <AddClientDialog />
              </ActivityProvider>
            </PropertiesProvider>
          </ClientsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
