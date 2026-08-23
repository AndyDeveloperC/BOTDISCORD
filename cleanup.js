require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.on('ready', async () => {
    console.log(`✅ Bot conectado para limpieza como: ${client.user.tag}`);
    const guild = client.guilds.cache.find(g => g.name === 'AndySxntDev');
    
    if (!guild) {
        console.error('No se encontro el servidor AndySxntDev.');
        process.exit(1);
    }

    console.log(`⏳ Limpiando el servidor: ${guild.name}...`);

    try {
        const namesToDelete = [
            '🌐 HUB', '👋・bienvenida', '🛫・despedida',
            '🎄 MAIN', '📢・news', '💬・chat-general', '🛒・compra-aqui', '🎉・sorteos',
            '💎 TIENDA', '🔥・complex', '📊・status', '🎥・showcase',
            '🤝 REFERENCIA Y SOPORTE', '✅・referencias', '🎫・ticket-support', '🔊・Soporte 1', '🔊・Soporte 2',
            '🛡️ POLITICAS Y SEGURIDAD', '📜・reglas', '⚖️・politicas',
            '\\ Complex Setup', '📢・updates-complexity', '🔐・setup-complex'
        ];

        const channels = await guild.channels.fetch();
        for (const [id, channel] of channels) {
            if (namesToDelete.includes(channel.name)) {
                await channel.delete().catch(e => console.error(`No se pudo borrar ${channel.name}: ${e.message}`));
                console.log(`Canal/Categoria eliminada: ${channel.name}`);
            }
        }

        const roles = await guild.roles.fetch();
        const role = roles.find(r => r.name === 'Cliente Complex');
        if (role) {
            await role.delete().catch(e => console.error(`No se pudo borrar rol: ${e.message}`));
            console.log('Rol "Cliente Complex" eliminado.');
        }

        console.log('✅ Limpieza completada en AndySxntDev.');
        process.exit(0);

    } catch (error) {
        console.error('Error durante la limpieza:', error);
        process.exit(1);
    }
});

client.login(process.env.DISCORD_TOKEN);
