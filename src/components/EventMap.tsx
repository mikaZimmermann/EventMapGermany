"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import L, { LayerGroup, Map } from "leaflet";
import { supabase } from "@/lib/supabase";

type EventRow = {
  id: number;
  title: string;
  description: string | null;
  city: string;
  event_date: string;
  lat: number;
  lng: number;
};

export function EventMap() {
  const mapRef = useRef<Map | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [authStatus, setAuthStatus] = useState("Not signed in.");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  async function refreshAuthStatus() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      setAuthStatus("Not signed in.");
      return;
    }

    setAuthStatus(`Signed in as ${data.user.email}`);
  }

  async function loadEvents() {
    if (!markerLayerRef.current) return;

    markerLayerRef.current.clearLayers();

    const { data, error } = await supabase
      .from("events")
      .select("id,title,description,city,event_date,lat,lng")
      .order("event_date", { ascending: true });

    if (error || !data) {
      console.error(error);
      return;
    }

    for (const event of data as EventRow[]) {
      const marker = L.marker([event.lat, event.lng]).addTo(markerLayerRef.current);
      marker.bindPopup(
        `<strong>${event.title}</strong><br>${event.city} • ${event.event_date}<br>${event.description ?? ""}`,
      );
    }
  }

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([51.1657, 10.4515], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const markerLayer = L.layerGroup().addTo(map);

    map.on("click", (event) => {
      setLat(event.latlng.lat.toFixed(6));
      setLng(event.latlng.lng.toFixed(6));
    });

    mapRef.current = map;
    markerLayerRef.current = markerLayer;

    refreshAuthStatus();
    loadEvents();

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  async function handleSignUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
      return;
    }

    await refreshAuthStatus();
    await loadEvents();
  }

  async function handleSignIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      return;
    }

    await refreshAuthStatus();
    await loadEvents();
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(error.message);
      return;
    }

    await refreshAuthStatus();
  }

  async function handleEventSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      alert("Sign in first to add events.");
      return;
    }

    const { error } = await supabase.from("events").insert({
      title,
      description,
      city,
      event_date: date,
      lat: Number(lat),
      lng: Number(lng),
    });

    if (error) {
      alert(error.message);
      return;
    }

    setTitle("");
    setDate("");
    setCity("");
    setDescription("");
    setLat("");
    setLng("");

    await loadEvents();
  }

  return (
    <div className="layout">
      <aside className="panel">
        <h1>EventMap Germany</h1>
        <p className="muted">Next.js + Leaflet + Supabase starter.</p>

        <section>
          <h2>Supabase Auth</h2>
          <div className="form-grid">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <div className="buttons">
              <button type="button" onClick={handleSignUp}>
                Sign up
              </button>
              <button type="button" onClick={handleSignIn}>
                Sign in
              </button>
            </div>
          </div>
          <button className="secondary" onClick={handleLogout}>
            Sign out
          </button>
          <p className="muted">{authStatus}</p>
        </section>

        <section>
          <h2>Add Event</h2>
          <form onSubmit={handleEventSubmit} className="form-grid">
            <input
              type="text"
              placeholder="Event title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              required
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <p className="muted">Click on map to set event coordinates.</p>
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={lat}
              onChange={(event) => setLat(event.target.value)}
              required
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={lng}
              onChange={(event) => setLng(event.target.value)}
              required
            />
            <button type="submit">Save event</button>
          </form>
        </section>
      </aside>

      <main>
        <div ref={mapContainerRef} className="map" />
      </main>
    </div>
  );
}
