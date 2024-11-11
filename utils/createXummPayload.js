const axios = require('axios');

async function createXummPayload(payloadData) {
    try {
        const response = await axios.post('https://test.xumm.app/api/v1/platform/payload', payloadData, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.XUMM_API_KEY,
                'x-api-secret': process.env.XUMM_API_SECRET
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating XUMM payload:', error);
        throw new Error('Failed to create XUMM payload');
    }
}

module.exports = createXummPayload;
