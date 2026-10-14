require("dotenv").config();

const {
    checkPincodeServiceability,
} = require("./services/delhiveryService");

async function test() {
    try {
        const result = await checkPincodeServiceability("632001");

        console.log("=================================");
        console.log("Delhivery Service Working!");
        console.log("=================================");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("=================================");
        console.error("Delhivery Service Test Failed");
        console.error("=================================");
        console.error(error.message);
    }
}

test();