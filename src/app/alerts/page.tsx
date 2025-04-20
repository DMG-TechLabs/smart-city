"use client";

import { usePocketBase } from "@/context/DatabaseContext";

export default function Alerts() {
  const pb = usePocketBase();

  const addJob = pb.send("/api/hello", {
    query: { 
      "query": "value > 2",
      "title": "helloWorldTask",
      "active": true
    }
  });


  addJob.then((res) => {
    console.log(res);
  });

  return (
    <div>
    </div>
  );
}
