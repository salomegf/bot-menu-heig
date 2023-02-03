import {} from "dotenv/config.js";
import dateFormat from 'dateformat';
import TelegramBot from 'node-telegram-bot-api';
import request from 'request';

const token = process.env.TOKEN_TELEGRAM

const bot = new TelegramBot(token, {
    polling: true
});

bot.on("polling_error", (err) => console.log(err));

bot.onText(/\/menu/, function (msg, match) {

    const city = match[1];
    const chatId = msg.chat.id

    const options = {
        url: 'https://top-chef-intra-api.blacktree.io/weeks/current',
        headers: {
            'x-api-key': process.env.TOKEN_API
        }
    };

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            const res = JSON.parse(body)
            let menus = res.days
            let menusToday = ''

            const today = dateFormat(new Date(), 'isoDate')
            menus.forEach(menu => {
                const menuDate = dateFormat(menu.day, 'isoDate')
                if (menuDate == today) {
                    menusToday = menu.menus
                }
            });

            if (menusToday !== '' || menusToday !== undefined) {
                menusToday.forEach(menu => {
                    if (menu.starter !== '') {
                        let txt = ''
                        txt += '\n<u>Entrée</u>\n' + menu.starter + '\n'
                        txt += '\n<u>Plat</u>\n'
                        menu.mainCourse.forEach(main => {
                            txt += main + '\n'
                        });
                        txt += '\n<u>Dessert</u>\n' + menu.dessert

                        bot.sendMessage(chatId, txt, {
                            parse_mode: "HTML"
                        })
                    }
                });
            } else {
                txt = "pas de menu aujourd'hui :("
                bot.sendMessage(chatId, txt, {
                    parse_mode: "HTML"
                })
            }
        }
    }
    request(options, callback);
})