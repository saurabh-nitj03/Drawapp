import { ReactNode } from "react"


export function Icon({icon,onClickHandler,activated}:{
    icon:ReactNode,
    activated:boolean,
    onClickHandler:()=>void
}){
    return <div className={
        `m-2 pointer rounded-full border border-gray-700 p-2 bg-black hover:bg-gray ${activated ? "text-red-400":"text-white"}`
    }
        onClick ={onClickHandler}
    >
        {icon}
    </div>
}