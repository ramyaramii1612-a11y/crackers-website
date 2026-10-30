'use strict';
const $ = (s, r = document) => r.querySelector(s);
const money = n => '₹' + Math.round(n).toLocaleString('en-IN');

/* ---------- Data ---------- */
const categories = [
  { name: 'Sparklers', icon: '✨' }, { name: 'Flower Pots', icon: '🌸' },
  { name: 'Rockets', icon: '🚀' }, { name: 'Sky Shots', icon: '🎆' },
  { name: 'Chakras', icon: '🌀' }, { name: 'Bombs', icon: '💥' },
  { name: 'Kids Special', icon: '🧒' }, { name: 'Gift Boxes', icon: '🎁' }
];
const gradIndex = Object.fromEntries(categories.map((c, i) => [c.name, i]));
const gradients = [
  'linear-gradient(135deg,#ff9d00,#ff4d00)', 'linear-gradient(135deg,#ff2e93,#8b0a1a)',
  'linear-gradient(135deg,#7b2ff7,#2a0a6a)', 'linear-gradient(135deg,#ffc83d,#d9480f)',
  'linear-gradient(135deg,#e91e8c,#6a1b9a)', 'linear-gradient(135deg,#c1121f,#3a0510)',
  'linear-gradient(135deg,#00b4a6,#5b2a86)', 'linear-gradient(135deg,#ffb703,#9d0208)'
];
// [id, name, category, mrp, discount%, emoji, rating]
const products = [
  [1, 'Golden Sparklers (10 pcs)', 'Sparklers', 120, 30, '✨', 5],
  [2, 'Colour Sparklers (Pack of 5)', 'Sparklers', 150, 35, '🌟', 4],
  [3, 'Giant Flower Pot', 'Flower Pots', 180, 40, '🌸', 5],
  [4, 'Deluxe Flower Pot (5 pcs)', 'Flower Pots', 320, 45, '🌼', 4],
  [5, 'Whistling Rocket (10 pcs)', 'Rockets', 260, 35, '🚀', 4],
  [6, 'Rainbow Rocket Pack', 'Rockets', 380, 40, '🌈', 5],
  [7, '7-Shot Sky Blaster', 'Sky Shots', 450, 45, '🎆', 5],
  [8, '30-Shot Multicolour Fancy', 'Sky Shots', 1200, 50, '🎇', 5],
  [9, 'Ground Chakra (10 pcs)', 'Chakras', 110, 25, '🌀', 4],
  [10, 'Spinning Wheel Chakra', 'Chakras', 190, 30, '🎡', 4],
  [11, 'Lakshmi Bomb (10 pcs)', 'Bombs', 140, 20, '💥', 4],
  [12, 'Atom Bomb Mega Pack', 'Bombs', 300, 30, '🧨', 3],
  [13, 'Kids Pencil & Snake Combo', 'Kids Special', 150, 40, '🐍', 5],
  [14, 'Kids Pop-Pop Fun Box', 'Kids Special', 220, 45, '🎈', 4],
  [15, 'Family Diwali Gift Box', 'Gift Boxes', 1500, 60, '🎁', 5],
  [16, 'Premium Celebration Box', 'Gift Boxes', 2800, 55, '🎊', 5]
].map(([id, name, cat, mrp, off, img, rate]) => ({ id, name, cat, mrp, off, img, rate, price: Math.round(mrp * (100 - off) / 100) }));

const gallery = [
  ['🎆', 'Sky full of colour'], ['🪔', 'Lamps of Diwali'], ['✨', 'Sparkler evenings'],
  ['🎇', 'Fireworks finale'], ['🌸', 'Flower pot glow'], ['🎁', 'Festive gift boxes'],
  ['🚀', 'Rockets to the stars'], ['🧒', 'Kids celebrating']
];
const reviews = [
  ['Priya S.', 'Salem', 'Best prices in the area! The gift box was packed beautifully and every cracker worked perfectly.', 5],
  ['Karthik R.', 'Tiruchengode', 'The sky shots were spectacular. Delivery came a day early and the staff were very helpful.', 5],
  ['Meena V.', 'Namakkal', 'Safe crackers for the kids and great discounts. We have been buying from Ramya for years.', 4],
  ['Arun M.', 'Erode', 'Ordered in bulk for our apartment event. Fair pricing and smooth billing.', 5]
];

