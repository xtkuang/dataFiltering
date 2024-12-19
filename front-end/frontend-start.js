const { exec } = require('child_process');

// 执行 npm run start
const process = exec('npm run start', { cwd: __dirname });

process.stdout.on('data', (data) => {
  console.log(`[stdout] ${data}`);
});

process.stderr.on('data', (data) => {
  console.error(`[stderr] ${data}`);
});

process.on('close', (code) => {
  console.log(`Process exited with code: ${code}`);
});
