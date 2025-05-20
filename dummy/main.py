#!/usr/bin/env python3

import json
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

with open("dummy/api_definitions.json", "r", encoding="utf-8") as f:
    endpoints = json.load(f)

cache = {}

def generate_value(spec: Any) -> Any:
    if isinstance(spec, dict):
        return generate_object(spec)
    elif isinstance(spec, list):
        if not spec:
            return []
        if isinstance(spec[0], dict):
            return [generate_object(item) for item in spec]
        elif all(isinstance(x, (str, int, float)) for x in spec):
            return choice(spec)
        else:
            return [generate_value(item) for item in spec]
    elif spec == "int":
        return randint(1000, 9999)
    elif spec == "float":
        return round(uniform(0, 100), 2)
    elif spec == "timestamp":
        return datetime.utcnow().isoformat()
    else:
        return spec

def generate_object(structure: Dict[str, Any]) -> Dict[str, Any]:
    return {key: generate_value(val) for key, val in structure.items()}

for ep in endpoints:
    path = ep["path"]
    interval = ep["interval"]
    structure = ep["structure"]
    count = ep["count"]
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
                entry["data"] = [generate_object(structure) for _ in range(count)]
                entry["last_updated"] = now
            return entry["data"]

    create_endpoint()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8765, reload=True)