/* ---------- State ---------- */
let cart = {};
try { cart = JSON.parse(localStorage.getItem('ramyaCart')) || {}; } catch (e) { cart = {}; }
let coupon = false, activeCat = 'All';
const qtyOnCard = {};

const save = () => { try { localStorage.setItem('ramyaCart', JSON.stringify(cart)); } catch (e) {} };
let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------- Render: categories, chips, gallery, reviews ---------- */
$('#cats').innerHTML = categories.map((c, i) => {
  const n = products.filter(p => p.cat === c.name).length;
  return `<button class="cat g${i}" data-cat="${c.name}"><span>${c.icon}</span>${c.name}<small>${n} items</small></button>`;
}).join('');
$('#chips').innerHTML = ['All', ...categories.map(c => c.name)]
  .map(n => `<button class="chip${n === 'All' ? ' active' : ''}" data-cat="${n}">${n}</button>`).join('');
$('#galleryGrid').innerHTML = gallery.map(([e, c], i) =>
  `<div class="gtile" style="background:${gradients[i]}" data-cap="${c}">${e}</div>`).join('');
$('#reviewGrid').innerHTML = reviews.map(([n, city, t, r]) =>
  `<article class="review"><div class="stars">${'★'.repeat(r)}${'☆'.repeat(5 - r)}</div><p>“${t}”</p>
   <div class="who"><div class="av">${n[0]}</div><div><b>${n}</b><small>${city}</small></div></div></article>`).join('');

/* ---------- Products ---------- */
function renderProducts() {
  const q = $('#search').value.trim().toLowerCase();
  let list = products.filter(p => (activeCat === 'All' || p.cat === activeCat) &&
    (p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)));
  const s = $('#sort').value;
  if (s === 'low') list.sort((a, b) => a.price - b.price);
  if (s === 'high') list.sort((a, b) => b.price - a.price);
  if (s === 'disc') list.sort((a, b) => b.off - a.off);
  $('#empty').hidden = list.length > 0;
  $('#grid').innerHTML = list.map(p => `
    <article class="card">
      <span class="badge">${p.off}% OFF</span>
      <div class="pimg" style="background:${gradients[gradIndex[p.cat]]}" role="img" aria-label="${p.name}">${p.img}</div>
      <div class="pbody">
        <div class="pcat">${p.cat}</div>
        <h3>${p.name}</h3>
        <div class="stars">${'★'.repeat(p.rate)}${'☆'.repeat(5 - p.rate)}</div>
        <div class="price"><b>${money(p.price)}</b><s>${money(p.mrp)}</s></div>
        <div class="actions">
          <div class="qty">
            <button data-act="dec" data-id="${p.id}" aria-label="Decrease quantity">−</button>
            <span id="q${p.id}">${qtyOnCard[p.id] || 1}</span>
            <button data-act="inc" data-id="${p.id}" aria-label="Increase quantity">+</button>
          </div>
          <button class="add" data-act="add" data-id="${p.id}">Add to Cart</button>
        </div>
      </div>
    </article>`).join('');
}

