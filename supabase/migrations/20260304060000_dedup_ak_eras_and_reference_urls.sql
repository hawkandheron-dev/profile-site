-- Remove duplicate eras (era-* prefixed copies). Kingdoms reference the non-prefixed IDs.
DELETE FROM public."AK_Eras"
WHERE era_id IN ('era-ancient', 'era-classical', 'era-medieval', 'era-late-medieval', 'era-early-modern');

-- Add reference URLs to all AK_Events
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Twenty-fifth_Dynasty_of_Egypt' WHERE event_id = 'kush-conquers-egypt';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Mero%C3%AB' WHERE event_id = 'meroe-capital';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Ancient_Carthage#Foundation_legends' WHERE event_id = 'carthage-founded';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Battle_of_Cannae' WHERE event_id = 'battle-cannae';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Battle_of_Carthage_(c._149_BC)' WHERE event_id = 'fall-carthage';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Nok_culture#Iron_smelting' WHERE event_id = 'nok-ironworking';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Ezana_of_Axum#Conversion_to_Christianity' WHERE event_id = 'aksum-christianity';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Ezana_of_Axum#Military_campaigns' WHERE event_id = 'aksum-conquers-meroe';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Aksumite%E2%80%93Himyarite_wars' WHERE event_id = 'aksum-yemen';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Cairo#Foundation_and_early_growth' WHERE event_id = 'fatimid-cairo';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Al-Azhar_University' WHERE event_id = 'al-azhar-founded';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Ghana_Empire#Golden_age' WHERE event_id = 'ghana-peak';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Marrakech#History' WHERE event_id = 'almoravid-marrakech';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Ghana_Empire#Decline' WHERE event_id = 'almoravid-ghana';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Rock-hewn_churches_of_Lalibela' WHERE event_id = 'lalibela-churches';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Kilwa_Sultanate#Gold_trade' WHERE event_id = 'kilwa-gold-trade';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Battle_of_Kirina' WHERE event_id = 'battle-kirina';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Kouroukan_Fouga' WHERE event_id = 'manden-charter';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Sankore_Madrasah' WHERE event_id = 'sankore-university';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Mansa_Musa#Pilgrimage_to_Mecca' WHERE event_id = 'mansa-musa-hajj';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Ibn_Battuta#Mali' WHERE event_id = 'ibn-battuta-mali';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Ethiopian_Empire#Solomonic_dynasty' WHERE event_id = 'ethiopia-solomonic';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Great_Zimbabwe' WHERE event_id = 'great-zimbabwe-peak';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Songhai_Empire#Sunni_Ali' WHERE event_id = 'songhai-timbuktu';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Songhai_Empire#Sunni_Ali' WHERE event_id = 'songhai-djenne';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Askia_Muhammad_I#Pilgrimage' WHERE event_id = 'askia-pilgrimage';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Battle_of_Tondibi' WHERE event_id = 'battle-tondibi';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Benin_City#Historical_walls' WHERE event_id = 'benin-walls';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Benin_Empire#Portuguese_contact' WHERE event_id = 'benin-portuguese';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Kingdom_of_Kongo#Christianity' WHERE event_id = 'kongo-christianity';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Afonso_I_of_Kongo#Slave_trade' WHERE event_id = 'afonso-letters';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Battle_of_Mbwila' WHERE event_id = 'battle-mbwila';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Golden_Stool' WHERE event_id = 'golden-stool';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Kingdom_of_Whydah#Conquest_by_Dahomey' WHERE event_id = 'dahomey-coast';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Gondar#History' WHERE event_id = 'gondar-founded';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Kingdom_of_Mutapa#Portuguese_contact' WHERE event_id = 'mutapa-portuguese';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Rozwi_Empire' WHERE event_id = 'rozwi-expel-portuguese';
UPDATE public."AK_Events" SET reference_url = 'https://en.wikipedia.org/wiki/Kanem%E2%80%93Bornu_Empire#Idris_Alooma' WHERE event_id = 'kanem-bornu-firearms';

-- Add reference URLs to remaining places
UPDATE public."AK_Places" SET reference_url = 'https://en.wikipedia.org/wiki/Kingdom_of_Mutapa' WHERE place_id = 'mt-fura';
UPDATE public."AK_Places" SET reference_url = 'https://en.wikipedia.org/wiki/Musumba' WHERE place_id = 'musumba';
UPDATE public."AK_Places" SET reference_url = 'https://en.wikipedia.org/wiki/Luba_Kingdom' WHERE place_id = 'mwibele';
