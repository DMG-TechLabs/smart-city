#!/usr/bin/env python3

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Any, Dict, List
from random import randint, choice, uniform
import uvicorn
import time

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

endpoints = [
    {
        "path": "/api/sensors",
        "interval": 60,
        "structure": {
            "id": "int",
            "name": ["Sensor A", "Sensor B", "Sensor C"],
            "value": "float",
            "status": ["active", "inactive", "error"],
            "timestamp": "timestamp"
        }
    },
    {
        "path": "/api/devices",
        "interval": 30,
        "structure": {
            "device_id": "int",
            "state": ["on", "off", "standby"],
            "temperature": "float",
            "last_seen": "timestamp"
        }
    }
]

cache = {}

def generate_value(spec: Any) -> Any:
    if isinstance(spec, list):
        return choice(spec)
    elif spec == "int":
        return randint(1000, 9999)
    elif spec == "float":
        return round(uniform(0, 100), 2)
    elif spec == "timestamp":
        return datetime.utcnow().isoformat()
    return spec

def generate_object(structure: Dict[str, Any]) -> Dict[str, Any]:
    return {key: generate_value(val) for key, val in structure.items()}

for ep in endpoints:
    path = ep["path"]
    interval = ep["interval"]
    structure = ep["structure"]
    cache[path] = {
        "last_updated": 0,
        "data": []
    }

    def create_endpoint(path=path, interval=interval, structure=structure):
        @app.get(path)
        async def dynamic_endpoint() -> List[Dict[str, Any]]:
            now = time.time()
            entry = cache[path]
            if now - entry["last_updated"] > interval:
                entry["data"] = [generate_object(structure) for _ in range(5)]
                entry["last_updated"] = now
            return entry["data"]

    create_endpoint()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8765, reload=True)
