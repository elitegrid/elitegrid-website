const { spawn, execSync } = require('child_process');
const path = require('path');

const workspaceDir = path.resolve(__dirname, '..');
const currentPid = process.pid;

function checkProcessOpenFiles(pid) {
  try {
    const output = execSync(`lsof -p ${pid} 2>/dev/null`).toString();
    return output.includes(workspaceDir);
  } catch (err) {
    return false;
  }
}

function killLeftoverProcesses() {
  console.log('[Dev Wrapper] Checking for leftover Next.js or PostCSS processes...');
  try {
    const output = execSync('ps -ef').toString();
    const lines = output.split('\n');
    let killCount = 0;

    for (const line of lines) {
      if (!line.trim()) continue;
      // ps -ef output format: UID PID PPID C STIME TTY TIME CMD
      const parts = line.trim().split(/\s+/);
      if (parts.length < 8) continue;

      const pid = parseInt(parts[1], 10);
      const cmd = parts.slice(7).join(' ');

      if (pid === currentPid || pid === process.ppid) continue;

      // Identify processes associated with this project
      const isPostCSS = cmd.includes('next/dev/build/postcss.js');
      const isProjectProcess = cmd.includes(workspaceDir) && (
        cmd.includes('next') || 
        cmd.includes('postcss') || 
        cmd.includes('.next')
      );
      const isNextServerOrWorker = cmd.includes('next-server') || cmd.includes('next-router-worker');

      if (isPostCSS || isProjectProcess || (isNextServerOrWorker && checkProcessOpenFiles(pid))) {
        console.log(`[Dev Wrapper] Killing leftover process ${pid}: ${cmd}`);
        try {
          process.kill(pid, 'SIGKILL');
          killCount++;
        } catch (err) {
          // Ignore if process already died
        }
      }
    }
    if (killCount > 0) {
      console.log(`[Dev Wrapper] Successfully terminated ${killCount} leftover process(es).`);
    } else {
      console.log('[Dev Wrapper] No leftover processes found.');
    }
  } catch (err) {
    console.error('[Dev Wrapper] Error checking/killing leftover processes:', err.message);
  }
}

// 1. Clean up any leftover processes before starting
killLeftoverProcesses();

// 2. Start Next.js dev server (shares process group with wrapper)
console.log('[Dev Wrapper] Starting Next.js dev server...');
const child = spawn('npx', ['next', 'dev'], {
  cwd: workspaceDir,
  stdio: 'inherit'
});

let childKilled = false;
function killChild(signal) {
  if (childKilled) return;
  childKilled = true;
  if (child && child.pid) {
    try {
      console.log(`\n[Dev Wrapper] Stopping dev server (PID: ${child.pid}) via ${signal}...`);
      child.kill('SIGINT');
      
      const killTimer = setTimeout(() => {
        try {
          child.kill('SIGKILL');
        } catch (e) {}
      }, 2000);
      
      if (killTimer.unref) {
        killTimer.unref();
      }
    } catch (err) {
      // Already dead
    }
  }
}

// Listen for termination signals to clean up
process.on('SIGINT', () => {
  killChild('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  killChild('SIGTERM');
  process.exit(0);
});

process.on('exit', () => {
  killChild('exit');
});

child.on('exit', (code, signal) => {
  console.log(`[Dev Wrapper] Next.js dev server exited with code ${code} and signal ${signal}`);
  process.exit(code || 0);
});
