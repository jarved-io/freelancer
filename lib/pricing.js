export const COMMISSION_RATE = 0.10;

export function commissionFor(price) {
  return Math.round(price * COMMISSION_RATE);
}

export function computeOrderTotal(listing, pkg, quantity) {
  let total = 0;
  if (listing.pricingType === 'PACKAGES' && pkg) {
    total = pkg.price;
  } else if (listing.pricingType === 'UNIT') {
    total = (listing.basePrice || 0) * Math.max(1, quantity || 1);
  } else if (listing.pricingType === 'HOURLY') {
    total = (listing.basePrice || 0) * Math.max(1, quantity || 1);
  } else if (listing.pricingType === 'FLAT') {
    total = listing.basePrice || 0;
  }
  const commissionAmt = commissionFor(total);
  return { total, commissionAmt, sellerEarnings: total - commissionAmt };
}

export function fmt(n) {
  return '₹' + Math.round(n || 0).toLocaleString('en-IN');
}
