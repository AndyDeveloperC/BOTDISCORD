require('dotenv').config();
const http = require('http');
const { Client, Events, GatewayIntentBits, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const WELCOME_CHANNEL_ID = '1523561895024398437';
const FAREWELL_CHANNEL_ID = '1523561896224231465';
const RULES_CHANNEL_ID = '1523518789927567430';

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
        GatewayIntentBits.GuildMembers,
    ],
});

client.once(Events.ClientReady, () => {
    console.log('===================================================');
    console.log(`✅ Bot conectado correctamente como: ${client.user.tag} (ID: ${client.user.id})`);
    console.log('✅ El bot de TICKETS esta funcionando 24/7 en segundo plano.');
    console.log('===================================================');
});

// BIENVENIDAS Y DESPEDIDAS
client.on(Events.GuildMemberAdd, async member => {
    try {
        const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID);
        if (!channel?.isTextBased()) {
            console.error(`❌ Canal de bienvenidas no disponible: ${WELCOME_CHANNEL_ID}`);
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('👋 ¡Bienvenido/a a Six7!')
            .setDescription(`Hola ${member}, esperamos que disfrutes de la comunidad.\n\nLee las reglas en <#${RULES_CHANNEL_ID}> para comenzar.`)
            .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
            .addFields({ name: '👥 Miembro', value: `Eres el miembro **#${member.guild.memberCount}**`, inline: true })
            .setFooter({ text: 'Six7 • Gracias por unirte' })
            .setTimestamp();

        await channel.send({ content: `¡Bienvenido/a, ${member}!`, embeds: [embed] });
        console.log(`✅ Bienvenida enviada para ${member.user.tag}`);
    } catch (error) {
        console.error('❌ Error al enviar la bienvenida:', error);
    }
});

client.on(Events.GuildMemberRemove, async member => {
    try {
        const channel = await member.guild.channels.fetch(FAREWELL_CHANNEL_ID);
        if (!channel?.isTextBased()) {
            console.error(`❌ Canal de despedidas no disponible: ${FAREWELL_CHANNEL_ID}`);
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('👋 Un miembro se ha despedido')
            .setDescription(`**${member.user.tag}** ha salido del servidor.\n\nEsperamos volver a verte pronto.`)
            .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
            .addFields({ name: '👥 Miembros actuales', value: `**${member.guild.memberCount}**`, inline: true })
            .setFooter({ text: 'Six7 • Hasta pronto' })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        console.log(`✅ Despedida enviada para ${member.user.tag}`);
    } catch (error) {
        console.error('❌ Error al enviar la despedida:', error);
    }
});

// ESCUCHA DE BOTONES Y MENUS (CREACION DE TICKETS)
client.on(Events.InteractionCreate, async interaction => {
    console.log(`📥 Interacción recibida: ${interaction.customId || interaction.type} de ${interaction.user?.tag || interaction.user?.id || 'usuario desconocido'}`);

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
