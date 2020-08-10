var model = JSON.parse(localStorage.getItem("model")) || {
    nodes: [],
    edges: [],
}

var sites = JSON.parse(localStorage.getItem("sites")) || [
    {
        site: "hurriyet.com.tr",
        find: ".text-container"
    },
    {
        site: "eksisozluk.com",
        find: ".content"
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
    var words = sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").toLocaleUpperCase("tr-TR").split(' ');
    var prevWordIndex = -1;

    for (var i = 0; i < words.length; i++) {

        var word = words[i];
        
        if(!word){
            continue;
        }
        
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
    
    // input = "kedi çok yemek yedi. kedi, çok"
    // regex
    input = input.replace(/.*(?=)[\.?!]\s*/g,"")
    // input = "kedi, çok"
    
    var words = input.toLocaleUpperCase("tr-TR").replace(/[!"\#$%&'()*+,\-/:;<=>?@\[\\\]^_‘{|}~]/g, "").split(" ").filter(function (arrayItem) {
        return arrayItem;
    });
    
    // words = ["kedi","çok"]

    var joinedWords = words.join(" ");
    

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
        var isEntered;

        for (var i = 0; i < edges.length; i++) {
            var nextWord = model.nodes[edges[i].to];

            if (nextWord.startsWith(lastWord)) {
                edges2.push(edges[i]);
                isEntered = true;
            }
        }
        if (!isEntered) {
            path = [];
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
    if (checkIfArrayIsUnique(words) && model.nodes.indexOf(lastWord)) {
        return [];
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

    if (url.startsWith("http://")) {
        url = url.replace("http://", "https://cors-anywhere.herokuapp.com/");
    } else if (url.startsWith("https://")) {
        url = url.replace("https://", "https://cors-anywhere.herokuapp.com/");
    }
    console.log(url);
    var text;
    $.get(url, function (data) {

        var pageJq = $(data);
        for (var i = 0; i < sites.length; i++) {

            if (url.indexOf(sites[i].site) >= 0) {
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

function removeElement(elementId) {
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}

function checkIfArrayIsUnique(myArray) {
    for (var i = 0; i < myArray.length; i++) {
        for (var j = 0; j < myArray.length; j++) {
            if (i != j) {
                if (myArray[i] == myArray[j]) {
                    return true; // means there are duplicate values
                }
            }
        }
    }
    return false; // means there are no duplicate values.
}