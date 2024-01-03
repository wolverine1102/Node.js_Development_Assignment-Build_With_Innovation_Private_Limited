const AccessControl = require('accesscontrol');

const ac = new AccessControl();

ac.grant('user')
    .readOwn('profile')
    .updateOwn('profile')
    .deleteOwn('profile')

ac.grant('admin')
    .extend('user')
    .createAny('profile')
    .readAny('profile')
    .updateAny('profile')
    .deleteAny('profile');

module.exports = ac;