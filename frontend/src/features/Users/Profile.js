import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import config from "../../config";
import { ProgressSpinner } from "primereact/progressspinner";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch(`${config.apiUrl}/api/v1/web/user/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <center>
      <Card
        style={{
          marginTop: "50px",
          background: "none",
          borderRadius: "1em",
          padding: "20px",
        }}
      >
        {userData ? (
          <div className="p-d-flex p-flex-column p-ai-center">
            {userData.avatar ? (
              <Avatar
                image={userData.avatar}
                size="xlarge"
                shape="circle"
                className="p-mb-3"
              />
            ) : (
              <Avatar
                label="A"
                size="xlarge"
                shape="circle"
                className="p-mb-3"
                style={{ backgroundColor: "#03a6e9", color: "#ffffff" }}
              />
            )}
            <h2 style={{ color: "#03a6e9" }}>Admin</h2>
            <p style={{ fontSize: "1.1rem" }}>{userData.email}</p>
          </div>
        ) : null}
      </Card>
      {loading && (
        <ProgressSpinner
          style={{ width: "50px", height: "50px", marginTop: "20px" }}
          strokeWidth="5"
          animationDuration=".5s"
        />
      )}
    </center>
  );
};

export default Profile;
