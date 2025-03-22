import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { ThemeContext } from "../context/ThemeContext";
import Login from "./Login";
import Register from "./Register";

const supabase = createClient(
  "https://babkbaruqlmmopetrvfx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhYmtiYXJ1cWxtbW9wZXRydmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMTAzMDQsImV4cCI6MjA1NzU4NjMwNH0.pLnieHeOegfQkXOQXP5z2DmAvOabwnmlc-LGgmqhg40"
);

function Header() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
    };

    fetchUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => authListener?.subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <header className="header-container">
      <nav className="nav-links">
        <Link to="/">Главная</Link>
        <Link to="/catalog">Каталог</Link>
        <Link to="/cart">Корзина</Link>
      </nav>
      <div className="auth-section">
        {user ? (
          <>
            <Link to="/profile" className="profile-link">Профиль</Link>
            <button className="logout-button" onClick={handleLogout}>Выход</button>
          </>
        ) : (
          <>
            <button className="btn" onClick={() => setIsLoginOpen(true)}>Вход</button>
            <button className="btn" onClick={() => setIsRegisterOpen(true)}>Регистрация</button>
          </>
        )}
        <label className="theme-switch">
          <input type="checkbox" checked={theme === "dark"} onChange={toggleTheme} />
          <span className="slider round"></span>
        </label>
      </div>
      {isLoginOpen && <Login onClose={() => setIsLoginOpen(false)} />}
      {isRegisterOpen && <Register onClose={() => setIsRegisterOpen(false)} />}
    </header>
  );
}

export default Header;