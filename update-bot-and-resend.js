require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const rawToken = process.env.DISCORD_TOKEN;
const token = rawToken ? rawToken.trim().replace(/^["']|["']$/g, '') : null;

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const PURCHASE_CHANNEL_ID = '1523561899428544595';

client.on('ready', async () => {
    console.log(`✅ Bot conectado como: ${client.user.tag}`);

    // Intentar cambiar el nombre de usuario global del bot a Six7Bot
    try {
        await client.user.setUsername('Six7Bot');
        console.log('✅ Nombre del bot cambiado exitosamente a Six7Bot');
    } catch (e) {
        console.log('ℹ️ Nota sobre el nombre de usuario:', e.message);
    }

    const guild = client.guilds.cache.find(g => g.name === 'Six7');
    if (!guild) {
        console.error('❌ No se encontró el servidor "Six7". Asegúrate de que el bot esté en ese servidor.');
        process.exit(1);
    }

    // Intentar cambiar el apodo en el servidor Six7 por si el nombre global falla por limite de tasa
    try {
        await guild.members.me.setNickname('Six7Bot');
        console.log('✅ Apodo en el servidor Six7 cambiado a Six7Bot.');
    } catch (e) {
        console.log('ℹ️ No se pudo cambiar el apodo local:', e.message);
    }

    try {
        const channels = await guild.channels.fetch();
        const chCompra = channels.get(PURCHASE_CHANNEL_ID);
        const chSoporte = channels.find(c => c.name === '🎫・ticket-support');

        if (!chCompra) {
            throw new Error(`No se encontró o no se puede acceder al canal de compras ${PURCHASE_CHANNEL_ID}.`);
        }

        {
            console.log('Limpiando mensajes antiguos en 🛒・compra-aqui...');
            try {
                const oldMsgs = await chCompra.messages.fetch({ limit: 20 });
                for (const msg of oldMsgs.values()) {
                    await msg.delete().catch(() => {});
                }
            } catch (e) {}

            const rowCompra = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_compra')
                        .setPlaceholder('🛒 Selecciona el paquete que deseas comprar')
                        .addOptions([
                            { label: 'Pase 7 Días ($8 USD)', value: 'compra_7dias', emoji: '🥉' },
                            { label: 'Pase 1 Mes ($15 USD)', value: 'compra_1mes', emoji: '🥈' },
                            { label: 'Pase Permanente ($50 USD)', value: 'compra_permanente', emoji: '🥇' },
                            { label: 'Paquete Personalizado', value: 'compra_personalizado', emoji: '💎' },
                        ]),
                );

            await chCompra.send({
                content: '**🛒 | CENTRO DE COMPRAS COMPLEX**\n\nPor favor, selecciona en el menú de abajo el paquete que deseas adquirir. Esto abrirá un ticket privado con los administradores para concretar tu pago.',
                components: [rowCompra]
            });
            console.log('✅ Nuevo panel de compra enviado.');
        }

        if (chSoporte) {
            console.log('Limpiando mensajes antiguos en 🎫・ticket-support...');
            try {
                const oldMsgs = await chSoporte.messages.fetch({ limit: 20 });
                for (const msg of oldMsgs.values()) {
                    await msg.delete().catch(() => {});
                }
            } catch (e) {}

            const rowSoporte = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('soporte_instalacion').setLabel('Soporte de Instalación').setStyle(ButtonStyle.Primary).setEmoji('⚙️'),
                    new ButtonBuilder().setCustomId('soporte_problemas').setLabel('Soporte de Problemas').setStyle(ButtonStyle.Danger).setEmoji('⚠️')
                );

            await chSoporte.send({
                content: '**🎫 | CENTRO DE SOPORTE TÉCNICO**\n\nSi necesitas ayuda para instalar tu panel o estás experimentando algún error, abre un ticket aquí abajo.',
                components: [rowSoporte]
            });
            console.log('✅ Nuevo panel de soporte enviado.');
        }

        console.log('🎉 ¡Proceso completado con éxito!');
        process.exit(0);

    } catch (error) {
        console.error('Error al actualizar y reenviar mensajes:', error);
        process.exit(1);
    }
});

client.login(token);
