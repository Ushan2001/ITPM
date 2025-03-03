import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Password } from "primereact/password";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import config from "../../config";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/actions";
import loginImage from "../../assests/loging.png";
import SignupForm from "./SignupForm";
import "./style.css";

const AdminLoginForm = ({ admin }) => {
  const [formData, setFormData] = useState(
    admin || {
      email: "",
      password: "",
    }
  );
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiUrl}/api/v1/user/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to log in");
      }

      if (!data.token || !data.userData.type) {
        throw new Error("Incomplete response data");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userType", data.userData.type);

      dispatch(
        loginSuccess({
          token: data.token,
          userType: data.userData.type,
        })
      );
      if (data.userData.type === "admin") {
        navigate("/admin-dashboard");
      } else if (data.userData.type === "buyer") {
        navigate("/buyer-dashboard");
      } else if (data.userData.type === "seller") {
        navigate("/seller-dashboard");
      }
    } catch (error) {
      console.error("Error:", error.message);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ width: "50%", float: "right" }}>
        <h1
          style={{
            color: "#03a6e9",
            fontSize: "45px",
            fontWeight: "bold",
            paddingLeft: "20px",
          }}
        >
          Buy Sell Nexus
        </h1>
        <h3
          style={{
            color: "#4caf50",
            fontSize: "30px",
            fontWeight: "lighter",
            paddingLeft: "20px",
            marginTop: "-15px",
          }}
        >
          Welcome Back
        </h3>
        <h2
          style={{
            color: "#708db6",
            fontWeight: "lighter",
            paddingLeft: "20px",
            marginTop: "-25px",
          }}
        >
          Login to continue
        </h2>
        <div className="p-fluid" style={{ padding: "20px" }}>
          <div className="p-field" style={{ marginBottom: "20px" }}>
            <label htmlFor="email" style={{ color: "#708db6" }}>
              Email
            </label>
            <InputText
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{ marginTop: "10px" }}
            />
          </div>
          <div className="p-field" style={{ marginBottom: "20px" }}>
            <label htmlFor="password" style={{ color: "#708db6" }}>
              Password
            </label>
            <Password
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{ marginTop: "10px" }}
              toggleMask
              feedback={false}
            />
          </div>
        </div>
        <div
          className="p-dialog-footer"
          style={{ float: "right", marginTop: "20px", paddingRight: "20px" }}
        >
          <Button
            label={
              loading ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <ProgressSpinner
                    style={{
                      width: "20px",
                      height: "20px",
                      marginRight: "5px",
                    }}
                  />
                </div>
              ) : (
                "Login"
              )
            }
            onClick={handleSubmit}
            severity="info"
            outlined
          />
        </div>
        <div className="account-container">
          <span>
            You don't have any account?{" "}
            <a
              href="##"
              className="signup-link"
              onClick={() => setVisible(true)}
            >
              Signup
            </a>
          </span>
        </div>

        <Toast ref={toast} />
      </div>

      <div
        style={{
          width: "50%",
          float: "left",
          height: "100vh",
          marginTop: "-100px",
          marginLeft: "-50px",
          position: "relative",
          background: "linear-gradient(180deg, #FFF9C4 1%, #FFEB3B 100%)",
        }}
      >
        <div
          style={{
            width: "64%",
            height: "22%",
            backgroundImage: `url(${loginImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto",
            marginTop: "35vh",
          }}
        ></div>
      </div>
      <Dialog
        header="Signup Form"
        visible={visible}
        style={{ width: "80%" }}
        onHide={() => setVisible(false)}
      >
        <SignupForm />
      </Dialog>
    </div>
  );
};

export default AdminLoginForm;
