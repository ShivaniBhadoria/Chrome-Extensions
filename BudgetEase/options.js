$(function(){

    chrome.storage.sync.get('limit', function(budget){
        $('#limit').val(budget.limit || 0);
    })

    $('#saveLimit').click(function() {
        let limit  = $('#limit').val().trim();
        if(!isNaN(limit) && limit >= 0 && limit !== '') {
            chrome.storage.sync.set({'limit': limit}, function(){
                close();
            });
        } else {
            $('#limitErrorMsg').text('Please enter a valid positive number for the limit.').addClass('errorMssg').fadeIn().delay(2000).fadeOut();
        }
    });

    $('#resetTotal').click(function(){
        chrome.storage.sync.set({'total': 0}, function(){
            chrome.runtime.sendMessage({ type: 'spendReset' });
        });
    });
})