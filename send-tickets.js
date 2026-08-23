require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.on('ready', async () => {
    console.log(`✅ Bot conectado como: ${client.user.tag}`);
    const guild = client.guilds.cache.find(g => g.name === 'Six7');
    
    if (!guild) {
        console.error('No se encontro el servidor Six7.');
        process.exit(1);
    }

    try {
        const channels = await guild.channels.fetch();
        const chCompra = channels.find(c => c.name === '🛒・compra-aqui');
        const chSoporte = channels.find(c => c.name === '🎫・ticket-support');

        if (chCompra) {
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
            console.log('Panel de compra enviado.');
        }

        if (chSoporte) {
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

client.login(process.env.DISCORD_TOKEN);
