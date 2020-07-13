
var model = {
    nodes: [],
    edges: []
}

function dump() {
    console.log(model);
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
            to:to,
            score:1
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
}

function findEdges(from, to) {
    var foundedEdges = [];

    for (var j = 0; j < model.edges.length; j++) {
        var edge = model.edges[j];

        if (edge.from === from && to === -1) {
            foundedEdges.push(edge);
        } else if (edge.from === from && edge.to === to) {
            foundedEdges.push(edge);
        }
    }

    return foundedEdges;
}

function findNextEdges(edges, toWord) {
    var nextEdges = [];

    for (var j = 0; j < edges.length; j++) {
        nextEdges = nextEdges.concat(findEdges(edges[j].to, toWord));
    }

    return nextEdges;
}

function predict(input) {
    var words = input.toUpperCase().split(" ");
    var edges;

    for (var i = 0; i < words.length; i++) {

        var word = words[i];
        var matchingWordIndex = model.nodes.indexOf(word);

        if (i === 0) {
            edges = findEdges(-1, matchingWordIndex);
        } else {
            edges = findNextEdges(edges, matchingWordIndex);
        }

        if (!edges.length)
            break;
    }

    edges = findNextEdges(edges, -1);

    for (var i = 0; i < edges.length; i++) {
        var possibleNextWord = model.nodes[edges[i].to];

        console.log(input + " " + possibleNextWord);
    }

    return [];
}

function addText(text) {
   
    var sentences = text.split(".");
    for(var i = 0; i < sentences.length;i++){
        addSentence(sentences[i]);
    }
    
}