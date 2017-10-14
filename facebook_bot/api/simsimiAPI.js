"use strict";
var request = require("request");
var atob = require("atob");

//Using Sumichat.Api
class SimsimiAPI {
    constructor() {
        this._url = `https://api-chat2017.herokuapp.com/getSumiAnswer?key=1d07f807-f7b5-483c-b5e5-52199872183a&lang=vn&text=`;
    }
    getMessage(text) {
        // Hot fix, remove this later
        // return Promise.resolve("Hôm nay bot mệt, nghỉ tạm. Hôm khác nói chuyện nhé.");
        
        return new Promise((resolve, reject) => {
            request({
                url: this._url + encodeURI(text),
                method: "GET"
            }, (err, response, body) => {
                if (err) {
                    reject();
                    return;
                }
                
                var rs = JSON.parse(body);
                if (rs.SumiAnswers !="") {
                    resolve(rs.SumiAnswers);
               
                }else {
                    reject();
                }
            });
        });
    }
    

}

module.exports = new SimsimiAPI(); 

//Using Simsimi.sandbox.api
/*class SimsimiAPI {
    constructor() {
        this._key = process.env.SIM_TOKEN || atob("bebc7960-8d34-44fb-8e55-b26ffc134279");
        this._url = `http://sandbox.api.simsimi.com/request.p?key=bebc7960-8d34-44fb-8e55-b26ffc134279&lc=en&ft=1.0&text=hi`;
        
        this._freeUrl = "http://newapp.simsimi.com/v1/simsimi/talkset?uid=10034&av=6.7.1&lc=vn&cc=vn&tz=Vietnam&os=a&isFilter=0&message_sentence=";
    }

    getMessage(text) {
        // Hot fix, remove this later
        // return Promise.resolve("Hôm nay bot mệt, nghỉ tạm. Hôm khác nói chuyện nhé.");
        
        return new Promise((resolve, reject) => {
            request({
                url: this._url + encodeURI(text),
                method: "GET"
            }, (err, response, body) => {
                if (err) {
                    reject();
                    return;
                }
                
                var rs = JSON.parse(body);
                if (rs.result === 100) {
                    resolve(rs.response);
                } else if(rs.result == 509) {
                    resolve("Các bạn chat nhiều quá API hết 100 limit cmnr. Mai bạn quay lại nhé :'(. ");
                }else {
                    reject();
                }
            });
        });
    }
    
    // Got by decompiling SimSimi APK. Not reliable but free
    getMessageFree(text) {
        return new Promise((resolve, reject) => {
            request({
                url: this._freeUrl + encodeURI(text),
                method: "GET"
            }, (err, response, body) => {
                                if (err) {
                    reject();
                    return;
                }
                
                
                var rs = JSON.parse(body);
                var reply = rs.simsimi_talk_set.answers[0].sentence;
                resolve(reply);               
            });
        });
    }

}

module.exports = new SimsimiAPI(); 
*/

