import React, { useEffect, useState, useRef } from "react";
import { Toast } from "primereact/toast";
import { Skeleton } from "primereact/skeleton";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import config from "../../../config/index";
import "./style.css";

export default function ActiveUsers() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    fetchaActiveUsers();
  }, []);

  const fetchaActiveUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/api/v1/user/active`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data = await response.json();
      setActiveUsers(data.users);
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

  const deleteUser = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/api/v1/user/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      toast.current.show({
        severity: "success",
        summary: "Deleted",
        detail: "User deleted successfully",
      });
      setActiveUsers(activeUsers.filter((user) => user._id !== id));
    } catch (error) {
      console.error("Error deleting user", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
      });
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-trash"
        className="p-button-danger p-button-rounded"
        onClick={() => deleteUser(rowData._id)}
      />
    );
  };

  return (
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
          value={activeUsers}
          paginator
          rows={10}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          responsiveLayout="scroll"
          emptyMessage="No users found."
          loading={loading}
          header="ACTIVE USERS"
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
  );
}
