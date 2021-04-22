const encoderUri = "https://ermela.net/gpt-3-encoder/encoder.json";
const vocabUri = "https://ermela.net/gpt-3-encoder/vocab.bpe";

const Exterm = (function(){
    'use strict';
    const remoteEncoder = new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.overrideMimeType("application/json");
        xhr.onload = function () {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300)
                resolve(JSON.parse(xhr.responseText));
            else
                reject(Error(xhr.statusText));
        }
      
        xhr.open("GET", encoderUri, true);
        xhr.send();
    });
      
    const remoteVocab = new Promise((resolve, reject) => {
        this.timeout
        let xhr = new XMLHttpRequest();
        xhr.overrideMimeType("text/plain; charset=UTF-8");
        xhr.onload = function () {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300)
                resolve(xhr.responseText);
            else
                reject(Error(xhr.statusText));
        }
      
        xhr.open("GET", vocabUri, true);
        xhr.send();
    });

    return {
        remoteEncoder: remoteEncoder,
        remoteVocab: remoteVocab
    }
}());
