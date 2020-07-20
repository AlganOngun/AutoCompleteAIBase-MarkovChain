var model = JSON.parse(localStorage.getItem("model")) || {
    nodes: [],
    edges: [],
}

var sites = JSON.parse(localStorage.getItem("sites")) || [
    {
        site: "hurriyet.com.tr",
        find: ".text-container p"
    },
    {
        site: "eksisozluk.com",
        find: ".content p"
    }
]

function dump() {
    console.log(JSON.stringify(model));
    console.log(JSON.stringify(sites))
}

function addEdge(from, to) {
    var foundedEdge = null;
    for (var j = 0; j < model.edges.length; j++) {
        var edge = model.edges[j];
        if (edge.from === from && edge.to === to) {
            foundedEdge = edge;
            break;
        }
    }

    if (foundedEdge) {
        foundedEdge.score++;
    } else {
        model.edges.push({
            from: from,
            to: to,
            score: 1
        });
    }
}

function addSentence(sentence) {
    var words = sentence.toUpperCase().split(' ');
    var prevWordIndex = -1;

    for (var i = 0; i < words.length; i++) {

        var word = words[i];
        var indexOfWord = model.nodes.indexOf(word);

        var nextWord = words[i + 1];
        var indexOfNextWord = model.nodes.indexOf(nextWord);

        if (indexOfWord < 0) {
            model.nodes.push(word);
            indexOfWord = model.nodes.length - 1;
        }

        addEdge(prevWordIndex, indexOfWord);

        if (nextWord) {
            if (indexOfNextWord < 0) {
                model.nodes.push(nextWord);
                indexOfNextWord = model.nodes.length - 1;
            }
        }

        prevWordIndex = indexOfWord;
    }

    localStorage.setItem("model", JSON.stringify(model));
}

function filterEdges(from, to, edges) {
    var foundedEdges = [],
        edges = edges || model.edges;

    for (var j = 0; j < edges.length; j++) {
        var edge = edges[j];

        if ((!from || edge.from === from) &&
            (!to || edge.to === to)) {
            foundedEdges.push(edge);
        }
    }

    return foundedEdges;
}

function filterNextEdges(edges) {
    var foundedEdges = [];
    for (var i = 0; i < edges.length; i++) {
        for (var j = 0; j < model.edges.length; j++) {
            if (edges[i].to === model.edges[j].from) {
                foundedEdges.push(model.edges[j]);
            }
        }
    }
    return foundedEdges;
}

function predict(input) {

    var words = input.toUpperCase().split(" ").filter(function (arrayItem) {
        return arrayItem;
    });

    var matchingWordIndex;
    var prevWordIndex = null;
    var predictions = [];
    var wordIndex;
    var path = [];

    var edges = filterEdges(-1, null);

    // build edge chain
    for (wordIndex = 0; wordIndex < words.length; wordIndex++) {
        var word = words[wordIndex];

        matchingWordIndex = model.nodes.indexOf(word);

        if (matchingWordIndex === -1)
            break;

        edges = filterEdges(prevWordIndex, matchingWordIndex, edges);

        edges = filterNextEdges(edges);

        prevWordIndex = matchingWordIndex;

        path.push(word);
    }

    if (wordIndex < words.length) {
        // filter founded edges by last word
        var lastWord = words[words.length - 1];
        var edges2 = [];

        for (var i = 0; i < edges.length; i++) {
            var nextWord = model.nodes[edges[i].to];

            if (nextWord.startsWith(lastWord)) {
                edges2.push(edges[i]);
            }
        }

        edges = edges2;
    }

    if (edges.length) {
        for (var i = 0; i < edges.length; i++) {
            var possibleNextWord = model.nodes[edges[i].to];
            predictions.push(path.join(' ') + ' ' + possibleNextWord);
        }
    } else {
        predictions.push(path.join(' '));
    }
    
    return predictions;
}

function addText(text) {

    var sentences = text.split(".");
    for (var i = 0; i < sentences.length; i++) {
        addSentence(sentences[i]);
    }

}

function addUrl(url) {

    if (url.includes("http://")) {
        url = url.replace("http://", "https://cors-anywhere.herokuapp.com/");
    } else if (url.includes("https://")) {
        url = url.replace("https://", "https://cors-anywhere.herokuapp.com/");
    }
    console.log(url);
    var text;
    $.get(url, function (data) {

        var pageJq = $(data);
        for (var i = 0; i < sites.length; i++) {

            if (url.indexOf(sites[i].site) >= 0) {
                sites[i].find = sites[i].find + " p";
                text = pageJq.find(sites[i].find).text();
                break;
            }
        }
        addText(text);
    });
}

function createUrl(site, find) {

    sites.push({
        site: site,
        find: find
    })
    localStorage.setItem("sites", JSON.stringify(sites))

}

function init() {

    var input = $('#TextInput'),
        list = $('.list');

    input.on('input', function () {

        list.empty();

        var inputText = input.val();

        if (input.val()) {
            var predictions = predict(inputText);

            for (var i = 0; i < predictions.length; i++) {
                $('<li id="les"/>').text(predictions[i]).appendTo(list);
            }

        }

    });

}

function removeElement(elementId) {
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}