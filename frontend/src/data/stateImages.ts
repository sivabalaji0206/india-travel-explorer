/**
 * Curated high-resolution landscape photography for all 34 Indian States & Union Territories.
 * Hosted on Unsplash CDN with auto-formatting and responsive sizing.
 */

export const STATE_IMAGES: Record<string, string> = {
  'Andaman and Nicobar Islands':
    'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
  'Andhra Pradesh':
    'https://images.unsplash.com/photo-1609137144820-8016f466b040?auto=format&fit=crop&w=800&q=80',
  'Arunachal Pradesh':
    'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
  'Assam':
    'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=800&q=80',
  'Bihar':
    'https://images.unsplash.com/photo-1622397815608-251f28bc3ee8?auto=format&fit=crop&w=800&q=80',
  'Chandigarh':
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
  'Chhattisgarh':
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'Delhi':
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
  'Goa':
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
  'Gujarat':
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
  'Haryana':
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'Himachal Pradesh':
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
  'Jammu and Kashmir':
    'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=800&q=80',
  'Jharkhand':
    'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
  'Karnataka':
    'https://images.unsplash.com/photo-1600100397608-f010e42e4785?auto=format&fit=crop&w=800&q=80',
  'Kerala':
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
  'Ladakh':
    'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
  'Lakshadweep':
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
  'Madhya Pradesh':
    'https://images.unsplash.com/photo-1608958435020-e8a7109ba809?auto=format&fit=crop&w=800&q=80',
  'Maharashtra':
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
  'Manipur':
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'Meghalaya':
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'Mizoram':
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  'Odisha':
    'https://images.unsplash.com/photo-1629853610323-5e9167df3c46?auto=format&fit=crop&w=800&q=80',
  'Puducherry':
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
  'Punjab':
    'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=800&q=80',
  'Rajasthan':
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
  'Sikkim':
    'https://images.unsplash.com/photo-1622306750868-b328731f8b4e?auto=format&fit=crop&w=800&q=80',
  'Tamil Nadu':
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
  'Telangana':
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
  'Tripura':
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
  'Uttar Pradesh':
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
  'Uttarakhand':
    'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=800&q=80',
  'West Bengal':
    'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80',
};

export const DEFAULT_STATE_IMAGE =
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80';

export const getStateImage = (stateName: string): string => {
  return STATE_IMAGES[stateName] || DEFAULT_STATE_IMAGE;
};

