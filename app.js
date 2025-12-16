require('dotenv').config()
const express = require('express')
const twilio = require('twilio')

const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Comandos del bot
const commands = {
    'test': '🎉 ¡Bot funcionando perfectamente! ✅',
    'prueba': '🎉 ¡Bot funcionando perfectamente! ✅',
    'hola': '👋 ¡Hola! ¿Cómo estás?\n\nEscribe "ayuda" para ver los comandos.',
    'hi': '👋 ¡Hola! ¿Cómo estás?\n\nEscribe "ayuda" para ver los comandos.',
    'ayuda': '📋 *Comandos disponibles:*\n\n• test - Probar bot\n• hola - Saludo\n• hora - Ver hora actual\n• ayuda - Este menú',
    'help': '📋 *Comandos disponibles:*\n\n• test - Probar bot\n• hola - Saludo\n• hora - Ver hora actual\n• ayuda - Este menú',
    'menu': '📋 *Comandos disponibles:*\n\n• test - Probar bot\n• hola - Saludo\n• hora - Ver hora actual\n• ayuda - Este menú'
}

// Función para obtener hora
const getHora = () => {
    const ahora = new Date()
    return ahora.toLocaleString('es-PE', {
        timeZone: 'America/Lima',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

// Webhook de Twilio
app.post('/twilio-hook', (req, res) => {
    const { Body, From, To } = req.body
    const mensaje = (Body || '').toLowerCase().trim()
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📨 MENSAJE RECIBIDO')
    console.log('🕐 Hora:', new Date().toLocaleString('es-PE'))
    console.log('📱 De:', From)
    console.log('📝 Mensaje:', Body)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Crear respuesta TwiML
    const twiml = new twilio.twiml.MessagingResponse()
    
    // Procesar comandos
    if (mensaje === 'hora' || mensaje === 'tiempo') {
        twiml.message(`⏰ Hora actual:\n\n🕐 ${getHora()}`)
    } else if (commands[mensaje]) {
        twiml.message(commands[mensaje])
    } else {
        // Respuesta por defecto (echo)
        twiml.message(`✅ Mensaje recibido\n\nEscribiste: "${Body}"\n\nEscribe "ayuda" para ver los comandos.`)
    }
    
    console.log('✅ Respuesta enviada\n')
    
    // IMPORTANTE: Enviar con Content-Type correcto
    res.type('text/xml')
    res.send(twiml.toString())
})

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('🤖 Bot Twilio funcionando correctamente')
})

// Iniciar servidor
const PORT = 3000
app.listen(PORT, '0.0.0.0', () => {
    console.log('\n🤖 BOT TWILIO ACTIVO')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📞 Puerto:', PORT)
    console.log('🌐 IP: 54.90.168.254')
    console.log('🔗 Webhook: /twilio-hook')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n💬 Envía "test" para probar\n')
})