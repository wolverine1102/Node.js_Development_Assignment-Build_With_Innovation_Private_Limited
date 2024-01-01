const Role = require('../models/role');

const rolesData = [
    { name: 'Admin', permissions: ['user:manage', 'role:manage'] },
    { name: 'User', permissions: ['profile:read', 'profile:edit', 'profile:delete'] },
];

const seedRoles = async () => {
    try {
        await Role.deleteMany(); // Remove existing roles
        await Role.insertMany(rolesData); // Insert seed data
        console.log('Roles seeded successfully');
    } catch (error) {
        console.error('Error seeding roles:', error);
    }
};

seedRoles();