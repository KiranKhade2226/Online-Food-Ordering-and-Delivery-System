const ROLE_MAP = {
  customer: 'customer',
  owner: 'restaurantOwner',
  restaurantOwner: 'restaurantOwner',
  delivery: 'deliveryPartner',
  deliveryPartner: 'deliveryPartner',
  admin: 'admin',
};

const normalizeRole = (role) => ROLE_MAP[role] || role;

const normalizeUser = (user) => {
  if (!user) {
    return user;
  }

  const plainUser = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  plainUser.role = normalizeRole(plainUser.role);
  return plainUser;
};

const roleMatches = (role, allowedRoles = []) => allowedRoles.map(normalizeRole).includes(normalizeRole(role));

module.exports = { normalizeRole, normalizeUser, roleMatches };