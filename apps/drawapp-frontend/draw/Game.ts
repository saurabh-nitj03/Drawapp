
// import { Tool } from "@/components/Canvas";
// import getExistingShapes from "./Shapes";

// type Shape = {
//       type: "rect";
//       x: number;
//       y: number;
//       width: number;
//       height: number;
//     }
//   | {
//       type: "circle";
//       centerX: number;
//       centerY: number;
//       radius: number;
//     }
//   | {
//       type: "pencil";
//       points: {
//         x: number;
//         y: number;
//       }[];
//     }
//     |{
//       type: "rhombus";
//       x: number;
//       y: number;
//       width: number;
//       height: number;
//     }
//     |{
//       type:"line",
//       x1:number,
//       x2:number,
//       y1:number,
//       y2:number
//     }
//     |{
//       type:"text",
//       x:number,
//       y:number,
//       content:string
//     };

// export class Game {
//   private canvas: HTMLCanvasElement;
//   private selectedTool: Tool = "hand";
//   private ctx: CanvasRenderingContext2D;
//   private shapes: Shape[];
//   private roomId: string;
//   private clicked: boolean;
//   private startX_screen = 0;
//   private startY_screen = 0;
//   private socket: WebSocket;

//   private redoShapes:Shape[];

//   private viewportTransform = {
//     x: 0,
//     y: 0,
//     scale: 1,
//   };

//   private currentDrawingShape: Shape | null = null;

//   private mouseDownHandler = this.onMouseDown.bind(this);
//   private mouseUpHandler = this.onMouseUp.bind(this);
//   private mouseMoveHandler = this.onMouseMove.bind(this);
//   private mouseWheelHandler = this.onMouseWheel.bind(this);

//   constructor(canvas: HTMLCanvasElement, roomID: string, socket: WebSocket) {
//     this.canvas = canvas;
//     this.ctx = canvas.getContext("2d")!;
//     this.roomId = roomID;
//     this.socket = socket;
//     this.shapes = [];
//     this.clicked = false;
//     this.canvas.width = window.innerWidth;
//     this.canvas.height = window.innerHeight;
//     this.init();
//     this.initWebSocket();
//     this.initEventHandlers();
//     this.redoShapes=[];

//     window.addEventListener("resize", this.onResize.bind(this));
//   }

//   destroy() {
//     this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
//     this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
//     this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
//     this.canvas.removeEventListener("wheel", this.mouseWheelHandler);
//     this.canvas.removeEventListener("keypress", this.onKeyPress);
//     window.removeEventListener("resize", this.onResize.bind(this));
//   }

//   setTool(tool: Tool) {
//     this.selectedTool = tool;
//     if(this.selectedTool === "undo"){
//       this.undo();
//     } else if(this.selectedTool === "redo"){
//       this.redo();
//     } else if(this.selectedTool === "clear"){
//       this.clear();
//     }
//   }

//   async init() {
//     this.shapes = await getExistingShapes(this.roomId);
//     this.render();
//   }

//   initWebSocket() {
//     this.socket.onmessage = (event) => {
//       const message = JSON.parse(event.data);
//       console.log(message);
//       if (message.type === "chat") { // For new shapes being drawn
//         const parsedShape = JSON.parse(message.message);
//         this.shapes.push(parsedShape.shape);
//         this.redoShapes = [];
//         // this.saveState(); // Save state after a new shape is received and added
//         this.render();
//       } else if (message.type === "undo") { 

//              this.performUndoLocally();
//         // }
//       } else if (message.type === "redo") { 
//             this.performRedoLocally();
//         // }
//       } else if(message.type === "clear"){
//         // this.shapes = [];
//         // this.currentDrawingShape=null
//         // this.render();
//         this.clearLocally();
//       }
//     };
//   }


//   // New helper function to perform undo locally
//   private performUndoLocally() {
//       if (this.shapes.length > 0) {
//           const redo = this.shapes.pop()!;
//           this.redoShapes.push(redo);
//           this.render();
//           return redo;
//       }
//   }

