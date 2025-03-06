import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import config from "../../../config";
import "./style.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mapCenter, setMapCenter] = useState({
    lat: 6.9271,
    lng: 79.8612,
  });
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNo: "",
    address: "",
    location: {
      name: "",
      longitude: "",
      latitude: "",
    },
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: config.REACT_APP_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${config.apiUrl}/api/v1/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      setUser(userData);

      setFormData({
        name: userData.name,
        email: userData.email,
        phoneNo: userData.phoneNo,
        address: userData.address,
        location: {
          name: userData.location?.name || "",
          longitude: userData.location?.longitude || "",
          latitude: userData.location?.latitude || "",
        },
      });

      if (userData.location?.latitude && userData.location?.longitude) {
        setMapCenter({
          lat: parseFloat(userData.location.latitude),
          lng: parseFloat(userData.location.longitude),
        });
      }

      setIsLoading(false);
    } catch (err) {
      setError("Failed to fetch user data. Please try again later.");
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMapClick = (event) => {
    const { lat, lng } = event.latLng.toJSON();
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        latitude: lat,
        longitude: lng,
      },
    });
    setMapCenter({ lat, lng });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const updateData = new FormData();

      updateData.append("name", formData.name);
      updateData.append("email", formData.email);
      updateData.append("phoneNo", formData.phoneNo);
      updateData.append("address", formData.address);
      updateData.append("location[name]", formData.location.name);
      updateData.append("location[longitude]", formData.location.longitude);
      updateData.append("location[latitude]", formData.location.latitude);

      if (profileImage) {
        updateData.append("profilePic", profileImage);
      }

      const response = await fetch(`${config.apiUrl}/api/v1/user`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: updateData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      fetchUserData();

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
    } catch (err) {
      setError(err.message || "Failed to update profile. Please try again.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${config.apiUrl}/api/v1/user/change-password`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }

      setSuccess("Password changed successfully!");
      setIsChangingPassword(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.message || "Failed to change password. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="user-profile-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="user-profile-container">
      <div>
        <button className="back-button" onClick={handleBack}>
          Back
        </button>
      </div>
      <br />
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-header">
        <h1>User Profile</h1>
        {!isEditing && !isChangingPassword && (
          <div className="action-buttons">
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
            <button
              className="change-password-button"
              onClick={() => setIsChangingPassword(true)}
            >
              Change Password
            </button>
          </div>
        )}
      </div>

      {!isEditing && !isChangingPassword ? (
        <div className="profile-details">
          <div className="profile-image-container">
            <img
              src={
                user.profilePic
                  ? `${config.apiUrl}/api/v1/uploads/image/profile/${user.profilePic}`
                  : "/assets/user.png"
              }
              alt="Profile"
              className="profile-image"
            />
          </div>

          <div className="user-info">
            <div className="info-item">
              <label>Name:</label>
              <span>{user.name}</span>
            </div>

            <div className="info-item">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>

            <div className="info-item">
              <label>Phone Number:</label>
              <span>{user.phoneNo}</span>
            </div>

            <div className="info-item">
              <label>Address:</label>
              <span>{user.address}</span>
            </div>

            <div className="info-item">
              <label>Location:</label>
              <span>{user.location?.name}</span>
            </div>

            <div className="info-item">
              <label>User Type:</label>
              <span className="user-type">{user.type}</span>
            </div>

            <div className="info-item">
              <label>Status:</label>
              <span className={`status-${user.status}`}>{user.status}</span>
            </div>

            {user.location?.latitude && user.location?.longitude && (
              <div className="info-item location-map">
                <label>Map Location:</label>
                {isLoaded ? (
                  <div className="map-preview">
                    <GoogleMap
                      mapContainerStyle={{
                        height: "200px",
                        width: "100%",
                        borderRadius: "5px",
                      }}
                      center={mapCenter}
                      zoom={14}
                    >
                      <Marker
                        position={{
                          lat: parseFloat(user.location.latitude),
                          lng: parseFloat(user.location.longitude),
                        }}
                      />
                    </GoogleMap>
                  </div>
                ) : (
                  <div>Loading map...</div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : isEditing ? (
        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="form-header">
            <h2>Edit Profile</h2>
            <button
              type="button"
              className="cancel-button"
              onClick={() => {
                setIsEditing(false);
                if (imagePreview) {
                  URL.revokeObjectURL(imagePreview);
                  setImagePreview(null);
                }
              }}
            >
              Cancel
            </button>
          </div>

          <div className="profile-image-edit">
            <div className="image-preview">
              <img
                src={
                  imagePreview ||
                  (user.profilePic
                    ? `${config.apiUrl}/api/v1/uploads/image/profile/${user.profilePic}`
                    : "/assets/user.png")
                }
                alt="Profile Preview"
              />
            </div>
            <div className="image-upload">
              <label htmlFor="profile-pic">Change Profile Picture</label>
              <input
                type="file"
                id="profile-pic"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNo">Phone Number</label>
            <input
              type="tel"
              id="phoneNo"
              name="phoneNo"
              value={formData.phoneNo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location.name">Location Name</label>
            <input
              type="text"
              id="location.name"
              name="location.name"
              value={formData.location.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location.longitude">Longitude</label>
              <input
                type="text"
                id="location.longitude"
                name="location.longitude"
                value={formData.location.longitude}
                onChange={handleChange}
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="location.latitude">Latitude</label>
              <input
                type="text"
                id="location.latitude"
                name="location.latitude"
                value={formData.location.latitude}
                onChange={handleChange}
                readOnly
              />
            </div>
          </div>

          <div className="form-group map-selection">
            <label>Select Location (Click on map)</label>
            {isLoaded ? (
              <div className="map-container">
                <GoogleMap
                  mapContainerStyle={{
                    height: "300px",
                    width: "100%",
                    borderRadius: "5px",
                  }}
                  center={mapCenter}
                  zoom={10}
                  onClick={handleMapClick}
                >
                  {formData.location.latitude &&
                    formData.location.longitude && (
                      <Marker
                        position={{
                          lat: parseFloat(formData.location.latitude),
                          lng: parseFloat(formData.location.longitude),
                        }}
                      />
                    )}
                </GoogleMap>
              </div>
            ) : (
              <div>Loading map...</div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="save-button">
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="password-change-form">
          <div className="form-header">
            <h2>Change Password</h2>
            <button
              type="button"
              className="cancel-button"
              onClick={() => {
                setIsChangingPassword(false);
                setPasswordData({
                  oldPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              }}
            >
              Cancel
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="oldPassword">Current Password</label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              minLength="8"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              minLength="8"
            />
          </div>

          <div className="password-requirements">
            <p>Password must:</p>
            <ul>
              <li>Be at least 8 characters long</li>
              <li>Include at least one uppercase letter</li>
              <li>Include at least one number</li>
              <li>Include at least one special character</li>
            </ul>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-button">
              Change Password
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserProfile;
