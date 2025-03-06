import React, { useEffect, useState, useRef } from "react";
import { Toast } from "primereact/toast";
import { Skeleton } from "primereact/skeleton";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import config from "../../../config/index";

export default function SellerComponent() {
  const [activeSellers, setActiveSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchaActiveSellers();
  }, []);

  const fetchaActiveSellers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/api/v1/user/active-sellers`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data = await response.json();
      setActiveSellers(data.sellers);
      setLoading(false);
    } catch (error) {
      console.error("Error to fetch user data", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
      });
      setLoading(false);
    }
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value="Active"
        severity="success"
        className="px-3 py-2 text-sm font-semibold"
        style={{ borderRadius: "20px", fontSize: "14px" }}
      />
    );
  };

  const imageBodyTemplate = (rowData) => {
    return (
      <img
        src={`${config.apiUrl}/api/v1/uploads/image/profile/${rowData.profilePic}`}
        alt="Profile"
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-map-marker"
        className="p-button-info p-button-rounded"
        tooltip="Add Polygon"
        onClick={() =>
          navigate("/get-polygon", { state: { sellerId: rowData._id } })
        }
      />
    );
  };

  return (
    <div>
      <div className="user-management-container">
        <Toast ref={toast} />
        {loading ? (
          <div>
            <Skeleton height="3rem" className="mb-3" />
            <br />
            <Skeleton height="3rem" className="mb-3" />
            <br />
            <Skeleton height="3rem" className="mb-3" />
            <br />
          </div>
        ) : (
          <DataTable
            value={activeSellers}
            paginator
            rows={10}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            responsiveLayout="scroll"
            emptyMessage="No users found."
            loading={loading}
            header="ACTIVE SELLERS"
          >
            <Column
              field="profilePic"
              header="Profile Picture"
              body={imageBodyTemplate}
            />
            <Column field="name" header="Name" sortable />
            <Column field="email" header="Email" />
            <Column field="phoneNo" header="Phone Number" />
            <Column field="address" header="Address" />
            <Column field="type" header="Type" sortable />
            <Column field="status" header="Status" body={statusBodyTemplate} />
            <Column body={actionBodyTemplate} header="Actions" />
          </DataTable>
        )}
      </div>
    </div>
  );
}
