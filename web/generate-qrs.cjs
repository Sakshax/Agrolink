const QRCode = require('qrcode');

const run = async () => {
    await QRCode.toFile('Lonavala_Checkpoint.png', 'https://agrolink.app/track/TRK-900A/checkpoint/1');
    console.log("Saved Lonavala_Checkpoint.png");
    
    await QRCode.toFile('Panvel_Checkpoint.png', 'https://agrolink.app/track/TRK-900A/checkpoint/2');
    console.log("Saved Panvel_Checkpoint.png");
};

run();
