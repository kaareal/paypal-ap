
var	VERSION = '0.1.4';

var	request = require('request'),
    querystring = require('querystring'),
    utils = require('./utils');

module.exports = PayPal;

function PayPal(options) {
  var defaults = {
    errorLanguage : 'en_US',
    applicationId : options.applicationId || 'APP-80W284485P519543T',
    deviceId : options.deviceId,
    ipAddress :  '127.0.0.1',
    productionUrl : 'https://svcs.sandbox.paypal.com/AdaptivePayments/',
    sandboxUrl : 'https://svcs.sandbox.paypal.com/AdaptivePayments/',
  };

  this.options = utils.merge(defaults, options);
  this.baseUrl = options.isProduction ? defaults.productionUrl
                                      : defaults.sandboxUrl;
}


/**
 * see docs https://www.x.com/developers/paypal/documentation-tools/api/pay-api-operation
 * @actionType PAY, CREATE, PAY_PRIMARY
 * @currencyCode
 * @errorLanguage OPTIONAL
 * @receiverList Array[{ email : String, amount : String, [primary : boolean] }]
 * @cancelUrl
 * @returnUrl
 * @clientDetails OPTIONAL
 * @feesPayer OPTIONAL SENDER, PRIMARYRECEIVER, EACHRECEIVER, SECONDARYONLY
 * @memo OPTIONAL text 1000 char
 * @reverseAllParallelPaymentsOnError OPTIONAL boolean
 * @senderEmail OPTIONAL 127 char
 * @sender OPTIONAL Sender�s identifying information
 * @trackingId OPTIONAL 127 characters
 */

PayPal.prototype.pay = function(options, callback) {
  var currencyCode =  options.currencyCode || this.options.currencyCode,
      cancelUrl = options.cancelUrl || this.options.cancelUrl,
      returnUrl = options.returnUrl || this.options.returnUrl,
      errorLanguage = options.errorLanguage || this.options.errorLanguage;

  this._request(this.options.sandboxUrl + 'Pay',
                { actionType      : options.actionType,
                  currencyCode    : currencyCode,
                  errorLanguage   : errorLanguage,
                  receiverList    : { receiver : options.receiverList },
                  requestEnvelope : {
                    errorLanguage : errorLanguage, // Language used to display errors
                    detailLevel   : "ReturnAll" // Error detail level
                  },
                  cancelUrl       : cancelUrl,
                  returnUrl       : returnUrl }, callback);
}

PayPal.prototype.getDetails = function(id) {

}

PayPal.prototype.refund = function(id){

}

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
}
