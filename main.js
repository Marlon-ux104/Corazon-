(() => {
  // DOM
  const enterBtn = document.getElementById('enterBtn');
  const welcome = document.getElementById('welcome');
  const heartSection = document.getElementById('heartSection');
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d', { alpha: true });
  const nameInput = document.getElementById('nameInput');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const uiTop = document.getElementById('uiTop');

  // Points
  let points = [];
  const NUM_POINTS = 120;

  // Heart pattern
  const heartPattern = [
    "      *****       *****      ",
    "   *********** ***********   ",
    " *************************** ",
    "*****************************",
    "*****************************",
    "*****************************",
    " *************************** ",
    "  *************************  ",
    "    *********************    ",
    "      *****************      ",
    "        *************        ",
    "          *********          ",
    "            *****            ",
    "             ***             ",
    "              *              "
  ];

  let heartContent = '';
  let lines = [];
  let letterI = 0, letterJ = 0;
  let animating = false;
  let growPhase = 0;
  const SMALL = '#9a0f29';
  const LARGE = '#cf1462';

  // Responsive canvas
  let W = canvas.width;
  let H = canvas.height;
  let CX = W / 2;
  let CY = H / 2;

  function rand(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }
  function hex(rgb){ return '#' + rgb.map(v => v.toString(16).padStart(2,'0')).join(''); }
  function lerp(a,b,t){ return Math.round(a + (b-a)*t); }
  function mixColor(hexA, hexB, t){
    const a = hexA.replace('#','');
    const b = hexB.replace('#','');
    const ar = parseInt(a.substr(0,2),16), ag = parseInt(a.substr(2,2),16), ab = parseInt(a.substr(4,2),16);
    const br = parseInt(b.substr(0,2),16), bg = parseInt(b.substr(2,2),16), bb = parseInt(b.substr(4,2),16);
    const r = lerp(ar,br,t), g = lerp(ag,bg,t), b2 = lerp(ab,bb,t);
    return hex([r,g,b2]);
  }

  function nameHeart(name){
    name = name || 'corazon';
    name = (name.repeat(200)).slice(0,200);
    let idx = 0;
    const arr = [];
    for(const row of heartPattern){
      let line = '';
      for(const ch of row){
        line += ch === '*' ? name[idx++ % name.length] : ' ';
      }
      arr.push(line);
    }
    return arr;
  }

  function initPoints(){
    points = [];
    for(let i=0;i<NUM_POINTS;i++){
      const x = Math.random()*W;
      const y = Math.random()*H;
      const size = Math.random()*2 + 1;
      const color = Math.random() < 0.6 ? 'red' : 'white';
      points.push({
        x,y,size,color,
        visible: Math.random() < 0.7,
        timer: rand(0,20),
        period: rand(6,30)
      });
    }
  }

  function clear(){ ctx.clearRect(0,0,W,H); }

  function drawPoints(){
    for(const p of points){
      p.timer--;
      if(p.timer <= 0){
        p.visible = !p.visible;
        p.timer = p.period;
      }
      if(p.visible){
        ctx.fillStyle = (p.color === 'white') ? 'rgba(255,255,255,1)' : 'rgba(255,68,68,1)';
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    }
  }

  function drawHeartText(color, fontSize){
    ctx.save();
    ctx.font = `${Math.round(fontSize)}px "Consolas", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const linesArr = heartContent.split('\n');
    const lineHeight = fontSize * 0.85;
    const totalH = linesArr.length * lineHeight;
    const startY = CY - totalH/2 + lineHeight/2;

    ctx.fillStyle = color;
    for(let i=0;i<linesArr.length;i++){
      ctx.fillText(linesArr[i], CX, startY + i*lineHeight);
    }

    ctx.restore();
  }

  function frame(){
    clear();
    drawPoints();

    if(animating){
      if(letterI < lines.length){
        if(letterJ === 0) heartContent += '\n';
        const row = lines[letterI];
        if(letterJ < row.length){
          heartContent += row[letterJ];
          letterJ++;
        } else {
          letterI++;
          letterJ = 0;
        }
      }
    }

    // Latido más lento
    growPhase += 0.05;

    const baseSize = Math.min(W,H) / 25;
    const amplitude = baseSize / 2;
    const size = baseSize + amplitude * (0.5 + 0.5*Math.sin(growPhase));
    const color = mixColor(SMALL, LARGE, 0.5 + 0.5*Math.sin(growPhase));

    if(heartContent){
      drawHeartText(color, size);
    }

    requestAnimationFrame(frame);
  }

  // Controles
  enterBtn.addEventListener('click', () => {
    // Oculta el botón y el mensaje inmediatamente
    enterBtn.style.display = 'none';
    document.querySelector('#welcome h1').style.display = 'none';

    // Oculta toda la sección welcome y muestra el corazón
    welcome.classList.add('hidden');
    heartSection.classList.remove('hidden');
  });

  startBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if(!name) return;

    // Oculta los inputs y botón de crear corazón
    uiTop.style.display = 'none';

    lines = nameHeart(name);
    heartContent = '';
    letterI = 0; letterJ = 0;
    animating = true;
  });

  resetBtn.addEventListener('click', () => {
    initPoints();
    animating = false;
    heartContent = '';
    lines = [];
    letterI = 0; letterJ = 0;
    growPhase = 0;

    // Vuelve a mostrar los inputs para crear otro corazón
    uiTop.style.display = 'flex';
  });

  function resizeCanvas(){
    W = window.innerWidth * 0.95;   
    H = window.innerHeight * 0.7;   
    CX = W/2; CY = H/2;
    canvas.width = W;
    canvas.height = H;
  }

  window.addEventListener('resize', resizeCanvas);

  initPoints();
  resizeCanvas();
  requestAnimationFrame(frame);

})();
