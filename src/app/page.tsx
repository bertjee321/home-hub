"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(true);

  if (loading)
    return (
      <div className="p-8 text-black dark:text-white">Loading Dashboard...</div>
    );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 p-8 text-black dark:text-white font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Smart Home Dashboard</h1>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>DASHBOARD</div>
        {/* <section className="bg-white dark:bg-black p-6 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Energy</h2>
          {energy ? (
            <div className="space-y-4">
              <div className="flex justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <span>Solar Production</span>
                <span className="font-mono">{energy.electricityProduction} W</span>
              </div>
              <div className="flex justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <span>Consumption</span>
                <span className="font-mono">{energy.electricityConsumption} W</span>
              </div>
              <div className="flex justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <span>Grid Export</span>
                <span className="font-mono">{energy.electricityProduction - energy.electricityConsumption} W</span>
              </div>
            </div>
          ) : (
            <div>No energy data available.</div>
          )}
        </section>

        <section className="bg-white dark:bg-black p-6 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Devices</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {devices.map(device => (
              <button
                key={device.id}
                onClick={() => toggleDevice(device)}
                className={`p-4 rounded-xl flex flex-col items-start transition-colors ${
                  device.state === 'on' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
              >
                <span className="font-medium text-lg">{device.name}</span>
                <span className="text-sm opacity-80 capitalize">{device.state}</span>
              </button>
            ))}
            {devices.length === 0 && <div>No devices found.</div>}
          </div>
        </section> */}
      </main>
    </div>
  );
}
