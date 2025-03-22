import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://babkbaruqlmmopetrvfx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhYmtiYXJ1cWxtbW9wZXRydmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMTAzMDQsImV4cCI6MjA1NzU4NjMwNH0.pLnieHeOegfQkXOQXP5z2DmAvOabwnmlc-LGgmqhg40"
);

function Login({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage("Ошибка входа. Проверьте email и пароль.");
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Вход</h2>
        {message && <p className="error-message">{message}</p>}
        <form onSubmit={handleLogin} className="login-form">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Войти</button>
        </form>
      </div>
    </div>
  );
}

export default Login;