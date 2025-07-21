"use client"
import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomSlug, setRoomSlug] = useState("");
  const router  = useRouter();
  return (
     <div>
      <input type="text" onChange={(e) => setRoomSlug(e.target.value)} />
      <button onClick={()=>router.push(`/room/${roomSlug}`)}>Join room</button>
     </div>
  );
}
