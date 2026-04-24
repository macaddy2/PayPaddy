const SCREENS = [
  { k:'splash',     label:'Splash' },
  { k:'onboarding', label:'Onboarding' },
  { k:'home',       label:'Home' },
  { k:'create',     label:'Create Deal' },
  { k:'room',       label:'Deal Room' },
  { k:'trinity',    label:'Trinity' },
  { k:'dispute',    label:'Dispute' },
  { k:'ussd',       label:'USSD Offline' },
  { k:'agents',     label:'Agents' },
  { k:'merchant',   label:'Merchant' },
];

// TWEAK DEFAULTS — theme balance
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "v2"
}/*EDITMODE-END*/;

window.__ppTheme = TWEAK_DEFAULTS.theme;
try { localStorage.removeItem('pp-theme'); } catch(e){}

const tabsEl = document.getElementById('tabs');
const wrapEl = document.getElementById('wrap');

function AppContainer() {
  const [i, setI] = React.useState(() => parseInt(localStorage.getItem('pp-screen') || '0', 10));

  React.useEffect(()=>{
    localStorage.setItem('pp-screen', String(i));
    const h = (e)=>{ if(e.key==='ArrowRight')setI(x=>Math.min(SCREENS.length-1,x+1)); if(e.key==='ArrowLeft')setI(x=>Math.max(0,x-1)); };
    window.addEventListener('keydown',h); return ()=>window.removeEventListener('keydown',h);
  },[i]);

  React.useEffect(()=>{
    tabsEl.innerHTML = '';
    SCREENS.forEach((s,idx)=>{
      const b = document.createElement('button');
      b.className = 'tab' + (idx===i?' active':'');
      b.textContent = s.label;
      b.onclick = ()=> setI(idx);
      tabsEl.appendChild(b);
    });
  },[i]);

  const screen = SCREENS[i].k;

  return (
    <div className="screen active">
      {screen==='splash'     && <Splash onNext={()=>setI(1)}/>}
      {screen==='onboarding' && <Onboarding onContinue={()=>setI(2)}/>}
      {screen==='home'       && <Home onNewDeal={()=>setI(3)} onOpenDeal={()=>setI(4)}/>}
      {screen==='create'     && <CreateDeal onBack={()=>setI(2)} onPick={()=>setI(4)}/>}
      {screen==='room'       && <DealRoom onBack={()=>setI(2)} onConfirm={()=>setI(2)} onDispute={()=>setI(6)}/>}
      {screen==='trinity'    && <Trinity onBack={()=>setI(0)} onVerify={()=>setI(2)}/>}
      {screen==='dispute'    && <Dispute onBack={()=>setI(4)} onSubmit={()=>setI(4)}/>}
      {screen==='ussd'       && <USSD onBack={()=>setI(3)}/>}
      {screen==='agents'     && <Agents onBack={()=>setI(7)}/>}
      {screen==='merchant'   && <Merchant onBack={()=>setI(2)}/>}
    </div>
  );
}

ReactDOM.createRoot(wrapEl).render(<AppContainer/>);
