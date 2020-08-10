function getTextfromTextArea() {
    var input = $('.addArea').val();
    if (input.startsWith("http")) {
        addUrl(input);
    } else {
        addText(input)
    }
}

function init() {

    var input = $('#completeInput'),
        list = $('.list');

    input.on('input', function () {

        list.empty();

        var inputText = input.val();
        
        var pos = input.position();
        var height = input.height();

        if (input.val()) {
            var predictions = predict(inputText);

            for (var i = 0; i < predictions.length; i++) {
                if (predictions[i]) {
                    var text = predictions[i].toLocaleLowerCase("tr-TR");
                    $('<li id="les" class ="type1"/>').text(text).appendTo(list);
                }
            }

            list.css({
                position:'absolute',
                top: pos.top - height + 185,
                left: 705,
                text
            })
        }

    });

}

function Clear(id){
    
    var textArea = $(id);
    textArea.val("");
    
}