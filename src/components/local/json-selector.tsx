import React, { useState } from "react";

type JsonSelectorProps = {
  json: string;
  selectedPaths?: string[];
  onFieldClick?: (keyPath: string[]) => void;
};

export function JsonSelector({ json, selectedPaths = [], onFieldClick }: JsonSelectorProps) {
  let parsed: any;

  try {
    parsed = JSON.parse(json);
  } catch (e) {
    return <div className="text-red-500">Invalid JSON</div>;
  }

  const renderValue = (value: any, path: string[] = [], indent = 0): React.ReactNode => {
    const indentation = " ".repeat(indent * 2);

    if (Array.isArray(value)) {
      return (
        <>
          <span>[</span>
          {value.map((item, index) => (
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
            const pathStr = `/${fullPath.join("/")}`;
            const isSelected = selectedPaths.includes(pathStr);
            const isLast = i === arr.length - 1;

            return (
              <div key={pathStr} className="ml-4">
                <button
                  onClick={() => onFieldClick?.(fullPath)}
                  className={`px-2 py-1 rounded font-mono transition ${
                    isSelected ? "bg-green-300 hover:bg-green-400" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {key}
                </button>
                <span>: </span>
                <span className="font-mono">{renderValue(val, fullPath, indent + 1)}</span>
                {!isLast && <span>,</span>}
              </div>
            );
          })}
          <span>{indentation}{"}"}</span>
        </>
      );
    }

    return <span className="font-mono text-blue-800">{JSON.stringify(value)}</span>;
  };

  return (
    <pre className="text-sm leading-6 font-mono bg-gray-50 p-4 rounded overflow-auto">
      {renderValue(parsed)}
    </pre>
  );
}
