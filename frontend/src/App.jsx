import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import OnboardingScreen from './screens/OnboardingScreen';
import MainScreen from './screens/MainScreen';
import CompareScreen from './screens/CompareScreen';
import CalculatorScreen from './screens/CalculatorScreen';
import BookingFlowScreen from './screens/BookingFlowScreen';
import MyFdsScreen from './screens/MyFdsScreen';
import HelpScreen from './screens/HelpScreen';
import ChatScreen from './screens/ChatScreen';
import TopNav from './components/BottomNav';

function App() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden">
        {/* Single global header with logo + nav tabs */}
        <TopNav />

        {/* Page content */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          <Routes>
            <Route path="/home"       element={<MainScreen />} />
            <Route path="/compare"    element={<CompareScreen />} />
            <Route path="/calculator" element={<CalculatorScreen />} />
            <Route path="/booking"    element={<BookingFlowScreen />} />
            <Route path="/my-fds"     element={<MyFdsScreen />} />
            <Route path="/help"       element={<HelpScreen />} />
            <Route path="/chat"       element={<ChatScreen />} />
            <Route path="*"           element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/"  element={<OnboardingScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;