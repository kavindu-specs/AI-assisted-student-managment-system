require('dotenv').config();
const { sequelize, UserAccount, AdminUser, Role } = require('../src/models');
const { hash } = require('../src/utils/password');
const { ROLES, USER_ACCOUNT_STATUS } = require('../src/config/constants');

async function run() {
  const [institutionalEmail, staffNo, designation, password] = process.argv.slice(2);

  if (!institutionalEmail || !staffNo || !password) {
    console.error('Usage: node scripts/createAdmin.js <institutionalEmail> <staffNo> <designation> <password>');
    process.exit(1);
  }

  await sequelize.authenticate();

  const existing = await UserAccount.findOne({ where: { email: institutionalEmail } });
  if (existing) {
    console.error(`A user account with email ${institutionalEmail} already exists.`);
    process.exit(1);
  }

  const account = await sequelize.transaction(async (t) => {
    const created = await UserAccount.create({
      username: staffNo,
      email: institutionalEmail,
      password_hash: await hash(password),
      status: USER_ACCOUNT_STATUS.ACTIVE,
    }, { transaction: t });

    await AdminUser.create({
      admin_id: created.user_id,
      institutional_email: institutionalEmail,
      staff_no: staffNo,
      designation: designation || null,
    }, { transaction: t });

    const [adminRole] = await Role.findOrCreate({
      where: { role_name: ROLES.ADMIN },
      defaults: { role_name: ROLES.ADMIN, description: 'University administration staff' },
      transaction: t,
    });
    await created.addRole(adminRole, { transaction: t });

    return created;
  });

  console.log(`Admin account created: ${account.email} (user_id ${account.user_id})`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Failed to create admin:', err.message);
  process.exit(1);
});
