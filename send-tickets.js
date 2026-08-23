require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

const PURCHASE_CHANNEL_ID = '1523561899428544595';

client.on('ready', async () => {
    console.log(`✅ Bot conectado como: ${client.user.tag}`);
    const guild = client.guilds.cache.find(g => g.name === 'Six7');
    
    if (!guild) {
        console.error('No se encontro el servidor Six7.');
        process.exit(1);
    }

    try {
        const channels = await guild.channels.fetch();
        const chCompra = channels.get(PURCHASE_CHANNEL_ID);
        const chSoporte = channels.find(c => c.name === '🎫・ticket-support');

        if (!chCompra) {
            throw new Error(`No se encontró o no se puede acceder al canal de compras ${PURCHASE_CHANNEL_ID}.`);
        }

        {
            const rowCompra = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_compra')
                        .setPlaceholder('🛒 Selecciona el paquete que deseas comprar')
                        .addOptions([
                            { label: 'Bypass Global', value: 'compra_bypass_global', emoji: '🌐' },
                            { label: 'Bypass UID', value: 'compra_bypass_uid', emoji: '🆔' },
                            { label: 'Panel Básico', value: 'compra_panel_basico', emoji: '🟢' },
                            { label: 'Panel Complex', value: 'compra_panel_complex', emoji: '🔥' },
                            { label: 'FiveM External', value: 'compra_fivem_external', emoji: '🎮' },
                            { label: 'FiveM Bypass', value: 'compra_fivem_bypass', emoji: '🛡️' },
                        ]),
                );

            await chCompra.send({
                content: '**🛒 | CENTRO DE COMPRAS COMPLEX**\n\nPor favor, selecciona en el menú de abajo el paquete que deseas adquirir. Esto abrirá un ticket privado con los administradores para concretar tu pago.',
                components: [rowCompra]
            });
            console.log('Panel de compra enviado.');
        }

        if (chSoporte && process.env.ONLY_PURCHASE !== '1') {
            const rowSoporte = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('soporte_instalacion').setLabel('Soporte de Instalación').setStyle(ButtonStyle.Primary).setEmoji('⚙️'),
                    new ButtonBuilder().setCustomId('soporte_problemas').setLabel('Soporte de Problemas').setStyle(ButtonStyle.Danger).setEmoji('⚠️')
                );

            await chSoporte.send({
                content: '**🎫 | CENTRO DE SOPORTE TÉCNICO**\n\nSi necesitas ayuda para instalar tu panel o estás experimentando algún error, abre un ticket aquí abajo.',
                components: [rowSoporte]
            });
            console.log('Panel de soporte enviado.');
        }

        console.log('✅ Paneles enviados con exito.');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
});

const rawToken = process.env.DISCORD_TOKEN;
const token = rawToken ? rawToken.trim().replace(/^["']|["']$/g, '') : null;
client.login(token);
