export async function load({ fetch }) {
    return await fetch("http://localhost:8081").then(r => r.json());
}
