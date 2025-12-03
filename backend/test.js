const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function diagnose() {
  const host = 'db.telpmehelxuwcgmofpss.supabase.co';
  
  console.log('=== Supabase 连接诊断 ===\n');
  
  try {
    // 测试 DNS 解析
    console.log('1. 测试 DNS 解析...');
    const { stdout: dnsOutput } = await execPromise(`nslookup ${host}`);
    console.log(dnsOutput);
    
    // 测试端口连接
    console.log('2. 测试端口 5432...');
    try {
      await execPromise(`timeout 3 nc -zv ${host} 5432 2>&1 || echo "端口连接失败"`);
    } catch (e) {
      console.log('端口 5432 无法连接');
    }
    
    // 测试端口 6543 (pgbouncer)
    console.log('3. 测试端口 6543...');
    try {
      await execPromise(`timeout 3 nc -zv ${host} 6543 2>&1 || echo "端口连接失败"`);
    } catch (e) {
      console.log('端口 6543 无法连接');
    }
    
  } catch (error) {
    console.error('诊断出错:', error.message);
  }
}

diagnose();