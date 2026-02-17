-- Reference URLs backfill — adds reference_url to places and people that lack one.
-- Points to BibleGateway encyclopedia and OpenBible.info for places.

begin;

-- ── Place reference URLs (BibleGateway resources) ─────────────────────────
-- Using BibleGateway passage search for the key scripture associated with each place.

update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Genesis+12%3A6-7&version=ESV' where place_id = 'shechem' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Genesis+28%3A10-22&version=ESV' where place_id = 'bethel' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Joshua+6&version=ESV' where place_id = 'jericho' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Genesis+13%3A18&version=ESV' where place_id = 'hebron' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Genesis+21%3A31-34&version=ESV' where place_id = 'beersheba' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Joshua+10%3A1-15&version=ESV' where place_id = 'gibeon' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Judges+4-5&version=ESV' where place_id = 'hazor' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=1+Kings+9%3A15&version=ESV' where place_id = 'megiddo' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Judges+18&version=ESV' where place_id = 'dan' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=1+Samuel+17&version=ESV' where place_id = 'valley-of-elah' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Jonah+1%3A3&version=ESV' where place_id = 'joppa' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=1+Kings+5&version=ESV' where place_id = 'tyre' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Numbers+13-14&version=ESV' where place_id = 'kadesh-barnea' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Genesis+19&version=ESV' where place_id = 'sodom' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Genesis+32%3A22-32&version=ESV' where place_id = 'penuel' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Deuteronomy+34&version=ESV' where place_id = 'mt-nebo' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Esther+1&version=ESV' where place_id = 'susa' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Exodus+14&version=ESV' where place_id = 'red-sea' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Exodus+17%3A1-7&version=ESV' where place_id = 'rephidim' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=1+Samuel+24&version=ESV' where place_id = 'en-gedi' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=1+Kings+21&version=ESV' where place_id = 'jezreel' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Judges+16&version=ESV' where place_id = 'gaza' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=2+Kings+5&version=ESV' where place_id = 'damascus' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=1+Kings+16%3A24&version=ESV' where place_id = 'samaria' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Genesis+8%3A4&version=ESV' where place_id = 'mt-ararat' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Genesis+2%3A8-14&version=ESV' where place_id = 'garden-of-eden' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=1+Kings+17%3A8-24&version=ESV' where place_id = 'zarephath' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=1+Kings+22&version=ESV' where place_id = 'ramoth-gilead' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=2+Kings+18-19&version=ESV' where place_id = 'lachish' and reference_url is null;
update public."BP_Places" set reference_url = 'https://www.biblegateway.com/passage/?search=Jeremiah+46%3A2&version=ESV' where place_id = 'carchemish' and reference_url is null;

-- ── People reference URLs ─────────────────────────────────────────────────
-- Key figures linked to their primary scripture passage.

update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Genesis+1-3&version=ESV' where person_id = 'adam' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Genesis+2-3&version=ESV' where person_id = 'eve' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Genesis+6-9&version=ESV' where person_id = 'noah' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Genesis+12-25&version=ESV' where person_id = 'abraham' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Genesis+12-23&version=ESV' where person_id = 'sarah' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Genesis+21-28&version=ESV' where person_id = 'isaac' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Genesis+25-50&version=ESV' where person_id = 'jacob' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Genesis+37-50&version=ESV' where person_id = 'joseph' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Exodus+3&version=ESV' where person_id = 'moses' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Joshua+1&version=ESV' where person_id = 'joshua' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Judges+4&version=ESV' where person_id = 'deborah' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=1+Samuel+3&version=ESV' where person_id = 'samuel' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=1+Samuel+16&version=ESV' where person_id = 'david' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=1+Kings+3&version=ESV' where person_id = 'solomon' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=1+Kings+17&version=ESV' where person_id = 'elijah' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=2+Kings+2&version=ESV' where person_id = 'elisha' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Isaiah+6&version=ESV' where person_id = 'isaiah' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Jeremiah+1&version=ESV' where person_id = 'jeremiah' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Daniel+1&version=ESV' where person_id = 'daniel' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Ezekiel+1&version=ESV' where person_id = 'ezekiel' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Nehemiah+1&version=ESV' where person_id = 'nehemiah' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Ezra+7&version=ESV' where person_id = 'ezra' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=1+Samuel+9&version=ESV' where person_id = 'saul' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Ruth+1&version=ESV' where person_id = 'ruth' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Judges+13&version=ESV' where person_id = 'samson' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Judges+6&version=ESV' where person_id = 'gideon' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Esther+2&version=ESV' where person_id = 'esther' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Daniel+3&version=ESV' where person_id = 'shadrach' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Ezra+3&version=ESV' where person_id = 'zerubbabel' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=Jonah+1&version=ESV' where person_id = 'jonah' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=2+Kings+22&version=ESV' where person_id = 'josiah' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=2+Kings+18&version=ESV' where person_id = 'hezekiah' and reference_url is null;
update public."BP_People" set reference_url = 'https://www.biblegateway.com/passage/?search=1+Kings+16%3A29-34&version=ESV' where person_id = 'ahab' and reference_url is null;

commit;
