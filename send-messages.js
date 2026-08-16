require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

const textReglas = `**🌟 BIENVENIDO A LA COMUNIDAD - REGLAS DEL SERVIDOR 🌟**

Para mantener el orden y ofrecer el mejor servicio posible, te pedimos que leas y respetes las siguientes normas. El desconocimiento de las mismas no exime de sancion.

**1️⃣ ｜ Respeto Mutuo**
Manten un ambiente toxico fuera de aqui. Cero insultos, discriminacion o faltas de respeto hacia otros miembros o hacia el equipo de Staff.

**2️⃣ ｜ Cero Spam o Publicidad**
Esta estrictamente prohibido promocionar otros servidores, paneles, tiendas o enviar links maliciosos. (Sancion: Ban inmediato).

**3️⃣ ｜ Uso Correcto de Canales**
Utiliza cada canal para lo que fue creado. Si necesitas soporte o tienes un problema con tu compra, **NO** lo escribas en el chat general. Abre un ticket en el canal correspondiente.

**4️⃣ ｜ No etiquetar al Staff sin motivo (No Ping)**
No menciones a los Administradores o Soporte a menos que sea una emergencia extrema en tu ticket. Atendemos todos los casos por orden de llegada.

**5️⃣ ｜ Privacidad y Seguridad**
Prohibido compartir informacion personal (doxxing) tuya o de terceros. No envies ni descargues archivos sospechosos en el chat general.

✅ *Al permanecer en este servidor, aceptas cumplir con estas reglas.*`;

const textPoliticas = `**🛡️ POLITICAS DE COMPRA Y SERVICIO TERMINOS Y CONDICIONES 🛡️**

Antes de adquirir nuestro Panel Complex, debes estar de acuerdo con las siguientes politicas:

**🚫 ｜ 1. Politica de Cero Reembolsos (No Refunds)**
Al tratarse de un producto digital (Software/Key), **TODAS LAS VENTAS SON FINALES**. Una vez entregada la licencia, no se realizaran reembolsos bajo ninguna circunstancia (incluyendo si tu PC no es compatible, si te arrepientes, o si el juego se actualiza).

**🔑 ｜ 2. Licencias Personales**
Las llaves (Keys) son unicas e intransferibles. Esta prohibido compartir tu key con otra persona o intentar usarla en multiples computadoras. Nuestro sistema bloqueara automaticamente la cuenta sin derecho a reclamo.

**⚠️ ｜ 3. Responsabilidad del Usuario**
El uso de cualquier herramienta de terceros conlleva riesgos. Nosotros trabajamos arduamente para mantener el Panel seguro e indetectable, pero **tu eres el unico responsable** del uso que le des a tu cuenta. No nos hacemos responsables por baneos o suspensiones.

**🔄 ｜ 4. Actualizaciones y Mantenimiento (Downtime)**
Los juegos se actualizan constantemente. Cuando esto ocurre, nuestro panel puede entrar en fase de "Mantenimiento" por seguridad. Ese tiempo de espera no se puede predecir pero aseguramos reponerlo.

✅ *La compra de cualquiera de nuestros productos implica la aceptacion total de estos terminos.*`;

const textComplex = `**💎 COMPLEX PANEL - EL MEJOR RENDIMIENTO 💎**

Eleva tu nivel de juego con **Complex**. Maxima seguridad, optimizacion impecable y funciones premium. Unete a la elite hoy mismo.

🛠️ **Caracteristicas Principales:**
> 🎯 *Aimbot Preciso (Smooth & Safe)*
> 👁️ *ESP Completo (Players, Loot, etc)*
> 🛡️ *Bypass Integrado (Maxima Seguridad)*
> ⚙️ *Facil instalacion y configuracion*
> 💻 *Soporte garantizado 24/7*

🛒 **LISTA DE PRECIOS OFICIALES:**

🥉 **Pase de 7 Dias**
💵 Precio: **$8.00 USD**
> *Ideal para probar el panel y sentir la diferencia.*

🥈 **Pase de 1 Mes (30 Dias)**
💵 Precio: **$15.00 USD** *(🔥 Mejor valor)*
> *Domina toda la temporada sin interrupciones.*

🥇 **Pase PERMANENTE (Lifetime)**
💵 Precio: **$50.00 USD**
> *Pago unico. Actualizaciones gratis de por vida.*

💳 **METODOS DE PAGO ACEPTADOS:**
(PayPal, Binance, Criptomonedas, etc)

👇 **¿COMO COMPRAR?** 👇
Dirigete al canal de compras y abre un ticket. Un administrador te atendera de inmediato para entregarte tu licencia.`;

client.on('ready', async () => {
    console.log(`✅ Bot conectado para enviar mensajes como: ${client.user.tag}`);
    const guild = client.guilds.cache.find(g => g.name === 'Six7');
    
    if (!guild) {
        console.error('No se encontro el servidor Six7.');
        process.exit(1);
    }

    console.log(`⏳ Buscando canales en: ${guild.name}...`);

    try {
        const channels = await guild.channels.fetch();
        
        const chReglas = channels.find(c => c.name === '📜・reglas');
        if (chReglas) {
            await chReglas.send(textReglas);
            console.log('Mensaje enviado a reglas');
        }

        const chPoliticas = channels.find(c => c.name === '⚖️・politicas');
        if (chPoliticas) {
            await chPoliticas.send(textPoliticas);
            console.log('Mensaje enviado a politicas');
        }

        const chComplex = channels.find(c => c.name === '🔥・complex');
        if (chComplex) {
            await chComplex.send(textComplex);
            console.log('Mensaje enviado a complex');
        }

        console.log('✅ Mensajes enviados con exito.');
        process.exit(0);

    } catch (error) {
        console.error('Error enviando mensajes:', error);
        process.exit(1);
    }
});

client.login(process.env.DISCORD_TOKEN);
