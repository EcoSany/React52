import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import Loader from "../components/Loader";

const supabase = createClient(
  "https://babkbaruqlmmopetrvfx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhYmtiYXJ1cWxtbW9wZXRydmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMTAzMDQsImV4cCI6MjA1NzU4NjMwNH0.pLnieHeOegfQkXOQXP5z2DmAvOabwnmlc-LGgmqhg40"
);

function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedProducts = localStorage.getItem("products");
    const cachedCategories = localStorage.getItem("categories");
    const lastFetchTime = localStorage.getItem("lastFetchTime");

    if (cachedProducts && cachedCategories && lastFetchTime && Date.now() - lastFetchTime < 10 * 60 * 1000) {
      setProducts(JSON.parse(cachedProducts));
      setCategories(JSON.parse(cachedCategories));
      setLoading(false);
    }

    const fetchData = async () => {
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, name, description, price, categories_id, product_img");

      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name");

      if (productsError || categoriesError) {
        console.error("Ошибка загрузки данных:", productsError || categoriesError);
      } else {
        setProducts(productsData);
        setCategories(categoriesData);
        localStorage.setItem("products", JSON.stringify(productsData));
        localStorage.setItem("categories", JSON.stringify(categoriesData));
        localStorage.setItem("lastFetchTime", Date.now());
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory ? product.categories_id === selectedCategory : true;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <Loader />;

  return (
    <div className="catalog-container">
      <h1>Каталог</h1>
      <div className="filters-container">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="">Все категории</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img
                src={product.product_img || "https://images.live.vkplay.ru/user/19288702/avatar?change_time=1723472190"}
                alt={product.name}
                className="product-img"
              />
            </div>
            <h3>{product.name}</h3>
            <p className="product-price">{product.price} руб.</p>
            <p className="product-category">
              {
                categories.filter((category) => product.categories_id === category.id).map((category) => category.name)
              }
            </p>
            <Link to={`/product/${product.id}`} className="details-button">
              Подробнее
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalog;