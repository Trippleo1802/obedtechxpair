const express = require('express');
const fs = require('fs');
const { exec } = require("child_process");
let router = express.Router()
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");
const { upload } = require('./mega');

    const sessionDir = './session';
    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir);
    }

router.get('/', async (req, res) => {
    let num = req.query.number;
    async function XploaderPair() {
        const { state, saveCreds } = await useMultiFileAuthState(`./session`);
        try {
            let XpbotsPair = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.windows("Firefox"),
            });

            if (!XpbotsPair.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await XpbotsPair.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            XpbotsPair.ev.on('creds.update', saveCreds);
            XpbotsPair.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === "open") {
                    try {
                        await delay(10000);
                        const sessionPrabath = fs.readFileSync('./session/creds.json');

                        const auth_path = './session/';
                        const user_jid = jidNormalizedUser(XpbotsPair.user.id);

                      function randomMegaId(length = 6, numberLength = 4) {
                      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                      let result = '';
                      for (let i = 0; i < length; i++) {
                      result += characters.charAt(Math.floor(Math.random() * characters.length));
                        }
                       const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                        return `${result}${number}`;
                        }

            const myr = await XpbotsPair.sendMessage(XpbotsPair.user.id, { text: "*OBED TECHX SESSION ID BELOW*" });
                        const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);

                        const string_session = mega_url.replace('https://mega.nz/file/', 'ObedTechX~');

                        const sid = string_session;

  const dt = await XpbotsPair.sendMessage(XpbotsPair.user.id, { image: { url: "https://files.catbox.moe/yedfbr.jpg" }, caption: `${sid}` }, { quoted: myr });

                    } catch (e) {
                        process.exit(1); 
                    }

                    await delay(100);
                    fs.rmdirSync(sessionDir, { recursive: true });
                    process.exit(0);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    XploaderPair();
                }
            });
        } catch (err) {
            process.exit(1);
            console.log("service restarted");
            XploaderPair();
            fs.rmdirSync(sessionDir, { recursive: true });
            if (!res.headersSent) {
                await res.send({ code: "Service Unavailable" });
            }
        }
    }
    return await XploaderPair();
});

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
   process.exit(1);
});


module.exports = router;
                                                                 
