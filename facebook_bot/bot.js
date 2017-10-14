"use strict";
var SimpleFilter = require("./bot_filter/simpleFilter");
var SpamFilter = require("./bot_filter/spamFilter");
var CategoryFilter = require("./bot_filter/categoryFilter");
var SearchFilter = require("./bot_filter/searchFilter");
var TagFilter = require("./bot_filter/tagFilter");
var YoutubeFilter = require("./bot_filter/youtubeFilter");
var ButtonFilter = require("./bot_filter/buttonFilter");
var EndFilter = require("./bot_filter/endFilter");
var ImageFilter = require("./bot_filter/imageFilter");

var async = require("asyncawait/async");
var await = require("asyncawait/await");

var BOT_REPLY_TYPE = require("./constants").BOT_REPLY_TYPE;
var BUTTON_TYPE = require("./constants").BUTTON_TYPE;
var PAYLOAD = require("./constants").PAYLOAD;

var girlAPI = require("./api/girlAPI");
var fbAPI = require("./api/facebookAPI");
var faceRecAPI = require("./api/faceRecAPI");
var ulti = require("./utilities");

class BotAsync {
    constructor() {

        

       this._helloFilter = new SimpleFilter(["hi", "halo", "hế lo", "hello", "chào", "xin chào"], "Chào bạn, mềnh là bot <3 Bạn cần giúp gì nào ?");

        var girlFilter = new ImageFilter(["@gái", "@girl", "hình gái", "anh gai", "cute girl"], girlAPI.getRandomGirlImage.bind(girlAPI)); // From xkcn.info
        var sexyGirlFilter = new ImageFilter(["@sexy", "sexy", "fap", "anh nong", "hot girl", "hinh sexy", "gai sexy", "sexy girl"],
            girlAPI.getRandomSexyImage.bind(girlAPI, "637434912950811", 760)); // From xinh nhẹ nhàng 
        var javGirlFilter = new SimpleFilter(["aa", "aaaaa"],
		"aaaaa");
        var bikiniGirlFilter = new ImageFilter(["@bikini", "bikini", "ao tam", "do boi"],
            girlAPI.getRandomSexyImage.bind(girlAPI, "169971983104176", 1070)); // From hội bikini

        var youtubeFilter = new YoutubeFilter(["@nhạc", "@music", "@youtube", "@yt"]);

        var helpFilter = new SimpleFilter(["help", "giúp đỡ", "giúp với", "giúp mình", "giúp"],
		"Đang làm <3");
        
        var exampleFilter = new SimpleFilter(["Linework 1", "Linework", "Linework", "Linework", "Linework"],
		"Outcome");
        
        var botInfoFilter = new SimpleFilter(["may la ai", "may ten gi", "may ten la gi",
                "ban ten la gi", "ban ten gi", "ban la gi",
                "bot ten gi", "bot ten la gi", "your name"
            ],
            "bot");
			
			var tetFilter = new SimpleFilter(["Abc"],
		"<3");
        var adInfoFilter = new SimpleFilter(["hôm nay bot thấy như thế nào","hom nay bot nhu the nao","bot cam thay nhu the nao","suc khoe"
            ],
            "cảm ơn vì đã hỏi,hiện tại bot đang được host qua workspace trên c9.io,cường độ ko ổn định lắm");
        var thankyouFilter = new SimpleFilter(["cảm ơn", "thank you", "thank", "nice", "hay qua",
            "gioi qua", "good job", "hay nhi", "hay ghe"
        ], "Không có chi. Rất vui vì đã giúp được cho bạn ^_^");
  
        var chuiLonFilter = new SimpleFilter(["dm", "dmm", "đậu xanh", "rau má", "dcm", "vkl", "vl", "du me", "may bi dien",
                "bố láo", "ngu the", "me may", "ccmm", "ccmn", "bot ngu", "đờ mờ", "fuck", "fuck you"
            ],
            "ok");
        var testFilter = new SimpleFilter(["test"],
            "Đừng test nữa, mấy hôm nay người ta test nhiều quá bot mệt lắm rồi :'(");
        this._goodbyeFilter = new SimpleFilter(["tạm biệt", "bye", "bai bai", "good bye"], "Tạm biệt, hẹn gặp lại ;)");
		

        this._filters = [new SpamFilter(),
            new SearchFilter(), new CategoryFilter(), new TagFilter(), youtubeFilter,
            girlFilter, sexyGirlFilter, javGirlFilter, bikiniGirlFilter,
            adInfoFilter, botInfoFilter, tetFilter,
            chuiLonFilter, thankyouFilter, helpFilter,
            this._goodbyeFilter, this._helloFilter, testFilter, new EndFilter(),
        ];
    }

    setSender(sender) {
        this._helloFilter.setOutput(`Chào ${sender.first_name}, mềnh là bot <3. Bạn cần giúp gì nào <3 ?`);
        this._goodbyeFilter.setOutput(`Tạm biệt ${sender.first_name}, hẹn gặp lại ;)`);
    }

    chat(input) {
        for (var filter of this._filters) {
            if (filter.isMatch(input)) {
                filter.process(input);
                return filter.reply(input);
            }
        }
    }

    reply(senderId, textInput) {
        async(() => {
            var sender = await (fbAPI.getSenderName(senderId));
            this.setSender(sender);

            var botReply = await (this.chat(textInput));
            var output = botReply.output;
            switch (botReply.type) {
                case BOT_REPLY_TYPE.TEXT:
                    fbAPI.sendTextMessage(senderId, output);
                    break;
                case BOT_REPLY_TYPE.POST:
                case BOT_REPLY_TYPE.VIDEOS:
                    fbAPI.sendTextMessage(senderId, "Có ngay đây. Xem thoải mái ;)");
                    fbAPI.sendGenericMessage(senderId, ulti.videosToPayloadElements(output));
                    break;
                case BOT_REPLY_TYPE.BUTTONS:
                    let buttons = botReply.buttons;
                    fbAPI.sendButtonMessage(senderId, output, buttons);
                    break;
                case BOT_REPLY_TYPE.IMAGE:
                    fbAPI.sendTextMessage(senderId, "Đợi tí có liền^^");
                    fbAPI.sendImage(senderId, output);
                    break;
                default:
            }
        })();
    }


    processImage(senderId, imageUrl) {
        // If the image is not an emo
        if (imageUrl.includes("&oh=") && imageUrl.includes("&oe=")) {
            faceRecAPI.analyzeImage(imageUrl).then((reply) => {
                fbAPI.sendTextMessage(senderId, reply);
            });

            faceRecAPI.analyzeEmo(imageUrl).then((reply) => {
                fbAPI.sendTextMessage(senderId, reply);
            });
        } else {
            // Send emo back
            fbAPI.sendImage(senderId, imageUrl);
        }

    }

    processPostback(senderId, payload) {
        async(() => {
            var sender = await (fbAPI.getSenderName(senderId));
            this.setSender(sender);
            switch (payload) {
                case PAYLOAD.SEE_CATEGORIES:
                    this.reply(senderId, "hello");
                    break;
                case PAYLOAD.HELP:
                    this.reply(senderId, "-help");
                    break;
                case PAYLOAD.GIRL:
                    this.reply(senderId, "@girl");
                    break;
                default:
                    console.log("Unknown payload: " + payload);
            }
        })();
    }
}

module.exports = new BotAsync();"use strict";