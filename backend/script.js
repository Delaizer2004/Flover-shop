const bcrypt = require('bcrypt');

(async () => {
  const plain = 'admin';
  const saltRounds = 10;
  const hash = await bcrypt.hash(plain, saltRounds);
  console.log(hash);
})();
