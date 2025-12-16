const fs = require('fs')
const path = require('path')

/**
 * Clase para normalizar números de WhatsApp y resolver IDs
 */
class NumberNormalizer {
    constructor() {
        this.manualMapPath = path.join(__dirname, 'jid_manual.json')
        this.manualMap = this.loadManualMap()
    }

    /**
     * Carga el archivo jid_manual.json con las asociaciones ID -> Número
     */
    loadManualMap() {
        try {
            if (fs.existsSync(this.manualMapPath)) {
                const data = fs.readFileSync(this.manualMapPath, 'utf8')
                return JSON.parse(data)
            }
            console.warn('⚠️ Archivo jid_manual.json no encontrado')
            return {}
        } catch (error) {
            console.error('❌ Error al cargar jid_manual.json:', error)
            return {}
        }
    }

    /**
     * Recarga el mapa manual (útil si el archivo se actualiza)
     */
    reloadManualMap() {
        this.manualMap = this.loadManualMap()
    }

    /**
     * Verifica si un número es válido (cumple con el formato esperado)
     * @param {string} numero - Número limpio (sin @s.whatsapp.net)
     * @returns {boolean}
     */
    isValidNumber(numero) {
        // Debe empezar con "51"
        if (!numero.startsWith('51')) return false
        
        // Debe tener exactamente 11 dígitos
        if (numero.length !== 11) return false
        
        // El tercer dígito debe ser "9"
        if (numero[2] !== '9') return false
        
        return true
    }

    /**
     * Limpia el número/ID removiendo sufijos de WhatsApp
     * @param {string} from - Número o ID original (puede incluir @s.whatsapp.net o @g.us)
     * @returns {string}
     */
    cleanNumber(from) {
        if (!from) return ''
        return from.replace('@s.whatsapp.net', '').replace('@g.us', '').trim()
    }

    /**
     * Normaliza un número o ID, devolviendo el número real
     * @param {string} from - Número o ID a normalizar
     * @returns {string|null} - Número real o null si no se puede resolver
     */
    normalize(from) {
        if (!from) {
            console.warn('⚠️ Número/ID vacío recibido')
            return null
        }

        // Paso 1: Limpiar el número
        const cleaned = this.cleanNumber(from)
        
        // Paso 2: Verificar si es un número válido
        if (this.isValidNumber(cleaned)) {
            console.log(`✅ Número válido detectado: ${cleaned}`)
            return cleaned
        }

        // Paso 3: Si no es válido, es un ID - buscar en el mapa manual
        console.log(`🔍 ID detectado: ${cleaned}`)
        
        if (this.manualMap[cleaned]) {
            const realNumber = this.manualMap[cleaned]
            console.log(`✅ ID resuelto: ${cleaned} -> ${realNumber}`)
            return realNumber
        }

        // Paso 4: ID no encontrado en el mapa
        console.error(`❌ ID no encontrado en jid_manual.json: ${cleaned}`)
        console.log(`💡 Sugerencia: Agrega esta línea a jid_manual.json:`)
        console.log(`   "${cleaned}": "51XXXXXXXXX"`)
        
        return null
    }

    /**
     * Agrega o actualiza una asociación ID -> Número en el archivo
     * @param {string} id - ID a mapear
     * @param {string} numero - Número real asociado
     */
    addMapping(id, numero) {
        const cleanId = this.cleanNumber(id)
        const cleanNumero = this.cleanNumber(numero)

        if (!this.isValidNumber(cleanNumero)) {
            console.error(`❌ El número ${cleanNumero} no es válido`)
            return false
        }

        this.manualMap[cleanId] = cleanNumero

        try {
            fs.writeFileSync(
                this.manualMapPath,
                JSON.stringify(this.manualMap, null, 2),
                'utf8'
            )
            console.log(`✅ Mapeo agregado: ${cleanId} -> ${cleanNumero}`)
            return true
        } catch (error) {
            console.error('❌ Error al guardar jid_manual.json:', error)
            return false
        }
    }

    /**
     * Obtiene estadísticas del mapa de IDs
     */
    getStats() {
        return {
            totalMappings: Object.keys(this.manualMap).length,
            mappings: this.manualMap
        }
    }
}

// Exportar una instancia única (singleton)
module.exports = new NumberNormalizer()