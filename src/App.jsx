import { useState, useEffect } from "react";
import "./index.css";
import AdminDashboard from "./components/adminDashboard";

const API_URL =
  import.meta.env.VITE_API_URL ?? "https://royal-n-api-1.onrender.com";

const roomsData = [
  {
    id: 1,
    key: "standard",
    name: "The Essential Stay",
    price: 450,
    package:
      "Perfect for the solo traveler. Includes High-Speed Fiber WiFi, Gourmet Breakfast for 1, and 24/7 Concierge access.",
    img: "/standard.jpg",
  },
  {
    id: 2,
    key: "deluxe",
    name: "The Royal Experience",
    price: 550,
    package:
      "Elevate your visit. Includes All-Day Pool & Gym access, Buffet Breakfast for 1, and a complimentary Welcome Drink on arrival.",
    img: "/deluxe.jpg",
  },
  {
    id: 3,
    key: "executive",
    name: "The Executive Retreat",
    price: 650,
    package:
      "Luxury without compromise. Includes Full Buffet Breakfast for 2, Private Balcony, Gym & Pool access, and Late Check-out privileges.",
    img: "/executive.jpg",
  },
];

const eventsData = [
  {
    id: 4,
    key: "hall",
    name: "Corporate Summit Hall",
    price: 3000,
    package:
      "Professional setting with 50 Chairs, 2 Presenter Tables, High-End Audio/Visual gear, and dedicated photography space.",
    img: "/hall.jpg",
  },
  {
    id: 5,
    key: "grounds",
    name: "The Grand Grounds",
    price: 4500,
    package:
      "Our premier outdoor space. Perfect for Weddings or Proposals. Includes bespoke setup, photography access, and evening lighting.",
    img: "/grounds.jpg",
  },
];

export default function App() {
  const [view, setView] = useState("guest");
  const [booking, setBooking] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState(false);

  const [availability, setAvailability] = useState({
    standard: true,
    deluxe: true,
    executive: true,
    hall: true,
    grounds: true,
  });

  const [dates, setDates] = useState({ start: "", end: "" });
  const [numNights, setNumNights] = useState(1);

  // ✅ Fetch availability once (no aggressive polling)
  useEffect(() => {
    const fetchAvail = async () => {
      try {
        const res = await fetch(`${API_URL}/api/availability`);
        if (res.ok) {
          const data = await res.json();
          setAvailability(data);
        }
      } catch (err) {
        console.error("Availability fetch error:", err);
      }
    };

    fetchAvail();
  }, []);

  // ✅ Correct date calculation logic
  useEffect(() => {
    if (dates.start && dates.end) {
      const s = new Date(dates.start);
      const e = new Date(dates.end);

      if (e > s) {
        const diff = Math.ceil(
          (e - s) / (1000 * 60 * 60 * 24)
        );
        setNumNights(diff);
      } else {
        setNumNights(1);
      }
    }
  }, [dates]);

  // ✅ Booking Submit (safer + defensive)
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!booking) return;

    const formData = new FormData(e.target);
    const guest_name = formData.get("guestName");
    const email = formData.get("email");

    const finalPrice =
      booking.id < 4
        ? booking.price * numNights
        : booking.price;

    const payload = {
      guest_name,
      email,
      room_type: booking.name,
      price: Number(finalPrice),
      start_date: dates.start,
      end_date: dates.end,
    };

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_URL}/api/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsSuccess(true);

        setTimeout(() => {
          setBooking(null);
          setIsSuccess(false);
          setDates({ start: "", end: "" });
        }, 3000);
      } else {
        const errorData = await response.json();
        alert(
          `Booking Error: ${
            errorData.error || "Server could not process booking"
          }`
        );
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Connection to server failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===========================
  // ADMIN VIEW
  // ===========================

  if (view === "admin")
    return <AdminDashboard setView={setView} />;

  if (view === "login") {
    return (
      <div className="login-wrapper">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (adminPassword === "admin123") {
              setView("admin");
              setLoginError(false);
            } else {
              setLoginError(true);
            }
          }}
          className="login-card"
        >
          <img src="/logo2.jpeg" alt="Logo" />
          <h3>Staff Portal</h3>

          <input
            type="password"
            placeholder="Password"
            value={adminPassword}
            onChange={(e) =>
              setAdminPassword(e.target.value)
            }
            className={loginError ? "error-input" : ""}
          />

          <button type="submit">Login</button>

          <p onClick={() => setView("guest")}>
            Return Home
          </p>
        </form>
      </div>
    );
  }

  // ===========================
  // GUEST VIEW
  // ===========================

  return (
    <div className="main-wrapper">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-flex">
          <div className="logo">
            <img src="/logo2.jpeg" alt="Logo" />
            <span>ROYAL 'N' HOTEL</span>
          </div>
          <ul className="nav-links">
            <li><a href="#rooms">Rooms</a></li>
            <li><a href="#events">Events</a></li>
          </ul>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero-section">
        <div>
          <h1>Experience Timeless Elegance</h1>
          <p>Luxury redefined in the heart of the city.</p>
        </div>
      </header>

      {/* ROOMS */}
      <section id="rooms" className="section">
        <h2>Our Rooms</h2>
        <div className="grid">
          {roomsData.map((room) => (
            <div key={room.id} className="card">
              <div
                className="card-image"
                style={{
                  backgroundImage: `url(${room.img})`,
                }}
              >
                {!availability[room.key] && (
                  <div className="overlay">FULL</div>
                )}
              </div>

              <div className="card-body">
                <h3>{room.name}</h3>
                <p>{room.package}</p>

                <div className="card-footer">
                  <span>
                    GH₵ {room.price}/night
                  </span>
                  <button
                    onClick={() => setBooking(room)}
                    disabled={!availability[room.key]}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EVENTS */}
      <section id="events" className="section light">
        <h2>Events & Grounds</h2>
        <div className="grid">
          {eventsData.map((event) => (
            <div key={event.id} className="card">
              <div
                className="card-image"
                style={{
                  backgroundImage: `url(${event.img})`,
                }}
              >
                {!availability[event.key] && (
                  <div className="overlay">BOOKED</div>
                )}
              </div>

              <div className="card-body">
                <h3>{event.name}</h3>
                <p>{event.package}</p>

                <div className="card-footer">
                  <span>
                    GH₵ {event.price} (Flat)
                  </span>
                  <button
                    onClick={() => setBooking(event)}
                    disabled={!availability[event.key]}
                  >
                    Enquire Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BOOKING MODAL */}
      {booking && (
        <div
          className="modal-overlay"
          onClick={() => setBooking(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {!isSuccess ? (
              <form onSubmit={handleBookingSubmit}>
                <h3>Reserve {booking.name}</h3>

                <input
                  name="guestName"
                  placeholder="Full Name"
                  required
                />

                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                />

                <div className="date-row">
                  <input
                    type="date"
                    value={dates.start}
                    required
                    min={new Date()
                      .toISOString()
                      .split("T")[0]}
                    onChange={(e) =>
                      setDates({
                        ...dates,
                        start: e.target.value,
                      })
                    }
                  />

                  <input
                    type="date"
                    value={dates.end}
                    required
                    min={dates.start}
                    onChange={(e) =>
                      setDates({
                        ...dates,
                        end: e.target.value,
                      })
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Processing..."
                    : `Confirm (GH₵ ${
                        booking.id < 4
                          ? (
                              booking.price *
                              numNights
                            ).toLocaleString()
                          : booking.price.toLocaleString()
                      })`}
                </button>
              </form>
            ) : (
              <div className="success-message">
                <h2>✓ Request Sent!</h2>
                <p>Check your email for details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
