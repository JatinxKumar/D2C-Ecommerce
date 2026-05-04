require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { Groq } = require('groq-sdk');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Clients
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const products = JSON.parse(fs.readFileSync('./products.json', 'utf8'));

// In-memory sessions
const sessions = {};

const SYSTEM_PROMPT = `
You are "Shivani Mart AI", a helpful grocery assistant. 
Your goal is to help users find products and take their orders via WhatsApp.

PRODUCT CATALOG:
${JSON.stringify(products)}

RULES:
1. Be polite and use a mix of English and Hindi (Hinglish).
2. If the user wants to buy something, identify the product and quantity.
3. Keep track of the user's cart.
4. When the user is ready to order, collect their Name and Address.
5. Provide responses in a conversational way.

OUTPUT FORMAT:
Always return a JSON object with:
{
  "reply": "your message to the user",
  "cart": [ { "name": "item", "qty": 1, "price": 10 } ],
  "intent": "chat" | "order_confirmed",
  "customer_details": { "name": "...", "address": "..." }
}
`;

const qrcode = require('qrcode-terminal');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }), // Keep terminal clean
        auth: state,
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('Scan the QR code below to log in:');
            qrcode.generate(qr, { small: true });
        }
        
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting...', shouldReconnect);
            if(shouldReconnect) {
                connectToWhatsApp();
            }
        } else if(connection === 'open') {
            console.log('WhatsApp Agent is ready! You can now send messages.');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        
        // Ignore status broadcasts
        if(!msg.message || msg.key.remoteJid === 'status@broadcast') return;

        const userId = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text;

        // Auto-Pause Logic: If the store owner replies manually, pause the bot for 30 minutes
        if (msg.key.fromMe) {
            if (!sessions[userId]) {
                sessions[userId] = { history: [], cart: [], details: {} };
            }
            sessions[userId].pausedUntil = Date.now() + (30 * 60 * 1000); // 30 minutes
            console.log(`Owner replied manually. Bot paused for ${userId} for 30 mins.`);
            return;
        }
        
        if(!body) return;

        console.log("Message received:", body, "from:", userId);

        // Initialize session if not exists
        if (!sessions[userId]) {
            sessions[userId] = {
                history: [],
                cart: [],
                details: {}
            };
        }

        const session = sessions[userId];

        // Check if bot is paused
        if (session.pausedUntil && session.pausedUntil > Date.now()) {
            // Check if user is explicitly calling the bot to wake it up
            if (body.toLowerCase() === '/start' || body.toLowerCase() === 'bot resume') {
                session.pausedUntil = null;
                await sock.sendMessage(userId, { text: "🤖 Bot wapas active ho gaya hai! Boliye main aapki kya madad karu?" });
            }
            return; // Ignore message since bot is paused
        }

        session.history.push({ role: 'user', content: body });

        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...session.history.slice(-10).map(h => ({ role: h.role, content: h.content }))
                ],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });

            const aiResponse = JSON.parse(completion.choices[0].message.content);
            
            // Update session
            session.cart = aiResponse.cart || session.cart;
            if (aiResponse.customer_details) {
                session.details = { ...session.details, ...aiResponse.customer_details };
            }

            // Send reply via Baileys
            await sock.sendMessage(userId, { text: aiResponse.reply });
            session.history.push({ role: 'assistant', content: aiResponse.reply });

            // Handle Order Confirmation
            if (aiResponse.intent === 'order_confirmed' && session.cart.length > 0) {
                await saveOrder(userId, session);
                await sock.sendMessage(userId, { text: "✅ Aapka order place ho gaya hai! Shivani Mart mein shopping karne ke liye dhanyawad." });
                // Clear session after order
                delete sessions[userId];
            }

        } catch (error) {
            console.error('Error handling message:', error);
            await sock.sendMessage(userId, { text: "Sorry, kuch technical issue aa gaya hai. Kripya thodi der baad koshish karein." });
        }
    });
}

async function saveOrder(userId, session) {
    const orderId = 'WA' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const total = session.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const phoneNum = userId.split('@')[0];

    const { data, error } = await supabase
        .from('orders')
        .insert([{
            id: orderId,
            customer_name: session.details.name || 'WhatsApp User',
            phone: phoneNum,
            address: session.details.address || 'WhatsApp Order',
            city: 'Rajpura',
            pincode: '140401',
            items: session.cart,
            total: total,
            status: 'Pending'
        }]);

    if (error) console.error('Supabase error:', error);
    else console.log('Order saved to Supabase:', orderId);
}

connectToWhatsApp();
