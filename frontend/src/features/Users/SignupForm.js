import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import axios from "axios";
import config from "../../config";

const SignupForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState({
    name: "",
    longitude: null,
    latitude: null,
  });
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({
    lat: 6.9271,
    lng: 79.8612,
  });
  const toast = useRef(null);

  const userTypes = [
    { label: "Buyer", value: "buyer" },
    { label: "Seller", value: "seller" },
  ];

  const onFileSelect = (e) => {
    const file = e.files[0];
    setProfilePic(file);

    toast.current.show({
      severity: "info",
      summary: "Image Selected",
      detail: `${file.name} uploaded successfully`,
      life: 3000,
    });
  };

  const handleMapClick = (event) => {
    const { lat, lng } = event.latLng.toJSON();
    setLocation({
      name: address,
      longitude: lng,
      latitude: lat,
    });
    setMapCenter({ lat, lng });
  };

  const handleSubmit = async () => {
    if (!name || !email || !password || !type) {
      toast.current.show({
        severity: "error",
        summary: "Incomplete Form",
        detail: "Please fill all required fields",
        life: 3000,
      });
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phoneNo", phoneNo);
    formData.append("type", type);
    formData.append("address", address);

    if (location.longitude && location.latitude) {
      formData.append("location", JSON.stringify(location));
    }

    if (profilePic) {
      formData.append("profilePic", profilePic);
    }

    try {
      const response = await axios.post(
        `${config.apiUrl}/api/v1/user/signup`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response);

      toast.current.show({
        severity: "success",
        summary: "Account Created",
        detail: "Your account has been created successfully!",
        life: 3000,
      });

      setName("");
      setEmail("");
      setPassword("");
      setPhoneNo("");
      setType("");
      setAddress("");
      setLocation({ name: "", longitude: null, latitude: null });
      setMapCenter({ lat: 6.9271, lng: 79.8612 });
      setProfilePic(null);
      setLoading(false);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail:
          error.response?.data?.message || "An error occurred during signup.",
        life: 3000,
      });
      setLoading(false);
    }
  };

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: config.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  return (
    <div>
      <div className="cardSeccion p-4">
        <Toast ref={toast} />
      </div>
      <div className="headerText">
        <span>
          <h4>
            <i
              className="pi pi-user-plus"
              style={{
                marginRight: "10px",
                fontSize: "20px",
                fontWeight: "600",
              }}
            ></i>
            Create Account
          </h4>
        </span>
      </div>
      <div
        className="p-fluid p-formgrid"
        style={{ width: "90%", margin: "auto", padding: "auto" }}
        id="formFrame"
      >
        <div className="form-row">
          <div className="p-field">
            <label htmlFor="name">Full Name*</label>
            <InputText
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="email">Email*</label>
            <InputText
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="p-field">
            <label htmlFor="password">Password*</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              feedback
              required
              placeholder="Create a password"
            />
          </div>
          <div className="p-field">
            <label htmlFor="type">Account Type*</label>
            <Dropdown
              value={type}
              onChange={(e) => setType(e.value)}
              options={userTypes}
              placeholder="Select account type"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="p-field">
            <label htmlFor="phoneNo">Phone Number</label>
            <InputText
              id="phoneNo"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          <div className="p-field">
            <label htmlFor="address">Address</label>
            <InputText
              id="address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setLocation((prev) => ({ ...prev, name: e.target.value }));
              }}
              placeholder="Enter your address"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="p-field">
            <label htmlFor="location">Location (Click on map to select)</label>
            {isLoaded ? (
              <div style={{ height: "300px", width: "100%" }}>
                <GoogleMap
                  mapContainerStyle={{ height: "100%", width: "100%" }}
                  center={mapCenter}
                  zoom={10}
                  onClick={handleMapClick}
                >
                  {location.latitude && location.longitude && (
                    <Marker
                      position={{
                        lat: location.latitude,
                        lng: location.longitude,
                      }}
                    />
                  )}
                </GoogleMap>
              </div>
            ) : (
              <div>Loading Map...</div>
            )}
          </div>

          <div className="p-field">
            <label htmlFor="profilePic">Profile Picture</label>
            <FileUpload
              name="profilePic"
              accept="image/*"
              customUpload
              auto
              uploadHandler={onFileSelect}
              chooseLabel="Select Image"
            />
          </div>
        </div>

        <Button
          label={loading ? "Creating Account..." : "Sign Up"}
          icon={loading ? "pi pi-spin pi-spinner" : "pi pi-user-plus"}
          onClick={handleSubmit}
          className="submitButton mt-3"
          disabled={loading}
        />
      </div>
      <br />
      <br />
    </div>
  );
};

export default SignupForm;
