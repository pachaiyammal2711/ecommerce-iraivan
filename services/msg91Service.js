const axios = require("axios");

const sendWhatsApp = async ({ mobile, templateName = "order_placed", variables = {} }) => {
    try {
        const response = await axios.post(
            "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/",
            {
                "integrated_number": "919092123142",
                "content_type": "template",
                "payload": {
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": mobile,
                    "type": "template",
                    "template": {
                        "name": templateName,
                        "language": {
                            "code": "en",
                            "policy": "deterministic"
                        },
                        "namespace": "1c6cd232_a114_44d7_afca_6e9f7eac1d4a",
                        "components": [
                            {
                                "type": "body",
                                "parameters": [
                                    {
                                        "type": "text",
                                        "text": variables.customer_name ? String(variables.customer_name) : ""
                                    },
                                    {
                                        "type": "text",
                                        "text": variables.order_id ? String(variables.order_id) : ""
                                    }
                                ]
                            }
                        ]
                    }
                }
            },
            {
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                    authkey: process.env.MSG91_AUTHKEY,
                },
            }
        );

        console.log("MSG91 WhatsApp Response:", response.data);

        return response.data;
    } catch (error) {
        console.error(
            "MSG91 WhatsApp Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};

module.exports = {
    sendWhatsApp,
};