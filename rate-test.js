const axios = require("axios");

// CONFIG
const API_URL = "http://localhost:3000/api/data";
const API_KEY = "HkVKAYv06UWONP8mIREb";
const TOTAL_REQUESTS = 2000;   // number of requests to send
const CONCURRENCY = 50;        // how many to send at a time

let success = 0;
let failed = 0;
let rateLimited = 0;

// Worker function
async function sendRequest() {
    try {
        const res = await axios.get(API_URL, {
            headers: { "x-api-key": API_KEY }
        });

        if (res.status === 200) {
            success++;
        }

    } catch (err) {

        if (err.response && err.response.status === 429) {
            rateLimited++;
        } else {
            failed++;
        }
    }
}

// Run in batches
async function runTest() {
    console.log("Starting load test...\n");

    let running = 0;
    let sent = 0;

    return new Promise((resolve) => {
        const interval = setInterval(async () => {
            if (sent >= TOTAL_REQUESTS && running === 0) {
                clearInterval(interval);
                resolve();
                return;
            }

            while (running < CONCURRENCY && sent < TOTAL_REQUESTS) {
                running++;
                sent++;

                sendRequest().finally(() => {
                    running--;
                });
            }
        }, 1);
    });
}

(async () => {
    const start = Date.now();
    await runTest();
    const end = Date.now();

    console.log("\n=== TEST COMPLETE ===");
    console.log("Total Requests:", TOTAL_REQUESTS);
    console.log("Successful:", success);
    console.log("Failed:", failed);
    console.log("Rate Limited (429):", rateLimited);
    console.log("Time Taken:", (end - start) / 1000, "seconds\n");
})();
