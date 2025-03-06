import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { motion } from "framer-motion";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import config from "../../config/index";
import { Toast } from "primereact/toast";
import "./style.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editProfileDialog, setEditProfileDialog] = useState(false);
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const toast = useRef(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/api/v1/user/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const userData = await response.json();
      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setLoading(false);
    }
  };

  const handleEditProfileOpen = () => {
    setEditedProfile({ ...user });
    setEditProfileDialog(true);
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/api/v1/user/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedProfile),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setEditProfileDialog(false);

      toast.current.show({
        severity: "success",
        summary: "Profile Updated",
        detail: "Your profile has been successfully updated",
      });
      fetchUserProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.current.show({
        severity: "error",
        summary: "Update Failed",
        detail: "Unable to update profile",
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.current.show({
        severity: "error",
        summary: "Password Mismatch",
        detail: "New passwords do not match",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/api/v1/user/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to change password");
      }

      setChangePasswordDialog(false);
      toast.current.show({
        severity: "success",
        summary: "Password Changed",
        detail: "Your password has been successfully updated",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.current.show({
        severity: "error",
        summary: "Change Failed",
        detail: "Unable to change password",
      });
    }
  };

  if (loading) {
    return (
      <div className="profile-loader">
        <motion.div
          initial={{ scale: 0.6, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <Avatar icon="pi pi-user" size="xlarge" className="loading-avatar" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="profile-container"
      >
        <Card className="profile-card">
          <div className="profile-header">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Avatar
                image={`${config.apiUrl}/api/v1/uploads/image/profile/${user.profilePic}`}
                size="xlarge"
                shape="circle"
                className="profile-avatar"
              />
            </motion.div>

            <motion.h1
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="profile-name"
            >
              {user.name}
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="profile-details"
          >
            <div className="detail-item">
              <i className="pi pi-envelope"></i>
              <span>{user.email}</span>
            </div>
            <div className="detail-item">
              <i className="pi pi-phone"></i>
              <span>{user.phoneNo}</span>
            </div>
            <div className="detail-item">
              <i className="pi pi-map-marker"></i>
              <span>{user.address || "Not specified"}</span>
            </div>
            <div className="detail-item">
              <i className="pi pi-tag"></i>
              <span>
                {user.type
                  ? user.type.charAt(0).toUpperCase() + user.type.slice(1)
                  : "Not specified"}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="profile-actions"
          >
            <Button
              label="Edit Profile"
              icon="pi pi-pencil"
              className="p-button-outlined p-button-secondary"
              onClick={handleEditProfileOpen}
            />
            <Button
              label="Change Password"
              icon="pi pi-lock"
              className="p-button-outlined p-button-warning"
              onClick={() => setChangePasswordDialog(true)}
            />

            <Dialog
              header="Edit Profile"
              visible={editProfileDialog}
              style={{ width: "450px" }}
              modal
              onHide={() => setEditProfileDialog(false)}
              footer={
                <div>
                  <Button
                    label="Cancel"
                    icon="pi pi-times"
                    onClick={() => setEditProfileDialog(false)}
                    className="p-button-text"
                  />
                  <Button
                    label="Save"
                    icon="pi pi-check"
                    onClick={handleUpdateProfile}
                    autoFocus
                  />
                </div>
              }
            >
              <div className="p-fluid">
                <div className="p-field">
                  <label htmlFor="name">Name</label>
                  <InputText
                    id="name"
                    value={editedProfile.name || ""}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="p-field">
                  <label htmlFor="email">Email</label>
                  <InputText
                    id="email"
                    value={editedProfile.email || ""}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="p-field">
                  <label htmlFor="phoneNo">Phone Number</label>
                  <InputText
                    id="phoneNo"
                    value={editedProfile.phoneNo || ""}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        phoneNo: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="p-field">
                  <label htmlFor="address">Address</label>
                  <InputText
                    id="address"
                    value={editedProfile.address || ""}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </Dialog>

            <Dialog
              header="Change Password"
              visible={changePasswordDialog}
              style={{ width: "450px" }}
              modal
              onHide={() => setChangePasswordDialog(false)}
              footer={
                <div>
                  <Button
                    label="Cancel"
                    icon="pi pi-times"
                    onClick={() => setChangePasswordDialog(false)}
                    className="p-button-text"
                  />
                  <Button
                    label="Change Password"
                    icon="pi pi-lock"
                    onClick={handleChangePassword}
                    autoFocus
                  />
                </div>
              }
            >
              <div className="p-fluid">
                <div className="p-field">
                  <label htmlFor="oldPassword">Old Password</label>
                  <Password
                    id="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        oldPassword: e.target.value,
                      })
                    }
                    feedback={false}
                    toggleMask
                  />
                </div>
                <div className="p-field">
                  <label htmlFor="newPassword">New Password</label>
                  <Password
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    promptLabel="Choose a password"
                    weakLabel="Too simple"
                    mediumLabel="Average complexity"
                    strongLabel="Complex password"
                    toggleMask
                  />
                </div>
                <div className="p-field">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <Password
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    feedback={false}
                    toggleMask
                  />
                </div>
              </div>
            </Dialog>
          </motion.div>
        </Card>
      </motion.div>
      <Toast ref={toast} />
    </>
  );
};

export default Profile;
