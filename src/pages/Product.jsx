import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import Modal from "react-modal";
import Loader from "../components/Loader";

const supabase = createClient(
  "https://babkbaruqlmmopetrvfx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhYmtiYXJ1cWxtbW9wZXRydmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMTAzMDQsImV4cCI6MjA1NzU4NjMwNH0.pLnieHeOegfQkXOQXP5z2DmAvOabwnmlc-LGgmqhg40"
);

Modal.setAppElement('#root');

function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [cart, setCart] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);

  const StarRating = ({ rating, setRating }) => { //тут пусть
    return (
      <div className="star-rating">
        {[...Array(5)].map((star, index) => {
          index += 1;
          return (
            <button
              type="button"
              key={index}
              className={index <= rating ? "on" : "off"}
              onClick={() => setRating(index)}
            >
              <span className="star">&#9733;</span>
            </button>
          );
        })}
      </div>
    );
  };

  const ReviewModal = ({ isOpen, onRequestClose, onSubmit }) => { //тут пусть
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    const handleSubmit = () => {
      onSubmit({ rating, comment });
      onRequestClose();
    };

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Оставить отзыв"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>Оставить отзыв</h2>
        <StarRating rating={rating} setRating={setRating} />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ваш комментарий..."
        />
        <button className="reviews-button" onClick={handleSubmit}>Отправить</button>
      </Modal>
    );
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      alert("Войдите в систему, чтобы оставить отзыв.");
      return;
    }

    const user = session.user;
    const userName = user.user_metadata?.name || "Анонимный пользователь";
    const { data, error } = await supabase
      .from("comments")
      .insert([{ product_id: id, user_name: userName, comment, estimation: rating }]);

    if (error) {
      console.error("ошибка отправки отзыва: ", error.message);
    } else {
      fetchReviews();
    }
  };

  const fetchReviews = async () => {
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("*")
      .eq("product_id", id)
      .order("created_at", { ascending: false });

    if (commentsError) {
      console.error("ошибка загрузки кментов: ", commentsError.message);
      return;
    }

    const reviewsWithUsers = comments.map((comment) => {
      return {
        ...comment,
        user: {
          name: comment.user_name.trim() ? comment.user_name : "Анонимный пользователь",
        },
      };
    });

    setReviews(reviewsWithUsers);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("ошибка загрузки товара: ", error.message);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
    fetchReviews();

    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, [id]);

  useEffect(() => {
    if (!loading && !product) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      setTimeout(() => {
        navigate("/catalog");
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [loading, product, navigate]);

  const addToCart = () => {
    const updatedCart = [...cart];
    const itemIndex = updatedCart.findIndex((item) => item.id === product.id);

    if (itemIndex === -1) {
      updatedCart.push({ ...product, quantity: 1 });
    } else {
      updatedCart[itemIndex].quantity += 1;
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const increaseQuantity = () => {
    const updatedCart = cart.map((item) =>
      item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
    );

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const decreaseQuantity = () => {
    const updatedCart = cart
      .map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const itemInCart = cart.find((item) => item.id === product?.id);

  if (loading) return <Loader />;

  if (!product) {
    return (
      <div className="not-found-page">
        <h1>Товар не найден</h1>
        <p>
          Вы будете перенаправлены в каталог через{" "}
          <span className="countdown">{countdown}</span> секунд.
        </p>
        <Link to="/catalog" className="back-link">
          ← Назад в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="product-header">
        <Link to="/catalog" className="back-link">
          ← Назад в каталог
        </Link>
      </div>
      <div className="product-content">
        <div className="product-image">
          <img
            src={product.product_img || "https://images.live.vkplay.ru/user/19288702/avatar?change_time=1723472190"}
            alt={product.name}
          />
        </div>
        <div className="product-details">
          <h1>{product.name}</h1>
          <h2>Описание</h2>
          <p className={`description ${isExpanded ? "expanded" : ""}`}>
            {isExpanded
              ? product.description
              : `${product.description.substring(0, 100)}...`}
          </p>
          {product.description.length > 100 && (
            <button
              className="toggle-description"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Свернуть" : "Читать дальше"}
            </button>
          )}
          <p className="price">{product.price} руб.</p>

          {!itemInCart ? (
            <button className="buy-button" onClick={addToCart}>
              Добавить в корзину
            </button>
          ) : (
            <div className="cart-controls">
              <button className="cart-button" onClick={decreaseQuantity}>
                −
              </button>
              <span className="cart-quantity">{itemInCart.quantity}</span>
              <button className="cart-button" onClick={increaseQuantity}>
                +
              </button>
            </div>
          )}
        </div>
      </div>
      <button className="reviews-button" onClick={() => setIsReviewModalOpen(true)}>
        Оставить отзыв
      </button>
      <div className="reviews-section">
        <h2>Отзывы</h2>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="review">
              <div className="review-header">
                <span className="review-user">
                  {review.user.name}
                  <span className="review-rating">
                    {Array(5)
                      .fill()
                      .map((_, index) => (
                        <span key={index} className={index < review.estimation ? "star-filled" : "star-empty"}>
                          {index < review.estimation ? "⭐" : "☆"}
                        </span>
                      ))}
                  </span>
                </span>
                <span className="review-date">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))
        ) : (
          <p>Пока нет отзывов. Будьте первым!</p>
        )}
      </div>
      <ReviewModal
        isOpen={isReviewModalOpen}
        onRequestClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}

export default Product;