import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Polygon,
  Marker,
} from "@react-google-maps/api";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import config from "../../../config/index";

const MapComponent = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: config.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const [polygons, setPolygons] = useState([]);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [signalName, setSignalName] = useState("");
  const [mapCenter, setMapCenter] = useState({
    lat: 6.9271,
    lng: 79.8612,
  });
  const [zoomLevel, setZoomLevel] = useState(10);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const toastRef = React.useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/api/v1/polygon`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPolygons(
        data.map((item) => ({
          coordinates: item.coordinates,
          name: item.name || signalName,
        }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      toastRef.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load polygons.",
      });
    }
  };

  const addPointToPolygon = (event) => {
    const { latLng } = event;
    const newPoint = { lat: latLng.lat(), lng: latLng.lng() };
    setSelectedCoordinates(newPoint);
    setCurrentPolygon([...currentPolygon, newPoint]);
  };

  const savePolygon = async () => {
    if (currentPolygon.length < 3) {
      toastRef.current.show({
        severity: "warn",
        summary: "Warning",
        detail: "A polygon must have at least three points.",
      });
      return;
    }

    if (!signalName) {
      toastRef.current.show({
        severity: "warn",
        summary: "Warning",
        detail: "Add Polygon Name.",
      });
      return;
    }

    const newPolygon = {
      coordinates: currentPolygon,
      name: signalName,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/api/v1/polygon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPolygon),
      });

      if (!response.ok) throw new Error("Failed to save polygon.");

      setPolygons([
        ...polygons,
        { coordinates: currentPolygon, name: signalName },
      ]);
      setCurrentPolygon([]);
      toastRef.current.show({
        severity: "success",
        summary: "Success",
        detail: "Polygon saved successfully!",
      });
    } catch (error) {
      console.error("Error saving polygon:", error);
      toastRef.current.show({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while saving the polygon.",
      });
    }
  };

  const clearCurrentPolygon = () => {
    setCurrentPolygon([]);
    setSelectedCoordinates(null);
    toastRef.current.show({
      severity: "info",
      summary: "Info",
      detail: "Current polygon cleared.",
    });
  };

  const getCenterOfPolygon = (coordinates) => {
    const latitudes = coordinates.map((coord) => coord.lat);
    const longitudes = coordinates.map((coord) => coord.lng);
    const centerLat =
      latitudes.reduce((acc, lat) => acc + lat, 0) / latitudes.length;
    const centerLng =
      longitudes.reduce((acc, lng) => acc + lng, 0) / longitudes.length;
    return { lat: centerLat, lng: centerLng };
  };

  const focusOnPolygon = (polygon) => {
    if (mapRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      polygon.coordinates.forEach((coord) => bounds.extend(coord));
      mapRef.current.fitBounds(bounds);
      setZoomLevel(10);
      setSelectedPolygon(polygon);
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div style={{ marginTop: "2%" }}>
      <Toast ref={toastRef} />
      <Card title="Google Map Polygon Drawing">
        <div className="p-fluid grid">
          <div className="field col-12">
            <label htmlFor="polygonName">Polygon Name</label>
            <InputText
              id="polygonName"
              value={signalName}
              onChange={(e) => setSignalName(e.target.value)}
              placeholder="Enter Polygon Name"
            />
          </div>

          {selectedCoordinates && (
            <div className="field col-12">
              <p>
                Selected Latitude: {selectedCoordinates.lat.toFixed(6)},
                Longitude: {selectedCoordinates.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>
        <br />

        <GoogleMap
          onClick={addPointToPolygon}
          mapContainerStyle={{ width: "100%", height: "500px" }}
          center={mapCenter}
          zoom={zoomLevel}
          options={{
            disableDoubleClickZoom: true,
            gestureHandling: "greedy",
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          }}
          onLoad={(map) => (mapRef.current = map)}
          onDragEnd={() => {
            if (mapRef.current) {
              const newCenter = mapRef.current.getCenter();
              setMapCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
            }
          }}
        >
          {polygons.map((polygon, index) => {
            const center = getCenterOfPolygon(polygon.coordinates);
            return (
              <>
                <Polygon
                  key={index}
                  paths={polygon.coordinates}
                  options={{
                    fillColor: "#8BFFFF",
                    fillOpacity: 0.5,
                    strokeColor: "#8BFFFF",
                  }}
                />
                <Marker
                  key={`${index}-marker`}
                  position={center}
                  icon={{
                    url: config.ICON_URL,
                  }}
                  label={{
                    text: polygon.name,
                    color: "black",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
              </>
            );
          })}

          {currentPolygon.length > 0 && (
            <Polygon
              paths={currentPolygon}
              options={{
                strokeColor: "#0000FF",
                fillColor: "#0000FF",
                fillOpacity: 0.3,
              }}
            />
          )}

          {selectedPolygon && (
            <Polygon
              paths={selectedPolygon.coordinates}
              options={{
                strokeColor: "#FF0000",
                fillColor: "#FF0000",
                fillOpacity: 0.4,
              }}
            />
          )}
        </GoogleMap>

        <div className="p-d-flex p-jc-between" style={{ marginTop: "10px" }}>
          <Button
            label="Save Polygon"
            icon="pi pi-save"
            className="p-button-success"
            onClick={savePolygon}
          />
          &nbsp;&nbsp;
          <Button
            label="Clear Current Polygon"
            icon="pi pi-times"
            className="p-button-warning"
            onClick={clearCurrentPolygon}
          />
          &nbsp;&nbsp;
          <Button
            label="View All Polygons"
            icon="pi pi-eye"
            className="p-button-info"
            onClick={() => setShowDialog(true)}
          />
        </div>
      </Card>
      <br />
      <Dialog
        visible={showDialog}
        header="Saved Polygons"
        style={{ width: "50vw" }}
        onHide={() => setShowDialog(false)}
      >
        <ul>
          {polygons.map((polygon, index) => (
            <li
              key={index}
              style={{
                cursor: "pointer",
                padding: "10px",
                borderBottom: "1px solid #ddd",
              }}
              onClick={() => {
                focusOnPolygon(polygon);
                setShowDialog(false);
              }}
            >
              {polygon.name}
            </li>
          ))}
        </ul>
      </Dialog>
    </div>
  );
};

export default MapComponent;
