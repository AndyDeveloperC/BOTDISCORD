require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
    ],
});

client.on('ready', async () => {
    console.log(`✅ Bot conectado correctamente como: ${client.user.tag}`);
    const guild = client.guilds.cache.find(g => g.name === 'Six7');
    
    if (!guild) {
        console.error('El bot no esta en ningun servidor.');
        process.exit(1);
    }

    console.log(`⏳ Configurando el servidor: ${guild.name}...`);

    try {
        let clienteRole = guild.roles.cache.find(r => r.name === 'Cliente Complex');
        if (!clienteRole) {
            clienteRole = await guild.roles.create({
                name: 'Cliente Complex',
                color: '#FF0000',
                reason: 'Rol VIP para compradores del panel',
            });
            console.log('Rol "Cliente Complex" creado.');
        }

        const createSection = async (categoryName, textChannels, voiceChannels = []) => {
            const category = await guild.channels.create({
                name: categoryName,
                type: ChannelType.GuildCategory,
            });

            for (const ch of textChannels) {
                await guild.channels.create({
                    name: ch,
                    type: ChannelType.GuildText,
                    parent: category.id,
                });
            }

            for (const ch of voiceChannels) {
                await guild.channels.create({
                    name: ch,
                    type: ChannelType.GuildVoice,
                    parent: category.id,
                });
            }
            console.log(`Categoria "${categoryName}" creada con exito.`);
        };

        await createSection('🌐 HUB', ['👋・bienvenida', '🛫・despedida']);
        await createSection('🎄 MAIN', ['📢・news', '💬・chat-general', '🛒・compra-aqui', '🎉・sorteos']);
        await createSection('💎 TIENDA', ['🔥・complex', '📊・status', '🎥・showcase']);
        await createSection('🤝 REFERENCIA Y SOPORTE', ['✅・referencias', '🎫・ticket-support'], ['🔊・Soporte 1', '🔊・Soporte 2']);
        await createSection('🛡️ POLITICAS Y SEGURIDAD', ['📜・reglas', '⚖️・politicas']);

        const privateCategory = await guild.channels.create({
            name: '\\ Complex Setup',
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: clienteRole.id,
                    allow: [PermissionsBitField.Flags.ViewChannel],
                }
            ],
        });

        const privateChannels = ['📢・updates-complexity', '🔐・setup-complex'];
        for (const ch of privateChannels) {
            await guild.channels.create({
                name: ch,
                type: ChannelType.GuildText,
                parent: privateCategory.id,
            });
        }
        console.log('Categoria privada "\\ Complex Setup" creada con exito.');

        console.log('✅ ¡Mision cumplida! El servidor ha sido configurado.');
        process.exit(0);

    } catch (error) {
        console.error('Error durante la creacion:', error);
        process.exit(1);
    }
});

client.login(process.env.DISCORD_TOKEN);
