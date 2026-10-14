require("dotenv").config();

const { createDelhiveryShipment } = require("./services/delhiveryService");

async function testShipmentCreation() {
    console.log("\n=================================");
    console.log("SENDING STAGING SHIPMENT REQUEST");
    console.log("=================================\n");

    const testShipmentData = {
        shipments: [
            {
                name: "Delhivery Test Customer",
                add: "123 Test Street",
                pin: "632001",
                city: "Vellore",
                state: "Tamil Nadu",
                country: "India",
                phone: "9000000000",
                order: "TEST-DELHIVERY-001",
                payment_mode: "Prepaid",
                products_desc: "Test Spiritual Product",
                cod_amount: 0,
                order_date: "2026-09-15T12:00:00.000Z",
                total_amount: 100,
                quantity: "1",
                waybill: "",
                shipment_width: "10",
                shipment_length: "10",
                shipment_height: "10",
                weight: "500"
            }
        ],
        pickup_location: {
            name: "Iraivan Angadi"
        }
    };

    try {
        const result = await createDelhiveryShipment(testShipmentData);
        console.log("API Success Response:");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("API Failed:");
        console.error(error.message);
    }
}

testShipmentCreation();
