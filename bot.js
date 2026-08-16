require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
    ], // MessageContent REMOVED so it doesn't crash
});

client.on('ready', () => {
    console.log('===================================================');
    console.log(`✅ Bot conectado correctamente como: ${client.user.tag}`);
    console.log('✅ El bot de TICKETS esta funcionando 24/7 en segundo plano.');
    console.log('===================================================');
});

// ESCUCHA DE BOTONES Y MENUS (CREACION DE TICKETS)
client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

    // Manejar el boton de CERRAR TICKET
    if (interaction.customId === 'close_ticket') {
        await interaction.reply('🔒 Cerrando este ticket en 5 segundos...');
        setTimeout(() => interaction.channel.delete().catch(e => console.error(e)), 5000);
        return;
    }

    let ticketType = '';
    let categoryName = '';
    let reason = '';

    if (interaction.customId === 'select_compra') {
        ticketType = `compra-${interaction.user.username}`;
        categoryName = '🎄 MAIN'; 
        
        const valor = interaction.values[0];
        if (valor === 'compra_7dias') reason = 'Pase de 7 Días ($8)';
        if (valor === 'compra_1mes') reason = 'Pase de 1 Mes ($15)';
        if (valor === 'compra_permanente') reason = 'Pase Permanente ($50)';
        if (valor === 'compra_personalizado') reason = 'Paquete Personalizado';
        
    } else if (interaction.customId === 'soporte_instalacion') {
        ticketType = `soporte-${interaction.user.username}`;
        categoryName = '🤝 REFERENCIA Y SOPORTE';
        reason = 'Soporte de Instalación';
    } else if (interaction.customId === 'soporte_problemas') {
        ticketType = `soporte-${interaction.user.username}`;
        categoryName = '🤝 REFERENCIA Y SOPORTE';
        reason = 'Problemas Técnicos';
    } else {
        return; 
    }

    // Obtener canales actualizados para asegurar que la categoría existe en el caché
    const channels = await interaction.guild.channels.fetch();
    const category = channels.find(c => c.name === categoryName && c.type === ChannelType.GuildCategory);
    
    try {
        const ticketChannel = await interaction.guild.channels.create({
            name: ticketType,
            type: ChannelType.GuildText,
            parent: category ? category.id : null,
            permissionOverwrites: [
                {
                    id: interaction.guild.id, 
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.user.id, 
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles],
                },
                {
                    id: client.user.id, 
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                }
            ],
        });

        await interaction.reply({ content: `✅ Tu ticket ha sido creado exitosamente: ${ticketChannel}`, ephemeral: true });

        const closeBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('🔒 Cerrar Ticket').setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({
            content: `¡Hola ${interaction.user}! 👋\n\nHas abierto un ticket por: **${reason}**.\nUn administrador te atenderá a la brevedad. Por favor, ten paciencia.`,
            components: [closeBtn]
        });

    } catch (error) {
        console.error('Error al crear ticket:', error);
        await interaction.reply({ content: '❌ Hubo un error al crear tu ticket. Asegurate de que el bot tiene permisos de administrador.', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);
