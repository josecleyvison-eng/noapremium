/* =====================================================
   NOÁ PREMIUM — script.js
===================================================== */

(() => {
  'use strict';

  // ===== NAVBAR: scroll effect =====
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== HAMBURGER / MOBILE MENU =====
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('mobile-open');
    hamburger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ===== SMOOTH SCROLL (polyfill already handled by CSS scroll-behavior) =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = navbar.offsetHeight + 8;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ===== SCROLL REVEAL =====
  const revealEls = document.querySelectorAll(
    '.section-header, .sobre-grid > *, .catalog-card, .diff-card, .info-item, .contato-map, .stat, .quote-banner blockquote, .quote-banner cite'
  );

  // Add reveal classes
  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger cards in a grid
    const parent = el.parentElement;
    if (parent && (parent.classList.contains('catalog-grid') || parent.classList.contains('diff-grid'))) {
      const siblings = Array.from(parent.children);
      const idx = siblings.indexOf(el);
      if (idx > 0) el.classList.add(`reveal-delay-${Math.min(idx, 5)}`);
    }
  });

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => revealObserver.observe(el));

  // ===== CATÁLOGO + CARRINHO =====
  const LS_PRODUCTS  = 'noa_products';
  const LS_CART      = 'noa_cart';
  const WA_NUMBER    = '5514981700479';

  const DEFAULT_PRODUCTS = [
    { id:1, name:'Picanha',    cat:'bovino',  unit:'kg',      desc:'O corte mais amado do Brasil. Cobertura de gordura generosa, sabor marcante e textura macia incomparáveis.',          price:null, img:'https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?w=600&q=80', featured:true,  active:true },
    { id:2, name:'Costela',    cat:'bovino',  unit:'kg',      desc:'Assada lentamente até desprender do osso. A preferida das noites de fogo baixo e muita conversa.',               price:null, img:'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80', featured:false, active:true },
    { id:3, name:'Filé Mignon', cat:'bovino',  unit:'kg',      desc:'O mais macio dos cortes. Ideal para medalhões, rosbife e preparos sofisticados à la carte.',                  price:null, img:'https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80', featured:false, active:true },
    { id:4, name:'Contrafilé', cat:'bovino',  unit:'kg',      desc:'Equilíbrio perfeito entre maciez e sabor. Versátil para grelhados, assados e churrascos.',               price:null, img:'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80', featured:false, active:true },
    { id:5, name:'Fraldinha',  cat:'bovino',  unit:'kg',      desc:'Fibras longas e sabor intenso. Perfeita fatiada na chapa ou no ponto certo da brasa.',                       price:null, img:'https://images.unsplash.com/photo-1544025162-d76538561e34?w=600&q=80', featured:false, active:true },
    { id:6, name:'T-Bone',     cat:'especial',unit:'unidade', desc:'Dois cortes em um: filé mignon e contrafilé separados pelo osso T. Uma experiência completa.',            price:null, img:'https://images.unsplash.com/photo-1615361200141-f45040f367be?w=600&q=80', featured:false, active:true },
    { id:7, name:'Wagyu',      cat:'gourmet', unit:'kg',      desc:'Marmorização excepcional, sabor único e textura que derrete na boca. O rei dos cortes premium.',           price:null, img:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80', featured:true,  active:true },
    { id:8, name:'Dry Aged',   cat:'gourmet', unit:'kg',      desc:'Maturado a seco por tempo controlado. Concentração de sabor e maciez incomparáveis para os entendidos.', price:null, img:'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&q=80', featured:false, active:true },
    { id:9, name:'Prime Rib',  cat:'especial',unit:'kg',      desc:'Corte nobre com osso, generosa marmorização e sabor robusto. Para os grandes momentos à mesa.',          price:null, img:'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80', featured:false, active:true },
  ];

  // ── Cache em memória (preenchido por initFromDB) ──
  let _productsCache = null;
  let _promosCache   = null;

  function getProducts() {
    return _productsCache || DEFAULT_PRODUCTS.slice();
  }

  // ── Cart state ──
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(LS_CART)) || []; } catch { cart = []; }

  function saveCart() { localStorage.setItem(LS_CART, JSON.stringify(cart)); }

  function getCartQty(id) { const it = cart.find(c => c.id === id); return it ? it.qty : 0; }

  function setCartQty(id, qty) {
    const idx = cart.findIndex(c => c.id === id);
    if (qty <= 0) { if (idx >= 0) cart.splice(idx, 1); }
    else if (idx >= 0) { cart[idx].qty = qty; }
    else { cart.push({ id, qty }); }
    saveCart();
    updateCartBadge();
    updateCartDrawer();
  }

  function updateCartBadge() {
    const total = cart.reduce((s, c) => s + c.qty, 0);
    const badge = document.getElementById('cartBadge');
    if (badge) { badge.textContent = total; badge.classList.toggle('has-items', total > 0); }
    // float badge
    const floatBadge = document.getElementById('cartFloatBadge');
    if (floatBadge) {
      floatBadge.textContent = total;
      floatBadge.style.display = total > 0 ? 'flex' : 'none';
    }
  }

  // ── Catalog render ──
  const catalogGrid   = document.getElementById('catalogGrid');
  const catalogEmpty  = document.getElementById('catalogEmpty');
  const catalogFilter = document.getElementById('catalogFilter');
  let currentFilter   = 'all';

  const CAT_LABEL  = { bovino: 'Bovino', especial: 'Especial', gourmet: 'Gourmet', diaadia: 'Dia a Dia', emporio: 'Empório', suinos: 'Suínos', cordeiros: 'Cordeiros', frango: 'Frango' };
  const UNIT_LABEL = { kg: 'kg', unidade: 'unidade', pacote: 'pacote', bandeja: 'bandeja' };

  function renderCatalog() {
    if (!catalogGrid) return;
    const products = getProducts().filter(p => p.active);
    const visible  = products.filter(p => currentFilter === 'all' || p.cat === currentFilter);

    if (!visible.length) {
      catalogGrid.innerHTML = '';
      if (catalogEmpty) catalogEmpty.style.display = 'block';
      return;
    }
    if (catalogEmpty) catalogEmpty.style.display = 'none';

    catalogGrid.innerHTML = visible.map(p => {
      const qty = getCartQty(p.id);
      return `
        <div class="catalog-card reveal" data-id="${p.id}">
          <div class="catalog-img" style="background-image:url('${p.img}')">
            ${p.featured ? '<span class="catalog-featured">Destaque</span>' : ''}
          </div>
          <div class="catalog-info">
            <span class="cut-cat">${CAT_LABEL[p.cat] || p.cat}</span>
            <h3>${p.name}</h3>
            ${p.desc ? `<p>${p.desc}</p>` : ''}
            <div class="catalog-bottom">
              ${p.price ? `<span class="catalog-price">R$ ${p.price.toFixed(2).replace('.', ',')}<small>/${UNIT_LABEL[p.unit] || p.unit}</small></span>` : `<span class="catalog-unit">${UNIT_LABEL[p.unit] || p.unit}</span>`}
              <div class="catalog-qty ${qty > 0 ? 'has-qty' : ''}" id="qty-${p.id}">
                ${qty > 0 ? `
                  <button class="qty-btn" data-id="${p.id}" data-act="minus">−</button>
                  <span class="qty-num">${qty}</span>
                  <button class="qty-btn" data-id="${p.id}" data-act="plus">+</button>
                ` : `
                  <button class="btn-add-cart" data-id="${p.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M12 5v14M5 12h14"/></svg>
                    Adicionar
                  </button>
                `}
              </div>
            </div>
          </div>
        </div>`;
    }).join('');

    // re-observe reveal elements
    catalogGrid.querySelectorAll('.catalog-card').forEach((el, i) => {
      el.classList.add('reveal');
      if (i > 0) el.classList.add(`reveal-delay-${Math.min(i % 6, 5)}`);
      revealObserver.observe(el);
    });

    // bind buttons
    catalogGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        setCartQty(id, 1);
        renderQtyBlock(id);
      });
    });
    catalogGrid.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = parseInt(btn.dataset.id);
        const act = btn.dataset.act;
        const cur = getCartQty(id);
        setCartQty(id, act === 'plus' ? cur + 1 : cur - 1);
        renderQtyBlock(id);
      });
    });
  }

  function renderQtyBlock(id) {
    const block = document.getElementById(`qty-${id}`);
    if (!block) return;
    const qty = getCartQty(id);
    if (qty > 0) {
      block.className = 'catalog-qty has-qty';
      block.innerHTML = `
        <button class="qty-btn" data-id="${id}" data-act="minus">−</button>
        <span class="qty-num">${qty}</span>
        <button class="qty-btn" data-id="${id}" data-act="plus">+</button>`;
    } else {
      block.className = 'catalog-qty';
      block.innerHTML = `
        <button class="btn-add-cart" data-id="${id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M12 5v14M5 12h14"/></svg>
          Adicionar
        </button>`;
    }
    // re-bind
    const addBtn = block.querySelector('.btn-add-cart');
    if (addBtn) addBtn.addEventListener('click', () => { setCartQty(id, 1); renderQtyBlock(id); });
    block.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.act;
        const cur = getCartQty(id);
        setCartQty(id, act === 'plus' ? cur + 1 : cur - 1);
        renderQtyBlock(id);
      });
    });
  }

  // ── Catalog filter ──
  if (catalogFilter) {
    catalogFilter.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        catalogFilter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderCatalog();
      });
    });
  }

  // ── Cart Drawer ──
  const cartDrawer  = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartBody    = document.getElementById('cartBody');
  const cartTotal   = document.getElementById('cartTotal');
  const btnCart     = document.getElementById('btnCart');
  const cartClose   = document.getElementById('cartClose');
  const btnCheckout = document.getElementById('btnCheckout');

  function openCart()  { cartDrawer && cartDrawer.classList.add('open'); cartOverlay && cartOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; updateCartDrawer(); }
  function closeCart() { cartDrawer && cartDrawer.classList.remove('open'); cartOverlay && cartOverlay.classList.remove('open'); document.body.style.overflow = ''; }

  if (btnCart)     btnCart.addEventListener('click', openCart);
  const cartFloatBtn = document.getElementById('cartFloatBtn');
  if (cartFloatBtn) cartFloatBtn.addEventListener('click', openCart);
  if (cartClose)   cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  function updateCartDrawer() {
    if (!cartBody) return;
    const products = getProducts();

    if (!cart.length) {
      cartBody.innerHTML = '<div class="cart-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px;height:48px;color:var(--text-muted);margin-bottom:1rem"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg><p>Sua cesta está vazia.</p><span>Adicione produtos do catálogo.</span></div>';
      if (cartTotal) cartTotal.textContent = '—';
      if (btnCheckout) btnCheckout.disabled = true;
      return;
    }

    if (btnCheckout) btnCheckout.disabled = false;
    let totalPrice = 0;
    let hasPrice   = false;

    cartBody.innerHTML = cart.map(item => {
      // look up in catalog products OR promo virtual products
      const prod = products.find(p => p.id === item.id)
                || (window._promoProducts && window._promoProducts[item.id]);
      if (!prod) return '';
      const unitL = UNIT_LABEL[prod.unit] || prod.unit;
      let priceHtml = '';
      if (prod.price) {
        const sub = prod.price * item.qty;
        totalPrice += sub;
        hasPrice = true;
        priceHtml = `<span class="ci-price">R$ ${sub.toFixed(2).replace('.', ',')}</span>`;
      }
      return `
        <div class="cart-item">
          <div class="ci-img" style="background-image:url('${prod.img}')"></div>
          <div class="ci-info">
            <span class="ci-name">${prod.name}</span>
            <span class="ci-unit">${unitL}</span>
            ${priceHtml}
          </div>
          <div class="ci-qty">
            <button class="qty-btn" data-id="${item.id}" data-act="minus">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" data-id="${item.id}" data-act="plus">+</button>
          </div>
        </div>`;
    }).join('');

    if (cartTotal) cartTotal.textContent = hasPrice ? `R$ ${totalPrice.toFixed(2).replace('.', ',')}` : 'A confirmar';

    // bind qty btns inside cart
    cartBody.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = btn.dataset.id;
        const act = btn.dataset.act;
        const cur = getCartQty(id);
        setCartQty(id, act === 'plus' ? cur + 1 : cur - 1);
        renderQtyBlock(parseInt(id) || id);
        renderPromoQty && renderPromoQty(id);
        updateCartDrawer();
      });
    });
  }

  // ── Checkout via WhatsApp ──
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      const products = getProducts();
      if (!cart.length) return;
      const lines = cart.map(item => {
        const prod = products.find(p => p.id === item.id)
                  || (window._promoProducts && window._promoProducts[item.id]);
        if (!prod) return null;
        const unitL = UNIT_LABEL[prod.unit] || prod.unit;
        const priceInfo = prod.price ? ` — R$ ${(prod.price * item.qty).toFixed(2).replace('.', ',')}` : '';
        return `%E2%80%A2 ${encodeURIComponent(prod.name)}: ${item.qty} ${encodeURIComponent(unitL)}${priceInfo ? encodeURIComponent(priceInfo) : ''}`;
      }).filter(Boolean).join('%0A');
      const msg = `Ol%C3%A1%21+Gostaria+de+fazer+um+pedido+pelo+cat%C3%A1logo+No%C3%A1+Premium%3A%0A%0A${lines}%0A%0APoderia+confirmar+disponibilidade+e+valores%3F`;
      window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
    });
  }

  // ── Promoções da Semana ──
  const LS_PROMOS = 'noa_promos';

  function loadPromos() {
    return _promosCache || [];
  }

  const promosSection  = document.getElementById('promosSection');
  const promoCarousel  = document.getElementById('promoCarousel');
  const promoDots      = document.getElementById('promoDots');
  const promoPrev      = document.getElementById('promoPrev');
  const promoNext      = document.getElementById('promoNext');

  let promoIndex    = 0;
  let promoTotal    = 0;
  let promoTimer    = null;
  let promoItemW    = 0;

  function renderPromos() {
    if (!promosSection || !promoCarousel) return;
    const active = loadPromos().filter(p => p.active);
    promoTotal = active.length;

    if (!promoTotal) { promosSection.style.display = 'none'; return; }
    promosSection.style.display = '';

    promoCarousel.innerHTML = active.map(p => {
      const unitL = UNIT_LABEL[p.unit] || p.unit;
      const hasPromo = p.promoPrice !== null && p.promoPrice !== undefined && p.promoPrice !== '';
      const hasOrig  = p.originalPrice !== null && p.originalPrice !== undefined && p.originalPrice !== '';
      const qty = getCartQty('promo_' + p.id);
      return `
        <div class="promo-card" data-id="promo_${p.id}">
          <div class="promo-img" style="background-image:url('${p.img}')">
            <span class="promo-badge">Promoção</span>
          </div>
          <div class="promo-body">
            <span class="promo-cat">${unitL}</span>
            <h3 class="promo-name">${p.name}</h3>
            ${p.description ? `<p class="promo-desc">${p.description}</p>` : ''}
            <div class="promo-prices">
              ${hasOrig ? `<span class="promo-original">R$ ${parseFloat(p.originalPrice).toFixed(2).replace('.', ',')}</span>` : ''}
              ${hasPromo ? `<span class="promo-price">R$ ${parseFloat(p.promoPrice).toFixed(2).replace('.', ',')}<small>/${unitL}</small></span>` : (hasOrig ? '' : `<span class="promo-unit">${unitL}</span>`)}
            </div>
            <div class="catalog-qty ${qty > 0 ? 'has-qty' : ''}" id="qty-promo_${p.id}">
              ${qty > 0 ? `
                <button class="qty-btn" data-id="promo_${p.id}" data-act="minus">−</button>
                <span class="qty-num">${qty}</span>
                <button class="qty-btn" data-id="promo_${p.id}" data-act="plus">+</button>
              ` : `
                <button class="btn-add-cart" data-id="promo_${p.id}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M12 5v14M5 12h14"/></svg>
                  Adicionar
                </button>
              `}
            </div>
          </div>
        </div>`;
    }).join('');

    // Store promo product info for cart
    active.forEach(p => {
      const existing = getProducts().find(x => x.id === ('promo_' + p.id));
      if (!existing) {
        // inject a virtual product into memory for cart display
        window._promoProducts = window._promoProducts || {};
        window._promoProducts['promo_' + p.id] = {
          id: 'promo_' + p.id,
          name: '🏷️ ' + p.name,
          unit: p.unit,
          price: p.promoPrice !== null && p.promoPrice !== undefined && p.promoPrice !== '' ? parseFloat(p.promoPrice) : null,
          img: p.img,
        };
      }
    });

    // Build dots
    if (promoDots) {
      promoDots.innerHTML = active.map((_, i) =>
        `<button class="promo-dot ${i === 0 ? 'active' : ''}" data-i="${i}" aria-label="Slide ${i+1}"></button>`
      ).join('');
      promoDots.querySelectorAll('.promo-dot').forEach(d => {
        d.addEventListener('click', () => goToPromo(parseInt(d.dataset.i)));
      });
    }

    promoIndex = 0;
    bindPromoButtons();
    updatePromoPosition();
    startPromoTimer();
  }

  function bindPromoButtons() {
    if (!promoCarousel) return;
    promoCarousel.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        setCartQty(id, 1);
        renderPromoQty(id);
      });
    });
    promoCarousel.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = btn.dataset.id;
        const act = btn.dataset.act;
        const cur = getCartQty(id);
        setCartQty(id, act === 'plus' ? cur + 1 : cur - 1);
        renderPromoQty(id);
      });
    });
  }

  function renderPromoQty(id) {
    const block = document.getElementById(`qty-${id}`);
    if (!block) return;
    const qty = getCartQty(id);
    if (qty > 0) {
      block.className = 'catalog-qty has-qty';
      block.innerHTML = `
        <button class="qty-btn" data-id="${id}" data-act="minus">−</button>
        <span class="qty-num">${qty}</span>
        <button class="qty-btn" data-id="${id}" data-act="plus">+</button>`;
    } else {
      block.className = 'catalog-qty';
      block.innerHTML = `
        <button class="btn-add-cart" data-id="${id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M12 5v14M5 12h14"/></svg>
          Adicionar
        </button>`;
    }
    const addBtn = block.querySelector('.btn-add-cart');
    if (addBtn) addBtn.addEventListener('click', () => { setCartQty(id, 1); renderPromoQty(id); });
    block.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.act;
        const cur = getCartQty(id);
        setCartQty(id, act === 'plus' ? cur + 1 : cur - 1);
        renderPromoQty(id);
      });
    });
  }

  function goToPromo(i) {
    promoIndex = Math.max(0, Math.min(i, promoTotal - 1));
    updatePromoPosition();
    resetPromoTimer();
  }

  function updatePromoPosition() {
    if (!promoCarousel) return;
    const cards = promoCarousel.querySelectorAll('.promo-card');
    if (!cards.length) return;
    promoItemW = cards[0].offsetWidth + parseInt(getComputedStyle(promoCarousel).gap || 0);
    const visibleCount = Math.round(promoCarousel.offsetWidth / promoItemW) || 1;
    const maxIndex = Math.max(0, promoTotal - visibleCount);
    const clampedIndex = Math.min(promoIndex, maxIndex);
    promoCarousel.style.transform = `translateX(-${clampedIndex * promoItemW}px)`;
    // update dots
    if (promoDots) {
      promoDots.querySelectorAll('.promo-dot').forEach((d, i) => {
        d.classList.toggle('active', i === promoIndex);
      });
    }
    // show/hide arrows
    if (promoPrev) promoPrev.style.opacity = promoIndex <= 0 ? '0.3' : '1';
    if (promoNext) promoNext.style.opacity = promoIndex >= maxIndex ? '0.3' : '1';
  }

  function startPromoTimer() {
    if (promoTotal <= 1) return;
    promoTimer = setInterval(() => {
      const cards = promoCarousel ? promoCarousel.querySelectorAll('.promo-card') : [];
      const visibleCount = promoItemW > 0 ? Math.round(promoCarousel.offsetWidth / promoItemW) || 1 : 1;
      const maxIndex = Math.max(0, promoTotal - visibleCount);
      promoIndex = promoIndex >= maxIndex ? 0 : promoIndex + 1;
      updatePromoPosition();
    }, 4500);
  }

  function resetPromoTimer() {
    clearInterval(promoTimer);
    startPromoTimer();
  }

  if (promoPrev) promoPrev.addEventListener('click', () => { goToPromo(promoIndex - 1); });
  if (promoNext) promoNext.addEventListener('click', () => { goToPromo(promoIndex + 1); });

  // Touch swipe on carousel
  if (promoCarousel) {
    let tsX = 0;
    promoCarousel.addEventListener('touchstart', e => { tsX = e.touches[0].clientX; }, { passive: true });
    promoCarousel.addEventListener('touchend', e => {
      const dx = tsX - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 40) dx > 0 ? goToPromo(promoIndex + 1) : goToPromo(promoIndex - 1);
    }, { passive: true });
  }

  // Patch getProducts to include promo virtual entries for cart drawer
  const _origGetProducts = getProducts;
  function getProductsWithPromos() {
    const base = _origGetProducts();
    const extras = Object.values(window._promoProducts || {});
    return [...base, ...extras];
  }

  // ── Init: carrega dados do Firestore (ou localStorage como fallback) ──
  async function initFromDB() {
    if (typeof db !== 'undefined') {
      try {
        // Produtos
        const pSnap = await db.collection('noa_products').orderBy('id').get();
        if (pSnap.empty) {
          // Semente inicial com DEFAULT_PRODUCTS
          const batch = db.batch();
          DEFAULT_PRODUCTS.forEach(p =>
            batch.set(db.collection('noa_products').doc(String(p.id)), p)
          );
          await batch.commit();
          _productsCache = DEFAULT_PRODUCTS.slice();
        } else {
          _productsCache = pSnap.docs.map(d => d.data());
        }
        // Promoções
        const rSnap = await db.collection('noa_promos').orderBy('id').get();
        _promosCache = rSnap.docs.map(d => d.data());
      } catch (e) {
        console.warn('Firebase indisponível, usando fallback local:', e);
        _productsCache = (() => {
          try { const s = JSON.parse(localStorage.getItem(LS_PRODUCTS)); return s && s.length ? s : DEFAULT_PRODUCTS.slice(); } catch { return DEFAULT_PRODUCTS.slice(); }
        })();
        _promosCache = (() => {
          try { return JSON.parse(localStorage.getItem(LS_PROMOS)) || []; } catch { return []; }
        })();
      }
    } else {
      // Firebase não configurado — fallback para localStorage
      _productsCache = (() => {
        try { const s = JSON.parse(localStorage.getItem(LS_PRODUCTS)); return s && s.length ? s : DEFAULT_PRODUCTS.slice(); } catch { return DEFAULT_PRODUCTS.slice(); }
      })();
      _promosCache = (() => {
        try { return JSON.parse(localStorage.getItem(LS_PROMOS)) || []; } catch { return []; }
      })();
    }
    renderCatalog();
    updateCartBadge();
    renderPromos();
  }

  initFromDB();


  // ===== PARALLAX on hero (desktop only) =====
  const hero = document.querySelector('.hero');
  if (hero && window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
      hero.style.backgroundPositionY = `calc(50% + ${window.scrollY * 0.3}px)`;
    }, { passive: true });
  }

  // ===== ACTIVE NAV LINK on scroll =====
  const sections  = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navAnchors.forEach(a => {
            a.style.color = '';
            a.style.borderBottomColor = '';
          });
          const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
          if (active) active.style.color = 'var(--gold)';
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(s => sectionObserver.observe(s));

  // ===== CALCULADORA DE CHURRASCO =====
  const STATE = { men: 0, women: 0, kids: 0, tipo: 'padrao' };

  // gramas por pessoa por corte (base: tipo padrão)
  const CUTS_BASE = {
    picanha:  { label: 'Picanha',      men: 280, women: 200, kids: 130, unit: 'kg' },
    costela:  { label: 'Costela',      men: 320, women: 220, kids: 150, unit: 'kg' },
    fraldinha:{ label: 'Fraldinha',    men: 220, women: 160, kids: 100, unit: 'kg' },
    linguica: { label: 'Linguiça',     men: 180, women: 130, kids: 90,  unit: 'kg' },
    frango:   { label: 'Frango',       men: 300, women: 220, kids: 150, unit: 'kg' },
    maminha:  { label: 'Maminha',      men: 250, women: 180, kids: 120, unit: 'kg' },
    cordeiro: { label: 'Cordeiro',     men: 250, women: 180, kids: 120, unit: 'kg' },
    paoalho:  { label: 'Pão de Alho',  men: 2,   women: 1.5, kids: 1,   unit: 'un' },
  };

  const TIPO_MULT = { leve: 0.7, padrao: 1, pesado: 1.35 };

  function calcular() {
    const resTotal = document.getElementById('result-total');
    if (!resTotal) return; // não estamos na página da calculadora

    const mult   = TIPO_MULT[STATE.tipo];
    const checks = document.querySelectorAll('.calc-cortes-check input[type="checkbox"]:checked');
    const list   = document.getElementById('result-list');
    const resKg  = document.getElementById('result-kg');

    const total = STATE.men + STATE.women + STATE.kids;
    resTotal.textContent = total;

    list.innerHTML = '';
    let totalGrams = 0;

    if (total === 0) {
      resKg.textContent = '0 kg';
      return;
    }

    checks.forEach(cb => {
      const key  = cb.dataset.cut;
      const cut  = CUTS_BASE[key];
      if (!cut) return;

      const raw = (cut.men * STATE.men + cut.women * STATE.women + cut.kids * STATE.kids) * mult;

      let display, unit;
      if (cut.unit === 'un') {
        display = Math.ceil(raw);
        unit    = 'unid.';
      } else {
        const kg = raw / 1000;
        // round to nearest 0.25
        display = (Math.ceil(kg * 4) / 4).toFixed(2).replace('.', ',');
        unit    = 'kg';
        totalGrams += raw;
      }

      const item = document.createElement('div');
      item.className = 'result-item';
      item.innerHTML = `
        <span class="result-item-name">${cut.label}</span>
        <span class="result-item-qty">${display} <span class="result-item-unit">${unit}</span></span>
      `;
      list.appendChild(item);
    });

    const totalKg = totalGrams / 1000;
    resKg.textContent = (Math.ceil(totalKg * 4) / 4).toFixed(2).replace('.', ',') + ' kg';

    // update WhatsApp link with the list
    const btnPedir = document.getElementById('btn-pedir');
    if (btnPedir) {
      const items = Array.from(list.querySelectorAll('.result-item')).map(i => {
        const name = i.querySelector('.result-item-name').textContent;
        const qty  = i.querySelector('.result-item-qty').textContent.trim();
        return `• ${name}: ${qty}`;
      }).join('%0A');
      const msg = `Olá! Preciso de carnes para um churrasco de ${total} pessoas (tipo: ${STATE.tipo}).%0A%0A${items}%0A%0APoderia me ajudar?`;
      btnPedir.href = `https://wa.me/5514981700479?text=${msg}`;
    }
  }

  // Counters
  document.querySelectorAll('.counter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.target;
      const act = btn.dataset.action;
      if (act === 'plus')  STATE[key] = Math.min(STATE[key] + 1, 200);
      if (act === 'minus') STATE[key] = Math.max(STATE[key] - 1, 0);
      document.getElementById(`val-${key}`).textContent = STATE[key];
      calcular();
    });
  });

  // Tipo buttons
  document.querySelectorAll('.tipo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tipo-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.tipo = btn.dataset.tipo;
      calcular();
    });
  });

  // Checkboxes
  document.querySelectorAll('.calc-cortes-check input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', calcular);
  });

  // Init
  calcular();

})();
