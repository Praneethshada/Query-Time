import { useEffect } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ClassroomPage from "./pages/ClassroomPage";
import ProfilePage from "./pages/ProfilePage";
import PrivateRoute from "./components/PrivateRoute";
import { selectCurrentUser } from "./features/authSlice";

function App() {
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    const theme = user?.theme || "light";
    document.body.dataset.theme = theme;
  }, [user?.theme]);

  return (
    <Router>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          {/* Protected Routes */}
          <Route path="" element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/class/:classId" element={<ClassroomPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/" element={<DashboardPage />} />
          </Route>
        </Routes>
      </main>
    </Router>
  );
}
export default App;
