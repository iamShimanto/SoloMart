import express from "express";
const app = express();
import routes from "./routes";
import cookieParser from "cookie-parser";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==== route
app.use(routes);

export default app;
