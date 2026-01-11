import mongoose from "mongoose"
import { env } from "./env"


export const dbConfig = async ()=>{
    try {
        await mongoose.connect(env.MONGODB_URL)
        console.log("mongodb connected")
    } catch (error) {
        console.log("database connection error", error)
    }
}