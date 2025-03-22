import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

const supabase = createClient(
  "https://babkbaruqlmmopetrvfx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhYmtiYXJ1cWxtbW9wZXRydmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMTAzMDQsImV4cCI6MjA1NzU4NjMwNH0.pLnieHeOegfQkXOQXP5z2DmAvOabwnmlc-LGgmqhg40"
);

function Register({ onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Пароли не совпадают!");
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: "http://localhost:5173/profile",
      },
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.user) {
      const { error: insertError } = await supabase.from("users").insert([
        { name, email, role: "user" }
      ]);

      if (insertError) {
        setMessage("Ошибка записи в БД: " + insertError.message);
        return;
      }

      setMessage("Проверьте почту для подтверждения!");
      setTimeout(() => {
        onClose();
        navigate("/profile");
      }, 2000);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Регистрация</h2>
        {message && <p className="error-message">{message}</p>}
        <form onSubmit={handleSubmit} className="register-form">
          <input type="text" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input type="password" placeholder="Подтвердите пароль" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <button type="submit">Зарегистрироваться</button>
        </form>
      </div>
    </div>
  );
}

export default Register;