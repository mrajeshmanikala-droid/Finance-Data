import fs from 'fs';

const files = [
  'src/server.js',
  'src/middlewares/validate.js',
  'src/models/RefreshToken.js',
  'src/models/FinancialRecord.js',
  'src/middlewares/errorHandler.js',
  'src/middlewares/auth.js',
  'src/features/users/users.service.js',
  'src/features/records/records.routes.js',
  'src/features/auth/auth.service.js',
  'src/features/dashboard/dashboard.routes.js',
  'src/app.js'
];

for (const file of files) {
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  let newLines = [];
  
  for (let line of lines) {
    // Ignore lines that just contain http:// or https:// (urls)
    if (line.includes('//') && !line.includes('http://') && !line.includes('https://')) {
      // If it's a completely commented line, skip adding it
      if (line.trim().startsWith('//')) {
        continue;
      }
      
      // If it has a trailing comment, split it out
      if (line.includes(' // ')) {
        newLines.push(line.split(' // ')[0].trimEnd());
        continue;
      }
    }
    newLines.push(line);
  }
  
  fs.writeFileSync(file, newLines.join('\n'));
}

console.log('Cleanup complete');
