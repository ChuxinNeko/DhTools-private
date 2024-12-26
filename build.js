const { exec } = require('child_process');
const gradient = require('gradient-string');


const startTime = new Date();

console.log(gradient.retro('✨✨Starting production build...'));

const buildProcess = exec('vite build --mode production', (error, stdout, stderr) => {
  if (error) {
    console.error(gradient.passion(`❌ 构建失败: ${stderr}`));
    process.exit(1);
  }

  const endTime = new Date();
  const buildTime = ((endTime - startTime) / 1000).toFixed(2);
  const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

  console.log(stdout);
  console.log(gradient.retro(`
✨ 构建成功！
🕒 构建用时：${buildTime} 秒
💾 内存占用：${memoryUsage} MB
  `));
  process.exit(0);
});

buildProcess.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

buildProcess.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

buildProcess.on('close', (code) => {
  console.log(`Child process exited with code ${code}`);
});
