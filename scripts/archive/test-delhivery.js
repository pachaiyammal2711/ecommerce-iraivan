require("dotenv").config();
const axios = require("axios");

async function testDelhivery() {
    try {
        const response = await axios.get(
            "https://track.delhivery.com/c/api/pin-codes/json/",
            {
                params: {
                    filter_codes: "632001",
                },
                headers: {
                    Authorization: `Token ${process.env.DELHIVERY_API_TOKEN}`,
                },
            }
        );

        console.log("Delhivery API connected successfully!");
        console.log(response.data);
    } catch (error) {
        console.error("Delhivery API connection failed.");

        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Response:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

testDelhivery();



