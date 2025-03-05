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
  const isLoginPage = location.pathname === "/";
  const largeScreen = window.innerWidth >= 1920;
  const userType = localStorage.getItem("userType");

  return (
    <div
      style={{
        marginLeft:
          panelMenuVisible && !isLoginPage && isLoggedIn ? "250px" : "0",
        paddingTop: "60px",
      }}
    >
      {isLoggedIn && !isLoginPage && (
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
          <Route path="/" element={<LoginForm />} />
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
            path="/plygon"
            element={isLoggedIn ? <MapComponent /> : <LoginForm />}
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
