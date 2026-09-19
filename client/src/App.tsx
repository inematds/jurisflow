import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Clientes from "./pages/Clientes";
import Processos from "./pages/Processos";
import Atendimentos from "./pages/Atendimentos";
import Agenda from "./pages/Agenda";
import Tarefas from "./pages/Tarefas";
import Financeiro from "./pages/Financeiro";
import Documentos from "./pages/Documentos";
import AssistenteIA from "./pages/AssistenteIA";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/clientes" component={Clientes} />
      <Route path="/processos" component={Processos} />
      <Route path="/atendimentos" component={Atendimentos} />
      <Route path="/agenda" component={Agenda} />
      <Route path="/tarefas" component={Tarefas} />
      <Route path="/financeiro" component={Financeiro} />
      <Route path="/documentos" component={Documentos} />
      <Route path="/assistente-ia" component={AssistenteIA} />
      <Route path="/404" component={NotFound} />
      {/* Fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
