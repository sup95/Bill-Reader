'use strict';

const request = require('request');

const uriBase = 'https://westcentralus.api.cognitive.microsoft.com/vision/v2.0/read/core/asyncBatchAnalyze';

const subscriptionKey = ''

let imageUrl = 'https://i.imgur.com/qpOv1sX.jpg';

let operationLocationUri = null;

const params = {
    'language': 'en',
    'detectOrientation': 'true',
};

console.log();

validateSubscriptionKey(subscriptionKey);
imageUrl = updateImageUrlToParse(imageUrl);
fireAsyncCallToVisionApi();

function validateSubscriptionKey(subscriptionKey) {
    if(!subscriptionKey) {
        console.log("No Subscription Key provided. Get a free API Key for Computer Vision from 'https://azure.microsoft.com/en-us/try/cognitive-services/?api=computer-vision'.")
        process.exit();
    }
}

function updateImageUrlToParse(imageUrl) {
    var args = process.argv.slice(2);
    if(!args[0]) {
        console.log("No image url specified. Running with sample image url: 'https://i.imgur.com/qpOv1sX.jpg' \n");
        return imageUrl;
    }
    else {
        imageUrl = args[0];
        console.log("Image url: " + imageUrl + "\n");
        return imageUrl;
    }
}

function fireAsyncCallToVisionApi() {
    const options = {
        uri: uriBase,
        qs: params,
        body: '{"url": ' + '"' + imageUrl + '"}',
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key' : subscriptionKey
        }
    };

    request.post(options, (error, response, body) => {
    if (error) {
        console.log('Error: ', error);
        return;
    }
    operationLocationUri = response.headers["operation-location"];
    fireCallForTextAndParse(operationLocationUri);
    });
}


function fireCallForTextAndParse(operationLocationUri) {
    const asyncOptions = {
        uri: operationLocationUri,
        qs: params,
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key' : subscriptionKey
        }
    };

    let jsonResponse = null;
    request.get(asyncOptions, (error, response, body) => {
        if (error) {
          console.log('Error: ', error);
          return;
        }

        jsonResponse = JSON.parse(body);
        parseText(jsonResponse);
      });
}


function parseText(jsonResponse) {
    const textLines = [];
    if(jsonResponse.status != "Running") {
        jsonResponse.recognitionResults[0].lines.forEach((line) => {
            textLines.push(line.text);
        });

        let storeData = parseStoreData(textLines);
        let itemsData = parseItemData(textLines);

        let result = {
            store: storeData,
            items: itemsData
        }

        console.log(result);
    }
    else {
        console.log("Fetching text from image...");
        console.log("Retrying...\n");
        fireCallForTextAndParse(operationLocationUri);
    }
}


function parseStoreData(textLines) {
    return {
        name: textLines[0],
        address: textLines[2]
    };
}


function parseItemData(textLines) {
    let itemNameIndex = -1;
    let totalIndex = -1;
    let priceIndex = -1;

    for(let i = 0; i < nearbySpellings.itemName.length; i++) {
        itemNameIndex = textLines.findIndex((ele) => ele == nearbySpellings.itemName[i]);
        if(itemNameIndex != -1) 
            break;
    }

    for(let i = 0; i < nearbySpellings.price.length; i++) {
        priceIndex = textLines.findIndex((ele) => ele == nearbySpellings.price[i]);
        if(priceIndex != -1) 
            break;
    }

    for(let i = 0; i < nearbySpellings.total.length; i++) {
        totalIndex = textLines.findIndex((ele) => ele == nearbySpellings.total[i], itemNameIndex);
        if(totalIndex != -1) 
            break;
    }

    let priceOffset = priceIndex - itemNameIndex;

    let item = {};
    let itemDataSet = [];
    for(let i = totalIndex + 1; (i < textLines.length) && (!nearbySpellings.stopWords.includes(textLines[i])); i++) {
        if(isValidItemName(textLines[i])) {
            itemDataSet.push(item);
            item = {};
            item.name = textLines[i];
            if(((i + priceOffset) < textLines.length) && (!isValidItemName(textLines[i + priceOffset]))) {
                item.price = textLines[i + priceOffset];
            }
        }
        else {
            if(!item.price)
                item.price = textLines[i];
        }
    }
    itemDataSet.push(item);

    return itemDataSet.slice(1);
}


function isValidItemName(itemName) {
    if(!itemName)
        return false;
    let count = 0;
    for(let i = 0; i < itemName.length; i++) {
        if(isLetter(itemName[i])) {
            count++;
            if(count >= 3) {
                return true;
            }
        }
    }
}

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

const nearbySpellings = {
    itemName: ['Item Name', 'Iten Name', 'item name', 'Item', 'item', 'Iten'],
    price: ['Price', 'price', 'Cost', 'Price Amount'],
    total: ['Total', 'total', 'TOTAL', 'Amount', 'Price Amount'],
    stopWords: ['Grand Total', 'Thanks', 'Total', 'total', 'SubTotal']
};