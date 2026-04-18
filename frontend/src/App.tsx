import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import HistoryPage from './pages/HistoryPage';
import LivePage from './pages/LivePage';
import TournamentPage from './pages/TournamentPage';
import PuzzlePage from './pages/PuzzlePage';
import AnalysisPage from './pages/AnalysisPage';
import HomePage from './pages/HomePage';
import FriendsPage from './pages/FriendsPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import RightPanel from './components/RightPanel';
import './App.css';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <div className={`shell ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => !v)} />
        <div className="shell-right">
          <Topbar />
          <div className="shell-body">
            <main className="shell-main">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/lobby" element={<LobbyPage />} />
                <Route path="/live" element={<LivePage />} />
                <Route path="/tournament" element={<TournamentPage />} />
                <Route path="/puzzle" element={<PuzzlePage />} />
                <Route path="/analysis" element={<AnalysisPage />} />
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/game" element={<GamePage />} />
                <Route path="/history" element={<HistoryPage />} />
              </Routes>
            </main>
            <RightPanel />
          </div>
        </div>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#1e1e1e', color: '#fff', border: '1px solid #2a2a2a', borderRadius: '10px' },
          success: { iconTheme: { primary: '#f0c040', secondary: '#000' } },
        }}
      />
    </BrowserRouter>
  );
}
