// App root — routing + layout glue

function AppRoot() {
  const [route, setRoute] = React.useState(() => localStorage.getItem('pp-web-route') || 'splash');
  const [unread] = React.useState(3);

  const go = React.useCallback((r) => {
    setRoute(r);
    localStorage.setItem('pp-web-route', r);
    document.querySelector('.main')?.scrollTo(0, 0);
  }, []);

  // Pre-auth takeover screens
  if (route === 'splash') return <Splash go={go}/>;
  if (route === 'onboarding') return <Onboarding go={go}/>;
  if (route === 'trinity') return <Trinity go={go}/>;

  const screen = (() => {
    switch(route) {
      case 'home':     return <Home go={go}/>;
      case 'deals':    return <Deals go={go}/>;
      case 'create':   return <CreateDeal go={go}/>;
      case 'room':     return <DealRoom go={go}/>;
      case 'dispute':  return <Dispute go={go}/>;
      case 'chat':     return <Chat go={go}/>;
      case 'agents':   return <Agents go={go}/>;
      case 'ussd':     return <USSD go={go}/>;
      case 'merchant': return <Merchant go={go}/>;
      case 'me':       return <Me go={go}/>;
      default:         return <Home go={go}/>;
    }
  })();

  return (
    <div className="app">
      <Sidebar route={route} go={go} unread={unread}/>
      <div className="main">
        <MobileTopbar onNotif={()=>{}}/>
        {screen}
      </div>
      <MobileNav route={route} go={go} unread={unread}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AppRoot/>);