$('#grid').addEventListener('click', e => {
  const b = e.target.closest('button[data-act]'); if (!b) return;
  const id = +b.dataset.id, cur = qtyOnCard[id] || 1;
  if (b.dataset.act === 'inc') qtyOnCard[id] = Math.min(cur + 1, 99);
  if (b.dataset.act === 'dec') qtyOnCard[id] = Math.max(cur - 1, 1);
  if (b.dataset.act === 'add') {
    cart[id] = Math.min((cart[id] || 0) + cur, 99); qtyOnCard[id] = 1;
    toast(`Added ${cur} × ${products.find(p => p.id === id).name}`);
    const cb = $('#openCart'); cb.classList.remove('bump'); void cb.offsetWidth; cb.classList.add('bump');
    renderCart();
  }
  $('#q' + id).textContent = qtyOnCard[id] || 1;
});

function setCategory(name) {
  activeCat = name;
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.cat === name));
  renderProducts();
}
$('#chips').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) setCategory(b.dataset.cat); });
$('#cats').addEventListener('click', e => {
  const b = e.target.closest('.cat'); if (!b) return;
  setCategory(b.dataset.cat); $('#products').scrollIntoView({ behavior: 'smooth' });
});
$('#search').addEventListener('input', renderProducts);
$('#sort').addEventListener('change', renderProducts);

/* ---------- Cart ---------- */
function totals() {
  const sub = Object.entries(cart).reduce((s, [id, q]) => s + products.find(p => p.id == id).price * q, 0);
  const disc = coupon ? sub * 0.1 : 0;
  const after = sub - disc;
  const ship = after === 0 || after >= 2000 ? 0 : 99;
  return { sub, disc, ship, total: after + ship };
}
function renderCart() {
  const ids = Object.keys(cart);
  $('#cartCount').textContent = Object.values(cart).reduce((a, b) => a + b, 0);
  $('#cartItems').innerHTML = ids.length ? ids.map(id => {
    const p = products.find(x => x.id == id), q = cart[id];
    return `<div class="citem">
      <div class="cthumb" style="background:${gradients[gradIndex[p.cat]]}">${p.img}</div>
      <div><h4>${p.name}</h4><small>${money(p.price)} each</small>
        <div class="qty"><button data-c="dec" data-id="${id}" aria-label="Decrease">−</button><span>${q}</span><button data-c="inc" data-id="${id}" aria-label="Increase">+</button></div></div>
      <div><b>${money(p.price * q)}</b><br><button class="rm" data-c="rm" data-id="${id}" aria-label="Remove item">🗑</button></div></div>`;
  }).join('') : '<p class="cart-empty">🪔 Your cart is empty.<br>Add some sparkle!</p>';
  const t = totals();
  $('#subtotal').textContent = money(t.sub);
  $('#couponRow').hidden = !coupon;
  $('#couponAmt').textContent = '-' + money(t.disc);
  $('#delivery').textContent = t.ship ? money(t.ship) : 'FREE';
  $('#total').textContent = money(t.total);
  save();
}
$('#cartItems').addEventListener('click', e => {
  const b = e.target.closest('button[data-c]'); if (!b) return;
  const id = b.dataset.id;
  if (b.dataset.c === 'inc') cart[id] = Math.min(cart[id] + 1, 99);
  if (b.dataset.c === 'dec') cart[id] = cart[id] - 1;
  if (b.dataset.c === 'rm' || cart[id] <= 0) delete cart[id];
  renderCart();
});
const drawer = $('#drawer'), overlay = $('#overlay');
const toggleCart = open => { drawer.classList.toggle('open', open); overlay.classList.toggle('show', open); };
$('#openCart').onclick = () => toggleCart(true);
$('#closeCart').onclick = overlay.onclick = () => toggleCart(false);
document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleCart(false); });
$('#applyCoupon').onclick = () => {
  const v = $('#coupon').value.trim().toUpperCase();
  if (v === 'DIWALI10') { coupon = true; toast('Coupon applied: extra 10% off'); }
  else { coupon = false; toast('Invalid coupon code'); }
  renderCart();
};
$('#checkout').onclick = () => {
  if (!Object.keys(cart).length) return toast('Your cart is empty');
  const t = totals(); cart = {}; coupon = false; $('#coupon').value = '';
  renderCart(); toggleCart(false);
  toast(`Order placed! Total ${money(t.total)}. Happy Diwali! 🎉`);
};

