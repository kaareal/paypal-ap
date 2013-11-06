paypal-ap
=========

Paypal Adaptive Payments

```javascript
var Paypal = require('paypal-ap');
var paypal = new Paypal({
  currencyCode : 'EUR',
  applicationId : 'APP-80W284485P519543T',
  cancelUrl : 'http://<yourdomain>/cancel',
  returnUrl : 'http://<yourdomain>/complete',
  ipnUrl : 'http://<yourdomain>/ipn',
  reverseAllParallelPaymentsOnError : true,
  signature:  'AbtI7HV1xB428VygBUcIhARzxch4AL65.T18CTeylixNNxDZUu0iO87e'
});

app.get('/pay', function(req, res, next){
  var paymentOptions = {
    receiverList: {
      receiver: [{
        email: 'me@email.com',
        amount: 5
      },{
        email: req.param('otherEmail'),
        amount: 10
      }]
    },
    actionType: 'PAY',
    trackingId: req.param('trackingId')
  };
  paypal.pay(paymentOptions, function(err, result) {
    if (err) return next(errr);
    //payKey is used to trigger a paypal dialog on the clientside, see 
    //https://cms.paypal.com/us/cgi-bin/?cmd=_render-content&content_ID=developer/library_overview_land
    res.json({ payKey: result.payKey });
  });
});

app.get('/ipn', function(req, res, next) {
  var params = req.body;
  var trackingId = params.trackingId;
  var status = params.status;
  if (status == 'COMPLETED') {
    paypal.verify(req.body, function(err, verified) {
      if (err) return next(err);
      if (!verified) return next(new Error('Paypal failed to verify trackingId: ' + trackingId));
    });
  }
});

app.get('/cancel', function(req, res, next){
   //triggers when the user cancel the payflow
});

app.get('/complete', function(req, res, next){
  //triggers when the user completes the payflow successfull
});
```
