// change this to your public key so you 
// will no more be prompted
var public_key = '<YOUR PUBLIC KEY HERE>';

/*
 * Check phone number
 */
function checkPhoneNumber(){
    // this call populates textarea "output" with a detailed 
    // description of the analysis of the phone number supplied
    phoneNumberParser();
    // check if the text in "output" includes: 
    // Result from isValidNumberForRegion(): true
    return $("#output").val().search("Result from isValidNumberForRegion\\(\\): true") > 0;
}

function extractE164FormatNumber() {
    var rx = /\nE164 format: (.*)\n/g;
    var arr = rx.exec($("#output").val());
    return arr[1]; 
}

/*
 * Start up
 */
function startUp(){
    promptForPublicKey();
}

/*
 * check if the public key set is valid
 * 
 * @return bool
 */
function isValidPublicKey(){
    var publicKeyPattern = new RegExp('^pk_(?:test|live)_','i');
    return publicKeyPattern.test(public_key);
}

/*
 * Prompt for and set public key to use
 * If public key set is not valid
 */
function promptForPublicKey(){
    if(!isValidPublicKey()){
        // get a public key to use
        public_key = prompt("To run this sample, you need to provide a public key.\n"+
                                                "Please visit https://dashboard.paystack.co/#/settings/developer to get your "+
                                                "public key and enter in the box below:", "pk_xxxx_");
        // check that we got a valid public key 
        // (starts with pk_live_ or pk_test_)
        if (!isValidPublicKey()) {
            var error_msg = "You didn't provide a public key. This page will not load.";
            alert(error_msg);
            document.getElementById('subscribe-form').innerHTML = error_msg;
        }
    }
}

var processing = false;
/* 
 * Validate before opening Paystack popup
 */
function validateAndSubscribe(){
    var email = document.getElementById('email').value;
    if(!simpleValidEmail(email)){
        alert("Please provide a valid email");
        return;
    }
    
    if(!checkPhoneNumber()){
        alert("Please provide a valid phone number. And be sure to specify the country code.");
        return;
    }
    var phone = extractE164FormatNumber();
    if(!phone){
        alert("Please provide a valid phone number. And be sure to specify the country code.");
        return;
    }
    
    var validIntervals = ['hourly', 'daily', 'weekly', 'monthly', 'annually'];
    var interval = document.getElementById('interval').value;
    if(-1 === $.inArray(interval, validIntervals)){
        alert("Please select a valid interval");
        return;
    }
    
    var amountinkobo = getAmountInKobo();
    if(!amountinkobo){
        alert("Please provide a valid amount");
        return;
    }
    
    // We are not validating firstname and lastname
    var firstname = document.getElementById('firstname').value;
    var lastname    = document.getElementById('lastname').value;
    
    if(processing){
        // don't process more than once
        return;
    }
    processing = true;
    
    // Send the data using post
    var posting = $.post( "/create-plan", { 
                                                            amount: amountinkobo, 
                                                            interval: interval } );

    // Show inline popup so customer may provide 
    // card details and subscribe
    posting.done(function( data ) {
        if (data.error){
            alert(data.error.message);
            processing = false;
            return;
        }
        subscribeWithPaystack(email, amountinkobo, firstname, lastname, phone, data.body.data.plan_code);
    });
    
    posting.fail(function() {
        alert( "error" );
        processing = false;
    });
}

/* Get amount sent by get if it's a valid integer
 * Get the amount entered in input box    multiplied
 * by 100. Show alert if no valid amountinkobo can be found
 */
function getAmountInKobo(){
    amountinkobo = 100 * +document.getElementById('amount-in-naira').value;
    
    if( !simpleValidInt(amountinkobo) ){
        alert("Please provide an amount to pay");
    }
    
    return amountinkobo;
}

/* Get a random reference number based on the current time
 * 
 * gotten from http://stackoverflow.com/a/2117523/671568
 * replaced UUID with REF
 */
function generateREF(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var ref = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return ref;
}

/* Validate integer
 *
 * gotten from http://stackoverflow.com/a/25016143/671568
 */
function simpleValidInt( data ) {
    if (+data===parseInt(data)) {
        return true
    } else {
        return false
    }
};


/* Validate email address 
 * not meant for really secure email validation
 *
 * gotten from http://stackoverflow.com/a/28633540/671568
 * Had to correct Regex, allowing A-Za-z0-9 to repeat
 */
function simpleValidEmail( email ) {
    return email.length < 256 && /^[^@]+@[^@]+[A-Za-z0-9]{2,}\.[^@]+[A-Za-z0-9]{2,}$/.test(email);
};

/* Show the paystack payment popup
 * 
 * source: https://developers.paystack.co/docs/paystack-inline
 */
function subscribeWithPaystack(validatedemail, amountinkobo, firstname, lastname, phone, plan_code){
    var handler = PaystackPop.setup({
        key:         public_key,
        email:       validatedemail,
        firstname:   firstname,
        lastname:    lastname,
        phone:       phone,
        amount:      amountinkobo,
        plan:        plan_code,
        ref:         generateREF(), // This uses a random transaction reference based on the time the "Subscribe" button was clicked.
        callback:    function(response){
            // subscription was created
            window.location.href = '/success.html';
            processing = false;
        },
        onClose:    function(){
            // Visitor cancelled payment
            window.location.href = '/error.html';
            processing = false;
        }
    });
    handler.openIframe();
}
