const router = require("express").Router();
const GSTInfoController = require('../controller/getGSTInfo');

router.get('/gst_info/captcha', GSTInfoController.getCaptchaHandler);
router.post('/gst_info/info', GSTInfoController.getGSTInfoHandler);

module.exports = router;