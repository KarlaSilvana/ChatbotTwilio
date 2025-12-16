/*
const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const numberNormalizer = require('./numberNormalizer')

//------------------- Flow Welcome ------------------- 
const flowWelcome = addKeyword(['inicio', 'empezar', 'start', 'menu', 'bienvenido'])
    .addAnswer(
        [
            '👋 ¡Hola! Bienvenido a *Bot WhatsApp*!',
            'Soy tu asistente virtual 🤖',
            'Para comenzar, escribe *hola* o selecciona una opción:',
            '\n👉 *hola* para ver el menú principal.',
        ],
        null,
        async (ctx, { flowDynamic, provider }) => {
            console.log(`📨 Mensaje recibido de: ${ctx.from}`)
            
            // Normalizar el número usando el módulo
            const numeroReal = numberNormalizer.normalize(ctx.from)

            if (!numeroReal) {
                console.error(`⚠️ No se pudo identificar el número real para: ${ctx.from}`)
                await flowDynamic('⚠️ Lo siento, hubo un problema identificando tu número. Por favor, contacta al administrador.')
                return
            }

            console.log(`✅ Usuario identificado: ${numeroReal}`)

            // Verificar si necesitamos redirigir la respuesta
            const fromCleaned = ctx.from.replace('@s.whatsapp.net', '').replace('@g.us', '')
            
            if (fromCleaned !== numeroReal) {
                // El ID es diferente al número real, enviar al número correcto
                const numeroDestino = `${numeroReal}@s.whatsapp.net`
                console.log(`➡️ Redirigiendo respuesta de ${fromCleaned} al número real: ${numeroDestino}`)
                
                try {
                    await provider.sendText(
                        numeroDestino,
                        `👋 ¡Hola! Te identificamos correctamente.\n\n` +
                        `📱 Tu número real es: *${numeroReal}*\n` +
                        `🔧 ID recibido: ${fromCleaned}\n\n` +
                        `✅ Ya puedes continuar usando el bot normalmente.`
                    )
                } catch (error) {
                    console.error(`❌ Error al enviar mensaje a ${numeroDestino}:`, error)
                }
            } else {
                // El número es correcto, responder normalmente
                await flowDynamic(`✅ Te estás comunicando desde el número *${numeroReal}*`)
            }
        }
    )

// ------------------- Flow para agregar mapeos manualmente ------------------- 
const flowAddMapping = addKeyword(['agregar_mapeo', 'add_mapping'])
    .addAnswer(
        '🔧 *Agregar nuevo mapeo*\n\n' +
        'Formato: agregar_mapeo ID NUMERO\n' +
        'Ejemplo: agregar_mapeo 248897767215269 51980732101',
        null,
        async (ctx, { flowDynamic }) => {
            const parts = ctx.body.split(' ')
            
            if (parts.length !== 3) {
                await flowDynamic('❌ Formato incorrecto. Usa: agregar_mapeo ID NUMERO')
                return
            }

            const [, id, numero] = parts
            const success = numberNormalizer.addMapping(id, numero)

            if (success) {
                await flowDynamic(`✅ Mapeo agregado exitosamente:\n${id} -> ${numero}`)
            } else {
                await flowDynamic('❌ Error al agregar el mapeo. Verifica el número.')
            }
        }
    )

// ------------------- Flow para ver estadísticas ------------------- 
const flowStats = addKeyword(['stats', 'estadisticas'])
    .addAnswer(
        '📊 *Estadísticas del sistema*',
        null,
        async (ctx, { flowDynamic }) => {
            const stats = numberNormalizer.getStats()
            const mappingsText = Object.entries(stats.mappings)
                .map(([id, num]) => `  • ${id} -> ${num}`)
                .join('\n')

            await flowDynamic(
                `📊 Total de mapeos: *${stats.totalMappings}*\n\n` +
                `${mappingsText || '  (No hay mapeos registrados)'}`
            )
        }
    )

//------------------- Inicialización del bot ------------------- 
const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowWelcome, flowAddMapping, flowStats])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    console.log('🤖 Bot iniciado correctamente')
    console.log('📊 Mapeos cargados:', numberNormalizer.getStats().totalMappings)

    QRPortalWeb()
}

main()*/

/*
require('dotenv').config()

const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const TwilioProvider = require('@bot-whatsapp/provider-twilio')
const MockAdapter = require('@bot-whatsapp/database/mock')
const numberNormalizer = require('./numberNormalizer')
*/


require('dotenv').config()

const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
const { TwilioProvider } = require('@bot-whatsapp/provider-twilio')
const MockAdapter = require('@bot-whatsapp/database/mock')

// Flow que responde a TODO
const flowPrincipal = addKeyword(EVENTS.WELCOME)
    .addAnswer('✅ ¡Mensaje recibido!', null, async (ctx) => {
        console.log('\n📨 Mensaje de:', ctx.from)
        console.log('📝 Contenido:', ctx.body)
        console.log('✅ Respuesta enviada\n')
    })
    .addAnswer('Escribiste:', null, async (ctx, { flowDynamic }) => {
        await flowDynamic(`"${ctx.body}"`)
    })

// Flows específicos
const flowHola = addKeyword(['hola', 'hi', 'buenas'])
    .addAnswer('👋 ¡Hola! ¿Cómo estás?')
    .addAnswer('¿En qué puedo ayudarte?')

const flowTest = addKeyword(['test', 'prueba'])
    .addAnswer('🎉 ¡Test exitoso!')
    .addAnswer('El bot está funcionando correctamente')

const flowHora = addKeyword(['hora', 'tiempo'])
    .addAnswer('⏰ La hora actual es:', null, async (ctx, { flowDynamic }) => {
        const hora = new Date().toLocaleString('es-PE', {
            timeZone: 'America/Lima',
            hour: '2-digit',
            minute: '2-digit'
        })
        await flowDynamic(`🕐 ${hora}`)
    })

const flowAyuda = addKeyword(['ayuda', 'help', 'menu'])
    .addAnswer('📋 *Menú de opciones:*')
    .addAnswer('• "hola" - Saludo')
    .addAnswer('• "test" - Prueba el bot')
    .addAnswer('• "hora" - Ver hora actual')
    .addAnswer('• "ayuda" - Ver este menú')

const main = async () => {
    const adapterDB = new MockAdapter()
    
    const adapterFlow = createFlow([
        flowHola,
        flowTest,
        flowHora,
        flowAyuda,
        flowPrincipal // Este debe ir al final para capturar todo lo demás
    ])
    
    const adapterProvider = createProvider(TwilioProvider, {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        vendorNumber: process.env.TWILIO_PHONE_NUMBER,
    })

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    console.log('\n✅ BOT TWILIO FUNCIONANDO')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📞 Número:', process.env.TWILIO_PHONE_NUMBER)
    console.log('🌐 Webhook:', 'https://neophytic-kirby-bardic.ngrok-free.dev/twilio-hook')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n💬 Envía estos comandos:')
    console.log('  • hola')
    console.log('  • test')
    console.log('  • hora')
    console.log('  • ayuda\n')
}

main()