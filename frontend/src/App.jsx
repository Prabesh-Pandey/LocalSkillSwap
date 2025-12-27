import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Offers from "./pages/Offers";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateOffer from "./pages/CreateOffer";
import OwnerBookings from "./pages/OwnerBookings";
import MyBookings from "./pages/MyBooking";
import OfferDetails from "./pages/OfferDetails";
import Profile from "./pages/Profile";
import EditOffer from "./pages/EditOffer";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<Offers />} />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-offer"
            element={
              <ProtectedRoute>
                <CreateOffer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner-bookings"
            element={
              <ProtectedRoute>
                <OwnerBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />

          <Route path="/offers/:id" element={<OfferDetails />} />
          <Route path="/offers" element={<Offers />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/offers/:id/edit"
            element={
              <ProtectedRoute>
                <EditOffer />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