//   // New helper function to perform redo locally
//   private performRedoLocally() {
//       if (this.redoShapes.length > 0) {
//           const undo = this.redoShapes.pop()!;
//           console.log(undo);
//           this.shapes.push(undo);
//           this.render();
//           return undo
//       }
//   }

//   private clearLocally(){
//       this.shapes=[];
//       this.render();
//   }

//   undo() {
//     const shape = this.performUndoLocally(); // Perform local undo
//     // Notify others about the undo

//     this.socket.send(
//       JSON.stringify({
//         type: "undo",
//         roomId: this.roomId,
//         message:JSON.stringify({shape:shape})
//       })
//     );
//   }

//   redo() {
//     const shape = this.performRedoLocally(); // Perform local redo
//     // Notify others about the redo
//     this.socket.send(
//       JSON.stringify({
//         type: "redo",
//         roomId: this.roomId,
//         message:JSON.stringify({shape:shape})
//       })
//     );
//   }
//   clear(){
//       if(this.selectedTool === "clear"){
//       this.clearLocally();
//       this.socket.send(JSON.stringify({
//         type:"clear",
//         roomId:this.roomId
//       }))
//     }
//   }

//   drawRect(shape: Shape) {
//     if (shape.type === "rect") {
//       this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
//     }
//   }


//   drawCircle(shape: Shape) {
//     if (shape.type === "circle") {
//       this.ctx.beginPath();
//       this.ctx.arc(
//         shape.centerX,
//         shape.centerY,
//         Math.abs(shape.radius),
//         0,
//         Math.PI * 2
//       );
//       this.ctx.stroke();
//       this.ctx.closePath();
//     }
//   }

//   drawPencil(shape: Shape) {
//     if (shape.type === "pencil") {
//       const points = shape.points;
//       if (points.length < 1) return;
//       this.ctx.beginPath();
//       this.ctx.moveTo(points[0].x, points[0].y);
//       points.forEach((point) => this.ctx.lineTo(point.x, point.y));
//       this.ctx.stroke();
//       this.ctx.closePath();
//     }
//   }
//   drawRhombus =(shape: Shape) => {
//         if (shape?.type === "rhombus") {
//             // this.ctx.strokeStyle = this.selectedColor.toString();
//             this.ctx.beginPath();

//             // Calculate the diamond points based on the shape's width and height
//             const centerX = shape.x + shape.width / 2;
//             const centerY = shape.y + shape.height / 2;

//             this.ctx.moveTo(centerX, shape.y); // Top point
//             this.ctx.lineTo(shape.x + shape.width, centerY); // Right point
//             this.ctx.lineTo(centerX, shape.y + shape.height); // Bottom point
//             this.ctx.lineTo(shape.x, centerY); // Left point
//             this.ctx.closePath();
//             this.ctx.stroke();
//         }
//     }

//     drawLine= (shape: Shape)=> {
//         if (shape?.type === "line") {
//             // this.ctx.strokeStyle = this.selectedColor.toString();
//             this.ctx.beginPath();
//             this.ctx.moveTo(shape.x1, shape.y1);
//             this.ctx.lineTo(shape.x2, shape.y2);
//             this.ctx.stroke();
//             this.ctx.closePath();
//         }
//     }
//      drawText(shape: Shape) {
//         if (shape?.type === "text") {
//             this.ctx.font = "14px Arial"; // Customize font as needed
//             // this.ctx.fillStyle = this.theme.toString();
//             this.ctx.fillText(shape.content, shape.x, shape.y);
//         }
//     }



//   screenToWorld(x: number, y: number) {
//     return {
//       x: (x - this.viewportTransform.x) / this.viewportTransform.scale,
//       y: (y - this.viewportTransform.y) / this.viewportTransform.scale,
//     };
//   }

//   worldToScreen(x: number, y: number) {
//     return {
//       x: x * this.viewportTransform.scale + this.viewportTransform.x,
//       y: y * this.viewportTransform.scale + this.viewportTransform.y,
//     };
//   }

