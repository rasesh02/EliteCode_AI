import connectDB from "./db/index.js";
import {app} from "./app.js"
import { main as startWebSocketServer} from "./ws.js";
import dotenv from "dotenv"

dotenv.config({path:'./.env'})
startWebSocketServer();

connectDB().then(()=>{
    app.listen(process.env.PORT || 5000,()=>{
       console.log(`server running at port ${process.env.PORT}`)
    })
    
}).catch(err=>{console.log(`error while listening : ${err}`)})

