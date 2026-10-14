const axios = require("axios");
const DELHIVERY_API_URL = "https://track.delhivery.com";
const delhiveryClient = axios.create({
    baseURL: DELHIVERY_API_URL,
    headers: {
        Authorization: `Token ${process.env.DELHIVERY_API_TOKEN}`,
        "Content-Type": "application/json",
    },
});

/**
 * Check whether a pincode is serviceable by Delhivery
 */
const checkPincodeServiceability = async (pincode) => {
    try {
        const response = await delhiveryClient.get(
            "/c/api/pin-codes/json/",
            {
                params: {
                    filter_codes: pincode,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "Delhivery Pincode API Error:",
            error.response?.data || error.message
        );

        throw new Error("Unable to check Delhivery pincode serviceability");
    }
};

/**
 * Create a Delhivery Package Shipment
 */
const createDelhiveryShipment = async (shipmentData) => {
    try {
        // The API expects 'format=json' and 'data' containing the stringified JSON payload
        const payload = `format=json&data=${encodeURIComponent(JSON.stringify(shipmentData))}`;
        
        const response = await delhiveryClient.post("/api/cmu/create.json", payload, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        return response.data;
    } catch (error) {
        const errorMsg = error.response?.data?.error || error.response?.data?.rmk || error.message;
        console.error(
            "Delhivery Shipment Creation Error:",
            error.response?.data || error.message
        );

        throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }
};

/**
 * Get Delhivery Shipment Tracking
 */
const getShipmentTracking = async (awb) => {
    try {
        const response = await delhiveryClient.get("/api/v1/packages/json/", {
            params: {
                waybill: awb,
            },
        });

        return response.data;
    } catch (error) {
        console.error(
            "Delhivery Tracking API Error:",
            error.response?.data || error.message
        );

        throw new Error("Unable to fetch Delhivery tracking information");
    }
};

module.exports = {
    checkPincodeServiceability,
    createDelhiveryShipment,
    getShipmentTracking,
};