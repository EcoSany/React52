import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-container">
      <h1>Добро пожаловать в Pet Shop!</h1>
      <p>Здесь вы найдете всё необходимое для ваших питомцев!</p>
      <Link to="/catalog" className="shop-button">Перейти в каталог</Link>
    </div>
  );
}

export default Home;