import { Tool } from "@/components/Canvas";
import getExistingShapes from "./Shapes";

type Shape={
    type:"rect"
    x:number,
    y:number,
    width:number,
    height:number
} | {
    type:"circle",
    centerX:number,
    centerY:number,
    radius:number
} | {
    type:"pencil",
    points:{
        x:number,
        y:number
    }[]
} 

export class Game {

    private canvas:HTMLCanvasElement;
    private selectedTool:Tool = "circle";
    private ctx:CanvasRenderingContext2D;
    private shapes:Shape[];
    private roomId:string;
    private clicked:boolean;
    private startX=0;
    private startY=0;
    private socket:WebSocket

    constructor(canvas:HTMLCanvasElement,roomID:string,socket:WebSocket){
        this.canvas=canvas;
        this.ctx=canvas.getContext("2d")!;
        this.roomId=roomID;
        this.socket=socket;
        this.shapes=[];
        this.clicked=false;
        this.init();
        this.initWebSocket();
        this.initMouseHandlers();
    }

    destroy(){
        this.canvas.removeEventListener("mousedown",this.mouseDowmHandler);
        this.canvas.removeEventListener("mouseup",this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove",this.mouseMoveHandler);
    }

    setTool(tool:Tool){
        this.selectedTool=tool
    }

    async init(){
        this.shapes = await getExistingShapes(this.roomId);
        this.clearCanvas();

    }
    initWebSocket(){
        this.socket.onmessage=(event)=>{
             const message = JSON.parse(event.data);
             if(message.type === "chat"){
                const parsedShape = JSON.parse(message.message);
                this.shapes.push(parsedShape.shape);
                this.clearCanvas();
             }
        }
    }

    drawRect(shape:Shape){
        if(shape.type === "rect") this.ctx.strokeRect(shape.x,shape.y,shape.width,shape.height)
    }
    
    drawCircle(shape:Shape){
        if(shape.type === "circle"){
            this.ctx.beginPath();
            this.ctx.arc(shape.centerX,shape.centerY,Math.abs(shape.radius),0,Math.PI*2)
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }
    drawPencil(shape:Shape){
        if(shape.type === "pencil"){
            const points = shape.points;
            this.ctx.beginPath();
            this.ctx.moveTo(points[0].x,points[0].y);
            points.forEach((point) => this.ctx.lineTo(point.x,point.y));
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }



    
    clearCanvas(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.fillStyle = "rgba(0,0,0)"
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height)
        this.ctx.strokeStyle = "rgb(255,255,255)"
        
        this.shapes.map((shape)=>{
            if(shape.type === "rect"){
                // this.ctx.strokeRect(shape.x,shape.y,shape.width,shape.height)
                this.drawRect(shape);
            } else if(shape.type === "circle"){
                // this.ctx.beginPath();
                // this.ctx.arc(shape.centerX,shape.centerY,Math.abs(shape.radius),0,Math.PI*2)
                // this.ctx.stroke();
                // this.ctx.closePath();
                this.drawCircle(shape);
            } else if(shape.type === "pencil") this.drawPencil(shape);
        })
    }
    
    mouseDowmHandler = (e:any) => {
        this.clicked = true;
        this.startX = e.clientX;
        this.startY = e.clientY;

        
        if (this.selectedTool === "pencil") {
            this.shapes.push({
                type: "pencil",
                points: [{ x: e.clientX, y: e.clientY }],
            });
        }
    }

    mouseUpHandler = (e:any) =>{
        this.clicked=false;
        const width = e.clientX - this.startX;
        const height = e.clientY-this.startY;

        let shape:Shape | null =null;
        if(this.selectedTool === "rect"){
             shape = {
                type:"rect",
                x:this.startX,
                y:this.startY,
                width,
                height
            }
        } else if(this.selectedTool==="circle"){
            const radius =(Math.max(width,height)/2);
            shape={
                type:"circle",
                centerX:this.startX+radius,
                centerY:this.startY+radius,
                radius:Math.abs(radius)
            }
        } else if (this.selectedTool === "pencil") {
            shape=this.shapes[this.shapes.length-1];
        }
        if(!shape) return
        this.shapes.push(shape);
        this.socket.send(JSON.stringify({
            type:"chat",
            message:JSON.stringify({
                shape
            }),
            roomId : this.roomId
        })) 
    }

    mouseMoveHandler = (e:any)=>{
        if(this.clicked){
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;

            this.clearCanvas();
            this.ctx.strokeStyle = "rgb(255,255,255)";
            if(this.selectedTool==="rect"){
                // this.ctx.strokeRect(this.startX,this.startY,width,height)
                this.drawRect({
                    type:"rect",
                    x:this.startX,
                    y:this.startY,
                    width,
                    height
                })
            } else if(this.selectedTool === "circle"){
                const radius =(Math.max(width,height)/2);
                const centerX = radius + this.startX;
                const centerY = radius + this.startY;
                
                this.drawCircle({
                    type:"circle",
                    centerX,
                    centerY,
                    radius
                })
                // this.ctx.beginPath();
                // this.ctx.arc(centerX,centerY,Math.abs(radius),0,Math.PI*2);
                // this.ctx.stroke();
                // this.ctx.closePath();
            } else if(this.selectedTool === "pencil"){
                const currentShape = this.shapes[this.shapes.length - 1] as Shape
                 if (
                        currentShape &&
                        currentShape.type === "pencil" &&
                        Array.isArray(currentShape.points)
                    ){
                    currentShape.points.push({x:e.clientX,y:e.clientY})
                    this.drawPencil(currentShape)
                }
                // (currentShape as {
                //     type:"pencil",
                //     points:{
                //         x:number,
                //         y:number
                //     }[]
                // }).points.push({x:e.clientX , y:e.clientY});
                // this.drawPencil(currentShape);
            }
        }
    }

    initMouseHandlers(){
        this.canvas.addEventListener("mouseup",this.mouseUpHandler);
        this.canvas.addEventListener("mousedown",this.mouseDowmHandler);
        this.canvas.addEventListener("mousemove",this.mouseMoveHandler)
    }

}