//   clearCanvas() {
//     this.ctx.setTransform(1, 0, 0, 1, 0, 0);
//     this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
//     this.ctx.save();
//     this.ctx.setTransform(
//       this.viewportTransform.scale,
//       0,
//       0,
//       this.viewportTransform.scale,
//       this.viewportTransform.x,
//       this.viewportTransform.y
//     );
//     this.ctx.fillStyle = "rgba(0,0,0,0)";
//     this.ctx.fillRect(
//       0,
//       0,
//       this.canvas.width / this.viewportTransform.scale,
//       this.canvas.height / this.viewportTransform.scale
//     );
//     this.ctx.strokeStyle = "rgb(255,255,255)";
//   }

//   render() {
//     this.clearCanvas();
//     console.log(this.shapes.length);
//     this.shapes?.forEach((shape) => {
//       if(!shape){}
//       else{
//       if (shape.type === "rect") this.drawRect(shape);
//       else if (shape.type === "circle") this.drawCircle(shape);
//       else if (shape.type === "pencil") this.drawPencil(shape);
//       else if (shape.type === "rhombus") this.drawRhombus(shape);
//       else if (shape.type === "line") this.drawLine(shape);
//       else if (shape.type === "text") this.drawText(shape);
//     }
//     });

//     if (this.currentDrawingShape) {
//       this.ctx.strokeStyle = "rgba(255,255,255,0.7)"; 
//       if (this.currentDrawingShape.type === "rect")
//         this.drawRect(this.currentDrawingShape);
//      else if (this.currentDrawingShape.type === "rhombus")
//         this.drawRhombus(this.currentDrawingShape);
//       else if (this.currentDrawingShape.type === "circle")
//         this.drawCircle(this.currentDrawingShape);
//       else if (this.currentDrawingShape.type === "line")
//         this.drawLine(this.currentDrawingShape);
//       else if (this.currentDrawingShape.type === "pencil")
//         this.drawPencil(this.currentDrawingShape);
//       else if (this.currentDrawingShape.type === "text")
//         this.drawText(this.currentDrawingShape);
//       this.ctx.strokeStyle = "rgb(255,255,255)"; 
//     }
//   }

//   onMouseDown(e: MouseEvent) {
//     this.clicked = true;
//     this.startX_screen = e.clientX;
//     this.startY_screen = e.clientY;

//     const worldStart = this.screenToWorld(e.clientX, e.clientY);

//     // Save the state *before* a new drawing action begins
//     // if (this.selectedTool !== "hand") { 
//     //     // this.saveState(); 
//     // }

//     if (this.selectedTool === "pencil") {
//       this.currentDrawingShape = {
//         type: "pencil",
//         points: [{ x: worldStart.x, y: worldStart.y }],
//       };
//     } else if (this.selectedTool === "rect") {
//       this.currentDrawingShape = {
//         type: "rect",
//         x: worldStart.x,
//         y: worldStart.y,
//         width: 0,
//         height: 0,
//       };
//     } else if (this.selectedTool === "circle") {
//       this.currentDrawingShape = {
//         type: "circle",
//         centerX: worldStart.x,
//         centerY: worldStart.y,
//         radius: 0,
//       };
//     }  else if (this.selectedTool === "rhombus") {
//       this.currentDrawingShape = {
//         type: "rhombus",
//         x: worldStart.x,
//         y: worldStart.y,
//         width: 0,
//         height:0
//       };
//     }  else if (this.selectedTool === "line") {
//       this.currentDrawingShape = {
//         type: "line",
//         x1: worldStart.x,
//         y1: worldStart.y,
//         x2: worldStart.x,
//         y2:worldStart.y
//       };
//      } else if (this.selectedTool === "text") {
//       this.currentDrawingShape = {
//         type: "text",
//         x: worldStart.x,
//         y: worldStart.y,
//         content:""
//       };
//       this.canvas.addEventListener("keypress" ,this.onKeyPress);

//     } 
//   }

//   onMouseUp(e: MouseEvent) {
//     this.clicked = false;
//     let finalizedShape: Shape | null = null;



//     if (this.selectedTool !== "hand" && this.currentDrawingShape) {
//       finalizedShape = this.currentDrawingShape;
//     }
//     if(this.selectedTool === "text"){

