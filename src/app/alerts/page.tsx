"use client";

// import { useUser } from "@/context/UserContext";

import { usePocketBase } from "@/context/DatabaseContext";

export default function Dashboard() {
  // const { user, logout } = useUser();
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