/* ---------- Nav, scroll, back-to-top ---------- */
$('#burger').onclick = () => $('#menu').classList.toggle('open');
$('#menu').addEventListener('click', e => { if (e.target.tagName === 'A') $('#menu').classList.remove('open'); });
addEventListener('scroll', () => {
  $('#nav').classList.toggle('scrolled', scrollY > 40);
  $('#toTop').classList.toggle('show', scrollY > 600);
}, { passive: true });
$('#toTop').onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

/* ---------- Countdown ---------- */
const diwali = new Date('2026-11-08T18:00:00+05:30').getTime();
function tick() {
  let d = diwali - Date.now();
  if (d <= 0) { $('#cdNote').textContent = 'Happy Diwali! 🪔'; d = 0; }
  const pad = n => String(n).padStart(2, '0');
  $('#cdD').textContent = pad(Math.floor(d / 864e5));
  $('#cdH').textContent = pad(Math.floor(d % 864e5 / 36e5));
  $('#cdM').textContent = pad(Math.floor(d % 36e5 / 6e4));
  $('#cdS').textContent = pad(Math.floor(d % 6e4 / 1e3));
}
tick(); setInterval(tick, 1000);

/* ---------- Animated stats ---------- */
const io = new IntersectionObserver(es => es.forEach(en => {
  if (!en.isIntersecting) return;
  const el = en.target, end = +el.dataset.count, t0 = performance.now();
  (function step(t) {
    const p = Math.min((t - t0) / 1500, 1);
    el.textContent = Math.round(end * p).toLocaleString('en-IN');
    if (p < 1) requestAnimationFrame(step);
  })(t0);
  io.unobserve(el);
}), { threshold: .6 });
document.querySelectorAll('[data-count]').forEach(el => io.observe(el));

/* ---------- Contact form ---------- */
$('#contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const n = $('#cName'), m = $('#cEmail'), g = $('#cMsg'), out = $('#formMsg');
  const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.value.trim());
  n.classList.toggle('err', !n.value.trim());
  m.classList.toggle('err', !okEmail);
  g.classList.toggle('err', g.value.trim().length < 10);
  if (!n.value.trim() || !okEmail || g.value.trim().length < 10) {
    out.className = 'form-msg bad';
    out.textContent = 'Please enter your name, a valid email and a message of at least 10 characters.';
    return;
  }
  out.className = 'form-msg ok';
  out.textContent = `Thank you, ${n.value.trim()}! We will contact you soon.`;
  e.target.reset();
});

/* ---------- Hero fireworks canvas ---------- */
(function fireworks() {
  const cv = $('#fireworks'), ctx = cv.getContext('2d');
  const colors = ['#ffc83d', '#ff7a1a', '#ff2e93', '#b46bff', '#ffffff'];
  let W, H, bursts = [];
  const resize = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
  resize(); addEventListener('resize', resize);
  function burst(x, y) {
    const c = colors[Math.random() * colors.length | 0], n = 50;
    bursts.push(...Array.from({ length: n }, (_, i) => {
      const a = Math.PI * 2 * i / n, s = 1.5 + Math.random() * 3;
      return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, c };
    }));
  }
  setInterval(() => burst(W * (.1 + Math.random() * .8), H * (.1 + Math.random() * .5)), 1100);
  cv.parentElement.addEventListener('click', e => { const r = cv.getBoundingClientRect(); burst(e.clientX - r.left, e.clientY - r.top); });
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  (function loop() {
    ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    bursts = bursts.filter(p => p.life > 0.02);
    bursts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += .04; p.vx *= .985; p.life *= .97;
      ctx.globalAlpha = p.life; ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, 7); ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  })();
})();

/* ---------- Init ---------- */
renderProducts();
renderCart();