//     }

//     if (finalizedShape) {
//       console.log(finalizedShape);
//       this.shapes.push(finalizedShape);
//       this.redoShapes = [];
//       this.socket.send(
//         JSON.stringify({
//           type: "chat", 
//           message: JSON.stringify({
//             shape: finalizedShape,
//           }),
//           roomId: this.roomId,
//         })
//       );
//     }
//     console.log(finalizedShape);
//     // if(finalizedShape?.type === "rect") this.drawRect(finalizedShape);
//     // if(finalizedShape?.type === "circle") this.drawCircle(finalizedShape);
//     // if(finalizedShape?.type === "pencil") this.drawPencil(finalizedShape);

//     this.currentDrawingShape = null; 
//     this.render(); 
//   }

//   onMouseMove(e: MouseEvent) {
//     if (!this.clicked) return;

//     const worldCurrent = this.screenToWorld(e.clientX, e.clientY);
//     const worldStart = this.screenToWorld(
//       this.startX_screen,
//       this.startY_screen
//     );

//     if (this.selectedTool === "hand") {
//       const dx = e.clientX - this.startX_screen;
//       const dy = e.clientY - this.startY_screen;
//       this.viewportTransform.x += dx;
//       this.viewportTransform.y += dy;
//       this.startX_screen = e.clientX;
//       this.startY_screen = e.clientY;
//       this.render();
//     } else if (this.currentDrawingShape) {
//       if (
//         this.selectedTool === "rect" &&
//         this.currentDrawingShape.type === "rect"
//       ) {
//         this.currentDrawingShape.x = worldStart.x;
//         this.currentDrawingShape.y = worldStart.y;
//         this.currentDrawingShape.width = worldCurrent.x - worldStart.x;
//         this.currentDrawingShape.height = worldCurrent.y - worldStart.y;
//       } else if (
//         this.selectedTool === "rhombus" &&
//         this.currentDrawingShape.type === "rhombus"
//       ) {
//         this.currentDrawingShape.x = Math.min(worldStart.x, worldCurrent.x);
//         this.currentDrawingShape.y = Math.min(worldStart.y, worldCurrent.y);
//         this.currentDrawingShape.width = Math.abs(worldCurrent.x - worldStart.x);
//         this.currentDrawingShape.height = Math.abs(worldCurrent.y - worldStart.y);
//       } 
//        else if (
//         this.selectedTool === "line" &&
//         this.currentDrawingShape.type === "line"
//       ) {
//         this.currentDrawingShape.x1 = worldStart.x;
//         this.currentDrawingShape.y1 = worldStart.y;
//         this.currentDrawingShape.x2 = worldCurrent.x ;
//         this.currentDrawingShape.y2 = worldCurrent.y ;
//       } 
//       else if (
//         this.selectedTool === "circle" &&
//         this.currentDrawingShape.type === "circle"
//       ) {
//         const minX = Math.min(worldStart.x, worldCurrent.x);
//         const maxX = Math.max(worldStart.x, worldCurrent.x);
//         const minY = Math.min(worldStart.y, worldCurrent.y);
//         const maxY = Math.max(worldStart.y, worldCurrent.y);

//         const boundingBoxWidth = maxX - minX;
//         const boundingBoxHeight = maxY - minY;

//         const radius = Math.max(boundingBoxWidth, boundingBoxHeight) / 2;

//         this.currentDrawingShape.centerX = minX + boundingBoxWidth / 2;
//         this.currentDrawingShape.centerY = minY + boundingBoxHeight / 2;
//         this.currentDrawingShape.radius = radius;
//       } else if (
//         this.selectedTool === "pencil" &&
//         this.currentDrawingShape.type === "pencil"
//       ) {
//         const last = this.currentDrawingShape.points.at(-1);
//         if (
//           last &&
//           Math.hypot(worldCurrent.x - last.x, worldCurrent.y - last.y) >
//             2 / this.viewportTransform.scale 
//         ) {
//           this.currentDrawingShape.points.push({
//             x: worldCurrent.x,
//             y: worldCurrent.y,
//           });
//         }
//       }

