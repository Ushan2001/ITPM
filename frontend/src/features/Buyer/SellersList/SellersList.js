import React, { useState, useEffect } from "react";
import { DataView } from "primereact/dataview";
import { Avatar } from "primereact/avatar";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Skeleton } from "primereact/skeleton";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import config from "../../../config";
import "./style.css";
import NavBar from "../../../pages/NavBar";

const SellersList = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNearby, setIsNearby] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const toast = React.useRef(null);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/api/v1/user/active-sellers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setSellers(data.sellers);
      setIsNearby(false);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch sellers",
          life: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbySellers = async () => {
    try {
      setLoadingNearby(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/api/v1/polygon/sellers-near-by`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setSellers(data.sellers);
      setIsNearby(true);

      if (toast.current) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Showing nearby sellers",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error fetching nearby sellers:", error);
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch nearby sellers",
          life: 3000,
        });
      }
    } finally {
      setLoadingNearby(false);
    }
  };

  const getSeverity = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "danger";
      default:
        return "info";
    }
  };

  const itemTemplate = (seller) => {
    if (loading || (loadingNearby && !seller._id)) {
      return <SellerSkeleton />;
    }

    return (
      <div className={`seller-card ${isNearby ? "nearby-animation" : ""}`}>
        <Card className="seller-card-inner">
          <div className="seller-card-content">
            <div className="seller-image">
              <Avatar
                image={
                  seller.profilePic
                    ? `${config.apiUrl}/api/v1/uploads/image/profile/${seller.profilePic}`
                    : null
                }
                icon={!seller.profilePic ? "pi pi-user" : null}
                size="xlarge"
                shape="circle"
                className="seller-avatar"
              />
            </div>
            <div className="seller-details">
              <h3 className="seller-name">{seller.name}</h3>
              {seller.storeName && (
                <p className="seller-store-name">
                  <i className="pi pi-shopping-bag mr-2"></i>
                  {seller.storeName}
                </p>
              )}
              <p className="seller-contact">
                <i className="pi pi-envelope mr-2"></i>
                {seller.email || "No email provided"}
              </p>
              <p className="seller-contact">
                <i className="pi pi-phone mr-2"></i>
                {seller.phoneNo || "No phone provided"}
              </p>
              <p className="seller-address">
                <i className="pi pi-map-marker mr-2"></i>
                {seller.address || "No address provided"}
              </p>
              {seller.status && (
                <div className="seller-tag">
                  <Tag
                    value={seller.status}
                    severity={getSeverity(seller.status)}
                    rounded
                  />
                </div>
              )}
              {isNearby && seller.location && (
                <div className="seller-location-tag">
                  <Tag
                    value="Nearby"
                    severity="info"
                    icon="pi pi-map-marker"
                    rounded
                  />
                </div>
              )}
            </div>
            <div className="seller-actions">
              <Button
                icon="pi pi-envelope"
                className="p-button-rounded p-button-outlined p-button-info"
                tooltip="Contact Seller"
                tooltipOptions={{ position: "top" }}
              />
              {seller.location && (
                <Button
                  icon="pi pi-map-marker"
                  className="p-button-rounded p-button-outlined p-button-success mt-2"
                  tooltip="View Location"
                  tooltipOptions={{ position: "top" }}
                />
              )}
              <Button
                icon="pi pi-user"
                className="p-button-rounded p-button-outlined p-button-primary mt-2"
                tooltip="View Profile"
                tooltipOptions={{ position: "top" }}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const SellerSkeleton = () => {
    return (
      <div className="seller-card">
        <Card className="seller-card-inner">
          <div className="seller-card-content">
            <div className="seller-image">
              <Skeleton shape="circle" size="5rem" />
            </div>
            <div className="seller-details">
              <Skeleton width="80%" height="2rem" className="mb-2" />
              <Skeleton width="60%" className="mb-2" />
              <Skeleton width="70%" className="mb-2" />
              <Skeleton width="70%" className="mb-2" />
              <Skeleton width="40%" height="2rem" />
            </div>
            <div className="seller-actions">
              <Skeleton shape="circle" size="2.5rem" className="mb-2" />
              <Skeleton shape="circle" size="2.5rem" className="mb-2" />
              <Skeleton shape="circle" size="2.5rem" />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div>
      <Toast ref={toast} />
      <div style={{ marginTop: "-6%" }}>
        <NavBar />
      </div>

      <div className="sellers-container">
        <div className="sellers-header">
          <h1 className="sellers-title">
            {isNearby ? "Sellers Near You" : "Our Trusted Sellers"}
          </h1>
          <div className="sellers-actions">
            {isNearby ? (
              <Button
                label="Show All Sellers"
                icon="pi pi-users"
                className="p-button-outlined p-button-info"
                onClick={fetchSellers}
                disabled={loading}
              />
            ) : (
              <Button
                label="Near Me"
                icon="pi pi-map-marker"
                className="p-button-outlined nearby-button"
                onClick={fetchNearbySellers}
                disabled={loadingNearby}
              >
                {loadingNearby && (
                  <ProgressSpinner
                    style={{ width: "20px", height: "20px" }}
                    strokeWidth="8"
                    fill="var(--surface-ground)"
                    animationDuration=".5s"
                  />
                )}
              </Button>
            )}
          </div>
        </div>
        <div className="sellers-list">
          <DataView
            value={loading || loadingNearby ? Array(4).fill({}) : sellers}
            itemTemplate={itemTemplate}
            paginator
            rows={6}
            emptyMessage={
              isNearby
                ? "No sellers found near your location"
                : "No sellers found"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default SellersList;
