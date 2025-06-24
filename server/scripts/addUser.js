import bcrypt from 'bcryptjs';
bcrypt.hash('admin', 10).then(console.log);