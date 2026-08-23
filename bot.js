require('dotenv').config();
const http = require('http');
const { Client, GatewayIntentBits, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Servidor HTTP simple para que Railway mantenga el contenedor encendido (Health Check)
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('🤖 Bot de Tickets para Discord activo 24/7 en Railway');
}).listen(PORT, () => {
    console.log(`🌐 Servidor HTTP para Railway escuchando en el puerto ${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
    ],
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

    const cleanUsername = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (interaction.customId === 'select_compra') {
        ticketType = `compra-${cleanUsername || interaction.user.id}`;
        categoryName = '🎄 MAIN'; 
        
        const valor = interaction.values[0];
        if (valor === 'compra_7dias') reason = 'Pase de 7 Días ($8)';
        if (valor === 'compra_1mes') reason = 'Pase de 1 Mes ($15)';
        if (valor === 'compra_permanente') reason = 'Pase Permanente ($50)';
        if (valor === 'compra_personalizado') reason = 'Paquete Personalizado';
        
    } else if (interaction.customId === 'soporte_instalacion') {
        ticketType = `soporte-${cleanUsername || interaction.user.id}`;
        categoryName = '🤝 REFERENCIA Y SOPORTE';
        reason = 'Soporte de Instalación';
    } else if (interaction.customId === 'soporte_problemas') {
        ticketType = `soporte-${cleanUsername || interaction.user.id}`;
        categoryName = '🤝 REFERENCIA Y SOPORTE';
        reason = 'Problemas Técnicos';
    } else {
        return; 
    }

    // Responder inmediatamente a Discord para evitar el error "La aplicación no ha respondido a tiempo" (Límite de 3 segundos)
    try {
        await interaction.deferReply({ ephemeral: true });
    } catch (e) {
        console.error('Error al responder diferido:', e);
        return;
    }

    try {
        // Obtener canales actualizados para asegurar que la categoría existe en el caché
        const channels = await interaction.guild.channels.fetch();
        const category = channels.find(c => c.name === categoryName && c.type === ChannelType.GuildCategory);

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

        await interaction.editReply({ content: `✅ Tu ticket ha sido creado exitosamente: ${ticketChannel}` });

        const closeBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('🔒 Cerrar Ticket').setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({
            content: `¡Hola ${interaction.user}! 👋\n\nHas abierto un ticket por: **${reason}**.\nUn administrador te atenderá a la brevedad. Por favor, ten paciencia.`,
            components: [closeBtn]
        });

    } catch (error) {
        console.error('Error al crear ticket:', error);
        await interaction.editReply({ content: '❌ Hubo un error al crear tu ticket. Asegúrate de que el bot tiene permisos de administrador en el servidor.' });
    }
});

const rawToken = process.env.DISCORD_TOKEN;
const token = rawToken ? rawToken.trim().replace(/^["']|["']$/g, '') : null;

if (!token) {
    console.error('❌ ERROR CRÍTICO: La variable de entorno DISCORD_TOKEN no está configurada o está vacía en Railway.');
    console.error('Por favor, agrega la variable DISCORD_TOKEN en la pestaña "Variables" de tu servicio en Railway.');
    process.exit(1);
}

client.login(token).catch(err => {
    console.error('❌ Error al iniciar sesión en Discord. Verifica que el DISCORD_TOKEN sea válido:', err.message);
});
