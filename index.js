const { exec } = require('child_process');

exec('node Farm.js', (err, stdout, stderr) => {
    if (err) {
        console.error(`Lỗi khi chạy Farm.js: ${err}`);
        return;
    }
    console.log(`Farm.js đã kết thúc: ${stdout}`);
});

exec('node Exp.js', (err, stdout, stderr) => {
    if (err) {
        console.error(`Lỗi khi chạy Exp.js: ${err}`);
        return;
    }
    console.log(`Exp.js đã kết thúc: ${stdout}`);
});
