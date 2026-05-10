import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LatestPage from "./pages/LatestPage";
import SalesPage from "./pages/SalesPage";
import GamePage from "./pages/GamePage";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import CartModal from "./components/CartModal";
import IdleNotification from "./components/IdleNotification";
import Footer from "./components/Footer";
import PageLogger from "./components/PageLogger";

export default function App() {
  return (
    <>
      <PageLogger />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/latest" element={<LatestPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/game/:id" element={<GamePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>

      <Footer />
      <CartModal />
      <IdleNotification />
    </>
  );
}