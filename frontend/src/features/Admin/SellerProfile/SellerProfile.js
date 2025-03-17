import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TabView, TabPanel } from "primereact/tabview";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";
import config from "../../../config";
import "./style.css";

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sellerData } = location.state || {};
  const profileImage = sellerData?.profilePic || "";
  const previewUrl = `${config.apiUrl}/api/v1/uploads/image/profile/${profileImage}`;

  console.log("data", sellerData);

  const handleBackClick = () => {
    navigate(-1);
  };

  const renderProfileImage = () => {
    if (!sellerData) {
      return <Skeleton shape="circle" width="150px" height="150px" />;
    }

    return profileImage ? (
      <img src={previewUrl} alt="Seller Profile" className="profile-image" />
    ) : (
      <div>No Profile Picture Available</div>
    );
  };

  return (
    <div className="profile-page">
      <h2 className="profile-title">Seller Profile Information</h2>
      <Button
        onClick={handleBackClick}
        label="Back"
        icon="pi pi-arrow-left"
        className="p-button-outlined"
        style={{ margin: "20px", padding: "10px 20px", borderRadius: "5px" }}
      />
      <Card className="profile-card">
        <div className="profile-details">
          <div className="profile-image-wrapper">{renderProfileImage()}</div>
          <div className="profile-text">
            <h3>{sellerData?.name || "Loading..."}</h3>
            <p>
              <strong>Store:</strong> {sellerData?.storeName || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {sellerData?.email || "N/A"}
            </p>
            <p>
              <strong>Phone:</strong> {sellerData?.phoneNo || "N/A"}
            </p>
          </div>
        </div>
      </Card>
      <TabView className="info-tabs">
        <TabPanel header="Basic Information">
          <p>
            <strong>Name:</strong> {sellerData?.name}
          </p>
          <p>
            <strong>Email:</strong> {sellerData?.email}
          </p>
          <p>
            <strong>Phone:</strong> {sellerData?.phoneNo}
          </p>
          <p>
            <strong>Address:</strong> {sellerData?.address}
          </p>
          <p>
            <strong>Store Name:</strong> {sellerData?.storeName}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <Tag severity="success">{sellerData?.status}</Tag>
          </p>
        </TabPanel>
        <TabPanel header="Products">
          {sellerData?.products?.length > 0 ? (
            <div className="products-list">
              {sellerData.products.map((product) => (
                <Card key={product._id} className="product-card">
                  <img
                    src={`${config.apiUrl}/api/v1/uploads/image/product/${product.productPic}`}
                    alt={product.title}
                    className="product-image"
                    onClick={() =>
                      window.open(
                        `${config.apiUrl}/api/v1/uploads/image/product/${product.productPic}`,
                        "_blank"
                      )
                    }
                    style={{ cursor: "pointer" }}
                  />
                  <h4>{product.title}</h4>
                  <p>
                    <strong>Description:</strong> {product.description}
                  </p>
                  <p>
                    <strong>Price:</strong> LKR:{product.price}
                  </p>
                  <p>
                    <strong>Category:</strong> {product.categoryType}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {product.quantity}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <Tag severity="success">{sellerData?.status}</Tag>
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <p>No products available.</p>
          )}
        </TabPanel>
      </TabView>
    </div>
  );
};

export default Profile;
