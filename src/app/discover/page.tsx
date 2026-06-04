'use client';

import { BaseDevice } from '@/domains/devices/model';
import { useEffect, useState } from 'react';

export default function DiscoverPage() {
  const [devices, setDevices] = useState<BaseDevice[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [dbDeviceMap, setDbDeviceMap] = useState<Record<string, any>>({});
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Fetch raw HA discovery devices
      const haRes = fetch('/api/devices/discover');
      // Fetch what we already have configured in Prisma
      const dbRes = fetch('/api/devices');
      // Fetch available groups
      const groupsRes = fetch('/api/groups');

      const [haResponse, dbResponse, groupsResponse] = await Promise.all([haRes, dbRes, groupsRes]);

      if (haResponse.ok && dbResponse.ok && groupsResponse.ok) {
        const haData = await haResponse.json();
        const dbData = await dbResponse.json();
        const groupsData = await groupsResponse.json();

        setDevices(haData);
        setGroups(groupsData);
        
        // Pre-populate the `addedIds` set using the items returned from Prisma
        const existingIds = new Set<string>(dbData.map((d: any) => d.id));
        setAddedIds(existingIds);

        // Build a map of device configurations so we know their assigned group
        const map: Record<string, any> = {};
        dbData.forEach((d: any) => map[d.id] = d);
        setDbDeviceMap(map);
      } else {
        console.error('Failed to fetch data properly');
      }
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
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
        fetchAllData(); // Refresh to ensure dbDeviceMap holds the newly added device properly
      } else {
        console.error('Failed to save device');
      }
    } catch (error) {
      console.error('Error saving device', error);
    }
  };

  const handleAssignToGroup = async (device: BaseDevice, groupId: string) => {
    if (!groupId) return;
    try {
      const res = await fetch('/api/devices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId: device.id,
          customName: device.name,
          groupId: groupId,
        }),
      });

      if (res.ok) {
        alert(`Assigned ${device.name || device.id} to group!`);
        fetchAllData(); // Refresh so the dropdown shows the recently assigned group
      } else {
        console.error('Failed to assign group');
      }
    } catch (error) {
      console.error('Error assigning group', error);
    }
  };

  const handleRemoveDevice = async (entityId: string) => {
    try {
      const res = await fetch(`/api/devices?entityId=${encodeURIComponent(entityId)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(entityId);
          return next;
        });
      } else {
        console.error('Failed to remove device');
      }
    } catch (error) {
      console.error('Error removing device', error);
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
                      {addedIds.has(device.id) ? (
                        <div className="flex items-center gap-2">
                          <select
                            onChange={(e) => {
                              handleAssignToGroup(device, e.target.value);
                            }}
                            value={dbDeviceMap[device.id]?.groups?.[0]?.id || ""}
                            className="px-2 py-1 text-sm border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
                          >
                            <option value="" disabled>Add to Group...</option>
                            <option value="clear">Unparented (None)</option>
                            {groups.map((g) => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleRemoveDevice(device.id)}
                            className="px-3 py-1 text-white text-sm rounded bg-red-500 hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddDevice(device)}
                          className="px-3 py-1 text-white text-sm rounded bg-blue-500 hover:bg-blue-600"
                        >
                          Add to Dashboard
                        </button>
                      )}
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