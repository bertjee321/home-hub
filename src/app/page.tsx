"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch the initial list of Opted-In dashboard devices + their current HA state
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/devices");
        if (res.ok) {
          const data = await res.json();
          setDevices(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();

    // 2. Open the Server-Sent Events stream to listen for real-time updates
    const eventSource = new EventSource("/api/stream");

    eventSource.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      
      if (parsed.type === "update") {
        const { entityId, state, attributes } = parsed.data;
        
        // Update exactly the device that changed
        setDevices((prev) => 
          prev.map((d) => 
            d.id === entityId 
              ? { ...d, state, attributes } 
              : d
          )
        );
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (loading)
    return (
      <div className="p-8 text-black dark:text-white">Loading Dashboard...</div>
    );

  // Separate devices into "Unparented" (no groups) and whatever groups we have
  const unparentedDevices = devices.filter((d) => !d.groups || d.groups.length === 0);
  const groupedDevices = devices.filter((d) => d.groups && d.groups.length > 0);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 p-8 text-black dark:text-white font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Smart Home Dashboard</h1>
      </header>

      <main className="space-y-8">
        {/* We can flesh out Groups later, for now we will just list Unparented ones! */}
        
        <section className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Unparented Devices</h2>
          {unparentedDevices.length === 0 ? (
            <p className="text-gray-500">No unparented devices on the dashboard.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {unparentedDevices.map(device => (
                <div
                  key={device.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    device.state === 'on' 
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                      : 'bg-gray-50 border-gray-200 dark:bg-zinc-900 dark:border-zinc-700'
                  }`}
                >
                  <div>
                    <h3 className="font-semibold">{device.customName || device.id}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{device.state}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
