require('dotenv').config()

const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
const { TwilioProvider } = require('@bot-whatsapp/provider-twilio')
const MockAdapter = require('@bot-whatsapp/database/mock')

// Flow principal que captura todo
const flowPrincipal = addKeyword(EVENTS.WELCOME)
    .addAnswer('✅ Mensaje recibido', { delay: 300 })
    .addAnswer(null, { delay: 500 }, async (ctx, { flowDynamic }) => {
        console.log('📨 De:', ctx.from, '| Mensaje:', ctx.body)
        await flowDynamic(`Escribiste: "${ctx.body}"`)
    })

// Comandos específicos
const flowHola = addKeyword(['hola', 'hi', 'buenas', 'hey'])
    .addAnswer('👋 ¡Hola! ¿Cómo estás?')

const flowTest = addKeyword(['test', 'prueba'])
    .addAnswer('🎉 ¡Bot funcionando!')
    .addAnswer('Todo está operativo ✅')

const flowHora = addKeyword(['hora', 'tiempo'])
    .addAnswer('⏰ Hora actual:', null, async (ctx, { flowDynamic }) => {
        const hora = new Date().toLocaleString('es-PE', {
            timeZone: 'America/Lima',
            hour: '2-digit',
            minute: '2-digit'
        })
        await flowDynamic(`🕐 ${hora}`)
    })

const flowAyuda = addKeyword(['ayuda', 'help', 'menu'])
    .addAnswer('📋 Comandos disponibles:')
    .addAnswer('• hola - Saludo')
    .addAnswer('• test - Probar bot')
    .addAnswer('• hora - Ver hora')
    .addAnswer('• ayuda - Este menú')

const main = async () => {
    const adapterDB = new MockAdapter()
    
    const adapterFlow = createFlow([
        flowHola,
        flowTest,
        flowHora,
        flowAyuda,
        flowPrincipal
    ])
    
    const adapterProvider = createProvider(TwilioProvider, {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        vendorNumber: process.env.TWILIO_PHONE_NUMBER,
        port: 3000
    })

    const bot = createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    // Agregar headers correctos para Twilio
    const server = bot.httpServer
    if (server && server._events && server._events.request) {
        const originalHandler = server._events.request
        server._events.request = (req, res) => {
            res.setHeader('Content-Type', 'text/xml')
            originalHandler(req, res)
        }
    }

    console.log('\n🤖 BOT ACTIVO')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📞 Puerto: 3000')
    console.log('🌐 IP: 54.90.168.254')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()