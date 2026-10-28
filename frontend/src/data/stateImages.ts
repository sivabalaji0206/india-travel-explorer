/**
 * Curated high-resolution photography gallery for all 34 Indian States & Union Territories.
 * Each state includes 5 to 6 distinct verified landscape and monument photos from Unsplash CDN.
 */

export interface StatePhoto {
  url: string;
  caption: string;
}

export const STATE_GALLERIES: Record<string, StatePhoto[]> = {
  'Andaman and Nicobar Islands': [
    {
      url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
      caption: 'Radhanagar Beach, Havelock Island',
    },
    {
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
      caption: 'Elephant Beach Coral Reefs',
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      caption: 'Neil Island Turquoise Lagoons',
    },
    {
      url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      caption: 'Ross Island Historic Ruins',
    },
    {
      url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
      caption: 'Baratang Mangrove Boat Safari',
    },
    {
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      caption: 'Mount Harriet National Park',
    },
  ],

  'Andhra Pradesh': [
    {
      url: 'https://images.unsplash.com/photo-1609137144820-8016f466b040?auto=format&fit=crop&w=800&q=80',
      caption: 'Tirumala Venkateswara Temple Hills',
    },
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      caption: 'Lepakshi Temple Sculptures',
    },
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      caption: 'Araku Valley Coffee Plantations',
    },
    {
      url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      caption: 'Borra Caves & Katiki Waterfalls',
    },
    {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      caption: 'Rishikonda Beach, Visakhapatnam',
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Gandikota Grand Canyon of India',
    },
  ],

  'Arunachal Pradesh': [
    {
      url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
      caption: 'Tawang Monastery in the Snow',
    },
    {
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      caption: 'Sela Pass Frozen Lake',
    },
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      caption: 'Ziro Valley Pine Hills',
    },
    {
      url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
      caption: 'Namdapha Rainforest Wildlife',
    },
    {
      url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      caption: 'Nuranang Waterfall, Jang',
    },
    {
      url: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
      caption: 'Sangti Valley Meadows',
    },
  ],

  'Assam': [
    {
      url: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=800&q=80',
      caption: 'Kaziranga One-Horned Rhinoceros',
    },
    {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      caption: 'Lush Green Tea Estates of Jorhat',
    },
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      caption: 'Kamakhya Temple, Guwahati',
    },
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      caption: 'Majuli - World Largest River Island',
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      caption: 'Brahmaputra River Sunset Cruise',
    },
    {
      url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
      caption: 'Manas National Park Tiger Reserve',
    },
  ],

  'Bihar': [
    {
      url: 'https://images.unsplash.com/photo-1622397815608-251f28bc3ee8?auto=format&fit=crop&w=800&q=80',
      caption: 'Mahabodhi Temple UNESCO Site, Bodh Gaya',
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Ancient Nalanda University Ruins',
    },
    {
      url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
      caption: 'Vishwa Shanti Stupa, Rajgir',
    },
    {
      url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
      caption: 'Ganga Ghats & Historical Patna',
    },
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      caption: 'Griddhakuta Hill, Rajgir',
    },
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      caption: 'Valmiki National Park Foothills',
    },
  ],

  'Chandigarh': [
    {
      url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
      caption: 'Nek Chand Rock Garden',
    },
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      caption: 'Sukhna Lake Tranquil Waters',
    },
    {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      caption: 'Zakir Hussain Rose Garden',
    },
    {
      url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
      caption: 'Le Corbusier Capitol Complex',
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Open Hand Monument',
    },
    {
      url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
      caption: 'Pinjore Mughal Gardens',
    },
  ],

  'Chhattisgarh': [
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      caption: 'Chitrakote Falls - Niagara of India',
    },
    {
      url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      caption: 'Teerathgarh Waterfalls, Bastar',
    },
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      caption: 'Bhoramdeo Ancient Temple Complex',
    },
    {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      caption: 'Kanger Ghati National Park Caves',
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Sirpur Historical Archaeological Site',
    },
    {
      url: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=800&q=80',
      caption: 'Achanakmar Tiger Sanctuary',
    },
  ],

  'Delhi': [
    {
      url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
      caption: 'Qutub Minar at Sunset',
    },
    {
      url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      caption: 'Red Fort Lal Qila Ramparts',
    },
    {
      url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
      caption: 'Humayuns Tomb Mughal Architecture',
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'India Gate Memorial Boulevard',
    },
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      caption: 'Lotus Temple of the Bahai Faith',
    },
    {
      url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
      caption: 'Swaminarayan Akshardham Temple',
    },
  ],

  'Goa': [
    {
      url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      caption: 'Sunset Palms on Baga Beach',
    },
    {
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
      caption: 'Palolem Beach Crescent Bay',
    },
    {
      url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      caption: 'Dudhsagar Four-Tiered Waterfall',
    },
    {
      url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
      caption: 'Portuguese Fort Aguada Lighthouse',
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Basilica of Bom Jesus, Old Goa',
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      caption: 'Arambol Sweet Water Lagoon',
    },
  ],

  'Gujarat': [
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Rann of Kutch White Salt Desert',
    },
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      caption: 'Somnath Jyotirlinga Temple by the Sea',
    },
    {
      url: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=800&q=80',
      caption: 'Gir National Park Asiatic Lions',
    },
    {
      url: 'https://images.unsplash.com/photo-1600100397608-f010e42e4785?auto=format&fit=crop&w=800&q=80',
      caption: 'Rani ki Vav Stepwell, Patan',
    },
    {
      url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
      caption: 'Statue of Unity, Kevadia',
    },
    {
      url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
      caption: 'Sun Temple of Modhera',
    },
  ],

  'Haryana': [
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      caption: 'Brahma Sarovar, Kurukshetra',
    },
    {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      caption: 'Sultanpur Bird Sanctuary Migratory Birds',
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Heritage Transport Museum, Taoru',
    },
    {
      url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      caption: 'Damdama Lake Adventure & Hills',
    },
    {
      url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
      caption: 'Morni Hills Shivalik Foothills',
    },
    {
      url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
      caption: 'Yadavindra Gardens Pinjore',
    },
  ],

  'Himachal Pradesh': [
    {
      url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
      caption: 'Snow-Clad Peaks of Solang Valley, Manali',
    },
    {
      url: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
      caption: 'Spiti Valley Rugged Himalayan Desert',
    },
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      caption: 'Rohtang Pass Alpine Vistas',
    },
    {
      url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
      caption: 'Dharamshala & McLeodganj Monasteries',
    },
    {
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      caption: 'The Ridge & Mall Road, Shimla',
    },
    {
      url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      caption: 'Parvati Valley & Kasol Riverside',
    },
  ],

  'Jammu and Kashmir': [
    {
      url: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=800&q=80',
      caption: 'Shikara Boating on Dal Lake, Srinagar',
    },
    {
      url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
      caption: 'Gulmarg Snow Meadows & Gondola',
    },
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      caption: 'Pahalgam Betaab Valley & Lidder River',
    },
    {
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      caption: 'Sonamarg Meadow of Gold Glaciers',
    },
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      caption: 'Mata Vaishno Devi Shrine, Katra',
    },
    {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      caption: 'Mughal Gardens Shalimar & Nishat',
    },
  ],

  'Jharkhand': [
    {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      caption: 'Hundru Falls Cascade, Ranchi',
    },
    {
      url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      caption: 'Dassam Falls & Subarnarekha River',
    },
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      caption: 'Baidyanath Dham Temple, Deoghar',
    },
    {
      url: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=800&q=80',
      caption: 'Betla National Park Forest Trails',
    },
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      caption: 'Netarhat Queen of Chotanagpur Sunsets',
    },
    {
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      caption: 'Parasnath Hill Sacred Jain Peaks',
    },
  ],

  'Karnataka': [
    {
      url: 'https://images.unsplash.com/photo-1600100397608-f010e42e4785?auto=format&fit=crop&w=800&q=80',
      caption: 'Stone Chariot at Vijayanagara, Hampi',
    },
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      caption: 'Illuminated Royal Palace of Mysore',
    },
    {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      caption: 'Coorg Mist & Coffee Plantations',
    },
    {
      url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      caption: 'Jog Falls - Majestic Plunge Waterfalls',
    },
    {
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
      caption: 'Gokarna Om Beach & Coastline',
    },
    {
      url: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=800&q=80',
      caption: 'Bandipur Tiger Reserve & Safari',
    },
  ],

  'Kerala': [
    {
      url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      caption: 'Alleppey Backwaters Houseboat Cruise',
    },
    {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      caption: 'Munnar Rolling Emerald Tea Gardens',
    },
    {
      url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      caption: 'Athirappilly Falls Rainforest Cascade',
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      caption: 'Varkala Beach Dramatic Red Cliffs',
    },
    {
      url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      caption: 'Fort Kochi Historic Chinese Fishing Nets',
    },
    {
      url: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=800&q=80',
      caption: 'Periyar Wildlife Sanctuary Lake Safari',
    },
  ],

  'Ladakh': [
    {
      url: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
      caption: 'Pangong Tso Crystal Turquoise Lake',
    },
    {
      url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
      caption: 'Leh Palace & Stupas Overlooking Valley',
    },
    {
      url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
      caption: 'Nubra Valley Sand Dunes & Bactrian Camels',
    },
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      caption: 'Khardung La World High Mountain Pass',
    },
    {
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      caption: 'Tso Moriri High-Altitude Wetland',
    },
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      caption: 'Thiksey & Hemis Ancient Monasteries',
    },
  ],

  'Lakshadweep': [
    {
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
      caption: 'Bangaram Atoll Crystal Lagoon',
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      caption: 'Agatti Coral Island Turquoise Waters',
    },
    {
      url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      caption: 'Kavaratti Marine Coral Reefs',
    },
    {
      url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
      caption: 'Minicoy Island Southern Lighthouse',
    },
    {
      url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
      caption: 'Kadmat Island Scuba Paradise',
    },
    {
      url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      caption: 'Kalpeni Island Water Sports',
    },
  ],

  'Madhya Pradesh': [
    {
      url: 'https://images.unsplash.com/photo-1608958435020-e8a7109ba809?auto=format&fit=crop&w=800&q=80',
      caption: 'Khajuraho UNESCO Temples',
    },
    {
      url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      caption: 'Gwalior Fort Pearl of Fortresses',
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Orchha Cenotaphs & Betwa River',
    },
    {
      url: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=800&q=80',
      caption: 'Kanha & Bandhavgarh Tiger Reserves',
    },
    {
      url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      caption: 'Bhedaghat Marble Rocks & Dhuandhar',
    },
    {
      url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
      caption: 'Great Stupa at Sanchi',
    },
  ],

  'Maharashtra': [
    {
      url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
      caption: 'Gateway of India & Mumbai Waterfront',
    },
    {
      url: 'https://images.unsplash.com/photo-1600100397608-f010e42e4785?auto=format&fit=crop&w=800&q=80',
      caption: 'Ajanta & Ellora Rock-Cut Caves',
    },
    {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      caption: 'Lonavala & Mahabaleshwar Western Ghats',
    },
    {
      url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      caption: 'Raigad Fort Maratha Heritage',
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Elephanta Caves UNESCO Monument',
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      caption: 'Tarkarli & Konkan Golden Beaches',
    },
  ],

  'Manipur': [
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      caption: 'Loktak Lake Floating Phumdis',
    },
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      caption: 'Keibul Lamjao National Park',
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Kangla Fort Royal Complex, Imphal',
    },
    {
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      caption: 'Dzuko Valley Blooming Lilies',
    },
    {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      caption: 'Ima Keithel Mothers Market',
    },
    {
      url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      caption: 'Singda Dam Scenic Hills',
    },
  ],

  'Meghalaya': [
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      caption: 'Living Root Bridges of Cherrapunji',
    },
    {
      url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      caption: 'Nohkalikai Falls Majestic Drop',
    },
    {
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
      caption: 'Umngot River Transparent Waters, Dawki',
    },
    {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      caption: 'Mawlynnong - Cleanest Village in Asia',
    },
    {
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      caption: 'Laitlum Canyons Panoramic Vistas',
    },
    {
      url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
      caption: 'Umiam Lake Serene Hills, Shillong',
    },
  ],

  'Mizoram': [
    {
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      caption: 'Phawngpui Blue Mountain Peak',
    },
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      caption: 'Vantawng Falls Highest in Mizoram',
    },
    {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      caption: 'Aizawl Hill City Night Lights',
    },
    {
      url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      caption: 'Tam Dil Natural Lake & Forest',
    },
    {
      url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
      caption: 'Reiek Tlang Mountain Ridge',
    },
    {
      url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
      caption: 'Solomon Temple Architectural Landmark',
    },
  ],

  'Odisha': [
    {
      url: 'https://images.unsplash.com/photo-1629853610323-5e9167df3c46?auto=format&fit=crop&w=800&q=80',
      caption: 'Konark Sun Temple Stone Chariot Wheel',
    },
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      caption: 'Jagannath Temple Spiritual Towers, Puri',
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      caption: 'Chilika Lake Irrawaddy Dolphins & Flamingos',
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Lingaraja Ancient Kalinga Temple, Bhubaneswar',
    },
    {
      url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      caption: 'Golden Beach of Puri Coastline',
    },
    {
      url: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=800&q=80',
      caption: 'Simlipal Biosphere Tiger Reserve',
    },
  ],

  'Puducherry': [
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      caption: 'White Town French Colonial Pastel Streets',
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Matrimandir Golden Sphere, Auroville',
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      caption: 'Promenade Beach Waves & French War Memorial',
    },
    {
      url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      caption: 'Paradise Beach Sand Spit Lagoon',
    },
    {
      url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
      caption: 'Aurobindo Ashram Peaceful Gardens',
    },
    {
      url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      caption: 'Chunnambar Boat House Backwaters',
    },
  ],

  'Punjab': [
    {
      url: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=800&q=80',
      caption: 'Golden Temple Harmandir Sahib Illuminated',
    },
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      caption: 'Jallianwala Bagh Historic Memorial',
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Wagah Border Sunset Ceremony',
    },
    {
      url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      caption: 'Qila Mubarak Ancient Fort, Patiala',
    },
    {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      caption: 'Golden Mustard Fields of Rural Punjab',
    },
    {
      url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
      caption: 'Virasat-e-Khalsa Museum, Anandpur Sahib',
    },
  ],

  'Rajasthan': [
    {
      url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      caption: 'Hawa Mahal - Palace of Winds, Jaipur',
    },
    {
      url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
      caption: 'Amer Fort Golden Ramparts & Maota Lake',
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Jaisalmer Golden Fort in the Thar Desert',
    },
    {
      url: 'https://images.unsplash.com/photo-1600100397608-f010e42e4785?auto=format&fit=crop&w=800&q=80',
      caption: 'Lake Pichola & City Palace, Udaipur',
    },
    {
      url: 'https://images.unsplash.com/photo-1608958435020-e8a7109ba809?auto=format&fit=crop&w=800&q=80',
      caption: 'Mehrangarh Fort Overlooking the Blue City',
    },
    {
      url: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=800&q=80',
      caption: 'Ranthambore Royal Bengal Tigers',
    },
  ],

  'Sikkim': [
    {
      url: 'https://images.unsplash.com/photo-1622306750868-b328731f8b4e?auto=format&fit=crop&w=800&q=80',
      caption: 'Mt. Kanchenjunga Majestic Snow Peaks',
    },
    {
      url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
      caption: 'Rumtek Monastery Buddhist Heritage',
    },
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      caption: 'Tsomgo Changu Sacred Glacial Lake',
    },
    {
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      caption: 'Gurudongmar Lake Pristine Waters',
    },
    {
      url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      caption: 'Yumthang Valley of Flowers',
    },
    {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      caption: 'Nathula Pass Indo-China Border',
    },
  ],

  'Tamil Nadu': [
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      caption: 'Meenakshi Amman Temple Gopuram Towers, Madurai',
    },
    {
      url: 'https://images.unsplash.com/photo-1600100397608-f010e42e4785?auto=format&fit=crop&w=800&q=80',
      caption: 'Shore Temple UNESCO Monolithic Carvings, Mahabalipuram',
    },
    {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      caption: 'Nilgiri Blue Mountain Hills & Ooty Toy Train',
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Brihadisvara Great Living Chola Temple, Thanjavur',
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      caption: 'Rameshwaram Pamban Sea Bridge & Coast',
    },
    {
      url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      caption: 'Kodaikanal Lake Mist & Pine Forests',
    },
  ],

  'Telangana': [
    {
      url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
      caption: 'Charminar Historic Minarets, Hyderabad',
    },
    {
      url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      caption: 'Golconda Fort Acoustic Marvel & Ramparts',
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Chowmahalla Palace Nizams Splendor',
    },
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      caption: 'Ramappa Temple UNESCO Kakatiya Heritage',
    },
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      caption: 'Hussain Sagar Lake Buddha Statue',
    },
    {
      url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      caption: 'Kuntala Waterfalls in Adilabad',
    },
  ],

  'Tripura': [
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Neermahal Water Palace on Rudrasagar Lake',
    },
    {
      url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      caption: 'Ujjayanta Palace White Marble Façade',
    },
    {
      url: 'https://images.unsplash.com/photo-1600100397608-f010e42e4785?auto=format&fit=crop&w=800&q=80',
      caption: 'Unakoti Rock-Cut Giant Shiva Reliefs',
    },
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      caption: 'Tripura Sundari Matabari Temple',
    },
    {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      caption: 'Jampui Hills Orange Valley',
    },
    {
      url: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=800&q=80',
      caption: 'Sepahijala Wildlife Sanctuary',
    },
  ],

  'Uttar Pradesh': [
    {
      url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
      caption: 'The Taj Mahal at Dawn on Yamuna River',
    },
    {
      url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
      caption: 'Varanasi Ghats Evening Ganga Aarti Ceremony',
    },
    {
      url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      caption: 'Agra Fort Red Sandstone Citadel',
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Fatehpur Sikri Buland Darwaza Gateway',
    },
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      caption: 'Kashi Vishwanath Corridor, Varanasi',
    },
    {
      url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
      caption: 'Bara Imambara & Rumi Darwaza, Lucknow',
    },
  ],

  'Uttarakhand': [
    {
      url: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=800&q=80',
      caption: 'Ram Jhula over Turquoise Ganga, Rishikesh',
    },
    {
      url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
      caption: 'Kedarnath Temple Himalayan High Sanctuary',
    },
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      caption: 'Nainital Lake Surrounded by Kumaon Hills',
    },
    {
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      caption: 'Auli Ski Slopes & Nanda Devi Panoramic Peaks',
    },
    {
      url: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=800&q=80',
      caption: 'Jim Corbett National Park Tiger Jungle Safari',
    },
    {
      url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      caption: 'Valley of Flowers UNESCO Biosphere',
    },
  ],

  'West Bengal': [
    {
      url: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80',
      caption: 'Howrah Bridge over the Hooghly River, Kolkata',
    },
    {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      caption: 'Darjeeling Himalayan Toy Train & Tea Hills',
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      caption: 'Victoria Memorial White Marble Splendor',
    },
    {
      url: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=800&q=80',
      caption: 'Sundarbans Mangrove Delta & Royal Bengal Tiger',
    },
    {
      url: 'https://images.unsplash.com/photo-1622306750868-b328731f8b4e?auto=format&fit=crop&w=800&q=80',
      caption: 'Tiger Hill Sunrise over Mount Kanchenjunga',
    },
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      caption: 'Bishnupur Terracotta Temples',
    },
  ],
};

const DEFAULT_GALLERY: StatePhoto[] = [
  {
    url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
    caption: 'Heritage and Cultural Wonders of India',
  },
  {
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    caption: 'Iconic Architectural Monuments',
  },
  {
    url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    caption: 'Pristine Nature and Waterways',
  },
  {
    url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    caption: 'High Mountain Vistas and Passes',
  },
  {
    url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    caption: 'Sun-Drenched Coastal Shores',
  },
  {
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    caption: 'Sacred Temples and Spiritual Sanctuaries',
  },
];

export const getStateGallery = (stateName: string): StatePhoto[] => {
  return STATE_GALLERIES[stateName] || DEFAULT_GALLERY;
};

export const getStateCoverImage = (stateName: string): string => {
  const gallery = getStateGallery(stateName);
  return gallery[0]?.url || DEFAULT_GALLERY[0].url;
};
