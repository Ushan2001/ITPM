import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { Message } from "primereact/message";
import { Skeleton } from "primereact/skeleton";
import "./style.css";
import config from "../../../config/index";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    activeUsers: 0,
    inactiveUsers: 0,
    activeSeller: 0,
    activeBuyers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authorization token is missing!");
        }

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [
          activeUsersRes,
          inactiveUsersRes,
          activeSellersRes,
          activeBuyersRes,
        ] = await Promise.all([
          fetch(`${config.apiUrl}/api/v1/user/active`, { headers }),
          fetch(`${config.apiUrl}/api/v1/user/inactive`, { headers }),
          fetch(`${config.apiUrl}/api/v1/user/active-sellers`, { headers }),
          fetch(`${config.apiUrl}/api/v1/user/active-buyers`, { headers }),
        ]);

        if (
          !activeUsersRes.ok ||
          !inactiveUsersRes.ok ||
          !activeSellersRes.ok ||
          !activeBuyersRes.ok
        ) {
          throw new Error("One or more API requests failed");
        }

        const activeUsers = await activeUsersRes.json();
        const inactiveUsers = await inactiveUsersRes.json();
        const activeSeller = await activeSellersRes.json();
        const activeBuyers = await activeBuyersRes.json();

        setStats({
          activeUsers: activeUsers.users.length,
          inactiveUsers: inactiveUsers.users.length,
          activeSeller: activeSeller.sellers.length,
          activeBuyers: activeBuyers.buyers.length,
        });
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const lineChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Active Users",
        data: [50, 60, 80, 90, 100, stats?.activeUsers || 0],
        borderColor: "#4CAF50",
        tension: 0.4,
      },
      {
        label: "Total Items",
        data: [
          30,
          50,
          70,
          90,
          110,
          stats?.activeSeller + stats?.inactiveBuyers || 0,
        ],
        borderColor: "#2196F3",
        tension: 0.4,
      },
    ],
  };

  const pieChartData = {
    labels: ["Active Sellers", "Inactive Buyers"],
    datasets: [
      {
        data: [stats?.activeSeller || 0, stats?.inactiveBuyers || 0],
        backgroundColor: ["#4CAF50", "#FFA726"],
      },
    ],
  };

  const doughnutChartData = {
    labels: ["Active Sellers", "Inactive Buyers"],
    datasets: [
      {
        data: [stats?.activeSeller || 0, stats?.inactiveBuyers || 0],
        backgroundColor: ["#3F51B5", "#FFC107"],
      },
    ],
  };

  const barChartData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        label: "Users",
        backgroundColor: ["#4CAF50", "#FF5722"],
        data: [stats?.activeUsers || 0, stats?.inactiveUsers || 0],
      },
    ],
  };

  if (loading) {
    return (
      <div className="loading-dashboard">
        <div className="loading-grid">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="loading-card">
              <Skeleton width="100%" height="100px" />
            </div>
          ))}
        </div>

        <div className="loading-charts">
          <div className="loading-chart">
            <Skeleton width="100%" height="250px" />
          </div>
          <div className="loading-chart">
            <Skeleton width="100%" height="250px" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="center-screen">
        <Message severity="error" text={error} />
      </div>
    );
  }

  const handleActiveUser = () => {
    navigate("/active-users");
  };
  const handleInactiveUser = () => {
    navigate("/inactive-users");
  };
  const handleActiveSeller = () => {
    navigate("/sellers");
  };

  return (
    <div className="dashboard-container fade-in">
      <h1 className="dashboard-title" style={{ display: "flex" }}>
        Admin Dashboard
      </h1>

      <div className="stats-flex">
        {[
          {
            label: "Active Users",
            value: stats.activeUsers,
            icon: "pi-users",
            color: "linear-gradient(135deg, #4CAF50, #66BB6A)",
          },
          {
            label: "Inactive Users",
            value: stats.inactiveUsers,
            icon: "pi-user-minus",
            color: "linear-gradient(135deg, #FF5722, #FF7043)",
          },
          {
            label: "Active Sellers",
            value: stats.activeSeller,
            icon: "pi-building",
            color: "linear-gradient(135deg, #3F51B5, #5C6BC0)",
          },
          {
            label: "Active Buyers",
            value: stats.activeBuyers,
            icon: "pi-check-circle",
            color: "linear-gradient(135deg, #8BC34A, #9CCC65)",
          },
        ].map(({ label, value, icon, color }, index) => (
          <Card
            key={index}
            className="stat-card hover-grow"
            style={{ background: color, cursor: "pointer" }}
            onClick={() => {
              if (label === "Active Users") handleActiveUser();
              if (label === "Inactive Users") handleInactiveUser();
              if (label === "Active Sellers") handleActiveSeller();
              if (label === "Active Buyers") handleActiveUser();
            }}
          >
            <div className="stat-content">
              <i
                className={`pi ${icon}`}
                style={{ fontSize: "2.5rem", color: "white" }}
              ></i>
              <h2 className="stat-label">{label}</h2>
              <p className="stat-value">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="charts-flex">
        <Card className="chart-card fade-in">
          <h3>Monthly Trends</h3>
          <Chart type="line" data={lineChartData} />
        </Card>

        <Card className="chart-card fade-in">
          <h3>Item Distribution</h3>
          <Chart type="pie" data={pieChartData} />
        </Card>
      </div>

      <div className="charts-flex">
        <Card className="chart-card fade-in">
          <h3>User Status</h3>
          <Chart type="bar" data={barChartData} />
        </Card>

        <Card className="chart-card fade-in">
          <h3>Club vs Pending Items</h3>
          <Chart type="doughnut" data={doughnutChartData} />
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
