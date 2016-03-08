// Load Environment variables
require('dotenv').load();

// paystack module is required to make charge token call
var paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);

// uuid module is required to create a random reference number
var uuid     = require('node-uuid');

var express =  require('express');
var app = require('express')();
var bodyParser = require('body-parser');

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({   // to support URL-encoded bodies
  extended: true
}));

app.post('/create-customer-then-plan', function(req, res) {
    var amount          = req.body.amount,
        firstname       = req.body.firstname,
        lastname        = req.body.lastname,
        email           = req.body.email,
        phone           = req.body.phone,
        interval        = req.body.interval;
        
    paystack.customer.create({
          first_name:   firstname,      
          last_name:    lastname,      
          email:        email,      
          phone:        phone       
    }, function(error, body) {
        if(error){
          return res.send({error:error});
        }
        paystack.plan.create({
          amount:       amount,      
          interval:     interval,        
          name:         '' + (amount/100) + 'naira-' + interval, 
          description:  '' + (amount/100) + 'NGN ' + interval, 
          currency:     'NGN'    
        },function(error, body) {
            res.send({error:error, body:body});
        });
    });
    
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('/*', function(req, res){
  res.status(404).send('Only a post to /charge is allowed');
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
