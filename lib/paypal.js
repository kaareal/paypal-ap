var request = require('request');
var querystring = require('querystring');
var utils = require('./utils');
var https = require('https');

function PayPal(options) {
  var defaults = {
    errorLanguage : 'en_US',
    applicationId : options.applicationId || 'APP-80W284485P519543T',
    deviceId : options.deviceId,
    ipAddress :  '127.0.0.1',
    apUrl : 'https://svcs.paypal.com/AdaptivePayments/',
    testApUrl : 'https://svcs.sandbox.paypal.com/AdaptivePayments/',
    ipnUrl: 'www.sandbox.paypal.com',
    testIpnUrl: 'www.paypal.com'
  };

  this.options = utils.merge(defaults, options);
  if (options.isProduction) {
    this.apUrl =  defaults.apUrl;
    this.ipnUrl = defaults.ipnUrl;
  } else {
    this.apUrl = defaults.testApUrl;
    this.ipnUrl = defaults.testIpnUrl;
  }
}
module.exports = PayPal;

PayPal.prototype.verify = function(params, callback) {
  if (!params) {
    return callback(new Error('No params were passed to ipn.verify'));
  }

  params.cmd = '_notify-validate';
  console.log(params);
  var body = querystring.stringify(params);

   //Set up the request to paypal
  var reqOptions = {
    host: this.ipnUrl,
    method: 'POST',
    path: '/cgi-bin/webscr',
    headers: {'Content-Length': body.length}
  };


  var req = https.request(reqOptions, function(res) {
    var data = [];

    res.on('data', function(d) {
      data.push(d);
    });

    res.on('end', function() {
      var response = data.join('');
      //Check if IPN is valid
      callback(null,response != 'VERIFIED');
    });
  });

  //Add the post parameters to the request body
  req.write(body);

  req.end();

  //Request error
  req.on('error', function(e) {
    callback(e);
  });

};


/**
 * see docs https://www.x.com/developers/paypal/documentation-tools/api/pay-api-operation
 * @actionType PAY, CREATE, PAY_PRIMARY
 * @currencyCode
 * @errorLanguage OPTIONAL
 * @receiverList Array[{ email : String, amount : String, [primary : boolean] }]
 * @cancelUrl
 * @returnUrl
 * @ipnNotificationUrl
 * @clientDetails OPTIONAL
 * @feesPayer OPTIONAL SENDER, PRIMARYRECEIVER, EACHRECEIVER, SECONDARYONLY
 * @memo OPTIONAL text 1000 char
 * @reverseAllParallelPaymentsOnError OPTIONAL boolean
 * @senderEmail OPTIONAL 127 char
 * @sender OPTIONAL Sender’s identifying information
 * @trackingId OPTIONAL 127 characters
 */

PayPal.prototype.pay = function(options, callback) {
  var defaults = this.options;

  this._request(this.apUrl + 'Pay',
                utils.merge({ actionType      : options.actionType,
                  currencyCode    : defaults.currencyCode,
                  errorLanguage   : defaults.errorLanguage,
                  receiverList    : options.receiverList,
                  requestEnvelope : {
                    errorLanguage : defaults.errorLanguage, // Language used to display errors
                    detailLevel   : "ReturnAll" // Error detail level
                  },
                  cancelUrl       : defaults.cancelUrl,
                  returnUrl       : defaults.returnUrl }, options), callback);
};

PayPal.prototype.getPaymentDetails = function(payKey, callback) {
  var options = {
    requestEnvelope: {
      errorLanguage: this.options.errorLanguage, // Language used to display errors
      detailLevel: "ReturnAll" // Error detail level
    }
  };

  if (typeof(payKey) == 'string') {
    options.payKey = payKey;
  } else {
    options = utils.merge(options, payKey);
  }

  this._request(this.apUrl + 'PaymentDetails', options, callback);
};


PayPal.prototype._request = function(url, content, callback){
  request({
    method: 'POST',
    headers : {
      'X-PAYPAL-SECURITY-USERID' : this.options.username,
      'X-PAYPAL-SECURITY-PASSWORD' : this.options.password,
      'X-PAYPAL-SECURITY-SIGNATURE' : this.options.signature,
      "X-PAYPAL-DEVICE-IPADDRESS" : this.options.ipAddress,
      "X-PAYPAL-REQUEST-DATA-FORMAT" : "JSON",
      "X-PAYPAL-RESPONSE-DATA-FORMAT" : "JSON",
      "X-PAYPAL-APPLICATION-ID" : this.options.applicationId
    },
    json : content,
    url : url
  }, function (error, response, body) {
    if(error) return callback(error);
    callback(null, body);
  });
};
