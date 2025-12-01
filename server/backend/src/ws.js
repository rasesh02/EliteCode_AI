import { WebSocketServer } from "ws";
import RedisManager from "./redisManager.js";

const main=async function(){
    try {
        const wss=new WebSocketServer({port: 8000});
        console.log("Websocket server running on port 8000");
        wss.on("connection",(ws)=>{
             console.log("Client connected");
            ws.on("message",async(msg)=>{
                const data=JSON.parse(msg);
                 console.log("Websocket received:", data);
          const job = {
          code: data.editorCode,
          language: data.selectedLanguage,
          testCase: data.testCase,
          timeout: 2000,
        };
        //
        const rm=await RedisManager.getInstance();
        const res=await rm.pushToQueue(job); 
        console.log(res);
        ws.send(JSON.stringify(res));
            })
        })
    } catch (error) {
        console.log("Error in ws file : ",error);
    }
}

export {main};