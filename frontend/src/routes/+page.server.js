import * as dotenv from "dotenv";

// TODO: move this into config file
dotenv.config();
const BACKEND_URL = process.env.BACKEND_URL;

export async function load({ fetch }) {
    return await fetch(BACKEND_URL).then(r => r.json());
}
