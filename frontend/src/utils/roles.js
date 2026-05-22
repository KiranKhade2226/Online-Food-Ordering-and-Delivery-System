const ROLE_MAP = {
  customer: 'customer',
  owner: 'restaurantOwner',
  restaurantOwner: 'restaurantOwner',
  delivery: 'deliveryPartner',
  deliveryPartner: 'deliveryPartner',
  admin: 'admin',
};

export const normalizeRole = (role) => ROLE_MAP[role] || role;

export const normalizeUser = (user) => {
  if (!user) {
    return user;
  }

  return { ...user, role: normalizeRole(user.role) };
};

export const dashboardRouteForRole = (role) => {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === 'restaurantOwner') {
    return '/dashboard/owner';
  }

  if (normalizedRole === 'deliveryPartner') {
    return '/dashboard/delivery';
  }

  return `/dashboard/${normalizedRole}`;
};