//       this.render();
//     }
//   }

//   onMouseWheel(e: WheelEvent) {
//     e.preventDefault();

//     const zoomAmount = 1.1;
//     const mouseX = e.clientX;
//     const mouseY = e.clientY;
//     const worldPoint = this.screenToWorld(mouseX, mouseY);

//     let newScale = this.viewportTransform.scale;
//     if (e.deltaY < 0) newScale *= zoomAmount; 
//     else newScale /= zoomAmount; 

//     newScale = Math.max(0.01, Math.min(newScale, 10)); 

//     this.viewportTransform.x = mouseX - worldPoint.x * newScale;
//     this.viewportTransform.y = mouseY - worldPoint.y * newScale;
//     this.viewportTransform.scale = newScale;

//     this.render(); 
//   }

//   onResize() {
//     this.canvas.width = window.innerWidth;
//     this.canvas.height = window.innerHeight;
//     this.render();
//   }
//   onKeyPress(e:KeyboardEvent){

//     console.log(e.key)
//    if(this.currentDrawingShape && this.currentDrawingShape.type === "text"){ this.currentDrawingShape.content+=e.key;
//     console.log(this.currentDrawingShape.content)
//    }

//   }

//   initEventHandlers() {
//     this.canvas.addEventListener("mousedown", this.mouseDownHandler);
//     this.canvas.addEventListener("mouseup", this.mouseUpHandler);
//     this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
//     this.canvas.addEventListener("keypress",this.onKeyPress);
//     this.canvas.addEventListener("wheel", this.mouseWheelHandler, {
//       passive: false, 
//     });
//   }
// }

import { Tool } from "@/components/Canvas";
import getExistingShapes from "./Shapes";

type Shape = {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
}
  | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
  }
  | {
    type: "pencil";
    points: {
      x: number;
      y: number;
    }[];
  }
  | {
    type: "rhombus";
    x: number;
    y: number;
    width: number;
    height: number;
  }
  | {
    type: "line",
    x1: number,
    x2: number,
    y1: number,
    y2: number
  }
  | {
    type: "text",
    x: number,
    y: number,
    content: string
  };

export class Game {
  private canvas: HTMLCanvasElement;
  private selectedTool: Tool = "hand";
  private ctx: CanvasRenderingContext2D;
  private shapes: Shape[];
  private roomId: string;
  private clicked: boolean;
  private startX_screen = 0;
  private startY_screen = 0;
  private socket: WebSocket;
  private redoShapes: Shape[];

  private viewportTransform = {
    x: 0,
    y: 0,
    scale: 1,
  };

  private currentDrawingShape: Shape | null = null;

  // MODIFIED: Bound handlers for all events
  private mouseDownHandler = this.onMouseDown.bind(this);
  private mouseUpHandler = this.onMouseUp.bind(this);
  private mouseMoveHandler = this.onMouseMove.bind(this);
  private mouseWheelHandler = this.onMouseWheel.bind(this);
  private keyDownHandler = this.onKeyDown.bind(this); // NEW: Handler for keyboard events

  constructor(canvas: HTMLCanvasElement, roomID: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomID;
    this.socket = socket;
    this.shapes = [];
    this.clicked = false;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.init();
    this.initWebSocket();
    this.initEventHandlers();
    this.redoShapes = [];

    window.addEventListener("resize", this.onResize.bind(this));
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("wheel", this.mouseWheelHandler);
    this.canvas.removeEventListener("keydown", this.keyDownHandler); // MODIFIED: Remove correct listener
    window.removeEventListener("resize", this.onResize.bind(this));
  }

  setTool(tool: Tool) {
    // NEW: Finalize any pending text input before switching tools
    if (this.currentDrawingShape && this.currentDrawingShape.type === 'text') {
      this.finalizeTextShape();
    }
    this.selectedTool = tool;
    if (this.selectedTool === "undo") {
      this.undo();
    } else if (this.selectedTool === "redo") {
      this.redo();
    } else if (this.selectedTool === "clear") {
      this.clear();
    }
  }

