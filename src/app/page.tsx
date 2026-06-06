"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [devices, setDevices] = useState<any[]>([]);
  const [groupsConfig, setGroupsConfig] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  useEffect(() => {
    // 1. Fetch the initial list of Opted-In dashboard devices + their current HA state
    //    and fetch the list of available groups
    async function fetchDashboard() {
      try {
        const [devRes, grpRes] = await Promise.all([
          fetch("/api/devices"),
          fetch("/api/groups")
        ]);
        
        if (devRes.ok) setDevices(await devRes.json());
        if (grpRes.ok) setGroupsConfig(await grpRes.json());
        
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

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName.trim() }),
      });

      if (res.ok) {
        setIsGroupModalOpen(false);
        setNewGroupName("");
        // Optionally trigger a re-fetch of the dashboard to pull the new group structures
        // (Even if empty, it's good practice so they appear in dropdowns later)
        window.location.reload(); 
      }
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleAssignToGroup = async (device: any, groupId: string) => {
    try {
      const res = await fetch('/api/devices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId: device.id,
          customName: device.customName,
          groupId: groupId === "unparented" ? "clear" : groupId,
        }),
      });

      if (res.ok) {
        // Just reload the page to cleanly reconstruct the lists
        window.location.reload();
      }
    } catch (error) {
      console.error('Error assigning group', error);
    }
  };

  const handleToggleDevice = async (device: any) => {
    const domain = device.id.split('.')[0];
    if (domain !== 'light' && domain !== 'switch') return;

    const action = device.state === 'on' ? 'turn_off' : 'turn_on';
    
    // Optimistic Update
    setDevices((prev) => 
      prev.map((d) => 
        d.id === device.id 
          ? { ...d, state: action === 'turn_on' ? 'on' : 'off' } 
          : d
      )
    );

    try {
      await fetch('/api/devices/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId: device.id, action })
      });
    } catch (error) {
      console.error('Failed to toggle device', error);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-black dark:text-white">Loading Dashboard...</div>
    );

  // Separate devices into "Unparented" (no groups) and whatever groups we have
  const unparentedDevices = devices.filter((d) => !d.groups || d.groups.length === 0);

  // We map over our explicit groups config so that empty groups render. 
  // Then we filter out the devices belonging to each group.
  const groupsToRender = groupsConfig.map(group => {
    const devicesInGroup = devices.filter(d => 
      d.groups && d.groups.some((g: any) => g.id === group.id)
    );
    return {
      ...group,
      devices: devicesInGroup
    };
  });


  return (
    <div className="p-8 text-white font-sans">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Smart Home Dashboard</h1>
        <button
          onClick={() => setIsGroupModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow font-medium transition"
        >
          Create Group
        </button>
      </header>

      <div className="space-y-8">
        {/* We can flesh out Groups later, for now we will just list Unparented ones! */}
        
        {/* Dynamic Groups rendering */ }
        {groupsToRender.map(group => (
          <section key={group.id} className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">{group.name}</h2>
            {group.devices.length === 0 ? (
              <p className="text-gray-500">No devices in this group.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {group.devices.map((device: any) => (
                  <div
                    key={device.id}
                    className={`p-4 rounded-xl border flex justify-between items-start ${
                      device.state === 'on' 
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                        : 'bg-gray-50 border-gray-200 dark:bg-zinc-900 dark:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {(device.id.startsWith('light.') || device.id.startsWith('switch.')) && (
                        <button 
                          onClick={() => handleToggleDevice(device)}
                          className={`w-10 h-6 rounded-full relative transition-colors ${device.state === 'on' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                          aria-label={`Toggle ${device.customName || device.id}`}
                        >
                          <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${device.state === 'on' ? 'translate-x-4' : ''}`} />
                        </button>
                      )}
                      <div className="flex-1 cursor-pointer">
                        <h3 className="font-semibold">{device.customName || device.id}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{device.state}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 p-1 font-bold">
                        &#8964; {/* Down arrow / menu icon */}
                      </button>
                      <select
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer bg-white text-black dark:bg-zinc-800 dark:text-white"
                        value=""
                        onChange={(e) => handleAssignToGroup(device, e.target.value)}
                      >
                        <option value="" disabled>Move to...</option>
                        <option value="unparented">Unparented (Remove)</option>
                        {groupsConfig.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

                <section className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Unparented Devices</h2>
          {unparentedDevices.length === 0 ? (
            <p className="text-gray-500">No unparented devices on the dashboard.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {unparentedDevices.map(device => (
                <div
                  key={device.id}
                  className={`p-4 rounded-xl border flex justify-between items-start ${
                    device.state === 'on' 
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                      : 'bg-gray-50 border-gray-200 dark:bg-zinc-900 dark:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {(device.id.startsWith('light.') || device.id.startsWith('switch.')) && (
                      <button 
                        onClick={() => handleToggleDevice(device)}
                        className={`w-10 h-6 rounded-full relative transition-colors ${device.state === 'on' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                        aria-label={`Toggle ${device.customName || device.id}`}
                      >
                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${device.state === 'on' ? 'translate-x-4' : ''}`} />
                      </button>
                    )}
                    <div className="flex-1 cursor-pointer">
                      <h3 className="font-semibold">{device.customName || device.id}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{device.state}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 p-1 font-bold">
                      &#8964; {/* Down arrow / menu icon */}
                    </button>
                    <select
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer bg-white text-black dark:bg-zinc-800 dark:text-white"
                      value=""
                      onChange={(e) => handleAssignToGroup(device, e.target.value)}
                    >
                      <option value="" disabled>Move to...</option>
                      {groupsConfig.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Create Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold mb-4">Create New Group</h2>
            <input
              type="text"
              autoFocus
              className="w-full border dark:border-zinc-700 bg-transparent rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Living Room"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newGroupName.trim().length > 0) {
                  handleCreateGroup();
                }
              }}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="px-4 py-2 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={newGroupName.trim().length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
