// Run this in the browser console after loading the site (and after you add your real Firebase config to js/firebase-config.js)
(async function(){
  if(!window.db){ alert('window.db not found. Ensure Firebase is configured and page reloaded.'); return; }
  const sampleSnacks = [
    { name: 'Banana Chips', description: 'Crunchy, lightly salted banana chips.', category: 'Chips', price: 45 },
    { name: 'Chicharon', description: 'Crispy pork rind, perfect with rice.', category: 'Savory', price: 60 },
    { name: 'Otap', description: 'Buttery, flaky pastry from Leyte.', category: 'Pastry', price: 30 },
    { name: 'Kwek-Kwek', description: 'Quail eggs coated in orange batter.', category: 'Street Food', price: 25 },
    { name: 'Fishball', description: 'Fried fish ball skewers with sauce.', category: 'Street Food', price: 35 }
  ];
  try{
    for(const s of sampleSnacks){
      await window.db.collection('snacks').add(s);
      console.log('added', s.name);
    }
    alert('Seed complete');
  }catch(e){ console.error(e); alert('Seed failed: '+ e.message); }
})();
