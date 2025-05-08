"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { JsonSelector } from "@/components/local/json-selector";
import { useState } from "react";

export default function ProvidersAdd() {
  const [provider, setProvider] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [jsonData, setJsonData] = useState("{}");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      const normalized = Array.isArray(data) ? data[0] : data;
      setJsonData(JSON.stringify(normalized, null, 2));
    } catch (err) {
      console.error("Error fetching data:", err);
      setJsonData('{ "error": "Failed to fetch data" }');
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

  const collectAllPaths = (obj: any, basePath: string[] = []): string[] => {
    if (typeof obj !== "object" || obj === null) {
      return [`/${basePath.join("/")}`];
    }

    let paths: string[] = [];

    for (const key of Object.keys(obj)) {
      const val = obj[key];
      const newPath = [...basePath, key];

      if (typeof val === "object" && val !== null) {
        paths = paths.concat(collectAllPaths(val, newPath));
      } else {
        paths.push(`/${newPath.join("/")}`);
      }
    }

    return paths;
  };

  const handleSelectAllFields = () => {
    try {
      const parsed = JSON.parse(jsonData);
      const allPaths = collectAllPaths(parsed);
      setSelectedFields(allPaths);
    } catch (err) {
      console.error("Invalid JSON:", err);
    }
  };

  const handleAdd = async () => {
    if (!provider.trim() || !endpoint.trim()) {
      setStatusMessage("Error: Provider and endpoint are required.");
      return;
    }

    if (selectedFields.length === 0) {
      setStatusMessage("Error: At least one field must be selected.");
      return;
    }

    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          endpoint,
          paths: selectedFields,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to register provider");
      }

      setStatusMessage("Provider registered successfully!");
      setProvider("");
      setEndpoint("");
      setSelectedFields([]);
      setJsonData("{}");
    } catch (err: any) {
      console.error("Error:", err.message);
      setStatusMessage(`Error: ${err.message}`);
    }
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
        <div className="flex gap-2">
          <button
            onClick={handleSelectAllFields}
            className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
          >
            Select All Fields
          </button>
          <button
            onClick={() => setSelectedFields([])}
            className="flex-1 bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600"
          >
            Deselect All
          </button>
        </div>
        <div className="pt-2">
          <button
            onClick={handleAdd}
            className="w-full bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
          >
            Add
          </button>
        </div>
        {statusMessage && (
          <div
            className={`p-2 rounded text-sm ${
              statusMessage.startsWith("Error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {statusMessage}
          </div>
        )}
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
