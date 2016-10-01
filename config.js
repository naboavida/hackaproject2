// Copy this file into a config.js
// And use your own database values
//exports.conString = "postgres://postgres:test@localhost/demo";
// exports.conString = 'postgres://yoqlbveohnosxt:pIoxIwxxhRMrpkBZ32dP7xzRvI@ec2-54-221-206-165.compute-1.amazonaws.com:5432/devrbvm2odkqdb';
exports.conString = process.env.DATABASE_URL;