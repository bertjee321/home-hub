'use client';

import { BaseDevice } from '@/domains/devices/model';
import { useEffect, useState } from 'react';

export default function DiscoverPage() {
  const [devices, setDevices] = useState<BaseDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchDevices() {
      try {
        const response = await fetch('/api/devices/discover');
        if (response.ok) {
          const data = await response.json();
          setDevices(data);
        } else {
          console.error('Failed to fetch devices');
        }
      } catch (error) {
        console.error('Error fetching devices', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDevices();
  }, []);

  const handleAddDevice = async (device: BaseDevice) => {
    try {
      const res = await fetch('/api/devices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId: device.id,
          customName: device.name,
        }),
      });

      if (res.ok) {
        setAddedIds((prev) => new Set(prev).add(device.id));
      } else {
        console.error('Failed to save device');
      }
    } catch (error) {
      console.error('Error saving device', error);
    }
  };

  return (
    <div className="p-8 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6">Discover Home Assistant Devices</h1>
      
      {loading ? (
        <p>Loading devices...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-900">
                <th className="py-2 px-4 border-b dark:border-gray-700 text-left">Entity ID</th>
                <th className="py-2 px-4 border-b dark:border-gray-700 text-left">Friendly Name</th>
                <th className="py-2 px-4 border-b dark:border-gray-700 text-left">State</th>
                <th className="py-2 px-4 border-b dark:border-gray-700 text-left">Domain/Type</th>
                <th className="py-2 px-4 border-b dark:border-gray-700 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => {
                return (
                  <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-2 px-4 border-b dark:border-gray-700">{device.id}</td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">
                      {device.name || 'N/A'}
                    </td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">{device.state}</td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">{device.type}</td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">
                      <button
                        onClick={() => handleAddDevice(device)}
                        disabled={addedIds.has(device.id)}
                        className={`px-3 py-1 text-white text-sm rounded ${
                          addedIds.has(device.id)
                            ? 'bg-green-500 cursor-default'
                            : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                      >
                        {addedIds.has(device.id) ? 'Added' : 'Add to Dashboard'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Total devices: {devices.length}</p>
        </div>
      )}
    </div>
  );
}