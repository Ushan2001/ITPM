import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PanelMenu } from "primereact/panelmenu";
import { Menubar } from "primereact/menubar";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/actions";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import logo from "../../../assests/sidebar.png";
import "primereact/resources/themes/lara-dark-blue/theme.css";
import "primereact/resources/themes/lara-light-blue/theme.css";

const AppMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const largeScreen = window.innerWidth >= 1920;
  const toast = useRef(null);

  const [theme, setTheme] = useState("lara-light-blue");

  const toggleTheme = () => {
    const newTheme =
      theme === "lara-light-blue" ? "lara-dark-blue" : "lara-light-blue";
    setTheme(newTheme);
    const themeLink = document.getElementById("app-theme");
    themeLink.href = `https://cdn.jsdelivr.net/npm/primereact/resources/themes/${newTheme}/theme.css`;
  };

  const handleSignOutClick = () => {
    confirmDialog({
      message: "Are you sure you want to sign out?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        dispatch(logout());
        navigate("/");
      },
      reject: () => {
        toast.current.show({
          severity: "info",
          summary: "Cancelled",
          detail: "Sign-out was cancelled",
          life: 3000,
        });
      },
    });
  };

  const handleProfile = () => {
    navigate("/me");
  };

  const handleLogo = () => {
    navigate("/admin-dashboard");
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: "pi pi-chart-line",
      command: () => navigate("/admin-dashboard"),
    },
    {
      label: "Users",
      icon: "pi pi-users",
      expanded: false,
      items: [
        {
          label: "Permission",
          icon: "pi pi-exclamation-triangle",
          command: () => navigate("/inactive-users"),
        },
        {
          label: "User List",
          icon: "pi pi-list-check",
          command: () => navigate("/active-users"),
        },
      ],
    },
    {
      label: "Sellers",
      icon: "pi pi-users",
      expanded: false,
      items: [
        {
          label: "Seller List",
          icon: "pi pi-list-check",
          command: () => navigate("/sellers"),
        },
      ],
    },
    {
      label: "Documentation",
      icon: "pi pi-book",
      expanded: false,
      items: [
        {
          label: "User Reports",
          icon: "pi pi-file",
          command: () => navigate("/user-report"),
        },
      ],
    },
    {
      label: "Settings",
      icon: "pi pi-cog",
      expanded: false,
      items: [
        {
          label: "Add Polygon",
          icon: "pi pi-map",
          command: () => navigate("/polygon"),
        },
      ],
    },
  ];

  const start = (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img
        src={logo}
        alt="Logo"
        style={{
          width: "50%",
          height: "auto",
          marginLeft: "1px",
          cursor: "pointer",
        }}
        onClick={handleLogo}
      />
    </div>
  );

  const end = (
    <div style={{ display: "flex", alignItems: "center" }}>
      <i
        className={theme === "lara-light-blue" ? "pi pi-moon" : "pi pi-sun"}
        onClick={toggleTheme}
        style={{
          color: "#03a6e9",
          cursor: "pointer",
          fontSize: "larger",
          marginRight: "40px",
        }}
      />
      <i
        className="pi pi-user"
        style={{
          color: "#03a6e9",
          cursor: "pointer",
          fontSize: "larger",
          marginRight: "40px",
        }}
        onClick={handleProfile}
      />
      <i
        className="pi pi-sign-out"
        style={{
          color: "#03a6e9",
          cursor: "pointer",
          fontSize: "larger",
          marginRight: "50px",
        }}
        onClick={handleSignOutClick}
      />
    </div>
  );

  return (
    <>
      <link
        id="app-theme"
        rel="stylesheet"
        href={`https://cdn.jsdelivr.net/npm/primereact/resources/themes/${theme}/theme.css`}
      />
      <div
        className="app-menu"
        style={{
          width: "260px",
          position: "fixed",
          top: "0",
          bottom: "0",
          left: "0",
          zIndex: 1000,
        }}
      >
        <Toast ref={toast} />
        <ConfirmDialog />
        <Menubar
          start={start}
          end={end}
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            right: "0",
            height: "12vh",
          }}
        />
        <PanelMenu
          model={menuItems}
          style={{
            height: "calc(100vh - 12vh)",
            marginTop: largeScreen ? "150px" : "100px",
            marginLeft: "20px",
            paddingBottom: "50px",
            width: "260px",
            transition: "width 0.1s ease",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        />
      </div>
    </>
  );
};

export default AppMenu;
