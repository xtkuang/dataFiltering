import mssql from 'mssql'
const config = {
  user: 'sa',
  password: 'hzkd@123',
  server: '10.6.0.6', // 服务器地址或 IP 地址
  database: '',
  options: {
    encrypt: true, // 如果是 Azure，则为 true；对于本地实例，通常为 false
    trustServerCertificate: true, // 对于本地开发环境，避免 SSL 错误
  },
}

async function testConnection() {
  try {
    let pool = await mssql.connect(config)
    console.log('Connected to database')
    await pool.close()
  } catch (err) {
    console.error('Database connection failed', err)
  }
}
testConnection()
