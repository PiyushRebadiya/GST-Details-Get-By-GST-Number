const axios = require('axios');
/**
 * GET /captcha
 * Fetches the CAPTCHA image from the GST service, stores cookies in the session,
 * and sends the CAPTCHA image to the client.
 */

const getCaptchaHandler = async (req, res) => {
    const captchaUrl = `https://services.gst.gov.in/services/captcha?rnd=${Math.random()}`;
    try {
        // Fetch the CAPTCHA image
        const response = await axios.get(captchaUrl, { responseType: 'arraybuffer' });

        // Convert the binary image buffer to a base64 string
        const base64Captcha = Buffer.from(response.data, 'binary').toString('base64');

        // Retrieve cookies from the response headers
        const setCookieHeader = response.headers['set-cookie'];
        let captchaCookie = '';

        if (setCookieHeader) {
            // Extract CaptchaCookie value
            var firstData = setCookieHeader[1].split(" Path=/;")[0];
            var secondData = setCookieHeader[0].split(" Domain")[0];
            // cookie = firstData + " " + secondData; // Store cookies in a string format
            captchaCookie = firstData + " " + secondData;

        }

        // Send the CAPTCHA image as base64 and CaptchaCookie to the frontend
        res.json({ captchaImage: base64Captcha, captchaCookie });
    } catch (error) {
        console.error('Error retrieving CAPTCHA:', error);
        res.status(500).send('Error retrieving CAPTCHA image.');
    }
}

/**
 * POST /get-gst-info
 * Retrieves GST information based on the provided GST number and CAPTCHA.
 */

const getGSTInfoHandler = async (req, res) => {
    const { gstNumber, captcha, cookies } = req.body;
    // const cookies = req.session.gstCookies;
    if (!cookies) {
        return res.status(400).send({ message: 'Session cookies not found. Please request a new CAPTCHA.' });
    }
    try {
        const gstInfo = await getGSTInfo(gstNumber, captcha, cookies);
        res.send({ message: 'Fetched GST info successfully.', data: gstInfo });
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving GST info.', error: error.message });
    }
}

async function getGSTInfo(gstNumber, captcha, cookies) {
    const apiUrl = `https://services.gst.gov.in/services/api/search/taxpayerDetails`;
    try {
        // Prepare the payload
        const payload = {
            gstin: gstNumber,
            captcha: captcha
        };
        // Make a POST request to the taxpayerDetails API with cookies
        const response = await axios.post(apiUrl, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies // Include the stored cookie in the request headers
            }
        });
        if (response.data) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to retrieve GST info.');
        }
    } catch (error) {
        // Log detailed error information
        if (error.response) {
            console.error('Error retrieving GST info:', error.response.data);
            throw new Error(error.response.data.message || 'Error retrieving GST info.');
        } else {
            console.error('Error retrieving GST info:', error.message);
            throw new Error('Error retrieving GST info.');
        }
    }
}

module.exports = {
    getGSTInfoHandler,
    getCaptchaHandler
}