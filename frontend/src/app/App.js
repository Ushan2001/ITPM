import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useSelector } from "react-redux";
import AdminAppMenu from "../components/admin/AppMenu";
import SellerAppMenu from "../components/seller/AppMenu";
import { Provider } from "react-redux";
import { createStore } from "redux";
import rootReducer from "../store/reducers";
import LoginForm from "../features/Users/LoginForm";
import Profile from "../features/Users/Profile";
import ActiveUsers from "../features/Admin/UsersList/ActiveUsers";
import InactiveUsers from "../features/Admin/UsersList/InactiveUsers";
import MapComponent from "../features/Admin/Polygon/MarkPolygon";
import SellerComponent from "../features/Admin/Sellers/SellerComponent";
import MapComponentMark from "../features/Admin/Polygon/MapComponent";
import LandingPage from "../pages/LandingPage";
import SignupForm from "../features/Users/SignupForm";
import ByuerProfile from "../features/Buyer/Profile/Profile";
import SellersList from "../features/Buyer/SellersList/SellersList";
import AdminDashboard from "../features/Admin/Dashboard/Dashboard";
import AddSupplier from "../features/Seller/Suppliers/AddSupplier";
import SupplierComponent from "../features/Seller/Suppliers/SupplierComponent";

const store = createStore(rootReducer);

const App = () => {
  const [panelMenuVisible, setPanelMenuVisible] = useState(true);
  const isLoggedIn = useSelector((state) => state.authReducer.isLoggedIn);

  return (
    <Provider store={store}>
      <Router>
        <AppContent
          panelMenuVisible={panelMenuVisible}
          setPanelMenuVisible={setPanelMenuVisible}
          isLoggedIn={isLoggedIn}
        />
      </Router>
    </Provider>
  );
};

const AppContent = ({ panelMenuVisible, setPanelMenuVisible, isLoggedIn }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const isLoginPage = location.pathname === "/login";
  const isSignUpPage = location.pathname === "/signup";
  const isProfilePage = location.pathname === "/profile";
  const isSellerListPage = location.pathname === "/sellers-list";
  const largeScreen = window.innerWidth >= 1920;
  const userType = localStorage.getItem("userType");

  return (
    <div
      style={{
        marginLeft:
          panelMenuVisible &&
          !isLandingPage &&
          !isSignUpPage &&
          !isLoginPage &&
          !isProfilePage &&
          !isSellerListPage &&
          isLoggedIn
            ? "250px"
            : "0",
        paddingTop: "60px",
      }}
    >
      {isLoggedIn &&
        !isLandingPage &&
        !isLoginPage &&
        !isSignUpPage &&
        !isSellerListPage &&
        !isProfilePage && (
          <>
            {userType === "admin" ? (
              <AdminAppMenu
                panelMenuVisible={panelMenuVisible}
                setPanelMenuVisible={setPanelMenuVisible}
              />
            ) : userType === "seller" ? (
              <SellerAppMenu
                panelMenuVisible={panelMenuVisible}
                setPanelMenuVisible={setPanelMenuVisible}
              />
            ) : null}
          </>
        )}
      <div
        style={{
          marginLeft: "50px",
          marginTop: !isLoginPage && largeScreen ? "90px" : "40px",
          marginRight: "50px",
        }}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/profile" element={<ByuerProfile />} />
          <Route path="/sellers-list" element={<SellersList />} />
          <Route
            path="/me"
            element={isLoggedIn ? <Profile /> : <LoginForm />}
          />
          <Route
            path="/active-users"
            element={isLoggedIn ? <ActiveUsers /> : <LoginForm />}
          />
          <Route
            path="/inactive-users"
            element={isLoggedIn ? <InactiveUsers /> : <LoginForm />}
          />
          <Route
            path="/polygon"
            element={isLoggedIn ? <MapComponent /> : <LoginForm />}
          />
          <Route
            path="/sellers"
            element={isLoggedIn ? <SellerComponent /> : <LoginForm />}
          />
          <Route
            path="/get-polygon"
            element={isLoggedIn ? <MapComponentMark /> : <LoginForm />}
          />
          <Route
            path="/admin-dashboard"
            element={isLoggedIn ? <AdminDashboard /> : <LoginForm />}
          />
          <Route
            path="/add-supplier"
            element={isLoggedIn ? <AddSupplier /> : <LoginForm />}
          />
          <Route
            path="/suppliers"
            element={isLoggedIn ? <SupplierComponent /> : <LoginForm />}
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
