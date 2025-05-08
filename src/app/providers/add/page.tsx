"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { JsonSelector } from "@/components/local/json-selector";
import { useState } from "react";

export default function ProvidersAdd() {
  const [provider, setProvider] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [jsonData, setJsonData] = useState("{}");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      setJsonData(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Error fetching data:", err);
      setJsonData("{\"error\": \"Failed to fetch data\"}");
    }
  };

  const handleToggleField = (path: string[]) => {
    const fieldPath = `/${path.join("/")}`;
    setSelectedFields((prev) =>
      prev.includes(fieldPath)
        ? prev.filter((p) => p !== fieldPath)
        : [...prev, fieldPath]
    );
  };

  const handleAdd = () => {
    console.log("Provider:", provider);
    console.log("Endpoint:", endpoint);
    console.log("Selected Fields:", selectedFields);

    // TODO: Replace with backend call
  };

  return (
    <div className="flex gap-4">
      <div className="w-[25vw] space-y-4">
        <div>
          <label className="block text-sm font-medium">Provider</label>
          <input
            type="text"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Endpoint</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="mt-1 flex-1 rounded border border-gray-300 px-2 py-1"
            />
            <button
              onClick={fetchData}
              className="mt-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Fetch
            </button>
          </div>
        </div>
        <div className="pt-2">
          <button
            onClick={handleAdd}
            className="w-full bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
          >
            Add
          </button>
        </div>
      </div>

      <ScrollArea className="h-full w-[50vw] max-h-[80vh] rounded-md border p-4">
        <JsonSelector
          json={jsonData}
          selectedPaths={selectedFields}
          onFieldClick={(path) => handleToggleField(path)}
        />
      </ScrollArea>
    </div>
  );
}
