/* Auvers — a native, reversible scroll story. No framework or scroll plugin. */
(() => {
  'use strict';

  const data = window.AUVERS_DATA;
  const hero = document.querySelector('.hero-scroll');
  const heroSticky = document.querySelector('.hero-sticky');
  const camera = document.querySelector('.hero-camera');
  const heroImage = document.getElementById('hero-image');
  const heroTitle = document.querySelector('.hero-title');
  const heroPortrait = document.querySelector('.hero-portrait');
  const doorCopy = document.querySelector('.door-copy');
  const heroBottom = document.querySelector('.hero-bottom');
  const mapStory = document.querySelector('.map-story');
  const mapSticky = document.querySelector('.map-sticky');
  const map = document.getElementById('journey-map');
  const walker = document.getElementById('walker');
  const walked = document.getElementById('route-walked');
  const chapters = [...document.querySelectorAll('.journey-chapter')];
  const dots = [...document.querySelectorAll('.chapter-dots button')];
  const placeLabel = document.querySelector('.route-place');
  const counter = document.querySelector('.route-progress-label');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let ticketTyping = null;
  const villageScroll = document.querySelector('.village-scroll');
  const villageStage = document.querySelector('.village-stage');
  const villageScenes = [...document.querySelectorAll('.village-scene')];
  const stopNames = ['Le château d’Auvers', 'Les Racines · rue Daubigny', 'L’auberge & la mairie', 'L’église d’Auvers', 'Le plateau', 'Le cimetière'];
  const stopAnchors = [0.04, 0.22, 0.40, 0.58, 0.76, 0.94];
  const ns = 'http://www.w3.org/2000/svg';
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smoothstep = (from, to, value) => {
    const x = clamp((value - from) / (to - from));
    return x * x * (3 - 2 * x);
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const svgNode = (tag, attributes, parent) => {
    const node = document.createElementNS(ns, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    parent.append(node);
    return node;
  };

  let viewportHeight = window.innerHeight;
  let heroStart = 0;
  let heroTravel = 1;
  let mapStart = 0;
  let mapTravel = 1;
  let mapProgress = 0;
  let visualProgress = 0;
  let previousVisualProgress = 0;
  let activeStop = -1;
  let routeLength = 1;
  let routeDistances = [0, .35, .65, 1];
  let animationFrame = 0;
  let navigationFrame = 0;
  let stepPhase = 0;
  let stopElements = [];
  let doorFocus = { x: 0, y: 0 };

  function project([lon, lat]) {
    // Local equirectangular projection, uniform scale, sourced OSM coordinates.
    const extent = { left: 2.1638, right: 2.1806, top: 49.0764, bottom: 49.0692 };
    const metresX = 73000;
    const metresY = 111200;
    const scale = Math.min(750 / ((extent.right - extent.left) * metresX), 570 / ((extent.top - extent.bottom) * metresY));
    const width = (extent.right - extent.left) * metresX * scale;
    const height = (extent.top - extent.bottom) * metresY * scale;
    return [(900 - width) / 2 + (lon - extent.left) * metresX * scale,
      (710 - height) / 2 + (extent.top - lat) * metresY * scale];
  }

  function linePath(coordinates) {
    return coordinates.map((coord, index) => {
      const [x, y] = project(coord);
      return `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
  }

  function buildMap() {
    if (!data || !map) return false;
    const defs = map.querySelector('defs');
    const clip = svgNode('clipPath', { id: 'map-bounds' }, defs);
    svgNode('rect', { x: 0, y: 0, width: 900, height: 710 }, clip);
    const roadGroup = document.getElementById('map-roads');
    const waterGroup = document.getElementById('map-water');
    roadGroup.setAttribute('clip-path', 'url(#map-bounds)');
    waterGroup.setAttribute('clip-path', 'url(#map-bounds)');
    const roadFragment = document.createDocumentFragment();
    const waterFragment = document.createDocumentFragment();
    data.features.forEach(feature => {
      const water = feature.properties.kind === 'water';
      const minor = ['footway', 'path', 'steps', 'track'].includes(feature.properties.kind);
      svgNode('path', {
        d: linePath(feature.geometry.coordinates),
        class: water ? 'map-water' : `map-road${minor ? ' small-road' : ''}`,
        'stroke-width': water ? 12 : minor ? 1.3 : ['residential', 'living_street', 'tertiary'].includes(feature.properties.kind) ? 4 : 2.2,
      }, water ? waterFragment : roadFragment);
    });
    roadGroup.append(roadFragment);
    waterGroup.append(waterFragment);

    const routePath = linePath(data.route);
    ['route-halo', 'route-base', 'route-walked'].forEach(id => document.getElementById(id).setAttribute('d', routePath));
    routeLength = walked.getTotalLength();
    walked.style.strokeDasharray = `${routeLength} ${routeLength}`;
    walked.style.strokeDashoffset = String(routeLength);

    const projectedRoute = data.route.map(project);
    const cumulative = [0];
    for (let i = 1; i < projectedRoute.length; i++) {
      cumulative.push(cumulative[i - 1] + Math.hypot(projectedRoute[i][0] - projectedRoute[i - 1][0], projectedRoute[i][1] - projectedRoute[i - 1][1]));
    }
    routeDistances = data.stopIndices.map(index => cumulative[index] / cumulative.at(-1));

    const labelGroup = document.getElementById('map-street-labels');
    [
      ['AUVERS-SUR-OISE', [2.1696, 49.0756]],
      ['L’Oise', [2.1753, 49.0695]],
    ].forEach(([text, coord]) => {
      const [x, y] = project(coord);
      const node = svgNode('text', { x, y, class: 'street-label', 'text-anchor': 'middle' }, labelGroup);
      node.textContent = text;
    });

    const stopGroup = document.getElementById('map-stops');
    const offsets = [
      { x: -25, y: -25, anchor: 'end', label: 'Le château' },
      { x: -27, y: -10, anchor: 'end', label: 'Les Racines' },
      { x: 0, y: 45, anchor: 'middle', label: 'Auberge & mairie' },
      { x: 26, y: 0, anchor: 'start', label: 'L’église' },
      { x: -20, y: -30, anchor: 'middle', label: 'Le plateau' },
      { x: 25, y: -23, anchor: 'start', label: 'Le cimetière' },
    ];
    data.stopIndices.forEach((index, i) => {
      const [x, y] = project(data.route[index]);
      const group = svgNode('g', { class: 'map-stop', transform: `translate(${x},${y})`, 'data-stop': i }, stopGroup);
      svgNode('circle', { class: 'stop-outer', r: 22 }, group);
      svgNode('circle', { class: 'stop-inner', r: 15 }, group);
      const number = svgNode('text', { class: 'stop-number', y: .4 }, group);
      number.textContent = String(i + 1).padStart(2, '0');
      const label = svgNode('text', { class: 'stop-label', x: offsets[i].x, y: offsets[i].y, 'text-anchor': offsets[i].anchor }, group);
      label.textContent = offsets[i].label;
      stopElements.push(group);
    });
    return true;
  }

  function measure() {
    configureTicketLayout();
    viewportHeight = window.innerHeight;
    heroStart = hero.getBoundingClientRect().top + window.scrollY;
    heroTravel = Math.max(1, hero.offsetHeight - heroSticky.offsetHeight);
    mapStart = mapStory.getBoundingClientRect().top + window.scrollY;
    mapTravel = Math.max(1, mapStory.offsetHeight - mapSticky.offsetHeight);
    // Account for object-fit: cover, including the strong crop on a portrait screen.
    // The focal point belongs to the SOURCE IMAGE, not to the viewport.
    const imageWidth = heroImage.naturalWidth || 1672;
    const imageHeight = heroImage.naturalHeight || 941;
    const width = camera.offsetWidth;
    const height = camera.offsetHeight;
    const fit = Math.max(width / imageWidth, height / imageHeight);
    const fittedWidth = imageWidth * fit;
    const horizontalCrop = width - fittedWidth;
    // Centre the SOURCE door on portrait crops; the small overscan handles
    // uncropped landscape viewports without exposing a border.
    const positionX = Math.abs(horizontalCrop) > 1
      ? clamp((width / 2 - fittedWidth * .519) / horizontalCrop) : .5;
    heroImage.style.objectPosition = `${positionX * 100}% 50%`;
    doorFocus = {
      x: horizontalCrop * positionX + fittedWidth * .519,
      y: (height - imageHeight * fit) / 2 + imageHeight * fit * .573,
    };
    camera.style.transformOrigin = '0 0';
    requestRender();
  }

  function pathProgress(value) {
    if (value <= stopAnchors[0]) return 0;
    if (value >= stopAnchors.at(-1)) return 1;
    let index = 0;
    while (index < stopAnchors.length - 2 && value > stopAnchors[index + 1]) index++;
    const t = clamp((value - stopAnchors[index]) / (stopAnchors[index + 1] - stopAnchors[index]));
    // The walker follows the scroll continuously; there is no attraction near stops.
    const eased = t;
    return lerp(routeDistances[index], routeDistances[index + 1], eased);
  }

  function setChapter(index) {
    if (index === activeStop) return;
    activeStop = index;
    document.body.dataset.currentStop = String(index + 1);
    chapters.forEach((chapter, i) => {
      chapter.classList.toggle('is-active', i === index);
      const hide = !reduceMotion.matches && i !== index;
      chapter.inert = hide;
      if (hide) chapter.setAttribute('aria-hidden', 'true');
      else chapter.removeAttribute('aria-hidden');
    });
    stopElements.forEach((stop, i) => {
      stop.classList.toggle('is-current', i === index);
      stop.classList.toggle('is-passed', i < index);
      stop.querySelector('.stop-label').classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      if (i === index) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
    });
    counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(stopNames.length).padStart(2, '0')}`;
    placeLabel.textContent = stopNames[index];
  }

  function renderHero() {
    const p = reduceMotion.matches ? 0 : clamp((window.scrollY - heroStart) / heroTravel);
    const approach = smoothstep(0, 1, p);
    // One source and one continuous camera: no crossfade, perspective jump or
    // artificial sharpening. Keep enlargement conservative to preserve detail.
    const zoom = 1.055 + approach * .745;
    const focusX = camera.offsetWidth / 2;
    const focusY = lerp(doorFocus.y, camera.offsetHeight / 2, approach);
    const dx = focusX - doorFocus.x * zoom;
    const dy = focusY - doorFocus.y * zoom;
    camera.style.transform = `translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0) scale(${zoom.toFixed(4)})`;
    camera.style.filter = 'none';
    heroTitle.style.opacity = String(1 - smoothstep(.07, .4, p));
    if (heroPortrait) {
      heroPortrait.style.opacity = String(Number(heroTitle.style.opacity) * .88);
      heroPortrait.style.transform = `translateY(${-p * 45}px) scale(${1 + p * .12})`;
    }
    heroTitle.style.transform = `translateY(${-p * 65}px) scale(${1 + p * .16})`;
    heroBottom.style.opacity = String(1 - smoothstep(.03, .24, p));
    heroSticky.style.setProperty('--door-dark', String(smoothstep(.55, 1, p) * .93));
    doorCopy.style.opacity = String(smoothstep(.64, .87, p));
    doorCopy.style.transform = `translateY(${(1 - smoothstep(.5, .9, p)) * 25}px)`;
    hero.dataset.progress = p.toFixed(3);
  }

  function renderMap() {
    mapProgress = clamp((window.scrollY - mapStart) / mapTravel);
    visualProgress = reduceMotion.matches ? mapProgress : lerp(visualProgress, mapProgress, .16);
    if (Math.abs(mapProgress - visualProgress) < .00004) visualProgress = mapProgress;
    const fraction = pathProgress(visualProgress);
    const position = walked.getPointAtLength(clamp(fraction) * routeLength);
    walker.setAttribute('transform', `translate(${position.x.toFixed(2)},${position.y.toFixed(2)})`);
    walked.style.strokeDashoffset = String(routeLength * (1 - fraction));
    const movement = Math.abs(visualProgress - previousVisualProgress);
    stepPhase += movement * 230;
    const stride = movement > .000015 && !reduceMotion.matches ? Math.sin(stepPhase) * 24 : 0;
    document.querySelector('.left-leg').style.transform = `rotate(${stride}deg)`;
    document.querySelector('.right-leg').style.transform = `rotate(${-stride}deg)`;
    document.querySelector('.left-arm').style.transform = `rotate(${-stride * .6}deg)`;
    document.querySelector('.right-arm').style.transform = `rotate(${stride * .6}deg)`;
    const nearest = stopAnchors.reduce((best, anchor, i) => Math.abs(anchor - visualProgress) < Math.abs(stopAnchors[best] - visualProgress) ? i : best, 0);
    setChapter(nearest);
    mapStory.dataset.progress = fraction.toFixed(3);
    previousVisualProgress = visualProgress;
    return Math.abs(mapProgress - visualProgress) > .00004;
  }

  function render() {
    animationFrame = 0;
    renderHero();
    renderComparators();
    renderTypewriter();
    renderVillage();
    renderMemories();
    if (renderMap()) requestRender();
  }

  function requestRender() {
    if (!animationFrame) animationFrame = requestAnimationFrame(render);
  }

  function cancelNavigation() {
    cancelAnimationFrame(navigationFrame);
    navigationFrame = 0;
  }

  // Smooth navigation is only initiated by an explicit click. Native scrolling
  // never snaps, attracts or moves the reader after they release the wheel.
  function travelTo(targetY) {
    window.dispatchEvent(new Event('auvers:navigation'));
    cancelNavigation();
    const startY = window.scrollY;
    const destination = clamp(targetY, 0, document.documentElement.scrollHeight - window.innerHeight);
    if (reduceMotion.matches) { window.scrollTo(0, destination); return; }
    const delta = destination - startY;
    const duration = clamp(1150 + Math.sqrt(Math.abs(delta)) * 19, 1150, 3000);
    const started = performance.now();
    function frame(now) {
      const p = clamp((now - started) / duration);
      const ease = p * p * p * (p * (p * 6 - 15) + 10);
      window.scrollTo(0, startY + delta * ease);
      if (p < 1) navigationFrame = requestAnimationFrame(frame);
      else navigationFrame = 0;
    }
    navigationFrame = requestAnimationFrame(frame);
  }

  function onScroll() {
    requestRender();
  }

  document.querySelectorAll('a[href^="#"]:not([data-route-stop])').forEach(link => {
    link.addEventListener('click', event => {
      const hash = link.getAttribute('href');
      const target = hash === '#parcours' ? document.querySelector('.map-intro') : document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      history.pushState(null, '', hash);
      travelTo(target.getBoundingClientRect().top + window.scrollY - (hash === '#accueil' ? 0 : 30));
    });
  });
  function travelToStop(index) {
    measure();
    if (reduceMotion.matches || document.body.classList.contains('static-story')) {
      travelTo(chapters[index].getBoundingClientRect().top + window.scrollY - 30);
    } else travelTo(mapStart + stopAnchors[index] * mapTravel);
  }
  dots.forEach((dot, index) => dot.addEventListener('click', () => travelToStop(index)));
  document.querySelectorAll('[data-route-stop]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      history.pushState(null, '', '#parcours');
      travelToStop(Number(link.dataset.routeStop));
    });
  });

  const comparisons = [...document.querySelectorAll('.image-comparator')].map(element => {
    const range = element.querySelector('input[type="range"]');
    const state = { element, range, stage: element.querySelector('.comparator-stage'), manual: false, dragging: false };
    const update = (value = range.value) => {
      element.style.setProperty('--split', `${value}%`);
      range.setAttribute('aria-valuetext', `${Math.round(Number(value))} % du tableau visible`);
    };
    state.update = update;
    range.addEventListener('input', () => { state.manual = true; update(); });
    range.addEventListener('pointerdown', () => { state.dragging = true; state.manual = true; });
    const release = () => { state.dragging = false; };
    window.addEventListener('pointerup', release, { passive: true });
    window.addEventListener('pointercancel', release, { passive: true });
    update();
    return state;
  });

  function renderComparators() {
    if (reduceMotion.matches) return;
    comparisons.forEach(state => {
      const bounds = state.stage.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= viewportHeight) {
        // A manual choice remains stable while reading this comparison.
        // Automatic motion resumes on its next pass through the viewport.
        if (!state.dragging) state.manual = false;
        return;
      }
      if (state.manual || state.dragging) return;
      const progress = clamp((viewportHeight - bounds.top) / (viewportHeight + bounds.height));
      const split = 20 + 60 * smoothstep(.15, .85, progress);
      state.range.value = String(Math.round(split));
      state.update(split.toFixed(3));
    });
  }

  const memoryItems = [...document.querySelectorAll('.memory-colour, .detail-note')];
  function renderMemories() {
    const height = window.innerHeight;
    memoryItems.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const p = reduceMotion.matches ? 1 : smoothstep(0, .32, (height - rect.top) / height);
      item.style.setProperty('--reveal', p.toFixed(4));
      if (item.classList.contains('detail-note')) {
        const copyTop = item.querySelector('.detail-writing').getBoundingClientRect().top;
        const copyReveal = reduceMotion.matches ? 1 : smoothstep(.03, .32, (height - copyTop) / height);
        item.style.setProperty('--copy-reveal', copyReveal.toFixed(4));
        const travel = clamp((height - rect.top) / (height + rect.height));
        item.style.setProperty('--detail-zoom', reduceMotion.matches ? 1 : (1.09 - .09 * travel).toFixed(4));
      }
    });
  }

  function renderVillage() {
    if (!villageScroll || !villageStage) return;
    if (reduceMotion.matches) {
      villageScenes.forEach(scene=>{scene.inert=false;scene.removeAttribute('aria-hidden');});
      return;
    }
    const travel=Math.max(1,villageScroll.offsetHeight-villageStage.offsetHeight);
    const p=clamp(-villageScroll.getBoundingClientRect().top/travel);
    const position=p*villageScenes.length;
    const active=Math.min(villageScenes.length-1,Math.floor(position));
    villageScenes.forEach((scene,i)=>{
      const local=position-i;
      const enter=i===0?1:smoothstep(-.12,.10,local);
      const leave=i===villageScenes.length-1?1:1-smoothstep(.88,1.10,local);
      const opacity=enter*leave;
      scene.style.opacity=String(opacity);
      scene.style.visibility=opacity>.001?'visible':'hidden';
      scene.inert=i!==active;
      if(i===active)scene.removeAttribute('aria-hidden');else scene.setAttribute('aria-hidden','true');
      const zoom=1.02+.18*smoothstep(0,.85,local);
      const crop=6*(1-smoothstep(0,.65,local));
      scene.querySelector('.scene-image').style.clipPath=`inset(${crop}% ${crop*1.2}%)`;
      scene.querySelector('.scene-image img').style.transform=`scale(${zoom})`;
      const text=smoothstep(.06,.44,local);
      const copy=scene.querySelector('.scene-copy');
      copy.style.opacity=String(text);
      copy.style.transform=`translateY(${(1-text)*30}px)`;
      copy.style.clipPath=`inset(0 0 ${(1-text)*100}% 0)`;
    });
    document.querySelector('.village-stage-count').textContent=`${String(active+1).padStart(2,'0')} / 03`;
    document.querySelectorAll('.village-stage-bars i').forEach((bar,i)=>bar.style.setProperty('--fill',String(clamp(position-i))));
    villageScroll.dataset.scene=String(active+1);
    villageScroll.dataset.progress=p.toFixed(3);
  }

  function configureTicketLayout() {
    const cover = document.querySelector('.ticket-cover');
    const home = document.querySelector('.ticket-layout');
    const stage = document.querySelector('.ticket-sticky');
    if (!cover || !home || !stage) return;
    const side = window.innerWidth >= 1100 && window.innerHeight >= 600;
    document.body.classList.toggle('ticket-side-layout', side);
    const parent = side ? stage : home;
    if (cover.parentElement !== parent) parent.insertBefore(cover, side ? stage.querySelector('.ticket-sheet') : null);
  }

  function setupTypewriter() {
    const sheet = document.querySelector('.ticket-sheet');
    if (!sheet || reduceMotion.matches) return;
    const walker = document.createTreeWalker(sheet.querySelector('.ticket-ink') || sheet, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) if (walker.currentNode.textContent.trim()) nodes.push(walker.currentNode);
    const characters = [];
    nodes.forEach(node => {
      const value = node.textContent;
      const wrapper = document.createElement('span');
      wrapper.className = 'typed-text';
      const accessible = document.createElement('span');
      accessible.className = 'sr-only'; accessible.textContent = value;
      const ink = document.createElement('span'); ink.setAttribute('aria-hidden','true');
      for (const letter of value) {
        const glyph = document.createElement('span'); glyph.className = 'typed-char'; glyph.textContent = letter;
        characters.push(glyph); ink.append(glyph);
      }
      wrapper.append(accessible,ink); node.replaceWith(wrapper);
    });
    sheet.classList.add('typewriter-ready');
    let shown = 0;
    function show(amount) {
      const previous = characters[shown-1];
      if (previous) previous.classList.remove('typing-cursor');
      for (let i=shown; i<amount; i++) characters[i].classList.add('is-typed');
      for (let i=amount; i<shown; i++) characters[i].classList.remove('is-typed');
      shown = amount;
      if (shown<characters.length && shown>0) characters[shown-1].classList.add('typing-cursor');
      sheet.classList.toggle('typing-complete', shown===characters.length);
      sheet.dataset.typed = String(shown);
    }
    ticketTyping = { sheet, characters, show, printing: false, scroll: document.querySelector('.ticket-scroll'), sticky: document.querySelector('.ticket-sticky'), ink: document.querySelector('.ticket-ink') };
    sheet.addEventListener('focusin',requestRender);
    sheet.addEventListener('focusout',requestRender);
    window.addEventListener('beforeprint',()=>{ ticketTyping.printing=true; show(characters.length); });
    window.addEventListener('afterprint',()=>{ ticketTyping.printing=false; requestRender(); });
  }

  function renderTypewriter() {
    if (!ticketTyping) return;
    const {sheet,characters,show,printing} = ticketTyping;
    if (printing || reduceMotion.matches || sheet.contains(document.activeElement)) {
      show(characters.length);
      sheet.style.height='auto';
      if(ticketTyping.ink) ticketTyping.ink.style.transform='none';
      return;
    }
    const { scroll, sticky, ink } = ticketTyping;
    const padding = parseFloat(getComputedStyle(sheet).paddingTop) + parseFloat(getComputedStyle(sheet).paddingBottom);
    const fullHeight = ink.offsetHeight + padding;
    const paperHeight = Math.min(fullHeight, viewportHeight - 64);
    sheet.style.height = `${paperHeight}px`;
    const travel = Math.max(1,scroll.offsetHeight-sticky.offsetHeight);
    const progress = clamp(-scroll.getBoundingClientRect().top/travel);
    const writing = clamp(progress/.88);
    const amount = Math.round(writing*characters.length);
    show(amount);
    // Short screens keep the paper centred while the typed lines feed upwards.
    let feed=0;
    if(amount>0 && fullHeight>paperHeight) {
      const glyph=characters[amount-1];
      const glyphY=glyph.getBoundingClientRect().bottom-ink.getBoundingClientRect().top;
      feed=clamp(glyphY-(paperHeight-padding)*.82,0,fullHeight-paperHeight);
    }
    ink.style.transform=`translateY(${-feed}px)`;
    ink.dataset.feed=String(feed);
    sheet.dataset.typingProgress=writing.toFixed(4);
    scroll.dataset.complete=String(writing>=1);

  }

  function enableStaticReading() {
    document.body.classList.add('static-story');
    chapters.forEach(chapter => { chapter.inert = false; chapter.removeAttribute('aria-hidden'); });
  }

  // Retain the story even if its map data is absent.
  if (!buildMap()) {
    enableStaticReading();
    return;
  }

  document.documentElement.classList.add('js-ready');
  heroImage.addEventListener('load', measure);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

  window.addEventListener('scroll', onScroll, { passive: true });
  ['wheel', 'touchstart', 'pointerdown'].forEach(event => window.addEventListener(event, cancelNavigation, { passive: true }));
  window.addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) cancelNavigation();
  });
  window.addEventListener('resize', () => { cancelNavigation(); measure(); }, { passive: true });
  window.addEventListener('load', measure, { once: true });
  document.fonts?.ready.then(measure);
  reduceMotion.addEventListener('change', () => {
    cancelNavigation();
    activeStop = -1;
    if (reduceMotion.matches) enableStaticReading();
    else document.body.classList.remove('static-story');
    measure();
  });

  // Printing presents all chapters, irrespective of the current scroll position.
  window.addEventListener('beforeprint', () => {
    cancelNavigation();
    chapters.forEach(chapter => { chapter.inert = false; chapter.removeAttribute('aria-hidden'); });
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
  });
  window.addEventListener('afterprint', () => {
    activeStop = -1;
    setChapter(stopAnchors.reduce((best, anchor, i) => Math.abs(anchor - visualProgress) < Math.abs(stopAnchors[best] - visualProgress) ? i : best, 0));
  });

  if (reduceMotion.matches) enableStaticReading();
  setupTypewriter();
  measure();
})();
