import React, { useState } from "react";

type JsonSelectorProps = {
  json: string;
  onFieldClick?: (keyPath: string, value: any) => void;
};

export function JsonSelector({ json, onFieldClick }: JsonSelectorProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  let parsed: any;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    return <div className="text-red-500">Invalid JSON</div>;
  }

  const toggle = (path: string) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderValue = (value: any, path: string[] = [], indent = 0): React.ReactNode => {
    const indentation = " ".repeat(indent * 2);
    const keyPath = path.join(".");
    const isExpanded = expanded[keyPath];

    if (Array.isArray(value)) {
      return (
        <>
          <span>[</span>
          {isExpanded &&
            value.map((item, index) => (
              <div key={index} className="ml-4">
                {renderValue(item, [...path, String(index)], indent + 1)}
                {index < value.length - 1 ? "," : ""}
              </div>
            ))}
          <span>{indentation}]</span>
        </>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <>
          <span>{"{"}</span>
          {Object.entries(value).map(([key, val], i, arr) => {
            const fullPath = [...path, key];
            const fullKey = fullPath.join(".");
            const isLast = i === arr.length - 1;
            const isExpandable = typeof val === "object" && val !== null;

            return (
              <div key={fullKey} className="ml-4">
                <button
                  onClick={() => {
                    onFieldClick?.(fullKey, val);
                    if (isExpandable) toggle(fullKey);
                  }}
                  className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 font-mono"
                >
                  {key}
                </button>
                <span>: </span>
                <span className="font-mono">
                  {isExpandable && !expanded[fullKey] ? "…" : renderValue(val, fullPath, indent + 1)}
                </span>
                {!isLast && <span>,</span>}
              </div>
            );
          })}
          <span>{indentation}{"}"}</span>
        </>
      );
    }

    return (
      <span className="font-mono text-blue-800">
        {JSON.stringify(value)}
      </span>
    );
  };

  return (
    <pre className="text-sm leading-6 font-mono bg-gray-50 p-4 rounded overflow-auto">
      {renderValue(parsed)}
    </pre>
  );
}
