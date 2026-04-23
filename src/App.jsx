import { useEffect, useState } from "react";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import BottomNav from "./components/layout/BottomNav";
import HomePage from "./pages/HomePage";
import ArchivePage from "./pages/ArchivePage";
import DetailPage from "./pages/DetailPage";
import StatsPage from "./pages/StatsPage";
import SearchPage from "./pages/SearchPage";
import ExportPage from "./pages/ExportPage";
import SettingsPage from "./pages/SettingsPage";
import { ROUTES } from "./constants/routes";
import { ApiKeyProvider } from "./contexts/ApiKeyContext";

export default function App() {
  const [route, setRoute] = useState(ROUTES.HOME);
  const [detailId, setDetailId] = useState(null);

  // 라우트 변경 시 스크롤 최상단으로
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [route, detailId]);

  const navigate = (next) => {
    setRoute(next);
    if (next !== ROUTES.DETAIL) setDetailId(null);
  };

  const openConversation = (id) => {
    setDetailId(id);
    setRoute(ROUTES.DETAIL);
  };

  const renderPage = () => {
    switch (route) {
      case ROUTES.HOME:
        return <HomePage onNavigate={navigate} />;
      case ROUTES.ARCHIVE:
        return <ArchivePage onOpenConversation={openConversation} />;
      case ROUTES.DETAIL:
        return (
          <DetailPage
            conversationId={detailId}
            onBack={() => navigate(ROUTES.ARCHIVE)}
          />
        );
      case ROUTES.STATS:
        return <StatsPage onOpenConversation={openConversation} />;
      case ROUTES.SEARCH:
        return <SearchPage onOpenConversation={openConversation} />;
      case ROUTES.EXPORT:
        return <ExportPage />;
      case ROUTES.SETTINGS:
        return <SettingsPage />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <ApiKeyProvider>
      <div className="min-h-screen bg-[#0a0a0f] text-slate-200">
        <Header onNavigate={navigate} />

        <div className="mx-auto flex max-w-7xl">
          <Sidebar currentRoute={route} onNavigate={navigate} />

          <main className="min-w-0 flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 md:pb-8">
            <div key={route} className="animate-fadeIn">
              {renderPage()}
            </div>
          </main>
        </div>

        <BottomNav currentRoute={route} onNavigate={navigate} />
      </div>
    </ApiKeyProvider>
  );
}
