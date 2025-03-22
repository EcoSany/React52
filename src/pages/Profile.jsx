import React, { useState, useEffect, useContext } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const supabase = createClient(
    "https://babkbaruqlmmopetrvfx.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhYmtiYXJ1cWxtbW9wZXRydmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMTAzMDQsImV4cCI6MjA1NzU4NjMwNH0.pLnieHeOegfQkXOQXP5z2DmAvOabwnmlc-LGgmqhg40"
);

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Ошибка получения сессии:", error.message);
            } else {
                setUser(session?.user || null);
            }
            setLoading(false);
        };

        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            navigate("/");
        }
    }, [loading, user, navigate]);

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) return setMessage("Введите новый пароль в оба поля");
        if (newPassword !== confirmPassword) return setMessage("Пароли не совпадают");

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            setMessage(`Ошибка: ${error.message}`);
        } else {
            setMessage("Пароль успешно изменен!");
            setNewPassword("");
            setConfirmPassword("");
        }
    };

    const handleResendConfirmation = async () => {
        if (!user?.email) return;
        const { error } = await supabase.auth.resend({ type: "signup", email: user.email });
        if (error) {
            setMessage(`Ошибка: ${error.message}`);
        } else {
            setMessage("Письмо с подтверждением отправлено!");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className={`profile-container`}>
            <div className="profile-content">
                <div className="profile-avatar">
                    <img src="https://cdn0.iconfinder.com/data/icons/team-work-and-organization-2/128/78-1024.png" />
                </div>

                <div className="profile-info">
                    <p><strong>Имя:</strong> {user?.user_metadata?.name || "Не указано"}</p>
                    <p><strong>Email: </strong>
                        <span className={user?.email_confirmed_at ? "email-confirmed" : "email-unconfirmed"}>
                            {user?.email}
                        </span>
                    </p>
                    <p><strong>Дата регистрации:</strong> {new Date(user?.created_at).toLocaleDateString()}</p>
                    {user?.user_metadata?.role && user.user_metadata.role !== "user" && (
                        <p><strong>Роль:</strong> {user.user_metadata.role}</p>
                    )}
                </div>
            </div>

            <div className="profile-actions">
                <div className="card">
                    <h2>Смена пароля</h2>
                    <input
                        type="password"
                        placeholder="Новый пароль"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Подтвердите пароль"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button className="change-button" onClick={handleChangePassword}>
                        Сменить пароль
                    </button>
                </div>

                {!user?.email_confirmed_at && (
                    <div className="card">
                        <h2>Подтверждение Email</h2>
                        <button className="confirm-button" onClick={handleResendConfirmation}>
                            Подтвердить Email
                        </button>
                    </div>
                )}
            </div>

            {message && <p className="message">{message}</p>}
        </div>
    );
}

export default Profile;