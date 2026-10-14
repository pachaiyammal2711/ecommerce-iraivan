const axios = require('axios');
require('dotenv').config();

const testShipment = async () => {
  const payload = {
    shipments: [
      {
        name: 'Arun Kumar',
        add: '123, jh',
        pin: '632001',
        city: 'Vellore',
        state: 'Tamil Nadu',
        country: 'India',
        phone: '9876543210',
        order: 'IRA-20260916-0005',
        payment_mode: 'COD',
        products_desc: 'Delhivery Test Product',
        cod_amount: 310,
        order_date: new Date().toISOString(),
        total_amount: 310,
        quantity: '1',
        waybill: '',
        shipment_width: '10',
        shipment_length: '15',
        shipment_height: '4',
        weight: '50'
      }
    ],
    pickup_location: {
      name: 'Iraivan Angadi'
    }
  };

  try {
    const dataString = `format=json&data=${encodeURIComponent(JSON.stringify(payload))}`;
    const response = await axios.post('https://track.delhivery.com/api/cmu/create.json', dataString, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Token ${process.env.DELHIVERY_API_TOKEN}`
      }
    });
    console.log('Success:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
};
testShipment();
