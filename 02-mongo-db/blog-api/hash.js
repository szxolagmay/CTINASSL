import bcrypt from "bcryptjs";

const password = "mypassword";
const hashedPassword = await bcrypt.hash(password, 10);

console.log(hashedPassword);
