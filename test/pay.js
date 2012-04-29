var Paypal = require('../lib/paypal'),
    conf = require('./conf'),
    url = require('url'),
    http = require('http');

var paypal = new Paypal({
  username  : conf.username,
  password  : conf.password,
  signature : conf.signature
});

paypal.pay({
  actionType : 'PAY',
  currencyCode : 'EUR',
  receiverList : [{ email : 'selle._1329065615_per@gmail.com', amount : '10.0' }],
  senderEmail : 'buyer._1329065513_per@gmail.com',
  trackingId : 'burder-fun',
  cancelUrl : 'http://foo.bar/pizza',
  returnUrl : 'http://foo.bar/burger'
}, function(err, result) {
  payKey = result.payKey;
})
