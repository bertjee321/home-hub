"use client";

import { MergedDevice } from "@/lib/models/device.model";
import { useEffect, useState } from "react";

export default function LightsPage() {
  const [lights, setLights] = useState<MergedDevice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLights() {
      try {
        const response = await fetch("/api/devices/lights");
        const data: MergedDevice[] = await response.json();

        console.log(data);
        setLights(data);
      } catch (error) {
        console.error("Failed to fetch lights:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLights();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-black dark:text-white">Loading lights...</div>
    );

  const unparentedLights = lights.filter(
    (d) => !d.groups || d.groups.length === 0,
  );

  return (
    <div className="p-8 text-white">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Lights</h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Control and monitor your lighting system.
        </p>
      </header>
      <div className="flex items-center justify-center h-64 bg-zinc-800 rounded-2xl border border-zinc-700">
        {loading ? (
          <p className="text-zinc-500 text-sm">Loading...</p>
        ) : (
          <p className="text-zinc-500 text-sm">Coming soon</p>
        )}
      </div>
    </div>
  );
}
