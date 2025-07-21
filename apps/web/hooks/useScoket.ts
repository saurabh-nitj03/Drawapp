import { useEffect,useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket(){
    const [loading,setLoading] = useState(true);
    const [socket,setSocket ]=useState<WebSocket>();

    useEffect(()=>{
      const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijk4OWNmYTMxLWFkNjQtNGVkNy1hMjkwLTA3MmQxYTVmZDRmZCIsImlhdCI6MTc1MzAxMDIxNX0.Qb8zI8nV7W8qsft3TdIN8rbKz0UdktmEwMIqVvdJoSA`);
      ws.onopen=()=>{
        setLoading(false)
        setSocket(ws)
      }
    },[])
    return {
        socket,
        loading
    }

}