  async init() {
    this.shapes = await getExistingShapes(this.roomId);
    this.render();
  }

  initWebSocket() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        this.shapes.push(parsedShape.shape);
        this.redoShapes = [];
        this.render();
      } else if (message.type === "undo") {
        this.performUndoLocally();
      } else if (message.type === "redo") {
        this.performRedoLocally();
      } else if (message.type === "clear") {
        this.clearLocally();
      }
    };
  }

  // ... (undo, redo, clear, drawing functions remain the same)
  private performUndoLocally() {
    if (this.shapes.length > 0) {
      const redo = this.shapes.pop()!;
      this.redoShapes.push(redo);
      this.render();
      return redo;
    }
  }

  private performRedoLocally() {
    if (this.redoShapes.length > 0) {
      const undo = this.redoShapes.pop()!;
      this.shapes.push(undo);
      this.render();
      return undo
    }
  }

  private clearLocally() {
    this.shapes = [];
    this.render();
  }

  undo() {
    const shape = this.performUndoLocally();
    this.socket.send(JSON.stringify({ type: "undo", roomId: this.roomId, message: JSON.stringify({ shape: shape }) }));
  }

  redo() {
    const shape = this.performRedoLocally();
    this.socket.send(JSON.stringify({ type: "redo", roomId: this.roomId, message: JSON.stringify({ shape: shape }) }));
  }

  clear() {
    if (this.selectedTool === "clear") {
      this.clearLocally();
      this.socket.send(JSON.stringify({ type: "clear", roomId: this.roomId }));
    }
  }

  drawRect(shape: Shape) { if (shape.type === "rect") { this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height); } }
  drawCircle(shape: Shape) { if (shape.type === "circle") { this.ctx.beginPath(); this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2); this.ctx.stroke(); this.ctx.closePath(); } }
  drawPencil(shape: Shape) { if (shape.type === "pencil") { const points = shape.points; if (points.length < 1) return; this.ctx.beginPath(); this.ctx.moveTo(points[0].x, points[0].y); points.forEach((point) => this.ctx.lineTo(point.x, point.y)); this.ctx.stroke(); this.ctx.closePath(); } }
  drawRhombus = (shape: Shape) => { if (shape?.type === "rhombus") { this.ctx.beginPath(); const centerX = shape.x + shape.width / 2; const centerY = shape.y + shape.height / 2; this.ctx.moveTo(centerX, shape.y); this.ctx.lineTo(shape.x + shape.width, centerY); this.ctx.lineTo(centerX, shape.y + shape.height); this.ctx.lineTo(shape.x, centerY); this.ctx.closePath(); this.ctx.stroke(); } }
  drawLine = (shape: Shape) => { if (shape?.type === "line") { this.ctx.beginPath(); this.ctx.moveTo(shape.x1, shape.y1); this.ctx.lineTo(shape.x2, shape.y2); this.ctx.stroke(); this.ctx.closePath(); } }
  drawText(shape: Shape) { if (shape?.type === "text") { this.ctx.font = "14px Arial"; this.ctx.fillStyle = "rgb(255,255,255)"; this.ctx.fillText(shape.content, shape.x, shape.y); } }

  // ... (screenToWorld, worldToScreen, clearCanvas remain the same)
  screenToWorld(x: number, y: number) { return { x: (x - this.viewportTransform.x) / this.viewportTransform.scale, y: (y - this.viewportTransform.y) / this.viewportTransform.scale, }; }
  worldToScreen(x: number, y: number) { return { x: x * this.viewportTransform.scale + this.viewportTransform.x, y: y * this.viewportTransform.scale + this.viewportTransform.y, }; }
  clearCanvas() { this.ctx.setTransform(1, 0, 0, 1, 0, 0); this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); this.ctx.save(); this.ctx.setTransform(this.viewportTransform.scale, 0, 0, this.viewportTransform.scale, this.viewportTransform.x, this.viewportTransform.y); this.ctx.fillStyle = "rgba(0,0,0,0)"; this.ctx.fillRect(0, 0, this.canvas.width / this.viewportTransform.scale, this.canvas.height / this.viewportTransform.scale); this.ctx.strokeStyle = "rgb(255,255,255)"; }

  render() {
    this.clearCanvas();
    this.shapes?.forEach((shape) => {
      if (!shape) { }
      else {
        if (shape.type === "rect") this.drawRect(shape);
        else if (shape.type === "circle") this.drawCircle(shape);
        else if (shape.type === "pencil") this.drawPencil(shape);
        else if (shape.type === "rhombus") this.drawRhombus(shape);
        else if (shape.type === "line") this.drawLine(shape);
        else if (shape.type === "text") this.drawText(shape);
      }
    });

    if (this.currentDrawingShape) {
      this.ctx.strokeStyle = "rgba(255,255,255,0.7)";
      if (this.currentDrawingShape.type === "rect") this.drawRect(this.currentDrawingShape);
      else if (this.currentDrawingShape.type === "rhombus") this.drawRhombus(this.currentDrawingShape);
      else if (this.currentDrawingShape.type === "circle") this.drawCircle(this.currentDrawingShape);
      else if (this.currentDrawingShape.type === "line") this.drawLine(this.currentDrawingShape);
      else if (this.currentDrawingShape.type === "pencil") this.drawPencil(this.currentDrawingShape);
      else if (this.currentDrawingShape.type === "text") this.drawText(this.currentDrawingShape);
      this.ctx.strokeStyle = "rgb(255,255,255)";
    }
  }

  // MODIFIED onMouseDown
  onMouseDown(e: MouseEvent) {
    if (this.currentDrawingShape && this.currentDrawingShape.type === 'text') {
      this.finalizeTextShape();
    }
    this.clicked = true;
    this.startX_screen = e.clientX;
    this.startY_screen = e.clientY;
    const worldStart = this.screenToWorld(e.clientX, e.clientY);

    if (this.selectedTool === "pencil") {
      this.currentDrawingShape = { type: "pencil", points: [{ x: worldStart.x, y: worldStart.y }], };
    } else if (this.selectedTool === "rect") {
      this.currentDrawingShape = { type: "rect", x: worldStart.x, y: worldStart.y, width: 0, height: 0, };
    } else if (this.selectedTool === "circle") {
      this.currentDrawingShape = { type: "circle", centerX: worldStart.x, centerY: worldStart.y, radius: 0, };
    } else if (this.selectedTool === "rhombus") {
      this.currentDrawingShape = { type: "rhombus", x: worldStart.x, y: worldStart.y, width: 0, height: 0 };
    } else if (this.selectedTool === "line") {
      this.currentDrawingShape = { type: "line", x1: worldStart.x, y1: worldStart.y, x2: worldStart.x, y2: worldStart.y };
    } else if (this.selectedTool === "text") {
      this.currentDrawingShape = { type: "text", x: worldStart.x, y: worldStart.y, content: "" };
      this.canvas.focus(); // Give canvas focus to receive key events
    }
  }

  // MODIFIED onMouseUp
  onMouseUp(e: MouseEvent) {
    this.clicked = false;

    // Do not finalize text here, it's handled by onKeyDown or the next click
    if (this.selectedTool === "text") {
      this.render();
      return;
    }

    if (this.currentDrawingShape) {
      this.finalizeCurrentShape();
    }
  }

  // ... (onMouseMove and onMouseWheel remain the same)
  onMouseMove(e: MouseEvent) {
    if (!this.clicked || !this.currentDrawingShape) return;
    const worldCurrent = this.screenToWorld(e.clientX, e.clientY);
    const worldStart = this.screenToWorld(this.startX_screen, this.startY_screen);
    if (this.selectedTool === "hand") { const dx = e.clientX - this.startX_screen; const dy = e.clientY - this.startY_screen; this.viewportTransform.x += dx; this.viewportTransform.y += dy; this.startX_screen = e.clientX; this.startY_screen = e.clientY; }
    else if (this.currentDrawingShape.type === "rect") { this.currentDrawingShape.x = worldStart.x; this.currentDrawingShape.y = worldStart.y; this.currentDrawingShape.width = worldCurrent.x - worldStart.x; this.currentDrawingShape.height = worldCurrent.y - worldStart.y; }
    else if (this.currentDrawingShape.type === "rhombus") { this.currentDrawingShape.x = Math.min(worldStart.x, worldCurrent.x); this.currentDrawingShape.y = Math.min(worldStart.y, worldCurrent.y); this.currentDrawingShape.width = Math.abs(worldCurrent.x - worldStart.x); this.currentDrawingShape.height = Math.abs(worldCurrent.y - worldStart.y); }
    else if (this.currentDrawingShape.type === "line") { this.currentDrawingShape.x1 = worldStart.x; this.currentDrawingShape.y1 = worldStart.y; this.currentDrawingShape.x2 = worldCurrent.x; this.currentDrawingShape.y2 = worldCurrent.y; }
    else if (this.currentDrawingShape.type === "circle") { const minX = Math.min(worldStart.x, worldCurrent.x); const maxX = Math.max(worldStart.x, worldCurrent.x); const minY = Math.min(worldStart.y, worldCurrent.y); const maxY = Math.max(worldStart.y, worldCurrent.y); const boundingBoxWidth = maxX - minX; const boundingBoxHeight = maxY - minY; const radius = Math.max(boundingBoxWidth, boundingBoxHeight) / 2; this.currentDrawingShape.centerX = minX + boundingBoxWidth / 2; this.currentDrawingShape.centerY = minY + boundingBoxHeight / 2; this.currentDrawingShape.radius = radius; }
    else if (this.currentDrawingShape.type === "pencil") { const last = this.currentDrawingShape.points.at(-1); if (last && Math.hypot(worldCurrent.x - last.x, worldCurrent.y - last.y) > 2 / this.viewportTransform.scale) { this.currentDrawingShape.points.push({ x: worldCurrent.x, y: worldCurrent.y, }); } }
    this.render();
  }
  onMouseWheel(e: WheelEvent) { e.preventDefault(); const zoomAmount = 1.1; const mouseX = e.clientX; const mouseY = e.clientY; const worldPoint = this.screenToWorld(mouseX, mouseY); let newScale = this.viewportTransform.scale; if (e.deltaY < 0) newScale *= zoomAmount; else newScale /= zoomAmount; newScale = Math.max(0.01, Math.min(newScale, 10)); this.viewportTransform.x = mouseX - worldPoint.x * newScale; this.viewportTransform.y = mouseY - worldPoint.y * newScale; this.viewportTransform.scale = newScale; this.render(); }
  onResize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; this.render(); }

  // NEW: onKeyDown handler
  private onKeyDown(e: KeyboardEvent) {
    if (!this.currentDrawingShape || this.currentDrawingShape.type !== "text") return;

    e.preventDefault();

    if (e.key === 'Enter') {
      this.finalizeTextShape();
    } else if (e.key === 'Backspace') {
      this.currentDrawingShape.content = this.currentDrawingShape.content.slice(0, -1);
    } else if (e.key.length === 1) { // Catches all printable characters
      this.currentDrawingShape.content += e.key;
    }

    this.render(); // Re-render to show live typing
  }

  // NEW: Helper method to finalize any shape
  private finalizeCurrentShape() {
    if (!this.currentDrawingShape) return;

    const finalizedShape = this.currentDrawingShape;
    this.shapes.push(finalizedShape);
    this.redoShapes = [];
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape: finalizedShape }),
        roomId: this.roomId,
      })
    );
    this.currentDrawingShape = null;
    this.render();
  }

  // NEW: Specific helper for text to handle empty strings
  private finalizeTextShape() {
    if (this.currentDrawingShape && this.currentDrawingShape.type === 'text' && this.currentDrawingShape.content.trim() === '') {
      this.currentDrawingShape = null; // Discard empty text
      this.render();
      return;
    }
    this.finalizeCurrentShape();
  }

  initEventHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener("keydown", this.keyDownHandler); // MODIFIED
    this.canvas.addEventListener("wheel", this.mouseWheelHandler, {
      passive: false,
    });
  }
}