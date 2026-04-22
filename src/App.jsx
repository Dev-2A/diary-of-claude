import { useState } from "react";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import BottomNav from "./components/layout/BottomNav";
import HomePage from "./pages/HomePage";
import ArchivePage from "./pages/ArchivePage";
import StatsPage from "./pages/StatsPage";
import SearchPage from "./pages/SearchPage";
import ExportPage from "./pages/ExportPage";
import SettingsPage from "./pages/SettingsPage";
import { ROUTES } from "./constants/routes";

export default function App() {
  const [route, setRoute] = useState(ROUTES.HOME);

  const renderPage = () => {
    switch (route) {
      case ROUTES.HOME:
        return <HomePage onNavigate={setRoute} />;
      case ROUTES.ARCHIVE:
        return <ArchivePage />;
      case ROUTES.STATS:
        return <StatsPage />;
      case ROUTES.SEARCH:
        return <SearchPage />;
      case ROUTES.EXPORT:
        return <ExportPage />;
      case ROUTES.SETTINGS:
        return <SettingsPage />;
      default:
        return <HomePage onNavigate={setRoute} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200">
      <Header />

      <div className="mx-auto flex max-w-7xl">
        <Sidebar currentRoute={route} onNavigate={setRoute} />

        <main className="flex-1 px-6 py-8 pb-24 md:pb-8">{renderPage()}</main>
      </div>

      <BottomNav currentRoute={route} onNavigate={setRoute} />
    </div>
  );
}
