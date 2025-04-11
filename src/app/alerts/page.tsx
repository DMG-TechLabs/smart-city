"use client";

// import { useUser } from "@/context/UserContext";
import PocketBase from "pocketbase";
const pb = new PocketBase("http://127.0.0.1:8090");

export default function Dashboard() {
  // const { user, logout } = useUser();


  const addJob = pb.send("/api/hello", {
    query: { "abc": 123 },
  });


  addJob.then((res) => {
    console.log(res);
  });

  return (
    <div>
    </div>
  );
}
