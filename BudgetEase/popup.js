$(function() {

    chrome.storage.sync.get(['total', 'limit'], function(budget){
        $('#total').text(budget.total || 0);
        $('#limit').text(budget.limit || 0);
    })

    $('#spendAmount').click(function(){
        chrome.storage.sync.get(['total', 'limit'], function(budget){
            let newTotal = 0;
            if (budget.total) {
                newTotal += parseInt(budget.total) || 0;
            }

            let amount = $('#amount').val().trim();
            if(!isNaN(amount) && amount >= 0 && amount !== ''){
                newTotal += parseInt(amount);
            } else {
                $('#amountErrorMsg').text('Please enter a valid positive number for the spent amount.').addClass('errorMssg').fadeIn().delay(2000).fadeOut();
            }

            chrome.storage.sync.set({'total': newTotal}, function(){
                if (amount && budget.limit && newTotal >= budget.limit) {
                    chrome.runtime.sendMessage({ type: 'limitReached' });
                }
            });

            $('#total').text(newTotal);
            $('#amount').val('');
            
        });
    });
});