/* ═══ NAVLIFE · BRAIN · 19 упражнений ═══ */
(function(){
'use strict';
const N = window.__nav;
const { go, esc, saveState, toast, openModal, closeModal, SFX, buzz, flash,
        levelInfo, todayKey, clamp, rnd, pick, shuffle, uid, TIMEOUT,
        LEVEL_NAMES, STREAK_TO_LEVELUP, $, $$, sleep } = N;

const CATS = { memory:{name:'Память',icon:'🧠'}, speed:{name:'Внимание',icon:'⚡'}, math:{name:'Счёт',icon:'🔢'}, logic:{name:'Логика',icon:'🧩'} };
const MODES = {
  normal:{ id:'normal', name:'Тренировка', emoji:'📋', desc:'Фиксированное число раундов.' },
  endless:{ id:'endless', name:'Бесконечный', emoji:'♾️', desc:'Каждые 10 подряд — сложнее.' },
  survival:{ id:'survival', name:'До ошибки', emoji:'💀', desc:'Одна ошибка — конец.' }
};
const EX = {};

EX.nback={id:'nback',name:'N-back',cat:'memory',icon:'🧠',tag:'Рабочая память',
  about:'Сравнивай текущий стимул с тем, что был N шагов назад.',
  how:['Стимулы по одному.','Совпал с N-назад — жми.','Иначе не нажимай.'],
  hint:'Держи очередь последних N.',
  levels:['N=2 буквы','N=2 быстрее','N=3 буквы','N=3 цифры','N=4 буквы','N=4 цифры'],
  defaultLevel:1,
  async run(host,api){
    const cfg=[
      {N:2,pool:'БКМНРСТАЕЛ'.split(''),ms:2000,total:24,matchP:.32},
      {N:2,pool:'БКМНРСТАЕЛ'.split(''),ms:1700,total:26,matchP:.30},
      {N:3,pool:'БКМНРСТАЕЛ'.split(''),ms:1700,total:26,matchP:.28},
      {N:3,pool:'0123456789'.split(''),ms:1500,total:28,matchP:.28},
      {N:4,pool:'БКМНРСТАЕЛ'.split(''),ms:1500,total:28,matchP:.25},
      {N:4,pool:'0123456789'.split(''),ms:1300,total:30,matchP:.25}
    ];
    const maxRounds=api.mode!=='normal'?9999:cfg[Math.min(api.level,cfg.length)-1].total;
    host.innerHTML=`<div class="stim-stage"><div class="stim" id="nbL">•</div></div>
      <button class="big-action" id="nbBtn" type="button">✓ Совпало</button>`;
    const L=$('#nbL',host),btn=$('#nbBtn',host);
    let hits=0,miss=0,fa=0,cr=0;const rts=[],seq=[];
    for(let i=0;i<maxRounds;i++){
      if(api.cancelled) break;
      const c=cfg[Math.min(api.level,cfg.length)-1];
      let cur;
      if(i<c.N){cur=pick(c.pool);}
      else if(Math.random()<c.matchP){cur=seq[i-c.N];}
      else{let x;do{x=pick(c.pool);}while(x===seq[i-c.N]);cur=x;}
      seq.push(cur);
      const isMatch=i>=c.N&&cur===seq[i-c.N];
      L.textContent=cur;L.classList.remove('pop');void L.offsetWidth;L.classList.add('pop');
      btn.disabled=false;
      api.progress((i%20)/20);
      const t0=performance.now();
      const r=await api.raceAnswer(btn,c.ms);
      const rt=performance.now()-t0;
      btn.disabled=true;
      let ok;
      if(r===TIMEOUT){if(isMatch){miss++;ok=false;}else{cr++;ok=true;}}
      else{if(isMatch){hits++;rts.push(rt);ok=true;}else{fa++;ok=false;}}
      if(ok) api.ok();else api.bad();
      if(!api.recordResult(ok)) break;
      await api.delay(280);L.textContent='•';await api.delay(140);
    }
    if(api.cancelled) return;
    const total=hits+miss+fa+cr;
    const acc=total?Math.round((hits+cr)/total*100):0;
    const avg=rts.length?Math.round(rts.reduce((a,b)=>a+b,0)/rts.length):0;
    api.finish({acc,rt:avg,level:api.level,detail:{'N':cfg[Math.min(api.level,cfg.length)-1].N,'Попад.':hits,'Проп.':miss,'Ложн.':fa}});
  }};

EX.gridmem={id:'gridmem',name:'Сетка памяти',cat:'memory',icon:'🔲',tag:'Зрительная память',
  about:'Запоминай подсвеченные клетки.',how:['Клетки подсветятся.','Запомни.','Тапни по ним.'],
  hint:'Ориентируйся на углы.',levels:['4×4 · 6','5×5 · 7','5×5 · 8','6×6 · 9','6×6 · 10','7×7 · 12'],
  defaultLevel:1,
  async run(host,api){
    const cfg=[{size:4,count:6,ms:1300},{size:5,count:7,ms:1200},{size:5,count:8,ms:1100},{size:6,count:9,ms:1000},{size:6,count:10,ms:900},{size:7,count:12,ms:800}];
    const maxR=api.mode==='normal'?4:9999;
    host.innerHTML=`<p class="muted" id="gmH" style="text-align:center;margin-bottom:14px">Приготовься…</p><div class="grid" id="gmG"></div>`;
    const grid=$('#gmG',host),hint=$('#gmH',host);
    let good=0,errs=0;
    for(let r=0;r<maxR;r++){
      if(api.cancelled) break;
      const c=cfg[Math.min(api.level,cfg.length)-1];
      const size=c.size,count=c.count,total=size*size,ms=c.ms;
      grid.style.gridTemplateColumns=`repeat(${size},1fr)`;
      grid.style.maxWidth=(size>=6?420:400)+'px';
      grid.innerHTML=Array.from({length:total},(_,i)=>`<div class="cell" data-i="${i}"></div>`).join('');
      const cells=$$('.cell',grid);
      const target=shuffle([...Array(total).keys()]).slice(0,count);
      hint.textContent='Запоминай…';
      api.progress((r%10)/10);
      await api.delay(280);
      target.forEach(i=>cells[i].classList.add('lit'));
      await api.delay(ms);
      target.forEach(i=>cells[i].classList.remove('lit'));
      hint.textContent='Повтори';
      const chosen=new Set();let e=0;
      await new Promise(resolve=>{
        let done=false;
        const fin=()=>{if(done)return;done=true;cells.forEach(x=>{x.onclick=null;});resolve();};
        cells.forEach((cell,i)=>{
          cell.onclick=()=>{
            if(api.cancelled||done) return;
            if(chosen.has(i)) return;
            SFX.tap();buzz(6);
            if(target.includes(i)){cell.classList.add('ok');chosen.add(i);if(chosen.size===target.length)fin();}
            else{cell.classList.add('bad');e++;flash('bad');setTimeout(()=>cell.classList.remove('bad'),500);}
          };
        });
        const t=setTimeout(fin,15000);
        api.onCancel(()=>{clearTimeout(t);fin();});
      });
      if(api.cancelled) break;
      const ok=chosen.size===target.length&&e===0;
      if(ok){good++;api.ok();}else api.bad();
      errs+=e;
      hint.textContent=ok?'✅ Верно':'❌';
      if(!api.recordResult(ok)) break;
      await api.delay(700);
    }
    if(api.cancelled) return;
    const acc=good+errs?Math.round(good/Math.max(1,good+errs)*100):0;
    api.finish({acc,rt:0,level:api.level,detail:{'Верно':good,'Ошибок':errs}});
  }};

EX.simon={id:'simon',name:'Последовательность',cat:'memory',icon:'🎨',tag:'Память',
  about:'Повторяй последовательность.',how:['Смотри.','Повтори.','Раунд длиннее.'],
  hint:'Проговаривай про себя.',levels:['4 · 4','4 · 5','4 · 6','6 · 5','6 · 6','6 · 7'],
  defaultLevel:1,
  async run(host,api){
    const cfg=[{colors:4,start:4,showMs:480,gapMs:160},{colors:4,start:5,showMs:440,gapMs:150},{colors:4,start:6,showMs:400,gapMs:140},{colors:6,start:5,showMs:360,gapMs:130},{colors:6,start:6,showMs:320,gapMs:120},{colors:6,start:7,showMs:280,gapMs:100}];
    const maxR=api.mode==='normal'?5:9999;
    const COLORS=['#3F6152','#B87F35','#4F7563','#A4503A','#8FAE9B','#D9A85E'];
    host.innerHTML=`<p class="muted" id="smH" style="text-align:center;margin-bottom:14px">Приготовься…</p><div class="pad" id="smP"></div>`;
    const pad=$('#smP',host),hint=$('#smH',host);
    let maxLen=0;
    for(let r=0;r<maxR;r++){
      if(api.cancelled) break;
      const c=cfg[Math.min(api.level,cfg.length)-1];
      const len=c.start+(api.mode==='normal'?r:Math.floor(api.streak/10)*3);
      const cols=c.colors<=4?2:3;
      pad.style.gridTemplateColumns=`repeat(${cols},1fr)`;
      pad.style.maxWidth=(cols*130)+'px';
      pad.innerHTML=COLORS.slice(0,c.colors).map((col,i)=>
        `<button class="pad-btn" data-i="${i}" type="button" style="background:${col}22;border-color:${col}66;color:${col};min-height:${c.colors===6?80:100}px"></button>`
      ).join('');
      const btns=$$('.pad-btn',pad);
      const seq=Array.from({length:len},()=>rnd(c.colors));
      hint.textContent=`Раунд ${r+1} · длина ${len}`;
      api.progress((r%10)/10);
      await api.delay(600);
      hint.textContent='Смотри…';
      btns.forEach(b=>b.disabled=true);
      for(const idx of seq){
        if(api.cancelled) break;
        const b=btns[idx];
        b.style.background=COLORS[idx];b.style.boxShadow=`0 0 22px ${COLORS[idx]}`;
        SFX.beep(idx);
        await api.delay(c.showMs);
        b.style.background=`${COLORS[idx]}22`;b.style.boxShadow='';
        await api.delay(c.gapMs);
      }
      if(api.cancelled) break;
      hint.textContent='Повтори';
      btns.forEach(b=>b.disabled=false);
      let pos=0;
      const ok=await new Promise(resolve=>{
        let done=false;
        const fin=v=>{if(done)return;done=true;btns.forEach(b=>{b.onclick=null;b.disabled=true;});resolve(v);};
        btns.forEach((b,i)=>{
          b.onclick=()=>{
            if(done||api.cancelled) return;
            SFX.beep(i);buzz(8);
            b.style.background=COLORS[i];b.style.boxShadow=`0 0 22px ${COLORS[i]}`;
            setTimeout(()=>{b.style.background=`${COLORS[i]}22`;b.style.boxShadow='';},160);
            if(seq[pos]===i){pos++;if(pos===seq.length)fin(true);}
            else{flash('bad');SFX.err();fin(false);}
          };
        });
        api.onCancel(()=>fin(false));
      });
      if(api.cancelled) break;
      if(ok){maxLen=Math.max(maxLen,len);api.ok();hint.textContent='✅';}
      else api.bad();
      if(!api.recordResult(ok)) break;
      await api.delay(650);
    }
    if(api.cancelled) return;
    const c0=cfg[Math.min(api.level,cfg.length)-1].start;
    const reached=Math.max(0,maxLen-c0+1);
    const acc=clamp(Math.round(reached/5*100),0,100);
    api.finish({acc,rt:0,level:api.level,detail:{'Макс. длина':maxLen}});
  }};

EX.pairs={id:'pairs',name:'Парные карточки',cat:'memory',icon:'🃏',tag:'Память',
  about:'Найди все пары.',how:['Открывай по две.','Запоминай.','Найди все.'],
  hint:'Начинай с углов.',levels:['6 пар','8 пар','10 пар','12 пар','15 пар','18 пар'],
  defaultLevel:1,
  async run(host,api){
    const cfg=[{pairs:6,cols:4},{pairs:8,cols:4},{pairs:10,cols:5},{pairs:12,cols:6},{pairs:15,cols:6},{pairs:18,cols:6}];
    const c=cfg[Math.min(api.level,cfg.length)-1];
    const POOL=['🍀','🔥','💎','🌙','⚡','🎯','🌊','🪐','🎵','🦋','🌸','🍎','🎲','🗝','⚓','🧩','🌺','⭐'];
    const chosen=shuffle(POOL).slice(0,c.pairs);
    const deck=shuffle([...chosen,...chosen]);
    host.innerHTML=`<div class="grid" id="prG" style="grid-template-columns:repeat(${c.cols},1fr);max-width:440px"></div>
      <div class="ex-hud" style="margin-top:16px">
        <span class="hud-pill">Ходы <b id="prM">0</b></span>
        <span class="hud-pill">Пары <b id="prF">0</b>/${c.pairs}</span>
      </div>`;
    const grid=$('#prG',host),mEl=$('#prM',host),fEl=$('#prF',host);
    grid.innerHTML=deck.map((s,i)=>`<div class="cell" data-i="${i}" style="font-size:${c.pairs>=12?18:24}px"></div>`).join('');
    const cells=$$('.cell',grid);
    let first=null,lock=false,moves=0,found=0;
    await new Promise(resolve=>{
      cells.forEach((cell,i)=>{
        cell.onclick=async()=>{
          if(lock||api.cancelled) return;
          if(cell.classList.contains('ok')||cell===first) return;
          cell.textContent=deck[i];cell.classList.add('lit');
          SFX.tap();buzz(6);
          if(!first){first={cell,i};return;}
          moves++;mEl.textContent=moves;
          if(deck[first.i]===deck[i]){
            first.cell.classList.remove('lit');cell.classList.remove('lit');
            first.cell.classList.add('ok');cell.classList.add('ok');
            first=null;found++;fEl.textContent=found;
            SFX.ok();flash('ok');api.progress(found/c.pairs);
            if(found===c.pairs) resolve();
          }else{
            lock=true;SFX.err();const a=first;first=null;
            await api.delay(600);
            if(api.cancelled) return;
            a.cell.textContent='';a.cell.classList.remove('lit');
            cell.textContent='';cell.classList.remove('lit');
            lock=false;
          }
        };
      });
      api.onCancel(resolve);
    });
    if(api.cancelled) return;
    const perfect=c.pairs*2;
    const acc=Math.round(clamp(perfect/Math.max(perfect,moves),0,1)*100);
    api.finish({acc,rt:0,level:api.level,detail:{'Ходов':moves,'Идеально':perfect}});
  }};

EX.chunk={id:'chunk',name:'Чанкинг чисел',cat:'memory',icon:'🔢',tag:'Память',
  about:'Запоминай числа.',how:['Число на пару секунд.','Запомни.','Введи.'],
  hint:'Группируй по 2–3.',levels:['6 цифр','7','8','9','10','12 наоборот'],
  defaultLevel:1,
  async run(host,api){
    const cfg=[{len:6,rev:false,ms:400},{len:7,rev:false,ms:380},{len:8,rev:false,ms:350},{len:9,rev:false,ms:330},{len:10,rev:false,ms:300},{len:12,rev:true,ms:280}];
    const maxR=api.mode==='normal'?6:9999;
    host.innerHTML=`<div class="stim-stage" style="min-height:140px"><div class="stim" id="ckS" style="font-size:clamp(26px,8vw,44px)">—</div></div>
      <p class="muted" id="ckR" style="text-align:center;margin-top:6px;font-size:12.5px;min-height:16px"></p>
      <form class="answer-bar" id="ckF" style="display:none" autocomplete="off">
        <input class="answer-input" id="ckI" inputmode="numeric" placeholder="Число">
        <button class="btn btn-primary" type="submit">✓</button>
      </form>`;
    const stim=$('#ckS',host),form=$('#ckF',host),inp=$('#ckI',host),rev=$('#ckR',host);
    let correct=0,total=0;
    for(let r=0;r<maxR;r++){
      if(api.cancelled) break;
      const c=cfg[Math.min(api.level,cfg.length)-1];
      rev.textContent=c.rev?'⚠️ Введи в обратном!':'';
      let num='';for(let i=0;i<c.len;i++) num+=i===0?(1+rnd(9)):rnd(10);
      const expected=c.rev?num.split('').reverse().join(''):num;
      stim.style.display='';form.style.display='none';
      stim.textContent=num;stim.classList.remove('pop');void stim.offsetWidth;stim.classList.add('pop');
      api.progress((r%10)/10);
      await api.delay(600+c.len*c.ms);
      if(api.cancelled) break;
      stim.textContent='?';
      form.style.display='';inp.value='';
      setTimeout(()=>inp.focus(),30);
      const v=await new Promise(resolve=>{
        let done=false;
        const fin=val=>{if(done)return;done=true;form.onsubmit=null;resolve(val);};
        form.onsubmit=e=>{e.preventDefault();fin(inp.value.trim());};
        api.onCancel(()=>fin(null));
      });
      if(api.cancelled) break;
      const ok=v===expected;
      total++;
      if(ok){correct++;api.ok();stim.textContent='✅ '+expected;}
      else{api.bad();stim.textContent='❌ '+expected;}
      if(!api.recordResult(ok)) break;
      await api.delay(700);
    }
    if(api.cancelled) return;
    const acc=total?Math.round(correct/total*100):0;
    api.finish({acc,rt:0,level:api.level,detail:{'Верно':`${correct}/${total}`}});
  }};

EX.schulte={id:'schulte',name:'Таблица Шульте',cat:'speed',icon:'🔢',tag:'Концентрация',
  about:'Находи числа по порядку.',how:['Сетка чисел.','Нажимай по порядку.','Смотри в центр.'],
  hint:'Держи взгляд в центре.',levels:['4×4','5×5','5×5 цвет','6×6','6×6 альт','7×7'],
  defaultLevel:1,
  async run(host,api){
    const cfg=[{size:4,colored:false,alt:false},{size:5,colored:false,alt:false},{size:5,colored:true,alt:false},{size:6,colored:false,alt:false},{size:6,colored:false,alt:true},{size:7,colored:false,alt:false}];
    const c=cfg[Math.min(api.level,cfg.length)-1];
    const size=c.size,total=size*size;
    let sequence;
    if(c.alt){const ev=[],od=[];for(let i=1;i<=total;i++)(i%2===0?ev:od).push(i);sequence=[...ev.sort((a,b)=>a-b),...od.sort((a,b)=>b-a)];}
    else sequence=Array.from({length:total},(_,i)=>i+1);
    const nums=shuffle(sequence.slice());
    const CM={};
    if(c.colored){const pal=['#A4503A','#4F7563','#3F6152','#B87F35','#8FAE9B'];nums.forEach((n,i)=>CM[n]=pal[i%pal.length]);}
    host.innerHTML=`<div class="grid" id="scG" style="grid-template-columns:repeat(${size},1fr);max-width:${size>=6?440:400}px"></div>
      <div class="ex-hud" style="margin-top:16px">
        <span class="hud-pill">След. <b id="scN">${sequence[0]}</b></span>
        <span class="hud-pill">Время <b id="scT">0.0</b></span>
      </div>`;
    const grid=$('#scG',host),nEl=$('#scN',host),tEl=$('#scT',host);
    grid.innerHTML=nums.map(n=>`<div class="cell" data-n="${n}" style="font-size:${size>=6?14:size===5?16:22}px;${c.colored?`color:${CM[n]}`:''}">${n}</div>`).join('');
    const cells=$$('.cell',grid);
    let idx=0,errors=0;
    const t0=performance.now();
    const timer=setInterval(()=>{if(api.cancelled) return;tEl.textContent=((performance.now()-t0)/1000).toFixed(1);},100);
    api.onCancel(()=>clearInterval(timer));
    await new Promise(resolve=>{
      cells.forEach(cell=>{
        cell.onclick=()=>{
          if(api.cancelled) return;
          const n=+cell.dataset.n;
          if(n===sequence[idx]){
            cell.classList.add('done');SFX.tap();buzz(6);
            idx++;api.progress(idx/total);
            nEl.textContent=idx<total?sequence[idx]:'✓';
            if(idx>=total) resolve();
          }else{errors++;flash('bad');SFX.err();cell.classList.add('bad');setTimeout(()=>cell.classList.remove('bad'),320);}
        };
      });
      api.onCancel(resolve);
    });
    clearInterval(timer);
    if(api.cancelled) return;
    const secs=(performance.now()-t0)/1000;
    const norms=[16,28,32,44,52,70];
    const norm=norms[Math.min(api.level,norms.length)-1];
    const acc=clamp(Math.round(norm/secs*100-errors*4),5,100);
    api.finish({acc,rt:Math.round(secs*1000/total),level:api.level,detail:{'Время':secs.toFixed(1)+'с','Ошибок':errors}});
  }};

EX.stroop={id:'stroop',name:'Струп-тест',cat:'speed',icon:'🌈',tag:'Торможение',
  about:'Называй цвет шрифта.',how:['Слово-цвет.','Жми на ЦВЕТ ШРИФТА.','На высокой — правило меняется.'],
  hint:'Не читай — смотри на цвет.',levels:['6 · 50%','6 · 70%','6 · 85%','6 · быстро','6 · 95%','правило'],
  defaultLevel:1,
  async run(host,api){
    const cfg=[{colors:6,mismatchP:.5,ms:2600,swap:false},{colors:6,mismatchP:.7,ms:2400,swap:false},{colors:6,mismatchP:.85,ms:2200,swap:false},{colors:6,mismatchP:.9,ms:1800,swap:false},{colors:6,mismatchP:.95,ms:1600,swap:false},{colors:6,mismatchP:.95,ms:1500,swap:true}];
    const maxR=api.mode==='normal'?20:9999;
    const ALL=[{n:'КРАСНЫЙ',c:'#A4503A'},{n:'СИНИЙ',c:'#3F5A7A'},{n:'ЗЕЛЁНЫЙ',c:'#3F6152'},{n:'ЖЁЛТЫЙ',c:'#B87F35'},{n:'ФИОЛЕТОВЫЙ',c:'#6A4A7A'},{n:'РОЗОВЫЙ',c:'#A4507A'}];
    const c=cfg[Math.min(api.level,cfg.length)-1];const set=ALL.slice(0,c.colors);
    host.innerHTML=`<p class="muted" id="stR" style="text-align:center;margin-bottom:12px;font-size:12.5px;min-height:18px">${c.swap?'Правило: ЦВЕТ ШРИФТА':'&nbsp;'}</p>
      <div class="stim-stage" style="min-height:150px"><div class="stim text" id="stW">—</div></div>
      <div class="pad" id="stP" style="grid-template-columns:repeat(2,1fr);margin-top:14px;max-width:400px"></div>`;
    const word=$('#stW',host),pad=$('#stP',host),rule=$('#stR',host);
    pad.innerHTML=set.map((s,i)=>`<button class="pad-btn" data-i="${i}" type="button" style="font-size:13px">${s.n}</button>`).join('');
    const btns=$$('.pad-btn',pad);
    let correct=0,total=0;const rts=[];
    let ruleMode='ink';
    for(let r=0;r<maxR;r++){
      if(api.cancelled) break;
      if(c.swap&&r>0&&r%4===0){
        ruleMode=ruleMode==='ink'?'word':'ink';
        rule.textContent=ruleMode==='ink'?'🔀 ЦВЕТ ШРИФТА':'🔀 СЛОВО';
        await api.delay(600);
      }
      const w=pick(set);let ink=pick(set);
      if(c.mismatchP>0&&Math.random()<c.mismatchP){while(ink===w) ink=pick(set);}
      word.textContent=w.n;word.style.color=ink.c;
      word.classList.remove('pop');void word.offsetWidth;word.classList.add('pop');
      api.progress((r%20)/20);
      const t0=performance.now();
      const idx=await new Promise(resolve=>{
        let done=false;
        const fin=v=>{if(done)return;done=true;btns.forEach(b=>{b.onclick=null;});resolve(v);};
        btns.forEach((b,i)=>b.onclick=()=>fin(i));
        const t=setTimeout(()=>fin(-1),c.ms);
        api.onCancel(()=>{clearTimeout(t);fin(-1);});
      });
      if(api.cancelled) break;
      const rt=performance.now()-t0;
      const correctIdx=ruleMode==='ink'?set.findIndex(s=>s===ink):set.findIndex(s=>s===w);
      total++;
      const ok=idx===correctIdx;
      if(ok){correct++;rts.push(rt);api.ok();}else api.bad();
      word.textContent='—';word.style.color='';
      if(!api.recordResult(ok)) break;
      await api.delay(200);
    }
    if(api.cancelled) return;
    const acc=total?Math.round(correct/total*100):0;
    const avg=rts.length?Math.round(rts.reduce((a,b)=>a+b,0)/rts.length):0;
    api.finish({acc,rt:avg,level:api.level,detail:{'Верно':`${correct}/${total}`}});
  }};

EX.gonogo={id:'gonogo',name:'Go / No-Go',cat:'speed',icon:'🚦',tag:'Самоконтроль',
  about:'Зелёный — жми, красный — нет.',how:['Появляется круг.','Зелёный — жми.','Красный — не жми.'],
  hint:'Палец наготове.',levels:['Средне','Быстро','Очень','Молния','Экстрим','Хардкор'],
  defaultLevel:1,
  async run(host,api){
    const speeds=[900,750,600,480,380,300],goP=[.68,.66,.64,.62,.60,.58];
    const maxR=api.mode==='normal'?24:9999;
    host.innerHTML=`<div class="stim-stage" style="min-height:280px"><div id="ggC" style="width:140px;height:140px;border-radius:50%;background:var(--paper);border:2px solid var(--line);transition:all .12s"></div></div>
      <p class="muted" style="text-align:center" id="ggH">Приготовься…</p>`;
    const circle=$('#ggC',host),hint=$('#ggH',host);
    let hits=0,miss=0,fa=0,cr=0;const rts=[];
    for(let r=0;r<maxR;r++){
      if(api.cancelled) break;
      const L=Math.min(api.level,speeds.length);
      const speed=speeds[L-1],pGo=goP[L-1];
      const isGo=Math.random()<pGo;
      circle.style.background=isGo?'linear-gradient(135deg,#3F6152,#2E4A3E)':'linear-gradient(135deg,#A4503A,#8A3E2B)';
      circle.style.borderColor='transparent';
      circle.style.boxShadow=isGo?'0 0 40px rgba(63,97,82,.4)':'0 0 40px rgba(164,80,58,.4)';
      circle.style.transform='scale(1.05)';
      hint.textContent=isGo?'Жми!':'Не жми';
      api.progress((r%20)/20);
      const t0=performance.now();
      const clicked=await api.raceAnswer(circle,speed);
      const rt=performance.now()-t0;
      circle.style.background='var(--paper)';
      circle.style.borderColor='var(--line)';
      circle.style.boxShadow='none';
      circle.style.transform='scale(1)';
      let ok;
      if(isGo){if(clicked!==TIMEOUT){hits++;rts.push(rt);ok=true;}else{miss++;ok=false;}}
      else{if(clicked!==TIMEOUT){fa++;ok=false;}else{cr++;ok=true;}}
      if(ok) api.ok();else api.bad();
      if(!api.recordResult(ok)) break;
      await api.delay(Math.max(100,260+rnd(180)-L*20));
    }
    if(api.cancelled) return;
    const total=hits+miss+fa+cr;
    const acc=total?Math.round((hits+cr)/total*100):0;
    const avg=rts.length?Math.round(rts.reduce((a,b)=>a+b,0)/rts.length):0;
    api.finish({acc,rt:avg,level:api.level,detail:{'Попад.':hits,'Проп.':miss,'Ложн.':fa}});
  }};

EX.flanker={id:'flanker',name:'Фланкер-тест',cat:'speed',icon:'➡️',tag:'Внимание',
  about:'Определи центральную стрелку.',how:['Ряд стрелок.','Смотри только ЦЕНТР.','Нажми.'],
  hint:'Смотри в центр.',levels:['5 · совпад','5 · 60%','5 · 80%','5 · быстро','7 · 90%','7 · экстрим'],
  defaultLevel:1,
  async run(host,api){
    const cfg=[{arrows:5,mismatchP:0,ms:2800},{arrows:5,mismatchP:.6,ms:2600},{arrows:5,mismatchP:.8,ms:2200},{arrows:5,mismatchP:.9,ms:1600},{arrows:7,mismatchP:.9,ms:1400},{arrows:7,mismatchP:.95,ms:1200}];
    const maxR=api.mode==='normal'?20:9999;
    host.innerHTML=`<div class="stim-stage" style="min-height:150px"><div class="stim text" id="flS" style="font-size:clamp(26px,8vw,42px);letter-spacing:.12em">—</div></div>
      <div class="pad" style="grid-template-columns:1fr 1fr;margin-top:14px;max-width:420px">
        <button class="pad-btn" data-d="L" type="button">← Влево</button>
        <button class="pad-btn" data-d="R" type="button">Вправо →</button>
      </div>`;
    const stim=$('#flS',host),btns=$$('.pad-btn',host);
    let correct=0,total=0;const rts=[];
    for(let r=0;r<maxR;r++){
      if(api.cancelled) break;
      const c=cfg[Math.min(api.level,cfg.length)-1];
      const dir=Math.random()<.5?'L':'R';
      const congruent=Math.random()>=c.mismatchP;
      const flank=congruent?dir:(dir==='L'?'R':'L');
      const arrow=d=>d==='L'?'◀':'▶';
      const side=Math.floor((c.arrows-1)/2);
      stim.textContent=arrow(flank).repeat(side)+arrow(dir)+arrow(flank).repeat(side);
      stim.classList.remove('pop');void stim.offsetWidth;stim.classList.add('pop');
      api.progress((r%20)/20);
      const t0=performance.now();
      const ans=await new Promise(resolve=>{
        let done=false;
        const fin=v=>{if(done)return;done=true;btns.forEach(b=>{b.onclick=null;});resolve(v);};
        btns.forEach(b=>b.onclick=()=>fin(b.dataset.d));
        const t=setTimeout(()=>fin(null),c.ms);
        api.onCancel(()=>{clearTimeout(t);fin(null);});
      });
      if(api.cancelled) break;
      total++;
      const ok=ans===dir;
      if(ok){correct++;rts.push(performance.now()-t0);api.ok();}else api.bad();
      stim.textContent='—';
      if(!api.recordResult(ok)) break;
      await api.delay(180);
    }
    if(api.cancelled) return;
    const acc=total?Math.round(correct/total*100):0;
    const avg=rts.length?Math.round(rts.reduce((a,b)=>a+b,0)/rts.length):0;
    api.finish({acc,rt:avg,level:api.level,detail:{'Верно':`${correct}/${total}`}});
  }};

EX.ruleswitch={id:'ruleswitch',name:'Переключение правил',cat:'speed',icon:'🔀',tag:'Гибкость',
  about:'Сортируй то по цвету, то по форме.',how:['Карточка с фигурой.','Сверху правило.','Нажми корзину.'],
  hint:'Сначала правило.',levels:['3ц · редко','3ц','3×3','4×3','4×4','4×4 быстро'],
  defaultLevel:1,
  async run(host,api){
    const cfg=[{colors:3,shapes:2,swapEvery:6,ms:3000},{colors:3,shapes:2,swapEvery:5,ms:2800},{colors:3,shapes:3,swapEvery:4,ms:2400},{colors:4,shapes:3,swapEvery:4,ms:2000},{colors:4,shapes:4,swapEvery:3,ms:1700},{colors:4,shapes:4,swapEvery:2,ms:1400}];
    const COLORS=['#A4503A','#3F5A7A','#3F6152','#B87F35'];
    const SHAPES=[{sym:'●'},{sym:'■'},{sym:'▲'},{sym:'◆'}];
    const maxR=api.mode==='normal'?20:9999;
    host.innerHTML=`<p id="rsR" style="text-align:center;font-size:13px;font-weight:600;margin-bottom:12px;padding:10px;border-radius:12px;background:var(--moss-soft);color:var(--moss)">По цвету</p>
      <div class="stim-stage" style="min-height:160px"><div id="rsC" style="font-size:96px;line-height:1">●</div></div>
      <div class="pad" id="rsP" style="grid-template-columns:1fr 1fr;margin-top:14px;max-width:420px"></div>`;
    const rule=$('#rsR',host),card=$('#rsC',host),pad=$('#rsP',host);
    let correct=0,total=0,ruleMode='color';
    for(let r=0;r<maxR;r++){
      if(api.cancelled) break;
      const c=cfg[Math.min(api.level,cfg.length)-1];
      if(r===0||r%c.swapEvery===0){
        ruleMode=ruleMode==='color'?'shape':'color';
        rule.textContent=ruleMode==='color'?'🎨 По ЦВЕТУ':'🔷 По ФОРМЕ';
        if(r>0){SFX.tap();flash('ok');await api.delay(400);}
      }
      const ci=rnd(c.colors),si=rnd(c.shapes);
      card.textContent=SHAPES[si].sym;card.style.color=COLORS[ci];
      card.classList.remove('pop');void card.offsetWidth;card.classList.add('pop');
      let bins;
      if(ruleMode==='color') bins=COLORS.slice(0,c.colors).map(c=>({label:'•',color:c}));
      else bins=SHAPES.slice(0,c.shapes).map(s=>({label:s.sym,color:'var(--ink)'}));
      pad.innerHTML=bins.map((b,i)=>`<button class="pad-btn" data-i="${i}" type="button" style="color:${b.color};font-size:28px">${b.label}</button>`).join('');
      const btns=$$('.pad-btn',pad);
      api.progress((r%20)/20);
      const correctBin=ruleMode==='color'?ci:si;
      const ans=await new Promise(resolve=>{
        let done=false;
        const fin=v=>{if(done)return;done=true;btns.forEach(b=>{b.onclick=null;});resolve(v);};
        btns.forEach((b,i)=>b.onclick=()=>fin(i));
        const t=setTimeout(()=>fin(-1),c.ms);
        api.onCancel(()=>{clearTimeout(t);fin(-1);});
      });
      if(api.cancelled) break;
      total++;
      const ok=ans===correctBin;
      if(ok){correct++;api.ok();}else api.bad();
      if(!api.recordResult(ok)) break;
      await api.delay(180);
    }
    if(api.cancelled) return;
    const acc=total?Math.round(correct/total*100):0;
    api.finish({acc,rt:0,level:api.level,detail:{'Верно':`${correct}/${total}`}});
  }};

EX.math={id:'math',name:'Быстрый счёт',cat:'math',icon:'➗',tag:'Устный счёт',
  about:'Решай примеры.',how:['Пример.','Введи ответ.'],hint:'Считай по частям.',
  levels:['Двузначные','×÷','Три операции','Скобки','Степени','Микс'],defaultLevel:1,
  async run(host,api){
    const ROUNDS=[12,12,14,14,14,12];
    function gen(L){
      let a,b,c,d,ans,text;
      if(L===1){a=15+rnd(85);b=15+rnd(85);const op=pick(['+','−']);if(op==='−'&&b>a)[a,b]=[b,a];ans=op==='+'?a+b:a-b;text=`${a} ${op} ${b}`;}
      else if(L===2){if(Math.random()<.5){a=6+rnd(14);b=4+rnd(12);ans=a*b;text=`${a} × ${b}`;}else{b=4+rnd(11);ans=4+rnd(14);a=b*ans;text=`${a} ÷ ${b}`;}}
      else if(L===3){const t=rnd(3);if(t===0){a=8+rnd(20);b=4+rnd(12);c=5+rnd(20);ans=a+b*c;text=`${a}+${b}×${c}`;}else if(t===1){a=8+rnd(15);b=4+rnd(10);c=5+rnd(20);ans=a*b-c;text=`${a}×${b}−${c}`;}else{a=20+rnd(70);b=15+rnd(50);c=10+rnd(30);ans=a+b-c;text=`${a}+${b}−${c}`;}}
      else if(L===4){const t=rnd(3);if(t===0){a=5+rnd(15);b=3+rnd(9);c=4+rnd(8);ans=(a+b)*c;text=`(${a}+${b})×${c}`;}else if(t===1){a=8+rnd(15);b=3+rnd(8);c=3+rnd(8);ans=(a-b)*c;text=`(${a}−${b})×${c}`;}else{a=5+rnd(20);b=3+rnd(8);c=3+rnd(7);d=2+rnd(8);ans=a+b*c-d;text=`${a}+${b}×${c}−${d}`;}}
      else if(L===5){const t=rnd(4);if(t===0){a=4+rnd(8);b=2+rnd(4);ans=a*a+b**3;text=`${a}²+${b}³`;}else if(t===1){const sq=[9,16,25,36,49,64,81,100,121,144,169,196][rnd(12)];a=Math.sqrt(sq);b=3+rnd(11);ans=a*b;text=`√${sq}×${b}`;}else if(t===2){a=3+rnd(7);b=2+rnd(4);ans=a**b;text=`${a}^${b}`;}else{const sq=[16,25,36,49,64,81,100,121,144][rnd(9)];a=Math.sqrt(sq);b=2+rnd(6);c=5+rnd(20);ans=a+b*b+c;text=`√${sq}+${b}²+${c}`;}}
      else{const t=rnd(5);if(t===0){a=3+rnd(6);b=2+rnd(4);c=2+rnd(4);ans=a**b+c*c;text=`${a}^${b}+${c}²`;}else if(t===1){a=[5,10,15,20,25,30,40,50][rnd(8)];b=[80,120,160,200,240,300,400,500][rnd(8)];ans=a*b/100;text=`${a}% от ${b}`;}else if(t===2){a=3+rnd(10);b=4+rnd(10);c=3+rnd(9);d=2+rnd(7);ans=a*b+c*d;text=`${a}×${b}+${c}×${d}`;}else if(t===3){b=3+rnd(6);const dv=3+rnd(10);a=b*dv;c=2+rnd(9);ans=dv+c*c;text=`${a}÷${b}+${c}²`;}else{const sq=[144,169,196,225,256,289][rnd(6)];a=Math.sqrt(sq);b=3+rnd(10);c=4+rnd(20);ans=a*b-c;text=`√${sq}×${b}−${c}`;}}
      return {text,ans};
    }
    const maxR=api.mode==='normal'?ROUNDS[Math.min(api.level,ROUNDS.length)-1]:9999;
    host.innerHTML=`<div class="stim-stage" style="min-height:130px"><div class="stim text" id="mtT" style="font-size:clamp(24px,7.5vw,40px)">—</div></div>
      <form class="answer-bar" id="mtF" autocomplete="off">
        <input class="answer-input" id="mtI" inputmode="decimal" placeholder="Ответ">
        <button class="btn btn-primary" type="submit">✓</button>
      </form>`;
    const task=$('#mtT',host),form=$('#mtF',host),inp=$('#mtI',host);
    let correct=0,total=0;const rts=[];
    for(let r=0;r<maxR;r++){
      if(api.cancelled) break;
      const p=gen(api.level);
      task.textContent=p.text+' = ?';
      task.classList.remove('pop');void task.offsetWidth;task.classList.add('pop');
      inp.value='';
      setTimeout(()=>inp.focus(),30);
      api.progress((r%15)/15);
      const t0=performance.now();
      const v=await new Promise(resolve=>{
        let done=false;
        const fin=val=>{if(done)return;done=true;form.onsubmit=null;resolve(val);};
        form.onsubmit=e=>{e.preventDefault();fin(inp.value.trim());};
        api.onCancel(()=>fin(''));
      });
      if(api.cancelled) break;
      total++;
      const num=parseFloat(v.replace(',','.'));
      const ok=Math.abs(num-p.ans)<.01;
      if(ok){correct++;rts.push(performance.now()-t0);api.ok();task.textContent='✅ '+p.ans;}
      else{api.bad();task.textContent='❌ '+p.ans;}
      if(!api.recordResult(ok)) break;
      await api.delay(500);
    }
    if(api.cancelled) return;
    const acc=total?Math.round(correct/total*100):0;
    const avg=rts.length?Math.round(rts.reduce((a,b)=>a+b,0)/rts.length):0;
    api.finish({acc,rt:avg,level:api.level,detail:{'Верно':`${correct}/${total}`}});
  }};

EX.chains={id:'chains',name:'Цепочки вычислений',cat:'math',icon:'⛓️',tag:'Память+счёт',
  about:'Применяй операции по порядку.',how:['Старт и цепочка.','Шаг за шагом.','Введи итог.'],
  hint:'Считай пошагово.',levels:['4 оп','5 оп','5 ×÷','6','7','8 микс'],defaultLevel:1,
  async run(host,api){
    const cfg=[{len:4,ops:['+','-'],range:[1,20],ms:9000},{len:5,ops:['+','-'],range:[1,25],ms:11000},{len:5,ops:['+','-','×','÷'],range:[1,15],ms:13000},{len:6,ops:['+','-','×','÷'],range:[1,15],ms:15000},{len:7,ops:['+','-','×','÷'],range:[1,12],ms:18000},{len:8,ops:['+','-','×','÷'],range:[1,10],ms:22000}];
    const maxR=api.mode==='normal'?6:9999;
    host.innerHTML=`<div class="stim-stage" style="min-height:220px"><div id="chC" style="text-align:center;font-size:20px;font-weight:600;line-height:1.7"></div></div>
      <form class="answer-bar" id="chF" autocomplete="off">
        <input class="answer-input" id="chI" inputmode="numeric" placeholder="Итог">
        <button class="btn btn-primary" type="submit">✓</button>
      </form>`;
    const ch=$('#chC',host),form=$('#chF',host),inp=$('#chI',host);
    let correct=0,total=0;
    for(let r=0;r<maxR;r++){
      if(api.cancelled) break;
      const c=cfg[Math.min(api.level,cfg.length)-1];
      let start=1+rnd(c.range[1]),ans=start;
      const steps=[];
      for(let i=0;i<c.len;i++){
        let op=pick(c.ops),n;
        if(op==='×'){n=2+rnd(6);}
        else if(op==='÷'){const dv=[2,3,4,5,6,7].filter(d=>ans%d===0);if(!dv.length){op=pick(['+','-']);n=1+rnd(c.range[1]);}else n=pick(dv);}
        else n=1+rnd(c.range[1]);
        steps.push({op,n});
        if(op==='+') ans+=n;else if(op==='-') ans-=n;else if(op==='×') ans*=n;else ans=Math.round(ans/n);
      }
      ch.innerHTML=`<div style="font-size:16px;color:var(--ink-soft);margin-bottom:10px">Старт: <b style="font-size:22px;color:var(--ink)">${start}</b></div>
        ${steps.map(s=>`<div style="font-size:18px">${s.op} ${s.n}</div>`).join('')}`;
      inp.value='';
      setTimeout(()=>inp.focus(),30);
      api.progress((r%10)/10);
      const v=await new Promise(resolve=>{
        let done=false;
        const fin=val=>{if(done)return;done=true;form.onsubmit=null;resolve(val);};
        form.onsubmit=e=>{e.preventDefault();fin(inp.value.trim());};
        const t=setTimeout(()=>fin(''),c.ms);
        api.onCancel(()=>{clearTimeout(t);fin('');});
      });
      if(api.cancelled) break;
      total++;
      const num=parseInt(v,10);
      const ok=num===ans;
      if(ok){correct++;api.ok();ch.innerHTML=`<div style="font-size:24px;color:var(--moss);font-weight:600">✅ ${ans}</div>`;}
      else{api.bad();ch.innerHTML=`<div style="font-size:24px;color:var(--rust);font-weight:600">❌ ${ans}</div>`;}
      if(!api.recordResult(ok)) break;
      await api.delay(800);
    }
    if(api.cancelled) return;
    const acc=total?Math.round(correct/total*100):0;
    api.finish({acc,rt:0,level:api.level,detail:{'Верно':`${correct}/${total}`}});
  }};

EX.compare={id:'compare',name:'Сравнение выражений',cat:'math',icon:'⚖️',tag:'Интуиция',
  about:'Что больше?',how:['Два выражения.','Выбери < = >.'],hint:'Округляй.',
  levels:['Суммы','Умножение','Смешан.','Проценты','Квадраты','Микс'],defaultLevel:1,
  async run(host,api){
    function gen(L){
      let la,ra,a,b;
      if(L===1){const a1=15+rnd(80),a2=15+rnd(80),b1=15+rnd(80),b2=15+rnd(80);la=`${a1}+${a2}`;ra=`${b1}+${b2}`;a=a1+a2;b=b1+b2;}
      else if(L===2){const a1=6+rnd(14),a2=4+rnd(12),b1=6+rnd(14),b2=4+rnd(12);la=`${a1}×${a2}`;ra=`${b1}×${b2}`;a=a1*a2;b=b1*b2;}
      else if(L===3){const a1=8+rnd(20),a2=4+rnd(12),a3=5+rnd(20),b1=8+rnd(20),b2=4+rnd(12),b3=5+rnd(20);la=`${a1}×${a2}+${a3}`;ra=`${b1}×${b2}+${b3}`;a=a1*a2+a3;b=b1*b2+b3;}
      else if(L===4){const pa=pick([15,20,25,30,35,40,45,60,75]),na=pick([40,80,120,160,200,240,300,400]),pb=pick([15,20,25,30,35,40,45,60,75]),nb=pick([40,80,120,160,200,240,300,400]);la=`${pa}% от ${na}`;ra=`${pb}% от ${nb}`;a=pa*na/100;b=pb*nb/100;}
      else if(L===5){const t=rnd(2);if(t===0){const a1=6+rnd(20),b1=6+rnd(20),b2=4+rnd(12);la=`${a1}²`;ra=`${b1}×${b2}`;a=a1*a1;b=b1*b2;}else{const sq1=[144,169,196,225,256,289,324,361,400][rnd(9)],sq2=[144,169,196,225,256,289,324,361,400][rnd(9)];const m1=4+rnd(12),m2=4+rnd(12);la=`√${sq1}×${m1}`;ra=`√${sq2}×${m2}`;a=Math.sqrt(sq1)*m1;b=Math.sqrt(sq2)*m2;}}
      else{const t=rnd(3);if(t===0){const a1=8+rnd(15),a2=6+rnd(15),a3=4+rnd(10),b1=8+rnd(15),b2=6+rnd(15),b3=4+rnd(10);la=`${a1}×${a2}−${a3}`;ra=`${b1}×${b2}−${b3}`;a=a1*a2-a3;b=b1*b2-b3;}else if(t===1){const pa=pick([12,18,22,28,32,38]),na=pick([150,250,350,450,550,650]),b1=8+rnd(15),b2=4+rnd(12),b3=5+rnd(20);la=`${pa}% от ${na}`;ra=`${b1}×${b2}+${b3}`;a=pa*na/100;b=b1*b2+b3;}else{const a1=3+rnd(6),a2=2+rnd(4),a3=3+rnd(8),b1=3+rnd(6),b2=2+rnd(4),b3=3+rnd(8);la=`${a1}³+${a3}`;ra=`${b1}²×${b2}+${b3}`;a=a1**3+a3;b=b1*b1*b2+b3;}}
      return {la,ra,a,b};
    }
    const maxR=api.mode==='normal'?15:9999;
    host.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:22px">
      <div class="card" style="text-align:center;padding:24px 12px;margin:0;font-size:17px;font-weight:600" id="cmpL">—</div>
      <div class="card" style="text-align:center;padding:24px 12px;margin:0;font-size:17px;font-weight:600" id="cmpR">—</div>
    </div>
    <div class="pad" style="grid-template-columns:repeat(3,1fr)">
      <button class="pad-btn" data-v="lt" type="button" style="font-size:22px">&lt;</button>
      <button class="pad-btn" data-v="eq" type="button" style="font-size:22px">=</button>
      <button class="pad-btn" data-v="gt" type="button" style="font-size:22px">&gt;</button>
    </div>`;
    const lEl=$('#cmpL',host),rEl=$('#cmpR',host),btns=$$('.pad-btn',host);
    let correct=0,total=0;
    for(let r=0;r<maxR;r++){
      if(api.cancelled) break;
      const p=gen(api.level);
      lEl.textContent=p.la;rEl.textContent=p.ra;
      lEl.classList.remove('pop');rEl.classList.remove('pop');
      void lEl.offsetWidth;lEl.classList.add('pop');rEl.classList.add('pop');
      api.progress((r%15)/15);
      const ans=await new Promise(resolve=>{
        let done=false;
        const fin=v=>{if(done)return;done=true;btns.forEach(b=>{b.onclick=null;});resolve(v);};
        btns.forEach(b=>b.onclick=()=>fin(b.dataset.v));
        const t=setTimeout(()=>fin(null),12000);
        api.onCancel(()=>{clearTimeout(t);fin(null);});
      });
      if(api.cancelled) break;
      total++;
      const trueVal=p.a>p.b?'gt':p.a<p.b?'lt':'eq';
      const ok=ans===trueVal;
      if(ok){correct++;api.ok();}else api.bad();
      if(!api.recordResult(ok)) break;
      await api.delay(600);
    }
    if(api.cancelled) return;
    const acc=total?Math.round(correct/total*100):0;
    api.finish({acc,rt:0,level:api.level,detail:{'Верно':`${correct}/${total}`}});
  }};

EX.percent={id:'percent',name:'Проценты и доли',cat:'math',icon:'💯',tag:'Практика',
  about:'Скидки, проценты, доли.',how:['Задача.','Введи ответ.'],hint:'15% = 10%+5%.',
  levels:['15–25%','Дроби','30–45%','Смешан.','Сложные','Скидки+'],defaultLevel:1,
  async run(host,api){
    function gen(L){
      let text,ans;
      if(L===1){const p=pick([15,25,20]),n=pick([80,120,160,200,240,320]);text=`${p}% от ${n}`;ans=p/100*n;}
      else if(L===2){const n=pick([12,16,20,24,28,32,40,60,80,120]),d=pick([3,4,5,6,8,10,12]);const num=d===3?2:d===4?3:d===5?2:d===6?5:d===8?3:d===10?7:5;ans=num/d*(n*d/2);text=`${num}/${d} от ${n*d/2}`;}
      else if(L===3){const p=pick([30,35,40,45,55,65]),n=pick([120,160,200,240,320,400,500]);text=`${p}% от ${n}`;ans=p/100*n;}
      else if(L===4){const t=rnd(3);if(t===0){const p=pick([12,18,22,28,32]),n=pick([150,250,350,450,550]);text=`${p}% от ${n}`;ans=p/100*n;}else if(t===1){const n=pick([24,36,48,60,72]),d=pick([6,8,9,12]);const num=d===6?5:d===8?7:d===9?4:11;ans=num/d*n;text=`${num}/${d} от ${n}`;}else{const price=pick([240,360,480,600,840,1200]),pct=pick([12,18,22,28]);text=`Скидка ${pct}% на ${price}₽`;ans=price*(1-pct/100);}}
      else if(L===5){const t=rnd(3);if(t===0){const p=pick([7,13,17,23,37,47]),n=pick([200,300,400,600,800]);text=`${p}% от ${n}`;ans=p/100*n;}else if(t===1){const base=pick([1200,1800,2400,3600]),inc=pick([8,12,15,22]);text=`${base}₽ + ${inc}%`;ans=base*(1+inc/100);}else{const price=pick([2400,3600,4800]),d1=pick([10,15,20]),d2=pick([5,10,15]);text=`${price}₽, скидки ${d1}% и ${d2}%`;ans=price*(1-d1/100)*(1-d2/100);}}
      else{const t=rnd(4);if(t===0){const price=pick([800,1200,1600,2400]),d=pick([15,20,25,30]),tax=pick([8,10,12]);text=`${price}₽, −${d}%, +${tax}%`;ans=price*(1-d/100)*(1+tax/100);}else if(t===1){const p=pick([13,17,23,29,37]),n=pick([160,240,320,480,640]);text=`${p}% от ${n}`;ans=p/100*n;}else if(t===2){const total=pick([1000,1500,2000,2500]),p1=pick([20,25,30,35]),p2=pick([15,20,25]);text=`${p1}%+${p2}% от ${total}`;ans=total*(p1+p2)/100;}else{const price=pick([600,900,1200,1800]),up=pick([12,18,24]),down=pick([10,15,20]);text=`${price}₽ → +${up}% → −${down}%`;ans=price*(1+up/100)*(1-down/100);}}
      return {text,ans};
    }
    const maxR=api.mode==='normal'?12:9999;
    host.innerHTML=`<div class="stim-stage" style="min-height:150px"><div class="stim text" id="pcT" style="font-size:clamp(18px,5.5vw,28px);text-align:center;line-height:1.4">—</div></div>
      <form class="answer-bar" id="pcF" autocomplete="off">
        <input class="answer-input" id="pcI" inputmode="decimal" placeholder="Ответ">
        <button class="btn btn-primary" type="submit">✓</button>
      </form>`;
    const task=$('#pcT',host),form=$('#pcF',host),inp=$('#pcI',host);
    let correct=0,total=0;
    for(let r=0;r<maxR;r++){
      if(api.cancelled) break;
      const p=gen(api.level);
      task.textContent=p.text;
      task.classList.remove('pop');void task.offsetWidth;task.classList.add('pop');
      inp.value='';
      setTimeout(()=>inp.focus(),30);
      api.progress((r%12)/12);
      const v=await new Promise(resolve=>{
        let done=false;
        const fin=val=>{if(done)return;done=true;form.onsubmit=null;resolve(val);};
        form.onsubmit=e=>{e.preventDefault();fin(inp.value.trim());};
        api.onCancel(()=>fin(''));
      });
      if(api.cancelled) break;
      total++;
      const num=parseFloat(v.replace(',','.'));
      const ok=Math.abs(num-p.ans)<.5;
      if(ok){correct++;api.ok();task.textContent='✅ '+Math.round(p.ans*100)/100;}
      else{api.bad();task.textContent='❌ '+Math.round(p.ans*100)/100;}
      if(!api.recordResult(ok)) break;
      await api.delay(700);
    }
    if(api.cancelled) return;
    const acc=total?Math.round(correct/total*100):0;
    api.finish({acc,rt:0,level:api.level,detail:{'Верно':`${correct}/${total}`}});
  }};

EX.anagram={id:'anagram',name:'Анаграммы',cat:'logic',icon:'🔤',tag:'Скорость',
  about:'Собери слово.',how:['Перемешанные буквы.','Собери слово.'],hint:'Начни с гласных.',
  levels:['6 букв','7','8','9','10','12+'],defaultLevel:1,
  async run(host,api){
    const W={1:['КАРТИНА','ЗЕРКАЛО','ВОЛШЕБНО','МЫШЛЕНИЕ','РАДУГА'],
      2:['ТВОРЧЕСТВО','ИНТУИЦИЯ','СКОРОСТЬ','ВНИМАНИЕ','СОЗНАНИЕ'],
      3:['ВДОХНОВЕНИЕ','ВООБРАЖЕНИЕ','ПРИКЛЮЧЕНИЕ','ПРОСТРАНСТВО'],
      4:['МНОГООБРАЗИЕ','ВЗАИМОДЕЙСТВИЕ','ПРЕДСТАВЛЕНИЕ','ИССЛЕДОВАНИЕ'],
      5:['ПРОГРАММИРОВАНИЕ','ВЗАИМОПОНИМАНИЕ','СОВЕРШЕНСТВОВАНИЕ'],
      6:['АБСТРАГИРОВАНИЕ','ПЕРЕОСМЫСЛЕНИЕ','СИСТЕМАТИЗАЦИЯ']};
    const maxR=api.mode==='normal'?8:9999;
    host.innerHTML=`<div class="stim-stage" style="min-height:130px"><div class="stim text" id="anS" style="font-size:clamp(18px,5.5vw,28px);letter-spacing:.14em">—</div></div>
      <form class="answer-bar" id="anF" autocomplete="off">
        <input class="answer-input" id="anI" placeholder="Слово" style="font-size:16px;text-transform:uppercase">
        <button class="btn btn-primary" type="submit">✓</button>
      </form>`;
    const scr=$('#anS',host),form=$('#anF',host),inp=$('#anI',host);
    let correct=0,total=0;
    for(let r=0;r<maxR;r++){
      if(api.cancelled) break;
      const pool=W[Math.min(api.level,6)]||W[1];const w=pick(pool);
      let s=shuffle(w.split('')).join('');
      if(s===w) s=shuffle(w.split('')).join('');
      scr.textContent=s.split('').join(' ');
      scr.classList.remove('pop');void scr.offsetWidth;scr.classList.add('pop');
      inp.value='';
      setTimeout(()=>inp.focus(),30);
      api.progress((r%10)/10);
      const v=await new Promise(resolve=>{
        let done=false;
        const fin=val=>{if(done)return;done=true;form.onsubmit=null;resolve(val);};
        form.onsubmit=e=>{e.preventDefault();fin(inp.value.trim().toUpperCase());};
        api.onCancel(()=>fin(''));
      });
      if(api.cancelled) break;
      total++;
      const ok=v===w;
      if(ok){correct++;api.ok();scr.textContent='✅ '+w;}
      else{api.bad();scr.textContent='❌ '+w;}
      if(!api.recordResult(ok)) break;
      await api.delay(600);
    }
    if(api.cancelled) return;
    const acc=total?Math.round(correct/total*100):0;
    api.finish({acc,rt:0,level:api.level,detail:{'Верно':`${correct}/${total}`}});
  }};

EX.sequence={id:'sequence',name:'Последовательности',cat:'logic',icon:'🔗',tag:'Мышление',
  about:'Найди закономерность.',how:['Ряд чисел.','Определи.','Введи след.'],hint:'Разности, отношения.',
  levels:['Смеш.','Ступ.','Фибоначчи','Нелин.','Степени','Микс'],defaultLevel:1,
  async run(host,api){
    function gen(L){
      const types={1:['arith','square'],2:['step','geom'],3:['fib','step'],4:['mix','power'],5:['power','prime'],6:['mix','power','prime','interleave']}[L];
      const t=pick(types);let arr,next;
      if(t==='arith'){const a=1+rnd(20);const d=(pick([-1,1]))*(2+rnd(12));arr=[a,a+d,a+2*d,a+3*d];next=a+4*d;}
      else if(t==='geom'){const a=1+rnd(6);const r=2+rnd(L>=4?4:3);arr=[a,a*r,a*r*r,a*r**3];next=a*r**4;}
      else if(t==='square'){const s=2+rnd(8);arr=[s,s+1,s+2,s+3].map(x=>x*x);next=(s+4)**2;}
      else if(t==='fib'){const a=1+rnd(8),b=a+1+rnd(8);arr=[a,b];for(let i=0;i<3;i++)arr.push(arr[arr.length-1]+arr[arr.length-2]);next=arr[arr.length-1]+arr[arr.length-2];}
      else if(t==='step'){let a=1+rnd(10),d=1+rnd(5);const step=2+rnd(5);arr=[a];for(let i=0;i<3;i++){a+=d;arr.push(a);d+=step;}next=a+d;}
      else if(t==='prime'){const P=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47];const s=rnd(7);arr=P.slice(s,s+4);next=P[s+4];}
      else if(t==='mix'){const a=1+rnd(6),mul=2+rnd(4),add=pick([-4,-3,-2,-1,1,2,3,4]);arr=[a];for(let i=0;i<3;i++)arr.push(arr[arr.length-1]*mul+add);next=arr[arr.length-1]*mul+add;}
      else if(t==='power'){const s=2+rnd(3);arr=[s,s**2,s**3,s**4];next=s**5;}
      else{const a=1+rnd(15),b=80+rnd(40);arr=[a,b,a+4,b-4,a+8,b-8];next=a+12;}
      return {arr,next};
    }
    const maxR=api.mode==='normal'?8:9999;
    host.innerHTML=`<div class="stim-stage" style="min-height:130px"><div class="stim text" id="sqT" style="font-size:clamp(16px,5vw,26px)">—</div></div>
      <form class="answer-bar" id="sqF" autocomplete="off">
        <input class="answer-input" id="sqI" inputmode="numeric" placeholder="?">
        <button class="btn btn-primary" type="submit">✓</button>
      </form>`;
    const task=$('#sqT',host),form=$('#sqF',host),inp=$('#sqI',host);
    let correct=0,total=0;
    for(let r=0;r<maxR;r++){
      if(api.cancelled) break;
      const p=gen(api.level);
      task.textContent=p.arr.join(' · ')+' · ?';
      task.classList.remove('pop');void task.offsetWidth;task.classList.add('pop');
      inp.value='';
      setTimeout(()=>inp.focus(),30);
      api.progress((r%10)/10);
      const v=await new Promise(resolve=>{
        let done=false;
        const fin=val=>{if(done)return;done=true;form.onsubmit=null;resolve(val);};
        form.onsubmit=e=>{e.preventDefault();fin(inp.value.trim());};
        api.onCancel(()=>fin(''));
      });
      if(api.cancelled) break;
      total++;
      const ok=Math.abs(parseFloat(v)-p.next)<.001;
      if(ok){correct++;api.ok();task.textContent='✅ '+p.next;}
      else{api.bad();task.textContent='❌ '+p.next;}
      if(!api.recordResult(ok)) break;
      await api.delay(650);
    }
    if(api.cancelled) return;
    const acc=total?Math.round(correct/total*100):0;
    api.finish({acc,rt:0,level:api.level,detail:{'Верно':`${correct}/${total}`}});
  }};

EX.sudoku={id:'sudoku',name:'Судоку 4×4',cat:'logic',icon:'🔲',tag:'Логика',
  about:'Заполни цифрами 1–4.',how:['Выбери клетку.','Выбери цифру.','Заполни всё.'],
  hint:'Строка, столбец, блок.',levels:['5','6','7','8','9','10'],defaultLevel:1,
  async run(host,api){
    function genBase(){const base=[[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]];const dm=shuffle([1,2,3,4]);return base.map(r=>r.map(v=>dm[v-1]));}
    function safe(g,r,c,v){
      for(let i=0;i<4;i++) if(g[r][i]===v||g[i][c]===v) return false;
      const br=Math.floor(r/2)*2,bc=Math.floor(c/2)*2;
      for(let rr=br;rr<br+2;rr++) for(let cc=bc;cc<bc+2;cc++) if(g[rr][cc]===v) return false;
      return true;
    }
    function solve(g){
      for(let r=0;r<4;r++) for(let c=0;c<4;c++){
        if(g[r][c]===0){for(let v=1;v<=4;v++){if(safe(g,r,c,v)){g[r][c]=v;if(solve(g))return true;g[r][c]=0;}}return false;}
      }
      return true;
    }
    const maxR=api.mode==='normal'?4:9999;
    const hb=[5,6,7,8,9,10];
    let correct=0,total=0;
    for(let r=0;r<maxR;r++){
      if(api.cancelled) break;
      const holes=hb[Math.min(api.level,hb.length)-1];
      const full=genBase();solve(full);
      const puzzle=full.map(r=>r.slice());
      const positions=shuffle([...Array(16).keys()]).slice(0,holes);
      positions.forEach(p=>{puzzle[Math.floor(p/4)][p%4]=0;});
      let solvedOK=true;
      const ug=puzzle.map(r=>r.slice());
      host.innerHTML=`<div class="grid" id="sdG" style="grid-template-columns:repeat(4,1fr);max-width:320px">
          ${puzzle.flatMap((row,ri)=>row.map((v,ci)=>`<div class="cell ${v?'locked':''}" data-r="${ri}" data-c="${ci}" style="font-size:28px">${v||''}</div>`)).join('')}
        </div>
        <div class="pad" id="sdP" style="grid-template-columns:repeat(4,1fr);max-width:320px;margin-top:16px">
          ${[1,2,3,4].map(n=>`<button class="pad-btn" data-n="${n}" type="button" style="min-height:56px;font-size:22px">${n}</button>`).join('')}
        </div>
        <p class="muted" id="sdH" style="text-align:center;margin-top:12px;font-size:12.5px">Выбери клетку, потом цифру</p>`;
      const grid=$('#sdG',host),pad=$('#sdP',host),hint=$('#sdH',host);
      let sel=null;
      const cells=$$('.cell',grid);
      cells.forEach(cell=>{
        cell.onclick=()=>{
          if(cell.classList.contains('locked')) return;
          cells.forEach(c=>c.style.borderColor='');
          cell.style.borderColor='var(--moss)';
          sel=cell;SFX.tap();
        };
      });
      let filled=holes;
      await new Promise(resolve=>{
        $$('.pad-btn',pad).forEach(btn=>{
          btn.onclick=()=>{
            if(!sel||api.cancelled) return;
            const n=+btn.dataset.n;
            const rr=+sel.dataset.r,cc=+sel.dataset.c;
            if(safe(ug,rr,cc,n)){ug[rr][cc]=n;sel.textContent=n;sel.classList.remove('bad');sel.classList.add('ok');SFX.ok();buzz(8);}
            else{ug[rr][cc]=n;sel.textContent=n;sel.classList.add('bad');SFX.err();flash('bad');solvedOK=false;}
            filled--;
            if(filled===0) resolve();
          };
        });
        api.onCancel(resolve);
      });
      cells.forEach((cell,i)=>{
        const rr=Math.floor(i/4),cc=i%4;
        if(puzzle[rr][cc]===0){
          if(ug[rr][cc]===full[rr][cc]){cell.classList.add('ok');cell.classList.remove('bad');}
          else{cell.classList.add('bad');cell.classList.remove('ok');}
        }
      });
      hint.textContent=solvedOK?'✅ Верно':'❌ Есть ошибки';
      total++;
      if(solvedOK){correct++;api.ok();}else api.bad();
      if(!api.recordResult(solvedOK)) break;
      await api.delay(900);
    }
    if(api.cancelled) return;
    const acc=total?Math.round(correct/total*100):0;
    api.finish({acc,rt:0,level:api.level,detail:{'Верно':`${correct}/${total}`}});
  }};

EX.magic={id:'magic',name:'Магический квадрат',cat:'logic',icon:'✨',tag:'Логика',
  about:'Сумма каждой линии = 15.',how:['Даны числа.','Расставь.','Сумма = 15.'],
  hint:'Центр — 5.',levels:['4','5','6','7','8','8 сложн.'],defaultLevel:1,
  async run(host,api){
    function mk(){const base=[[4,9,2],[3,5,7],[8,1,6]];const ops=rnd(8);let m=base.map(r=>r.slice());
      const rot=g=>g[0].map((_,i)=>g.map(r=>r[i]).reverse());
      const mir=g=>g.map(r=>r.slice().reverse());
      for(let i=0;i<ops%4;i++) m=rot(m);
      if(ops>=4) m=mir(m);
      return m;}
    const maxR=api.mode==='normal'?5:9999;
    const hb=[4,5,6,7,8,8];
    let correct=0,total=0;
    for(let r=0;r<maxR;r++){
      if(api.cancelled) break;
      const holes=Math.min(hb[Math.min(api.level,hb.length)-1],8);
      const full=mk();
      const puzzle=full.map(r=>r.slice());
      const positions=shuffle([...Array(9).keys()]).slice(0,holes);
      positions.forEach(p=>{puzzle[Math.floor(p/3)][p%3]=0;});
      const used=new Set();puzzle.flat().forEach(v=>v&&used.add(v));
      const avail=[1,2,3,4,5,6,7,8,9].filter(v=>!used.has(v));
      host.innerHTML=`<p class="muted" style="text-align:center;margin-bottom:14px">Сумма каждой линии = 15</p>
        <div class="grid" id="mgG" style="grid-template-columns:repeat(3,1fr);max-width:300px;gap:6px">
          ${puzzle.flatMap((row,ri)=>row.map((v,ci)=>`<div class="cell ${v?'locked':''}" data-r="${ri}" data-c="${ci}" style="font-size:26px;aspect-ratio:1;min-height:60px">${v||''}</div>`)).join('')}
        </div>
        <div class="pad" id="mgP" style="grid-template-columns:repeat(4,1fr);max-width:320px;margin-top:16px">
          ${avail.map(n=>`<button class="pad-btn" data-n="${n}" type="button" style="min-height:52px;font-size:18px">${n}</button>`).join('')}
        </div>`;
      const grid=$('#mgG',host),pad=$('#mgP',host);
      const cells=$$('.cell',grid);
      const ug=puzzle.map(r=>r.slice());
      let sel=null;
      cells.forEach(cell=>{
        cell.onclick=()=>{
          if(cell.classList.contains('locked')) return;
          cells.forEach(c=>c.style.borderColor='');
          cell.style.borderColor='var(--moss)';
          sel=cell;SFX.tap();
        };
      });
      let remaining=holes;
      await new Promise(resolve=>{
        $$('.pad-btn',pad).forEach(btn=>{
          btn.onclick=()=>{
            if(!sel||api.cancelled||btn.disabled) return;
            const n=+btn.dataset.n;
            const rr=+sel.dataset.r,cc=+sel.dataset.c;
            ug[rr][cc]=n;sel.textContent=n;
            sel.style.color='var(--moss)';
            btn.disabled=true;btn.style.opacity=.3;
            SFX.tap();buzz(6);remaining--;
            if(remaining===0) resolve();
          };
        });
        api.onCancel(resolve);
      });
      const rowS=[0,1,2].map(rr=>ug[rr].reduce((a,b)=>a+b,0));
      const colS=[0,1,2].map(cc=>ug.reduce((a,row)=>a+row[cc],0));
      const d1=ug[0][0]+ug[1][1]+ug[2][2];
      const d2=ug[0][2]+ug[1][1]+ug[2][0];
      const ok=rowS.every(s=>s===15)&&colS.every(s=>s===15)&&d1===15&&d2===15;
      cells.forEach((cell,i)=>{
        if(puzzle[Math.floor(i/3)][i%3]===0) cell.classList.add(ok?'ok':'bad');
      });
      total++;
      if(ok){correct++;api.ok();}else api.bad();
      if(!api.recordResult(ok)) break;
      await api.delay(900);
    }
    if(api.cancelled) return;
    const acc=total?Math.round(correct/total*100):0;
    api.finish({acc,rt:0,level:api.level,detail:{'Верно':`${correct}/${total}`}});
  }};

EX.signs={id:'signs',name:'Расставь знаки',cat:'logic',icon:'➕',tag:'Гибкость',
  about:'Расставь знаки, чтобы получить цель.',how:['Числа и цель.','Меняй знаки.','Проверь.'],
  hint:'× и ÷ считаются раньше + и −.',levels:['4 · +−','4 · все','5 · +−','5 · все','6 · все','6 · сложн.'],defaultLevel:1,
  async run(host,api){
    function compute(nums,ops){
      const n=nums.slice(),o=ops.slice();
      for(let i=0;i<o.length;i++){
        if(o[i]==='*'||o[i]==='/'){
          const v=o[i]==='*'?n[i]*n[i+1]:n[i]/n[i+1];
          n[i]=v;n.splice(i+1,1);o.splice(i,1);i--;
        }
      }
      let v=n[0];
      for(let i=0;i<o.length;i++){v=o[i]==='+'?v+n[i+1]:v-n[i+1];}
      return v;
    }
    function gen(L){
      const len=L<=2?4:L<=4?5:6;
      const ops=L===1||L===3?['+','-']:['+','-','*','/'];
      for(let a=0;a<500;a++){
        const nums=Array.from({length:len},()=>1+rnd(9));
        const expr=[];
        for(let i=0;i<len-1;i++) expr.push(pick(ops));
        const val=compute(nums,expr);
        if(Number.isInteger(val)&&Math.abs(val)<=200&&val!==0) return {nums,ops:expr,target:val};
      }
      return {nums:[3,4,5,6],ops:['+','+','+'],target:18};
    }
    const maxR=api.mode==='normal'?6:9999;
    const D={'+':'+','-':'−','*':'×','/':'÷'};
    let correct=0,total=0;
    for(let r=0;r<maxR;r++){
      if(api.cancelled) break;
      const puzzle=gen(api.level);
      const {nums,target}=puzzle;
      const useAll=!(api.level===1||api.level===3);
      const userOps=new Array(nums.length-1).fill('+');
      host.innerHTML=`<p class="muted" style="text-align:center;margin-bottom:14px">Получи <b style="color:var(--moss);font-size:20px">${target}</b></p>
        <div id="sgEq" class="signs-eq"></div>
        <p class="muted" style="text-align:center;margin-top:12px;font-size:12.5px">Нажимай на знаки. Считай сам.</p>
        <button class="btn btn-primary btn-full btn-lg" id="sgCheck" type="button" style="margin-top:18px">Проверить</button>`;
      const eq=$('#sgEq',host);
      const refresh=()=>{
        let s='';
        for(let i=0;i<nums.length;i++){
          s+=`<b>${nums[i]}</b>`;
          if(i<nums.length-1) s+=`<span class="op-slot" data-i="${i}">${D[userOps[i]]}</span>`;
        }
        eq.innerHTML=s;
        $$('.op-slot',eq).forEach(slot=>{
          slot.onclick=()=>{
            const i=+slot.dataset.i;
            const cycle=useAll?['+','-','*','/']:['+','-'];
            const idx=cycle.indexOf(userOps[i]);
            userOps[i]=cycle[(idx+1)%cycle.length];
            SFX.tap();buzz(6);refresh();
          };
        });
      };
      refresh();
      api.progress((r%10)/10);
      await new Promise(resolve=>{
        $('#sgCheck',host).onclick=()=>{SFX.tap();buzz(10);resolve();};
        api.onCancel(resolve);
      });
      if(api.cancelled) break;
      const result=compute(nums,userOps);
      const ok=Math.abs(result-target)<.001;
      total++;
      if(ok){correct++;api.ok();}else api.bad();
      eq.innerHTML+=`<div style="margin-top:14px;font-size:15px;font-family:'IBM Plex Sans',sans-serif;color:${ok?'var(--moss)':'var(--rust)'}">
        ${ok?'✅ Верно!':`❌ Твой ответ: ${result}, нужно: ${target}`}
      </div>`;
      if(!api.recordResult(ok)) break;
      await api.delay(1400);
    }
    if(api.cancelled) return;
    const acc=total?Math.round(correct/total*100):0;
    api.finish({acc,rt:0,level:api.level,detail:{'Верно':`${correct}/${total}`}});
  }};

const EX_LIST = Object.values(EX);
window.EX_LIST = EX_LIST;
window.EX = EX;
window.CATS = CATS;

function createApi(refs,level,mode){
  const api={
    level,mode,cancelled:false,paused:false,
    streak:0,score:0,rounds:0,_handlers:[],_intervals:new Set(),
    onCancel(fn){
      if(api.cancelled){fn();return ()=>{};}
      api._handlers.push(fn);
      return ()=>{const i=api._handlers.indexOf(fn);if(i>=0)api._handlers.splice(i,1);};
    },
    cancel(){
      if(api.cancelled) return;
      api.cancelled=true;
      api._intervals.forEach(id=>clearInterval(id));
      api._intervals.clear();
      const hs=api._handlers.slice();api._handlers=[];
      hs.forEach(fn=>{try{fn();}catch(e){}});
    },
    pause(){api.paused=true;},
    resume(){api.paused=false;},
    delay(ms){
      return new Promise(resolve=>{
        if(api.cancelled) return resolve();
        let el=0;const STEP=50;
        const t=setInterval(()=>{
          if(api.cancelled){clearInterval(t);api._intervals.delete(t);return resolve();}
          if(api.paused) return;
          el+=STEP;
          if(el>=ms){clearInterval(t);api._intervals.delete(t);resolve();}
        },STEP);
        api._intervals.add(t);
        api.onCancel(()=>{clearInterval(t);api._intervals.delete(t);resolve();});
      });
    },
    raceAnswer(el,timeoutMs){
      return new Promise(resolve=>{
        if(api.cancelled) return resolve(TIMEOUT);
        let done=false,el2=0;const STEP=50;
        const fin=v=>{
          if(done) return;done=true;
          el.removeEventListener('click',onClick);
          el.removeEventListener('touchstart',onTouch);
          clearInterval(t);
          api._intervals.delete(t);
          unreg();
          resolve(v);
        };
        const onClick=e=>{if(api.cancelled||api.paused) return;e.preventDefault();SFX.tap();buzz(8);fin('clicked');};
        const onTouch=e=>{if(api.cancelled||api.paused) return;SFX.tap();buzz(8);fin('clicked');};
        el.addEventListener('click',onClick);
        el.addEventListener('touchstart',onTouch,{passive:true});
        const t=setInterval(()=>{
          if(done) return;
          if(api.cancelled||api.paused) return;
          el2+=STEP;
          if(el2>=timeoutMs) fin(TIMEOUT);
        },STEP);
        api._intervals.add(t);
        const unreg=api.onCancel(()=>fin(TIMEOUT));
      });
    },
    progress(p){refs.progress(clamp(p,0,1));},
    ok(){refs.feedback('ok');},
    bad(){refs.feedback('bad');},
    hud(html){refs.hud(html);},
    finish(r){refs.finish(r);},
    recordResult(isCorrect){
      api.rounds++;
      if(isCorrect){
        api.streak++;api.score++;
        if(api.mode!=='normal'&&api.streak>0&&api.streak%STREAK_TO_LEVELUP===0&&api.level<6){
          api.level++;
          refs.onLevelUp(api.level);
        }
        return true;
      }
      api.streak=0;
      return api.mode!=='survival';
    }
  };
  return api;
}
window.__queue=[];
function startQueue(ids){window.__queue=ids.slice();nextInQueue();}
window.startQueue = startQueue;

function nextInQueue(){
  if(!window.__queue.length){go('brain');return;}
  const id=window.__queue.shift();
  const ex=EX[id];
  if(!ex){nextInQueue();return;}
  const level=getEffectiveLevel(id,ex);
  const man=(N.S.neurofit.manualDiff[id]||0)>0;
  const mode=N.S.neurofit.preferredMode||'normal';
  const rec=N.S.neurofit.records[id]||{};
  openModal(`
    <div class="modal-handle"></div>
    <div style="font-size:44px;text-align:center;margin-bottom:8px">${ex.icon}</div>
    <div class="h2" style="text-align:center;font-size:22px;margin-bottom:6px">${esc(ex.name)}</div>
    <p class="muted" style="text-align:center;margin-bottom:18px">${esc(ex.about)}</p>
    <div class="tiny" style="margin-bottom:10px">Режим</div>
    <div class="mode-grid">
      ${Object.keys(MODES).map(k=>{
        const m=MODES[k];const r=rec[k];
        return `<button class="mode-opt ${mode===k?'on':''}" data-mode="${k}" type="button">
          <span class="mode-em">${m.emoji}</span>
          <span class="mode-body">
            <span class="mode-title">${esc(m.name)}</span>
            <span class="mode-desc">${esc(m.desc)}</span>
            ${r&&r.score?`<span class="mode-best">🏆 Рекорд: ${r.score}</span>`:''}
          </span>
        </button>`;
      }).join('')}
    </div>
    <div style="padding:12px 14px;border-radius:var(--r);background:var(--paper);border:1px solid var(--line);margin-bottom:18px">
      <div class="tiny" style="margin-bottom:4px">Сложность</div>
      <div style="font-size:14px;font-weight:600">${LEVEL_NAMES[level-1]} — ${esc(ex.levels[level-1])}</div>
      <div class="muted" style="font-size:11.5px;margin-top:3px">${man?'Вручную':'Адаптивная'}</div>
    </div>
    <button class="btn btn-primary btn-full btn-lg" id="exGo" type="button">Начать</button>
    <button class="btn btn-ghost btn-full" id="exHint" type="button" style="margin-top:10px">Подсказка</button>`,m=>{
    let chosen=mode;
    $$('[data-mode]',m).forEach(b=>{
      b.onclick=()=>{
        chosen=b.dataset.mode;
        $$('[data-mode]',m).forEach(x=>x.classList.toggle('on',x.dataset.mode===chosen));
        N.S.neurofit.preferredMode=chosen;saveState();
        SFX.tap();buzz(6);
      };
    });
    $('#exGo',m).onclick=()=>{closeModal(m);N.ensureAudio();buzz(10);setTimeout(()=>runExercise(ex,level,chosen),120);};
    $('#exHint',m).onclick=()=>{closeModal(m);setTimeout(()=>openHintModal(ex,()=>runExercise(ex,level,chosen)),100);};
  });
}
function getEffectiveLevel(id,ex){
  const man=N.S.neurofit.manualDiff[id]||0;
  if(man>0) return clamp(man,1,ex.levels.length);
  return clamp(N.S.neurofit.levels[id]||ex.defaultLevel,1,ex.levels.length);
}
function setRecord(id,mode,data){
  if(!N.S.neurofit.records[id]) N.S.neurofit.records[id]={};
  const cur=N.S.neurofit.records[id][mode];
  const better=!cur||(data.score||0)>(cur.score||0);
  if(better) N.S.neurofit.records[id][mode]=data;
  saveState();
  return better;
}
function runExercise(ex,level,mode){
  $('#nav').classList.add('hidden');
  const host=$('#screens');host.innerHTML='';
  const md=MODES[mode];
  const screen=document.createElement('div');
  screen.className='screen active';
  screen.innerHTML=`
    <header class="ex-head">
      <button class="icon-btn" id="exExit" type="button">✕</button>
      <div class="ex-title">${ex.icon} ${esc(ex.name)}</div>
      <button class="icon-btn" id="exHelp" type="button">?</button>
    </header>
    ${mode!=='normal'?`<div class="mode-banner ${mode}">${md.emoji} ${esc(md.name)}</div>`:''}
    <div class="ex-bar"><i id="exBar"></i></div>
    <div class="ex-hud" id="exHud">${mode!=='normal'?`
      <span class="hud-pill moss">Очки <b id="hudScore">0</b></span>
      <span class="hud-pill gold">🔥 <b id="hudStreak">0</b></span>
      <span class="hud-pill">Ур. <b id="hudLevel">${level}</b></span>
    `:''}</div>
    <div class="ex-host" id="exHost"></div>`;
  host.appendChild(screen);
  const barEl=$('#exBar',screen);
  const hudEl=$('#exHud',screen);
  const exHost=$('#exHost',screen);
  const refs={
    progress(p){barEl.style.transform=`scaleX(${p})`;},
    feedback(kind){
      if(kind==='ok'){SFX.ok();flash('ok');}
      else{SFX.err();flash('bad');buzz(12);}
    },
    hud(html){hudEl.innerHTML=html;},
    onLevelUp(nl){
      SFX.levelup();flash('levelup');buzz([10,30,10]);
      toast(`🚀 Уровень ${nl}! ${LEVEL_NAMES[nl-1]}`,2000,'gold');
      const hl=$('#hudLevel');if(hl) hl.textContent=nl;
    },
    finish(r){onFinish(r);}
  };
  const api=createApi(refs,level,mode);
  const t0=Date.now();
  let finished=false;
  const updateHud=()=>{
    const sc=$('#hudScore');if(sc) sc.textContent=api.score;
    const st=$('#hudStreak');if(st) st.textContent=api.streak;
    const lv=$('#hudLevel');if(lv) lv.textContent=api.level;
  };
  const oK=api.ok,oB=api.bad;
  api.ok=()=>{oK();updateHud();};
  api.bad=()=>{oB();updateHud();};
  function cleanup(){api.cancel();window.__exCleanup=null;}
  function onFinish(result){
    if(finished) return;
    finished=true;
    const ms=Date.now()-t0;
    cleanup();
    setTimeout(()=>finishSession(ex,result,ms,api),40);
  }
  $('#exHelp',screen).onclick=()=>{api.pause();openHintModal(ex,()=>{api.resume();});};
  $('#exExit',screen).onclick=()=>{
    api.pause();
    openPauseModal(ex,
      ()=>{cleanup();window.__queue=[];setTimeout(()=>go('brain'),80);},
      ()=>{api.resume();}
    );
  };
  window.__exCleanup=cleanup;
  Promise.resolve().then(()=>ex.run(exHost,api)).catch(err=>{
    console.error(err);
    if(!finished) onFinish({acc:0,rt:0,level:api.level,detail:{'Ошибка':String(err).slice(0,60)}});
  });
}
function openPauseModal(ex,onExit,onResume){
  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:4px">Пауза</div>
    <p class="muted" style="margin-bottom:22px">${esc(ex.name)}</p>
    <button class="btn btn-primary btn-full btn-lg" id="pzRes" type="button">Продолжить</button>
    <button class="btn btn-ghost btn-full btn-danger" id="pzQuit" type="button" style="margin-top:10px">Завершить</button>`,m=>{
    $('#pzRes',m).onclick=()=>{closeModal(m);if(onResume) onResume();};
    $('#pzQuit',m).onclick=()=>{closeModal(m);onExit();};
  });
}
function openHintModal(ex,onClose){
  openModal(`
    <div class="modal-handle"></div>
    <div class="row" style="margin-bottom:16px">
      <div style="font-size:36px">${ex.icon}</div>
      <div><div class="h2">${esc(ex.name)}</div><div class="muted" style="font-size:12.5px">${esc(ex.tag)}</div></div>
    </div>
    <div class="tiny" style="margin-bottom:10px">Как играть</div>
    <ol style="padding-left:20px;margin-bottom:18px">
      ${ex.how.map(h=>`<li style="margin-bottom:8px;font-size:14px;line-height:1.55">${esc(h)}</li>`).join('')}
    </ol>
    <div style="padding:14px 16px;border-radius:var(--r);background:var(--moss-soft);margin-bottom:20px">
      <div class="tiny" style="color:var(--moss);margin-bottom:6px">Подсказка</div>
      <p style="font-size:13.5px;line-height:1.6;color:var(--moss)">${esc(ex.hint)}</p>
    </div>
    <button class="btn btn-primary btn-full btn-lg" id="hOk" type="button">Продолжить</button>`,m=>{
    $('#hOk',m).onclick=()=>{closeModal(m);if(onClose) setTimeout(onClose,150);};
  });
}
function finishSession(ex,result,ms,api){
  const acc=clamp(Math.round(result.acc||0),0,100);
  const lvl=clamp(result.level||1,1,ex.levels.length);
  const rt=Math.round(result.rt||0);
  const man=(N.S.neurofit.manualDiff[ex.id]||0)>0;
  const mode=api.mode;
  let xp=12+Math.round(acc*0.35)+lvl*8;
  if(rt>0&&rt<700) xp+=8;
  if(mode!=='normal') xp+=Math.round(api.score*1.5);
  let leveled=false,dropped=false;
  if(mode==='normal'&&!man){
    let nl=lvl;
    if(acc>=82) nl=Math.min(6,lvl+1);
    else if(acc<55) nl=Math.max(1,lvl-1);
    if(nl>lvl){leveled=true;N.S.neurofit.levels[ex.id]=nl;}
    else if(nl<lvl){dropped=true;N.S.neurofit.levels[ex.id]=nl;}
    else N.S.neurofit.levels[ex.id]=lvl;
  }
  let newRec=false;
  if(mode!=='normal'){
    newRec=setRecord(ex.id,mode,{score:api.score,acc,level:api.level,date:todayKey()});
  }
  N.S.neurofit.xp+=xp;
  N.S.neurofit.totalSessions+=1;
  N.S.neurofit.todayCount+=1;
  N.S.neurofit.totalMs+=ms;
  N.S.neurofit.catTried[ex.cat]=true;
  N.S.neurofit.sessions.push({ex:ex.id,d:todayKey(),acc,rt,xp,lvl,mode,t:Date.now(),score:api.score});
  if(N.S.neurofit.sessions.length>250) N.S.neurofit.sessions=N.S.neurofit.sessions.slice(-250);
  N.refreshStreak();saveState();
  SFX.win();buzz([18,40,18]);
  if (window.Achievements) window.Achievements.check();
  renderResult(ex,{acc,rt,xp,lvl,detail:result.detail||{},leveled,dropped,ms,man,mode,
    score:api.score,streakMax:api.streak,levelReached:api.level,newRec});
}
function renderResult(ex,r){
  $('#nav').classList.add('hidden');
  const host=$('#screens');host.innerHTML='';
  const scr=document.createElement('div');
  scr.className='screen active';
  const accColor=r.acc>=85?'var(--moss)':r.acc>=60?'var(--amber)':'var(--rust)';
  const more=window.__queue.length>0;
  const li=levelInfo(N.S.neurofit.xp);
  const inf=r.mode!=='normal';
  scr.innerHTML=`
    <div class="result-hero">
      <div class="tiny" style="margin-bottom:10px">${ex.icon} ${esc(ex.name)}</div>
      ${inf?`
        <div class="result-score gold">${r.score}</div>
        <div class="muted" style="margin-top:8px">${r.mode==='survival'?'очков до ошибки':'очков набрано'}</div>
        ${r.newRec?`<div style="margin-top:12px"><span class="chip amber">🏆 Новый рекорд!</span></div>`:''}
      `:`
        <div class="result-score">+${r.xp} XP</div>
        <div class="muted" style="margin-top:8px">тренировка завершена</div>
      `}
    </div>
    <div class="card" style="padding:22px">
      <div class="result-num-row">
        <div class="result-num"><b style="color:${accColor}">${r.acc}%</b><span>точность</span></div>
        ${r.rt?`<div class="result-num-sep"></div>
        <div class="result-num"><b>${r.rt}<span style="font-size:14px;font-weight:500"> мс</span></b><span>реакция</span></div>`:''}
        <div class="result-num-sep"></div>
        <div class="result-num"><b>${Math.round(r.ms/1000)}<span style="font-size:14px;font-weight:500"> с</span></b><span>время</span></div>
      </div>
    </div>
    ${Object.keys(r.detail).length?`
    <div class="card">
      ${Object.entries(r.detail).map(([k,v])=>`<div class="res-row"><span class="muted">${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}
    </div>`:''}
    <div class="card">
      <div class="between" style="margin-bottom:10px">
        <span class="tiny">Уровень ${li.level}</span>
        <span class="tiny">+${r.xp} XP</span>
      </div>
      <div class="bar"><i class="on" style="--p:${li.pct.toFixed(3)}"></i></div>
    </div>
    <div style="margin-top:10px">
      ${more?`<button class="btn btn-primary btn-full btn-lg" id="rsNext" type="button">Следующее · ${window.__queue.length}</button>`:''}
      <button class="btn ${more?'btn-ghost':'btn-primary'} btn-full btn-lg" id="rsHome" type="button" style="${more?'margin-top:10px':''}">
        ${more?'Завершить':'К мозгу'}
      </button>
    </div>
    <div style="height:20px"></div>`;
  host.appendChild(scr);
  const nx=$('#rsNext',scr);if(nx) nx.onclick=()=>{SFX.tap();nextInQueue();};
  $('#rsHome',scr).onclick=()=>{SFX.tap();window.__queue=[];go('brain');};
}
function renderBrain(){
  const li=levelInfo(N.S.neurofit.xp);
  const cats=['memory','speed','math','logic'];
  const root=document.createElement('div');
  root.className='screen';
  root.innerHTML=`
    <div class="between" style="margin-bottom:18px">
      <div>
        <div class="tiny">УРОВЕНЬ ${li.level}</div>
        <div class="h1" style="margin-top:3px">Тренировка мозга</div>
      </div>
      <div class="chip moss" style="padding:8px 14px">🔥 <b>${N.S.neurofit.streak}</b></div>
    </div>
    <div class="hero" style="background:linear-gradient(155deg,#2A3A2F 0%,#1E2820 62%)">
      <div class="hero-inner">
        <div class="eyebrow">БЫСТРЫЙ СТАРТ</div>
        <div class="lead">Три упражнения подряд</div>
        <p class="why">Память, внимание, счёт — 5–7 минут.</p>
        <button class="btn btn-primary btn-lg" id="quickStart" type="button">▶ Начать</button>
      </div>
    </div>
    <div class="card">
      <div class="between" style="margin-bottom:10px">
        <div class="tiny">Уровень ${li.level} · ${li.into}/${li.need} XP</div>
        <div class="tiny">${N.S.neurofit.totalSessions} сессий</div>
      </div>
      <div class="bar"><i class="on" style="--p:${li.pct.toFixed(3)}"></i></div>
    </div>
    ${cats.map(cat=>{
      const list=EX_LIST.filter(e=>e.cat===cat);
      const cc=CATS[cat];
      if(!list.length) return '';
      return `
        <div class="cat-title"><span>${cc.icon}</span><span>${esc(cc.name)}</span></div>
        ${list.map(e=>{
          const lvl=getEffectiveLevel(e.id,e);
          const man=(N.S.neurofit.manualDiff[e.id]||0)>0;
          const rec=N.S.neurofit.records[e.id];
          const hr=rec&&(rec.survival||rec.endless);
          return `<button class="ex-item" data-ex="${e.id}" type="button">
            <div class="ex-ico">${e.icon}</div>
            <div class="ex-meta">
              <div class="ex-nm">${esc(e.name)} ${hr?'🏆':''}</div>
              <div class="ex-tg"><span>${esc(e.tag)}</span><span class="lvl">· ${LEVEL_NAMES[lvl-1]}${man?' 🎚':''}</span></div>
            </div>
            <span class="ex-arrow">›</span>
          </button>`;
        }).join('')}
      `;
    }).join('')}
    <div style="height:20px"></div>`;
  $('#quickStart',root).onclick=()=>{
    SFX.tap();buzz(10);N.ensureAudio();
    const seed=parseInt(todayKey().split('-').join(''),10);
    const plan=[];
    ['memory','speed','math'].forEach((c,i)=>{
      const list=EX_LIST.filter(e=>e.cat===c);
      if(list.length) plan.push(list[(seed+i*7)%list.length].id);
    });
    startQueue(plan);
  };
  root.addEventListener('click',e=>{
    const b=e.target.closest('[data-ex]');
    if(b){SFX.tap();buzz(8);N.ensureAudio();startQueue([b.dataset.ex]);}
  });
  return root;
}

window.App.registerScreen('brain', renderBrain);
window.renderBrain = renderBrain;
})();