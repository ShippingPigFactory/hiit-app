import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Nav from './components/Nav';
import HomePage from './pages/HomePage';
import TimerPage from './pages/TimerPage';
import HistoryPage from './pages/HistoryPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/timer/:templateId" element={<TimerPage />} />
          <Route
            path="/*"
            element={
              <>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/stats" element={<StatsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
                <Nav />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
