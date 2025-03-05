import React, { useEffect, useState, useRef } from "react";
import { Toast } from "primereact/toast";
import { Skeleton } from "primereact/skeleton";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import config from "../../../config/index";

export default function InactiveUsers() {
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    fetchaInactiveUsers();
  }, []);

  const fetchaInactiveUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/api/v1/user/inactive`, {
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
      setInactiveUsers(data.users);
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
        value="Inactive"
        severity="danger"
        className="px-3 py-2 text-sm font-semibold"
      />
    );
  };

  const imageBodyTemplate = (rowData) => {
    return (
      <div className="profile-picture">
        <img
          src={`${config.apiUrl}/api/v1/uploads/image/profile/${rowData.profilePic}`}
          alt="Profile"
        />
      </div>
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
      setInactiveUsers(inactiveUsers.filter((user) => user._id !== id));
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
      <div className="flex gap-2">
        <Button
          icon="pi pi-check"
          className="p-button-success p-button-rounded"
          onClick={() => approveUser(rowData._id)}
          tooltip="Approve User"
          
        />
        &nbsp;
        <Button
          icon="pi pi-trash"
          className="p-button-danger p-button-rounded"
          onClick={() => deleteUser(rowData._id)}
          tooltip="Delete User"
        />
      </div>
    );
  };

  const approveUser = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/api/v1/user/activate/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "active", userId: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve user");
      }

      toast.current.show({
        severity: "success",
        summary: "Approved",
        detail: "User activated successfully",
      });

      setInactiveUsers(inactiveUsers.filter((user) => user._id !== id));
    } catch (error) {
      console.error("Error approving user", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
      });
    }
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
          value={inactiveUsers}
          paginator
          rows={10}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          responsiveLayout="scroll"
          emptyMessage="No users found."
          loading={loading}
          header="INACTIVE USERS"
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
          <Column field="type" header="Type" />
          <Column field="status" header="Status" body={statusBodyTemplate} />
          <Column body={actionBodyTemplate} header="Actions" />
        </DataTable>
      )}
    </div>
  );
}
