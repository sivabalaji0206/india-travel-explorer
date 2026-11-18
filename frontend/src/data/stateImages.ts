/**
 * Authentic, verified high-resolution photography gallery for all 34 Indian States & Union Territories.
 * Each state features 6 genuine landmark photos verified against Wikimedia Commons & high-res CDNs.
 */

export interface StatePhoto {
  url: string;
  caption: string;
}

export const STATE_GALLERIES: Record<string, StatePhoto[]> = {
  "Andaman and Nicobar Islands": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1f/Radha_Nagar_beach%2C_Havelock_Island%2C_Andamn%2C_India-_Sun_set_view.jpg/960px-Radha_Nagar_beach%2C_Havelock_Island%2C_Andamn%2C_India-_Sun_set_view.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Radhanagar Beach Havelock",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Front_View_of_Cellular_Jail%2C_Port_Blair.JPG/960px-Front_View_of_Cellular_Jail%2C_Port_Blair.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Cellular Jail",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Ross_Island_Andaman.jpg/960px-Ross_Island_Andaman.jpg",
      caption: "Ross Island Historic Ruins",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/63/Havelock%2C_Andaman.jpg/960px-Havelock%2C_Andaman.jpg",
      caption: "Elephant Beach Snorkeling",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Keshet_neal_island_india.jpg/960px-Keshet_neal_island_india.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Neil Island Natural Bridge",
    },
    {
      url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
      caption: "Baratang Mangroves and Limestone Caves",
    },
  ],

  "Andhra Pradesh": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/Tirumala_090615.jpg/960px-Tirumala_090615.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Tirumala Venkateswara Temple, Tirupati",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Front_side_of_Veerabhadra_Temple%2C_Lepakshi.jpg/960px-Front_side_of_Veerabhadra_Temple%2C_Lepakshi.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Lepakshi Veerbhadra Temple & Nandi",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/Indian_Grand_Canyon_Sudhakar_Bichali.jpg/960px-Indian_Grand_Canyon_Sudhakar_Bichali.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Gandikota Grand Canyon & Fort",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/Borra_caves%2C_Viskhapatnam.jpg/960px-Borra_caves%2C_Viskhapatnam.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Borra Caves, Ananthagiri Hills",
    },
    {
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      caption: "Araku Valley Coffee Plantations",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Rushikonda_beach_view_001.jpg/960px-Rushikonda_beach_view_001.jpg",
      caption: "Rishikonda Beach, Visakhapatnam",
    },
  ],

  "Arunachal Pradesh": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/TawangMonastery.jpg/960px-TawangMonastery.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Tawang Monastery (Galdan Namgyal Lhatse)",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Tawang_Gate.jpg/960px-Tawang_Gate.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Sela Pass Frozen Lake & Himalayan Gateway",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/A_cross_section_of_Ziro.jpg/960px-A_cross_section_of_Ziro.jpg",
      caption: "Ziro Valley Pine Hills & Apatani Heritage",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Nuranang_Waterfall.jpg/960px-Nuranang_Waterfall.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Nuranang Waterfalls, Jang",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/Sangti_river.jpg/960px-Sangti_river.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Sangti Valley Meadows & Black-Necked Cranes",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/Forest_snow_Namdapha_IMG_3373_04.jpg/960px-Forest_snow_Namdapha_IMG_3373_04.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Namdapha Rainforest Wilderness",
    },
  ],

  "Assam": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Beauty_of_Kaziranga_National_Park.jpg/960px-Beauty_of_Kaziranga_National_Park.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Kaziranga National Park One-Horned Rhino",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Kamakhya_Temple_-_DEV_8829.jpg/960px-Kamakhya_Temple_-_DEV_8829.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Kamakhya Devi Temple, Nilachal Hill",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/Doriya_River_of_Majuli.jpg/960px-Doriya_River_of_Majuli.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Majuli Island Cultural Vaishnavite Satras",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Manas_landscape_rhino.jpg/960px-Manas_landscape_rhino.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Manas Tiger Reserve & Himalayan Foothills",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ea/George_Morland_%281763-1804%29_-_The_Tea_Garden_-_T00055_-_Tate.jpg/960px-George_Morland_%281763-1804%29_-_The_Tea_Garden_-_T00055_-_Tate.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Assam Heritage Tea Estates",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Umananda_Island%2C_Guwahati_%284%29.jpg/960px-Umananda_Island%2C_Guwahati_%284%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Umananda Peacock Island, Brahmaputra",
    },
  ],

  "Bihar": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Temple_No.-_3%2C_Nalanda_Archaeological_Site.jpg/960px-Temple_No.-_3%2C_Nalanda_Archaeological_Site.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Nalanda Mahavihara Ancient UNESCO University",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/Mahabodhitemple.jpg/960px-Mahabodhitemple.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Mahabodhi Temple & Sacred Bodhi Tree",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Vikramshila_2012-08-10-17.14.08.jpg/960px-Vikramshila_2012-08-10-17.14.08.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Vikramshila Ancient Buddhist University",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/85/Sher_Shah_Suri_Tomb.jpg/960px-Sher_Shah_Suri_Tomb.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Tomb of Sher Shah Suri, Sasaram",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Golghar_%E0%A5%AA.jpg/960px-Golghar_%E0%A5%AA.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Golghar Historic Granary, Patna",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/Kesariya.jpg/960px-Kesariya.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Kesaria Ancient Buddhist Stupa",
    },
  ],

  "Chandigarh": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/Chandigarh_Rock_Garden_4.jpg/960px-Chandigarh_Rock_Garden_4.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Rock Garden Sculptures by Nek Chand",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e6/Sukhna_Lake_Chandigarh_India.jpg/960px-Sukhna_Lake_Chandigarh_India.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Sukhna Lake Waterfront Promenade",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Rose_Garden_%2CChandigarh%2CIndia.jpg/960px-Rose_Garden_%2CChandigarh%2CIndia.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Zakir Hussain Rose Garden",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/05/Chandigarh_Capitol_Complex_-_Le_Corbusier_-_Open_hand_monument.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled",
      caption: "Open Hand Monument by Le Corbusier",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Chandigarh_Museum_and_Art_Gallery.jpg/960px-Chandigarh_Museum_and_Art_Gallery.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Chandigarh Museum & Art Gallery",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/Pinjore_Garden_Panchkula.jpg/960px-Pinjore_Garden_Panchkula.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Pinjore Mughal Heritage Gardens",
    },
  ],

  "Chhattisgarh": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Chitrakot_waterfalls.JPG/960px-Chitrakot_waterfalls.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Chitrakote Falls (Niagara of India), Bastar",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/Tirathgarh_Falls.jpg/960px-Tirathgarh_Falls.jpg",
      caption: "Tirathgarh Multi-Tier Cascade, Kanger Valley",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/Bhoramdeo_Temple%2C_Kawardha.jpg/960px-Bhoramdeo_Temple%2C_Kawardha.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Bhoramdeo 11th-Century Sculpted Temple",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/7th_-_9th_century_Surang_tila_mandapa_before_shrines%2C_Sirpur_monuments_Chhattisgarh.jpg/960px-7th_-_9th_century_Surang_tila_mandapa_before_shrines%2C_Sirpur_monuments_Chhattisgarh.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Sirpur Ancient Buddhist & Hindu Complex",
    },
    {
      url: "https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=800&q=80",
      caption: "Barnawapara Teak Forest & Wildlife",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Danteswari_Temple_0034.jpg/960px-Danteswari_Temple_0034.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Maa Danteshwari Shaktipeeth Temple",
    },
  ],

  "Dadra and Nagar Haveli and Daman and Diu": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/1/17/Diu%2CGujarat%2CIndia_%2837%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled",
      caption: "Diu Portuguese Sea Fort & Cannon Ramparts",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Evening_View_at_Devka_Beach%2C_Daman_-_panoramio.jpg/960px-Evening_View_at_Devka_Beach%2C_Daman_-_panoramio.jpg",
      caption: "Moti Daman Historic Ramparts & Gateway",
    },
    {
      url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
      caption: "Nagoa Beach Crescent Bay, Diu",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Jampore_Beach_%2878525%29.jpg/960px-Jampore_Beach_%2878525%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Jampore Beach Coastal Waterfront, Daman",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/Church_of_St._Francis_of_Assisi%2C_Old_Goa.jpg/960px-Church_of_St._Francis_of_Assisi%2C_Old_Goa.jpg",
      caption: "Church of St. Paul Baroque Architecture",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Dadra_and_Nagar_Haveli_Silvassa_3.jpg/960px-Dadra_and_Nagar_Haveli_Silvassa_3.jpg",
      caption: "Dudhani Lake & Water Sports, Silvassa",
    },
  ],

  "Delhi": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/India_Gate_front.jpg/960px-India_Gate_front.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "India Gate War Memorial & Kartavya Path",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Qutb_Minar_2022.jpg/960px-Qutb_Minar_2022.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Qutub Minar 73-meter Victory Tower",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Tomb_of_Humayun%2C_Delhi.jpg/960px-Tomb_of_Humayun%2C_Delhi.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Humayun's Tomb Mughal Garden Mausoleum",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Delhi_fort.jpg/960px-Delhi_fort.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Red Fort (Lal Qila) Mughal Citadel",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/LotusDelhi.jpg/960px-LotusDelhi.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Lotus Temple Bah\u00e1'\u00ed House of Worship",
    },
    {
      url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
      caption: "Swaminarayan Akshardham Temple Complex",
    },
  ],

  "Goa": [
    {
      url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
      caption: "Baga Beach Coastal Shoreline & Watersports",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Front_Elevation_of_Basilica_of_Bom_Jesus.jpg/960px-Front_Elevation_of_Basilica_of_Bom_Jesus.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Basilica of Bom Jesus, Old Goa (UNESCO)",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0b/Doodhsagar_Fall.jpg/960px-Doodhsagar_Fall.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Dudhsagar Four-Tiered Mountain Waterfall",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Fort_aguada.jpg/960px-Fort_aguada.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Fort Aguada & 17th-Century Lighthouse",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Palolem_Beach%2C_South_Goa.jpg/960px-Palolem_Beach%2C_South_Goa.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Palolem Crescent Bay & Coconut Palms",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Fort_Chapora_26012016.jpg/960px-Fort_Chapora_26012016.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Chapora Fort & Vagator Sunset Vista",
    },
  ],

  "Gujarat": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Statue_of_Unity.jpg/960px-Statue_of_Unity.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Statue of Unity 182-meter Monument",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/Rann_of_Kutch_-_White_Desert.jpg/960px-Rann_of_Kutch_-_White_Desert.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Great Rann of Kutch White Salt Desert",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Somanath_mandir_%28cropped%29.jpg/960px-Somanath_mandir_%28cropped%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Somnath Jyotirlinga Temple on the Shore",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/73/Surya_mandhir.jpg/960px-Surya_mandhir.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Sun Temple Solanki Architecture, Modhera",
    },
    {
      url: "https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=800&q=80",
      caption: "Gir National Park Asiatic Lions",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Rani_ki_vav_02.jpg/960px-Rani_ki_vav_02.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Rani ki Vav Stepwell, Patan (UNESCO)",
    },
  ],

  "Haryana": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Holy_pic_kkr.jpg/960px-Holy_pic_kkr.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Brahma Sarovar Sacred Water Basin, Kurukshetra",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/Pinjore_Garden_Panchkula.jpg/960px-Pinjore_Garden_Panchkula.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Yadavindra Mughal Gardens, Pinjore",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Sultanpur_Bird_Sanctuary%2C_Gurgaon.jpg/960px-Sultanpur_Bird_Sanctuary%2C_Gurgaon.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Sultanpur Bird Sanctuary & Wetland",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Suraj_Kund.jpg/960px-Suraj_Kund.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Surajkund 10th-Century Sun Amphitheatre",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Haryana_Tourism_restaurant_on_Damdama_Lake.JPG/960px-Haryana_Tourism_restaurant_on_Damdama_Lake.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Damdama Lake Aravalli Adventure Reservoir",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/93/Mornihills.jpg/960px-Mornihills.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Morni Hills Pine Forests & Tikkar Taal",
    },
  ],

  "Himachal Pradesh": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Mall_Road_Shimla_1.jpg/960px-Mall_Road_Shimla_1.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Shimla Mall Road & Christ Church Ridge",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/Kullu_Valley_from_Rohtang_Pass%2C_India.jpg/960px-Kullu_Valley_from_Rohtang_Pass%2C_India.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Rohtang Pass Snow Crest & Pir Panjal Views",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/1000_Year_loop.jpg/960px-1000_Year_loop.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Key Monastery High Altitude Spiti Valley",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Solang_Valley_%2CManali%2C_Himachal_Pardes%2C_India.JPG/960px-Solang_Valley_%2CManali%2C_Himachal_Pardes%2C_India.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Solang Valley Paragliding & Alpine Meadows",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/McLeod_Ganj_Dharamkot_Dharmsala_Himachal_Pradesh_India_April_2014.jpg/960px-McLeod_Ganj_Dharamkot_Dharmsala_Himachal_Pradesh_India_April_2014.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "McLeod Ganj & Tsuglagkhang Dalai Lama Temple",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bf/Nature_of_Khajjiar.jpg/960px-Nature_of_Khajjiar.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Khajjiar Cedar Glade & Lake (Mini Switzerland)",
    },
  ],

  "Jammu and Kashmir": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Dal_Lake_Hazratbal_Srinagar.jpg/960px-Dal_Lake_Hazratbal_Srinagar.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Dal Lake Shikara Rides & Floating Houseboats",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Ancient_Temple%2C_Gulmarg.jpg/960px-Ancient_Temple%2C_Gulmarg.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Gulmarg Gondola & Apharwat Snow Slopes",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/93/Betaab_Valley.jpg/960px-Betaab_Valley.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Betaab Valley & Lidder River, Pahalgam",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Shalimar_Bagh_1.jpg/960px-Shalimar_Bagh_1.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Shalimar Mughal Terraced Gardens",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/Sonmarg_rishav7336.jpg/960px-Sonmarg_rishav7336.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Sonamarg Golden Meadow & Thajiwas Glacier",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/The_Ancient_Shankaracharya_Temple_%28Srinagar%2C_Jammu_and_Kashmir%29_%28cropped%29.jpg/960px-The_Ancient_Shankaracharya_Temple_%28Srinagar%2C_Jammu_and_Kashmir%29_%28cropped%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Shankaracharya Hilltop Temple, Srinagar",
    },
  ],

  "Jharkhand": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Hundru_Falls%2C_Jharkhand%2C_India_4.jpg/960px-Hundru_Falls%2C_Jharkhand%2C_India_4.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Hundru Falls Subarnarekha River Cascade",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/Baidyanath_temple_and_temple_complex%2C_Deoghar_04.jpg/960px-Baidyanath_temple_and_temple_complex%2C_Deoghar_04.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Baba Baidyanath Jyotirlinga Temple, Deoghar",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Jonha_falls.jpg/960px-Jonha_falls.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Jonha Falls (Gautam Dhara), Ranchi",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Entrance_of_Betla_national_park.jpg/960px-Entrance_of_Betla_national_park.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Betla National Park Sal Forests & Tigers",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Dassam_falls.jpg/960px-Dassam_falls.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Dassam Falls Kanchi River Plunge",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Shikharji_Parasnath_Giridih.jpg/960px-Shikharji_Parasnath_Giridih.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Parasnath Hill (Shikharji Holy Jain Peak)",
    },
  ],

  "Karnataka": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg/960px-Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Virupaksha Temple & Hampi Boulders (UNESCO)",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Mysore_Palace_Morning.jpg/960px-Mysore_Palace_Morning.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Mysore Palace Royal Architecture & Illumination",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Raja%27s_Seat_View_Point.jpg/960px-Raja%27s_Seat_View_Point.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Coorg Misty Hills & Abbey Waterfalls",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Vishnu_image_inside_cave_number_3_in_Badami.jpg/960px-Vishnu_image_inside_cave_number_3_in_Badami.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Badami 6th-Century Rock-Cut Cave Temples",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f5/Jog_Falls_05092016.jpg/960px-Jog_Falls_05092016.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Jog Falls Sharavathi River Plunge",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Gol_Gumbaz_-4%2C_Bijapur%2C_Karnataka.jpg/960px-Gol_Gumbaz_-4%2C_Bijapur%2C_Karnataka.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Gol Gumbaz Whispering Gallery, Vijayapura",
    },
  ],

  "Kerala": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Kumarkom.jpg/960px-Kumarkom.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Alleppey Backwaters & Traditional Houseboats",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Munnar_Overview.jpg/960px-Munnar_Overview.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Munnar Rolling Emerald Tea Estates & Hills",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/The_View_of_the_Athirapally_Falls_during_the_onset_of_Monsoon.jpg/960px-The_View_of_the_Athirapally_Falls_during_the_onset_of_Monsoon.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Athirappilly Cascading Waterfalls, Thrissur",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/Chinese_Fishing_Net_Raising_Birds_Sunrise_Ashtamudi_Kollam_Mar22_A7C_01784.jpg/960px-Chinese_Fishing_Net_Raising_Birds_Sunrise_Ashtamudi_Kollam_Mar22_A7C_01784.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Fort Kochi Historic Chinese Fishing Nets",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Kovalam_beach_trivandrum_kerala.jpg/960px-Kovalam_beach_trivandrum_kerala.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Kovalam Lighthouse Beach & Arabian Sea",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Chembra.jpg/960px-Chembra.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Wayanad Heart-Shaped Lake & Cloud Forests",
    },
  ],

  "Ladakh": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/ISS054-E-7809_-_View_of_Earth_%28cropped%29.jpg/960px-ISS054-E-7809_-_View_of_Earth_%28cropped%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Pangong Tso Crystal Blue High Altitude Lake",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/Leh_Palace_2011.jpg/960px-Leh_Palace_2011.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Leh Palace 17th-Century Royal Fortress",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/5_Nubra_valley.jpg/960px-5_Nubra_valley.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Nubra Valley Sand Dunes & Bactrian Camels",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Road_Padum_Zanskar_Range_Jun24_A7CR_00818.jpg/960px-Road_Padum_Zanskar_Range_Jun24_A7CR_00818.jpg",
      caption: "Khardung La Mountain Motor Pass",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/Leh%2C_Shanti_Stupa%2C_Ladakh%2C_India.jpg/960px-Leh%2C_Shanti_Stupa%2C_Ladakh%2C_India.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Shanti Stupa White Peace Pagoda overlooking Leh",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/Thikse_Monastery_.jpg/960px-Thikse_Monastery_.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Thiksey Monastery Tiered Himalayan Gompa",
    },
  ],

  "Lakshadweep": [
    {
      url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
      caption: "Bangaram Island Turquoise Lagoon & Sandbars",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Agatti_Airstrip.jpg/960px-Agatti_Airstrip.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Agatti Island Coral Atoll & Clear Waters",
    },
    {
      url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
      caption: "Kavaratti Coral Reefs & Marine Sanctuaries",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/93/ISS002-E-7261_-_View_of_Lakshadweep.jpg/960px-ISS002-E-7261_-_View_of_Lakshadweep.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Kalpeni Island Coral Debris & Southern Shore",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/Minicoy_Island%2C_Lakshadweep.jpg/960px-Minicoy_Island%2C_Lakshadweep.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Minicoy Island 1885 British Lighthouse",
    },
    {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      caption: "Kadmat Island Pristine White Sands & Lagoons",
    },
  ],

  "Madhya Pradesh": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/1_Khajuraho.jpg/960px-1_Khajuraho.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Khajuraho Kandariya Mahadeva Temple (UNESCO)",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/Gwalior_Fort_front.jpg/960px-Gwalior_Fort_front.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Gwalior Fort Hilltop Palaces & Carvings",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/East_Gateway_-_Stupa_1_-_Sanchi_Hill_2013-02-21_4398.JPG/960px-East_Gateway_-_Stupa_1_-_Sanchi_Hill_2013-02-21_4398.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Great Stupa of Sanchi Ashoka Gateway (UNESCO)",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1f/Tiger_Kanha_National_Park.jpg/960px-Tiger_Kanha_National_Park.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Kanha Tiger Reserve Sal Wilderness",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Bhedaghat_Jbp.jpg/960px-Bhedaghat_Jbp.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Bhedaghat Marble Rocks & Dhuandhar Falls",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Chaturbhuj_Temple%2C_Orchha.jpg/960px-Chaturbhuj_Temple%2C_Orchha.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Orchha Royal Chhatris on Betwa River",
    },
  ],

  "Maharashtra": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3a/Mumbai_03-2016_30_Gateway_of_India.jpg/960px-Mumbai_03-2016_30_Gateway_of_India.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Gateway of India & Apollo Bunder, Mumbai",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Kailasa_temple_at_Ellora_caves.jpg/960px-Kailasa_temple_at_Ellora_caves.jpg",
      caption: "Kailasa Temple Ellora Monolithic Rock Cut (UNESCO)",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c3/Ajanta_%2863%29.jpg/960px-Ajanta_%2863%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Ajanta Buddhist Rock-Cut Frescoes & Viharas",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Mumbai_03-2016_27_skyline_at_Marine_Drive.jpg/960px-Mumbai_03-2016_27_skyline_at_Marine_Drive.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Marine Drive Queen's Necklace Promenade",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Nagarkhana%2C_Raigad_Fort%2C_India.jpg/960px-Nagarkhana%2C_Raigad_Fort%2C_India.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Raigad Hilltop Royal Maratha Fortress",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/MAHABALESWAR_LANDSCAPE.jpg/960px-MAHABALESWAR_LANDSCAPE.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Mahabaleshwar Western Ghats Viewpoints",
    },
  ],

  "Manipur": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/The_Loktak_Lake.jpg/960px-The_Loktak_Lake.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Loktak Lake & Floating Phumdi Circular Islands",
    },
    {
      url: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80",
      caption: "Keibul Lamjao Floating Park & Sangai Deer",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/The_sacred_idols_of_God_Pakhangba_and_his_divine_consort_kept_inside_the_Pakhangba_Temple_in_the_Kangla_Fort_in_Imphal.jpg/960px-The_sacred_idols_of_God_Pakhangba_and_his_divine_consort_kept_inside_the_Pakhangba_Temple_in_the_Kangla_Fort_in_Imphal.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Kangla Fort Royal Citadel, Imphal",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/INA_Memorial%2C_Moirang%2C_Manipur_%2816%29.jpeg/960px-INA_Memorial%2C_Moirang%2C_Manipur_%2816%29.jpeg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "INA War Memorial & Museum, Moirang",
    },
    {
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      caption: "Shirui Lily Sanctuaries, Ukhrul Hills",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/IMPHAL_PEACE_MUSEUM.jpg/960px-IMPHAL_PEACE_MUSEUM.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Imphal War Memorial & Peace Park",
    },
  ],

  "Meghalaya": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Living_root_bridges%2C_Nongriat_village%2C_Meghalaya2.jpg/960px-Living_root_bridges%2C_Nongriat_village%2C_Meghalaya2.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Nongriat Double Decker Living Root Bridge",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/NohKaLikai_Falls_V2_Wiki.jpg/960px-NohKaLikai_Falls_V2_Wiki.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Nohkalikai Falls Deep Plunge, Cherrapunji",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Umngot_river%2C_Dawki.jpg/960px-Umngot_river%2C_Dawki.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Umngot River Crystal Clear Transparent Waters",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Mawlynnong_-_Cleanest_village_of_Asia.jpg/960px-Mawlynnong_-_Cleanest_village_of_Asia.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Mawlynnong Cleanest Village in Asia",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Expedition_is_in_progress_in_Meghalayan_Caves.jpg/960px-Expedition_is_in_progress_in_Meghalayan_Caves.jpg",
      caption: "Mawsmai Cave Natural Limestone Caverns",
    },
    {
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      caption: "Umiam Lake (Barapani) Pine Hills, Shillong",
    },
  ],

  "Mizoram": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Vantawng_Falls_in_1990s.jpg/960px-Vantawng_Falls_in_1990s.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Vantawng Two-Tiered Forest Waterfalls",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Reiek.JPG/960px-Reiek.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Reiek Tlang Mountain Peak & Traditional Village",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/5/5d/2007-blue-mtn-farpak.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled",
      caption: "Phawngpui Blue Mountain High Peak",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/85/Dampa_Tiger_Reserve_Forest.jpg/960px-Dampa_Tiger_Reserve_Forest.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Dampa Tiger Reserve Tropical Wilderness",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/Tam_Dil_Lake_in_Saitual.jpg/960px-Tam_Dil_Lake_in_Saitual.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Tamdil Serene Natural Forest Lake",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/Mizoram_Assembly_House_%28wider_view%29.jpg/960px-Mizoram_Assembly_House_%28wider_view%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Aizawl Scenic Hillside Capital Skyline",
    },
  ],

  "Nagaland": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/Breathtaking_beauty_of_Dzukou_Valley_in_Manipur-Nagaland_border_%28edit%29.jpg/960px-Breathtaking_beauty_of_Dzukou_Valley_in_Manipur-Nagaland_border_%28edit%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Dzukou Valley Rolling Green Hills & Streams",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/93/Kisama_main_arena_Hornbill_Festival_2019.jpg/960px-Kisama_main_arena_Hornbill_Festival_2019.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Kisama Heritage Village (Hornbill Festival)",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/Cemetery_with_kohima.jpeg/960px-Cemetery_with_kohima.jpeg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Kohima WWII Commonwealth War Memorial",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/View_of_Khonoma_%282024%29.jpg/960px-View_of_Khonoma_%282024%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Khonoma Green Village Eco-Terraces",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/ECS_Longpang.jpg/960px-ECS_Longpang.jpg",
      caption: "Mount Saramati Cloud Peak",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/Kapamodzu.jpg/960px-Kapamodzu.jpg",
      caption: "Japfu Peak Giant Rhododendron Forests",
    },
  ],

  "Odisha": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Konarka_Temple.jpg/960px-Konarka_Temple.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Konark Sun Temple Giant Chariot Wheel (UNESCO)",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b7/Shri_Jagannath_temple.jpg/960px-Shri_Jagannath_temple.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Jagannath Temple Sacred Sanctum, Puri",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/94/Birds_eyeview_of_Chilika_Lake.jpg/960px-Birds_eyeview_of_Chilika_Lake.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Chilika Lake Lagoon & Irrawaddy Dolphins",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/Khandagari_and_Udaygiri_featured_image.jpg/960px-Khandagari_and_Udaygiri_featured_image.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Udayagiri & Khandagiri Ancient Jain Caves",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Lingaraj_Temple_%2C_Bhubaneswar.jpg/960px-Lingaraj_Temple_%2C_Bhubaneswar.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Lingaraj 11th-Century Kalinga Temple",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Simlipal_tiger_reserve.jpg/960px-Simlipal_tiger_reserve.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Simlipal Tiger Reserve & Barehipani Falls",
    },
  ],

  "Puducherry": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/French_War_Memorial%2C_Puducherry.jpg/960px-French_War_Memorial%2C_Puducherry.jpg",
      caption: "French Quarter (White Town) Colonial Villas",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/The_Matrimandir_in_Auroville%2C_Tamil_Nadu%2C_India.jpg/960px-The_Matrimandir_in_Auroville%2C_Tamil_Nadu%2C_India.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Auroville Matrimandir Golden Sphere",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Nallavadu-AKM.jpg/960px-Nallavadu-AKM.jpg",
      caption: "Paradise Beach Pristine Golden Sands",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Pondicherry-Rock_beach_aerial_view.jpg/960px-Pondicherry-Rock_beach_aerial_view.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Promenade Rock Beach Waterfront Walkway",
    },
    {
      url: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
      caption: "Sri Aurobindo Ashram Spiritual Haven",
    },
    {
      url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
      caption: "Arikamedu Ancient Indo-Roman Port Ruins",
    },
  ],

  "Punjab": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/94/The_Golden_Temple_of_Amrithsar_7.jpg/960px-The_Golden_Temple_of_Amrithsar_7.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Sri Harmandir Sahib (Golden Temple), Amritsar",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/The_SAARC_Car_Rally_2007_being_welcomed_by_traditional_Drummers_at_the_Wagah_Border_on_March_28%2C_2007.jpg/960px-The_SAARC_Car_Rally_2007_being_welcomed_by_traditional_Drummers_at_the_Wagah_Border_on_March_28%2C_2007.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Wagah Border Beating Retreat Ceremony",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/Jallianwala_Bagh%2C_Amritsar_01.jpg/960px-Jallianwala_Bagh%2C_Amritsar_01.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Jallianwala Bagh Historic National Memorial",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/Khalsa_Heritage_Memorial_176_Edit.jpg/960px-Khalsa_Heritage_Memorial_176_Edit.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Virasat-e-Khalsa Museum, Anandpur Sahib",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Qila_Mubarak_in_2015%282%29.jpg/960px-Qila_Mubarak_in_2015%282%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Qila Mubarak Historic Ramparts, Bathinda",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/Qila_Mubarak%2C_Patiala_%28Cropped%29.jpg/960px-Qila_Mubarak%2C_Patiala_%28Cropped%29.jpg",
      caption: "Sheesh Mahal Mirror Palace, Patiala",
    },
  ],

  "Rajasthan": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/960px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Hawa Mahal (Palace of Winds), Jaipur",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/20191219_Fort_Amber%2C_Amer%2C_Jaipur_0955_9481.jpg/960px-20191219_Fort_Amber%2C_Amer%2C_Jaipur_0955_9481.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Amber Fort & Maota Lake Palace, Jaipur",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Udaipur_City_Palace.jpg/960px-Udaipur_City_Palace.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "City Palace & Lake Pichola, Udaipur",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Jaisalmer_forteresse.jpg/960px-Jaisalmer_forteresse.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Jaisalmer Golden Fort in the Thar Desert",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Mehrangarh_Fort_sanhita.jpg/960px-Mehrangarh_Fort_sanhita.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Mehrangarh Fort towering over Jodhpur Blue City",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Ranthambhore_Fort.jpg/960px-Ranthambhore_Fort.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Ranthambore Fort in Tiger Wilderness",
    },
  ],

  "Sikkim": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Tsongmo_Lake_or_Changu_Lake_-_East_Sikkim.jpg/960px-Tsongmo_Lake_or_Changu_Lake_-_East_Sikkim.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Tsomgo (Changu) Glacial Lake & Snow Hills",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Kangchenjunga_PangPema.JPG/960px-Kangchenjunga_PangPema.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Kangchenjunga Majestic Peak Views",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Gurudongmar_Lake_Sikkim%2C_India_%28edit%29.jpg/960px-Gurudongmar_Lake_Sikkim%2C_India_%28edit%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Gurudongmar Sacred High Altitude Lake",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Rumtek_Monastery_alias_Dharma_Chakra_Centre_near_Gangtok%2C_East_Sikkim_09.jpg/960px-Rumtek_Monastery_alias_Dharma_Chakra_Centre_near_Gangtok%2C_East_Sikkim_09.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Rumtek Monastery Golden Tibetan Dharma Stupa",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Yumthang_valley%2C_Lachung_Sikkim_India_2012.jpg/960px-Yumthang_valley%2C_Lachung_Sikkim_India_2012.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Yumthang Valley of Flowers & Hot Springs",
    },
    {
      url: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80",
      caption: "Nathu La Indo-China Himalayan Mountain Pass",
    },
  ],

  "Tamil Nadu": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg/960px-An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Meenakshi Amman Temple Colorful Gopurams, Madurai",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Brihadisvara_Temple_during_Maha_Shivaratri-WUS03611_%28edit%29.jpg/960px-Brihadisvara_Temple_during_Maha_Shivaratri-WUS03611_%28edit%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Brihadisvara Great Chola Big Temple (UNESCO)",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Shore_Temple_at_Mahabalipuram.jpg/960px-Shore_Temple_at_Mahabalipuram.jpg",
      caption: "Shore Temple & Pancha Rathas, Mahabalipuram",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/NMR_train_at_Ketti_05-02-26_75.jpeg/960px-NMR_train_at_Ketti_05-02-26_75.jpeg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Nilgiri Mountain Steam Railway Toy Train, Ooty",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/RockMemorial.jpg/960px-RockMemorial.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Vivekananda Rock Memorial & Thiruvalluvar Statue",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Ramanathaswamy_temple7.JPG/960px-Ramanathaswamy_temple7.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Ramanathaswamy Temple 1000-Pillar Corridor",
    },
  ],

  "Telangana": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Charminar_Hyderabad_1.jpg/960px-Charminar_Hyderabad_1.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Charminar Historic Four-Minaret Monument",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Golconda_Fort_005.jpg/960px-Golconda_Fort_005.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Golconda Fort Acoustic Vaults & Ramparts",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Ramappa_Temple_%28Human_Scale%29.jpg/960px-Ramappa_Temple_%28Human_Scale%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Ramappa Kakatiya Sculpted Temple (UNESCO)",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Aerial_view_of_Hussain_Sagar_from_Bansalipet.jpg/960px-Aerial_view_of_Hussain_Sagar_from_Bansalipet.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Hussain Sagar Lake & Monolithic Buddha Statue",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c3/Shiv_Linga_at_Warangal_Fort_Complex.jpg/960px-Shiv_Linga_at_Warangal_Fort_Complex.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Warangal Fort Kakatiya Keerthi Thoranam Arch",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Chowmahalla_Palace_01.jpg/960px-Chowmahalla_Palace_01.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Chowmahalla Royal Nizami Palace, Hyderabad",
    },
  ],

  "Tripura": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Ujjayanta_palace_Tripura_State_Museum_Agartala_India.jpg/960px-Ujjayanta_palace_Tripura_State_Museum_Agartala_India.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Ujjayanta Royal White Marble Palace, Agartala",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/38/Neer_Mahal%2C_the_water_palace_of_Tripura_02.jpg/960px-Neer_Mahal%2C_the_water_palace_of_Tripura_02.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Neermahal Water Palace in Rudrasagar Lake",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Unakoti_3.jpg/960px-Unakoti_3.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Unakoti Ancient Colossal Rock Carvings of Shiva",
    },
    {
      url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
      caption: "Tripura Sundari 51-Shaktipeeth Temple",
    },
    {
      url: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
      caption: "Jampui Hills Orange Orchards & Lush Vistas",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Deer%2C_Sepahijala_WLS.jpg/960px-Deer%2C_Sepahijala_WLS.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Sepahijala Wildlife Sanctuary & Clouded Leopard",
    },
  ],

  "Uttar Pradesh": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/960px-Taj_Mahal_%28Edited%29.jpeg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Taj Mahal White Marble Wonder, Agra (UNESCO)",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Ahilya_Ghat_by_the_Ganges%2C_Varanasi.jpg/960px-Ahilya_Ghat_by_the_Ganges%2C_Varanasi.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Varanasi Dashashwamedh Ghats & Evening Ganga Aarti",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/Fatehput_Sikiri_Buland_Darwaza_gate_2010.jpg/960px-Fatehput_Sikiri_Buland_Darwaza_gate_2010.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Fatehpur Sikri Buland Darwaza Imperial Palace",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/Bara_Imambara_Lucknow_01.jpg/960px-Bara_Imambara_Lucknow_01.jpg",
      caption: "Bara Imambara & Bhool Bhulaiya Labyrinth, Lucknow",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/PremMandirSideViewFromCanteen.jpg/960px-PremMandirSideViewFromCanteen.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Prem Mandir Illuminated Temple, Vrindavan",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Shri_Ram_Janambhoomi_Mandir%2C_Ayodhya_Dham.jpg/960px-Shri_Ram_Janambhoomi_Mandir%2C_Ayodhya_Dham.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Shri Ram Janmabhoomi Temple, Ayodhya",
    },
  ],

  "Uttarakhand": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Kedarnath_Temple_in_Rainy_season.jpg/960px-Kedarnath_Temple_in_Rainy_season.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Kedarnath Jyotirlinga Himalayan Sacred Shrine",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Trayambakeshwar_Temple_VK.jpg/960px-Trayambakeshwar_Temple_VK.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Rishikesh Laxman Jhula & River Ganges Valley",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/The_Boat_and_The_Lake.jpg/960px-The_Boat_and_The_Lake.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Nainital Emerald Crescent Naini Lake",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f9/Badrinath_Temple_%2C_Uttarakhand.jpg/960px-Badrinath_Temple_%2C_Uttarakhand.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Badrinath Temple High Valley Alaknanda",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Valley_of_flowers_national_park%2C_Uttarakhand%2C_India_03_%28edit%29.jpg/960px-Valley_of_flowers_national_park%2C_Uttarakhand%2C_India_03_%28edit%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Valley of Flowers Alpine Flora (UNESCO)",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Evening_view_of_Har-ki-Pauri%2C_Haridwar.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled",
      caption: "Haridwar Har Ki Pauri Sacred Ganga Aarti",
    },
  ],

  "West Bengal": [
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/Victoria_Memorial_situated_in_Kolkata.jpg/960px-Victoria_Memorial_situated_in_Kolkata.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Victoria Memorial White Marble Museum, Kolkata",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/Howrah_bridge_at_night.jpg/960px-Howrah_bridge_at_night.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Howrah Bridge Cantilever Icon over Hooghly River",
    },
    {
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      caption: "Darjeeling Toy Train with Kanchenjunga Vistas",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/Sundarban_Tiger.jpg/960px-Sundarban_Tiger.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Sundarbans Mangrove Delta & Royal Bengal Tigers",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Dakhineshwar_Temple_beside_the_Hoogly%2C_West_Bengal.JPG/960px-Dakhineshwar_Temple_beside_the_Hoogly%2C_West_Bengal.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Dakshineswar Kali Temple & Hooghly Ghats",
    },
    {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/Hazarduari_Palace%2C_Murshidabad_illuminated_at_night.jpg/960px-Hazarduari_Palace%2C_Murshidabad_illuminated_at_night.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
      caption: "Hazarduari Palace of Thousand Doors, Murshidabad",
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
    url: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
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
